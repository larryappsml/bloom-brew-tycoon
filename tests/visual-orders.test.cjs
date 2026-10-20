const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../core.js'),C=require('../clocks.js'),L=require('../layout.js');
const now=1800000000000;
function until(s,fn,limit=100,rng=()=>.25){for(let i=0;i<limit*10&&!fn();i++)B.step(s,.1,now+i*100,rng);assert.ok(fn(),'simulation reached the requested phase');}
test('clock centres identify all recipes and activities using icons, never countdown digits',()=>{
  const text=[],ctx=new Proxy({fillText:s=>text.push(s)}, {get:(o,k)=>o[k]||(()=>{})});
  for(const p of B.PRODUCTS)for(const kind of ['prepare','consume']){C.drawClock(ctx,0,0,5,10,kind,12,p.id);assert.equal(text.at(-1),p.icon);}
  for(const kind of ['pilates','yoga','massage','pressotherapy']){C.drawClock(ctx,0,0,5,10,kind);assert.equal(text.at(-1),C.iconFor(kind));}
  assert.equal(text.length,18);assert.ok(text.every(t=>!/[0-9]/.test(t)));
});
test('new recipes require their equipment and become real orders with ingredient and staff costs',()=>{
  const s=B.fresh(now);s.money=100000;for(const id of ['latteBar','cakeDisplay','toastKitchen','pilatesBands','soundRitual','aromaMassage'])assert.equal(B.purchase(s,id),false,id);
  s.levels={machine:1,pastries:1,barista:1,matcha:1,spa:1};assert.deepEqual(B.menu(s).map(p=>p.id),['coffee','breakfast','matcha','smoothie']);
  for(const id of ['latteBar','cakeDisplay','toastKitchen']){assert.equal(B.purchase(s,id),true);const product={latteBar:'latte',cakeDisplay:'cake',toastKitchen:'toast'}[id],before=B.orderPrice(s,product),duration=B.orderDuration(s,product);while(B.purchase(s,id)){}assert.equal(s.levels[id],3);assert.ok(B.orderPrice(s,product)>before);assert.ok(B.orderDuration(s,product)<duration);}
  assert.equal(B.menu(s).length,7);
  for(const product of B.PRODUCTS){const visit=B.fresh(now);visit.levels={...s.levels};visit.arrival=1e6;const index=B.menu(visit).findIndex(p=>p.id===product.id),rng=()=>((index+.1)/7);B.spawn(visit,rng);assert.equal(visit.queue[0].product,product.id);until(visit,()=>visit.served===1,60,rng);assert.equal(visit.earned,B.orderPrice(visit,product.id));assert.equal(visit.expenses,product.cost+.65);assert.ok(Number.isFinite(visit.money));}
  const saved=B.validate(JSON.parse(JSON.stringify(s)),now);assert.deepEqual(saved.levels,s.levels);assert.equal(B.menu(saved).length,7);
});
test('premium activities charge materials and preserve capacity with finite margins',()=>{
  const s=B.fresh(now);s.money=100000;s.levels={mat:1,wellnessWing:1,massage:1,yogaWing:1,yoga:1};const price=B.params(s).classPrice,yoga=B.serviceConfig(s,'yoga'),massage=B.serviceConfig(s,'massage');
  for(const id of ['pilatesBands','soundRitual','aromaMassage']){while(B.purchase(s,id)){}assert.equal(s.levels[id],2);}
  assert.equal(B.params(s).classPrice,price+8);assert.equal(B.params(s).capacity,4);assert.equal(B.serviceConfig(s,'yoga').price,yoga.price+8);assert.equal(B.serviceConfig(s,'yoga').cost,yoga.cost+1);assert.equal(B.serviceConfig(s,'massage').price,massage.price+24);assert.equal(B.serviceConfig(s,'massage').cost,massage.cost+2);
  s.arrival=1e6;B.startClass(s);until(s,()=>s.classPhase==='active');const n=s.classSeats;until(s,()=>s.sessions===1);assert.equal(s.students,n);assert.equal(s.expenses,n*3);assert.equal(s.earned,n*48);
});
test('all seven serving models use shared finite geometry within two draw meshes',async()=>{
  const {buildServing}=await import('../scene3d.mjs');const THREE=await import('../vendor/three.module.min.mjs');
  for(const p of B.PRODUCTS){const a=buildServing(p.id),b=buildServing(p.id);assert.equal(a.userData.product,p.id);let meshes=0;a.traverse(o=>{if(o.isMesh){meshes++;for(const x of o.geometry.attributes.position.array)assert.ok(Number.isFinite(x));}});assert.ok(meshes>=1&&meshes<=2);assert.equal(a.children[0].geometry,b.children[0].geometry);const bounds=new THREE.Box3().setFromObject(a);assert.ok(bounds.max.y>.2);assert.ok(bounds.max.x-bounds.min.x<1);}
  assert.notDeepEqual(buildServing('coffee').children[0].geometry.attributes.color.array,buildServing('matcha').children[0].geometry.attributes.color.array);
});
test('a real dish moves from preparation to customer to the reserved table and clears on exit',async()=>{
  const {Venue3D,buildWorld}=await import('../scene3d.mjs'),THREE=await import('../vendor/three.module.min.mjs');
  const s=B.fresh(now);s.arrival=1e6;s.levels={barista:1,pastries:1};B.spawn(s,()=>.75);const v={people:new Map(),scene:new THREE.Scene(),world:{},time:1,reduced:false};const render=()=>Venue3D.prototype.updatePeople.call(v,s,.1);
  until(s,()=>s.queue[0]?.stage==='preparing');render();const actor=v.people.get(s.queue[0].id);assert.equal(actor.serving.userData.product,'breakfast');assert.equal(actor.serving.position.y,1.51);
  until(s,()=>s.seated.length===1);render();const g=s.seated[0];assert.equal(g.stage,'walkingToSeat');assert.equal(actor.serving.scale.x,.7);
  until(s,()=>g.stage==='consuming');render();const table=L.tables(s)[g.seat.table];assert.equal(actor.serving.position.x,table[0]+(g.seat.x<table[0]?-.34:.34));assert.equal(actor.serving.position.z,table[1]+.22);assert.equal(actor.serving.position.y,1.065);
  until(s,()=>g.stage==='exiting');render();assert.equal(actor.serving,null);until(s,()=>!s.departing.length);render();assert.equal(v.people.size,0);assert.equal(v.scene.children.length,0);
  let staticDishes=0;buildWorld(s).root.traverse(o=>{if(o.name.startsWith('Consumición:'))staticDishes++;});assert.equal(staticDishes,0);
});
test('premium bands, sound waves and aroma are visible only during their actual activities',async()=>{
  const {Venue3D}=await import('../scene3d.mjs'),THREE=await import('../vendor/three.module.min.mjs');const s=B.fresh(now);s.arrival=1e6;s.levels={mat:1,pilatesBands:1,wellnessWing:1,massage:1,aromaMassage:1,yogaWing:1,yoga:1,soundRitual:1};B.startClass(s);B.startTreatment(s,'massage',()=>0);B.startTreatment(s,'yoga',()=>0);
  const v={people:new Map(),scene:new THREE.Scene(),world:{},time:1,reduced:true};until(s,()=>s.classPhase==='active'&&s.treatments.every(t=>t.stage==='active'));B.step(s,.1,now,()=>0);Venue3D.prototype.updatePeople.call(v,s,.1);
  for(const kind of ['band','aroma','sound'])assert.ok([...v.people.values()].some(p=>p.effectKind===kind&&p.taskEffect.visible),kind);
  s.classRemaining=.05;for(const t of s.treatments)t.remaining=.05;B.step(s,.1,now,()=>0);Venue3D.prototype.updatePeople.call(v,s,.1);assert.ok([...v.people.values()].every(p=>!p.taskEffect?.visible));
});
test('new stations add geometry per level and keep the full static world within its draw budget',async()=>{
  const {buildWorld,batchStaticWorld}=await import('../scene3d.mjs');const s=B.fresh(now);for(const u of B.UPGRADES)s.levels[u.id]=u.max;
  for(const id of ['latteBar','cakeDisplay','toastKitchen','pilatesBands','soundRitual','aromaMassage']){const full=buildWorld(s).root.getObjectByName('upgrade:'+id);assert.ok(full);let a=0,b=0;full.traverse(o=>{if(o.isMesh)a++;});const max=s.levels[id];s.levels[id]=1;buildWorld(s).root.getObjectByName('upgrade:'+id).traverse(o=>{if(o.isMesh)b++;});assert.ok(a>b,id);s.levels[id]=max;}
  const world=buildWorld(s);batchStaticWorld(world.root);let calls=0;world.root.traverse(o=>{if(o.isMesh)calls++;});assert.ok(calls<150,`static draw calls ${calls}`);
});
