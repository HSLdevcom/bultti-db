import * as mssql from 'mssql';
import { MSSQL_CONNECTION, BATCH_SIZE } from '../constants';
import { upsert } from './upsert';
import { getKnex } from './knex';
import { transformRow } from './dataTransform';
import { getTables } from './utils/fetchTables';
import { dateCutoffFilter } from './utils/dateCutoffFilter';
import { logTime } from './utils/logTime';
import PQueue from 'p-queue';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { primaryKeyNotNullFilter } from './utils/primaryKeyNotNullFilter';
import { get } from 'lodash';
import { createRouteGeometry } from './createRouteGeometry';
import { createImportSchema, activateFreshSchema } from './utils/schemaManager';

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

  return (data) => {
    let processedRows = data
      .map((row) => transformRow(row, tableName, columnSchema))
      // transformRow may make some fields proper dates, so filter by date after it.
      .filter(
        (row) => primaryKeyNotNullFilter(row, constraint) && dateCutoffFilter(row, tableName)
      );

    return upsert(schemaName, tableName, processedRows, constraintKeys);
  };
}

function syncTable(schemaName, tableName, pool) {
  return new Promise(async (resolve, reject) => {
    let request = pool.request();
    request.stream = true;
    request.query(`SELECT * FROM dbo.${tableName}`);

    let rowsProcessor = await createInsertForTable(schemaName, tableName);

    let rows = [];

    async function processRows() {
      try {
        await rowsProcessor(rows);
      } catch (err) {
        console.log(`[Error]    Insert error on table ${tableName}`, err);
      }

      rows = [];
      request.resume();
    }

    request.on('row', async (row) => {
      rows.push(row);

      if (rows.length >= BATCH_SIZE) {
        request.pause();
        await processRows();
      }
    });

    request.on('done', async () => {
      await processRows();
      resolve();
    });

    request.on('error', reject);
  });
}

export async function syncSourceToDestination() {
  if (syncing) {
    console.log('[Warning]  Syncing already in progress.');
    return;
  }

  startSync();

  let syncTime = process.hrtime();

  let mssqlConfig = {
    ...MSSQL_CONNECTION,
    options: {
      enableArithAbort: false,
    },
    pool: {
      min: 0,
      max: 2,
    },
  };

  try {
    await mssql.connect(mssqlConfig);
  } catch (err) {
    console.log('[Error]    MSSQL connection failed.', err);
    return;
  }

  let tables = await getTables();

  let syncQueue = new PQueue({
    concurrency: 10,
    autoStart: true,
  });

  let schemaName = await createImportSchema();

  let pendingTables = [...tables];

  /*
   * There is a problem with the Mssql library that results in the connection
   * just stalling after a few tables in the loop below. No amount of adjusting
   * the pool size or anything else solved it, except creating a new pool for
   * each table. This is less than optimal, but it doesn't add THAT much overhead
   * for our use and it's the only thing that has worked. If you find yourself up
   * to the task of fixing this, know that I've spent a lot of time here already.
   */

  for (let tableName of tables) {
    syncQueue
      .add(async () => {
        console.log(`[Status]   Importing ${tableName}`);
        let tableTime = process.hrtime();

        let pool = new mssql.ConnectionPool(mssqlConfig);

        pool.on('error', (err) => {
          console.log('[Error]    Pool error', err);
        });

        await pool.connect();
        await syncTable(schemaName, tableName, pool);

        let pendingIdx = pendingTables.indexOf(tableName);

        if (pendingIdx !== -1) {
          pendingTables.splice(pendingIdx, 1);
        }

        logTime(`[Status]   ${tableName} imported`, tableTime);
        console.log(`[Queue]    Size: ${syncQueue.size}   Pending: ${syncQueue.pending}`);
        console.log(`[Pending]  ${pendingTables.join(', ')}`);
      })
      .catch((err) => {
        console.log(`[Error]    Sync error on table ${tableName}`, err);
      });
  }

  await syncQueue.onIdle();

  logTime('[Status]   Creating route_geometry table', syncTime);
  await createRouteGeometry(schemaName);

  await activateFreshSchema();

  logTime('[Status]   Sync complete', syncTime);
  endSync();
}
