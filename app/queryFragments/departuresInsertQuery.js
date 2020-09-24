// language=PostgreSQL
export const departuresInsertQuery = `
BEGIN;

alter table :schema:.departure set unlogged;

-- alter table :schema:.departure drop constraint departure_pkey;

drop index if exists :schema:.departure_stop_id_index;
drop index if exists :schema:.departure_route_id_index;
drop index if exists :schema:.departure_day_type_index;
drop index if exists :schema:.departure_date_begin_index;
drop index if exists :schema:.departure_route_id_direction_stop_id_idx;
drop index if exists :schema:.departure_stop_id_day_type;
drop index if exists :schema:.departure_origin_time_index;
drop index if exists :schema:.departure_departure_id_index;
drop index if exists :schema:.departure_origin_index;

INSERT INTO :schema:.departure (stop_id, origin_stop_id, route_id, direction,
                            day_type, departure_id, is_next_day, hours,
                            minutes, origin_hours, origin_minutes,
                            arrival_is_next_day, arrival_hours, arrival_minutes,
                            date_begin, date_end, extra_departure, terminal_time,
                            recovery_time, equipment_type,
                            equipment_required, procurement_unit_id, operator_id,
                            available_operators,
                            trunk_color_required, train_number, date_modified,
                            is_timing_stop, stop_index)
WITH route_stop AS (
    SELECT
        TRIM(dir.reitunnus) reitunnus,
        dir.suusuunta,
        link.link_stop_id,
        link.reljarjnro,
        dir.suuvoimast,
        dir.suuvoimviimpvm,
        link.ajantaspys,
        (row_number() OVER (
            PARTITION BY link.reitunnus, link.suusuunta, link.suuvoimast
            ORDER BY link.reljarjnro
            ))::integer      stop_index
        FROM :schema:.jr_reitinsuunta dir
             LEFT JOIN LATERAL (
            SELECT DISTINCT ON (inner_link.reitunnus, inner_link.suusuunta, inner_link.suuvoimast)
                lnkloppusolmu
                FROM :schema:.jr_reitinlinkki inner_link
                WHERE inner_link.relpysakki != 'E'
                  AND dir.reitunnus = reitunnus
                  AND dir.suusuunta = suusuunta
                  AND dir.suuvoimast = suuvoimast
                ORDER BY inner_link.reitunnus, inner_link.suusuunta, inner_link.suuvoimast, inner_link.reljarjnro DESC
                LIMIT 1
            ) dest_link ON true
             LEFT JOIN LATERAL (
            (
                SELECT
                    route_link.reitunnus,
                    route_link.suusuunta,
                    route_link.suuvoimast,
                    route_link.reljarjnro,
                    route_link.ajantaspys,
                    FALSE                   is_last,
                    route_link.lnkalkusolmu link_stop_id
                    FROM :schema:.jr_reitinlinkki route_link
                    WHERE route_link.relpysakki != 'E'
                      AND dir.reitunnus = route_link.reitunnus
                      AND dir.suusuunta = route_link.suusuunta
                      AND dir.suuvoimast = route_link.suuvoimast
            )
            UNION
            (
                SELECT
                    last_link.reitunnus,
                    last_link.suusuunta,
                    last_link.suuvoimast,
                    CASE
                        WHEN last_link.lnkloppusolmu = dest_link.lnkloppusolmu
                            THEN (last_link.reljarjnro + 1)
                        ELSE last_link.reljarjnro
                        END reljarjnro,
                    0       ajantaspys,
                    CASE
                        WHEN last_link.lnkloppusolmu = dest_link.lnkloppusolmu
                            THEN TRUE
                        ELSE FALSE
                        END is_last,
                    CASE
                        WHEN last_link.lnkloppusolmu = dest_link.lnkloppusolmu
                            THEN last_link.lnkloppusolmu
                        ELSE last_link.lnkalkusolmu
                        END link_stop_id
                    FROM :schema:.jr_reitinlinkki last_link
                    WHERE last_link.relpysakki != 'E'
                      AND dir.reitunnus = last_link.reitunnus
                      AND dir.suusuunta = last_link.suusuunta
                      AND dir.suuvoimast = last_link.suuvoimast
                      AND last_link.lnkloppusolmu = dest_link.lnkloppusolmu
            )
            ) link ON true
),
     route_origin AS (
         SELECT *
             FROM route_stop
             WHERE reljarjnro = 1
     ),
     departures_union AS (
         (
             SELECT
                 r.reitunnus      route_id,
                 r.suusuunta      direction,
                 r.link_stop_id   stop_id,
                 r.link_stop_id   origin_stop_id,
                 r.stop_index     stop_index,
                 '0'              is_timing_stop,
                 l.lhlahaik       origin_departure_time,
                 l.lhlahaik       departure_time,
                 l.lhpaivat       day_type,
                 l.lavoimast      date_begin,
                 r.suuvoimviimpvm date_end,
                 l.lhvrkvht       is_next_day,
                 l.lhvrkvht       arrival_is_next_day,
                 l.lhlahaik       arrival_time
                 FROM route_origin r
                      INNER JOIN :schema:.jr_lahto l
                                 ON l.reitunnus = r.reitunnus
                                     AND l.lhsuunta = r.suusuunta
                                     AND l.lavoimast >= r.suuvoimast
                                     AND l.lavoimast <= r.suuvoimviimpvm
         )
         UNION
         (
             SELECT
                 vpa.reitunnus               route_id,
                 vpa.lhsuunta                direction,
                 vpa.vastunnus               stop_id,
                 o.link_stop_id              origin_stop_id,
                 r.stop_index                stop_index,
                 COALESCE(r.ajantaspys, '0') is_timing_stop,
                 vpa.lhlahaik                origin_departure_time,
                 vpa.vaslaika                departure_time,
                 vpa.lhpaivat                day_type,
                 vpa.lavoimast               date_begin,
                 r.suuvoimviimpvm            date_end,
                 vpa.lhvrkvht                is_next_day,
                 vpa.vastvrkvht              arrival_is_next_day,
                 vpa.vastaika                arrival_time
                 FROM :schema:.jr_valipisteaika vpa
                      INNER JOIN route_stop r
                                 ON vpa.reitunnus = r.reitunnus
                                     AND vpa.lhsuunta = r.suusuunta
                                     AND vpa.vastunnus = r.link_stop_id
                                     AND vpa.lavoimast >= r.suuvoimast
                                     AND vpa.lavoimast <= r.suuvoimviimpvm
                      INNER JOIN route_origin o
                                 ON r.reitunnus = o.reitunnus
                                     AND r.suusuunta = o.suusuunta
                                     AND r.suuvoimast = o.suuvoimast
                                     AND r.suuvoimviimpvm = o.suuvoimviimpvm
         )
     )
SELECT
    departure.stop_id                                stop_id,
    departure.origin_stop_id                         origin_stop_id,
    departure.route_id                               route_id,
    departure.direction::smallint                    direction,
    COALESCE(departure.day_type, lah.lhpaivat)       day_type,
    (ROW_NUMBER() over (
        PARTITION BY lah.reitunnus, lah.lhsuunta, lah.lhpaivat, lah.lavoimast, departure.stop_id
        ORDER BY departure.departure_time
        ))::integer                                  departure_id,
    COALESCE(departure.is_next_day::smallint, lah.lhvrkvht::smallint, 0) =
    1                                                is_next_day,
    SPLIT_PART(COALESCE(departure.departure_time::varchar, departure.origin_departure_time::varchar, '0.0'), '.',
               1)::smallint                          hours,
    SPLIT_PART(COALESCE(departure.departure_time::varchar, departure.origin_departure_time::varchar, '0.0'), '.',
               2)::smallint                          minutes,
    SPLIT_PART(COALESCE(departure.origin_departure_time::varchar, lah.lhlahaik::varchar, '0.0'), '.',
               1)::smallint                          origin_hours,
    SPLIT_PART(COALESCE(departure.origin_departure_time::varchar, lah.lhlahaik::varchar, '0.0'), '.',
               2)::smallint                          origin_minutes,
    COALESCE(departure.arrival_is_next_day::smallint, lah.lhvrkvht::smallint, 0) =
    1                                                arrival_is_next_day,
    SPLIT_PART(
            COALESCE(departure.arrival_time::varchar, departure.origin_departure_time::varchar, '0.0'),
            '.',
            1
        )::smallint                                  arrival_hours,
    SPLIT_PART(
            COALESCE(departure.arrival_time::varchar, departure.origin_departure_time::varchar, '0.0'),
            '.',
            2
        )::smallint                                  arrival_minutes,
    aik.lavoimast                                    date_begin,
    aik.laviimvoi                                    date_end,
    COALESCE(NULLIF(TRIM(lah.lhajotyyppi), ''), 'N') extra_departure,
    lah.termaika::smallint                           terminal_time,
    lah.elpymisaika::smallint                        recovery_time,
    COALESCE(lah.lhkaltyyppi, 'ET')                  equipment_type,
    COALESCE(lah.pakollkaltyyppi::smallint, 0) = 1   equipment_required,
    lah.kohtunnus                                    procurement_unit_id,
    kk.liitunnus                                     operator_id,
    NULL                                             available_operators, --WIP
    COALESCE(lv.kookoodi, '0') = '2'                 trunk_color_required,
    lah.junanumero                                   train_number,
    aik.laviimpvm                                    date_modified,
    COALESCE(departure.is_timing_stop, '0') != '0'   is_timing_stop,
    COALESCE(departure.stop_index, 1)                stop_index
    FROM departures_union departure
         INNER JOIN :schema:.jr_aikataulu aik
                    on departure.date_begin = aik.lavoimast
                        and departure.route_id = aik.reitunnus
         INNER JOIN :schema:.jr_lahto lah
                    on lah.reitunnus = departure.route_id
                        AND lah.lhsuunta = departure.direction
                        AND lah.lavoimast = departure.date_begin
                        AND lah.lhlahaik = departure.origin_departure_time
         LEFT JOIN :schema:.jr_kilpailukohd kk
                   on lah.kohtunnus = kk.kohtunnus
         LEFT JOIN :schema:.jr_linja_vaatimus lv
                   on departure.route_id = lv.lintunnus
  ON CONFLICT DO NOTHING;

-- alter table :schema:.departure add constraint departure_pkey primary key (stop_id, origin_stop_id, route_id, direction, date_begin, date_end, hours, minutes, is_next_day, day_type, origin_hours, origin_minutes, extra_departure);

alter table :schema:.departure set logged;

COMMIT;
-- Enable indices separately!
`;
