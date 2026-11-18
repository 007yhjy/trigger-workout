const CACHE='trigger28-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.hostname.includes('script.google')) return;            // 시트 전송은 캐시하지 않음
  if(url.origin===location.origin){                               // 앱 파일: 네트워크 우선, 실패 시 캐시 (업데이트 반영 + 오프라인 동작)
    e.respondWith(fetch(req).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return r; })
      .catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
  } else if(/fonts\.(googleapis|gstatic)\.com/.test(url.hostname)){ // 글꼴: 캐시 우선
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return res; })));
  }
});
