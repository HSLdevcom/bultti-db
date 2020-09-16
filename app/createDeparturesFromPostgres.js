import { getKnex } from './knex';
import { format, subYears } from 'date-fns';
import { logTime } from './utils/logTime';
import { syncStream } from './utils/syncStream';
import { BATCH_SIZE } from '../constants';
import { startSync, endSync } from './state';

const knex = getKnex();

async function departuresQuery() {
  let minDate = format(subYears(new Date(), 1), 'yyyy-MM-dd');

  // language=PostgreSQL
  return knex
    .raw(
      `
WITH route_stop AS (
 SELECT TRIM(dir.reitunnus) reitunnus,
        dir.suusuunta,
        link.lnkalkusolmu,
        link.reljarjnro,
        dir.suuvoimast,
        dir.suuvoimviimpvm,
        link.ajantaspys,
        (row_number() OVER (
            PARTITION BY dir.reitunnus, dir.suusuunta, dir.suuvoimast, dir.suuvoimviimpvm
            ORDER BY link.reljarjnro
        ))::integer stop_index
    FROM jore.jr_reitinsuunta dir
        LEFT JOIN jore.jr_reitinlinkki link ON link.reitunnus = dir.reitunnus
                                        AND link.suusuunta = dir.suusuunta
                                        AND link.suuvoimast = dir.suuvoimast
    WHERE relpysakki != 'E'
    AND link.suuvoimast >= :minDate
),
route_origin AS (
   SELECT *
   FROM route_stop
   WHERE reljarjnro = 1
)
SELECT TRIM(lah.reitunnus) route_id,
       lah.lhsuunta::smallint direction,
       lah.lhpaivat day_type,
       lah.lhlahaik::varchar origin_departure_time,
       route.lnkalkusolmu origin_stop_id,
       (ROW_NUMBER() over (
           PARTITION BY lah.reitunnus, lah.lhsuunta, lah.lhpaivat, lah.lavoimast, departure.stop_id
           ORDER BY departure.departure_time
       ))::integer departure_id,
       COALESCE(NULLIF(TRIM(lah.lhajotyyppi), ''), 'N') extra_departure,
       COALESCE(lah.lhkaltyyppi, 'ET') equipment_type,
       lah.kohtunnus procurement_unit_id,
       lah.termaika::smallint terminal_time,
       lah.elpymisaika::smallint recovery_time,
       COALESCE(lah.pakollkaltyyppi::smallint, 0) equipment_required,
       lah.junanumero train_number,
       COALESCE(aik.lavoimast, lah.lavoimast) date_begin,
       aik.laviimvoi date_end,
       COALESCE(departure.stop_id, route.lnkalkusolmu) stop_id,
       COALESCE(stop.ajantaspys, '0') is_timing_stop,
       COALESCE(stop.stop_index, 1) stop_index,
       COALESCE(departure.departure_time::varchar, departure.origin_departure_time::varchar) departure_time,
       COALESCE(departure.arrival_time::varchar, departure.origin_departure_time::varchar) arrival_time,
       COALESCE(departure.is_next_day::smallint, lah.lhvrkvht::smallint, 0) is_next_day,
       COALESCE(departure.arrival_is_next_day::smallint, lah.lhvrkvht::smallint, 0) arrival_is_next_day,
       kk.liitunnus operator_id,
       COALESCE(lv.kookoodi, '0') trunk_color_required,
       aik.laviimpvm date_modified
FROM route_origin route
     LEFT JOIN jore.jr_lahto lah on lah.reitunnus = route.reitunnus
                               AND lah.lhsuunta = route.suusuunta
                               AND lah.lavoimast >= route.suuvoimast
                               AND lah.lavoimast <= route.suuvoimviimpvm
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
            FROM route_origin r
                 LEFT JOIN jore.jr_lahto l on l.reitunnus = r.reitunnus
                                         AND l.lhsuunta = r.suusuunta
                                         AND l.lavoimast >= r.suuvoimast
                                         AND l.lavoimast <= r.suuvoimviimpvm
        )
        UNION ALL
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
            FROM jore.jr_valipisteaika vpa
            WHERE vpa.lavoimast >= :minDate
        )
    ) departure ON lah.reitunnus = departure.route_id
            AND lah.lhsuunta = departure.direction
            AND lah.lhlahaik = departure.origin_departure_time
            AND lah.lhpaivat = departure.day_type
            AND lah.lavoimast = departure.date_begin
            AND lah.lhvrkvht = departure.is_next_day
    LEFT JOIN route_stop stop ON lah.reitunnus = stop.reitunnus
                               AND lah.lhsuunta = stop.suusuunta
                               AND route.suuvoimast = stop.suuvoimast
                               AND route.suuvoimviimpvm = stop.suuvoimviimpvm
                               AND departure.stop_id = stop.lnkalkusolmu
    LEFT JOIN jore.jr_aikataulu aik on lah.lavoimast = aik.lavoimast
                                  and lah.reitunnus = aik.reitunnus
    LEFT JOIN jore.jr_kilpailukohd kk on lah.kohtunnus = kk.kohtunnus
    LEFT JOIN jore.jr_linja_vaatimus lv on lah.reitunnus = lv.lintunnus
WHERE lah.lavoimast >= :minDate
  `,
      { minDate }
    )
    .stream();
}

export async function createDeparturesFromPostgres(schemaName, mainSync = false) {
  if (!mainSync && !startSync('departures')) {
    console.log('[Warning]  Syncing already in progress.');
    return;
  }

  let syncTime = process.hrtime();
  console.log(`[Status]   Creating departures table.`);

  let request = await departuresQuery();
  let rowsProcessor = await createRowsProcessor(schemaName);

  console.log(`[Status]   Querying JORE departures.`);

  try {
    await syncStream(request, rowsProcessor, 30, BATCH_SIZE);
  } catch (err) {
    console.log(`[Error]    Insert error on table departure`, err);
  }

  logTime('[Status]   Departures table created', syncTime);
  endSync('departures');
}
