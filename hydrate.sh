#!/bin/bash

set -e

FILES=$(cd -P -- "$(dirname -- "$0")" && pwd -P)/data/*

for f in $FILES
do
  filename=${f##*/}
  name="${filename%.csv}"
  echo "$name"
  csvsql --db postgresql://postgres:password@localhost:5432/postgres --tables $name --db-schema jore --create-if-not-exists --insert $f
done
