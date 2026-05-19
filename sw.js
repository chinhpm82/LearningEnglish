const CACHE_NAME = 'learningenglish-v19';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './data/vocabulary-data.js',
    './data/sentences-data.js',
    './data/grammar-data.js',
    './data/stories-data.js',
    './data/translation-data.js',
    './data/placement-questions.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Install Event - Caching Assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching App Shell and Assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Cleaning old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Clearing Old Cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // If it is in the cache, return it immediately, but update the cache in background
                if (cachedResponse) {
                    fetch(event.request)
                        .then(networkResponse => {
                            if (networkResponse.status === 200) {
                                caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
                            }
                        })
                        .catch(() => {/* Ignore network errors offline */});
                    return cachedResponse;
                }

                // If not in cache, fetch from network
                return fetch(event.request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return networkResponse;
                });
            })
    );
});
