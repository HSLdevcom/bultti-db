import * as mssql from 'mssql';
import { MSSQL_CONNECTION } from '../constants';

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
  
  await pool.connect()
  return pool
}
