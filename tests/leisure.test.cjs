const {test}=require('node:test'),assert=require('node:assert/strict');
const B=require('../core.js'),L=require('../layout.js'),R=require('../activities.js');
const ids=['pool','golf','dance'],now=1800000000000;
function fresh(id){const s=B.fresh(now);s.arrival=s.treatmentArrival=1e9;s.levels={[id+'Wing']:1,[id]:1};return s;}
function until(s,p,seconds=240){for(let i=0;i<seconds*4&&!p();i++)B.step(s,.25,now+i*250,()=>.99);assert.ok(p(),'phase reached');}
test('new leisure venues require progression, add their real area and unlock bounded upgrades',()=>{
 const s=B.fresh(now);s.money=1e8;for(const id of ids){assert.equal(B.purchase(s,id+'Wing'),false);assert.equal(B.purchase(s,id),false);}
 s.levels={mat:1,crossfitWing:1,wellnessWing:1,padelWing:1};const area=B.params(s).area;
 for(const id of ids){assert.equal(B.purchase(s,id+'Wing'),true);assert.equal(B.purchase(s,id+'Staff'),false);assert.equal(B.purchase(s,id),true);assert.equal(B.purchase(s,id+'Staff'),true);for(const suffix of ['', 'Quality','Decor'])while(B.purchase(s,id+suffix)){}assert.equal(L.serviceSlots(s,id).length,6);assert.equal(B.purchase(s,id),false);assert.ok(B.roomEconomy(s,id).perMinute>0);assert.ok(B.upgradeEconomy({...s,levels:{...s.levels,[id+'Quality']:1}},id+'Quality').deltaPerMinute>0);}
 assert.equal(B.params(s).area,area+1736);assert.deepEqual(B.validate(JSON.parse(JSON.stringify(s)),now).levels,s.levels);
 const old=B.validate(require('./fixtures/detailed-v2.json'),now);for(const id of ids)assert.equal(old.completedServices[id],0);
});
test('pool golf and dance charge only after real arrivals and finishing, then release their places',()=>{
 for(const id of ids){const s=fresh(id),c=B.serviceConfig(s,id);assert.ok(B.startTreatment(s,id,()=>.5));assert.ok(B.startTreatment(s,id,()=>.5));assert.equal(B.startTreatment(s,id),false);assert.equal(s.earned,0);
  const guests=[...s.treatments];until(s,()=>guests.every(a=>a.stage==='active'));assert.equal(s.earned,0);until(s,()=>s.completedServices[id]===2);assert.equal(s.earned,c.price*2);assert.equal(s.expenses,c.cost*2);assert.equal(s.treatments.length,0);
  until(s,()=>!s.departing.length,180);assert.equal(s.earned,c.price*2);assert.ok(B.startTreatment(s,id));
 }
});
test('new venues have safe distinct approaches and the golf course is a large outdoor footprint',()=>{
 const s=B.fresh();for(const id of ids)Object.assign(s.levels,{[id+'Wing']:1,[id]:3});const golf=R.find(r=>r.id==='golf'),pool=R.find(r=>r.id==='pool');assert.ok(golf.width>=50&&golf.width>golf.depth*1.7);assert.ok(golf.width*golf.depth>pool.width*pool.depth*5);
 for(const id of ids)for(const spot of L.serviceSlots(s,id)){const path=L.entryRoute(spot);assert.deepEqual(path.at(-1),{x:spot.x,z:spot.z});for(let i=1;i<path.length;i++)for(let t=0;t<=1;t+=.1){const p={x:path[i-1].x+(path[i].x-path[i-1].x)*t,z:path[i-1].z+(path[i].z-path[i-1].z)*t};for(const r of R)if(r.id!==id)assert.ok(!(Math.abs(p.x-r.x)<r.width/2-.05&&Math.abs(p.z-r.z)<r.depth/2-.05),id+' crosses '+r.id);}}
});
test('swimmers golfers and dancers use dedicated outfits and poses without modifying sessions',async()=>{
 const {Venue3D,outfitFor}=await import('../scene3d.mjs'),THREE=await import('../vendor/three.module.min.mjs'),{snapshot}=await import('../animation3d.mjs');
 for(const id of ids){const s=fresh(id);B.startTreatment(s,id,()=>.5);const a=s.treatments[0];until(s,()=>a.stage==='active'&&!a.moving);const v={people:new Map(),scene:new THREE.Scene(),world:{},time:1,reduced:false},before=JSON.stringify(s);Venue3D.prototype.updatePeople.call(v,s,.1);const p=v.people.get(a.id),pose=snapshot(p);assert.equal(outfitFor(a),{pool:'swim',golf:'golf',dance:'dance'}[id]);v.time=2;Venue3D.prototype.updatePeople.call(v,s,.1);assert.notDeepEqual(snapshot(p),pose);assert.equal(p.effectKind,id);assert.equal(JSON.stringify(s),before);assert.ok(p.taskEffect.visible);if(id==='pool')assert.ok(p.root.position.z<a.position.z);s.treatments=[];Venue3D.prototype.updatePeople.call(v,s,.1);assert.equal(v.scene.children.length,0);}
});
