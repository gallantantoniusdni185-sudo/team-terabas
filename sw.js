// Service worker Team Terabas: tampilan offline + notifikasi.
const CACHE='team-terabas-v4';
const FILES=['./','index.html','config.js','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return; // data dari Google selalu lewat internet
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
});
// Notifikasi dari server (Firebase Cloud Messaging)
self.addEventListener('push',e=>{
  let j={};try{j=e.data?e.data.json():{}}catch(x){j={data:{body:e.data?e.data.text():''}}}
  const d=j.data||{},n=j.notification||{};
  const title=n.title||d.title||'Team Terabas';
  e.waitUntil(self.registration.showNotification(title,{body:n.body||d.body||'',icon:'icon-192.png',badge:'icon-192.png',tag:d.tag||undefined,renotify:!!d.tag,vibrate:[200,100,200],data:{url:d.url||'./#agenda'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./#agenda',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c){c.navigate&&c.navigate(url);return c.focus()}}return self.clients.openWindow(url)}));
});
