(function () {
  'use strict';

  var DB_NAME = 'havanamap-offline';
  var DB_VERSION = 1;
  var STORE = 'tiles';

  function openDB() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function getTile(db, key) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE, 'readonly');
      var req = tx.objectStore(STORE).get(key);
      req.onsuccess = function () {
        if (req.result) resolve(req.result);
        else reject(new Error('not cached'));
      };
      req.onerror = function () { reject(req.error); };
    });
  }

  function putTile(db, key, blob) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(blob, key);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error); };
      tx.onabort = function () { reject(tx.error); };
    });
  }

  function getCacheInfo() {
    return openDB().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction(STORE, 'readonly');
        var cursorReq = tx.objectStore(STORE).openCursor();
        var count = 0, bytes = 0;
        cursorReq.onsuccess = function () {
          var cursor = cursorReq.result;
          if (cursor) {
            count++;
            if (cursor.value && cursor.value.size) bytes += cursor.value.size;
            cursor.continue();
          } else {
            resolve({ count: count, bytes: bytes });
          }
        };
        cursorReq.onerror = function () { resolve({ count: 0, bytes: 0 }); };
      });
    });
  }

  function tileKey(z, x, y) {
    return z + '/' + x + '/' + y;
  }

  function getTileCount() {
    return openDB().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction(STORE, 'readonly');
        var req = tx.objectStore(STORE).count();
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(0); };
      });
    });
  }

  function loadFromBlobOrUrl(tile, blobUrl, done) {
    tile.onload = function () { done(null, tile); };
    tile.onerror = function () { done(null, tile); };
    tile.src = blobUrl;
  }

  function fetchAndCache(tile, key, tileUrl, done) {
    fetch(tileUrl, { credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.blob();
      })
      .then(function (blob) {
        openDB().then(function (db) {
          putTile(db, key, blob).catch(function () {});
        });
        loadFromBlobOrUrl(tile, URL.createObjectURL(blob), done);
      })
      .catch(function () {
        loadFromBlobOrUrl(tile, tileUrl, done);
      });
  }

  window.OfflineTileLayer = L.TileLayer.extend({
    createTile: function (coords, done) {
      var tile = document.createElement('img');
      tile.alt = '';
      var key = tileKey(coords.z, coords.x, coords.y);
      var tileUrl = this.getTileUrl(coords);

      openDB()
        .then(function (db) { return getTile(db, key); })
        .then(function (blob) { loadFromBlobOrUrl(tile, URL.createObjectURL(blob), done); })
        .catch(function () { fetchAndCache(tile, key, tileUrl, done); });

      return tile;
    }
  });

  window.HavanaTiles = {
    openDB: openDB,
    getTile: getTile,
    getTileCount: getTileCount,
    getCacheInfo: getCacheInfo,
    DB_NAME: DB_NAME,
    STORE: STORE
  };
})();
