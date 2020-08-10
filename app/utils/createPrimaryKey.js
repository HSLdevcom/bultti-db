import { isDate, toString } from 'lodash';
import { formatISO } from 'date-fns';

export function createPrimaryKey(item, keys = []) {
  const keysLength = keys.length;
  let key = '';

  for (let i = 0; i < keysLength; i++) {
    let val = item[keys[i]];

    if (isDate(val)) {
      val = formatISO(val);
    } else if(typeof val === 'object') {
      val = JSON.stringify(val)
    }

    key += toString(val);
  }

  return key;
}
