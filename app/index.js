import { server } from './server';
import { reportInfo, reportError } from './joreSync/monitor';
import segfaultHandler from 'segfault-handler';
import { scheduleSync, startScheduledSync } from './joreSync/schedule';
import { syncJoreToPostgres } from './joreSync/syncJoreToPostgres';
import prexit from 'prexit';
import { ensureImportStatusTable } from './utils/ensureImportStatusTable';

segfaultHandler.registerHandler('segfault.log');

(async () => {
  console.log('Bultti DB starting...');

  server();

  await ensureImportStatusTable();
  await reportInfo('Server started.');

  scheduleSync(() => syncJoreToPostgres());
  startScheduledSync();
})();

prexit(async (signal, err) => {
  if (!['beforeExit', 'SIGINT'].includes(signal)) {
    console.error(err);
    await reportError(`Uncaught exception: ${err.message || 'Something happened!'}`);
    prexit.code = 1;
  }
});
