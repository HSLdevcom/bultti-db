// language=PostgreSQL
import { departureCtes } from './departureCtes';

export let departuresQuery = `
${departureCtes}
SELECT TRIM(lah.reitunnus) route_id,
       lah.lhsuunta::smallint direction,
       lah.lhpaivat day_type,
       lah.lhlahaik::varchar origin_departure_time,
       route.lnkalkusolmu origin_stop_id,
       (ROW_NUMBER() over (
           PARTITION BY lah.reitunnus, lah.lhsuunta, lah.lhpaivat, lah.lavoimast, departure.stop_id
           ORDER BY departure.departure_time
       ))::integer departure_id,
       COALESCE(NULLIF(TRIM(lah.lhajotyyppi), ''), 'N') extra_departure,
       COALESCE(lah.lhkaltyyppi, 'ET') equipment_type,
       lah.kohtunnus procurement_unit_id,
       lah.termaika::smallint terminal_time,
       lah.elpymisaika::smallint recovery_time,
       COALESCE(lah.pakollkaltyyppi::smallint, 0) equipment_required,
       lah.junanumero train_number,
       COALESCE(aik.lavoimast, lah.lavoimast) date_begin,
       aik.laviimvoi date_end,
       COALESCE(departure.stop_id, route.lnkalkusolmu) stop_id,
       COALESCE(stop.ajantaspys, '0') is_timing_stop,
       COALESCE(stop.stop_index, 1) stop_index,
       COALESCE(departure.departure_time::varchar, departure.origin_departure_time::varchar) departure_time,
       COALESCE(departure.arrival_time::varchar, departure.origin_departure_time::varchar) arrival_time,
       COALESCE(departure.is_next_day::smallint, lah.lhvrkvht::smallint, 0) is_next_day,
       COALESCE(departure.arrival_is_next_day::smallint, lah.lhvrkvht::smallint, 0) arrival_is_next_day,
       kk.liitunnus operator_id,
       COALESCE(lv.kookoodi, '0') trunk_color_required,
       aik.laviimpvm date_modified
FROM route_origin route
     LEFT JOIN jore.jr_lahto lah on lah.reitunnus = route.reitunnus
                                AND lah.lhsuunta = route.suusuunta
                                AND lah.lavoimast >= route.suuvoimast
                                AND lah.lavoimast <= route.suuvoimviimpvm
    LEFT JOIN departure_union departure ON lah.reitunnus = departure.route_id
            AND lah.lhsuunta = departure.direction
            AND lah.lhlahaik = departure.origin_departure_time
            AND lah.lhpaivat = departure.day_type
            AND lah.lavoimast = departure.date_begin
            AND lah.lhvrkvht = departure.is_next_day
    LEFT JOIN route_stop stop ON lah.reitunnus = stop.reitunnus
                            AND lah.lhsuunta = stop.suusuunta
                            AND route.suuvoimast = stop.suuvoimast
                            AND route.suuvoimviimpvm = stop.suuvoimviimpvm
                            AND departure.stop_id = stop.lnkalkusolmu
    LEFT JOIN jore.jr_aikataulu aik on lah.lavoimast = aik.lavoimast
                                    and lah.reitunnus = aik.reitunnus
    LEFT JOIN jore.jr_kilpailukohd kk on lah.kohtunnus = kk.kohtunnus
    LEFT JOIN jore.jr_linja_vaatimus lv on lah.reitunnus = lv.lintunnus
WHERE lah.lavoimast >= :minDate
`;
