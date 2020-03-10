#!/usr/bin/env bash
# Script to dump all listed tables from SQL Server into CSV files with sqlcmd.
# Make sure a tables.lst file exists in the same location with a list of each table to download.
# @file: export_tables.sh

for table in $(<tables.lst); do
  sqlcmd -S 10.218.6.14,56239 -U jorep -P "tuotanto" -s"@" -W -Q "SET NOCOUNT ON; SELECT * FROM ${table}" > "${table}.tmp"

  # Remove all commas,
  # convert the delimiter (@) to a comma,
  # make all NULL strings empty values,
  # remove second row (--- separator),
  # then remove all empty rows.
  sed -e "s/,//g" "${table}.tmp" | sed -e "s/@/,/g" | sed -e "s/NULL//g" | sed -e "2d" | sed -e "/^$/d" > "${table}.csv"
done
