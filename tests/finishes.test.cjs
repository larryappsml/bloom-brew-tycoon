const {test}=require('node:test'),assert=require('node:assert/strict');const B=require('../core.js'),R=require('../activities.js');
test('finishing details follow owned rooms without buying equipment or changing the save',async()=>{
 const {buildWorld}=await import('../scene3d.mjs');const s=B.fresh(),before=JSON.stringify(s),basic=buildWorld(s);
 assert.ok(basic.finishFeatures.includes('cafe-artisan'));assert.ok(!basic.finishFeatures.includes('pilates-boutique'));for(const r of R)assert.ok(!basic.finishFeatures.includes(r.id+'-signature'));assert.equal(JSON.stringify(s),before);
 for(const u of B.UPGRADES)s.levels[u.id]=u.max;const saved=JSON.stringify(s),w=buildWorld(s);
 for(const name of ['pilates-boutique','yoga-ritual','gym-accessories','padel-club-lounge',...R.map(r=>r.id+'-signature')])assert.ok(w.finishFeatures.includes(name),name);assert.ok(w.root.getObjectByName('finish:gallery-craft'));assert.equal(JSON.stringify(s),saved);
});
test('detailed furnishings remain finite, clickable and batched within the mobile drawing budget',async()=>{
 const {buildWorld,batchStaticWorld,hitZone}=await import('../scene3d.mjs');const s=B.fresh();for(const u of B.UPGRADES)s.levels[u.id]=u.max;
 const w=buildWorld(s);let details=0;w.root.traverse(o=>{if(o.name.startsWith('finish:'))details++;for(const n of [...o.position,...o.scale])assert.ok(Number.isFinite(n));});assert.ok(details>=25);
 batchStaticWorld(w.root);const zones=new Set();let draws=0;w.root.traverse(o=>{if(o.isMesh)draws++;if(o.isInstancedMesh)for(let i=0;i<o.count;i++)zones.add(hitZone({object:o,instanceId:i}));});assert.ok(draws<140,draws+' draw objects');for(const r of R)assert.ok(zones.has(r.id+'Decor'));assert.ok(zones.has('cafeDecor'));
});
