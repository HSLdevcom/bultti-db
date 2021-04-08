import Knex from 'knex';
import KnexPostgis from 'knex-postgis';
import { JORE_PG_CONNECTION, DEBUG, WRITE_SCHEMA_NAME, READ_SCHEMA_NAME } from '../constants';
import prexit from 'prexit';

let st = null;
let postgres = null;

export function getKnex() {
  if (postgres) {
    return postgres;
  }

  postgres = Knex({
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
      min: 1,
      max: 200,
      acquireTimeoutMillis: 1000000,
      idleTimeoutMillis: 1000000,
    },
  });

  st = KnexPostgis(postgres);

  return postgres;
}

prexit(async () => {
  if (postgres) {
    await postgres.destroy();
  }
});
