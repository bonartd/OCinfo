// OCinfo Service Worker — klasik betik (iOS 15 modül worker desteklemez).
// Kabuk dosyalarından birini değiştirdiğinizde CACHE sürümünü artırın (AGENTS.md 3.4).
var CACHE = 'ocinfo-v10';

var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/app.css',
  './assets/js/config.js',
  './assets/js/app.js',
  './assets/js/idle.js',
  './assets/js/rotator.js',
  './assets/js/pages/rezervasyon.js',
  './assets/js/pages/anket.js',
  './assets/js/pages/istatistik.js',
  './assets/img/qr-odunccihaz.svg',
  './assets/img/logo-yasar.png',
  './assets/img/icon-180.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './data/kurallar.json',
  './data/istatistik.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      // cache: 'reload' — tarayıcının HTTP önbelleğindeki (GitHub Pages: 10 dk) eski
      // kopyalar yerine her dosya sunucudan taze alınır.
      .then(function (cache) {
        return cache.addAll(SHELL.map(function (url) { return new Request(url, { cache: 'reload' }); }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

// Veri: önce ağ, olmazsa önbellek. Diğer her şey: önce önbellek, olmazsa ağ.
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(function (hit) { return hit || fetch(req); })
    );
    return;
  }

  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          if (res.ok) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        })
        .catch(function () { return caches.match(req); })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
