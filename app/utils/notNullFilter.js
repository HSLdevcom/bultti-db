// Ensure primary key columns are not null
import { trim, uniq, get } from 'lodash';

export function createNotNullFilter(constraint, columnSchema) {
  let nonNullableKeys = Object.entries(columnSchema || {})
    .filter(([, schema]) => schema.nullable === false)
    .map(([key]) => key);

  let notNullKeys = uniq([...get(constraint, 'keys', []), ...nonNullableKeys]);

  if (notNullKeys.length === 0) {
    return () => true;
  }

  return (row) => {
    return notNullKeys.every((pk) => {
      let val = row[pk];

      if (typeof val === 'string') {
        val = trim(val);
      }

      // All numbers are valid, but 0 will evaluate to false. Set val to 1 to avoid this.
      if (typeof val === 'number') {
        if(isNaN(val)) {
          return false
        }
        
        val = 1;
      }

      return val !== null && typeof val !== 'undefined' && val !== ''
    });
  };
}
