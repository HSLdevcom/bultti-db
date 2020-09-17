/* eslint-disable consistent-return */
import express from 'express';
import { SERVER_PORT, PATH_PREFIX, READ_SCHEMA_NAME } from '../constants';
import { createEngine } from 'express-react-views';
import path from 'path';
import { syncSourceToDestination } from './sync';
import { createRouteGeometry } from './createRouteGeometry';
import { activateFreshSchema } from './utils/schemaManager';
import { createDepartures } from './createDepartures';

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
    syncSourceToDestination();
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

  app.listen(SERVER_PORT, () => {
    console.log(`Server is listening on port ${SERVER_PORT}`);
    // reportInfo("Server started.")
  });
};
