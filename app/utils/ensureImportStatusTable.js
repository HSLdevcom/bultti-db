import fs from 'fs-extra';
import path from 'path';
import { getKnex } from '../db/postgres';

const knex = getKnex();

export async function ensureImportStatusTable() {
  try {
    // language=PostgreSQL
    var {
      rows: [{ exists = false }],
    } = await knex.raw(`
      SELECT EXISTS(
          SELECT *
          FROM information_schema.tables
          WHERE
            table_schema = 'public' AND
            table_name = 'import_status'
      );
  `);
  } catch (err) {
    console.error('Database not available!', err);
  }

  if (!exists) {
    let ddl = await fs.readFile(
      path.join(__dirname, '../', 'sqlScripts', 'import_status.sql'),
      'utf8'
    );

    try {
      await knex.raw(ddl);
      console.log('Import status table created.');
    } catch (err) {}
  } else {
    console.log('Import status exists.');
  }
}
