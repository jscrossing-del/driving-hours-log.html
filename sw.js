const CACHE_NAME = 'driving-log-v1';
const ASSETS = [
  '/driving-hours-log.html/',
  '/driving-hours-log.html/index.html',
  '/driving-hours-log.html/manifest.json',
  '/driving-hours-log.html/icons/icon-192.png',
  '/driving-hours-log.html/icons/icon-512.png',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache app shell; Firebase CDN files cached on first load
      return cache.addAll([
        '/driving-hours-log.html/',
        '/driving-hours-log.html/index.html',
        '/driving-hours-log.html/manifest.json',
        '/driving-hours-log.html/icons/icon-192.png',
        '/driving-hours-log.html/icons/icon-512.png'
      ]).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // For Firebase/Firestore requests: network first (need live data)
  if (event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis.com')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // For everything else: cache first, fall back to network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
