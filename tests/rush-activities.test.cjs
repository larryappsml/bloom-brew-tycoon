const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../core.js'),T=require('../traffic.js');
const now=1800000000000;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} equals ${b}`);
function until(s,predicate){for(let i=0;i<900&&!predicate();i++)B.step(s,.1,now-100000+i*100,()=>0);assert.ok(predicate());}
function cafe(){const s=B.fresh(now);s.arrival=1e6;s.levels.barista=1;B.spawn(s,()=>0);until(s,()=>s.seated[0]?.stage==='consuming');return s;}
test('rush speeds an already-running cafe consumption clock by 25 percent without resetting it',()=>{
  const s=cafe(),plain=structuredClone(s),guest=s.seated[0],remaining=guest.remaining,duration=guest.duration;
  assert.ok(B.rush(s,now));B.step(s,1,now+1000,()=>0);B.step(plain,1,now+1000,()=>0);
  near(guest.remaining,remaining-1.25);near(plain.seated[0].remaining,remaining-1);assert.equal(guest.duration,duration);assert.equal(s.served,plain.served);assert.equal(s.money,plain.money);
  const before=guest.remaining;B.step(s,1,now+20000,()=>0);near(guest.remaining,before-1);assert.equal(B.rush(s,now+20000),false);
});
test('rush speeds an existing pilates class and pays only once for the actual group',()=>{
  const s=B.fresh(now);s.arrival=1e6;s.levels.mat=1;B.startClass(s);until(s,()=>s.classPhase==='active');const remaining=s.classRemaining,duration=s.classDuration,count=s.classSeats;
  B.rush(s,now);B.step(s,1,now+1000,()=>0);near(s.classRemaining,remaining-1.25);assert.equal(s.classDuration,duration);
  s.classRemaining=.5;const events=B.step(s,1,now+2000,()=>0);assert.equal(s.classRemaining,0);assert.equal(s.sessions,1);assert.equal(s.students,count);assert.equal(s.earned,count*40);assert.equal(events.filter(e=>e.type==='class').length,1);
  for(let i=0;i<10;i++)B.step(s,1,now+3000+i*1000,()=>0);assert.equal(s.sessions,1);assert.equal(s.earned,count*40);
});
test('rush speeds active yoga, pressure and massage clocks but does not duplicate rewards',()=>{
  const s=B.fresh(now);s.arrival=1e6;s.levels={wellnessWing:1,pressotherapy:1,massage:1,yogaWing:1,yoga:1};
  for(const service of B.SERVICES)B.startTreatment(s,service.id,()=>0);until(s,()=>s.treatments.every(t=>t.stage==='active'));
  const before=s.treatments.map(t=>({id:t.id,remaining:t.remaining,duration:t.duration}));B.rush(s,now);B.step(s,1,now+1000,()=>0);
  for(const old of before){const t=s.treatments.find(t=>t.id===old.id);near(t.remaining,old.remaining-1.25);assert.equal(t.duration,old.duration);t.remaining=.5;}
  const events=B.step(s,1,now+2000,()=>0);assert.equal(events.filter(e=>e.type==='service').length,3);assert.equal(s.earned,265);assert.equal(s.expenses,34);
  for(let i=0;i<10;i++)B.step(s,1,now+3000+i*1000,()=>0);assert.equal(s.earned,265);assert.deepEqual(Object.fromEntries(['pressotherapy','massage','yoga'].map(id=>[id,s.completedServices[id]])),{pressotherapy:1,massage:1,yoga:1});
});
test('rush keeps preparation at 50 percent faster and never consumes a drink during the walk',()=>{
  const s=B.fresh(now);s.arrival=1e6;B.spawn(s,()=>0);until(s,()=>s.queue[0]?.stage==='waiting');B.startOrder(s);const order=s.queue[0],old=order.remaining;B.rush(s,now);B.step(s,1,now+1000,()=>0);near(order.remaining,old-1.5);
  until(s,()=>s.seated.length===1);const guest=s.seated[0],duration=guest.duration;assert.equal(guest.stage,'walkingToSeat');B.rush(s,now+180000);B.step(s,.1,now+180100,()=>0);assert.equal(guest.remaining,duration);
});
test('rush does not fast-forward a treatment arrival or the shared movement simulation',()=>{
  const s=B.fresh(now);s.arrival=1e6;s.levels={wellnessWing:1,pressotherapy:1};B.startTreatment(s,'pressotherapy',()=>0);const normal=structuredClone(s);B.rush(s,now);
  B.step(s,1,now+1000,()=>0);B.step(normal,1,now+1000,()=>0);assert.deepEqual(s.treatments[0].position,normal.treatments[0].position);assert.equal(s.treatments[0].remaining,s.treatments[0].duration);assert.equal(s.treatments[0].stage,'arrival');assert.equal(T.agents(s).length,1);
});
