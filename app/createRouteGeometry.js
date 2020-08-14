import { getKnex, getSt } from './knex';
import { groupBy, orderBy, get, chunk } from 'lodash';
import { formatISO } from 'date-fns';
import { getPrimaryConstraint } from './getPrimaryConstraint';
import { upsert } from './upsert';

const knex = getKnex();
const st = getSt();

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
             piste.pisjarjnro,
             piste.pisy,
             piste.pisx
      FROM ${schemaName}.jr_reitinsuunta suunta
         LEFT JOIN ${schemaName}.jr_reitinlinkki linkki USING (reitunnus, suusuunta, suuvoimast)
         LEFT JOIN ${schemaName}.jr_piste piste ON linkki.lnkverkko = piste.lnkverkko
            AND linkki.lnkalkusolmu = piste.lnkalkusolmu
            AND linkki.lnkloppusolmu = piste.lnkloppusolmu
      WHERE piste.pisjarjnro IS NOT NULL
        AND piste.pisy IS NOT NULL
        AND piste.pisx IS NOT NULL
  `);

  let routeGroups = groupBy(rows, createGroupKey);

  console.log('groups')
  
  let routeGeometries = Object.values(routeGroups).map((geometryGroup) => {
    let props = geometryGroup[0];

    let linePoints = orderBy(geometryGroup, 'pisjarjnro').map((g) =>
      st.transform(st.geomFromText(`POINT(${g.pisy} ${g.pisx})`, 2392), 4326)
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

  console.log('geometries')
  
  let constraint = await getPrimaryConstraint(knex, schemaName, 'route_geometry');
  let constraintKeys = get(constraint, 'keys', []);
  
  await upsert(schemaName, 'route_geometry', routeGeometries, constraintKeys);
  console.log('[Status]   Geometry table created!');
}
