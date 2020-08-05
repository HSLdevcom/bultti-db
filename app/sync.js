import fs from 'fs-extra';
import path from 'path';
import { trim } from 'lodash';
import * as mssql from 'mssql';
import { MSSQL_CONNECTION, BATCH_SIZE } from '../constants';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { upsert } from './upsert';
import { getKnex } from './knex';
import PQueue from 'p-queue';

const { knex } = getKnex();

async function getTables() {
  let tablesFile = await fs.readFile(path.join(__dirname, '..', 'tables.lst'), 'utf8');

  return tablesFile
    .split('\n')
    .map((tableName) => trim(tableName))
    .filter((tableName) => !!tableName);
}

function includeRow(row) {
  return true;
}

function sanitizeRow(row) {
  return row;
}

async function createInsertForTable(tableName) {
  let constraint = await getPrimaryConstraint(knex, tableName, 'jore');

  return (data) => {
    let processedRows = [];

    for (let row of data) {
      if (includeRow(row)) {
        processedRows.push(sanitizeRow(row));
      }
    }

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
      await rowsProcessor(rows);
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
  await mssql.connect({
    ...MSSQL_CONNECTION,
    pool: {
      max: 50,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  });

  let tables = await getTables();

  let syncQueue = new PQueue({
    concurrency: 3,
    autoStart: true,
  });

  for (let tableName of tables) {
    console.log(`Importing ${tableName} from source.`);
    await syncQueue.add(() => syncTable(tableName));
  }

  try {
    await syncQueue.onEmpty();
  } catch (err) {
    console.log(err);
  }

  console.log('Sync complete.');
  await mssql.close();
}
