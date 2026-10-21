const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../core.js'),T=require('../traffic.js'),L=require('../layout.js'),C=require('../clocks.js');
const now=1800000000000;
function until(s,predicate,limit=180,rng=()=>.25){for(let i=0;i<limit*10&&!predicate();i++)B.step(s,.1,now+i*100,rng);assert.ok(predicate(),'sports phase reached within '+limit+' seconds');}
function sporty(){const s=B.fresh(now);s.arrival=1e6;s.levels={crossfitWing:1,functionalStations:3,strengthRig:1,padelWing:1,padelCourt:1};return s;}
test('new zones require real progression, add physical area and unlock equipment and coaches',()=>{
  const s=B.fresh(now);s.money=100000;for(const id of ['crossfitWing','padelWing','functionalStations','padelCourt','functionalCoach','padelCoach'])assert.equal(B.purchase(s,id),false,id);
  s.sessions=6;assert.equal(B.purchase(s,'crossfitWing'),true);assert.equal(B.params(s).area,120);assert.equal(B.purchase(s,'functionalStations'),true);assert.equal(B.purchase(s,'functionalCoach'),true);assert.equal(B.sportConfig(s,'crossfit').capacity,2);
  s.sessions=10;assert.equal(B.purchase(s,'padelWing'),true);assert.equal(B.params(s).area,200);assert.equal(B.purchase(s,'padelCourt'),true);assert.equal(B.purchase(s,'padelCoach'),true);assert.equal(B.sportConfig(s,'padel').capacity,4);assert.equal(B.purchase(s,'padelCourt'),false);
  for(const u of B.UPGRADES)s.levels[u.id]=u.max;assert.equal(B.params(s).area,704);assert.equal(L.footprint(s).back,-38.7);assert.equal(L.sportSlots(s,'crossfit').length,6);assert.equal(L.footprint(s).right,22);
});
test('padel recruits four real players, waits for their arrival, pays once and empties the court',()=>{
  const s=sporty();assert.equal(B.startSport(s,'padel'),true);assert.equal(s.sportsGroups.padel.guests.length,0);assert.equal(s.sportsGroups.padel.remaining,0);assert.equal(B.startSport(s,'padel'),false);
  B.step(s,1,now,()=>.25);const guest=s.sportsGroups.padel.guests[0];assert.equal(guest.stage,'arrival');assert.ok(guest.position.z>8);assert.equal(s.earned,0);
  until(s,()=>s.sportsGroups.padel.phase==='active');const g=s.sportsGroups.padel,ids=g.guests.map(a=>a.id);assert.equal(g.guests.length,4);assert.ok(g.guests.every(a=>a.stage==='playing'&&a.path.length===0));assert.equal(new Set(g.guests.map(a=>a.slot)).size,4);assert.equal(B.startSport(s,'padel'),false);
  until(s,()=>g.phase==='leaving');assert.equal(s.sportSessions.padel,1);assert.equal(s.sportVisits.padel,4);assert.equal(s.earned,1040);assert.equal(s.expenses,96);assert.equal(s.money,964);assert.ok(g.guests.every(a=>a.stage==='exiting'));
  until(s,()=>s.sportsGroups.padel===null);assert.equal(s.earned,1040);until(s,()=>s.sportsCooldown.padel===0);assert.equal(B.startSport(s,'padel'),true);B.step(s,1,now,()=>.25);assert.ok(!ids.includes(s.sportsGroups.padel.guests[0].id));
});
test('padel cannot charge a partial booking or an empty court',()=>{
  const s=sporty();B.startSport(s,'padel');let attempts=0;const rng=()=>attempts++<4?.25:.99;
  until(s,()=>s.sportsGroups.padel===null,120,rng);assert.equal(s.sportSessions.padel,0);assert.equal(s.earned,0);assert.equal(s.money,20);
  const empty=sporty();B.startSport(empty,'padel');until(empty,()=>empty.sportsGroups.padel===null,40,()=>.99);assert.equal(empty.earned,0);assert.equal(empty.sportVisits.padel,0);
});
test('functional groups use only real attendees and hired coaches automate both sports with salaries',()=>{
  const s=sporty();B.startSport(s,'crossfit');until(s,()=>s.sportsGroups.crossfit.phase==='active');const n=s.sportsGroups.crossfit.guests.length;assert.equal(n,6);until(s,()=>s.sportSessions.crossfit===1);assert.equal(s.sportVisits.crossfit,n);assert.equal(s.earned,n*278);assert.equal(s.expenses,n*18);
  const auto=sporty();auto.levels.functionalCoach=1;auto.levels.padelCoach=1;until(auto,()=>auto.sportSessions.crossfit>=2&&auto.sportSessions.padel>=2,300);assert.ok(auto.expenses>0);assert.ok(auto.sportsRevenue>0);assert.ok(B.estimate(auto).sports>0);assert.ok(T.agents(auto).length<40);
});
test('rush accelerates an existing sporting session without changing its duration or multiplying fees',()=>{
  const s=sporty();B.startSport(s,'padel');until(s,()=>s.sportsGroups.padel.phase==='active');const g=s.sportsGroups.padel,before=g.remaining,total=g.duration;B.rush(s,now);B.step(s,1,now+1000,()=>.25);assert.ok(Math.abs(g.remaining-(before-1.25))<1e-8);assert.equal(g.duration,total);g.remaining=.1;B.step(s,1,now+2000,()=>.25);assert.equal(s.earned,1040);assert.equal(s.sportSessions.padel,1);assert.equal(C.iconFor('padel'),'🎾');assert.equal(C.iconFor('crossfit'),'🏋️');
});
test('sport statistics and old chapter rewards survive import while active groups reset safely',()=>{
  const s=sporty();s.sportSessions={crossfit:4,padel:3};s.sportVisits={crossfit:20,padel:12};s.sportsRevenue=900;s.chapters=B.CHAPTERS.slice(0,6).map(c=>c.id);B.startSport(s,'padel');const restored=B.validate(JSON.parse(JSON.stringify(s)),now);assert.deepEqual(restored.sportSessions,s.sportSessions);assert.deepEqual(restored.sportVisits,s.sportVisits);assert.equal(restored.sportsRevenue,900);assert.equal(restored.sportsGroups.padel,null);assert.equal(restored.chapters.length,6);assert.equal(B.chapterStatus(restored).id,'strength');
  for(const bad of [{sportSessions:{evil:2}},{sportVisits:{padel:-1}},{sportsRevenue:NaN},{sportSessions:[]}])assert.throws(()=>B.validate({version:2,money:20,levels:{},...bad},now));
  const old=B.validate({version:2,money:1234,levels:{mat:1}},now);assert.equal(old.money,1234);assert.equal(old.sportSessions.padel,0);assert.equal(old.sportsGroups.crossfit,null);
});
test('sport outfits differ by destination, preserve independent joints and share cached geometry',async()=>{
  const {character,outfitFor}=await import('../scene3d.mjs');const roles=['cafe','pilates','yoga','wellness','crossfit','padel'],geometry=[];
  for(const role of roles){const a=character(0,false,role),b=character(0,false,role);assert.equal(a.root.userData.role,role);const mesh=a.body.children.find(o=>o.isMesh);geometry.push(mesh.geometry);assert.equal(mesh.geometry,b.body.children.find(o=>o.isMesh).geometry);let calls=0;a.root.traverse(o=>{if(o.isMesh){calls++;for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));}});assert.equal(calls,7);a.arms[1].rotation.x=1;assert.equal(b.arms[1].rotation.x,0);}
  assert.equal(new Set(geometry).size,6);assert.equal(outfitFor({type:'sport',sport:'padel'}),'padel');assert.equal(outfitFor({type:'pilates'}),'pilates');assert.equal(outfitFor({type:'treatment',service:'yoga'}),'yoga');assert.equal(outfitFor({type:'treatment',service:'massage'}),'wellness');
  const p=character(0,false,'padel');assert.ok(p.arms[1].children[0].geometry.attributes.position.count>p.arms[0].children[0].geometry.attributes.position.count,'racket is carried in the right hand');
});
test('new rooms, courts and activity props follow purchases and the actual sport phase',async()=>{
  const {Venue3D,buildWorld}=await import('../scene3d.mjs'),THREE=await import('../vendor/three.module.min.mjs');const empty=B.fresh(now);assert.equal(buildWorld(empty).root.getObjectByName('Club de pádel'),undefined);
  const s=sporty(),world=buildWorld(s);assert.ok(world.root.getObjectByName('Club de pádel'));assert.ok(world.root.getObjectByName('Box de entrenamiento'));assert.equal(world.root.getObjectByName('Pelota de pádel').visible,false);B.startSport(s,'crossfit');B.startSport(s,'padel');until(s,()=>s.sportsGroups.crossfit.phase==='active'&&s.sportsGroups.padel.phase==='active');const v={people:new Map(),scene:new THREE.Scene(),world,time:1,reduced:false};Venue3D.prototype.updatePeople.call(v,s,.1);
  const athletes=[...v.people.values()];assert.ok(athletes.some(a=>a.root.userData.role==='crossfit'&&a.taskEffect?.visible&&a.effectKind==='weights'));assert.equal(athletes.filter(a=>a.root.userData.role==='padel').length,4);
  s.sportsGroups.crossfit.remaining=.01;s.sportsGroups.padel.remaining=.01;B.step(s,.1,now,()=>.25);Venue3D.prototype.updatePeople.call(v,s,.1);assert.ok([...v.people.values()].every(a=>!a.taskEffect?.visible));
});
test('long-running sport groups keep distinct positions and continue through many waves',()=>{
  const s=sporty();s.levels.functionalCoach=1;s.levels.padelCoach=1;let random=17;const rng=()=>((random=(Math.imul(random,1664525)+1013904223)>>>0)/4294967296);
  for(let i=0;i<9000;i++){B.step(s,.1,now+i*100,rng);const agents=T.agents(s);for(let a=0;a<agents.length;a++)for(let b=a+1;b<agents.length;b++)assert.ok(Math.hypot(agents[a].position.x-agents[b].position.x,agents[a].position.z-agents[b].position.z)>=T.GAP-.00002);assert.ok(agents.length<30);}
  assert.ok(s.sportSessions.crossfit>=7);assert.ok(s.sportSessions.padel>=6);assert.equal(s.sportVisits.padel,s.sportSessions.padel*4);
});
test('equipment bought during a match applies to the next booking without resetting its clock or tariff',()=>{
  const s=sporty();s.money=20000;B.startSport(s,'padel');until(s,()=>s.sportsGroups.padel.phase==='active');const g=s.sportsGroups.padel,remaining=g.remaining,duration=g.duration,price=g.price;assert.equal(B.purchase(s,'padelKit'),true);assert.equal(g.remaining,remaining);assert.equal(g.duration,duration);assert.equal(g.price,price);assert.ok(B.sportConfig(s,'padel').duration<duration);assert.ok(B.sportConfig(s,'padel').price>price);
});
test('the sporting campaign counts completed groups and claims one bounded reward',()=>{
  const s=sporty();s.levels.functionalCoach=1;s.levels.padelCoach=1;assert.equal(B.startCampaign(s,'sports',now),true);until(s,()=>B.campaignStatus(s).ready,200);assert.equal(s.campaign.count,2);assert.ok(s.sportSessions.crossfit+s.sportSessions.padel>=2);const before=s.money;assert.equal(B.claimCampaign(s,now),220);assert.equal(s.money,before+220);assert.equal(B.claimCampaign(s,now),0);
});
