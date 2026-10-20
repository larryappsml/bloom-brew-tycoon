const {test}=require('node:test'),assert=require('node:assert/strict');
const B=require('../core.js'),T=require('../traffic.js'),L=require('../layout.js');
const now=1800000000000;
function run(s,seconds,rng=()=>.05){const events=[];for(let i=0;i<seconds*10;i++)events.push(...B.step(s,.1,now+i*100,rng));return events;}
function until(s,check,seconds=180,rng=()=>.05){for(let i=0;i<seconds*10;i++){B.step(s,.1,now+i*100,rng);if(check())return;}assert.fail('Condition not reached');}
test('specialties require infrastructure, trade tariffs and persist their active-play cooldown',()=>{
 const s=B.fresh(now);assert.equal(B.selectSpecialty(s,'brunch'),false);s.levels={pastries:1,mat:1,pressotherapy:1,wellnessWing:1};
 const coffee=B.orderPrice(s,'coffee'),pilates=B.params(s).classPrice,wellness=B.serviceConfig(s,'pressotherapy').price,arrival=B.params(s).arrival;
 assert.equal(B.selectSpecialty(s,'brunch'),true);assert.equal(B.orderPrice(s,'coffee'),coffee*1.12);assert.equal(B.params(s).classPrice,pilates*.92);assert.equal(B.serviceConfig(s,'pressotherapy').price,wellness*.92);assert.ok(B.params(s).arrival<arrival);assert.equal(B.selectSpecialty(s,'active'),false);
 const restored=B.validate(JSON.parse(JSON.stringify(s)),now);assert.equal(restored.specialty,'brunch');assert.equal(restored.specialtyCooldown,120);run(restored,121,()=>.99);assert.equal(B.selectSpecialty(restored,'active'),true);assert.equal(B.params(restored).classPrice,pilates*1.12);
 assert.throws(()=>B.validate({...s,specialty:'invalid'}));assert.throws(()=>B.validate({...s,satisfaction:NaN}));
});
test('a real pilates visitor walks to the cafe, keeps identity and completes exactly two stops',()=>{
 const s=B.fresh(now);s.levels={mat:1,barista:2,machine:3,seats:3,matcha:1};s.arrival=1e6;s.premiumArrival=300;B.startClass(s);B.step(s,1,now,()=>.05);until(s,()=>s.classGuests[0]?.stage==='ready',20,()=>.99);assert.equal(B.startClass(s),true);
 until(s,()=>s.visits.length>0);const a=s.visits[0],id=a.id,position={...a.position};assert.equal(a.nextService,'cafe');assert.equal(a.outfit,'pilates');assert.ok(a.path.length>0);assert.ok(L.pilates(s).some(p=>Math.hypot(p.x-position.x,p.z-position.z)<.01));
 assert.equal(s.served,0);assert.equal(s.combinedCompleted,0);
 until(s,()=>s.queue.some(v=>v.id===id));assert.equal(s.queue.find(v=>v.id===id).product,'matcha');assert.equal(T.agents(s).filter(v=>v.id===id).length,1);
 until(s,()=>s.combinedCompleted>0);assert.equal(s.combinedCompleted,1);assert.equal(s.served,1);assert.ok(s.departing.some(v=>v.id===id));const earned=s.earned;run(s,20,()=>.99);assert.equal(s.earned,earned);
});
test('a full recovery service creates a bounded wait and abandonment lowers satisfaction without charging',()=>{
 const s=B.fresh(now);s.levels={wellnessWing:1,pressotherapy:1,therapist:1};s.arrival=1e6;s.treatmentArrival=1e6;
 assert.ok(B.startTreatment(s,'pressotherapy',()=>.05));const occupied=s.treatments[0];occupied.stage='active';occupied.path=[];occupied.position={...L.serviceSlots(s,'pressotherapy')[0]};occupied.remaining=1000;
 const a=T.create(s,{x:3,z:5.7},'sport',()=>.05);Object.assign(a,{nextService:'pressotherapy',comboSteps:1,lobbySlot:0,wait:0,patience:2,stage:'visitWaiting',path:[]});s.visits.push(a);
 const money=s.money;run(s,3,()=>.99);assert.equal(s.visits.length,0);assert.equal(s.queueAbandoned,1);assert.equal(s.money,money);assert.equal(s.treatments.length,1);assert.ok(s.satisfaction<85);assert.ok(s.departing.some(g=>g.id===a.id));
});
test('prepared cafe orders waiting for chairs have finite patience and never sell without a seat',()=>{
 const s=B.fresh(now);s.levels={barista:1};s.arrival=1e6;for(const seat of L.cafeSeats(s)){const a=T.create(s,seat,'cafe',()=>.5);Object.assign(a,{seat,stage:'consuming',remaining:1000,path:[],position:{...seat}});s.seated.push(a);}
 B.spawn(s,()=>.5);const a=s.queue[0];a.position={...a.destination};a.path=[];a.stage='preparing';a.remaining=0;a.duration=3;a.patience=1;run(s,2,()=>.99);assert.equal(s.served,0);assert.equal(s.money,20);assert.equal(s.queueAbandoned,1);
});
test('premium suit visitor pays a production-scaled tip once after consuming, never on arrival',()=>{
 const s=B.fresh(now);s.levels={barista:1,machine:3,seats:2};s.premiumArrival=0;s.arrival=1e6;
 run(s,.1,()=>.5);assert.equal(s.premiumTips,0);const a=s.queue.find(v=>v.premium);assert.ok(a);assert.equal(a.outfit,'premium');assert.ok(s.premiumArrival>=180&&s.premiumArrival<=300);
 until(s,()=>s.seated.some(v=>v.id===a.id),60,()=>.5);assert.equal(s.premiumTips,0);
 const tip=Math.round(Math.max(15,B.estimate(s).total*60*.75)*100)/100;until(s,()=>s.premiumVisits===1,100,()=>.5);assert.equal(s.premiumTips,tip);assert.ok(a.premiumTipPaid);run(s,30,()=>.5);assert.equal(s.premiumTips,tip);
 const loaded=B.validate(JSON.parse(JSON.stringify(s)),now);assert.equal(loaded.premiumTips,tip);assert.equal(loaded.premiumVisits,1);assert.equal(T.agents(loaded).length,0);B.offline(loaded,now+3600000);assert.equal(loaded.premiumTips,tip);
});
test('premium visitors leaving an unattended queue do not leave a tip',()=>{
 const s=B.fresh(now);s.arrival=1e6;B.spawn(s,()=>.5,true);run(s,100,()=>.99);assert.equal(s.premiumTips,0);assert.equal(s.premiumVisits,0);assert.equal(s.queueAbandoned,1);
});

test('sports visitors continue to recovery without duplicated identities, slots or free services',()=>{
 const s=B.fresh(now);s.levels={padelWing:1,padelCourt:1,wellnessWing:1,pressotherapy:1,therapist:1};s.arrival=1e6;s.treatmentArrival=1e6;B.startSport(s,'padel');
 until(s,()=>s.visits.length>0,150,()=>.05);assert.equal(s.sportSessions.padel,1);assert.equal(s.visits.length,4);const ids=s.visits.map(a=>a.id);assert.ok(s.visits.every(a=>a.nextService==='pressotherapy'&&a.outfit==='padel'));assert.equal(s.completedServices.pressotherapy,0);
 for(let i=0;i<2000;i++){B.step(s,.1,now+i*100,()=>.99);const all=T.agents(s);assert.equal(new Set(all.map(a=>a.id)).size,all.length);assert.ok(s.treatments.length<=1);}
 assert.ok(s.combinedCompleted>0);assert.ok(s.queueAbandoned>0);assert.ok(s.completedServices.pressotherapy>0);assert.ok(ids.some(id=>!T.agents(s).some(a=>a.id===id)));
});
