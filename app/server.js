/* eslint-disable consistent-return */
import express from 'express';
import { SERVER_PORT, PATH_PREFIX, READ_SCHEMA_NAME } from '../constants';
import { createEngine } from 'express-react-views';
import path from 'path';
import { createRouteGeometry } from './derivedTables/createRouteGeometry';
import { activateFreshSchema } from './joreSync/schemaManager';
import { createDepartures } from './derivedTables/createDepartures';
import prexit from 'prexit';
import { createHttpTerminator } from 'http-terminator';
import { syncTable, syncJoreToPostgres } from './joreSync/syncJoreToPostgres';

export const server = () => {
  const app = express();
  app.use(express.urlencoded({ extended: true }));

  app.get('/check', (req, res) => {
    res.status(200).send('ok');
  });

  /*app.use(
    basicAuth({
      challenge: true,
      users: { admin: ADMIN_PASSWORD },
    })
  );*/

  app.engine('jsx', createEngine());
  app.set('view engine', 'jsx');
  app.set('views', path.join(__dirname, 'views'));

  app.get('/', async (req, res) => {
    res.render('admin');
  });

  app.post('/run', (req, res) => {
    console.log('Manually running import');
    syncJoreToPostgres(true);
    res.redirect(PATH_PREFIX);
  });

  app.post('/run-without-departures', (req, res) => {
    console.log('Manually running import without departures');
    syncJoreToPostgres(false);
    res.redirect(PATH_PREFIX);
  });

  app.post('/geometry', (req, res) => {
    console.log('Creating geometry table');
    createRouteGeometry(READ_SCHEMA_NAME);
    res.redirect(PATH_PREFIX);
  });

  app.post('/departures', (req, res) => {
    console.log('Creating departures table');
    createDepartures(READ_SCHEMA_NAME);
    res.redirect(PATH_PREFIX);
  });

  app.post('/switch-write-to-read', (req, res) => {
    console.log('Switching write schema to read schema');
    activateFreshSchema();
    res.redirect(PATH_PREFIX);
  });

  app.post('/import-table', (req, res) => {
    let { table_name } = req.body;
    console.log(table_name);
    syncTable(table_name, READ_SCHEMA_NAME);
    res.redirect(PATH_PREFIX);
  });

  let server = app.listen(SERVER_PORT, () => {
    console.log(`Server is listening on port ${SERVER_PORT}`);
  });

  const httpTerminator = createHttpTerminator({
    server,
  });

  prexit(async () => {
    await httpTerminator.terminate();
  });
};
