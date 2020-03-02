#!/bin/bash

set -e

PWD=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

# Collect all csv files in the data dir
FILES="${PWD}/data/*"

for f in $FILES; do
  filename=${f##*/}
  echo "${filename}"

  csvclean --maxfieldsize 100000000 -n "${f}"
done
