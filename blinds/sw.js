// Service worker de la demo Blinds. Guarda solo la pantalla de acceso, el manifiesto y los íconos.
// La demo descifrada nunca pasa por la red ni por la caché, así la contraseña sigue protegiendo.
const CACHE = 'blinds-demo-v4';
const SHELL = ['/blinds/', '/blinds/index.html', '/blinds/manifest.json', '/blinds/icon-192.png', '/blinds/icon-512.png', '/blinds/icon-512-maskable.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { if(r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; }).catch(() => caches.match(e.request, {ignoreSearch:true})));
});

self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch(_) { d = { title: 'Blinds', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Blinds', { body: d.body || '', icon: '/blinds/icon-192.png', badge: '/blinds/icon-192.png', tag: d.tag || 'blinds', data: { url: d.url || '/blinds/' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '/blinds/', self.location.origin).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const open = list.find(c => c.url.startsWith(self.location.origin + '/blinds'));
    return open ? open.focus() : clients.openWindow(url);
  }));
});
