# Bultti DB

Scripts and queries for instantiating and hydrating the Bultti database with a schema and JORE data.

## Get the data

Go on a server with JORE access and copy over into a subdirectory (for example ~/exports):

- The `export/export_tables.sh` script
- The `tables.lst` file

Then run export_tables. It will take a while. The required data is then available in the directory you ran the script in as CSV files.

Download the CSV files:

```shell script
scp -r '[SERVER IP OR URL]:/home/hsladmin/exports/*.csv' ./data
```

That command downloads all .csv files in the ~/exports directory on the server into the data directory of this repo.

Run a sanity check on the data files with `validate.sh`. Ignore messages about joining/reducing tables.

Then, clean the data files with `sanitize.sh`.

## Init the database

Start a postgres instance. Then run `init_db.sh` to set up the schema

## Hydrate the database

Run `hydrate.sh` to import the JORE data.
