import { getKnex } from './knex';
import { logTime } from './utils/logTime';
import { startSync, endSync } from './state';
import { departuresInsertQuery } from './queryFragments/departuresInsertQuery';

const knex = getKnex();

export async function createDepartures(schemaName, mainSync = false) {
  if (!mainSync && !startSync('departures')) {
    console.log('[Warning]  Syncing already in progress.');
    return;
  }

  let syncTime = process.hrtime();
  console.log(`[Status]   Creating departures table.`);

  try {
    await knex.raw(departuresInsertQuery, { schema: schemaName });
  } catch (err) {
    console.log(`[Error]    Insert error on table departure`, err);
  }

  logTime('[Status]   Departures table created', syncTime);
  endSync('departures');
}
