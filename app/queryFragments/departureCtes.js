// language=PostgreSQL
export let departureCtes = `
WITH route_stop AS (
    SELECT TRIM(link.reitunnus) reitunnus,
           link.suusuunta,
           link.lnkalkusolmu,
           link.reljarjnro,
           link.suuvoimast,
           dir.suuvoimviimpvm,
           link.ajantaspys,
           (row_number() OVER (
               PARTITION BY link.reitunnus, link.suusuunta, link.suuvoimast
               ORDER BY link.reljarjnro
               ))::integer stop_index
    FROM jore.jr_reitinlinkki link
             LEFT JOIN jore.jr_reitinsuunta dir ON link.reitunnus = dir.reitunnus
        AND link.suusuunta = dir.suusuunta
        AND link.suuvoimast = dir.suuvoimast
    WHERE relpysakki != 'E'
),
route_origin AS (
   SELECT *
   FROM route_stop
   WHERE reljarjnro = 1
)
`
