/* ============================================
   UMUGANDA - Service Worker (offline shell)
============================================ */
const CACHE_NAME = "umuganda-v6";
const APP_SHELL = [
  "./",
  "./index.html",
  "./login.html",
  "./leader.html",
  "./villager.html",
  "./inspector.html",
  "./css/style.css",
  "./js/script.js",
  "./js/i18n.js",
  "./js/qrcode.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  // App shell: cache-first, fall back to network
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // Cache same-origin GETs opportunistically
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      }).catch(() => {
        // Offline fallback: return the index page for navigation requests
        if (req.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
