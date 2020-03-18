# Bultti DB

Scripts and queries for instantiating and hydrating the Bultti database with a schema and JORE data.

## Prerequirements

On the machine where you are creating the database, you need to have the following installed:

- csvkit
- postgresql (>= 11)
- node (>= 10)
- scp

## Get the data

Go on a server with JORE access and copy over into a subdirectory (for example ~/exports):

- The `export/export_tables.sh` script
- The `tables.lst` file

Then run export_tables. It will take a while. The required data is then available in the directory you ran the script in as CSV files.

Download the CSV files:

```shell script
scp '[SERVER IP OR URL]:/home/hsladmin/exports/*.csv' ./data/
```

That command downloads all .csv files in the ~/exports directory on the server into the data directory of this repo.

Run a sanity check on the data files with `validate.sh`. It will tell you if there are errors in the CSV files, but you can ignore messages about joining/reducing tables. The script will not write anything.

Then, clean the data files with `sanitize.sh`.

## Init the database

Start a postgres instance. Then you have two options, use EITHER, not both:

1. Generate a new schema based on the data with `generate_schema.sh` (if you only need to add a new table, use the csvsql command from this file and run it manually on the new file) OR
2. Apply the existing schema at sql/schema_ddl.sql with `init_db`. THis only works if the database is empty.

Both will create a schema in the database. If the files have changes since the schema_ddl was created, just generate a new one and update schema_ddl.sql with the new one. You may need to fix column types after creating the automated schema. You WILL need to add keys and indices. Check sql/alter_automatic_tables.sql for the current changes and keys.

At this point, move the csv files you DON'T want to import into the `data-done` directory (create it in this repo if it doesn't exist). It may be a good idea to move large files so the data import doesn't take forever if these are already in the database.

## Hydrate the database

Run `hydrate.sh` to import the JORE data.
