import PQueue from 'p-queue';
import { BATCH_SIZE } from '../../constants';

export async function processStream(
  requestStream,
  chunkProcessor,
  concurrency = 10,
  batchSize = BATCH_SIZE
) {
  return new Promise((resolve, reject) => {
    let queue = new PQueue({
      autoStart: true,
      concurrency: concurrency,
    });

    function onError(err) {
      queue.clear();
      requestStream.cancel();
      reject(err);
    }

    function processRows(addRows) {
      return queue.add(() => chunkProcessor(addRows || [])).catch(onError);
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

    requestStream.on('row', onRow);

    requestStream.on('done', () => {
      processRows(rows)
        .then(() => queue.onIdle())
        .then(() => resolve(totalRowsCount));
    });

    requestStream.on('error', onError);
  });
}
