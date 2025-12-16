var staticCacheName = "django-pwa-v1";

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll([
        "/",
        "/static/treinos/style.css",
        "/static/treinos/img/favicon.png",
      ]);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // Se a internet funcionar, retorna a página nova E salva no cache
        return caches.open(staticCacheName).then(function (cache) {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(function () {
        // Se a internet falhar, tenta pegar do cache
        return caches.match(event.request);
      })
  );
});