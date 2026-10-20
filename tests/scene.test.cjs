const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../core.js');
const scene=()=>import('../scene3d.mjs');
test('3D models reflect cafe and studio upgrades with finite transforms',async()=>{
  const {buildWorld}=await scene();const s=B.fresh();const basic=buildWorld(s);assert.equal(basic.studio,false);assert.equal(basic.tableCount,1);assert.equal(basic.students.length,0);
  s.levels={seats:3,mat:2,reformer:2,coach:1,pastries:1,terrace:1,spa:1};const upgraded=buildWorld(s);assert.equal(upgraded.studio,true);assert.equal(upgraded.tableCount,4);assert.equal(upgraded.students.length,6);assert.equal(upgraded.students.filter(p=>p.premium).length,2);
  let count=0;upgraded.root.traverse(o=>{for(const v of [...o.position.toArray(),...o.scale.toArray()])assert.ok(Number.isFinite(v));if(o.isMesh)count++;});assert.ok(count>200);
});
test('static batching reduces draw objects and preserves clickable zones',async()=>{
  const {buildWorld,batchStaticWorld,hitZone}=await scene();const world=buildWorld(B.fresh());let before=0,after=0,tagged=0;world.root.traverse(o=>{if(o.isMesh)before++;});batchStaticWorld(world.root);
  world.root.traverse(o=>{if(o.isMesh)after++;if(o.isInstancedMesh)o.userData.zones.forEach((zone,i)=>{if(zone){assert.equal(hitZone({object:o,instanceId:i}),zone);tagged++;}});});assert.ok(after<before/3,`${before} -> ${after}`);assert.ok(tagged>20);
});
test('characters have independent animated limbs and shared mesh resources',async()=>{
  const {character}=await scene();const a=character(0),b=character(1,true);assert.equal(a.legs.length,2);assert.equal(a.arms.length,2);a.legs[0].rotation.x=.5;assert.equal(b.legs[0].rotation.x,0);assert.ok(a.root.children.length>0);
});
