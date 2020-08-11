// Include only rows that are active after 2019
import { parseISO, isValid, isAfter } from 'date-fns';

let cutoffDate = parseISO('2019-01-01');
let maxEndDate = parseISO('2049');

// Cols that should be used to check the cutoff date against for each row.
// JORE tables have multiple names for the in effect date cols, but all
// date-type cols should not be considered.
let dateCols = [
  'akalkpvm',
  'akpaattpvm',
  'kaavoimast',
  'kaaviimvoi',
  'lavoimast',
  'laviimvoi',
  'kohalkpvm',
  'kohpaattpvm',
  'suuvoimast',
  'suuviimvoi',
  'lnkviimpvm',
  'relviimpvm',
  'suuvoimviimpvm',
];

// Tables that should not have rows checked against the cutoff date.
let ignoreCutoffForTables = [
  'jr_ajoneuvo',
  'ak_kalusto',
  'jr_eritpvkalent',
  'jr_kinf_kalusto',
  'jr_liikennoitsija',
  'jr_konserni',
  'ak_kaavion_suoritteet',
  'ak_kaavion_lahto',
  'ak_kaavio',
];

// Filter function to only include rows that are active after the cutoff date.
// Rows where no date columns are found are included by default.
export function dateCutoffFilter(row, tableName) {
  if (ignoreCutoffForTables.includes(tableName)) {
    return true;
  }

  let hasDateCols = false;

  for (let col of dateCols) {
    let dateVal = row[col];

    if (dateVal && dateVal instanceof Date && isValid(dateVal)) {
      // Some end dates are far in the future and not relevant for this check.
      if (col.includes('viim') && isAfter(dateVal, maxEndDate)) {
        continue;
      }

      hasDateCols = true;

      // Only one of the date cols need to be within the range we are looking for.
      if (isAfter(dateVal, cutoffDate)) {
        return true;
      }
    }
  }

  // If we got here and hasDateCols is true, that means date values were checked
  // but they were all under the cutoff for this row.
  return !hasDateCols;
}
