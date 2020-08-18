// Ensure primary key columns are not null
import { trim, uniq, get } from 'lodash';

export function notNullFilter(row, constraint, columnSchema) {
  if ((!constraint || constraint.keys.length === 0) && !columnSchema) {
    return true;
  }

  let nonNullableKeys = Object.entries(columnSchema)
    .filter(([, schema]) => schema.nullable === false)
    .map(([key]) => key);

  let notNullKeys = uniq([...get(constraint, 'keys', []), ...nonNullableKeys]);

  return !notNullKeys.some((pk) => {
    let val = row[pk];

    if (typeof val === 'string') {
      return !trim(val);
    }

    return !val;
  });
}
