import * as mssql from 'mssql';
import { MSSQL_CONNECTION } from '../../constants';
import prexit from 'prexit';
import { createTableQuery } from '../queryFragments/joreTableQuery';

let mssqlConfig = (maxConn = 2) => ({
  ...MSSQL_CONNECTION,
  requestTimeout: 7500000,
  connectionTimeout: 30000000,
  options: {
    enableArithAbort: false,
  },
  pool: {
    min: 0,
    max: maxConn,
  },
});

export async function getPool(maxConn = 2) {
  let pool = new mssql.ConnectionPool(mssqlConfig(maxConn));

  pool.on('error', (err) => {
    console.log('[Error]    Pool error', err);
  });

  await pool.connect();

  prexit(async () => {
    await pool.close();
  });

  return pool;
}

export async function fetchTableStream(tableName) {
  /*
   * There is a problem with the Mssql library that results in the connection
   * just stalling after a few tables in the table loop. No amount of adjusting
   * the pool size or anything else solved it, except creating a new pool for
   * each table. This is less than optimal, but it doesn't add THAT much overhead
   * for our use and it's the only thing that has worked. If you find yourself up
   * to the task of fixing this, know that I've spent a lot of time here already.
   */
  let pool = await getPool();

  let request = pool.request();
  request.stream = true;

  let query = createTableQuery(tableName);
  request.query(query);

  return { stream: request, closePool: pool.close.bind(pool) };
}
