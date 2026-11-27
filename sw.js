// Fourball service worker.
// Scores are live, so the app's own files are network-first: phones always get
// the latest deploy when they have signal, and fall back to the cached copy
// when they don't. Bump VERSION only if you add or rename files in FILES.
const VERSION = 'v1';
const SHELL = `shell-${VERSION}`, RUNTIME = 'runtime-v1';
const DS = '_ds/modernist-cf8d7cfc-b9c0-4def-9741-cbdd89be2e6e/';
const FILES = [
  './', 'Fourball.dc.html', 'support.js', 'manifest.webmanifest',
  DS + 'styles.css', DS + '_ds_bundle.js',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('shell-') && k !== SHELL).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.hostname.endsWith('supabase.co')) return; // live data and realtime, never cached

  if (url.origin === location.origin) {
    // App files: network first, cached copy when offline.
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(SHELL).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true })
      .then(hit => hit || (req.mode === 'navigate' ? caches.match('./') : Response.error()))));
    return;
  }

  // Fonts and the Supabase library: serve cached copy, refresh in the background.
  e.respondWith(caches.open(RUNTIME).then(async c => {
    const hit = await c.match(req);
    const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
