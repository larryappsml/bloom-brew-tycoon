const {test}=require('node:test'),assert=require('node:assert/strict'),B=require('../core.js'),T=require('../traffic.js'),L=require('../layout.js');
test('golfers occupy dispersed points, walk between stops and finish exactly once',()=>{
 const s=B.fresh();s.arrival=s.treatmentArrival=1e9;s.levels={golfWing:1,golf:3};const spots=L.serviceSlots(s,'golf');assert.ok(Math.max(...spots.map(p=>p.x))-Math.min(...spots.map(p=>p.x))>30);assert.ok(new Set(spots.map(p=>p.z)).size>3);
 B.startTreatment(s,'golf',()=>.5);const guest=s.treatments[0],first={...guest.destination};let visited=0,walked=false,expected=guest.price;
 for(let i=0;i<1500&&s.completedServices.golf===0;i++){B.step(s,.25,Date.now(),()=>.99);visited=Math.max(visited,guest.golfStop||0);walked||=guest.stage==='active'&&guest.moving;}
 assert.equal(visited,2);assert.ok(walked);assert.notDeepEqual(guest.position,first);assert.equal(s.completedServices.golf,1);assert.equal(s.earned,expected);for(let i=0;i<600;i++)B.step(s,.25,Date.now(),()=>.99);assert.equal(s.completedServices.golf,1);assert.equal(s.departing.length,0);
});
test('a busy pavement clears outgoing visitors even when old departure points are occupied',()=>{
 const s=B.fresh(),obstacles=[{id:900,position:{x:21,z:8.5},path:[],stage:'waiting'},{id:901,position:{x:-23,z:9.25},path:[],stage:'waiting'}];s.queue=obstacles;
 for(let i=0;i<48;i++){const a={id:i+1,position:{x:-19+(i%16)*2.5,z:7+Math.floor(i/16)*.7},path:[],stage:'active',destination:{}};T.exit(a);s.departing.push(a);}
 for(let tick=0;tick<720&&s.departing.length;tick++){T.advance(s,.25);s.departing=s.departing.filter(a=>a.path.length);const all=T.agents(s);for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)assert.ok(Math.hypot(all[i].position.x-all[j].position.x,all[i].position.z-all[j].position.z)>=T.GAP-.00002);}
 assert.equal(s.departing.length,0);assert.equal(s.queue.length,2);
});
test('golf cart follows a closed perimeter, remains outside playing stops and respects reduced motion',async()=>{
 const {cartPose,buildGolfCart,animateGolfCart}=await import('../leisure-motion.mjs'),{buildWorld,createGolfCart,batchStaticWorld}=await import('../scene3d.mjs');let minX=Infinity,maxX=-Infinity;for(let t=0;t<100;t+=.25){const p=cartPose(t);assert.ok(Number.isFinite(p.heading));assert.ok(Math.abs(p.x)<=24&&p.z>=-13&&p.z<=11.3);minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);assert.ok(Math.abs(p.x)>=23.9||p.z<=-12.9||p.z>=11.2);}assert.ok(maxX-minX>40);assert.deepEqual(cartPose(0,true),cartPose(50,true));
 const cart=createGolfCart();batchStaticWorld(cart);animateGolfCart(cart,0);const at=cart.position.clone();animateGolfCart(cart,20);assert.ok(cart.position.distanceTo(at)>10);cart.traverse(o=>{for(const n of [...o.position,...o.scale])assert.ok(Number.isFinite(n));});
 const s=B.fresh();s.levels={poolWing:1,pool:3,golfWing:1,golf:3,danceWing:1,dance:3};const w=buildWorld(s);for(const name of ['Casa club · recepción y terraza','Piscina · mosaico, duchas y tumbonas','Baile · parquet, vestuario y escenario'])assert.ok(w.root.getObjectByName(name),name);
});
