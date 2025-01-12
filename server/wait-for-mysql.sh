#!/bin/sh
# wait-for-mysql.sh

set -e

host="$HACKATHON_2025_DATABASE_HOST"
port="$HACKATHON_2025_DATABASE_PORT"
user="$HACKATHON_2025_DATABASE_USER"
password="$HACKATHON_2025_DATABASE_PASSWORD"

echo "Waiting for MySQL to be ready..."
for i in $(seq 1 30); do
  if mysql -h"$host" -P"$port" -u"$user" -p"$password" --ssl=0 -e 'SELECT 1' >/dev/null 2>&1; then
    echo "MySQL is ready!"
    break
  fi
  echo "MySQL is unavailable - attempt $i - sleeping"
  sleep 2
done

echo "Initializing database..."
mysql -h"$host" -P"$port" -u"$user" -p"$password" --ssl=0 <<-EOSQL
    ALTER USER 'root'@'%' IDENTIFIED BY 'Rsv18221';
    GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
    FLUSH PRIVILEGES;
EOSQL

echo "MySQL is up - executing command"
exec "$@"