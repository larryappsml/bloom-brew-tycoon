const {test}=require('node:test');
const assert=require('node:assert/strict');
test('turns take the shortest path across the angle seam and remain frame-rate independent',async()=>{
  const {turn}=await import('../animation3d.mjs');
  const a=Math.PI-.02,b=-Math.PI+.02;
  assert.ok(Math.abs(turn(a,b,.5)-Math.PI)<1e-10);
  const one=turn(0,1,1-Math.exp(-12*.1));let split=0;
  for(let i=0;i<10;i++)split=turn(split,1,1-Math.exp(-12*.01));
  assert.ok(Math.abs(one-split)<1e-10);
});
test('activity animation leaves simulation data intact, keeps finite joints and honours reduced motion',async()=>{
  const {character}=await import('../scene3d.mjs'),{animatePose,snapshot}=await import('../animation3d.mjs');
  for(const activity of [{agent:{id:1,moving:true}},{agent:{id:2},guest:{stage:'consuming'}},{agent:{id:3},service:'yoga',treatment:{stage:'active'}},{agent:{id:4},pilates:{stage:'exercising'}},{agent:{id:5},sport:'crossfit',athlete:{stage:'playing'}},{agent:{id:6},z:-13,sport:'padel',athlete:{stage:'playing'}}]){
    const before=JSON.stringify(activity),p=character(0);
    animatePose(p,activity,2,.033,false,snapshot(p));
    p.root.traverse(o=>{for(const n of [...o.position,...o.rotation.toArray().slice(0,3),...o.scale])assert.ok(Number.isFinite(n));});
    const stillA=character(0),stillB=character(0);animatePose(stillA,activity,1,.033,true);animatePose(stillB,activity,5,.033,true);
    assert.deepEqual(snapshot(stillA),snapshot(stillB));assert.equal(JSON.stringify(activity),before);
  }
});
test('padel rally crosses both halves within the court and reduced motion is stationary',async()=>{
  const {rally}=await import('../animation3d.mjs');let min=Infinity,max=-Infinity;
  for(let i=0;i<300;i++){const p=rally(i/30);min=Math.min(min,p.z);max=Math.max(max,p.z);assert.ok(p.x>=9.9&&p.x<=12.5);assert.ok(p.y>=.45&&p.y<=2.01);assert.ok(p.z>=-14.4&&p.z<=-8.4);}
  assert.ok(min<-14&&max>-9);assert.deepEqual(rally(1,true),rally(9,true));
});
