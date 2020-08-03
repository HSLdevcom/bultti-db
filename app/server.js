/* eslint-disable consistent-return */
import express from 'express';
import basicAuth from 'express-basic-auth';
import { ADMIN_PASSWORD, SERVER_PORT } from '../constants';
import { createEngine } from 'express-react-views';
import path from 'path';

export const server = () => {
  const app = express();
  app.use(express.urlencoded({ extended: true }));

  app.get('/check', (req, res) => {
    res.status(200).send('ok');
  });

  app.use(
    basicAuth({
      challenge: true,
      users: { admin: ADMIN_PASSWORD },
    })
  );

  app.engine('jsx', createEngine());
  app.set('view engine', 'jsx');
  app.set('views', path.join(__dirname, 'views'));

  app.get('/', async (req, res) => {
    res.render('admin');
  });

  app.listen(SERVER_PORT, () => {
    console.log(`Server is listening on port ${SERVER_PORT}`);
    // reportInfo("Server started.")
  });
};