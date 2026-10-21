const {test}=require('node:test'),assert=require('node:assert/strict');
const B=require('../core.js'),L=require('../layout.js'),R=require('../activities.js').filter(r=>!['pool','golf','dance'].includes(r.id));
const full=()=>{const s=B.fresh();for(const u of B.UPGRADES)s.levels[u.id]=u.max;return s;};
test('compact wings have two metre separation and all entry and exit paths avoid unrelated rooms',()=>{
 const s=full(),f=L.footprint(s);assert.ok(f.right-f.left<75);
 for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){
  const a=R[i],b=R[j];assert.ok(Math.abs(a.x-b.x)>=10||Math.abs(a.z-b.z)>=11);
 }
 const inside=(p,r)=>Math.abs(p.x-r.x)<3.98&&Math.abs(p.z-r.z)<4.48;
 for(const r of R)for(const spot of L.serviceSlots(s,r.id)){
  for(const path of [L.entryRoute(spot),[{x:spot.x,z:spot.z},...L.exitRoute({...spot,activity:r.id})]]){
   for(let i=1;i<path.length;i++)for(let t=0;t<=1;t+=.05){const p={x:path[i-1].x+(path[i].x-path[i-1].x)*t,z:path[i-1].z+(path[i].z-path[i-1].z)*t};for(const other of R)if(other.id!==r.id)assert.ok(!inside(p,other),r.id+' crosses '+other.id);}
  }
 }
 const old=require('./fixtures/detailed-v2.json');assert.deepEqual(L.tables(s).slice(0,4),L.tables(old).slice(0,4));assert.deepEqual(L.pilates(s).slice(0,10).map(p=>[p.x,p.z]),L.pilates(old).slice(0,10).map(p=>[p.x,p.z]));
});
test('seven architectural identities and the galleries survive rendering and static batching',async()=>{
 const {ROOM_THEMES}=await import('../activities3d.mjs'),{buildWorld,batchStaticWorld,hitZone}=await import('../scene3d.mjs');
 assert.equal(new Set(Object.values(ROOM_THEMES).map(t=>t.name)).size,10);
 const w=buildWorld(full()),found=new Set();let hall;
 w.root.traverse(o=>{if(o.userData.theme)found.add(o.userData.theme);if(o.name==='Galerías del centro')hall=o;});
 assert.equal(found.size,10);assert.ok(hall);assert.ok(hall.children.length>10);
 batchStaticWorld(w.root);const zones=new Set();let draws=0;w.root.traverse(o=>{if(o.isMesh)draws++;if(o.isInstancedMesh)for(let i=0;i<o.count;i++)zones.add(hitZone({object:o,instanceId:i}));});
 for(const r of R)assert.ok(zones.has(r.id));assert.ok(draws<140,'mobile static draw budget');
});
test('new activity props animate only actual sessions and render without changing money or timers',async()=>{
 const {Venue3D}=await import('../scene3d.mjs'),THREE=await import('../vendor/three.module.min.mjs');
 for(const r of R){const s=B.fresh();s.arrival=s.treatmentArrival=1e9;s.levels={[r.id+'Wing']:1,[r.id]:1};B.startTreatment(s,r.id,()=>.5);const a=s.treatments[0],v={people:new Map(),scene:new THREE.Scene(),world:{},time:1,reduced:false};
  for(let i=0;i<1200&&(a.stage!=='active'||a.moving);i++)B.step(s,.1,1800000000000+i*100,()=>.99);
  assert.equal(a.stage,'active');const before=JSON.stringify(s);
  for(const time of [1,1.1,1.2]){v.time=time;Venue3D.prototype.updatePeople.call(v,s,.1);const p=v.people.get(a.id);assert.equal(p.effectKind,r.id);assert.ok(p.taskEffect.visible);p.root.traverse(o=>{for(const n of [...o.position,...o.scale])assert.ok(Number.isFinite(n));});}
  assert.equal(JSON.stringify(s),before);s.treatments=[];Venue3D.prototype.updatePeople.call(v,s,.1);assert.equal(v.people.size,0);assert.equal(v.scene.children.length,0);
 }
});
