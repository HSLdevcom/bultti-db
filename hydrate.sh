#!/bin/bash

set -e

# Collect all csv files in the data dir
FILES=$(cd -P -- "$(dirname -- "$0")" && pwd -P)/data/*

export PGPASSWORD=password

for f in $FILES; do
  filename=${f##*/}
  name="${filename%.csv}"
  echo "$name"

  psql -h localhost -p 5432 -U postgres -c "\copy jore.${name} from '${f}' csv header"
done
