const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');const B=require('../core.js');
const advanced=()=>B.validate(JSON.parse(fs.readFileSync('tests/fixtures/detailed-v2.json','utf8')));
test('room estimates partition the total without double counting yoga or sport income',()=>{
 const s=advanced(),e=B.estimate(s),sum=Object.values(e.rooms).reduce((n,v)=>n+v,0);
 assert.equal(sum,e.total);assert.ok(Math.abs(e.wellness-e.rooms.wellness-e.rooms.yoga)<1e-9);assert.ok(Math.abs(e.sports-e.rooms.crossfit-e.rooms.padel)<1e-9);
 for(const u of B.UPGRADES){const room=B.roomEconomy(s,u.id);assert.ok(room,u.id);assert.ok(Number.isFinite(room.perMinute)&&room.perMinute>=0,u.id);assert.ok(room.share>=0&&room.share<=100);assert.equal(room.perMinute,e.rooms[room.id]*60);}
 assert.equal(B.roomEconomy(s,'missing'),null);
});
test('room ranking and percentages follow estimated net production and react to specialties',()=>{
 const s=advanced(),rooms=['machine','mat','yoga','wellnessWing','crossfitWing','padelWing','second'].map(id=>B.roomEconomy(s,id));
 const ranked=rooms.filter(r=>r.perMinute>0).sort((a,b)=>b.perMinute-a.perMinute);assert.equal(ranked[0].rank,1);assert.ok(Math.abs(rooms.reduce((n,r)=>n+r.share,0)-100)<1e-8);
 const before=B.roomEconomy(s,'padelCourt').perMinute;assert.ok(B.selectSpecialty(s,'active'));assert.ok(B.roomEconomy(s,'padelCourt').perMinute>before);
 const wellness=B.roomEconomy(s,'wellnessWing');assert.ok(Math.abs(wellness.breakdown.reduce((n,d)=>n+d.perMinute,0)-wellness.perMinute)<1e-8);
});
test('manual and unbuilt rooms are labelled without invented automatic revenue or saved-data changes',()=>{
 const s=B.fresh(),saved=JSON.stringify(s);assert.equal(B.roomEconomy(s,'machine').perMinute,0);assert.match(B.roomEconomy(s,'machine').note,/manual/);assert.match(B.roomEconomy(s,'padelWing').note,/equipamiento/);assert.equal(JSON.stringify(s),saved);
 s.levels={mat:1};assert.equal(B.roomEconomy(s,'mat').perMinute,0);assert.match(B.roomEconomy(s,'mat').note,/manual/);
 s.levels.coach=1;assert.ok(B.roomEconomy(s,'mat').perMinute>0);
});
