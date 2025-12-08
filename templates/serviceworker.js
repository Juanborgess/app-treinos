var staticCacheName = "django-pwa-v1";

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll([
        "/",
        "/static/treinos/style.css",
        "/static/treinos/img/favicon.png",
        "/static/treinos/execucao.js",
        "/static/treinos/dashboard.js"
      ]);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});