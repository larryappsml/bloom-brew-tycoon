const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const B=require('../core.js');
function boot(initial={}) {
  const store=new Map(Object.entries(initial)),elements=new Map(),events={},timers=[];let now=0;
  const make=()=>{const classes=new Set();return {style:{},dataset:{},textContent:'',innerHTML:'',classList:{add:n=>classes.add(n),remove:n=>classes.delete(n),contains:n=>classes.has(n),toggle(n,force){const on=force===undefined?!classes.has(n):force;if(on)classes.add(n);else classes.delete(n);}},append(){},remove(){},click(){},setAttribute(){},value:''};};
  const html=fs.readFileSync('index.html','utf8');
  for(const id of html.matchAll(/id="([^"]+)"/g)){const element=make();element.id=id[1];elements.set(id[1],element);}
  const views=['home','operations','shop','goals','reports'].map(id=>elements.get(id));
  const navButtons=views.map(view=>{const button=make();button.dataset.view=view.id;return button;});
  const filters=['all','cafe','pilates','yoga','team','zones','wellness'].map(filter=>{const button=make();button.dataset.filter=filter;return button;});
  const document={getElementById(id){assert.ok(elements.has(id),'Missing UI element: '+id);return elements.get(id);},querySelectorAll(selector){return selector==='.view'?views:selector==='.nav-btn'?navButtons:selector==='#filter-tabs button'?filters:[];},createElement:make,addEventListener(name,fn){events[name]=fn;},hidden:false};
  const ctx={window:{Bloom:B,VenueScene:function(){},addEventListener(){},scrollTo(){}},document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},Date,Intl,console,URL,Blob,performance:{now:()=>now},setInterval(fn,ms){timers.push({fn,ms});},setTimeout(){},clearTimeout(){},navigator:{},location:{hostname:'127.0.0.1'},confirm:()=>true};
  vm.runInNewContext(fs.readFileSync('game.js','utf8'),ctx);
  return {store,elements,events,timers,document,navButtons,advance(seconds){for(let i=0;i<seconds*10;i++){now+=100;timers.find(t=>t.ms===100).fn();}timers.find(t=>t.ms===5000).fn();}};
}
test('all interface IDs exist and a fresh game renders and saves',()=>{
  const {store,elements}=boot();assert.equal(JSON.parse(store.get(B.KEY)).version,2);assert.ok(elements.get('money').textContent.includes('20'));assert.equal(elements.get('serve').disabled,true);
});
test('UI startup migrates a legacy save without deleting it',()=>{
  const legacy=fs.readFileSync('tests/fixtures/legacy-v1.json','utf8');const {store}=boot({[B.LEGACY_KEY]:legacy});
  const s=JSON.parse(store.get(B.KEY));assert.ok(s.money>=12000);assert.equal(s.levels.barista,1);assert.equal(store.get(B.LEGACY_KEY),legacy);assert.equal(store.get(B.KEY+'-legacy-backup'),legacy);
});
test('corrupted current save is preserved and never overwritten by autosave',()=>{
  const {store,timers}=boot({[B.KEY]:'{broken'});for(const t of timers)if(t.ms===5000)t.fn();assert.equal(store.get(B.KEY),'{broken');
});
test('import rejects invalid files without replacing progress',async()=>{
  const {store,elements}=boot();const previous=store.get(B.KEY);
  await elements.get('import-file').onchange({target:{files:[{size:10,text:async()=>'{"money":-10,"levels":{}}'}]}});
  assert.equal(store.get(B.KEY),previous);assert.ok(elements.get('toast').textContent.includes('no válido'));
});
test('import accepts legacy files and keeps the previous save as backup',async()=>{
  const {store,elements}=boot();const fixture=fs.readFileSync('tests/fixtures/legacy-v1.json','utf8');
  await elements.get('import-file').onchange({target:{files:[{size:fixture.length,text:async()=>fixture}]}});
  assert.equal(JSON.parse(store.get(B.KEY)).money,12000);assert.equal(JSON.parse(store.get(B.KEY+'-before-import')).money,20);
});
test('background autosave does not reset the offline timestamp',()=>{
  const {store,timers,document}=boot();const raw=store.get(B.KEY);document.hidden=true;for(const t of timers)if(t.ms===5000)t.fn();assert.equal(store.get(B.KEY),raw);
});
test('management menus overlay the map and close without changing the save',()=>{
  const {elements,navButtons,store}=boot();const before=store.get(B.KEY);
  navButtons.find(b=>b.dataset.view==='operations').onclick();
  assert.equal(elements.get('app').classList.contains('menu-open'),true);
  assert.equal(elements.get('home').classList.contains('active'),true);
  assert.equal(elements.get('operations').classList.contains('active'),true);
  elements.get('menu-close').onclick();
  assert.equal(elements.get('app').classList.contains('menu-open'),false);
  assert.equal(elements.get('operations').classList.contains('active'),false);
  assert.equal(elements.get('home').classList.contains('active'),true);
  assert.equal(store.get(B.KEY),before);
});
test('floating staff menu filters hiring and Escape returns to the map',()=>{
  const {elements,events}=boot();elements.get('staff-menu').onclick();
  assert.equal(elements.get('shop').classList.contains('active'),true);
  assert.ok(elements.get('shop-list').innerHTML.includes('Barista'));
  assert.equal(elements.get('shop-title').textContent,'Tu equipo');
  assert.ok(!elements.get('shop-list').innerHTML.includes('Cafetera de especialidad'));
  events.keydown({key:'Escape'});assert.equal(elements.get('app').classList.contains('menu-open'),false);
});
test('sales and pilates continue while every management menu stays open',()=>{
  const s=B.fresh();s.levels={barista:1,mat:1,coach:1};s.money=1000;s.last=Date.now();
  const ui=boot({[B.KEY]:JSON.stringify(s)});
  for(const view of ['shop','operations','goals','reports']){
    ui.navButtons.find(b=>b.dataset.view===view).onclick();
    const before=JSON.parse(ui.store.get(B.KEY));ui.advance(100);
    const after=JSON.parse(ui.store.get(B.KEY));
    assert.ok(after.served>before.served,view+' delivers orders');
    assert.ok(after.sessions>before.sessions,view+' completes classes');
    assert.ok(after.money>before.money,view+' earns income');
    assert.equal(ui.elements.get(view).classList.contains('active'),true);
  }
  ui.elements.get('staff-menu').onclick();const before=JSON.parse(ui.store.get(B.KEY));ui.advance(100);
  assert.ok(JSON.parse(ui.store.get(B.KEY)).served>before.served);
  assert.equal(ui.elements.get('shop-title').textContent,'Tu equipo');
});
test('expansion menu builds a room and manual wellness sessions run behind the panel',()=>{
  const s=B.fresh();s.levels={mat:1};s.money=20000;s.served=50;s.last=Date.now();
  const ui=boot({[B.KEY]:JSON.stringify(s)});ui.elements.get('expand-menu').onclick();
  assert.equal(ui.elements.get('shop-title').textContent,'Amplía tu centro');
  assert.ok(ui.elements.get('shop-list').innerHTML.includes('Ala de recuperación'));
  const click=dataset=>ui.events.click({target:{closest:()=>({dataset})}});
  click({buy:'wellnessWing'});click({buy:'pressotherapy'});click({service:'pressotherapy'});
  let saved=JSON.parse(ui.store.get(B.KEY));assert.equal(saved.levels.wellnessWing,1);assert.equal(saved.treatments.length,1);
  ui.advance(65);saved=JSON.parse(ui.store.get(B.KEY));assert.equal(saved.completedServices.pressotherapy,1);assert.equal(saved.treatments.length,0);
  assert.equal(ui.elements.get('shop').classList.contains('active'),true);assert.ok(!ui.elements.get('shop-list').innerHTML.includes('undefined'));
});
