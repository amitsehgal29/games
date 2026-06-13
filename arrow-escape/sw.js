const CACHE_NAME = 'arrow-escape-v2';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(['./index.html', './icon.svg'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE_NAME).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(cached =>
    fetch(e.request).then(r => {
      if (r && r.status === 200) { const clone = r.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(()=>{}); }
      return r;
    }).catch(() => cached || new Response('Offline', {status:503}))
  ));
});
