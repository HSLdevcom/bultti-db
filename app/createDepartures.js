import { getKnex } from './knex';
import { format, addMonths, subYears } from 'date-fns';
import { logTime } from './utils/logTime';
import { getPool } from './mssql';
import { uniqBy, toString } from 'lodash';
import { upsert } from './upsert';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { createNotNullFilter } from './utils/notNullFilter';
import { BATCH_SIZE } from '../constants';
import { averageTime } from './utils/averageTime';
import PQueue from 'p-queue';

const knex = getKnex();

let createDeparturesKey = (constraint) => {
  let primaryKeys = constraint.keys;

  return (row) => {
    return primaryKeys.reduce((key, pk) => {
      let val = row[pk];

      if (pk.startsWith('date')) {
        return key + format(val, 'yyyy-MM-dd');
      }

      return key + toString(val);
    }, '');
  };
};

async function departuresQuery() {
  let pool = await getPool(5);

  let request = pool.request();
  request.stream = true;

  let maxDate = format(addMonths(new Date(), 1), 'yyyy-MM-dd');
  let minDate = format(subYears(new Date(), 1), 'yyyy-MM-dd');

  // language=TSQL
  request.query(`
      WITH departure_routes as (
          SELECT DISTINCT TRIM(reitunnus) reitunnus, suusuunta, lnkalkusolmu
          FROM dbo.jr_reitinlinkki
          WHERE relpysakki != 'E'
            AND suuvoimast >= '${minDate}'
            AND reljarjnro = 1
      )
      SELECT TRIM(lah.reitunnus) route_id,
            CAST(lah.lhsuunta AS smallint) direction,
            lah.lhpaivat day_type,
            CAST(lah.lhlahaik AS varchar) origin_departure_time,
            route.lnkalkusolmu origin_stop_id,
            CAST(ROW_NUMBER() over (
               PARTITION BY lah.reitunnus, lah.lhsuunta, lah.lhpaivat, lah.lavoimast, vpa.vastunnus
               ORDER BY vpa.vaslaika
            ) AS int) departure_id,
            COALESCE(NULLIF(TRIM(lah.lhajotyyppi), ''), 'N') extra_departure,
            COALESCE(lah.lhkaltyyppi, 'ET') equipment_type,
            lah.kohtunnus procurement_unit_id,
            CAST(lah.termaika AS smallint) terminal_time,
            CAST(lah.elpymisaika AS smallint) recovery_time,
            COALESCE(CAST(lah.pakollkaltyyppi AS smallint), 0) equipment_required,
            lah.junanumero train_number,
            aik.lavoimast date_begin,
            aik.laviimvoi date_end,
            COALESCE(vpa.vastunnus, origin.origin_stop_id) stop_id,
            COALESCE(CAST(vpa.vaslaika AS varchar), CAST(origin.origin_departure_time AS varchar)) departure_time,
            COALESCE(CAST(vpa.vastaika AS varchar), CAST(origin.origin_departure_time AS varchar)) arrival_time,
            COALESCE(CAST(vpa.vaslvrkvht AS smallint), CAST(origin.is_next_day AS smallint), 0) is_next_day,
            COALESCE(CAST(vpa.vastvrkvht AS smallint), CAST(origin.is_next_day AS smallint), 0) arrival_is_next_day,
            kk.liitunnus operator_id,
            COALESCE(lv.kookoodi, '0') trunk_color_required,
            aik.laviimpvm date_modified
      FROM departure_routes route
         LEFT JOIN dbo.jr_lahto lah on lah.reitunnus = route.reitunnus
              AND lah.lhsuunta = route.suusuunta
         LEFT JOIN (
            SELECT r.reitunnus route_id,
                   r.suusuunta direction,
                   r.lnkalkusolmu origin_stop_id,
                   l.lhlahaik origin_departure_time,
                   l.lhpaivat day_type,
                   l.lavoimast date_begin,
                   l.lhvrkvht is_next_day
            FROM departure_routes r
            LEFT JOIN dbo.jr_lahto l on l.reitunnus = r.reitunnus
             AND l.lhsuunta = r.suusuunta
        ) origin ON lah.reitunnus = origin.route_id
               AND lah.lhsuunta = origin.direction
               AND lah.lhlahaik = origin.origin_departure_time
               AND lah.lhpaivat = origin.day_type
               AND lah.lavoimast = origin.date_begin
               AND lah.lhvrkvht = origin.is_next_day
         LEFT OUTER JOIN dbo.jr_valipisteaika vpa on lah.reitunnus = vpa.reitunnus
              and lah.lhsuunta = vpa.lhsuunta
              and lah.lhpaivat = vpa.lhpaivat
              and lah.lhlahaik = vpa.lhlahaik
              and lah.lavoimast = vpa.lavoimast
              and lah.lhvrkvht = vpa.lhvrkvht
         LEFT JOIN dbo.jr_aikataulu aik on lah.lavoimast = aik.lavoimast
              and lah.reitunnus = aik.reitunnus
         LEFT JOIN dbo.jr_kilpailukohd kk on lah.kohtunnus = kk.kohtunnus
         LEFT JOIN dbo.jr_linja_vaatimus lv on lah.reitunnus = lv.lintunnus
      WHERE lah.lavoimast >= '${minDate}'
        AND lah.lavoimast <= '${maxDate}'
      ORDER BY CAST(lah.lhlahaik AS decimal)
  `);

  return request;
}

