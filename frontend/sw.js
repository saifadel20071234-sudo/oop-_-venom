/**
 * Service Worker - Smart First Aid System (VENOM — مسعف الذكي)
 * Network-First Strategy for Instant Fresh Updates without Ctrl+Shift+R,
 * with Automatic Offline PWA Cache Fallback.
 */

const CACHE_NAME = 'venom-firstaid-v105';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/dark-mode.css',
  '/js/api.js?v=105',
  '/js/app.js?v=105',
  '/js/chat.js?v=105',
  '/js/map.js?v=105',
  '/js/triage.js?v=105',
  '/components/severity-badge.js?v=105',
  '/components/step-card.js?v=105',
  '/components/team-modal.js?v=105',
  '/pages/chat.html',
  '/pages/triage.html',
  '/pages/contacts.html',
  '/pages/learn.html',
  '/assets/images/venom-official-logo.png',
  '/assets/images/app-icon-512.png',
  '/assets/images/app-icon-192.png',
  '/assets/images/app-icon-maskable.png',
  '/assets/images/apple-touch-icon.png',
  '/assets/images/medical-favicon.png',
  '/assets/fontawesome/css/all.min.css'
];

// 1. Install Event: Skip waiting immediately to replace old SW without tab reload
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of PRECACHE_ASSETS) {
        try {
          await cache.add(url);
        } catch (err) {
          // Non-critical precache failure
        }
      }
    })
  );
});

// 2. Activate Event: Delete ALL old caches and take control of all open clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log('[SW] Deleting old stale cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-First for real-time fresh updates, Cache fallback when offline
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Bypass API requests directly to backend (never cache API calls in SW)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Strategy: Network-First (Try Network First so users ALWAYS see newest changes)
      try {
        const networkRes = await fetch(req);
        if (networkRes && networkRes.status === 200) {
          // Clone and update cache in background
          cache.put(req, networkRes.clone());
        }
        return networkRes;
      } catch (err) {
        // Offline Fallback: Serve from cache
        const cached = await cache.match(req);
        if (cached) return cached;

        const pathname = url.pathname;
        const cachedPath = await cache.match(pathname) || await cache.match(pathname + '.html');
        if (cachedPath) return cachedPath;

        // Navigation fallback for offline HTML
        if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
          const fallback = await cache.match('/index.html') || await cache.match('/');
          if (fallback) return fallback;
        }

        return new Response('Offline: Content not available offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      }
    })()
  );
});
