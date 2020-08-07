import { getKnex } from './knex';
import { chunk } from 'lodash';

const { knex } = getKnex();
const schema = 'jore';

// "Upsert" function for PostgreSQL. Inserts or updates lines in bulk. Insert if
// the primary key for the line is available, update otherwise.

export async function upsert(tableName, data) {
  let items = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (data) {
    items = [data];
  }

  if (items.length === 0) {
    return Promise.resolve();
  }

  // Prepend the schema name to the table. This is more convenient in raw queries
  // and batch queries where Knex doesn't use the withSchema function.
  const tableId = `${schema}.${tableName}`;

  // Get the set of keys for all items from the first item.
  // All items should have the same keys.
  const itemKeys = Object.keys(items[0]);
  const keysLength = itemKeys.length;

  let placeholderRow = new Array(keysLength);

  for (let i = 0; i < keysLength; i++) {
    placeholderRow[i] = '?';
  }

  placeholderRow = `(${placeholderRow.join(',')})`;

  // 30k bindings is slightly under what the node-pg library can handle per query.
  let itemsPerQuery = Math.ceil(30000 / Math.max(1, keysLength));
  let queryItems = chunk(items, itemsPerQuery);

  let queryPromises = [];

  // Split up the insert query by how many items it can handle at a time.
  for (let itemsChunk of queryItems) {
    let chunkLength = itemsChunk.length;
    // Create a string of placeholder values (?,?,?) for each item we want to insert
    const valuesPlaceholders = [];

    // Collect all values to insert from all objects in a one-dimensional array.
    const insertValues = [];

    let itemIdx = 0;
    let placeholderIdx = 0;
    let valueIdx = 0;

    while (itemIdx < chunkLength) {
      const insertItem = items[itemIdx];

      if (insertItem) {
        valuesPlaceholders[placeholderIdx] = placeholderRow;
        placeholderIdx++;

        for (let k = 0; k < keysLength; k++) {
          insertValues[valueIdx] = insertItem[itemKeys[k]];
          valueIdx++;
        }
      }

      itemIdx++;
    }

    const upsertQuery = `
INSERT INTO ?? (${itemKeys.map(() => '??').join(',')})
VALUES ${valuesPlaceholders.join(',')}
ON CONFLICT DO NOTHING;
`;

    const upsertBindings = [tableId, ...itemKeys, ...insertValues];

    let queryPromise = knex.raw(upsertQuery, upsertBindings);
    queryPromises.push(queryPromise);
  }

  return Promise.all(queryPromises);
}
