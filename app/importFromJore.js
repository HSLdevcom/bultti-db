import fs from 'fs-extra';
import path from 'path';
import { trim } from 'lodash';

async function getTables() {
  let tablesFile = await fs.readFile(path.join(__dirname, '..', 'tables.lst'), 'utf8');
  
  return tablesFile
    .split('\n')
    .map((tableName) => trim(tableName))
    .filter((tableName) => !!tableName);
}

export async function importFromJore() {
  let tables = await getTables();
  console.log(tables);
}
