// Ensure primary key columns are not null
import { trim } from 'lodash';

export function notNullFilter(row, constraint, columnSchema) {
  if ((!constraint || constraint.keys.length === 0) && !columnSchema) {
    return true;
  }

  let primaryKeys = constraint.keys;
  
  return !primaryKeys.some((pk) => {
    let val = row[pk]
    
    if(typeof val === 'string') {
      return !trim(val);
    }
    
    return !val
  });
}
