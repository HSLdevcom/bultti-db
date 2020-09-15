import { getKnex } from './knex';
import { groupBy } from 'lodash';
import { formatISO } from 'date-fns';
import { logTime } from './utils/logTime';
import { startSync, endSync } from './state';

const knex = getKnex();

let createGroupKey = (row) => {
  return `${row.reitunnus}_${row.suusuunta}_${formatISO(row.suuvoimast)}`;
};

export async function createRouteGeometry(schemaName, mainSync = false) {
  if (!mainSync && !startSync('geometry')) {
    console.log('[Warning]  Syncing already in progress.');
    return;
  }
  
  let syncTime = process.hrtime();
  console.log('[Status]   Creating route_geometry table.');

  // language=PostgreSQL
  let { rows } = await knex.raw(`
      WITH point_pos AS (
          SELECT piste.lnkverkko,
                 piste.lnkalkusolmu,
                 piste.lnkloppusolmu,
                 piste.pisjarjnro,
                 st_transform(st_setsrid(st_makepoint((piste.pisy)::double precision , (piste.pisx)::double precision ), 2392), 4326) pos
          FROM ${schemaName}.jr_piste piste
      ), route_line AS (
          SELECT COALESCE(st_addpoint(
                                  st_addpoint(b.geom, st_transform(st_setsrid(st_makepoint((sl.solsty)::double precision, (sl.solstx)::double precision), 2392), 4326), 0),
                                  st_transform(st_setsrid(st_makepoint((ll.solsty)::double precision, (ll.solstx)::double precision), 2392), 4326)),
                          st_makeline(st_transform(st_setsrid(st_makepoint((sl.solsty)::double precision, (sl.solstx)::double precision), 2392), 4326), st_transform(st_setsrid(st_makepoint((ll.solsty)::double precision, (ll.solstx)::double precision), 2392), 4326))
                     )AS geom,
                 b.lnkverkko,
                 b.lnkalkusolmu,
                 b.lnkloppusolmu
          FROM ((
                    SELECT l.lnkverkko,
                           l.lnkalkusolmu,
                           l.lnkloppusolmu,
                           st_makeline(pg.pos ORDER BY pg.lnkverkko, pg.lnkalkusolmu, pg.lnkloppusolmu, pg.pisjarjnro) AS geom
                    FROM ${schemaName}.jr_linkki l
                             LEFT JOIN point_pos pg ON ((pg.lnkverkko = l.lnkverkko) AND (pg.lnkalkusolmu = l.lnkalkusolmu) AND (pg.lnkloppusolmu = l.lnkloppusolmu))
                    GROUP BY l.lnkverkko, l.lnkalkusolmu, l.lnkloppusolmu) b
                   LEFT JOIN ${schemaName}.jr_solmu sl ON (b.lnkalkusolmu = sl.soltunnus)
                   LEFT JOIN ${schemaName}.jr_solmu ll ON (b.lnkloppusolmu = ll.soltunnus))
      )
      SELECT linkki.reitunnus,
             linkki.suusuunta,
             linkki.suuvoimast,
             linkki.reljarjnro,
             line.geom
      FROM route_line line
            LEFT JOIN ${schemaName}.jr_reitinlinkki linkki ON line.lnkverkko = linkki.lnkverkko
              AND line.lnkalkusolmu = linkki.lnkalkusolmu
              AND line.lnkloppusolmu = linkki.lnkloppusolmu
      WHERE linkki.suuvoimast IS NOT NULL
      ORDER BY linkki.reitunnus, linkki.suusuunta, linkki.suuvoimast, linkki.reljarjnro;
  `);

  let routeGroups = groupBy(rows, createGroupKey);

  let routeGeometries = Object.values(routeGroups).map((geometryGroup) => {
    let props = {
      ...geometryGroup[0],
    };

    let linkLines = geometryGroup.map((g) => g.geom);

    return {
      route_id: props.reitunnus,
      direction: props.suusuunta,
      date_begin: props.suuvoimast,
      geom: knex.raw(`ST_MakeLine(ARRAY[${linkLines.map(() => '?').join(',')}])`, linkLines),
    };
  });

  await knex.batchInsert(`${schemaName}.route_geometry`, routeGeometries, 100);

  logTime('[Status]   Geometry table created', syncTime);
  endSync('geometry')
}
