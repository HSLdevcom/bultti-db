#!/bin/bash

set -e

PWD=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

# Collect all csv files in the data dir
FILES=${PWD}/data/*

for f in $FILES; do
  filename=${f##*/}
  name="${filename%.csv}"
  echo "$name"

  node fix_rows.js "${f}"
done
