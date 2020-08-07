// Ensure primary key columns are not null
export function primaryKeyNotNullFilter(row, constraint) {
  if (!constraint || constraint.keys.length === 0) {
    return true;
  }

  let primaryKeys = constraint.keys;
  return !primaryKeys.some((pk) => !row[pk]);
}
