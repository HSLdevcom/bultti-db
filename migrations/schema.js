const fs = require('fs-extra');
const path = require('path');

exports.up = async function(knex) {
  const schemaSQL = await fs.readFile(
    path.join(__dirname, '../sql', 'schema_ddl.sql'),
    'utf8'
  );

  try {
    await knex.transaction((trx) => {
      return trx.raw(schemaSQL);
    });
  } catch (err) {
    console.log('DB already initialized.');
  }

  return Promise.resolve();
};

exports.down = async function(knex) {
  // This drops the schema and all data!!! Do not roll back unless this is your intention.
  const dropSchemaSQL = await fs.readFile(
    path.join(__dirname, '../sql', 'drop_schema.sql'),
    'utf8'
  );

  return knex.raw(dropSchemaSQL);
};
