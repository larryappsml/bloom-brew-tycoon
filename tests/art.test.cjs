const {test}=require('node:test'),assert=require('node:assert/strict');const B=require('../core.js');
test('procedural art follows owned rooms, uses finite transforms and stays within the static draw budget',async()=>{
 const {buildWorld,batchStaticWorld}=await import('../scene3d.mjs');const basic=buildWorld(B.fresh());assert.ok(basic.artFeatures.includes('barista-bar'));assert.ok(!basic.artFeatures.includes('spa-architecture'));assert.ok(!basic.artFeatures.includes('yoga-sanctuary'));
 const s=B.fresh();for(const u of B.UPGRADES)s.levels[u.id]=u.max;const full=buildWorld(s);for(const name of ['spa-architecture','yoga-sanctuary','reformer-hardware','padel-club-detail','gym-hardware','upholstery','street-furniture'])assert.ok(full.artFeatures.includes(name),name);
 batchStaticWorld(full.root);let draws=0;full.root.traverse(o=>{for(const n of [...o.position.toArray(),...o.scale.toArray()])assert.ok(Number.isFinite(n));if(o.isMesh)draws++;});assert.ok(draws<140,draws+' static draw objects');
});
test('crowd batching shares identical parts while preserving articulated poses and hides departed visitors',async()=>{
 const THREE=await import('../vendor/three.module.min.mjs'),{character}=await import('../scene3d.mjs'),{CrowdLayer}=await import('../art3d.mjs');const scene=new THREE.Scene(),crowd=new CrowdLayer(scene),a=character(0),b=character(0);a.root.position.x=2;b.root.position.x=5;scene.add(a.root,b.root);a.arms[0].rotation.x=.8;crowd.update([a,b]);
 assert.equal(crowd.batches.size,4);let parts=0;for(const {mesh}of crowd.batches.values())parts+=mesh.count;assert.equal(parts,14);
 const body=a.body.children.find(o=>o.isMesh),batch=crowd.batches.get(body.geometry.uuid+':'+body.material.uuid),matrix=new THREE.Matrix4();batch.mesh.getMatrixAt(0,matrix);assert.ok(Math.abs(matrix.elements[12]-body.matrixWorld.elements[12])<1e-6);assert.equal(body.layers.mask,2);assert.equal(a.arms[0].rotation.x,.8);
 b.root.visible=false;crowd.update([a,b]);assert.equal(batch.mesh.count,1);a.root.visible=false;crowd.update([a,b]);assert.equal(batch.mesh.visible,false);crowd.dispose();assert.ok(!scene.children.includes(crowd.root));
});
test('contact shadows share one texture and clamp updates to their reserved capacity',async()=>{
 const {contactLayer,setContacts}=await import('../art3d.mjs');const a=contactLayer(2),b=contactLayer(3);assert.equal(a.material.map,b.material.map);assert.equal(a.material.map.image.width,32);assert.equal(a.castShadow,false);assert.equal(a.material.depthWrite,false);setContacts(a,[{x:1,z:2},{x:3,z:4},{x:5,z:6}]);assert.equal(a.count,2);setContacts(a,[]);assert.equal(a.count,0);
});
