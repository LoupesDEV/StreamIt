const CACHE_NAME = "streamit-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/error.html",
    "/css/styles.css",
    "/css/error.css",
    "/js/scripts.js",
    "/js/error.js",
    "/medias/logo.png",
    "/data/films_data.json",
    "/data/series_data.json",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});