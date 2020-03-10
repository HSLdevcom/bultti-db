CREATE SCHEMA IF NOT EXISTS bultti;
ALTER SCHEMA bultti OWNER TO postgres;

CREATE TABLE bultti.pre_inspection
(
    id               varchar not null
        constraint pre_inspection_pkey
            primary key,
    operator_id      varchar,
    season_id        varchar,
    start_date       date,
    end_date         date,
    production_start date,
    production_end   date,
    status           varchar not null,
    created_at       timestamp with time zone,
    created_by       varchar
);

ALTER TABLE bultti.pre_inspection
    OWNER TO postgres;

CREATE INDEX bultti_pre_inspection_operator ON bultti.pre_inspection (operator_id);
CREATE INDEX bultti_pre_inspection_season ON bultti.pre_inspection (season_id);
CREATE INDEX bultti_pre_inspection_season_operator ON bultti.pre_inspection (operator_id, season_id);
CREATE INDEX bultti_pre_inspection_production_start ON bultti.pre_inspection (production_start);
CREATE INDEX bultti_pre_inspection_operator_production_start ON bultti.pre_inspection (operator_id, production_start);

CREATE TABLE bultti.operating_unit
(
    id              varchar not null
        constraint operating_unit_pkey
            primary key,
    age_requirement numeric
);

ALTER TABLE bultti.operating_unit
    OWNER TO postgres;

CREATE TABLE bultti.execution_requirement
(
    id              varchar not null
        constraint execution_requirement_pkey
            primary key,
    week            numeric,
    year            varchar,
    equipment_class numeric,
    requirement     text,
    operator_id     varchar,
    area_id         numeric
);

ALTER TABLE bultti.operating_unit
    OWNER TO postgres;

CREATE TABLE bultti.equipment_catalogue
(
    id                varchar not null
        constraint equipment_catalogue_pkey
            primary key,
    operator_id       varchar,
    operating_unit_id varchar,
    start_date        date,
    end_date          date
);

ALTER TABLE bultti.equipment_catalogue
    OWNER TO postgres;

CREATE TABLE bultti.equipment_catalogue_equipment
(
    id                     varchar not null
        constraint equipment_catalogue_equipment_pkey
            primary key,
    equipment_catalogue_id varchar not null,
    equipment_id           varchar not null
);

CREATE TABLE bultti.equipment
(
    id               varchar not null
        constraint equipment_pkey
            primary key,
    operator_id      varchar,
    make             varchar,
    model            varchar,
    vehicle_id       varchar,
    registry_number  varchar,
    registry_date    date,
    type             varchar,
    exterior_color   varchar,
    emission_class   varchar,
    co2              double precision,
    percentage_quota numeric
);

ALTER TABLE bultti.equipment
    OWNER TO postgres;
