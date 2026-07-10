const CACHE = 'freerock-v2'
const STATIC = ['/', '/manifest.webmanifest', '/logo.jpg']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Background sync for offline submissions
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-quotes') {
    e.waitUntil(syncQuotes())
  }
})

async function syncQuotes() {
  try {
    const db = await openDB()
    const tx = db.transaction('pending-quotes', 'readonly')
    const store = tx.objectStore('pending-quotes')
    const quotes = await store.getAll()

    for (const quote of quotes) {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote.data),
      })
      if (response.ok) {
        const deleteTx = db.transaction('pending-quotes', 'readwrite')
        const deleteStore = deleteTx.objectStore('pending-quotes')
        await deleteStore.delete(quote.id)
      }
    }
  } catch (err) {
    console.error('Background sync failed:', err)
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('freerock-sync', 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore('pending-quotes', { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  if (request.method !== 'GET') {
    if (navigator.onLine === false) {
      // Queue for background sync
      e.waitUntil(
        (async () => {
          const db = await openDB()
          const tx = db.transaction('pending-quotes', 'readwrite')
          const store = tx.objectStore('pending-quotes')
          await store.add({ id: Date.now().toString(), data: await request.clone().json() })
          await self.registration.sync.register('sync-quotes')
        })()
      )
    }
    e.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ queued: true }), { headers: { 'Content-Type': 'application/json' } })))
    return
  }

  e.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, clone))
        }
        return response
      }).catch(() => cached)
      return cached || fetchPromise
    })
  )
})
