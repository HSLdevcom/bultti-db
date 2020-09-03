import Knex from 'knex';
import KnexPostgis from 'knex-postgis';
import { JORE_PG_CONNECTION, DEBUG, WRITE_SCHEMA_NAME, READ_SCHEMA_NAME } from '../constants';

let st = null;
let knex = null;

export function getKnex() {
  if (knex) {
    return knex;
  }

  knex = Knex({
    dialect: 'postgres',
    client: 'pg',
    connection: JORE_PG_CONNECTION,
    searchPath: [WRITE_SCHEMA_NAME, READ_SCHEMA_NAME, 'public'],
    migrations: {
      schemaName: 'public',
    },
    pool: {
      log: (message, logLevel) =>
        DEBUG ? console.log(`Pool ${logLevel}: ${message}`) : undefined,
      min: 2,
      max: 100,
    },
  });

  st = KnexPostgis(knex);

  return knex;
}

export function getSt() {
  if (st) {
    return st;
  }

  if (knex) {
    st = KnexPostgis(knex);
  }

  return st;
}
