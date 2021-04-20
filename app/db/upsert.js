import { getKnex } from './postgres';
import { chunk, uniqBy } from 'lodash';
import { createPrimaryKey } from '../utils/createPrimaryKey';

const knex = getKnex();

// "Upsert" function for PostgreSQL. Inserts or updates lines in bulk. Insert if
// the primary key for the line is available, update otherwise.
export async function upsert(schema, tableName, data, primaryKeys = []) {
  let items = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (data) {
    items = [data];
  }

  if (items.length === 0) {
    return Promise.resolve();
  }

  let tableId = `${schema}.${tableName}`;

  // Get the set of keys for all items from the first item.
  // All items should have the same keys.
  const itemKeys = Object.keys(items[0]);
  const keysLength = itemKeys.length;
  let placeholderRow = `(${itemKeys.map(() => '?').join(',')})`;

  // 30k bindings is a conservative estimate of what the node-pg library can handle per query.
  let itemsPerQuery = 1; //Math.ceil(30000 / Math.max(1, keysLength));
  // Split the items up into chunks
  let queryChunks = chunk(items, itemsPerQuery);

  let insertPromise = Promise.resolve();

  // Create upsert queries for each chunk of items.
  for (let itemsChunk of queryChunks) {
    let uniqItems =
      primaryKeys.length !== 0
        ? uniqBy(itemsChunk, (item) => createPrimaryKey(item, primaryKeys))
        : itemsChunk;

    let chunkLength = uniqItems.length;
    // Create a string of placeholder values (?,?,?) for each item we want to insert
    let valuesPlaceholders = [];

    // Collect all values to insert from all objects in a one-dimensional array.
    let insertValues = [];

    let itemIdx = 0;
    let valueIdx = 0;

    while (itemIdx < chunkLength) {
      let insertItem = uniqItems[itemIdx];

      if (insertItem) {
        valuesPlaceholders.push(placeholderRow);

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
    insertPromise = insertPromise.then(() => knex.raw(upsertQuery, upsertBindings));
  }

  return insertPromise;
}
