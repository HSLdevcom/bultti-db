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
    </>
  );
};

export default RunImport;
