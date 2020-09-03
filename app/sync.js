import { upsert } from './upsert';
import { getKnex } from './knex';
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
import { createDepartures } from './createDepartures';
import { syncStream } from './utils/syncStream';
import { BATCH_SIZE } from '../constants';

const knex = getKnex();

let syncing = false;

let startSync = () => {
  syncing = true;
};

let endSync = () => {
  syncing = false;
};

async function createInsertForTable(schemaName, tableName) {
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
  request.query(`SELECT * FROM dbo.${tableName}`);

  return request;
}

async function syncTable(schemaName, tableName) {
  let tableTime = process.hrtime();
  console.log(`[Status]   Importing ${tableName}`);

  let request = await tableSourceRequest(tableName);
  let rowsProcessor = await createInsertForTable(schemaName, tableName);

  try {
    await syncStream(request, rowsProcessor, 10, BATCH_SIZE);
  } catch (err) {
    console.log(`[Error]    Insert error on table ${tableName}`, err);
  }

  logTime(`[Status]   ${tableName} imported`, tableTime);
}

export async function syncSourceToDestination() {
  if (syncing) {
    console.log('[Warning]  Syncing already in progress.');
    return;
  }

  startSync();
  let syncTime = process.hrtime();

  let tables = await getTables();
  let pendingTables = [...tables];

  let syncQueue = new PQueue({
    concurrency: 5,
    autoStart: true,
  });

  let schemaName = await createImportSchema();

  for (let tableName of tables) {
    syncQueue
      .add(async () => {
        console.log(`[Queue]    Size: ${syncQueue.size}   Pending: ${syncQueue.pending}`);

        await syncTable(schemaName, tableName);

        let pendingIdx = pendingTables.indexOf(tableName);

        if (pendingIdx !== -1) {
          pendingTables.splice(pendingIdx, 1);
        }

        console.log(`[Pending]  ${pendingTables.join(', ')}`);
      })
      .catch((err) => {
        console.log(`[Error]    Sync error on table ${tableName}`, err);
      });
  }

  await Promise.all([syncQueue.onIdle(), createDepartures(schemaName)]);
  await createRouteGeometry(schemaName);

  await activateFreshSchema();

  logTime('[Status]   Sync complete', syncTime);
  endSync();
}
