#!/bin/bash

set -e

PWD=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

# Collect all csv files in the data dir
FILES=${PWD}/data/*

for f in $FILES; do
  filename=${f##*/}
  name="${filename%.csv}"
  echo "${name}"

  # Create tables automatically with csvkit
  # Only read the first 10k lines, otherwise csvkit takes forever (10k is already slow).
  # The column types are inferred from the data, so we can't take too small of a sample.
  head -n 10000 "${f}" | csvsql --db 'mssql://sa:yourStrong(!)Password@MSSQLServerDatabase' --tables "${name}" --db-schema jore --no-constraints --maxfieldsize 10000000000 --datetime-format datetime
done
