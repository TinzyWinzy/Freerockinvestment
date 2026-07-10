const DB_NAME = 'freerock-sync'
const STORE_NAME = 'pending-quotes'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function queueOfflineSubmission(data: unknown) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  await store.add({ id: Date.now().toString(), data, createdAt: new Date().toISOString() })

  // Register sync if available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready
    ;(registration as any).sync.register('sync-quotes')
  }
}

export async function getPendingCount(): Promise<number> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  return new Promise((resolve) => {
    const countRequest = store.count()
    countRequest.onsuccess = () => resolve(countRequest.result)
    countRequest.onerror = () => resolve(0)
  })
}
