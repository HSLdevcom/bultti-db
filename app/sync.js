import { upsert } from './upsert';
import { getKnex } from './postgres';
import { transformRow } from './dataTransform';
import { getTables } from './utils/fetchTables';
import { logTime } from './utils/logTime';
import PQueue from 'p-queue';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { createNotNullFilter } from './utils/notNullFilter';
import { get } from 'lodash';
import { createRouteGeometry } from './createRouteGeometry';
import { createImportSchema, activateFreshSchema } from './utils/schemaManager';
import { getPool } from './mssql';
import { syncStream } from './utils/syncStream';
import { BATCH_SIZE } from '../constants';
import { startSync, endSync } from './state';
import { reportInfo, reportError } from './monitor';
import { format, subYears } from 'date-fns';
import { createDepartures } from './createDepartures';

const knex = getKnex();

// Define WHERE clauses for some large tables that would otherwise take forever.
// The minDate will be appended after the operator.
let minDateLimit = {
  jr_valipisteaika: `lavoimast >=`,
};

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

  let minDate = format(subYears(new Date(), 1), 'yyyy-MM-dd');
  let tableWhere = minDateLimit[tableName] || '';

  if (tableWhere) {
    tableWhere = `WHERE ${tableWhere} '${minDate}'`;
  }

  request.query(`SELECT * FROM dbo.${tableName} ${tableWhere}`);
  return request;
}

// Set concurrency per table. Tables not listed will get the default concurrency.
let tableConcurrency = {
  jr_ajoneuvo: 1,
  ak_kaavion_suoritteet: 15,
  ak_kaavion_lahto: 15,
};

export async function syncTable(tableName, schemaName) {
  let tableTime = process.hrtime();
  console.log(`[Status]   Importing ${tableName}`);

  let request = await tableSourceRequest(tableName);
  let rowsProcessor = await createInsertForTable(tableName, schemaName);

  let concurrency = tableConcurrency[tableName] || 10;
  await syncStream(request, rowsProcessor, concurrency, BATCH_SIZE, 'row', 'done');

  logTime(`[Status]   ${tableName} imported`, tableTime);
}

export async function syncJoreTables(tables, schemaName) {
  let successful = true;
  let pendingTables = [...tables];

  let syncQueue = new PQueue({
    concurrency: 10,
    autoStart: true,
    timeout: 7000 * 1000,
  });

  syncQueue.on('next', () => {
    console.log(`[Queue]    Size: ${syncQueue.size}   Pending: ${syncQueue.pending}`);
  });

  for (let tableName of tables) {
    syncQueue
      .add(async () => syncTable(tableName, schemaName))
      .then(() => {
        pendingTables = pendingTables.filter((t) => t !== tableName);
        console.log(`[Pending]  ${pendingTables.join(', ')}`);
      })
      .catch((err) => {
        let message = `[Error]    Sync error on table ${tableName}`;
        console.log(message, err);
        successful = false;
        return reportError(message);
      });
  }

  await syncQueue.onIdle();
  return successful;
}

export async function syncJore(includeDepartures = true) {
  if (!startSync('main')) {
    console.log('[Warning]  Sync already in progress.');
    return;
  }

  let syncTime = process.hrtime();
  await reportInfo('[Status]   Syncing JORE database.');

  let tables = await getTables();
  let schemaName = await createImportSchema();
  let successful = await syncJoreTables(tables, schemaName);

  if (successful) {
    if (includeDepartures) {
      await reportInfo('[Status]   Syncing JORE departures and route geometry tables.');
    } else {
      await reportInfo('[Status]   Syncing JORE route geometry table.');
    }

    await Promise.all([
      includeDepartures ? createDepartures(schemaName, true) : Promise.resolve(),
      createRouteGeometry(schemaName, true),
    ]).catch(() => {
      successful = false;
    });
  }

  if (!successful) {
    let seconds = logTime('[Error]   Sync failed', syncTime);
    await reportError(`[Error]   JORE sync failed in ${seconds} s`);
  } else {
    let seconds = logTime('[Status]   Sync complete', syncTime);
    await reportInfo(`[Status]   JORE synced in ${seconds} s`);
    await activateFreshSchema();
  }

  endSync('main');
}
