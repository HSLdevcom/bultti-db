import { getKnex } from '../db/postgres';

const knex = getKnex();

async function writeLog(eventType, message) {
  await knex('import_status').insert({
    timestamp: new Date(),
    event_type: eventType,
    message,
  });
}

export async function logSyncStart(message) {
  await writeLog('start', message);
}

export async function logSyncEnd(message) {
  await writeLog('end', message);
}

export async function logSyncError(message) {
  await writeLog('error', message);
}
