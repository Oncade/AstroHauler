const CACHE_NAME = 'astro-hauler-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/style.css',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  // Include bundle files that will be generated at build time
  // These paths will depend on your Vite build output
  '/assets/index-*.js',
  '/assets/index-*.css'
  // Note: Add specific game assets as needed
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request)
      .then(cached => cached || fetch(evt.request))
  );
}); 