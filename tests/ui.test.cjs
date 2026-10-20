const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const B=require('../core.js');
function boot(initial={}) {
  const store=new Map(Object.entries(initial)),elements=new Map(),events={},timers=[];
  const make=()=>({style:{},dataset:{},textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){}},append(){},remove(){},click(){},setAttribute(){},value:''});
  const html=fs.readFileSync('index.html','utf8');
  for(const id of html.matchAll(/id="([^"]+)"/g))elements.set(id[1],make());
  const document={getElementById(id){assert.ok(elements.has(id),'Missing UI element: '+id);return elements.get(id);},querySelectorAll(){return [];},createElement:make,addEventListener(name,fn){events[name]=fn;},hidden:false};
  const ctx={window:{Bloom:B,VenueScene:function(){},addEventListener(){},scrollTo(){}},document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},Date,Intl,console,URL,Blob,performance:{now:()=>0},setInterval(fn,ms){timers.push({fn,ms});},setTimeout(){},clearTimeout(){},navigator:{},location:{hostname:'127.0.0.1'},confirm:()=>true};
  vm.runInNewContext(fs.readFileSync('game.js','utf8'),ctx);
  return {store,elements,events,timers,document};
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
