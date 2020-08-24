import React from 'react';
import { PATH_PREFIX } from '../../constants';

const RunImport = () => {
  return (
    <>
      <h3>Run import</h3>
      <p>
        The import downloads the latest data from JORE and inserts it into the Postgres database.
      </p>
      <form action={`${PATH_PREFIX}run/`} method="post">
        <input type="submit" value="Run import" />
      </form>
      <h3>Create geometry table</h3>
      <p>
        Create the geometry table based on a few of the tables in the DB.
      </p>
      <form action={`${PATH_PREFIX}geometry/`} method="post">
        <input type="submit" value="Create geometry table" />
      </form>
      <h3>Create departures table</h3>
      <p>
        Create the departures table based on a few of the tables in the DB.
      </p>
      <form action={`${PATH_PREFIX}departures/`} method="post">
        <input type="submit" value="Create departures table" />
      </form>
    </>
  );
};

export default RunImport;
