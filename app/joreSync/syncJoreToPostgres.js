import { upsert } from '../db/upsert';
import { getKnex } from '../db/postgres';
import { transformRow } from './dataTransform';
import { getTables } from './getTablesFromFile';
import { logTime } from '../utils/logTime';
import { getPrimaryConstraint } from '../utils/getPrimaryConstraint';
import { createNotNullFilter } from '../utils/notNullFilter';
import { get } from 'lodash';
import { createImportSchema, activateFreshSchema } from './schemaManager';
import { getPool } from '../db/mssql';
import { processStream } from '../utils/processStream';
import { startSync, endSync } from '../state';
import { reportInfo, reportError } from './monitor';
import { createTableQuery } from '../queryFragments/joreTableQuery';

const knex = getKnex();

async function createInsertForTable(tableName, schemaName) {
  let columnSchema;
  let constraint;

  try {
    constraint = await getPrimaryConstraint(knex, schemaName, tableName);

    columnSchema = await knex
      .withSchema(schemaName)
      .table(tableName)
      .columnInfo();
  } catch (err) {
    console.log(err);
  }

  let constraintKeys = get(constraint, 'keys', []);
  let notNullFilter = createNotNullFilter(constraint, columnSchema);

  return (data = []) => {
    let processedRows = data
      .filter(notNullFilter)
      .map((row) => transformRow(row, tableName, columnSchema));

    return upsert(schemaName, tableName, processedRows, constraintKeys);
  };
}

async function tableSourceRequest(tableName) {
  /*
   * There is a problem with the Mssql library that results in the connection
   * just stalling after a few tables in the table loop. No amount of adjusting
   * the pool size or anything else solved it, except creating a new pool for
   * each table. This is less than optimal, but it doesn't add THAT much overhead
   * for our use and it's the only thing that has worked. If you find yourself up
   * to the task of fixing this, know that I've spent a lot of time here already.
   */
  let pool = await getPool();

  let request = pool.request();
  request.stream = true;

  let query = createTableQuery(tableName);
  request.query(query);

  return { stream: request, closePool: pool.close.bind(pool) };
}

export async function syncTable(tableName, schemaName) {
  let tableTime = process.hrtime();
  console.log(`[Status]   Importing ${tableName}`);

  let { stream, closePool } = await tableSourceRequest(tableName);
  let processRow = await createInsertForTable(tableName, schemaName);

  return processStream(stream, processRow)
    .then(() => {
      logTime(`[Status]   ${tableName} imported`, tableTime);
    })
    .finally(() => {
      closePool();
    });
}

export function syncJoreTables(tables, schemaName, syncTime) {
  let successful = true;
  let pendingTables = [...tables];

  let statusInterval = setInterval(() => {
    logTime(`[Pending]  ${pendingTables.join(', ')}`, syncTime);
  }, 10000);

  let syncPromise = Promise.resolve();

  for (let tableName of tables) {
    syncPromise = syncPromise
      .then(() => syncTable(tableName, schemaName))
      .then(() => (pendingTables = pendingTables.filter((t) => t !== tableName)))
      .catch((err) => {
        let message = `[Error]    Sync error on table ${tableName}`;
        console.log(message, err);
        successful = false;
        return reportError(message);
      });
  }

  return syncPromise.finally(() => {
    clearInterval(statusInterval);
    return successful;
  });
}

export function syncJoreToPostgres() {
  if (!startSync('main')) {
    console.log('[Warning]  Sync already in progress.');
    return;
  }

  let syncTime = process.hrtime();
  reportInfo('[Status]   Syncing JORE database.');

  return (
    getTables() // 1. Get the tables to sync
      // 2. Create the import schema, returning both the schemaName and the tables from this promise.
      .then((tables) => createImportSchema().then((schemaName) => ({ tables, schemaName })))
      .then(({ tables, schemaName }) =>
        // 3. Sync the JORE tables, returning schemaName, tables and successful status to the next `then`
        syncJoreTables(tables, schemaName, syncTime).then((successful) => ({
          tables,
          schemaName,
          successful,
        }))
      )
      .then(({ successful }) => {
        // 4. Log current status. Then, if successful, continue with the derived data sync.
        if (successful) {
          reportInfo('[Status]   JORE sync successful!');
          // Sync derived data that requires the base JORE sync to be completed.
          return Promise.resolve(true);
        }

        return Promise.resolve(false);
      })
      .then((successful) => {
        // 5. Log the success or failure of the sync.
        if (!successful) {
          let seconds = logTime('[Error]   Sync failed', syncTime);
          return reportError(`[Error]   JORE sync failed in ${seconds} s`);
        }

        let seconds = logTime('[Status]   Sync complete', syncTime);
        reportInfo(`[Status]   JORE synced in ${seconds} s`);
        return activateFreshSchema();
      })
      .finally(() => endSync('main'))
  );
}
