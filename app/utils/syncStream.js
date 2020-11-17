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
    let rowsKey = { index: 0 };
    let rowsMap = new WeakMap();

    function processRows(currentKey) {
      queue
        .add(() => {
          let rows = rowsMap.get(currentKey);
          return chunkProcessor(rows || []);
        })
        .catch(reject);
    }

    let onRow = async (row) => {
      totalRowsCount++;
      let currentIndex = rowsKey.index;

      let rows = rowsMap.get(rowsKey) || [];
      rows.push(row);
      rowsMap.set(rowsKey, rows);

      if (rows.length >= batchSize) {
        requestStream.pause();
        processRows(rowsKey);

        // Wait if the queue is full
        if (queue.size >= concurrency) {
          await queue.onEmpty();
        }

        rowsKey = { index: currentIndex + 1 };
        requestStream.resume();
      }
    };

    let onEnd = () => {
      processRows(rowsKey);
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
