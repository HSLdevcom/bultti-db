import React from 'react';
import { PATH_PREFIX } from '../../constants';

const RunImport = () => {
  return (
    <>
      <h3>Run import</h3>
      <p>
        The import downloads the latest data from JORE and inserts it into the Postgres
        database.
      </p>
      <form action={`${PATH_PREFIX}run/`} method="post">
        <input type="submit" value="Run import" />
      </form>
      <h3>Create geometry table</h3>
      <p>Create the geometry table based on a few of the tables in the DB.</p>
      <form action={`${PATH_PREFIX}geometry/`} method="post">
        <input type="submit" value="Create geometry table" />
      </form>
      <h3>Create departures table</h3>
      <p>Create the departures table based on a few of the tables in the DB.</p>
      <form action={`${PATH_PREFIX}departures/`} method="post">
        <input type="submit" value="Create departures table" />
      </form>
      <h3>Switch write schema to read</h3>
      <p>Switch the write schema (_jore_import) to be the read schema (jore).</p>
      <form action={`${PATH_PREFIX}switch-write-to-read/`} method="post">
        <input type="submit" value="Switch schemas" />
      </form>
      <h3>Import specific table</h3>
      <p>Import a specific table from JORE.</p>
      <form action={`${PATH_PREFIX}import-table/`} method="post">
        <input type="text" name="table_name" />
        <input type="submit" value="Import table" />
      </form>
      <h3>Download table to file</h3>
      <p>Download a table to a file (in /downloads)</p>
      <form action={`${PATH_PREFIX}download-table/`} method="post">
        <input type="text" name="table_name" />
        <input type="submit" value="Import table" />
      </form>
    </>
  );
};

export default RunImport;
