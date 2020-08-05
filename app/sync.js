import fs from 'fs-extra';
import path from 'path';
import { trim, mapValues, toString } from 'lodash';
import * as mssql from 'mssql';
import { MSSQL_CONNECTION, BATCH_SIZE } from '../constants';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { upsert } from './upsert';
import { getKnex } from './knex';
import PQueue from 'p-queue';
import { formatISO } from 'date-fns';

const { knex } = getKnex();

async function getTables() {
  let tablesFile = await fs.readFile(path.join(__dirname, '..', 'tables.lst'), 'utf8');

  return tablesFile
    .split('\n')
    .map((tableName) => trim(tableName))
    .filter((tableName) => !!tableName);
}

function sanitizeRow(row) {
  return mapValues(row, (key, val) => {
    if (typeof val === 'string') {
      let trimmedVal = trim(val);

      if (!trimmedVal) {
        return null;
      }

      return trimmedVal;
    }

    if (val instanceof Date) {
      return formatISO(val);
    }

    return val;
  });
}

async function createInsertForTable(tableName) {
  let constraint = await getPrimaryConstraint(knex, tableName, 'jore');
  let columnSchema = await knex
    .withSchema('jore')
    .table(tableName)
    .columnInfo();

  console.log(columnSchema);

  return (data) => {
    let processedRows = data.map((row) => sanitizeRow(row));
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
        console.log(err);
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
  await mssql.connect({
    ...MSSQL_CONNECTION,
    stream: true,
  });

  let tables = await getTables();

  let syncQueue = new PQueue({
    concurrency: 5,
    autoStart: true,
  });

  for (let tableName of tables) {
    console.log(`Importing ${tableName} from source.`);

    syncQueue
      .add(() => syncTable(tableName))
      .then(() => console.log(`${tableName} imported.`));
  }

  try {
    await syncQueue.onEmpty();
  } catch (err) {
    console.log(err);
  }

  console.log('Sync complete.');
}
