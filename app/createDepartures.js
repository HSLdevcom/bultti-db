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

let createDepartureKey = (constraint) => {
  let primaryKeys = constraint.keys || [];

  return (row) => {
    let key = '';

    for (let pk of primaryKeys) {
      let val = row[pk];

      if (val instanceof Date) {
        key += format(val, 'yyyy-MM-dd');
      } else {
        key += toString(val);
      }
    }

    return key;
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
           PARTITION BY lah.reitunnus, lah.lhsuunta, lah.lhpaivat, lah.lavoimast, departure.stop_id
           ORDER BY departure.departure_time
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
       COALESCE(departure.stop_id, route.lnkalkusolmu) stop_id,
       COALESCE(CAST(departure.departure_time AS varchar), CAST(departure.origin_departure_time AS varchar)) departure_time,
       COALESCE(CAST(departure.arrival_time AS varchar), CAST(departure.origin_departure_time AS varchar)) arrival_time,
       COALESCE(CAST(departure.is_next_day AS smallint), CAST(lah.lhvrkvht AS smallint), 0) is_next_day,
       COALESCE(CAST(departure.arrival_is_next_day AS smallint), CAST(lah.lhvrkvht AS smallint), 0) arrival_is_next_day,
       kk.liitunnus operator_id,
       COALESCE(lv.kookoodi, '0') trunk_color_required,
       aik.laviimpvm date_modified
FROM departure_routes route
     LEFT JOIN dbo.jr_lahto lah on lah.reitunnus = route.reitunnus
                               AND lah.lhsuunta = route.suusuunta
     LEFT JOIN (
         (
            SELECT r.reitunnus route_id,
                   r.suusuunta direction,
                   r.lnkalkusolmu stop_id,
                   l.lhlahaik origin_departure_time,
                   l.lhlahaik departure_time,
                   l.lhpaivat day_type,
                   l.lavoimast date_begin,
                   l.lhvrkvht is_next_day,
                   l.lhvrkvht arrival_is_next_day,
                   l.lhlahaik arrival_time
            FROM departure_routes r
                 LEFT JOIN dbo.jr_lahto l on l.reitunnus = r.reitunnus
                                         AND l.lhsuunta = r.suusuunta
        )
        UNION
        (
            SELECT vpa.reitunnus route_id,
                   vpa.lhsuunta  direction,
                   vpa.vastunnus stop_id,
                   vpa.lhlahaik  origin_departure_time,
                   vpa.vaslaika  departure_time,
                   vpa.lhpaivat  day_type,
                   vpa.lavoimast date_begin,
                   vpa.lhvrkvht  is_next_day,
                   vpa.vastvrkvht arrival_is_next_day,
                   vpa.vastaika arrival_time
            FROM dbo.jr_valipisteaika vpa
        )
    ) departure ON lah.reitunnus = departure.route_id
            AND lah.lhsuunta = departure.direction
            AND lah.lhlahaik = departure.origin_departure_time
            AND lah.lhpaivat = departure.day_type
            AND lah.lavoimast = departure.date_begin
            AND lah.lhvrkvht = departure.is_next_day
    LEFT JOIN dbo.jr_aikataulu aik on lah.lavoimast = aik.lavoimast
                                  and lah.reitunnus = aik.reitunnus
    LEFT JOIN dbo.jr_kilpailukohd kk on lah.kohtunnus = kk.kohtunnus
    LEFT JOIN dbo.jr_linja_vaatimus lv on lah.reitunnus = lv.lintunnus
WHERE lah.lavoimast >= '${minDate}'
  AND lah.lavoimast <= '${maxDate}'
ORDER BY lah.lhlahaik
  `);

  return request;
}

async function enableIndices(schemaName) {
  console.log('[Status]   Enabling indices.');

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

async function disableIndices(schemaName) {
  console.log('[Status]   Disabling indices.');
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
  let getRowKey = createDepartureKey(constraint);
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
    let uniqDepartures = uniqBy(validDepartures, getRowKey);

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
  
    console.log(`[Status]   Querying JORE departures.`);
    
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
      resolve();
    });

    request.on('error', (err) => {
      queue.clear();
      console.log(`[Error]   MSSQL query error`, err);
      reject(err);
    });
  });
}
