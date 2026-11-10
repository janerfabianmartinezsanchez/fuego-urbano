const CACHE_NAME = 'fuego-urbano-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './styles/main.css?v=3',
  './js/products.js?v=3',
  './js/cart.js?v=3',
  './js/checkout.js?v=3',
  './js/pwa.js?v=3',
  './js/app.js?v=3',
  './assets/images/logo.jpg',
  './assets/images/burger.jpg',
  './assets/images/salchipapa.jpg',
  './assets/images/perro.jpg',
  './assets/images/mazorcada.jpg',
  './assets/images/bebida.jpg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching app shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => console.warn('[Service Worker] Cache install warning:', err))
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network first bypassing stale HTTP cache, with offline fallback)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isSameOrigin = event.request.url.startsWith(self.location.origin);
  const fetchPromise = isSameOrigin
    ? fetch(event.request, { cache: 'no-cache' })
    : fetch(event.request);

  event.respondWith(
    fetchPromise
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
