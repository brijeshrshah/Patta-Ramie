const CACHE_NAME = 'patta-ramie-v10';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './Dhaglabaji/index.html',
  './Dhaglabaji/styles.css',
  './Dhaglabaji/script.js',
  './DoTinPanch/index.html',
  './DoTinPanch/styles.css',
  './DoTinPanch/script.js',
  './SattiAththi/index.html',
  './SattiAththi/styles.css',
  './SattiAththi/script.js',
  './Satyu/index.html',
  './Satyu/styles.css',
  './Satyu/script.js',
  './Mindicoat/index.html',
  './Mindicoat/styles.css',
  './Mindicoat/script.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network first so updates and fixes arrive immediately; fall back to cache when offline.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok && event.request.method === 'GET') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
