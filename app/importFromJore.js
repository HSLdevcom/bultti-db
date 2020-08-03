import fs from 'fs-extra';
import path from 'path';
import { trim } from 'lodash';
import sqlcmd from 'ms-sqlcmd';
import { MSSQL_CONNECTION_STRING } from '../constants';

async function getTables() {
  let tablesFile = await fs.readFile(path.join(__dirname, '..', 'tables.lst'), 'utf8');

  return tablesFile
    .split('\n')
    .map((tableName) => trim(tableName))
    .filter((tableName) => !!tableName);
}

async function fetchTableData(tableName) {
  let scripts = [path.join(__dirname, 'sqlScripts', 'export_table.sql')];
  let data = '';

  try {
    data = await sqlcmd(
      MSSQL_CONNECTION_STRING,
      scripts,
      { TableName: tableName },
      {
        echo: true,
      }
    );
  } catch (err) {
    console.log(err);
  }

  return data;
}

export async function importFromJore() {
  let tables = await getTables();
  let tableData = [];

  for (let tableName of tables) {
    let dataResult = await fetchTableData(tableName);
    tableData.push(dataResult);
  }

  console.log(tableData);
}
