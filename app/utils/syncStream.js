import PQueue from 'p-queue';
import { BATCH_SIZE } from '../../constants';
import { finished } from 'stream';

export async function syncStream(
  requestStream,
  chunkProcessor,
  concurrency = 10,
  batchSize = BATCH_SIZE,
  dataEvent = 'row'
) {
  return new Promise((resolve, reject) => {
    let queue = new PQueue({
      autoStart: true,
      concurrency: concurrency,
    });

    function processRows(addRows) {
      return queue.add(() => chunkProcessor(addRows || [])).catch(reject);
    }

    let totalRowsCount = 0;
    let rows = [];

    function onRow(row) {
      totalRowsCount++;
      rows.push(row);

      if (rows.length >= batchSize) {
        requestStream.pause();
        processRows(rows);
        rows = [];

        let whenQueueIsReady = Promise.resolve();

        // Wait if the queue is too full
        if (queue.size >= concurrency * 2) {
          whenQueueIsReady = queue.onEmpty();
        }

        whenQueueIsReady.then(() => {
          requestStream.resume();
        });
      }
    }

    requestStream.on(dataEvent, onRow);

    finished(requestStream, (err) => {
      if (err) {
        console.log(`[Error]   MSSQL query error`, err);
        queue.clear();
        reject(err);
      } else {
        processRows(rows)
          .then(() => queue.onIdle())
          .then(() => resolve(totalRowsCount));
      }
    });
  });
}
