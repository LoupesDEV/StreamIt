const CACHE_NAME = "streamit-cache-v1";
const urlsToCache = ["/", "/index.html", "/error.html", "/css/base.css", "/css/components.css", "/css/error.css", "/css/forms.css", "/css/layout.css", "/css/responsive.css", "/css/styles.css", "/css/tokens.css", "/css/variables.css", "/js/add.js", "/js/dataLoader.js", "/js/display.js", "/js/error.js", "/js/filters.js", "/js/init.js", "/js/modal.js", "/js/scripts.js", "/js/search.js", "/js/stats.js", "/js/storage.js", "/js/utils.js", "/medias/logo.png", "/data/films_data.json", "/data/series_data.json", "/data/collections.json"];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});
    
self.addEventListener("fetch", (event) => {
    event.respondWith(caches.match(event.request).then((response) => {
        return response || fetch(event.request);
    }));
});
