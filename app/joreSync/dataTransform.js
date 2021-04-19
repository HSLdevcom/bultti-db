import { mapValues, get, trim } from 'lodash';
import { parse } from 'date-fns';

export function transformInfKohde(row) {
  let { kohalkpvm, kohpaattpvm } = row;

  if (kohalkpvm) {
    row.kohalkpvm = parse(kohalkpvm, 'yyyyMMdd', new Date());
  }

  if (kohpaattpvm) {
    row.kohpaattpvm = parse(kohpaattpvm, 'yyyyMMdd', new Date());
  }

  return row;
}

export function transformAikatauluVp(row) {
  let { lavoimast, laviimvoi, ajotyyppi } = row;

  if (lavoimast) {
    row.lavoimast = parse(lavoimast, 'yyyyMMdd', new Date());
  }

  if (laviimvoi) {
    row.laviimvoi = parse(laviimvoi, 'yyyyMMdd', new Date());
  }

  // Set correct type. If ajotyyppi has no value, that means it is a normal departure,
  // marked as N.
  if (!ajotyyppi) {
    row.ajotyyppi = 'N';
  }

  return row;
}

function defaultRowTransform(row, columnSchema) {
  return mapValues(row, (val, key) => {
    let columnType = get(columnSchema, `${key}.type`, '');

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
  let transformed;

  switch (table) {
    case 'jr_inf_aikataulu_vp':
      transformed = transformAikatauluVp(row);
      break;
    case 'jr_inf_kohde':
      transformed = transformInfKohde(row);
      break;
    default:
      transformed = row;
      break;
  }

  return defaultRowTransform(transformed, columnSchema);
}
