'use strict';
const CACHE='bloom-brew-v1.12.1';
const ASSETS=['./','./index.html','./layout.js','./traffic.js','./progression.js','./sports.js','./clocks.js','./decor3d.mjs','./sports3d.mjs','./experience.js','./core.js','./scene.js','./scene2d.js','./scene3d.mjs','./vendor/three.module.min.mjs','./vendor/three.core.min.mjs','./demo.js','./game.js','./styles.css','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
// Activate after the previous game is closed, so an open game never mixes asset versions.
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('bloom-brew-')&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url),scope=new URL(self.registration.scope);
  if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(event.request,{ignoreSearch:true});
    if(cached)return cached;
    try{return await fetch(event.request);}catch(error){
      if(event.request.mode==='navigate')return (await cache.match('./index.html'))||Response.error();
      return Response.error();
    }
  })());
});
