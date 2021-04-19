import { getKnex } from '../db/postgres';
import { READ_SCHEMA_NAME, WRITE_SCHEMA_NAME } from '../../constants';
import fs from 'fs-extra';
import path from 'path';

const knex = getKnex();

let dropWriteSchema = () => knex.raw(`DROP SCHEMA IF EXISTS ${WRITE_SCHEMA_NAME} CASCADE`);

let createWriteSchema = async () => {
  let setup = await fs.readFile(
    path.join(__dirname, '../', 'sqlScripts', 'setup_write_schema.sql'),
    'utf8'
  );
  
  await knex.raw(setup)
  
  let ddl = await fs.readFile(
    path.join(__dirname, '../', 'sqlScripts', 'create_write_schema.sql'),
    'utf8'
  );

  return knex.raw(ddl);
};

let switchWriteSchemaToRead = () =>
  knex.raw(
    `
BEGIN;
DROP SCHEMA IF EXISTS ${READ_SCHEMA_NAME} CASCADE;
ALTER SCHEMA ${WRITE_SCHEMA_NAME} RENAME TO ${READ_SCHEMA_NAME};
END TRANSACTION;`
  );

export async function createImportSchema() {
  await dropWriteSchema();
  await createWriteSchema();
  return WRITE_SCHEMA_NAME;
}

export async function activateFreshSchema() {
  await switchWriteSchemaToRead();
  return READ_SCHEMA_NAME;
}
