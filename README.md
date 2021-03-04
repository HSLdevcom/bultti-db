# Bultti DB

This is the database for the Bultti project. It replicates select tables from HSL's main JORE database for usage in Bultti and Reittiloki.

The actual database is a PostgreSQL database which can be spun up with Docker, so this repo does not actually include a "database" per se. This project is about _syncing_ the required data from JORE to the Bultti database.

## Setup and start

### The Postgres database

You need to have a database running to sync data into. The Bultti project has one running in the cloud for each environment, but for local development setting one up with Docker is the easiest.

The database requires a data directory if you want the data to be persisted. Create an empty directory somewhere convenient for you, then give that path to the command below.

Start a Postgres (with Postgis) database with Docker:

```shell script
docker run -p 5432:5432 -v /path/to/postgres/data/directory:/var/lib/postgresql/data --env POSTGRES_PASSWORD=password --name bultti-db postgis/postgis:12-master
```

### The JORE connection

The JORE database is the source, so the app needs access to it. It is heavily firewalled, but the Bultti vnet has access to it. For local development, the best solution is to open an SSH tunnel and connecting through that.

Ensure that your SSH key signed by the Bultti CA before running SSH commands. Also set up your SSH config to connect directly to private IP's through Bultti's Bastion server.

Open an SSH tunnel to the JORE test environment:

```shell script
ssh -L 1433:10.218.6.14:56239 10.223.27.5
```

When the tunnel is open, the JORE database will be available at port 1433. JORE is a Microsoft SQL Server 2012 database.

### Configure environment

Copy the `.env.production` file into `.env` for your own usage and modify as needed. The default Postgres connection parameters should work with a local Postgres server, but you need to configure the MSSQL connection. The Bultti team can provide these details.

Change the `ENVIRONMENT` env var to `local`.

Note that the sync runs on a schedule, every day at midnight by default, which can be disabled by setting the `TASK_SCHEDULE` env var to an empty value.

### Run the app

Now you're all set to run the app!

First install the dependencies (`yarn`), then run `yarn start` to start the app.

## Usage

The app has a simple control interface available at `localhost:8001` when the server is running. The functions are described below.

### Run import

The main function of this app is to sync data from JORE to the Bultti DB. The `Run import` function does exactly that, and activating it will start the full sync process.

The sync has a few distinct phases, the main being syncing the required tables from JORE to Bultti. It also creates special `departures` and `route_geometry` tables for the Reittiloki project. The departures table is very time-consuming to create and is not needed for Bultti, so use the `Run import (without departures)` whenever possible.

The sync process (without departures) usually takes about 2 hours depending on your hardware. The main sync always creates a separate Postgres schema where the data is imported, and switches the schema to be read from when done. This allows all clients to keep using the database while a sync is in progress. Read more about how the sync works below.

Note that a new sync cannot be started when a sync is in progress.

### Create geometry table

Create the route geometry table for Reittiloki separately from the main sync with this function. This process doesn't take a very long time. The route geometry rows are created from tables in Postgres, NOT JORE, and thus does not require an MSSQL connection. It does require the Postgres database to be populated.

Note that running this function creates the `route_geometry` table directly in the read schema. The table should exist and be empty in the target schema.

### Create departures table

Create the `departures` table for Reittiloki separately from the main sync with this function. The departure rows are created from tables in Postgres, NOT JORE, and thus does not require an MSSQL connection. It does require the Postgres database to be populated.

Creating the departures table can take a very long time, usually around 4 hours. Running this function creates the `departures` table directly in the read schema. The table should exist in the target schema, but it is not required to be empty.

### Switch write schema to read

The main sync creates a new Postgres schema, the "Write schema", prior to importing data. The main schema that clients read from is the "Read Schema". When the import completes successfully, the Read Schema is dropped and the Write Schema is renamed to the Read Schema name. If the import fails or is cancelled, the switch can be done with this function if you deem the already imported data to be enough.

## How it works

### The main sync

"The main sync" is the process of copying the listed tabled from MSSQL (Jore) to Postgres (Bultti). The tables are listed in the `tables.lst` file in the root of this project.

The tables list is a simple text file, with the name of one table per row. Rows that start with whitespace or the `#` character are skipped. The biggest tables are listed first so that they can get a head start in the import.

Before importing, a Write Schema is created. This is where everything is imported, which allows the Read Schema to continue serving clients while the sync is in progress. The Write Schema is called `_jore_import` and the Read Schema is called simply `jore`.

The import itself is started from the `syncSourceToDestination()` function in `sync.js`. It uses a queue with concurrency, so many tables can be imported simultaneously. It reads each row of the tables list and starts the import process.

When all the listed tables are imported, the departures and route geometry tables are created based on the imported data, also written into the Write Schema. Then, if it all went well, the Read Schema is dropped and the Write Schema is renamed to the name of the Read Schema, ie `jore`.

Syncing a table from JORE (MSSQL) is just a matter of doing a `SELECT` query for all rows against the table. The results are then returned as a stream and collected into batches. Once a batch is full, the stream is paused while the batch of rows are written into the matching Postgres table.

Reading the stream is done in `utils/syncStream.js` and each chunk insert is also queued with concurrency. The rows from the stream are collected in a `WeakMap` which helps with memory consumption and prevents memory leaks.

Writing into Postgres is performed using an "upsert", which inserts the row if the row (identified with the primary key) does not already exist, and updates the row if it does. The module that does this is `utils/upsert.js`, but most of that is about formulating the insert query and making sure that the number of bindings does not exceed the limit. The upsert functionality itself is a Postgres thing.

Before starting the sync, it checks that a sync is not already in progress. If not, the sync is started.

### Departures

The departures table is created wholly with Postgres statements, as opposed to the sync which uses Javascript for some parts of the process. The departures are queried from a few of the imported tables in Postgres, and inserted into the `departures` table. That means that an MSSQL connection is not needed, but the schema should already contain fully imported tables from the main sync. This solution as chosen as reading the departures rows from JORE proved to be too heavy for that database, and blocked other users.

Bultti itself does not use the departures table at the moment, so it exists only for Reittiloki which also uses this database as its JORE backend.

### Route geometry

The route geometry import process also queries imported Postgres tables and not MSSQL tables. The route geometry table contains route lines which are composed from points. The main query fetches the points from the imported JORE data and the rest of the function groups it into route geometry rows. The Line geometry itself is created with Postgis from the points in the group.

Bultti itself does not use the route_geometry table, so it exists only for Reittiloki which also uses this database as its JORE backend.

## Find the data

If you need to add tables from JORE, these commands may be useful.

Look for the data you need in the JORE database with the following commands:

### List tables

```shell script
sqlcmd -S 10.218.6.14,56239 [LOGIN] -s',' -W -Q "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"
```

### List columns

```shell script
sqlcmd -S 10.218.6.14,56239 [LOGIN] -s',' -W -Q "SELECT column_name, data_type, character_maximum_length, table_name,ordinal_position, is_nullable FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name LIKE 'jr_kinf_reitti' ORDER BY ordinal_position"
```

### Get the first 30 rows

```shell script
sqlcmd -S 10.218.6.14,56239 [LOGIN] -s',' -W -Q "SELECT * FROM ( SELECT TOP 30 *, ROW_NUMBER() OVER (ORDER BY (SELECT 1)) AS rnum FROM [TABLE NAME]) a WHERE rnum > 10"
```
