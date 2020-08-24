import * as mssql from 'mssql';
import { MSSQL_CONNECTION } from '../constants';

let mssqlConfig = {
  ...MSSQL_CONNECTION,
  options: {
    enableArithAbort: false,
  },
  pool: {
    min: 0,
    max: 2,
  },
};

export async function getPool() {
  let pool = new mssql.ConnectionPool(mssqlConfig);
  
  pool.on('error', (err) => {
    console.log('[Error]    Pool error', err);
  });
  
  await pool.connect()
  return pool
}
