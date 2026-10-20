const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../core.js'),L=require('../layout.js'),T=require('../traffic.js');
const now=1800000000000;
function until(s,predicate,limit=120,rng=()=>.25){for(let i=0;i<limit*10&&!predicate();i++)B.step(s,.1,now+i*100,rng);assert.ok(predicate(),'state reached within '+limit+' seconds');}
test('each cafe visit reserves one real chair, walks there, consumes, then leaves',()=>{
  const s=B.fresh(now);s.levels={barista:3,seats:3,machine:4,terrace:1,cafeWing:1};
  let consumed=0,outside=false,annex=false,highest=0;const seen=new Set();
  for(let i=0;i<6000;i++){
    B.step(s,.1,now+i*100,()=>.25);const reserved=[...s.seated.map(g=>g.seat.key),...s.departing.map(g=>g.reservedSeat).filter(Boolean)];
    assert.equal(new Set(reserved).size,reserved.length);assert.ok(reserved.length<=B.params(s).seats);
    highest=Math.max(highest,s.seated.length);
    for(const g of s.seated){assert.ok(L.cafeSeats(s).some(p=>p.key===g.seat.key));
      if(g.stage==='walkingToSeat')assert.equal(g.remaining,g.duration);
      if(g.stage==='consuming'){assert.equal(g.path.length,0);assert.ok(Math.hypot(g.position.x-g.seat.x,g.position.z-g.seat.z)<.005);if(!seen.has(g.id)){seen.add(g.id);consumed++;}outside||=g.position.z>6.3;annex||=g.position.x<-7.3;}
    }
  }
  assert.ok(consumed>80);assert.ok(highest>=9);assert.ok(outside);assert.ok(annex);assert.ok(s.served>consumed);assert.ok(s.departing.some(g=>g.type==='cafe'));
});
test('pilates boards real visitors, starts after arrival, pays actual attendees once and empties',()=>{
  const s=B.fresh(now);s.levels={mat:4,classes:2};s.arrival=1e6;
  assert.equal(B.startClass(s),true);assert.equal(s.classPhase,'boarding');assert.equal(s.classGuests.length,0);assert.equal(s.classRemaining,0);
  B.step(s,1,now,()=>.25);assert.equal(s.classGuests.length,1);const first=s.classGuests[0];assert.ok(first.position.z>8);assert.equal(first.stage,'arrival');assert.equal(B.startClass(s),false);
  until(s,()=>s.classPhase==='active');const ids=s.classGuests.map(g=>g.id),count=ids.length;assert.ok(count>0&&count<B.params(s).capacity,'demand does not magically fill every machine');
  assert.ok(s.classGuests.every(g=>g.stage==='exercising'&&g.path.length===0));assert.equal(s.classSeats,count);assert.equal(s.earned,0);
  until(s,()=>s.classPhase==='leaving');assert.equal(s.sessions,1);assert.equal(s.students,count);assert.equal(s.earned,count*B.params(s).classPrice);assert.equal(s.expenses,count*2);assert.ok(s.classGuests.every(g=>g.stage==='exiting'));assert.equal(B.startClass(s),false);
  until(s,()=>s.classPhase==='idle');assert.equal(s.classGuests.length,0);const earned=s.earned;until(s,()=>s.classCooldown===0);assert.equal(s.earned,earned);
  assert.equal(B.startClass(s),true);assert.equal(s.classGuests.length,0);B.step(s,1,now,()=>.25);assert.ok(!ids.includes(s.classGuests[0].id));assert.ok(s.classGuests[0].position.z>8);
});
test('manual classes can start early only when all registered visitors have reached their places',()=>{
  const s=B.fresh(now);s.levels={mat:1};s.arrival=1e6;B.startClass(s);let attempts=0;
  const rng=()=>attempts++===0?.25:.99;
  until(s,()=>s.classGuests.length===1&&s.classGuests[0].stage==='ready',20,rng);assert.equal(s.classPhase,'boarding');assert.equal(B.startClass(s),true);assert.equal(s.classSeats,1);
});
test('no demand means no phantom pilates students or class income',()=>{
  const s=B.fresh(now);s.levels={mat:1,coach:1};s.arrival=1e6;
  for(let i=0;i<1200;i++)B.step(s,.1,now+i*100,()=>.99);
  assert.equal(s.students,0);assert.equal(s.sessions,0);assert.equal(s.earned,0);assert.equal(s.classGuests.length,0);
});
test('crowded full centre keeps people apart and continues all services across multiple waves',()=>{
  for(const seed of [1,37]){let random=seed;const rng=()=>((random=(Math.imul(random,1664525)+1013904223)>>>0)/4294967296);
    const s=B.fresh(now);for(const u of B.UPGRADES)s.levels[u.id]=u.max;let previousServed=0,previousClasses=0,maxAgents=0;
    for(let i=0;i<12000;i++){B.step(s,.1,now+i*100,rng);const all=T.agents(s);maxAgents=Math.max(maxAgents,all.length);
      for(let a=0;a<all.length;a++)for(let b=a+1;b<all.length;b++)assert.ok(Math.hypot(all[a].position.x-all[b].position.x,all[a].position.z-all[b].position.z)>=T.GAP-.00002,'no overlapping customers');
      if(i%3000===2999){assert.ok(s.served>previousServed+15,'coffee keeps moving');assert.ok(s.sessions>previousClasses,'classes keep moving');previousServed=s.served;previousClasses=s.sessions;}
    }
    assert.ok(maxAgents<100,'departures are removed');for(const id of ['pressotherapy','massage','yoga'])assert.ok(s.completedServices[id]>15,id+' keeps moving');
  }
});
test('loading an existing save preserves investment but never restores duplicate moving actors',()=>{
  const s=B.fresh(now);s.levels={barista:2,mat:1,coach:1};until(s,()=>s.classPhase==='active');const loaded=B.validate(JSON.parse(JSON.stringify(s)),now);
  assert.equal(loaded.money,s.money);assert.deepEqual(loaded.levels,s.levels);assert.equal(loaded.served,s.served);assert.equal(T.agents(loaded).length,0);assert.equal(loaded.classPhase,'idle');
});
