import Knex from 'knex';
import { DEBUG, JORE_PG_CONNECTION, MAX_DB_CONNECTIONS } from '../../constants';
import prexit from 'prexit';

let postgres = null;

export function getKnex() {
  if (postgres) {
    return postgres;
  }

  postgres = Knex({
    dialect: 'postgres',
    client: 'pg',
    connection: JORE_PG_CONNECTION,
    migrations: {
      schemaName: 'public',
    },
    pool: {
      log: (message, logLevel) =>
        DEBUG ? console.log(`Pool ${logLevel}: ${message}`) : undefined,
      min: 0,
      max: parseInt(MAX_DB_CONNECTIONS, 10),
      acquireTimeoutMillis: 1000000,
      idleTimeoutMillis: 1000000,
    },
  });

  return postgres;
}

prexit(async () => {
  if (postgres) {
    await postgres.destroy();
  }
});