async function enableIndices(schemaName) {
  console.log('[Status]   Enabling indices.')
  // language=PostgreSQL
  return knex.raw(`
      create index concurrently if not exists departure_stop_id_index on ${schemaName}.departure (stop_id);
      create index concurrently if not exists departure_route_id_index on ${schemaName}.departure (route_id);
      create index concurrently if not exists departure_day_type_index on ${schemaName}.departure (day_type);
      create index concurrently if not exists departure_date_begin_index on ${schemaName}.departure (date_begin);
      create index concurrently if not exists departure_route_id_direction_stop_id_idx on ${schemaName}.departure (route_id, direction, stop_id);
      create index concurrently if not exists departure_stop_id_day_type on ${schemaName}.departure (stop_id, day_type);
      create index concurrently if not exists departure_origin_time_index on ${schemaName}.departure (origin_hours, origin_minutes);
      create index concurrently if not exists departure_departure_id_index on ${schemaName}.departure (departure_id);
      create index concurrently if not exists departure_origin_index on ${schemaName}.departure (stop_id, route_id, direction, date_begin, date_end, departure_id, day_type);
  `);
}

async function disableIndices(schemaName) {
  console.log('[Status]   Disabling indices.')
  // language=PostgreSQL
  return knex.raw(`
      drop index if exists ${schemaName}.departure_stop_id_index;
      drop index if exists ${schemaName}.departure_route_id_index;
      drop index if exists ${schemaName}.departure_day_type_index;
      drop index if exists ${schemaName}.departure_date_begin_index;
      drop index if exists ${schemaName}.departure_route_id_direction_stop_id_idx;
      drop index if exists ${schemaName}.departure_stop_id_day_type;
      drop index if exists ${schemaName}.departure_origin_time_index;
      drop index if exists ${schemaName}.departure_departure_id_index;
      drop index if exists ${schemaName}.departure_origin_index;
  `);
}

async function createRowsProcessor(schemaName) {
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
  let createRowKey = createDeparturesKey(constraint);

  let logAverageTime = averageTime('Departure chunk');

  return async (rows) => {
    let chunkTime = process.hrtime();
    /* let firstDepartures = uniqBy(
        rows,
        (dep) => `${dep.origin_departure_time}_${dep.day_type}_${dep.date_begin}`
      );
    
      let originDepartures = firstDepartures.map((dep) => ({
        ...dep,
        departure_time: dep.origin_departure_time,
        arrival_time: dep.origin_departure_time,
        stop_id: route.lnkalkusolmu,
      }));
    
      let rawDepartures = [...originDepartures, ...rows]; */

    let departures = rows.map((depRow) => {
      let {
        origin_departure_time,
        departure_time,
        arrival_time,
        trunk_color_required,
        is_next_day,
        equipment_required,
        arrival_is_next_day,
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
      };
    });

    let validDepartures = departures.filter(notNullFilter);
    let uniqDepartures = uniqBy(validDepartures, createRowKey);

    if (uniqDepartures.length !== 0) {
      await upsert(schemaName, 'departure', uniqDepartures);
    }

    let seconds = logTime(
      `[Status]   ${uniqDepartures.length} departure rows processed and inserted`,
      chunkTime
    );

    logAverageTime(seconds);
  };
}

export async function createDepartures(schemaName) {
  let syncTime = process.hrtime();
  console.log(`[Status]   Creating departures table.`);

  let queue = new PQueue({
    autoStart: true,
    concurrency: 20,
  });
  
  return new Promise(async (resolve, reject) => {
    let request = await departuresQuery();
    let rowsProcessor = await createRowsProcessor(schemaName);
  
    await disableIndices(schemaName);
  
    let rows = [];
  
    function processRows() {
      queue
        .add(() => rowsProcessor(rows))
        .catch((err) => console.log(`[Error]    Insert error on table departure`, err));
    
      rows = [];
      request.resume();
    }
  
    request.on('row', (row) => {
      rows.push(row);
    
      if (rows.length >= BATCH_SIZE) {
        request.pause();
        processRows();
      }
    });
  
    request.on('done', async () => {
      processRows();
      await queue.onIdle();
      await enableIndices(schemaName);
      logTime('[Status]   Departures table created.', syncTime);
      resolve()
    });
  
    request.on('error', (err) => {
      queue.clear();
      console.log(`[Error]   MSSQL query error`, err);
      reject(err)
    });
  })
}
