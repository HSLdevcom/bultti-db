import { getKnex } from './knex';
import { format } from 'date-fns';
import { logTime } from './utils/logTime';
import { getPool } from './mssql';
import { uniqBy, groupBy } from 'lodash';
import { upsert } from './upsert';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { createNotNullFilter } from './utils/notNullFilter';
import PQueue from 'p-queue';

const knex = getKnex();

let createDeparturesKey = (row) => {
  return `${row.stop_id}_${row.route_id}_${row.direction}_${row.day_type}_${row.hours}_${
    row.minutes
  }_${format(row.date_begin, 'yyyy-MM-dd')}_${format(row.date_end, 'yyyy-MM-dd')}_${
    row.extra_departure
  }_${row.is_next_day}`;
};

async function departuresQuery(route, pool) {
  let request = pool.request();

  // language=TSQL
  let { recordset = [] } = await request.query(`
        SELECT TRIM(lah.reitunnus) route_id,
              CAST(lah.lhsuunta AS smallint) direction,
              lah.lhpaivat day_type,
              CAST(lah.lhlahaik AS varchar) origin_departure_time,
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
              vpa.vastunnus stop_id,
              CAST(vpa.vaslaika AS varchar) departure_time,
              CAST(vpa.vastaika AS varchar) arrival_time,
              COALESCE(CAST(vpa.vaslvrkvht AS smallint), CAST(lah.lhvrkvht AS smallint), 0) is_next_day,
              CAST(vpa.vastvrkvht AS smallint) arrival_is_next_day,
              kk.liitunnus operator_id,
              COALESCE(lv.kookoodi, '0') trunk_color_required,
              aik.laviimpvm date_modified
        FROM dbo.jr_lahto lah
           LEFT JOIN dbo.jr_valipisteaika vpa on lah.reitunnus = vpa.reitunnus
                and lah.lhsuunta = vpa.lhsuunta
                and lah.lhpaivat = vpa.lhpaivat
                and lah.lhlahaik = vpa.lhlahaik
                and lah.lavoimast = vpa.lavoimast
                and lah.lhvrkvht = vpa.lhvrkvht
           LEFT JOIN dbo.jr_aikataulu aik on lah.lavoimast = aik.lavoimast
                and lah.reitunnus = aik.reitunnus
           LEFT JOIN dbo.jr_kilpailukohd kk on lah.kohtunnus = kk.kohtunnus
           LEFT JOIN dbo.jr_linja_vaatimus lv on lah.reitunnus = lv.lintunnus
        WHERE lah.reitunnus = '${route.reitunnus}'
          AND lah.lhsuunta = '${route.suusuunta}'
          AND lah.lavoimast >= '2019-01-01'
        ORDER BY CAST(lah.lhlahaik AS decimal)
    `);

  return recordset;
}

async function getRoutes() {
  let pool = await getPool(1);
  let request = pool.request();

  // language=TSQL
  let { recordset = [] } = await request.query(`
      SELECT DISTINCT TRIM(reitunnus) reitunnus, suusuunta, lnkalkusolmu
      FROM dbo.jr_reitinlinkki
      WHERE relpysakki != 'E'
        AND suuvoimast >= '2019-01-01'
        AND reljarjnro = 1
    `);

  return recordset;
}

export async function createDepartures(schemaName) {
  let syncTime = process.hrtime();
  let routes = await getRoutes();

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

  let syncQueue = new PQueue({
    concurrency: 10,
    autoStart: true,
  });

  for (let route of routes) {
    let routeName = `${route.reitunnus}/${route.suusuunta}/${route.lnkalkusolmu}`;

    syncQueue
      .add(async () => {
        console.log(`[Status]   Importing ${routeName}`);

        let pool = await getPool(1);
        let rows = await departuresQuery(route, pool);

        let firstDepartures = uniqBy(
          rows,
          (dep) => `${dep.origin_departure_time}_${dep.day_type}_${dep.date_begin}`
        );

        let originDepartures = firstDepartures.map((dep) => ({
          ...dep,
          departure_time: dep.origin_departure_time,
          arrival_time: dep.origin_departure_time,
          stop_id: route.lnkalkusolmu,
        }));

        let rawDepartures = [...originDepartures, ...rows];

        let departures = rawDepartures.map((depRow) => {
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
            origin_stop_id: route.lnkalkusolmu,
            ...depProps,
            origin_hours: isNaN(origin_hours) ? -1 : origin_hours,
            origin_minutes: isNaN(origin_minutes) ? -1 : origin_minutes,
            hours: isNaN(hours) ? -1 : hours,
            minutes: isNaN(minutes) ? -1 : minutes,
            arrival_hours: isNaN(arrival_hours) ? -1 : arrival_hours,
            arrival_minutes: isNaN(arrival_minutes) ? -1 : arrival_minutes,
            trunk_color_required: trunk_color_required === '2',
            is_next_day: is_next_day === 1,
            arrival_is_next_day: arrival_is_next_day === 1,
            equipment_required: equipment_required === 1,
          };
        });

        console.log(`[Status]   Departures of ${routeName} fetched`);

        let validDepartures = departures.filter(
          (dep) =>
            notNullFilter(dep) &&
            Object.values(dep).every(
              (val) => typeof val !== 'number' || (!isNaN(val) && val !== -1)
            )
        );

        let uniqDepartures = uniqBy(validDepartures, createDeparturesKey);

        if (uniqDepartures.length !== 0) {
          await upsert(schemaName, 'departure', uniqDepartures);
        }

        console.log(`[Status]   Departures of ${routeName} inserted.`);
      })
      .catch((err) => {
        console.log(`[Error]    Sync error on table ${routeName}`, err);
      });
  }

  await syncQueue.onIdle();

  logTime('[Status]   Departures table created.', syncTime);
}
