const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../core.js'),L=require('../layout.js');
const now=1800000000000;
const advance=(s,seconds)=>{const events=[];for(let i=0;i<seconds*10;i++)events.push(...B.step(s,.1,now+i*100,()=>.25));return events;};
test('physical expansions require progression and increase footprint and furniture',()=>{
  const s=B.fresh(now);s.money=1e5;
  assert.equal(B.purchase(s,'cafeWing'),false);assert.equal(B.purchase(s,'wellnessWing'),false);
  assert.equal(B.purchase(s,'pressotherapy'),false);assert.equal(B.purchase(s,'yoga'),false);
  s.served=40;assert.equal(B.purchase(s,'cafeWing'),true);assert.equal(L.footprint(s).area,104);assert.equal(L.tables(s).length,4);
  B.purchase(s,'mat');B.purchase(s,'wellnessWing');B.purchase(s,'yogaWing');B.purchase(s,'classes');
  assert.equal(L.footprint(s).area,184);assert.equal(L.footprint(s).left,-14.1);assert.equal(L.footprint(s).right,14.1);assert.equal(L.footprint(s).back,-12.6);
  assert.equal(B.purchase(s,'pressureCare'),false);B.purchase(s,'pressotherapy');assert.equal(B.purchase(s,'pressureCare'),true);
  for(let i=0;i<10;i++)B.purchase(s,'pressotherapy');assert.equal(B.serviceConfig(s,'pressotherapy').capacity,2);
});
test('treatment reserves a bed, travels from the street, and pays once on completion',()=>{
  const s=B.fresh(now);s.levels={wellnessWing:1,pressotherapy:2};s.arrival=1e6;
  assert.equal(B.startTreatment(s,'pressotherapy',()=>0),true);assert.equal(B.startTreatment(s,'pressotherapy',()=>0),true);assert.equal(B.startTreatment(s,'pressotherapy'),false);
  assert.deepEqual(s.treatments.map(t=>t.slot),[0,1]);advance(s,1);assert.equal(s.money,20);assert.equal(s.treatments[0].stage,'arrival');
  advance(s,19);assert.equal(s.money,20);assert.equal(s.treatments[0].stage,'active');
  const events=advance(s,40);assert.equal(s.treatments.length,0);assert.equal(s.money,176);assert.equal(s.wellnessRevenue,180);assert.equal(s.expenses,24);assert.equal(s.completedServices.pressotherapy,2);assert.equal(events.filter(e=>e.type==='service').length,2);
  advance(s,100);assert.equal(s.completedServices.pressotherapy,2);assert.equal(s.money,176);
});
test('staff automates all services with bounded occupancy, salaries and finite income',()=>{
  const s=B.fresh(now);s.levels={mat:1,coach:1,wellnessWing:1,pressotherapy:2,massage:2,therapist:2,yogaWing:1,yoga:3};
  for(let i=0;i<36000;i++){B.step(s,.1,now+i*100,()=>.25);for(const service of B.SERVICES){const ts=s.treatments.filter(t=>t.service===service.id);assert.ok(ts.length<=B.serviceConfig(s,service.id).capacity);assert.equal(new Set(ts.map(t=>t.slot)).size,ts.length);}}
  for(const id of ['pressotherapy','massage','yoga'])assert.ok(s.completedServices[id]>50,id);
  assert.ok(s.expenses>0);assert.ok(s.money<20+B.estimate(s).total*3600*1.5);assert.ok(B.estimate(s).wellness>0);
  const manual=B.fresh(now);manual.levels={wellnessWing:1,pressotherapy:1};advance(manual,100);assert.equal(manual.completedServices.pressotherapy,0);
});
test('existing v2 saves keep investments and accept new services on export and import',()=>{
  const old={version:2,money:1234,served:60,levels:{seats:5,machine:3},claimed:['first']};const s=B.validate(old,now);
  assert.equal(s.money,1234);assert.equal(L.zones(s).cafe,true);assert.equal(s.levels.seats,5);assert.equal(s.completedServices.yoga,0);
  s.completedServices.pressotherapy=12;s.wellnessRevenue=480;s.levels.wellnessWing=1;s.levels.pressotherapy=2;
  const restored=B.validate(JSON.parse(JSON.stringify(s)),now);assert.equal(restored.completedServices.pressotherapy,12);assert.equal(restored.wellnessRevenue,480);assert.equal(restored.levels.pressotherapy,2);
  for(const bad of [{yoga:-1},{massage:NaN},{x:2},[]])assert.throws(()=>B.validate({...old,completedServices:bad},now));
  const offline=B.offline(restored,now+86400000);assert.equal(offline.duration,14400);assert.equal(B.offline(restored,now+86400000).net,0);
});
test('room layout supplies every pilates place and door waypoints from the pavement',()=>{
  const s=B.fresh(now);s.levels={mat:4,classes:2,reformer:4};assert.equal(L.pilates(s).length,B.params(s).capacity);assert.ok(L.pilates(s).some(x=>x.z<-6.2));
  const route=L.route({x:-11,z:9.25},{x:9.25,z:-2.7},true);assert.ok(route.some(p=>p.x===-.4&&p.z===6.2));assert.ok(route.some(p=>p.x===7.5&&p.z===.8));assert.deepEqual(route.at(-1),{x:9.25,z:-2.7});
});
test('3D rooms, beds and bakery cases follow purchased equipment',async()=>{
  const {buildWorld}=await import('../scene3d.mjs');const s=B.fresh(now);const basic=buildWorld(s);s.levels={wellnessWing:1};const empty=buildWorld(s);
  assert.equal(basic.footprint.area,72);assert.equal(empty.footprint.area,104);assert.equal(empty.serviceSpots.length,0);
  s.levels={wellnessWing:1,pressotherapy:2,massage:1,yogaWing:1,yoga:2,pastries:4};const world=buildWorld(s);
  assert.equal(world.serviceSpots.filter(p=>p.service==='pressotherapy').length,2);assert.equal(world.serviceSpots.filter(p=>p.service==='massage').length,1);assert.equal(world.serviceSpots.filter(p=>p.service==='yoga').length,4);
  let buns=0;world.root.traverse(o=>{if(o.name==='Bollo')buns++;for(const n of [...o.position.toArray(),...o.scale.toArray()])assert.ok(Number.isFinite(n));});assert.equal(buns,12);
});
test('a patient walks in, lies on the assigned lounger with boots and exits after treatment',async()=>{
  const {Venue3D}=await import('../scene3d.mjs'),THREE=await import('../vendor/three.module.min.mjs');
  const s=B.fresh(now);s.levels={wellnessWing:1,pressotherapy:1};B.startTreatment(s,'pressotherapy',()=>0);s.arrival=1e6;for(let i=0;i<400&&s.treatments[0].stage!=='active';i++)B.step(s,.1,now+i*100,()=>0);
  B.step(s,.1,now,()=>0);const v={people:new Map(),scene:new THREE.Scene(),world:{tablePositions:L.tables(s),tableCount:1},time:0,reduced:false};
  for(let i=0;i<600;i++){v.time+=.05;Venue3D.prototype.updatePeople.call(v,s,.05);}
  const patient=[...v.people.values()][0];assert.equal(patient.root.rotation.x,-Math.PI/2);assert.equal(patient.boots.length,2);assert.ok(patient.boots.every(b=>b.visible));assert.equal(patient.root.position.x,L.serviceSlots(s,'pressotherapy')[0].x);
  s.treatments=[];for(let i=0;i<600;i++){v.time+=.05;Venue3D.prototype.updatePeople.call(v,s,.05);}assert.equal(v.people.size,0);
});
