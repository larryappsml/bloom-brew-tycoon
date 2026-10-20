const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../core.js');
const now=1800000000000;
const advance=(s,seconds)=>{for(let i=0;i<seconds*10;i++)B.step(s,.1,now+i*100,()=>.25);};
test('orders only pay after preparation, with ingredient costs and one manual station',()=>{
  const s=B.fresh(now);B.spawn(s,()=>.1);B.spawn(s,()=>.1);s.arrival=1000;
  assert.equal(B.startOrder(s),true);assert.equal(B.startOrder(s),false);assert.equal(s.money,20);
  advance(s,2);assert.equal(s.served,0);advance(s,2);assert.equal(s.served,1);
  assert.equal(s.earned,5);assert.equal(s.expenses,1.2);assert.equal(s.money,23.8);
});
test('a coffee machine alone cannot generate passive sales; baristas can',()=>{
  const s=B.fresh(now);s.levels.machine=1;advance(s,60);assert.equal(s.served,0);assert.ok(s.lost>0);
  s.levels.barista=1;advance(s,60);assert.ok(s.served>0);assert.ok(s.expenses>0);
});
test('capacity and patience bound queues and reputation',()=>{
  const s=B.fresh(now);advance(s,3600);
  assert.ok(s.queue.length+s.seated.length<=B.params(s).seats+3);assert.ok(s.lost>0);assert.ok(s.reputation>=20);assert.equal(s.money,20);
});
test('purchase locks and limits enforced in simulation',()=>{
  const s=B.fresh(now);s.money=1e6;assert.equal(B.purchase(s,'coach'),false);assert.equal(B.purchase(s,'second'),false);
  assert.equal(B.purchase(s,'mat'),true);assert.equal(B.purchase(s,'coach'),true);
  for(let i=0;i<10;i++)B.purchase(s,'barista');assert.equal(s.levels.barista,3);
});
test('pilates pays once, counts completed classes, charges instructor salary',()=>{
  const s=B.fresh(now);assert.equal(B.startClass(s),false);s.levels.mat=1;assert.equal(B.startClass(s),true);
  assert.equal(B.startClass(s),false);const seats=s.classSeats;advance(s,46);
  assert.equal(s.sessions,1);assert.equal(s.students,seats);assert.equal(s.earned,seats*12);assert.equal(s.expenses,seats*2);
  s.levels.coach=1;advance(s,90);assert.ok(s.sessions>=3);assert.ok(s.expenses>seats*2);
});
test('offline rewards capped at four hours and cannot be claimed twice',()=>{
  const s=B.fresh(now);s.levels.barista=1;
  const result=B.offline(s,now+86400000);assert.equal(result.duration,14400);
  assert.ok(Math.abs(result.net-B.estimate(s).total*14400*.35)<1e-6);
  const money=s.money;assert.equal(B.offline(s,now+86400000).net,0);assert.equal(s.money,money);
  assert.equal(B.offline(B.fresh(now),now+86400000).net,0);
});
test('legacy cash, levels and claimed rewards survive migration',()=>{
  const old={money:1542.5,earned:5000,served:25,levels:{machine:12,mat:1},claimed:['first'],last:now-1000,boostUntil:now+10000};
  const s=B.validate(old,now);assert.equal(s.money,1542.5);assert.equal(s.levels.machine,12);assert.deepEqual(s.claimed,['first']);assert.equal(s.version,2);assert.equal(s.boostUntil,0);
  assert.equal(B.validate(JSON.parse(JSON.stringify(s)),now).money,s.money);
});
test('reject malformed, nonfinite, hostile and future save files',()=>{
  for(const data of [null,[],{money:-1,levels:{}},{money:Infinity,levels:{}},{money:0,levels:[]},{money:0,levels:{machine:'10'}},{money:0,levels:{evil:1}},{money:0,levels:{},version:99},{money:0,levels:{},claimed:['<script>']}])assert.throws(()=>B.validate(data,now));
});
test('rewards and daily quests pay once, UTC day rolls over',()=>{
  const s=B.fresh(now);s.served=10;assert.equal(B.claim(s,'first'),45);assert.equal(B.claim(s,'first'),0);
  s.daily.count=30;assert.equal(B.claimDaily(s,now),80);assert.equal(B.claimDaily(s,now),0);
  assert.equal(B.claimDaily(s,now+86400000),0);assert.equal(s.daily.count,0);
});
test('rush has a three minute cooldown and no reward multiplier exploit',()=>{
  const s=B.fresh(now);assert.equal(B.rush(s,now),true);assert.equal(B.rush(s,now+30000),false);assert.equal(B.rush(s,now+180000),true);
});
test('one hour simulation remains finite with maximal infrastructure',()=>{
  const s=B.fresh(now);for(const u of B.UPGRADES)s.levels[u.id]=u.max;
  advance(s,3600);assert.ok(s.served>200);assert.ok(s.sessions>50);assert.ok(Number.isFinite(s.money));assert.ok(s.money<1e6);assert.ok(s.earned>=s.expenses);assert.ok(s.queue.length<40);
});
