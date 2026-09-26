'use strict';

var CACHE_NAME = 'havanamap-shell-v1';
var SHELL_URLS = [
  './index.html',
  './offline.js',
  './lib/leaflet/leaflet.css',
  './lib/leaflet/leaflet.js',
  './lib/leaflet/leaflet.js.map',
  './lib/leaflet/images/layers.png',
  './lib/leaflet/images/layers-2x.png',
  './lib/leaflet/images/marker-icon.png',
  './lib/leaflet/images/marker-icon-2x.png',
  './lib/leaflet/images/marker-shadow.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_URLS);
    }).then(function () {
      return self.skipWaiting();
    }).catch(function (err) {
      console.error('Error precacheando el shell:', err);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function cachePut(url, response) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.put(url, response);
  }).catch(function () {});
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  var url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(function (cached) {
        var networkFetch = fetch(request).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            cachePut('./index.html', copy);
          }
          return res;
        }).catch(function () {
          return cached;
        });
        return cached || networkFetch;
      }).catch(function () {
        return fetch(request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          cachePut(request, copy);
        }
        return res;
      });
    })
  );
});