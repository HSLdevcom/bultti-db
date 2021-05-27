// Define WHERE clauses for some large tables that would otherwise take forever.
// The minDate will be appended after the operator.
import { format, subYears, subMonths, startOfMonth } from 'date-fns';

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
  WHERE a.idx = 1;
`;

// Check queries are interpolated into WHERE clauses of other queries.
// They should return only the relevant field for the WHERE check.

// language=TSQL
let operatorCheckQuery = `
SELECT jr_liikennoitsija.liitunnus
FROM dbo.jr_liikennoitsija
WHERE status = '1'
  AND liityyppi = '1'
  AND liiptilinro IS NOT NULL
  AND lijliikennoitsija IS NOT NULL
`;

// language=TSQL
let unitCheckQuery = `
SELECT jr_kilpailukohd.kohtunnus
FROM dbo.jr_kilpailukohd
WHERE liitunnus IN (
  ${operatorCheckQuery}
)
`;

// language=TSQL
let kaavioCheckQuery = (minDate) => `
SELECT ak_kaavio.kaaid
FROM dbo.ak_kaavio
WHERE kaavoimast >= '${minDate}'
AND kohtunnus IN (
  ${unitCheckQuery}
)
`;

// The next queries are full queries that will be executed.

let valipisteQuery = () => {
  let minDate = format(subMonths(startOfMonth(new Date()), 8), 'yyyy-MM-dd');
  // language=TSQL
  return `
SELECT *
FROM dbo.jr_valipisteaika
WHERE jr_valipisteaika.reitunnus IN (
    SELECT ak_kaavion_lahto.reitunnus
    FROM dbo.ak_kaavion_lahto
    WHERE ak_kaavion_lahto.kaaid IN (
      ${kaavioCheckQuery(minDate)}
    )
  )
;`;
};

let kaavioQuery = () => {
  let minDate = format(subMonths(startOfMonth(new Date()), 12), 'yyyy-MM-dd');
  // language=TSQL
  return `
SELECT *
FROM dbo.ak_kaavio
WHERE ak_kaavio.kaavoimast >= '${minDate}'
  AND ak_kaavio.kohtunnus IN (
    ${unitCheckQuery}
  )`;
};

let kaavionLahtoQuery = () => {
  let minDate = format(subMonths(startOfMonth(new Date()), 12), 'yyyy-MM-dd');
  // language=TSQL
  return `
SELECT *
FROM dbo.ak_kaavion_lahto
WHERE ak_kaavion_lahto.kaaid IN (
  ${kaavioCheckQuery(minDate)}
)`;
};

let kaavionSuoritteetQuery = () => {
  let minDate = format(subMonths(startOfMonth(new Date()), 12), 'yyyy-MM-dd');
  // language=TSQL
  return `
SELECT *
FROM dbo.ak_kaavion_suoritteet
WHERE ak_kaavion_suoritteet.kaaid IN (
    ${kaavioCheckQuery(minDate)}
)`;
};

let reitinLinkkiQuery = () => {
  let minDate = format(subYears(startOfMonth(new Date()), 1), 'yyyy-MM-dd');
  // language=TSQL
  return `
SELECT *
FROM dbo.jr_reitinlinkki
WHERE jr_reitinlinkki.suuvoimast >= '${minDate}'`;
};

let liikennoitsijaQuery =
  // language=TSQL
  () => `
SELECT *
FROM dbo.jr_liikennoitsija
WHERE status = '1'
  AND liityyppi = '1'
  AND liiptilinro IS NOT NULL
  AND lijliikennoitsija IS NOT NULL
`;

// Collect custom queries in a map
let customQueries = {
  jr_ajoneuvo: ajoneuvoQuery,
  jr_valipisteaika: valipisteQuery,
  ak_kaavio: kaavioQuery,
  ak_kaavion_suoritteet: kaavionSuoritteetQuery,
  ak_kaavion_lahto: kaavionLahtoQuery,
  jr_reitinlinkki: reitinLinkkiQuery,
  jr_liikennoitsija: liikennoitsijaQuery,
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
