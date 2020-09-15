let syncing = false;

export function startSync(syncKey) {
  if (syncing !== false) {
    return false;
  }

  syncing = syncKey;
  return true;
}

export function endSync(syncKey) {
  if (syncKey === syncing) {
    syncing = false;
  }
}
