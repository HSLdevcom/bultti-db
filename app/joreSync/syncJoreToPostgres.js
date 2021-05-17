import { upsert } from '../db/upsert';
import { getKnex } from '../db/postgres';
import { transformRow } from './dataTransform';
import { getTables } from './getTablesFromFile';
import { logTime } from '../utils/logTime';
import { getPrimaryConstraint } from '../utils/getPrimaryConstraint';
import { createNotNullFilter } from '../utils/notNullFilter';
import { get } from 'lodash';
import { createImportSchema, activateFreshSchema } from './schemaManager';
import { fetchTableStream } from '../db/mssql';
import { processStream } from '../utils/processStream';
import { startSync, endSync } from '../state';
import { reportInfo, reportError } from './monitor';
import { logSyncStart, logSyncEnd, logSyncError } from '../utils/syncStatus';

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

export async function syncTable(tableName, schemaName) {
  let tableTime = process.hrtime();
  console.log(`[Status]   Importing ${tableName}`);

  let { stream, closePool } = await fetchTableStream(tableName);
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
      .then((tables) => logSyncStart(tables.join(', '))) // 1a. log sync start with table list
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
      .then(({ successful, tables }) => {
        // 4. Log current status. Then, if successful, continue with the derived data sync.
        if (successful) {
          reportInfo('[Status]   JORE sync successful!');
          // Sync derived data that requires the base JORE sync to be completed.
          return Promise.resolve({ successful: true, tables });
        }

        return Promise.resolve({ successful: false, tables });
      })
      .then(({ successful, tables }) => {
        // 5. Log the success or failure of the sync.
        if (!successful) {
          let seconds = logTime('[Error]   Sync failed', syncTime);

          return logSyncError('Sync failed.').then(() =>
            reportError(`[Error]   JORE sync failed in ${seconds} s`)
          );
        }

        let seconds = logTime('[Status]   Sync complete', syncTime);
        let statusMessage = `JORE synced in ${seconds} s`;
        reportInfo(`[Status]   ${statusMessage}`);

        return logSyncEnd(`${statusMessage}. Tables: ${tables.join(', ')}`).then(() =>
          activateFreshSchema()
        );
      })
      .finally(() => endSync('main'))
  );
}
