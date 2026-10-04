// Origin tkoljonen-wq.github.io on jaettu muiden sovellusten kanssa:
// poistetaan vain tämän sovelluksen omat vanhat välimuistit
const CACHE_PREFIX = 'ostoslista-';
const CACHE = CACHE_PREFIX + 'v3';
const ASSETS = [
  './ostoslista.html',
  './manifest.json',
  './icon.svg',
  './icon-maskable.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network first: hae aina ensin verkosta, käytä välimuistia vain offline-tilassa.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
