const CACHE_NAME = "streamit-cache-v1";
const urlsToCache = ["/", "/index.html", "/error.html", "/css/error.css", "/css/responsive.css", "/css/style.css", "/css/variables.css", "/js/dataLoader.js", "/js/display.js", "/js/errorHandler.js", "/js/main.js", "/js/utils.js", "/medias/logo.png", "/data/films.json", "/data/series.json", "/data/collections.json", "/data/notifs.json", "/data/actors.json"];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(caches.match(event.request).then((response) => {
        return response || fetch(event.request);
    }));
});
