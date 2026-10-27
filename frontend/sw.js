/**
 * Service Worker Unregister & Cache Purge Engine
 * Safely removes stale caches and unregisters Service Worker
 * so users ALWAYS receive live updates directly from Vercel without Ctrl+Shift+R.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
      .then(() => self.registration.unregister())
  );
});

// Pass through all network requests directly
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
