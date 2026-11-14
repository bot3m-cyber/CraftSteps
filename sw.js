/* CraftSteps Service Worker – Offline-Nutzung der App-Dateien.
   Netzwerk zuerst (immer aktuelle Version online), Cache als Fallback ohne Internet.
   Fremde Hosts (z. B. der Minecraft-Download) werden nie abgefangen. */
const CACHE = 'craftsteps-v0.10.5';
const SHELL = [
  './', 'index.html', 'styles.css', 'app.js', 'core.js', 'schem.js', 'draft-store.js',
  'block-visuals.js', 'vanilla-assets.js', 'assets-ui.js', 'favicon.svg', 'manifest.json',
  'studio.html', 'studio.css', 'studio.js',
  'image-studio.html', 'image-studio.js', 'image-guide.html', 'image-guide.js',
  'image-guides.css', 'image-guides.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('craftsteps-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }).then(hit => {
        if (hit) return hit;
        return request.mode === 'navigate' ? caches.match('index.html') : Response.error();
      }))
  );
});
