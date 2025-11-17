#!/bin/bash
set -e

pg_restore -v --no-owner --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" /docker-entrypoint-initdb.d/backup.dump