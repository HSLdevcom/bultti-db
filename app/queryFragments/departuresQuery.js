// language=PostgreSQL
export let departuresQuery = `
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
  ),
  departures_union AS (
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
SELECT departure.route_id                                                                    route_id,
         departure.direction::smallint                                                         direction,
         departure.day_type                                                                    day_type,
         departure.origin_departure_time::varchar                                              origin_departure_time,
         departure.origin_stop_id                                                              origin_stop_id,
         (ROW_NUMBER() over (
             PARTITION BY lah.reitunnus, lah.lhsuunta, lah.lhpaivat, lah.lavoimast, departure.stop_id
             ORDER BY departure.departure_time
         ))::integer                                                                           departure_id,
         COALESCE(NULLIF(TRIM(lah.lhajotyyppi), ''), 'N')                                      extra_departure,
         COALESCE(lah.lhkaltyyppi, 'ET')                                                       equipment_type,
         lah.kohtunnus                                                                         procurement_unit_id,
         lah.termaika::smallint                                                                terminal_time,
         lah.elpymisaika::smallint                                                             recovery_time,
         COALESCE(lah.pakollkaltyyppi::smallint, 0)                                            equipment_required,
         lah.junanumero                                                                        train_number,
         COALESCE(aik.lavoimast, lah.lavoimast)                                                date_begin,
         aik.laviimvoi                                                                         date_end,
         departure.stop_id                                                                     stop_id,
         COALESCE(departure.is_timing_stop, '0')                                               is_timing_stop,
         COALESCE(departure.stop_index, 1)                                                     stop_index,
         COALESCE(departure.departure_time::varchar, departure.origin_departure_time::varchar) departure_time,
         COALESCE(departure.arrival_time::varchar, departure.origin_departure_time::varchar)   arrival_time,
         COALESCE(departure.is_next_day::smallint, lah.lhvrkvht::smallint, 0)                  is_next_day,
         COALESCE(departure.arrival_is_next_day::smallint, lah.lhvrkvht::smallint, 0)          arrival_is_next_day,
         kk.liitunnus                                                                          operator_id,
         COALESCE(lv.kookoodi, '0')                                                            trunk_color_required,
         aik.laviimpvm                                                                         date_modified
FROM departures_union departure
     LEFT JOIN jore.jr_aikataulu aik on departure.date_begin = aik.lavoimast
        AND departure.route_id = aik.reitunnus
     LEFT JOIN jore.jr_lahto lah on lah.reitunnus = departure.route_id
        AND lah.lhsuunta = departure.direction
        AND lah.lavoimast = departure.date_begin
        AND lah.lhlahaik = departure.origin_departure_time
     LEFT JOIN jore.jr_kilpailukohd kk on lah.kohtunnus = kk.kohtunnus
     LEFT JOIN jore.jr_linja_vaatimus lv on departure.route_id = lv.lintunnus;
`;
