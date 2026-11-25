const CACHE_NAME = 'detektif-matematika-v1';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Menyimpan file aplikasi saat pertama kali dibuka
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Mengaktifkan Service Worker baru
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

// Mengambil file dari cache ketika tersedia
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request);

    if (cached) return cached;

    try {
      const response = await fetch(event.request);

      if (
        response &&
        response.ok &&
        new URL(event.request.url).origin === self.location.origin
      ) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }

      return response;
    } catch (error) {
      if (event.request.mode === 'navigate') {
        return (await caches.match('./index.html')) || Response.error();
      }

      return Response.error();
    }
  })());
});