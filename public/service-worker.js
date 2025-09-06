const CACHE_NAME = 'astro-hauler-cache-v1';
// All URLs are relative to the SW registration scope (GitHub Pages subpath)
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './style.css',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
  // Avoid wildcards here; rely on runtime cache for hashed bundles
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
    caches.match(evt.request).then(cached => {
      if (cached) return cached;
      return fetch(evt.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(evt.request, clone));
        return response;
      }).catch(() => cached);
    })
  );
}); 