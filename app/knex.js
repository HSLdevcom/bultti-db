import Knex from 'knex';
import { JORE_PG_CONNECTION, DEBUG } from '../constants';

let knex = null;

export function getKnex() {
  if (knex) {
    return knex;
  }

  knex = Knex({
    dialect: 'postgres',
    client: 'pg',
    connection: JORE_PG_CONNECTION,
    pool: {
      log: (message, logLevel) =>
        DEBUG ? console.log(`Pool ${logLevel}: ${message}`) : undefined,
      min: 0,
      max: 50,
    },
  });

  return knex
}
