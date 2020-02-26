#!/bin/bash

set -e

FILES=$(cd -P -- "$(dirname -- "$0")" && pwd -P)/data/*

for f in $FILES
do
  filename=${f##*/}
  name="${filename%.csv}"
  echo "$name"

  ./pgfutter --host localhost --port 5432 --username postgres --pw password --schema jore csv $f
done
