import { server } from './server';
import { reportInfo, reportError } from './monitor';
import segfaultHandler from 'segfault-handler';
import { scheduleSync, startScheduledSync } from './schedule';
import { syncSourceToDestination } from './sync';
import prexit from 'prexit';

segfaultHandler.registerHandler('segfault.log');

(async () => {
  console.log('Bultti DB starting...');

  server();
  await reportInfo('Server started.');

  scheduleSync(syncSourceToDestination);
  startScheduledSync();
})();

prexit(async (signal, err) => {
  if (!['beforeExit', 'SIGINT'].includes(signal)) {
    console.error(err);
    await reportError(`Uncaught exception: ${err.message || 'Something happened!'}`);
    prexit.code = 1;
  }
});
