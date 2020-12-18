// Define WHERE clauses for some large tables that would otherwise take forever.
// The minDate will be appended after the operator.
import { format, subYears } from 'date-fns';

// language=TSQL
let ajoneuvoQuery = `
  WITH distinct_kylkinro AS
   (
       SELECT *,
              -- This imitates DISTINCT ON from postgres.
              ROW_NUMBER() OVER(
                  PARTITION BY a.kylkinro, a.kontunnus
                  ORDER BY a.kylkinro, a.kontunnus, a.rekpvm DESC, a.voimast DESC, a.viimvoi DESC
              ) idx
       FROM dbo.jr_ajoneuvo a
       WHERE a.kylkinro IS NOT NULL
         AND a.reknro IS NOT NULL
         AND a.reknro NOT LIKE '%+%'
         AND a.reknro != ' '
         AND a.rekpvm IS NOT NULL
         AND a.kontunnus IS NOT NULL
         AND a.kaltyyppi IS NOT NULL
         AND a.kaltyyppi != 'KP'
         AND a.status IN ('1','2')
   )
  SELECT * FROM distinct_kylkinro a
  WHERE a.idx = 1
`;

let valipisteQuery = () => {
  let minDate = format(subYears(new Date(), 1), 'yyyy-MM-dd');
  // language=TSQL
  return `SELECT * FROM dbo.jr_valipisteaika WHERE lavoimast >= '${minDate}'`;
};

let customQueries = {
  jr_ajoneuvo: ajoneuvoQuery,
  jr_valipisteaika: valipisteQuery,
};

let createDefaultTableQuery = (tableName) => {
  return `SELECT * FROM dbo.${tableName}`;
};

export function createTableQuery(tableName) {
  if (customQueries[tableName]) {
    let customQuery = customQueries[tableName];
    return typeof customQuery === 'function' ? customQuery() : customQuery;
  }

  return createDefaultTableQuery(tableName);
}
