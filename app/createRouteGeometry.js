import { getKnex, getSt } from './knex';
import { groupBy, orderBy, uniqBy } from 'lodash';
import { formatISO } from 'date-fns';
import { logTime } from './utils/logTime';

const knex = getKnex();
const st = getSt();

let createGroupKey = (row) => {
  return `${row.reitunnus}_${row.suusuunta}_${formatISO(row.suuvoimast)}_${formatISO(
    row.suuvoimviimpvm
  )}`;
};

export async function createRouteGeometry(schemaName) {
  let syncTime = process.hrtime();

  let { rows } = await knex.raw(`
      SELECT suunta.reitunnus,
             suunta.suusuunta,
             suunta.suuvoimast,
             suunta.suuvoimviimpvm,
             suunta.suupituus,
             piste.pisjarjnro,
             ST_GeomFromText('POINT(' || COALESCE(solmu.solmx, piste.pismx) || ' ' || COALESCE(solmu.solmy, piste.pismy) ||')',4326) point
      FROM ${schemaName}.jr_reitinsuunta suunta
         LEFT JOIN ${schemaName}.jr_reitinlinkki linkki USING (reitunnus, suusuunta, suuvoimast)
         LEFT JOIN ${schemaName}.jr_solmu solmu ON linkki.lnkalkusolmu = solmu.soltunnus
         LEFT JOIN ${schemaName}.jr_piste piste ON linkki.lnkverkko = piste.lnkverkko
                                                AND linkki.lnkalkusolmu = piste.lnkalkusolmu
                                                AND linkki.lnkloppusolmu = piste.lnkloppusolmu
      ORDER BY suunta.reitunnus, suunta.suusuunta, suunta.suuvoimast, suunta.suuvoimviimpvm, linkki.reljarjnro
  `);

  let validRows = rows.filter((row) => !!row.point && !!row.pisjarjnro);
  let routeGroups = groupBy(validRows, createGroupKey);

  let routeGeometries = Object.values(routeGroups).map((geometryGroup) => {
    let props = geometryGroup[0];

    let linePoints = orderBy(uniqBy(geometryGroup, 'pisjarjnro'), 'pisjarjnro').map(
      (g) => g.point
    );

    return {
      route_id: props.reitunnus,
      direction: props.suusuunta,
      date_begin: props.suuvoimast,
      date_end: props.suuvoimviimpvm,
      route_length: props.suupituus,
      geom: knex.raw(`ST_MakeLine(ARRAY[${linePoints.map(() => '?').join(',')}])`, linePoints),
    };
  });

  console.log('Geometries data created');

  await knex.batchInsert(`${schemaName}.route_geometry`, routeGeometries);

  logTime('[Status]   Geometry table created', syncTime);
}
