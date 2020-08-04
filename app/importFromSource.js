import fs from 'fs-extra';
import path from 'path';
import { trim } from 'lodash';
import * as mssql from 'mssql';
import { MSSQL_CONNECTION, BATCH_SIZE } from '../constants';
import { getKnex } from './knex';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { upsert } from './upsert';

const { knex } = getKnex();

async function getTables() {
  let tablesFile = await fs.readFile(path.join(__dirname, '..', 'tables.lst'), 'utf8');

  return tablesFile
    .split('\n')
    .map((tableName) => trim(tableName))
    .filter((tableName) => !!tableName);
}

export async function importFromSource() {
  let pool = await mssql.connect(MSSQL_CONNECTION);
  let tables = await getTables();

  for (let tableName of tables) {
    console.log(`Importing ${tableName} from JORE...`);

    let insertCallback = await createInsertCallback(tableName);
    await streamFromSource(pool, tableName, insertCallback);
  }
}

async function streamFromSource(pool, tableName, onChunk) {
  let request = new mssql.Request(pool);
  request.stream = true;
  request.query(`SELECT * FROM jore.${tableName}`);

  let data = [];

  request.on('row', async (row) => {
    data.push(row);

    if (data.length >= BATCH_SIZE) {
      request.pause();

      await onChunk(data);

      data = [];
      request.resume();
    }
  });

  request.on('done', async () => {
    await onChunk(data);
    console.log(`All rows of ${tableName} inserted.`);
  });
}

let createInsertCallback = async (tableName) => {
  let constraint = await getPrimaryConstraint(knex, tableName, 'jore');
  return (data) => upsert(tableName, data, constraint);
};
