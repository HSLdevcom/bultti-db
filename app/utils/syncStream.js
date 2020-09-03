import PQueue from 'p-queue';
import { BATCH_SIZE } from '../../constants';

export function syncStream(
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

    let rowsKey = { index: 0 };
    let rowsMap = new WeakMap();

    function processRows(currentKey) {
      queue
        .add(() => {
          let rows = rowsMap.get(currentKey);
          return chunkProcessor(rows).then(() => currentKey);
        })
        .then((usedKey) => {
          rowsMap.delete(usedKey);
        })
        .catch(reject);
    }

    requestStream.on('row', async (row) => {
      let currentIndex = rowsKey.index;

      let rows = rowsMap.get(rowsKey) || [];
      rows.push(row);
      rowsMap.set(rowsKey, rows);

      if (rows.length >= batchSize) {
        requestStream.pause();
        processRows(rowsKey);

        if (queue.size > concurrency) {
          await queue.onEmpty();
        }

        rowsKey = { index: currentIndex + 1 };
        requestStream.resume();
      }
    });

    requestStream.on('done', () => {
      processRows();
      queue
        .onIdle()
        .then(resolve)
        .catch(reject);
    });

    requestStream.on('error', (err) => {
      queue.clear();
      console.log(`[Error]   MSSQL query error`, err);
      reject(err);
    });
  });
}
