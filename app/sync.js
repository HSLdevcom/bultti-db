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

function createInputRow(row, columnSchema) {
  return mapValues(row, (val, key) => {
    let columnType = get(columnSchema, `${key}.type`);

    if (columnType === 'boolean' && typeof val !== 'boolean') {
      let baseVal = val;

      if (typeof val === 'string') {
        baseVal = trim(val);
      } else if (typeof val === 'number') {
        baseVal = baseVal > 0;
      }

      return !!baseVal;
    }

    if (columnType.includes('char')) {
      let trimmedVal = trim(val);

      if (!trimmedVal) {
        return null;
      }

      return trimmedVal;
    }

    if (columnType === 'numeric' && typeof val === 'string') {
      let parsed = val.includes('.') ? parseFloat(val) : parseInt(val, 10);

      if (isNaN(parsed)) {
        return null;
      }

      return parsed;
    }

    return val;
  });
}

// Inlude only rows that are active after 2019
let cutoffDate = parseISO('2019-01-01');
let ignoreDateCols = [
  'muutospvm',
  'perustpvm',
  'tallpvm',
  'liialkpvm',
  'liipaattpvm',
  'kohtarjouspvm',
  'kohindeksipvm',
  'kohviimpvm',
  'sloppupvm',
  'liiviimpvm',
];

let ignoreCutoffForTables = [
  'jr_ajoneuvo',
  'ak_kalusto',
  'jr_eritpvkalent',
  'jr_kinf_kalusto',
];

// Filter function to only include rows that are active after the cutoff date.
function dateCutoffFilter(row, columnSchema) {
  let dateColumns = Object.entries(columnSchema).reduce((dateCols, [colName, schema]) => {
    if (
      !ignoreDateCols.includes(colName) &&
      ['timestamp', 'date'].some((match) => schema.type.startsWith(match))
    ) {
      dateCols.push(colName);
    }

    return dateCols;
  }, []);

  if (dateColumns.length === 0) {
    return true;
  }

  let dateValues = [];

  for (let col of dateColumns) {
    let dateVal = row[col];

    if (dateVal) {
      let dateObj = dateVal instanceof Date ? dateVal : parseISO(dateVal);

      if (isValid(dateObj)) {
        dateValues.push(dateObj);
      }
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
      .filter((row) => {
        if (ignoreCutoffForTables.includes(tableName)) {
          return true;
        }

        return dateCutoffFilter(row, columnSchema);
      })
      .map((row) => createInputRow(row, columnSchema));

    return upsert(tableName, processedRows, constraint);
  };
}

function syncTable(tableName) {
  return new Promise(async (resolve, reject) => {
    let tableTime = process.hrtime();

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
      resolve(tableTime);
    });

    request.on('error', reject);
  });
}

export async function syncSourceToDestination() {
  let syncTime = process.hrtime();

  await mssql.connect(MSSQL_CONNECTION);
  let tables = await getTables();

  let syncQueue = new PQueue({
    concurrency: 5,
    autoStart: true,
  });

  try {
    for (let tableName of tables) {
      console.log(`Importing ${tableName} from source.`);

      syncQueue
        .add(() => syncTable(tableName))
        .then((tableTime) => echoTime(`${tableName} imported`, tableTime));
    }

    syncQueue.start();

    await syncQueue.onIdle();
  } catch (err) {
    console.log(err);
  }

  echoTime('Sync complete', syncTime);
}
