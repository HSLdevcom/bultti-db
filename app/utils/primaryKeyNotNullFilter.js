// Ensure primary key columns are not null
import { trim } from 'lodash';

export function primaryKeyNotNullFilter(row, constraint) {
  if (!constraint || constraint.keys.length === 0) {
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
