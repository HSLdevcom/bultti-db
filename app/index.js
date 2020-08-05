import { getKnex } from './knex';
import { server } from './server';
import { reportInfo, reportError } from './monitor';
import mssql from 'mssql';

const { knex } = getKnex();

(async () => {
  console.log('Bultti DB starting...');
  await knex.migrate.latest();

  server();

  await reportInfo('Server started.');
})();

const onExit = async () => {
  console.log('Ctrl-C...');
  await reportInfo('Process was closed, probably on purpose.');
  await knex.destroy();
  await mssql.close();
  process.exit(0);
};

const onCrash = async (e) => {
  console.log('Uncaught Exception...');
  console.error(e);
  await reportError(`Uncaught exception: ${e.message || 'Something happened!'}`);
  await knex.destroy();
  await mssql.close();
  process.exit(99);
};

// catch ctrl+c event and exit normally
process.on('SIGINT', onExit);

// catch uncaught exceptions, trace, then exit normally
process.on('uncaughtException', onCrash);
process.on('SIGABRT', onCrash);
