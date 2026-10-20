const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function worker(){
  const handlers={},deleted=[],added=[];
  const cache={addAll:async urls=>added.push(...urls),match:async()=>undefined};
  const self={registration:{scope:'https://example.com/bloom-brew-tycoon/'},clients:{claim:async()=>{}},addEventListener(name,fn){handlers[name]=fn;}};
  vm.runInNewContext(fs.readFileSync('sw.js','utf8'),{self,URL,Response,caches:{open:async()=>cache,keys:async()=>['bloom-brew-v1','another-app-cache','bloom-brew-v1.12.0'],delete:async key=>deleted.push(key)},fetch:async()=>{throw Error('offline');}});
  return {handlers,deleted,added,cache};
}
test('worker precaches every game asset with relative URLs',async()=>{
  const w=worker();let promise;w.handlers.install({waitUntil:p=>promise=p});await promise;
  assert.ok(w.added.includes('./core.js'));for(const url of w.added)assert.ok(fs.existsSync(url==='./'?'index.html':url));
});
test('activation deletes only Bloom & Brew caches',async()=>{
  const w=worker();let promise;w.handlers.activate({waitUntil:p=>promise=p});await promise;assert.deepEqual(w.deleted,['bloom-brew-v1']);
});
test('worker ignores other projects and POST requests',()=>{
  const w=worker();for(const request of [{method:'GET',url:'https://example.com/unrelated/'},{method:'POST',url:'https://example.com/bloom-brew-tycoon/'}])w.handlers.fetch({request,respondWith(){assert.fail('Out of scope request intercepted');}});
});
test('worker serves cached shell while offline',async()=>{
  const w=worker();w.cache.match=async()=>new Response('offline game');let response;
  w.handlers.fetch({request:{method:'GET',url:'https://example.com/bloom-brew-tycoon/',mode:'navigate'},respondWith:p=>response=p});assert.equal(await(await response).text(),'offline game');
});
