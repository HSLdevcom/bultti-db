#!/usr/bin/env bash
# Process the downloaded tables with sed.
# Make sure a tables.lst file exists in the same location with a list of each table to download.
# @file: process_files.sh

for table in $(<tables.lst); do
  echo "$table"
  # Remove all commas,
  # convert the delimiter (@|@) to a comma,
  # make all NULL strings empty values,
  # remove second row (--- separator),
  # remove last row (empty),
  # then remove all empty rows.
  sed -r -e "s/,//g" ${table}.csv | sed -r -e "s/@|@/,/g" | sed -e "s/NULL//g" | sed -e "2d" | sed -e "$d" | sed -e "/^$/d" > ../processed/${table}.csv
done
