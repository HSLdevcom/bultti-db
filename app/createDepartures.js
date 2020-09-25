import { getKnex } from './postgres';
import { logTime } from './utils/logTime';
import { startSync, endSync } from './state';
import { departuresInsertQuery } from './queryFragments/departuresInsertQuery';

const knex = getKnex();

async function enableIndices(schemaName) {
  await knex.raw(
    `create index concurrently if not exists departure_stop_id_index on ${schemaName}.departure (stop_id)`
  );
  await knex.raw(
    `create index concurrently if not exists departure_route_id_index on ${schemaName}.departure (route_id)`
  );
  await knex.raw(
    `create index concurrently if not exists departure_day_type_index on ${schemaName}.departure (day_type)`
  );
  await knex.raw(
    `create index concurrently if not exists departure_date_begin_index on ${schemaName}.departure (date_begin)`
  );
  await knex.raw(
    `create index concurrently if not exists departure_route_id_direction_stop_id_idx on ${schemaName}.departure (route_id, direction, stop_id)`
  );
  await knex.raw(
    `create index concurrently if not exists departure_stop_id_day_type on ${schemaName}.departure (stop_id, day_type)`
  );
  await knex.raw(
    `create index concurrently if not exists departure_origin_time_index on ${schemaName}.departure (origin_hours, origin_minutes)`
  );
  await knex.raw(
    `create index concurrently if not exists departure_departure_id_index on ${schemaName}.departure (departure_id)`
  );
  await knex.raw(
    `create index concurrently if not exists departure_origin_index on ${schemaName}.departure (stop_id, route_id, direction, date_begin, date_end, departure_id, day_type)`
  );
}

export async function createDepartures(schemaName, mainSync = false) {
  if (!mainSync && !startSync('departures')) {
    console.log('[Warning]  Syncing already in progress.');
    return;
  }

  let syncTime = process.hrtime();
  console.log(`[Status]   Creating departures table.`);

  try {
    await knex.raw(departuresInsertQuery, { schema: schemaName });
    logTime('[Status]   Enabling departure indices', syncTime);
    await enableIndices(schemaName);
  } catch (err) {
    console.log(`[Error]    Insert error on table departure`, err);
    
    if(mainSync) {
      throw err
    }
  }

  logTime('[Status]   Departures table created', syncTime);
  endSync('departures');
}
