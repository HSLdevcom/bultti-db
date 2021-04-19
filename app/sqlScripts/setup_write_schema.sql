CREATE EXTENSION IF NOT EXISTS postgis;

create schema if not exists _jore_import;
alter schema _jore_import owner to CURRENT_USER;
GRANT ALL ON SCHEMA _jore_import TO CURRENT_USER;
