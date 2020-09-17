export let departuresUnionQuery = `
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
               ))::integer      stop_index
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
(
  (
     SELECT r.reitunnus    route_id,
            r.suusuunta    direction,
            r.lnkalkusolmu stop_id,
            r.lnkalkusolmu origin_stop_id,
            r.stop_index   stop_index,
            '0'            is_timing_stop,
            l.lhlahaik     origin_departure_time,
            l.lhlahaik     departure_time,
            l.lhpaivat     day_type,
            l.lavoimast    date_begin,
            l.lhvrkvht     is_next_day,
            l.lhvrkvht     arrival_is_next_day,
            l.lhlahaik     arrival_time
     FROM route_origin r
              LEFT JOIN jore.jr_lahto l ON l.reitunnus = r.reitunnus
         AND l.lhsuunta = r.suusuunta
         AND l.lavoimast >= r.suuvoimast
         AND l.lavoimast <= r.suuvoimviimpvm
  )
  UNION ALL
  (
     SELECT vpa.reitunnus               route_id,
            vpa.lhsuunta                direction,
            vpa.vastunnus               stop_id,
            o.lnkalkusolmu              origin_stop_id,
            r.stop_index                stop_index,
            COALESCE(r.ajantaspys, '0') is_timing_stop,
            vpa.lhlahaik                origin_departure_time,
            vpa.vaslaika                departure_time,
            vpa.lhpaivat                day_type,
            vpa.lavoimast               date_begin,
            vpa.lhvrkvht                is_next_day,
            vpa.vastvrkvht              arrival_is_next_day,
            vpa.vastaika                arrival_time
     FROM jore.jr_valipisteaika vpa
              LEFT JOIN route_stop r ON vpa.reitunnus = r.reitunnus
         AND vpa.lhsuunta = r.suusuunta
         AND vpa.vastunnus = r.lnkalkusolmu
         AND vpa.lavoimast >= r.suuvoimast
         AND vpa.lavoimast <= r.suuvoimviimpvm
              LEFT JOIN route_origin o ON r.reitunnus = o.reitunnus
         AND r.suusuunta = o.suusuunta
         AND r.suuvoimast = o.suuvoimast
         AND r.suuvoimviimpvm = o.suuvoimviimpvm
  )
)
`
