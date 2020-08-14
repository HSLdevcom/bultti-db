#!/bin/bash

set -e

export PGPASSWORD=password
psql -h localhost -p 5432 -U postgres -f ./sql/schema_ddl.sql
