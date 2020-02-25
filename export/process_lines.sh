#!/usr/bin/env bash
# Process the downloaded tables with sed.
# Make sure a tables.lst file exists in the same location with a list of each table to download.
# @file: process_files.sh

for table in $(<tables.lst); do
  echo "$table"
  sed -r -e "s/,//g" ${table}.csv | sed -r -e "s/@|@/,/g" | sed -e "2d" | sed -e "$d" | sed -e "/^$/d" > ../processed/${table}.csv
done
