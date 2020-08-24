import { getKnex } from './knex';
import { formatISO } from 'date-fns';
import { logTime } from './utils/logTime';
import { getPool } from './mssql';

const knex = getKnex();

let createDeparturesKey = (row) => {
  return `${row.reitunnus}_${row.suusuunta}_${formatISO(row.suuvoimast)}`;
};

async function departuresQuery(route) {
  let pool = await getPool();
  let request = pool.request();

  // language=TSQL
  let { recordset = [] } = await request.query`
        SELECT lah.reitunnus route_id,
               CAST(lah.lhsuunta AS smallint) direction,
               lah.lhpaivat day_type,
               CAST(lah.lhlahaik AS varchar) origin_departure_time,
               CAST(ROW_NUMBER() over (
                   PARTITION BY lah.reitunnus, lah.lhsuunta, lah.lhlahaik, lah.lhpaivat, lah.lavoimast
                   ORDER BY lah.lhjarjnro
               ) AS smallint) departure_id,
               COALESCE(NULLIF(TRIM(lah.lhajotyyppi), ''), 'N') extra_departure,
               COALESCE(lah.lhkaltyyppi, 'Unknown') equipment_type,
               lah.kohtunnus procurement_unit_id,
               CAST(lah.termaika AS smallint) terminal_time,
               CAST(lah.elpymisaika AS smallint) recovery_time,
               COALESCE(CONVERT(smallint, lah.pakollkaltyyppi), 0) equipment_required,
               lah.junanumero train_number,
               aik.lavoimast date_begin,
               aik.laviimvoi date_end,
               vpa.vastunnus stop_id,
               CAST(vpa.vaslaika AS varchar) departure_time,
               CAST(vpa.vastaika AS varchar) arrival_time,
               COALESCE(CONVERT(smallint, vpa.vaslvrkvht), 0) is_next_day,
               kk.liitunnus operator_id,
               COALESCE(CONVERT(smallint, lv.kookoodi), 0) trunk_color_required
        FROM dbo.jr_lahto lah
           LEFT JOIN dbo.jr_aikataulu aik on lah.lavoimast = aik.lavoimast
                and lah.reitunnus = aik.reitunnus
           LEFT JOIN dbo.jr_valipisteaika vpa on lah.reitunnus = vpa.reitunnus
                and lah.lhsuunta = vpa.lhsuunta
                and lah.lhpaivat = vpa.lhpaivat
                and lah.lhlahaik = vpa.lhlahaik
                and lah.lavoimast = vpa.lavoimast
                and lah.lhvrkvht = vpa.lhvrkvht
           LEFT JOIN dbo.jr_kilpailukohd kk on lah.kohtunnus = kk.kohtunnus
           LEFT JOIN dbo.jr_linja_vaatimus lv on lah.reitunnus = lv.lintunnus
        WHERE lah.reitunnus = ${route.reitunnus}
          AND lah.lhsuunta = ${route.suusuunta}
          AND lah.lavoimast >= ${route.suuvoimast}
    `;

  return recordset;
}

async function getRoutes() {
  let pool = await getPool();
  let request = pool.request();

  // language=TSQL
  let { recordset = [] } = await request.query(`
      SELECT reitunnus, suusuunta, lnkalkusolmu, suuvoimast
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

  let routeDepartures = [];

  for (let route of routes) {
    let rows = await departuresQuery(route);

    let departures = rows.map((depRow) => {
      let {origin_departure_time, departure_time, arrival_time, ...depProps} = depRow
      
      let [origin_hours = -1, origin_minutes = -1] = (origin_departure_time || '')
        .split('.')
        .map((num) => parseInt(num, 10));
  
      let [hours = -1, minutes = -1] = (departure_time || '')
        .split('.')
        .map((num) => parseInt(num, 10));
  
      let [arrival_hours = -1, arrival_minutes = -1] = (arrival_time || '')
        .split('.')
        .map((num) => parseInt(num, 10));

      return {
        origin_stop_id: route.lnkalkusolmu,
        ...depProps,
        origin_hours,
        origin_minutes,
        hours,
        minutes,
        arrival_hours,
        arrival_minutes
      };
    });

    routeDepartures = [...routeDepartures, ...departures];
  }

  console.log('Departures data created');
  await knex.batchInsert(`${schemaName}.departures`, routeDepartures, 5000);
  logTime('[Status]   Departures table created', syncTime);
}
