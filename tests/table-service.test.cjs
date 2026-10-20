const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../core.js');
const now=1800000000000;
function until(s,predicate,limit=90){for(let i=0;i<limit*10&&!predicate();i++)B.step(s,.1,now+i*100,()=>0);assert.ok(predicate());}
test('table service requires a barista, has three progressive purchases and caps every product at 30 percent',()=>{
  const s=B.fresh(now);s.money=10000;assert.equal(B.purchase(s,'tableService'),false);s.levels.barista=1;
  const base=B.PRODUCTS.map(p=>[p.id,B.consumptionTime(p.id,0,s),B.consumptionTime(p.id,3,s)]);
  const prices=[];for(let n=1;n<=3;n++){prices.push(B.price(s,B.UPGRADES.find(u=>u.id==='tableService')));assert.equal(B.purchase(s,'tableService'),true);for(const [id,a,b]of base){assert.ok(Math.abs(B.consumptionTime(id,0,s)-a*(1-n*.1))<1e-8);assert.ok(Math.abs(B.consumptionTime(id,3,s)-b*(1-n*.1))<1e-8);}}
  assert.deepEqual(prices,[180,297,491]);assert.equal(B.purchase(s,'tableService'),false);assert.equal(s.money,9032);
  s.levels.tableService=100;for(const [id,a]of base)assert.ok(Math.abs(B.consumptionTime(id,0,s)-a*.7)<1e-8);
});
test('faster consumption frees the actual reserved seat earlier without changing preparation, price or sale count',()=>{
  function visit(level){const s=B.fresh(now);s.levels={barista:1,tableService:level};s.arrival=1e6;B.spawn(s,()=>0);until(s,()=>s.seated.length===1);
    assert.equal(s.served,1);const g=s.seated[0],duration=g.duration;until(s,()=>g.stage==='consuming');const seatedAt=s.seconds;until(s,()=>g.stage==='exiting');assert.ok(Math.abs(s.seconds-seatedAt-duration)<.11);assert.equal(s.served,1);assert.equal(s.earned,5);assert.equal(s.money,23.15);assert.ok(g.reservedSeat);until(s,()=>!g.reservedSeat,5);return s.seconds;}
  const slow=visit(0),fast=visit(3);assert.ok(slow-fast>7,'a max-level coffee clears its seat over seven seconds sooner');
  const s=B.fresh(now),duration=B.orderDuration(s,'coffee'),price=B.orderPrice(s,'coffee');s.levels.tableService=3;assert.equal(B.orderDuration(s,'coffee'),duration);assert.equal(B.orderPrice(s,'coffee'),price);
});
test('buying table service preserves a current guest clock and applies to the next order',()=>{
  const s=B.fresh(now);s.levels.barista=1;s.money=10000;s.arrival=1e6;B.spawn(s,()=>0);until(s,()=>s.seated[0]?.stage==='consuming');const guest=s.seated[0],remaining=guest.remaining,total=guest.duration;
  assert.equal(B.purchase(s,'tableService'),true);assert.equal(guest.remaining,remaining);assert.equal(guest.duration,total);
  B.spawn(s,()=>0);until(s,()=>s.served===2);const next=s.seated.find(g=>g.id!==guest.id);assert.ok(next.duration<total);assert.equal(next.duration,B.consumptionTime('coffee',0,s));
  const restored=B.validate(JSON.parse(JSON.stringify(s)),now);assert.equal(restored.levels.tableService,1);assert.equal(restored.money,s.money);assert.equal(restored.served,s.served);
  const old=B.validate({version:2,money:1234,levels:{barista:1,seats:2}},now);assert.equal(B.level(old,'tableService'),0);assert.equal(old.money,1234);
});
test('offline estimate improves only when seat capacity is the cafe bottleneck and remains finite',()=>{
  const s=B.fresh(now);s.levels={barista:1,machine:6};s.reputation=100;const before=B.estimate(s).cafe;s.levels.tableService=3;assert.ok(B.estimate(s).cafe>before);
  s.levels.seats=3;s.levels.cafeWing=1;const plenty=B.estimate(s).cafe;s.levels.tableService=0;assert.equal(B.estimate(s).cafe,plenty,'extra speed does not invent demand');
});
test('each table-service level adds visible trolley details and the model remains clickable',async()=>{
  const {buildWorld,batchStaticWorld,hitZone}=await import('../scene3d.mjs');const s=B.fresh(now);assert.equal(buildWorld(s).root.getObjectByName('upgrade:tableService'),undefined);let previous=0;
  for(let n=1;n<=3;n++){s.levels.tableService=n;const world=buildWorld(s),cart=world.root.getObjectByName('upgrade:tableService');assert.ok(cart);let meshes=0;cart.traverse(o=>{if(o.isMesh)meshes++;});assert.ok(meshes>previous);previous=meshes;batchStaticWorld(world.root);let clicks=0;world.root.traverse(o=>{if(o.isInstancedMesh)o.userData.zones.forEach((id,i)=>{if(id==='tableService'){clicks++;assert.equal(hitZone({object:o,instanceId:i}),'tableService');}});});assert.ok(clicks>0);}
});
