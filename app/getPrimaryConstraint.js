import { get } from 'lodash';

export async function getPrimaryConstraint(knex, tableName, schemaName = 'public') {
  const { rows: constraintRows } = await knex.raw(
    `SELECT con.conname, con.conkey, con.contype
     FROM pg_catalog.pg_constraint con
            INNER JOIN pg_catalog.pg_class rel
                       ON rel.oid = con.conrelid
            INNER JOIN pg_catalog.pg_namespace nsp
                       ON nsp.oid = connamespace
     WHERE nsp.nspname = ?
       AND rel.relname = ?;`,
    [schemaName, tableName]
  );

  const { rows: keyRows } = await knex.raw(
    `SELECT column_name, ordinal_position
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ?
     ORDER BY ordinal_position;`,
    [schemaName, tableName]
  );

  let constraint = constraintRows.filter(
    (row) => row.conname.includes('_pk') || row.contype === 'p'
  )[0];

  if (!constraint) {
    return undefined;
  }

  // Only interested in primary constraints
  return {
    constraint: constraint.conname,
    keys: (constraint.conkey || [])
      .map((keyIdx) =>
        get(
          keyRows.find((keyRow) => keyRow.ordinal_position === keyIdx),
          'column_name'
        )
      )
      .filter((key) => !!key),
  };
}
