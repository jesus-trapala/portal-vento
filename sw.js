/* Portal Vento · service worker
   Red primero: siempre se pide la versión más nueva; la copia guardada solo
   se usa sin señal. Solo archivos de este sitio.
   Al publicar cambios, sube el número de VERSION. */
const VERSION = 'v2';
const CACHE = 'portal-vento-' + VERSION;
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest',
  './iconos/icon-192.png', './iconos/icon-512.png', './iconos/icon-maskable-512.png',
  './iconos/apple-touch-icon.png', './iconos/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('portal-vento-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
