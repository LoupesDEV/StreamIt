const CACHE_NAME = "streamit-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/404.html",
  "/pages/add.html",
  "/pages/films.html",
  "/pages/series.html",
  "/pages/stats.html",
  "/pages/watching.html",
  "/css/404.css",
  "/css/add.css",
  "/css/films.css",
  "/css/index.css",
  "/css/series.css",
  "/css/stats.css",
  "/css/watching.css",
  "/js/404.js",
  "/js/add.js",
  "/js/films.js",
  "/js/index.js",
  "/js/series.js",
  "/js/stats.js",
  "/js/watching.js",
  "/medias/logo.png",
  "/data/films.data_json",
  "/data/series_data_json",
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