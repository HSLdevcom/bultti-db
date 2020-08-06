import * as mssql from 'mssql';
import { MSSQL_CONNECTION, BATCH_SIZE } from '../constants';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { upsert } from './upsert';
import { getKnex } from './knex';
import PQueue from 'p-queue';
import { transformRow } from './dataTransform';
import { getTables } from './utils/fetchTables';
import { shouldUseFilter, dateCutoffFilter } from './utils/dateCutoffFilter';
import { logTime } from './utils/logTime';

const { knex } = getKnex();

async function createInsertForTable(tableName) {
  let constraint;
  let columnSchema;

  try {
    constraint = await getPrimaryConstraint(knex, tableName, 'jore');
    columnSchema = await knex
      .withSchema('jore')
      .table(tableName)
      .columnInfo();
  } catch (err) {
    console.log(err);
  }

  return (data) => {
    let processedRows = data
      .map((row) => transformRow(row, tableName, columnSchema))
      .filter((row) => {
        if (!shouldUseFilter(tableName)) {
          return true;
        }

        return dateCutoffFilter(row);
      });

    return upsert(tableName, processedRows, constraint);
  };
}

function syncTable(tableName) {
  return new Promise(async (resolve, reject) => {
    let request = new mssql.Request();
    request.stream = true;
    request.query(`SELECT * FROM dbo.${tableName}`);

    let rowsProcessor = await createInsertForTable(tableName);
    let rows = [];

    async function processRows() {
      try {
        await rowsProcessor(rows);
      } catch (err) {
        console.log(`[Error]    Insert error on table ${tableName}`, err);
      }

      rows = [];
    }

    request.on('row', async (row) => {
      rows.push(row);

      if (rows.length >= BATCH_SIZE) {
        request.pause();
        await processRows();
        request.resume();
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
  let syncTime = process.hrtime();

  await mssql.connect({
    ...MSSQL_CONNECTION,
    options: {
      enableArithAbort: false,
    },
  });

  let tables = await getTables();

  let syncQueue = new PQueue({
    concurrency: 5,
    autoStart: true,
  });

  for (let tableName of tables) {
    syncQueue
      .add(() => {
        console.log(`[Status]   Importing ${tableName}`);
        let tableTime = process.hrtime();
        return syncTable(tableName).then(() => tableTime);
      })
      .then((tableTime) => {
        logTime(`[Status]   ${tableName} imported`, tableTime);
        console.log(`[Queue]    Size: ${syncQueue.size}   Pending: ${syncQueue.pending}`);
      })
      .catch((err) => {
        console.log(`[Error]    Sync error on table ${tableName}`, err);
      });
  }

  await syncQueue.onIdle();
  logTime('[Status]   Sync complete', syncTime);
}
