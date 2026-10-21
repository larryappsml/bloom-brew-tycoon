const {test}=require('node:test'),assert=require('node:assert/strict');
const B=require('../core.js'),L=require('../layout.js'),T=require('../traffic.js'),R=require('../activities.js');
const now=1800000000000;
test('seven wings require progression and equipment, grow the centre, preserve old saves and bounded investments',()=>{
  const s=B.fresh(now);s.money=1e8;
  for(const r of R){assert.equal(B.purchase(s,r.id+'Wing'),false);assert.equal(B.purchase(s,r.id),false);}
  s.levels={mat:1,crossfitWing:1};const area=B.params(s).area;
  for(const r of R){assert.equal(B.purchase(s,r.id+'Wing'),true);assert.equal(B.purchase(s,r.id+'Staff'),false);assert.equal(B.purchase(s,r.id),true);assert.equal(L.serviceSlots(s,r.id).length,2);assert.equal(B.purchase(s,r.id+'Staff'),true);const c=B.serviceConfig(s,r.id);assert.ok(c.price>c.cost+c.salary);const e=B.roomEconomy(s,r.id);assert.ok(e.perMinute>0);assert.equal(e.id,r.id);assert.equal(e.name,r.name);assert.ok(B.upgradeEconomy(s,r.id+'Quality').deltaPerMinute>0);}
  assert.equal(B.params(s).area,area+392);
  const saved=B.validate(JSON.parse(JSON.stringify(s)),now);assert.deepEqual(saved.levels,s.levels);
  const old=B.validate(require('./fixtures/detailed-v2.json'),now);assert.equal(old.money,45000);for(const r of R)assert.equal(old.completedServices[r.id],0);
  for(const r of R){s.levels[r.id]=3;s.levels[r.id+'Quality']=3;s.levels[r.id+'Decor']=3;assert.equal(L.serviceSlots(s,r.id).length,6);assert.equal(B.purchase(s,r.id),false);assert.ok(B.roomEconomy(s,r.id).perMinute<3500);}
  assert.ok(B.estimate(s).total*60<20000);
});
test('every service has real street arrivals, reserved capacity, icon clocks and a single net payment after completion',()=>{
  const C=require('../clocks.js');
  for(const r of R){
    const s=B.fresh(now);s.arrival=1e9;s.treatmentArrival=1e9;s.levels={[r.id+'Wing']:1,[r.id]:1};
    assert.equal(B.startTreatment(s,r.id,()=>.5),true);assert.equal(B.startTreatment(s,r.id,()=>.5),true);assert.equal(B.startTreatment(s,r.id),false);
    const first=s.treatments[0],c=B.serviceConfig(s,r.id);assert.equal(first.stage,'arrival');assert.ok(first.path.some(p=>Math.abs(p.x)===32));assert.equal(C.iconFor(r.id),r.icon);assert.equal(s.earned,0);
    let active=false,completed=false;
    for(let i=0;i<1800;i++){B.step(s,.1,now+i*100,()=>.99);if(first.stage==='active')active=true;if(s.completedServices[r.id]===2){completed=true;break;}}
    assert.ok(active,r.id+' enters its reserved station');assert.ok(completed,r.id+' completes');assert.equal(s.earned,c.price*2);assert.equal(s.expenses,c.cost*2);
    for(let i=0;i<900;i++)B.step(s,.1,now+i*100,()=>.99);assert.equal(s.completedServices[r.id],2);assert.equal(s.earned,c.price*2);assert.equal(s.treatments.length,0);assert.equal(s.departing.length,0);
  }
});
test('all seven automatic rooms remain live together without overlapping clients or capacity inflation',()=>{
  const s=B.fresh(now);s.arrival=1e9;
  for(const r of R)Object.assign(s.levels,{[r.id+'Wing']:1,[r.id]:2,[r.id+'Staff']:1});
  let max=0;for(let i=0;i<1200;i++){B.step(s,.25,now+i*250,()=>.5);const agents=T.agents(s);max=Math.max(max,agents.length);for(const r of R)assert.ok(B.serviceOccupancy(s,r.id)<=4);if(i%8===0)for(let a=0;a<agents.length;a++)for(let b=a+1;b<agents.length;b++)assert.ok(Math.hypot(agents[a].position.x-agents[b].position.x,agents[a].position.z-agents[b].position.z)>=T.GAP-1e-5);}
  for(const r of R)assert.ok(s.completedServices[r.id]>0,r.id+' keeps serving');assert.ok(max<90);assert.ok(Number.isFinite(s.money));
});
test('each new room, capacity and visual upgrade adds finite clickable models',async()=>{
  const {buildWorld,batchStaticWorld,hitZone}=await import('../scene3d.mjs');
  const s=B.fresh(now);for(const r of R)Object.assign(s.levels,{[r.id+'Wing']:1,[r.id]:3,[r.id+'Quality']:3,[r.id+'Decor']:3,[r.id+'Staff']:1});
  const world=buildWorld(s);for(const r of R){let stations=0;world.root.traverse(o=>{if(o.name.startsWith(r.name+' · puesto'))stations++;});assert.equal(stations,6);}
  batchStaticWorld(world.root);const zones=new Set();world.root.traverse(o=>{for(const v of [...o.position,...o.scale])assert.ok(Number.isFinite(v));if(o.isInstancedMesh)for(let i=0;i<o.count;i++)zones.add(hitZone({object:o,instanceId:i}));});for(const r of R)for(const suffix of ['', 'Quality','Decor','Staff'])assert.ok(zones.has(r.id+suffix),r.id+suffix);
});

test('measured activity income and room estimates agree within ten percent in the shared maximum venue',()=>{const report=require('../docs/activities-audit-v1.16.json');for(const row of report){assert.ok(row.completed>=30);assert.ok(Math.abs(row.estimated/row.netPerMinute-1)<.1,row.room);}});
