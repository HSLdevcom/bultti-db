import fs from 'fs-extra';
import path from 'path';
import { trim, mapValues, get, floor } from 'lodash';
import * as mssql from 'mssql';
import { MSSQL_CONNECTION, BATCH_SIZE, NS_PER_SEC } from '../constants';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { upsert } from './upsert';
import { getKnex } from './knex';
import PQueue from 'p-queue';
import { parseISO, isAfter, isValid } from 'date-fns';
import { transformRow } from './dataTransform';

const { knex } = getKnex();

function echoTime(message = 'Database synced', time) {
  if (!time) {
    console.log(`${message}. (time unavailable)`);
  } else {
    let [execS, execNs] = process.hrtime(time);
    let ms = (execS * NS_PER_SEC + execNs) / 1000000;
    console.log(`${message} in ${floor(ms / 1000, 3)} s`);
  }
}

async function getTables() {
  let tablesFile = await fs.readFile(path.join(__dirname, '..', 'tables.lst'), 'utf8');

  return tablesFile
    .split('\n')
    .map((tableName) => trim(tableName))
    .filter((tableName) => !!tableName && !tableName.startsWith('#'));
}

// Include only rows that are active after 2019
let cutoffDate = parseISO('2019-01-01');

// Cols that should be used to check the cutoff date against for each row.
// JORE tables have multiple names for the in effect date cols, but all
// date cols should not be considered. Thus we need to specifically
// define which cols to check.
let dateCols = [
  'akalkpvm',
  'akpaattpvm',
  'kaavoimast',
  'kaaviimvoi',
  'lavoimast',
  'laviimvoi',
  'kohalkpvm',
  'kohpaattpvm',
  'suuvoimast',
  'suuviimvoi',
  'lnkviimpvm',
  'relviimpvm',
  'suuvoimviimpvm',
];

// Tables that should not have rows checked against the cutoff date.
let ignoreCutoffForTables = [
  'jr_ajoneuvo',
  'ak_kalusto',
  'jr_eritpvkalent',
  'jr_kinf_kalusto',
  'jr_liikennoitsija',
  'jr_konserni',
];

// Filter function to only include rows that are active after the cutoff date.
// Rows where no date columns are found are included by default.
function dateCutoffFilter(row) {
  let dateValues = [];

  for (let col of dateCols) {
    let dateVal = row[col];

    if (dateVal && dateVal instanceof Date && isValid(dateVal)) {
      dateValues.push(dateVal);
    }
  }

  if (dateValues.length === 0) {
    return true;
  }

  return dateValues.some((dateVal) => {
    return isAfter(dateVal, cutoffDate);
  });
}

async function createInsertForTable(tableName) {
  let constraint = await getPrimaryConstraint(knex, tableName, 'jore');
  let columnSchema = await knex
    .withSchema('jore')
    .table(tableName)
    .columnInfo();

  return (data) => {
    let processedRows = data
      .map((row) => transformRow(row, tableName, columnSchema))
      .filter((row) => {
        if (ignoreCutoffForTables.includes(tableName)) {
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
        console.log('Chunk error');
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
  let syncTime = process.hrtime();

  await mssql.connect({
    ...MSSQL_CONNECTION,
    pool: {
      min: 0,
      max: 50,
    },
  });

  let tables = await getTables();

  let syncPromises = [];

  try {
    for (let tableName of tables) {
      console.log(`Importing ${tableName}`);
      let tableTime = process.hrtime();
      
      let syncPromise = syncTable(tableName).then(() =>
        echoTime(`${tableName} imported`, tableTime)
      );
      
      syncPromises.push(syncPromise)
    }

    await Promise.all(syncPromises)
  } catch (err) {
    console.log('Top-level error');
    console.log(err);
  }

  echoTime('Sync complete', syncTime);
}
