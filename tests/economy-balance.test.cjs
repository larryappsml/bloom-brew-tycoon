const {test}=require('node:test'),assert=require('node:assert/strict');const B=require('../core.js'),{basic,max}=require('../scripts/economy-audit.cjs');
const state=levels=>Object.assign(B.fresh(),{money:1e6,reputation:90,sessions:14,served:180,levels:{...levels}});
function investment(s,id){return B.UPGRADES.filter(u=>B.roomEconomy(s,u.id)?.id===id).reduce((sum,u)=>sum+Array.from({length:s.levels[u.id]||0},(_,i)=>Math.ceil(u.base*1.65**i)).reduce((n,c)=>n+c,0),0);}
test('opening new areas increases net production and their direct investment pays back in a bounded range',()=>{
 const s=state(basic),e=B.estimate(s),order=['cafe','pilates','yoga','wellness','crossfit','padel'];
 for(let i=1;i<order.length;i++)assert.ok(e.rooms[order[i]]>e.rooms[order[i-1]],order[i]+' should reward its unlock');
 for(const id of order){const minutes=investment(s,id)/(e.rooms[id]*60);assert.ok(minutes>=10&&minutes<=40,id+' payback '+minutes);}
});
test('fully developed areas reward investment while the total remains capped by infrastructure',()=>{
 const s=state(max),e=B.estimate(s),opening=B.estimate(state(basic));for(const id of ['cafe','pilates','yoga','wellness','crossfit','padel']){assert.ok(e.rooms[id]>=opening.rooms[id]*3,id+' growth');const minutes=investment(s,id)/(e.rooms[id]*60);assert.ok(minutes>=10&&minutes<=100,id+' payback '+minutes);}
 for(const [a,b]of [['cafe','pilates'],['pilates','wellness'],['wellness','crossfit'],['crossfit','padel']])assert.ok(e.rooms[b]>e.rooms[a],a+' -> '+b);
 assert.ok(e.total*60<8500,'no exponential net production');assert.equal(e.rooms.branches*60,1260);
});
test('each upgrade level keeps automatic net output finite and never decreases it',()=>{
 for(const base of [Object.fromEntries(B.UPGRADES.map(u=>[u.id,1])),max]){
 for(const u of B.UPGRADES){const s=state(base);s.levels[u.id]=0;let before=B.estimate(s).total;for(let i=1;i<=u.max;i++){s.levels[u.id]=i;const after=B.estimate(s).total;assert.ok(Number.isFinite(after));assert.ok(after+1e-8>=before,u.id+' level '+i+' reduced income');before=after;}}}
});
test('upgrade preview uses incremental net income, never mutates the save and warns about bottlenecks',()=>{
 const s=state(basic),saved=JSON.stringify(s),v=B.upgradeEconomy(s,'padelKit');assert.ok(v.deltaPerMinute>0);assert.ok(v.paybackMinutes>0);assert.equal(JSON.stringify(s),saved);
 assert.equal(B.upgradeEconomy(s,'not-real'),null);s.levels.padelKit=3;assert.equal(B.upgradeEconomy(s,'padelKit'),null);
 const manual=B.fresh();manual.money=1000;assert.equal(B.upgradeEconomy(manual,'machine').paybackMinutes,null);
});
test('salaries and fees of a treatment are captured once and survive later staff changes within the session',()=>{
 const s=state({wellnessWing:1,pressotherapy:1,therapist:1});s.arrival=1e6;s.treatmentArrival=1e6;B.startTreatment(s,'pressotherapy',()=>.5);const a=s.treatments[0];assert.equal(a.salary,8);assert.equal(a.price,90);s.levels.therapist=2;s.levels.pressureCare=3;
 for(let i=0;i<900&&!s.completedServices.pressotherapy;i++)B.step(s,.1,1800000000000+i*100,()=>.99);
 assert.equal(s.completedServices.pressotherapy,1);assert.equal(s.earned,90);assert.equal(s.expenses,20);
});

test('productive final-level upgrades recover their price within an hour in a developed balanced centre',()=>{
 for(const u of B.UPGRADES){const s=state({...max,[u.id]:u.max-1}),v=B.upgradeEconomy(s,u.id);if(v?.paybackMinutes!==null&&v?.paybackMinutes!==undefined)assert.ok(v.paybackMinutes<=60,u.id+' needs '+v.paybackMinutes+' minutes');}
});
