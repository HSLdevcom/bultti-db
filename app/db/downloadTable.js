import path from 'path';
import { fetchTableStream } from './mssql';
import fs from 'fs-extra';
import { Transform } from 'stream';
import { logTime } from '../utils/logTime';

const downloadsPath = path.join(__dirname, '../..', 'downloads');
console.log(downloadsPath);

export async function downloadTable(tableName) {
  return new Promise(async (resolve, reject) => {
    let time = process.hrtime();

    await fs.mkdirp(downloadsPath);
    let filePath = path.join(downloadsPath, tableName + '.json');

    if (fs.existsSync(filePath)) {
      console.log('Removing previous file.');
      await fs.unlink(filePath);
    }

    let { stream, closePool } = await fetchTableStream(tableName);

    console.log(`Streaming data from table ${tableName}`);

    let writeStream = fs.createWriteStream(filePath, {
      encoding: 'utf-8',
      autoClose: true,
    });

    let transformToString = new Transform({
      encoding: 'utf-8',
      objectMode: true,
      transform(chunk, encoding, callback) {
        let str = JSON.stringify(chunk);
        callback(null, str + '\n');
      },
    });

    let fileStream = stream.pipe(transformToString).pipe(writeStream);

    stream.on('done', () => {
      writeStream.end();
      closePool();

      logTime(`Table ${tableName} written to file ${filePath}`, time);
      resolve();
    });

    fileStream.on('error', (err) => {
      console.log('Error!', err);
      reject(err);
    });
  });
}
