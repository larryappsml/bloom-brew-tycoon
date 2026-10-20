const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const B=require('../core.js'),C=require('../clocks.js');
const now=1800000000000;
const advance=(s,seconds)=>{for(let i=0;i<seconds*10;i++)B.step(s,.1,now+i*100,()=>.25);};
const context2D=()=>new Proxy({createLinearGradient:()=>({addColorStop(){}})}, {get:(target,key)=>key in target?target[key]:()=>{}});

test('clock fill advances from zero to full and handles invalid or completed times',()=>{
  assert.equal(C.progress(30,30),0);assert.equal(C.progress(15,30),.5);assert.equal(C.progress(0,30),1);assert.equal(C.progress(-1,30),1);assert.equal(C.progress(50,30),0);assert.equal(C.progress(1,0),0);assert.equal(C.progress(NaN,30),0);
  const ctx=context2D(),arcs=[],text=[];ctx.arc=(...v)=>arcs.push(v);ctx.fillText=value=>text.push(value);
  assert.equal(C.drawClock(ctx,20,30,15,30,'pilates'),true);assert.ok(Math.abs(arcs.at(-1)[4]-Math.PI/2)<1e-9);assert.equal(text.length,0);
  C.drawClock(ctx,20,30,-1,30,'prepare');assert.equal(text.length,0);assert.equal(C.drawClock(ctx,20,30,NaN,30,'prepare'),false);
});
test('buying faster equipment does not reset the duration of an ongoing service',()=>{
  const s=B.fresh(now);s.money=1e5;s.levels={machine:1,mat:1,wellnessWing:1,pressotherapy:1};s.arrival=1000;
  B.startClass(s);for(let i=0;i<900&&s.classPhase!=='active';i++)B.step(s,.1,now+i*100,()=>.25);B.spawn(s,()=>0);advance(s,15);B.startOrder(s);B.startTreatment(s,'pressotherapy');
  const order=s.queue[0],orderTotal=order.duration,classTotal=s.classDuration,treatment=s.treatments[0],treatmentTotal=treatment.duration;
  advance(s,1);const oldRemaining=order.remaining;
  B.purchase(s,'brewBar');B.purchase(s,'studioMirror');B.purchase(s,'pressurePump');
  assert.ok(B.orderDuration(s,'coffee')<orderTotal);assert.ok(B.params(s).classTime<classTotal);assert.ok(B.serviceConfig(s,'pressotherapy').duration<treatmentTotal);
  assert.equal(order.duration,orderTotal);assert.equal(order.remaining,oldRemaining);assert.equal(s.classDuration,classTotal);assert.equal(treatment.duration,treatmentTotal);
  advance(s,1);assert.ok(C.progress(order.remaining,order.duration)>C.progress(oldRemaining,orderTotal));
});
test('new room upgrades have prerequisites, bounded levels and real economic effects',()=>{
  const s=B.fresh(now);s.money=1e6;for(const id of ['brewBar','bakeryOven','cafeLounge','pilatesKit','studioMirror','studioAudio','yogaBolsters','zenGarden','yogaTea','pressurePump','massageStones','wellnessLinen'])assert.equal(B.purchase(s,id),false,id);
  s.served=40;s.levels={machine:1,pastries:1,mat:1,cafeWing:1,wellnessWing:1,pressotherapy:1,massage:1,yogaWing:1,yoga:1};
  const before={coffee:B.orderPrice(s,'coffee'),breakfast:B.orderPrice(s,'breakfast'),classPrice:B.params(s).classPrice,classTime:B.params(s).classTime,pressure:B.serviceConfig(s,'pressotherapy'),massage:B.serviceConfig(s,'massage'),yoga:B.serviceConfig(s,'yoga')};
  for(const id of ['brewBar','bakeryOven','cafeLounge','pilatesKit','studioMirror','studioAudio','yogaBolsters','zenGarden','yogaTea','pressurePump','massageStones','wellnessLinen']){assert.equal(B.purchase(s,id),true,id);while(B.purchase(s,id)){}assert.equal(B.level(s,id),B.UPGRADES.find(u=>u.id===id).max);}
  assert.ok(B.orderPrice(s,'coffee')>before.coffee);assert.ok(B.orderPrice(s,'breakfast')>before.breakfast);assert.ok(B.params(s).classPrice>before.classPrice);assert.ok(B.params(s).classTime<before.classTime);
  for(const id of ['pressotherapy','massage','yoga']){const c=B.serviceConfig(s,id),old=id==='pressotherapy'?before.pressure:before[id];assert.ok(c.price-c.cost>old.price-old.cost);assert.ok(c.duration>=15);}
  const restored=B.validate(JSON.parse(JSON.stringify(s)),now);assert.deepEqual(restored.levels,s.levels);assert.ok(Number.isFinite(B.estimate(restored).total));
});
test('each new furnishing exists in 3D and higher levels add physical details within a draw budget',async()=>{
  const {buildWorld,batchStaticWorld}=await import('../scene3d.mjs');const s=B.validate(JSON.parse(fs.readFileSync('tests/fixtures/detailed-v2.json','utf8')),now);
  const full=buildWorld(s),ids=['brewBar','bakeryOven','cafeLounge','pilatesKit','studioMirror','studioAudio','yogaBolsters','zenGarden','yogaTea','pressurePump','massageStones','wellnessLinen'];
  for(const id of ids){assert.ok(full.detailFeatures.includes(id));const fullGroup=full.root.getObjectByName('upgrade:'+id);assert.ok(fullGroup);s.levels[id]=1;const one=buildWorld(s),oneGroup=one.root.getObjectByName('upgrade:'+id);let a=0,b=0;fullGroup.traverse(o=>{if(o.isMesh)a++;});oneGroup.traverse(o=>{if(o.isMesh)b++;});assert.ok(a>b,id+' adds details at higher levels');s.levels[id]=B.UPGRADES.find(u=>u.id===id).max;}
  batchStaticWorld(full.root);let draws=0;full.root.traverse(o=>{if(o.isMesh)draws++;for(const n of [...o.position.toArray(),...o.scale.toArray()])assert.ok(Number.isFinite(n));});assert.ok(draws<140,'static mesh draw count '+draws);
});
test('3D timers use each customer and student clock and exclude arriving treatments',async()=>{
  const {Venue3D}=await import('../scene3d.mjs');const s=B.fresh(now);s.classSeats=2;s.classRemaining=20;s.classDuration=40;
  const pos={x:1,y:0,z:2},people=new Map([[1,{root:{position:pos},activity:{order:{remaining:2,duration:4}}}],[2,{root:{position:pos},activity:{guest:{stage:'consuming',remaining:9,duration:18}}}],[3,{root:{position:pos},activity:{service:'pressotherapy',treatment:{stage:'arrival',remaining:30,duration:30}}}],[4,{root:{position:pos},activity:{service:'massage',treatment:{stage:'active',remaining:15,duration:30}}}]]);
  people.set(5,{root:{position:pos},activity:{pilates:{stage:'exercising'}}});people.set(6,{root:{position:pos},activity:{pilates:{stage:'exercising'}}});let entries;const v={people,students:[{root:{visible:true,position:pos}},{root:{visible:true,position:pos}}],camera:{zoom:.8},clockLayer:{draw:e=>entries=e},clockVector:{set(){return this;},project(){return {x:0,y:0,z:0};}}};
  Venue3D.prototype.drawClocks.call(v,s);assert.deepEqual(entries.map(e=>e.kind),['prepare','consume','massage','pilates','pilates']);assert.ok(entries.every(e=>C.progress(e.remaining,e.duration)===.5));
});
test('Canvas fallback draws matching clocks for cafe, pilates and active wellness',()=>{
  const s=B.fresh(now);s.levels={mat:1,wellnessWing:1,pressotherapy:1};B.spawn(s,()=>0);B.startOrder(s);B.startClass(s);B.startTreatment(s,'pressotherapy');s.treatments[0].stage='active';s.seated.push({id:100,type:'cafe',kind:0,stage:'consuming',position:{x:-5.81,z:.33},remaining:9,duration:18,product:'coffee'});s.queue[0].remaining=2;s.queue[0].duration=4;s.queue[0].stage='preparing';s.classRemaining=20;s.classDuration=40;s.classGuests=[{id:101,type:'pilates',kind:1,stage:'exercising',position:{x:1.7,z:-3.5}}];
  const kinds=[],ctx={window:{Bloom:B,BloomLayout:require('../layout.js'),BloomTraffic:require('../traffic.js'),BloomClocks:{drawClock:(...v)=>kinds.push(v[5])}}};vm.runInNewContext(fs.readFileSync('scene2d.js','utf8'),ctx);
  const venue=Object.create(ctx.window.VenueScene2D.prototype);Object.assign(venue,{ctx:context2D(),people:new Map(),reduced:false});venue.draw(s,1,.1);
  for(const kind of ['prepare','consume','pilates','pressotherapy'])assert.ok(kinds.includes(kind),kind);
});
test('clock overlay tracks viewport, ignores offscreen clients and frees its canvas',()=>{
  const previous=global.document,canvas={style:{},dataset:{},setAttribute(){},getContext:()=>context2D(),remove(){this.removed=true;}};
  global.document={createElement:()=>canvas};let appended;
  try{const layer=new C.ClockLayer({parentElement:{append:c=>appended=c},getBoundingClientRect:()=>({width:390,height:844})});
    layer.draw([{x:0,y:0,z:0,remaining:5,duration:10,kind:'consume'},{x:0,y:0,z:2,remaining:5,duration:10,kind:'massage'}],v=>v,.8);
    assert.equal(appended,canvas);assert.equal(canvas.style.pointerEvents,'none');assert.equal(canvas.dataset.count,'1');assert.equal(JSON.parse(canvas.dataset.services).consume,1);assert.equal(canvas.width,390);assert.equal(canvas.height,844);
    layer.destroy();assert.equal(canvas.removed,true);
  }finally{global.document=previous;}
});
test('clients follow the same route in real time when browser drawing is throttled',async()=>{
  const {walkPath}=await import('../scene3d.mjs'),L=require('../layout.js');const start={x:-11,z:9.25},end={x:12.05,z:-2.7};
  const smooth={...start},slow={...start},a=L.route(start,end,true),b=L.route(start,end,true);
  for(let i=0;i<18*30;i++)walkPath(smooth,a,3.5/30);for(let i=0;i<18;i++)walkPath(slow,b,3.5);
  assert.deepEqual(smooth,end);assert.deepEqual(slow,end);assert.equal(a.length,0);assert.equal(b.length,0);
});
test('character batching keeps independent joints with seven shared draw meshes and articulated knees',async()=>{
  const {character}=await import('../scene3d.mjs'),a=character(0),b=character(0);let count=0;a.root.traverse(o=>{if(o.isMesh){count++;for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));}});
  assert.equal(count,7);assert.equal(a.knees.length,2);assert.equal(a.body.children.find(o=>o.isMesh).geometry,b.body.children.find(o=>o.isMesh).geometry);
  a.arms[0].rotation.x=.8;assert.equal(b.arms[0].rotation.x,0);assert.equal(a.arms[1].rotation.x,0);
});
