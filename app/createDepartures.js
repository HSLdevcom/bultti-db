import { getKnex, getSt } from './knex';
import { groupBy, orderBy } from 'lodash';
import { formatISO } from 'date-fns';
import { logTime } from './utils/logTime';

const knex = getKnex();

let createDeparturesKey = (row) => {
  return `${row.reitunnus}_${row.suusuunta}_${formatISO(row.suuvoimast)}`;
};

export async function createDepartures(schemaName) {
  let syncTime = process.hrtime();

  

  console.log('Departures data created');
  await knex.batchInsert(`${schemaName}.departures`, [], 100);
  logTime('[Status]   Departures table created', syncTime);
}
