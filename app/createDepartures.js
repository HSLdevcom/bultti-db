import { getKnex } from './knex';
import { format } from 'date-fns';
import { logTime, currentSeconds } from './utils/logTime';
import { syncStream } from './utils/syncStream';
import { BATCH_SIZE } from '../constants';
import { startSync, endSync } from './state';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { createNotNullFilter } from './utils/notNullFilter';
import { averageTime } from './utils/averageTime';
import { uniqBy, toString } from 'lodash';
import { upsert } from './upsert';
import { departuresQuery } from './queryFragments/departuresQuery';

const knex = getKnex();

let createDepartureKey = (constraint) => {
  let primaryKeys = constraint.keys || [];

  return (row) =>
    primaryKeys
      .map((pk) => {
        let val = row[pk];

        if (val instanceof Date) {
          return format(val, 'yyyy-MM-dd');
        }

        return toString(val);
      })
      .join('__');
};

export async function createRowsProcessor(schemaName) {
  let columnSchema;
  let constraint;

  try {
    constraint = await getPrimaryConstraint(knex, schemaName, 'departure');

    columnSchema = await knex
      .withSchema(schemaName)
      .table('departure')
      .columnInfo();
  } catch (err) {
    console.log(err);
  }

  let notNullFilter = createNotNullFilter(constraint, columnSchema);
  let getRowKey = createDepartureKey(constraint);
  let logAverageTime = averageTime('Departure chunk');

  return async (rows = []) => {
    let chunkTime = process.hrtime();

    let departures = rows.map((depRow) => {
      let {
        origin_departure_time,
        departure_time,
        arrival_time,
        trunk_color_required,
        is_next_day,
        equipment_required,
        arrival_is_next_day,
        is_timing_stop,
        ...depProps
      } = depRow;

      let [origin_hours = -1, origin_minutes = -1] = (origin_departure_time || '')
        .split('.')
        .map((num) => parseInt(num, 10));

      let [hours = -1, minutes = -1] = (departure_time || '')
        .split('.')
        .map((num = '-1') => parseInt(num, 10));

      let [arrival_hours = -1, arrival_minutes = -1] = (arrival_time || '')
        .split('.')
        .map((num = '-1') => parseInt(num, 10));

      return {
        ...depProps,
        origin_hours: origin_hours,
        origin_minutes: origin_minutes,
        hours: hours,
        minutes: minutes,
        arrival_hours: arrival_hours,
        arrival_minutes: arrival_minutes,
        trunk_color_required: trunk_color_required === '2',
        is_next_day: is_next_day === 1,
        arrival_is_next_day: arrival_is_next_day === 1,
        equipment_required: equipment_required === 1,
        is_timing_stop: is_timing_stop !== '0',
      };
    });

    let validDepartures = departures.filter(notNullFilter);
    let uniqDepartures = uniqBy(validDepartures, getRowKey);

    if (uniqDepartures.length !== 0) {
      await upsert(schemaName, 'departure', uniqDepartures, constraint.keys || []);
    }

    logAverageTime(currentSeconds(chunkTime));
  };
}

export async function createDepartures(schemaName, mainSync = false) {
  if (!mainSync && !startSync('departures')) {
    console.log('[Warning]  Syncing already in progress.');
    return;
  }

  let syncTime = process.hrtime();
  console.log(`[Status]   Creating departures table.`);

  let queryStream = knex.raw(departuresQuery).stream();
  let rowsProcessor = await createRowsProcessor(schemaName);

  console.log(`[Status]   Querying JORE departures.`);

  try {
    await syncStream(queryStream, rowsProcessor, 30, BATCH_SIZE, 'data', 'end');
  } catch (err) {
    console.log(`[Error]    Insert error on table departure`, err);
  }

  logTime('[Status]   Departures table created', syncTime);
  endSync('departures');
}
