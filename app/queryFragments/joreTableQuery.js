// Define WHERE clauses for some large tables that would otherwise take forever.
// The minDate will be appended after the operator.
import { format, subYears } from 'date-fns';

let ajoneuvoCols = `
id,
status,
liitunnus,
reknro,
kaltyyppi,
kalluokka,
ulkoilme,
alustavalmist,
alustamalli,
korivalmist,
korimalli,
pituus,
korkeus,
polttoaine,
hybridi,
oviratkaisu,
rekpvm,
kayttpvm,
voimast,
viimvoi,
istumapaikat,
noxpaastot,
pmpaastot,
co2paastot,
pakokaasupuhd,
turvateli,
niiaustoiminto,
kontunnus,
lijlaitteet,
yliikaisyys
`;

// language=TSQL
let ajoneuvoQuery = `
  WITH distinct_kylkinro AS
   (
       SELECT ${ajoneuvoCols},
              REPLACE(LTRIM(REPLACE(kylkinro,'0',' ')),' ','0') kylkinro,
              NULLIF(LTRIM(RTRIM(paastoluokka)), '') paastoluokka,
              -- This imitates DISTINCT ON from postgres.
              ROW_NUMBER() OVER(
                  PARTITION BY a.kylkinro, a.kontunnus
                  ORDER BY a.kylkinro, a.kontunnus, a.rekpvm DESC, a.voimast DESC, a.viimvoi DESC
              ) idx
       FROM dbo.jr_ajoneuvo a
       WHERE a.kylkinro IS NOT NULL
         AND a.reknro IS NOT NULL
         AND a.reknro NOT LIKE '%+%'
         -- Trim down to an empty string if only whitespace and skip if so
         AND NULLIF(LTRIM(RTRIM(a.reknro)), '') IS NOT NULL
         AND a.rekpvm IS NOT NULL
         AND a.paastoluokka IS NOT NULL
         -- Trim down to an empty string if only whitespace and skip if so
         AND NULLIF(LTRIM(RTRIM(a.paastoluokka)), '') IS NOT NULL
         AND a.kontunnus IS NOT NULL
         AND a.kaltyyppi IS NOT NULL
         AND a.kaltyyppi != 'KP'
         AND a.status IN ('1','2')
   )
  SELECT ${ajoneuvoCols},
         kylkinro,
         paastoluokka
  FROM distinct_kylkinro a
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
