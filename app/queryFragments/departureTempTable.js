// language=PostgreSQL
import { departureCtes } from './departureCtes';

export let departureTempTable = `
DROP TABLE departure_union CASCADE;

CREATE TEMP TABLE IF NOT EXISTS departure_union (
    route_id varchar,
    direction smallint,
    stop_id varchar,
    origin_departure_time numeric(4,2),
    departure_time numeric(4,2),
    day_type varchar(2),
    date_begin date,
    is_next_day char,
    arrival_is_next_day char,
    arrival_time numeric (4,2),
    CONSTRAINT _departure_union_pk PRIMARY KEY(route_id, direction, origin_departure_time, day_type, date_begin, is_next_day, departure_time, stop_id)
);

CREATE INDEX route_index ON departure_union (route_id);
CREATE INDEX dir_index ON departure_union (direction);
CREATE INDEX stop_index ON departure_union (stop_id);
CREATE INDEX origin_time_index ON departure_union (origin_departure_time);
CREATE INDEX day_type_index ON departure_union (day_type);
CREATE INDEX date_index ON departure_union (date_begin);
CREATE INDEX next_day_index ON departure_union (is_next_day);
CREATE INDEX join_index ON departure_union (route_id, direction, origin_departure_time, day_type, date_begin, is_next_day);

${departureCtes}
INSERT INTO departure_union (
         (
             SELECT r.reitunnus route_id,
                    r.suusuunta direction,
                    r.lnkalkusolmu stop_id,
                    l.lhlahaik origin_departure_time,
                    l.lhlahaik departure_time,
                    l.lhpaivat day_type,
                    l.lavoimast date_begin,
                    l.lhvrkvht is_next_day,
                    l.lhvrkvht arrival_is_next_day,
                    l.lhlahaik arrival_time
             FROM route_origin r
                      LEFT JOIN jore.jr_lahto l on l.reitunnus = r.reitunnus
                 AND l.lhsuunta = r.suusuunta
                 AND l.lavoimast >= r.suuvoimast
                 AND l.lavoimast <= r.suuvoimviimpvm
             WHERE l.lavoimast >= :minDate
         )
         UNION ALL
         (
             SELECT vpa.reitunnus route_id,
                    vpa.lhsuunta  direction,
                    vpa.vastunnus stop_id,
                    vpa.lhlahaik  origin_departure_time,
                    vpa.vaslaika  departure_time,
                    vpa.lhpaivat  day_type,
                    vpa.lavoimast date_begin,
                    vpa.lhvrkvht  is_next_day,
                    vpa.vastvrkvht arrival_is_next_day,
                    vpa.vastaika arrival_time
             FROM jore.jr_valipisteaika vpa
             WHERE vpa.lavoimast >= :minDate
         )
     ) ON CONFLICT DO NOTHING;
`;
