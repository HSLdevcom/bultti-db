import fs from 'fs-extra';
import path from "path";
import { trim } from 'lodash';

export async function getTables() {
  let tablesFile = await fs.readFile(path.join(__dirname, '../..', 'tables.lst'), 'utf8');
  
  return tablesFile
    .split('\n')
    .map((tableName) => trim(tableName))
    .filter((tableName) => !!tableName && !tableName.startsWith('#'));
}
