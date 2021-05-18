create table public.import_status
(
    id serial not null
        constraint import_status_pk
            primary key,
    timestamp timestamp with time zone,
    event_type varchar,
    message text
);
