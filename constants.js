import { mapValues, orderBy } from 'lodash';
import fs from 'fs-extra';

const SECRETS_PATH = '/run/secrets/';

// For any env variable with the value of "secret", resolve the actual value from the
// associated secrets file. Using sync fs methods for the sake of simplicity,
// since this will only run once when staring the app, sync is OK.
const secrets = (fs.existsSync(SECRETS_PATH) && fs.readdirSync(SECRETS_PATH)) || [];

const secretsEnv = mapValues(process.env, (value, key) => {
  const matchingSecrets = secrets.filter((secretFile) => secretFile.startsWith(key));

  const currentSecret =
    orderBy(
      matchingSecrets,
      (secret) => {
        const secretVersion = parseInt(secret[secret.length - 1], 10);
        return isNaN(secretVersion) ? 0 : secretVersion;
      },
      'desc'
    )[0] || null;

  const filepath = SECRETS_PATH + currentSecret;

  if (fs.existsSync(filepath)) {
    return (fs.readFileSync(filepath, { encoding: 'utf8' }) || '').trim();
  }

  return value;
});

export const JORE_PG_CONNECTION = {
  host: secretsEnv.PGHOST,
  port: secretsEnv.PGPORT,
  user: secretsEnv.PGUSER,
  password: secretsEnv.PGPASSWORD,
  database: secretsEnv.PGDATABASE,
  ssl: secretsEnv.PG_SSL === 'true',
};

export const MSSQL_CONNECTION = {
  user: secretsEnv.MSSQLUSER,
  password: secretsEnv.MSSQLPASSWORD,
  server: secretsEnv.MSSQLHOST,
  database: secretsEnv.MSSQLDATABASE,
  port: secretsEnv.MSSQLPORT ? parseInt(secretsEnv.MSSQLPORT, 10) : 1433,
};

export const DEBUG = secretsEnv.DEBUG || 'false';
export const SERVER_PORT = secretsEnv.SERVER_PORT || 3000;
export const ADMIN_PASSWORD = secretsEnv.ADMIN_PASSWORD || 'password';
export const PATH_PREFIX = secretsEnv.PATH_PREFIX || '/';
export const SLACK_WEBHOOK_URL = secretsEnv.SLACK_WEBHOOK_URL || '';
export const SLACK_MONITOR_MENTION = secretsEnv.SLACK_MONITOR_MENTION || '';
export const ENVIRONMENT = secretsEnv.ENVIRONMENT || 'unknown';
export const MONITORING_ENABLED = secretsEnv.MONITORING_ENABLED === 'true';
export const BATCH_SIZE = 1000;
export const NS_PER_SEC = 1e9; // For tracking performance
export const WRITE_SCHEMA_NAME = '_jore_import';
export const READ_SCHEMA_NAME = 'jore';
export const TASK_SCHEDULE = secretsEnv.TASK_SCHEDULE;
