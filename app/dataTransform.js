import { mapValues, get, trim } from 'lodash';
import { parse } from 'date-fns';

export function transformAikatauluVp(row) {
  let { lavoimast, laviimvoi } = row;

  if (lavoimast) {
    row.lavoimast = parse(lavoimast, 'yyyyMMdd', new Date());
  }

  if (laviimvoi) {
    row.laviimvoi = parse(laviimvoi, 'yyyyMMdd', new Date());
  }

  return row;
}

function defaultRowTransform(row, columnSchema) {
  return mapValues(row, (val, key) => {
    let columnType = get(columnSchema, `${key}.type`);

    if (columnType === 'boolean' && typeof val !== 'boolean') {
      let baseVal = val;

      if (typeof val === 'string') {
        baseVal = trim(val);
      } else if (typeof val === 'number') {
        baseVal = baseVal > 0;
      }

      return !!baseVal;
    }

    if (columnType.includes('char')) {
      let trimmedVal = trim(val);

      if (!trimmedVal) {
        return null;
      }

      return trimmedVal;
    }

    if (columnType === 'numeric' && typeof val === 'string') {
      let parsed = val.includes('.') ? parseFloat(val) : parseInt(val, 10);

      if (isNaN(parsed)) {
        return null;
      }

      return parsed;
    }

    return val;
  });
}

// Some tables need special handling. If the table has a transform defined,
// run the transform on the row. Then run default transform on all rows.
export function transformRow(row, table, columnSchema) {
  switch (table) {
    case 'jr_inf_aikataulu_vp':
      var transformed = transformAikatauluVp(row);
      break;
    default:
      var transformed = row;
      break;
  }

  return defaultRowTransform(transformed, columnSchema);
}