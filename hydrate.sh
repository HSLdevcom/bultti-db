#!/bin/bash

set -e

FILES=$(cd -P -- "$(dirname -- "$0")" && pwd -P)/data/*

for f in $FILES; do
  filename=${f##*/}
  name="${filename%.csv}"
  echo "$name"

  if [ "$name" == "jr_koodisto" ]; then
    # pgfutter fails on jr_koodisto, use this instead
    csvsql --db postgresql://postgres:password@localhost:5432/postgres --tables $name --db-schema jore --create-if-not-exists --insert --no-constraints --chunk-size 5000 --maxfieldsize 10000000000 $f
  else
    touch ./data-errors/${name}_errors.csv
    ./pgfutter --host localhost --port 5432 --username postgres --pw password --schema jore --ignore-errors csv ${f} 2> ./data-errors/${name}_errors.txt
  fi

done
