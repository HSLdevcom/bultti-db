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
  let queue = new PQueue({
    autoStart: true,
    concurrency: concurrency,
  });

  await new Promise((resolve, reject) => {
    let totalRowsCount = 0;
    let rows = [];

    function processRows() {
      queue
        .add(() => {
          let currentRows = [...rows];
          return chunkProcessor(currentRows);
        })
        .catch(reject);
    }

    let onRow = async (row) => {
      totalRowsCount++;
      rows.push(row);

      if (rows.length >= batchSize) {
        requestStream.pause();
        processRows();

        // Wait if the queue is full
        if (queue.size > concurrency * 2) {
          await queue.onEmpty();
        }

        rows = [];
        requestStream.resume();
      }
    };

    requestStream.on(dataEvent, onRow);

    requestStream.on(endEvent, () => {
      processRows();

      // Allow time for jobs to be added to the queue before resolving.
      setTimeout(() => {
        resolve(totalRowsCount);
      }, 5000);
    });

    requestStream.on('error', (err) => {
      console.log(`[Error]   MSSQL query error`, err);
      reject(err);
    });
  });

  return queue.onIdle();
}
