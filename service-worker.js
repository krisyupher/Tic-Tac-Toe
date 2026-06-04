// Service worker for Tic-Tac-Toe PWA.
// Bump CACHE_VERSION whenever you change cached assets to force an update.
const CACHE_VERSION = 'ttt-v1';

// Local app shell. Paths are relative to the service worker's scope so this
// works both at the domain root and under a GitHub Pages project path.
const APP_SHELL = [
  '.',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
];

// Precache the app shell on install.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Remove old caches on activation.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first, falling back to network. Successful GETs are cached at runtime
// (this also covers the Three.js CDN files so the game works offline).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Cache same-origin and CDN (opaque) responses for next time.
          if (response && (response.ok || response.type === 'opaque')) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          // Offline navigation fallback to the cached app shell.
          if (event.request.mode === 'navigate') return caches.match('index.html');
        });
    })
  );
});
