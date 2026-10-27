/**
 * Service Worker - Smart First Aid System (VENOM — مسعف الذكي)
 * Full Offline PWA Cache Engine for Vercel & HTTPS Hosting
 */

const CACHE_NAME = 'venom-firstaid-v63';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/dark-mode.css',
  '/js/api.js',
  '/js/app.js',
  '/js/map.js',
  '/components/severity-badge.js',
  '/components/step-card.js',
  '/components/team-modal.js',
  '/pages/chat.html',
  '/pages/chat',
  '/pages/triage.html',
  '/pages/triage',
  '/pages/contacts.html',
  '/pages/contacts',
  '/pages/learn.html',
  '/pages/learn',
  '/assets/images/venom-official-logo.png',
  '/assets/images/app-icon-512.png',
  '/assets/images/app-icon-192.png',
  '/assets/images/app-icon-maskable.png',
  '/assets/images/apple-touch-icon.png',
  '/assets/images/medical-favicon.png',
  '/assets/images/zeyad-asaad.jpg',
  '/assets/images/merna-hany.jpg',
  '/assets/images/farah-elshirbiny.jpg',
  '/assets/images/jamila-tawfeek.jpg',
  '/assets/images/saif-adel.jpg',
  '/assets/images/reda-elqeblawy.jpg',
  '/assets/fontawesome/css/all.min.css',
  '/assets/fontawesome/webfonts/fa-solid-900.woff2',
  '/assets/fontawesome/webfonts/fa-regular-400.woff2'
];

// 1. Install Event: Cache each core asset
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Precaching all assets for 100% offline support...');
      for (const url of PRECACHE_ASSETS) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('[SW] Could not precache:', url);
        }
      }
    })
  );
});

// 2. Activate Event: Claim all clients immediately and remove older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Cache-First with flexible path matching for Vercel Clean URLs
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const pathname = url.pathname;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // 1. Try exact match ignoring search params
      let cached = await cache.match(req, { ignoreSearch: true });
      if (cached) return cached;

      // 2. Try pathname match (e.g. /pages/chat)
      cached = await cache.match(pathname, { ignoreSearch: true });
      if (cached) return cached;

      // 3. Try with or without .html extension
      if (pathname.endsWith('.html')) {
        const withoutHtml = pathname.slice(0, -5);
        cached = await cache.match(withoutHtml, { ignoreSearch: true });
        if (cached) return cached;
      } else {
        cached = await cache.match(pathname + '.html', { ignoreSearch: true });
        if (cached) return cached;
      }

      // 4. Try network fetch if online
      try {
        const networkRes = await fetch(req);
        if (networkRes && networkRes.status === 200) {
          cache.put(req, networkRes.clone());
        }
        return networkRes;
      } catch (err) {
        // 5. Offline Fallback for any HTML navigation
        if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
          const fallback = await cache.match('/index.html') || await cache.match('./index.html') || await cache.match('/');
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
