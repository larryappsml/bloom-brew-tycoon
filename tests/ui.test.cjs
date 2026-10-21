const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const B=require('../core.js');
function boot(initial={},search='') {
  const store=new Map(Object.entries(initial)),elements=new Map(),events={},timers=[];let now=0;
  const make=()=>{const classes=new Set();return {style:{},dataset:{},textContent:'',innerHTML:'',classList:{add:n=>classes.add(n),remove:n=>classes.delete(n),contains:n=>classes.has(n),toggle(n,force){const on=force===undefined?!classes.has(n):force;if(on)classes.add(n);else classes.delete(n);}},append(){},remove(){},click(){},setAttribute(){},value:''};};
  const html=fs.readFileSync('index.html','utf8');
  for(const id of html.matchAll(/id="([^"]+)"/g)){const element=make();element.id=id[1];elements.set(id[1],element);}
  const views=['home','operations','shop','goals','reports'].map(id=>elements.get(id));
  const navButtons=views.map(view=>{const button=make();button.dataset.view=view.id;return button;});
  const filters=['all','cafe','pilates','yoga','team','zones','wellness'].map(filter=>{const button=make();button.dataset.filter=filter;return button;});
  const document={getElementById(id){assert.ok(elements.has(id),'Missing UI element: '+id);return elements.get(id);},querySelectorAll(selector){return selector==='.view'?views:selector==='.nav-btn'?navButtons:selector==='#filter-tabs button'?filters:[];},createElement:make,addEventListener(name,fn){events[name]=fn;},hidden:false};
  const ctx={window:{Bloom:B,BloomLayout:require('../layout.js'),VenueScene:function(){this.select=()=>{};},addEventListener(){},scrollTo(){}},document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},Date,Intl,console,URL,Blob,performance:{now:()=>now},setInterval(fn,ms){timers.push({fn,ms});},setTimeout(){},clearTimeout(){},navigator:{},location:{hostname:'127.0.0.1',search},confirm:()=>true};
  vm.runInNewContext(fs.readFileSync('demo.js','utf8'),ctx);
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
test('chapter and campaign menus allow real claims and keep challenges running behind other panels',()=>{
  const s=B.fresh();s.levels={machine:1,barista:1};s.served=5;s.last=Date.now();const ui=boot({[B.KEY]:JSON.stringify(s)});ui.elements.get('journey-chip').onclick();assert.equal(ui.elements.get('goals').classList.contains('active'),true);assert.ok(ui.elements.get('journey-card').innerHTML.includes('Completar capítulo'));
  const click=dataset=>ui.events.click({target:{closest:()=>({dataset})}});click({chapter:'aroma'});let saved=JSON.parse(ui.store.get(B.KEY));assert.deepEqual(saved.chapters,['aroma']);assert.equal(saved.money,55);
  click({campaign:'coffee'});assert.ok(ui.elements.get('campaign-board').innerHTML.includes('Club del café'));ui.navButtons.find(b=>b.dataset.view==='shop').onclick();ui.advance(150);saved=JSON.parse(ui.store.get(B.KEY));assert.equal(saved.campaign.count,8);assert.ok(ui.elements.get('journey-chip').textContent.includes('Reto conseguido'));
  click({campaignAction:'claim'});saved=JSON.parse(ui.store.get(B.KEY));assert.equal(saved.campaignWins,1);assert.equal(saved.campaign,null);assert.equal(saved.rewards,95);assert.ok(ui.elements.get('shop').classList.contains('active'));
});
test('sports can be called from Turno and finish while the player manages upgrades',()=>{
  const s=B.fresh();s.levels={crossfitWing:1,functionalStations:1,functionalCoach:1,padelWing:1,padelCourt:1,padelCoach:1};s.last=Date.now();const ui=boot({[B.KEY]:JSON.stringify(s)});ui.navButtons.find(b=>b.dataset.view==='operations').onclick();assert.ok(ui.elements.get('sports-list').innerHTML.includes('Pádel por parejas'));ui.events.click({target:{closest:()=>({dataset:{sport:'padel'}})}});assert.ok(JSON.parse(ui.store.get(B.KEY)).sportsGroups.padel);ui.navButtons.find(b=>b.dataset.view==='shop').onclick();ui.advance(200);const saved=JSON.parse(ui.store.get(B.KEY));assert.ok(saved.sportSessions.padel>=1);assert.ok(saved.sportSessions.crossfit>=1);assert.equal(saved.sportVisits.padel,saved.sportSessions.padel*4);assert.ok(ui.elements.get('shop').classList.contains('active'));
});

