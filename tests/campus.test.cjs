const {test}=require('node:test'),assert=require('node:assert/strict');
const B=require('../core.js'),L=require('../layout.js'),C=require('../campus.js');
test('campus expansion is continuous and never compresses spacing between customers',()=>{
 for(let x=-18;x<25;x+=.13){const p=C.point({x,z:x*.65}),q=C.point({x:x+.01,z:x*.65+.01});assert.ok(Math.hypot(q.x-p.x,q.z-p.z)>=Math.SQRT2*.01-1e-10);assert.ok(Math.hypot(q.x-p.x,q.z-p.z)<.07);}
 assert.ok(C.x(1.05)-C.x(-.4)>=4);assert.ok(C.x(7.9)-C.x(6.9)>=3);assert.ok(C.z(-5.8)-C.z(-6.8)>=4);
});
test('projected actors and props return exactly to simulation positions after rendering',async()=>{
 const THREE=await import('../vendor/three.module.min.mjs'),{projectActors,restoreActors}=await import('../campus3d.mjs');
 const root=new THREE.Group(),cup=new THREE.Group();root.position.set(1.7,.2,-3.5);cup.position.set(-1.8,1.065,3.05);
 const before=[root.position.clone(),cup.position.clone()];const saved=projectActors([root,cup,root,null]);assert.equal(saved.length,2);assert.equal(root.position.x,C.x(1.7));assert.equal(cup.position.z,C.z(3.05));restoreActors(saved);assert.ok(root.position.equals(before[0]));assert.ok(cup.position.equals(before[1]));
});
test('all original rooms have connected galleries, while cafe and pilates retain continuous extensions',async()=>{
 const {buildWorld,batchStaticWorld,hitZone}=await import('../scene3d.mjs');
 const s=B.fresh();for(const u of B.UPGRADES)s.levels[u.id]=u.max;const before=JSON.stringify(s),w=buildWorld(s);
 assert.ok(w.root.getObjectByName('Paseo central · todas las salas'));assert.ok(w.root.getObjectByName('Vestíbulo y jardines'));assert.equal(JSON.stringify(s),before);
 const hall=w.root.getObjectByName('Paseo central · todas las salas');assert.ok(hall.children.length>25);
 batchStaticWorld(w.root);const zones=new Set();let draws=0;w.root.traverse(o=>{if(o.isMesh)draws++;if(o.isInstancedMesh)for(let i=0;i<o.count;i++)zones.add(hitZone({object:o,instanceId:i}));});
 for(const id of ['machine','seats','mat','yoga','pressotherapy','massage','functionalStations','padelCourt'])assert.ok(zones.has(id),id+' remains clickable');assert.ok(draws<140);assert.equal(L.cafeSeats(s).length,27);
});
