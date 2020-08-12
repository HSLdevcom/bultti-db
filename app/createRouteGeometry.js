import { getKnex } from './knex';
import { groupBy, orderBy, get } from 'lodash';
import { formatISO } from 'date-fns';
import geojson from 'geojson';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { upsert } from './upsert';

const knex = getKnex();

let createGroupKey = (row) => {
  return `${row.reitunnus}_${row.suusuunta}_${formatISO(row.suuvoimast)}_${formatISO(
    row.suuvoimviimpvm
  )}`;
};

export async function createRouteGeometry(schemaName) {
  let { rows } = await knex.raw(`
SELECT suunta.reitunnus,
       suunta.suusuunta,
       suunta.suuvoimast,
       suunta.suuvoimviimpvm,
       suunta.suupituus,
       linkki.lnkalkusolmu,
       linkki.lnkloppusolmu,
       piste.pisjarjnro,
       piste.pismx,
       piste.pismy
FROM ${schemaName}.jr_reitinsuunta suunta
         LEFT JOIN ${schemaName}.jr_reitinlinkki linkki USING (reitunnus, suusuunta, suuvoimast)
         LEFT JOIN ${schemaName}.jr_piste piste ON linkki.lnkverkko = piste.lnkverkko
    AND linkki.lnkalkusolmu = piste.lnkalkusolmu
    AND linkki.lnkloppusolmu = piste.lnkloppusolmu
ORDER BY suunta.reitunnus, suunta.suusuunta, piste.pisjarjnro;
  `);

  let validRows = rows.filter((row) => !!row.pismx && !!row.pismy && !!row.pisjarjnro);

  let routeGroups = Object.values(groupBy(validRows, createGroupKey)).map((geometryGroup) => {
    let { pismx, pismy, relpysakki, ...props } = geometryGroup[0];

    let linePoints = orderBy(geometryGroup, (g) => parseInt(g.pisjarjnro, 10)).map((g) => [
      parseFloat(pismx),
      parseFloat(pismy),
    ]);

    let geoJsonFeatures = geojson.parse(
      { line: linePoints, routeId: props.reitunnus, direction: props.suusuunta },
      { LineString: 'line' }
    );

    return {
      route_id: props.reitunnus,
      direction: props.suusuunta,
      date_begin: props.suuvoimast,
      date_end: props.suuvoimviimpvm,
      route_length: props.suupituus,
      start_stop: props.lnkalkusolmu,
      end_stop: props.lnkloppusolmu,
      geojson: geoJsonFeatures,
    };
  });

  let constraint = await getPrimaryConstraint(knex, schemaName, 'route_geometry');
  let constraintKeys = get(constraint, 'keys', []);

  await upsert(schemaName, 'route_geometry', routeGroups, constraintKeys);
  console.log('[Status]   Geometry table created!');
}