test('advanced demo isolates normal saves across reload and reset',()=>{
 const normal=JSON.stringify(B.fresh()),key='bloom-brew-demo-v2';
 const demo=boot({[B.KEY]:normal},'?demo=club');
 const state=JSON.parse(demo.store.get(key));
 assert.equal(state.levels.padelCourt,1);assert.equal(state.levels.functionalStations,3);assert.equal(state.money,45000);
 demo.advance(5);assert.equal(demo.store.get(B.KEY),normal);
 const reload=boot(Object.fromEntries(demo.store),'?demo=club');
 assert.equal(reload.store.get(B.KEY),normal);assert.ok(JSON.parse(reload.store.get(key)).levels.padelCoach);
 reload.elements.get('reset').onclick();assert.equal(reload.store.get(B.KEY),normal);
 const standard=boot(Object.fromEntries(reload.store));assert.equal(JSON.parse(standard.store.get(B.KEY)).levels.padelCourt||0,0);
});


test('top income indicator shows estimated net earnings per minute',()=>{
 const fixture=fs.readFileSync('tests/fixtures/detailed-v2.json','utf8');
 const {elements}=boot({[B.KEY]:fixture});
 const expected=B.estimate(B.validate(JSON.parse(fixture))).total*60;
 assert.equal(elements.get('income').textContent,new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:expected>=100?0:2}).format(expected));
});

test('business menu selects specialties, persists the choice and reports live visitor satisfaction',()=>{
 const fixture=fs.readFileSync('tests/fixtures/detailed-v2.json','utf8');const {elements,store,advance}=boot({[B.KEY]:fixture});
 elements.get('specialty-list').onclick({target:{closest:()=>({dataset:{specialty:'recovery'}})}});
 assert.equal(JSON.parse(store.get(B.KEY)).specialty,'recovery');assert.ok(elements.get('specialty-list').innerHTML.includes('Elegida'));
 advance(5);assert.ok(elements.get('client-status').textContent.includes('Satisfacción'));assert.ok(elements.get('premium-status').textContent.includes('propinas'));
 assert.ok(Math.abs(JSON.parse(store.get(B.KEY)).specialtyCooldown-115)<1e-8);
});

test('tapping a room shows its net estimate and closes without stopping gameplay',()=>{
 const fixture=fs.readFileSync('tests/fixtures/detailed-v2.json','utf8'),ui=boot({[B.KEY]:fixture});
 ui.elements.get('cafe-zone').onclick();assert.equal(ui.elements.get('zone-panel').hidden,false);assert.match(ui.elements.get('zone-economy').innerHTML,/Cafetería/);assert.match(ui.elements.get('zone-economy').innerHTML,/\/min/);assert.match(ui.elements.get('zone-economy').innerHTML,/No incluye propinas/);assert.match(ui.elements.get('zone-economy').innerHTML,/recupera su coste/);
 ui.advance(15);assert.ok(JSON.parse(ui.store.get(B.KEY)).served>180);ui.elements.get('zone-close').onclick();assert.equal(ui.elements.get('zone-panel').hidden,true);
});

test('leisure demo opens all three new venues while keeping normal and earlier demo saves untouched',()=>{const normal=JSON.stringify(B.fresh()),oldDemo='earlier-demo';const ui=boot({[B.KEY]:normal,'bloom-brew-demo-v2':oldDemo},'?demo=leisure');const state=JSON.parse(ui.store.get('bloom-brew-leisure-v1'));for(const id of ['pool','golf','dance']){assert.equal(state.levels[id+'Wing'],1);assert.equal(state.levels[id],2);}assert.equal(ui.store.get(B.KEY),normal);assert.equal(ui.store.get('bloom-brew-demo-v2'),oldDemo);});

test('room style and reform controls persist their choices while live services continue',()=>{
 const s=B.validate(JSON.parse(fs.readFileSync('tests/fixtures/detailed-v2.json','utf8')));s.money=100000;s.served=400;const ui=boot({[B.KEY]:JSON.stringify(s)});ui.elements.get('cafe-zone').onclick();assert.match(ui.elements.get('zone-economy').innerHTML,/Especialización de la sala/);
 ui.elements.get('zone-economy').onclick({target:{closest:selector=>selector==='[data-room-style]'?{dataset:{roomStyle:'premium'}}:null}});assert.equal(JSON.parse(ui.store.get(B.KEY)).roomStyles.cafe,'premium');
 ui.elements.get('zone-economy').onclick({target:{closest:selector=>selector==='[data-renovate]'?{dataset:{renovate:'cafe'}}:null}});assert.equal(JSON.parse(ui.store.get(B.KEY)).renovations.cafe,1);assert.match(ui.elements.get('zone-economy').innerHTML,/Reforma · Boutique/);ui.advance(15);assert.ok(JSON.parse(ui.store.get(B.KEY)).served>400);
});
