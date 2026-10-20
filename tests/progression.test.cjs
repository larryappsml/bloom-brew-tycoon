const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../core.js'),P=require('../progression.js');
const now=1800000000000;
function advance(s,seconds,rng=()=>0){const events=[];for(let i=0;i<seconds*10;i++)events.push(...B.step(s,.1,now+i*100,rng));return events;}
test('chapters recognise existing progress, require their tasks, and pay once in sequence',()=>{
  const s=B.fresh(now);assert.equal(B.claimChapter(s),0);s.served=5;s.levels.machine=1;assert.equal(B.chapterStatus(s).ready,true);assert.equal(B.claimChapter(s),35);assert.equal(s.money,55);assert.equal(B.chapterStatus(s).id,'team');assert.equal(B.claimChapter(s),0);
  for(const u of B.UPGRADES)s.levels[u.id]=u.max;s.served=250;s.sessions=20;s.completedServices={pressotherapy:6,massage:6,yoga:4};let total=35;
  while(!B.chapterStatus(s).complete)total+=B.claimChapter(s);assert.equal(total,1675);assert.equal(s.chapters.length,6);assert.equal(s.money,20+total);assert.equal(s.earned,0);assert.equal(B.claimChapter(s),0);
  const loaded=B.validate(JSON.parse(JSON.stringify(s)),now);assert.deepEqual(loaded.chapters,s.chapters);assert.equal(loaded.money,s.money);assert.equal(B.claimChapter(loaded),0);
});
test('legacy games acquire new progress safely and hostile chapter or campaign data is rejected',()=>{
  const s=B.validate({version:2,money:2000,served:90,levels:{machine:2,barista:1,pastries:1}},now);assert.deepEqual(s.chapters,[]);assert.equal(B.chapterStatus(s).ready,true);assert.equal(s.campaign,null);assert.equal(s.money,2000);
  const base={version:2,money:0,levels:{}};for(const extra of [{chapters:['team']},{chapters:['aroma','aroma']},{chapters:'aroma'},{campaignWins:-1},{campaign:{id:'<script>',tier:0,count:0,remaining:10}},{campaign:{id:'coffee',tier:3,count:0,remaining:10}},{campaign:{id:'coffee',tier:0,count:9,remaining:10}},{campaign:{id:'coffee',tier:0,count:0,remaining:Infinity}},{campaignDaily:{day:'<script>',wins:0}},{campaignDaily:{day:'2027-01-15',wins:4}}])assert.throws(()=>B.validate({...base,...extra},now));
});
test('campaigns are optional, require their unlocked services and never cost entry money',()=>{
  const s=B.fresh(now);assert.equal(B.startCampaign(s,'brunch',now),false);assert.equal(B.startCampaign(s,'wellness',now),false);assert.equal(B.startCampaign(s,'invalid',now),false);assert.equal(B.startCampaign(s,'coffee',now),true);assert.equal(s.money,20);assert.equal(B.startCampaign(s,'coffee',now),false);assert.equal(B.cancelCampaign(s),true);assert.equal(B.cancelCampaign(s),false);
  s.levels.pastries=1;assert.equal(B.startCampaign(s,'brunch',now),true);assert.equal(B.campaignStatus(s).target,6);B.cancelCampaign(s);s.levels.mat=1;assert.equal(B.startCampaign(s,'wellness',now),true);
});
test('coffee challenges count newly delivered real orders and reward only after explicit claim',()=>{
  const s=B.fresh(now);s.levels.barista=1;assert.equal(B.startCampaign(s,'coffee',now),true);const events=advance(s,150);assert.equal(B.campaignStatus(s).ready,true);assert.equal(s.campaign.count,8);assert.equal(events.filter(e=>e.type==='campaignReady').length,1);assert.equal(s.rewards,0);assert.ok(s.served>=8);
  const money=s.money,earned=s.earned;assert.equal(B.claimCampaign(s,now),60);assert.equal(s.money,money+60);assert.equal(s.earned,earned);assert.equal(s.rewards,60);assert.equal(B.claimCampaign(s,now),0);assert.equal(s.campaignWins,1);assert.equal(s.campaign,null);
});
test('wellness challenges count finished classes and treatments, never arrivals or offline estimates',()=>{
  const s=B.fresh(now);s.levels={mat:1,coach:1,wellnessWing:1,pressotherapy:1,therapist:1};B.startCampaign(s,'wellness',now);advance(s,10);assert.equal(s.campaign.count,0);advance(s,150);const actual=s.sessions+s.completedServices.pressotherapy;assert.ok(actual>=3);assert.equal(s.campaign.count,3);assert.equal(B.campaignStatus(s).ready,true);assert.equal(B.claimCampaign(s,now),160);
  B.startCampaign(s,'wellness',now);const remaining=s.campaign.remaining;B.offline(s,now+3600000);assert.equal(s.campaign.count,0);assert.equal(s.campaign.remaining,remaining);
});
test('campaign expiry or cancellation never removes cash and emits its notice once',()=>{
  const s=B.fresh(now);s.arrival=1e6;B.startCampaign(s,'coffee',now);const events=advance(s,310);assert.equal(B.campaignStatus(s).expired,true);assert.equal(s.money,20);assert.equal(s.rewards,0);assert.equal(events.filter(e=>e.type==='campaignExpired').length,1);assert.equal(B.claimCampaign(s,now),0);B.cancelCampaign(s);assert.equal(B.startCampaign(s,'coffee',now),true);assert.equal(s.campaign.count,0);assert.equal(s.campaign.remaining,300);
});
test('three prizes per UTC day and bounded challenge tiers prevent unlimited reward loops',()=>{
  const s=B.fresh(now);for(let i=0;i<3;i++){assert.equal(B.startCampaign(s,'coffee',now),true);P.tick(s,1,Array.from({length:8},()=>({type:'sale',productId:'coffee'})),now);assert.equal(B.claimCampaign(s,now),60);}
  assert.equal(s.money,200);assert.equal(B.startCampaign(s,'coffee',now),false);assert.equal(B.startCampaign(s,'coffee',now+86400000),true);assert.equal(s.campaignDaily.wins,0);assert.equal(B.campaignStatus(s).target,10);assert.equal(B.campaignStatus(s).reward,80);
  B.cancelCampaign(s);s.campaignWins=1000000;B.startCampaign(s,'coffee',now+86400000);assert.equal(B.campaignStatus(s).target,12);assert.equal(B.campaignStatus(s).reward,100);
});
test('an unfinished campaign survives save/import with remaining time and its counted services',()=>{
  const s=B.fresh(now);B.startCampaign(s,'coffee',now);P.tick(s,20,[{type:'sale',productId:'coffee'},{type:'sale',productId:'coffee'},{type:'sale',productId:'cake'},{type:'class'}],now);assert.equal(s.campaign.count,2);const restored=B.validate(JSON.parse(JSON.stringify(s)),now);assert.deepEqual(restored.campaign,s.campaign);assert.equal(restored.campaign.remaining,280);assert.equal(restored.campaign.count,2);
});
test('choosing brunch changes incoming orders toward unlocked target recipes without spawning extra people',()=>{
  function sample(withCampaign){const s=B.fresh(now);s.levels={pastries:1,matcha:1,spa:1,latteBar:1,cakeDisplay:1,toastKitchen:1};if(withCampaign)B.startCampaign(s,'brunch',now);let random=17,brunch=0;const rng=()=>((random=(Math.imul(random,1664525)+1013904223)>>>0)/4294967296);for(let i=0;i<1000;i++){s.queue=[];B.spawn(s,rng);assert.equal(s.queue.length,1);if(['breakfast','cake','toast'].includes(s.queue[0].product))brunch++;}return brunch;}
  const normal=sample(false),focused=sample(true);assert.ok(focused>normal+200,`${normal} normal, ${focused} focused`);
});
test('chapter trophies and campaign banners are driven by persistent state, not levels',async()=>{
  const {buildWorld,worldStamp}=await import('../scene3d.mjs');const s=B.fresh(now),stamp=worldStamp(s);assert.equal(buildWorld(s).root.getObjectByName('Colección de capítulos'),undefined);s.chapters=['aroma'];assert.notEqual(worldStamp(s),stamp);assert.ok(buildWorld(s).root.getObjectByName('Colección de capítulos'));
  B.startCampaign(s,'coffee',now);const campaignStamp=worldStamp(s);assert.ok(buildWorld(s).root.getObjectByName('Campaña del centro'));s.campaign.remaining-=10;assert.equal(worldStamp(s),campaignStamp,'time changes do not rebuild the world');s.campaign.remaining=0;assert.notEqual(worldStamp(s),campaignStamp);assert.equal(buildWorld(s).root.getObjectByName('Campaña del centro'),undefined);
});
