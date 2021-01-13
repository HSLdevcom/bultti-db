import PQueue from 'p-queue';
import { BATCH_SIZE } from '../../constants';

export async function syncStream(
  requestStream,
  chunkProcessor,
  concurrency = 10,
  batchSize = BATCH_SIZE,
  dataEvent = 'row',
  endEvent = 'done'
) {
  return new Promise((resolve, reject) => {
    let queue = new PQueue({
      autoStart: true,
      concurrency: concurrency,
    });

    let totalRowsCount = 0;
    let rows = [];

    function processRows(addRows) {
      queue.add(() => chunkProcessor(addRows || [])).catch(reject);
    }

    let onRow = async (row) => {
      totalRowsCount++;
      rows.push(row);

      if (rows.length >= batchSize) {
        requestStream.pause();
        processRows(rows);

        // Wait if the queue is full
        if (queue.size >= concurrency * 2) {
          await queue.onEmpty();
        }

        rows = [];
        requestStream.resume();
      }
    };

    let onEnd = () => {
      processRows(rows);
      // Allow time for jobs to be added to the queue before resolving.
      setTimeout(() => {
        queue.onIdle().then(() => resolve(totalRowsCount));
      }, 1000);
    };

    requestStream.on(dataEvent, onRow);
    requestStream.on(endEvent, onEnd);

    requestStream.on('error', (err) => {
      console.log(`[Error]   MSSQL query error`, err);
      reject(err);
    });
  });
}
