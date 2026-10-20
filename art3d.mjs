import * as THREE from './vendor/three.module.min.mjs';
import './layout.js';
let shadowTexture,shadowMaterial,shadowGeometry;
const contactMatrix=new THREE.Matrix4(),contactRotation=new THREE.Quaternion(),contactPosition=new THREE.Vector3(),contactScale=new THREE.Vector3();
// A shared 32px radial texture supplies contact depth without postprocessing.
export function contactLayer(capacity=96){
 if(!shadowTexture){const size=32,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const d=Math.hypot((x+.5-size/2)/(size/2),(y+.5-size/2)/(size/2)),i=(y*size+x)*4;data[i]=39;data[i+1]=53;data[i+2]=44;data[i+3]=Math.round(Math.pow(Math.max(0,1-d),2)*100);}shadowTexture=new THREE.DataTexture(data,size,size);shadowTexture.needsUpdate=true;shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,toneMapped:false});shadowGeometry=new THREE.PlaneGeometry(1,1);shadowGeometry.rotateX(-Math.PI/2);}
 const layer=new THREE.InstancedMesh(shadowGeometry,shadowMaterial,capacity);layer.name='Sombras de contacto';layer.count=0;layer.userData.zones=[];layer.castShadow=false;layer.receiveShadow=false;layer.frustumCulled=false;layer.raycast=()=>{};return layer;
}
export function setContacts(layer,spots){layer.count=Math.min(layer.instanceMatrix.count,spots.length);for(let i=0;i<layer.count;i++){const a=spots[i];contactMatrix.compose(contactPosition.set(a.x,a.y??.135,a.z),contactRotation,contactScale.set(a.w||1,a.h||1,a.d||1));layer.setMatrixAt(i,contactMatrix);}layer.instanceMatrix.needsUpdate=true;}
export function polishWorld(root,s,kit){
 const {box,cylinder,ball,mesh,geometry,group,palette:P}=kit,L=globalThis.BloomLayout,z=L.zones(s),l=id=>Math.min(3,s.levels[id]||0),features=[];
 const feature=(name,x=0,z=0,zone)=>{features.push(name);const g=group(root,x,0,z,zone);g.name='art:'+name;return g;};
 function arch(g,x,y,z,w,h){const a=mesh(g,geometry('architecturalArch',()=>new THREE.TorusGeometry(1,.035,5,24,Math.PI)),P.gold,x,y+h-w/2,z,w/2,w/2,1);for(const side of [-1,1])box(g,x+side*w/2,y+(h-w/2)/2,z,.035,h-w/2,.035,P.gold);return a;}
 const bar=feature('barista-bar',-3.1,-2.9,'machine');
 for(const x of [-1.5,0,1.5])arch(bar,x,.18,.565,1.1,.9);
 box(bar,0,1.305,.62,5.45,.035,.035,P.gold);box(bar,0,.14,.59,5.4,.08,.08,P.dark);
 const espresso=feature('espresso-detail',-4.6,-2.9,'machine');
 for(const x of [-.42,.42]){cylinder(espresso,x,1.85,.39,.06,.1,P.gold);box(espresso,x,1.8,.52,.055,.045,.26,P.dark);}
 for(let j=0;j<6;j++)box(espresso,-.43+j*.17,1.59,.43,.035,.015,.3,P.dark);
 box(espresso,.48,2.08,.1,.09,.32,.08,P.gold);const spout=box(espresso,.56,1.97,.21,.08,.07,.3,P.gold);spout.rotation.x=.3;
 if(l('pastries')){const bakery=feature('bakery-detail',-1.45,-2.9,'pastries');for(let i=0;i<Math.min(3,l('pastries'));i++){const x=-.42+i*.4;const crescent=mesh(bakery,geometry('pastryInCase',()=>new THREE.TorusGeometry(.105,.055,6,12,Math.PI*1.5)),P.gold,x,1.79,.12);crescent.rotation.x=Math.PI/2;crescent.rotation.z=-.65;}for(const x of [-.61,.61])box(bakery,x,1.94,.4,.025,.7,.02,P.gold);}
 const upholstery=feature('upholstery',0,0,'seats');
 for(const [x,z]of L.tables(s))for(const side of [-1,1]){const xx=x+side*1.01;ball(upholstery,xx+side*.22,.92,z+.08,.28,P.sage,.27,1.15,1);box(upholstery,xx,.645,z+.08,.43,.025,.43,P.cream);for(const zz of [-.16,.16])box(upholstery,xx,.39,z+.08+zz,.4,.025,.025,P.gold);}
 if(l('mat')){const studio=feature('reformer-hardware',0,0,'reformer');for(const spot of L.pilates(s)){if(!spot.premium)continue;for(const side of [-1,1]){box(studio,spot.x+side*.39,.46,spot.z,.035,.035,1.75,P.gold);for(let i=0;i<3;i++){const spring=cylinder(studio,spot.x+side*.18,.39,spot.z+.45+i*.1,.035,.08,P.dark,12);spring.rotation.x=Math.PI/2;}box(studio,spot.x+side*.26,.73,spot.z-.45,.08,.19,.09,P.dark);}box(studio,spot.x,.605,spot.z-.65,.48,.025,.25,P.cream);}}
 if(z.wellness){const spa=feature('spa-architecture',0,0,'wellnessWing');for(const x of [8.2,8.55,12.85,13.2])box(spa,x,1.25,-5.97,.09,2.3,.08,P.oak);arch(spa,10.7,.48,-5.95,2.1,1.9);box(spa,10.7,.7,-5.87,2.05,.07,.35,P.oak);for(const id of ['pressotherapy','massage'])for(const a of L.serviceSlots(s,id)){const g=feature(id+'-linen-'+a.index,a.x,a.z,id);for(let j=0;j<3;j++)box(g,0,.69,.3+j*.13,.85,.025,.035,P.cream);box(g,0,.88,-.8,.68,.055,.35,P.white);for(const side of [-1,1])box(g,side*.48,.67,0,.025,.04,1.7,P.gold);}}
 if(z.yoga){const yoga=feature('yoga-sanctuary',-3.9,-12.3,'yogaWing');arch(yoga,0,.3,0,3.3,2.15);for(const side of [-1,1]){box(yoga,side*2.5,1.2,.02,.8,2.1,.06,P.cream);for(let j=0;j<5;j++)box(yoga,side*2.5-.32+j*.16,1.2,.07,.055,2.05,.035,P.oak);}box(yoga,0,.34,.12,1.4,.12,.5,P.oak);cylinder(yoga,0,.48,.12,.2,.15,P.gold);}
 if(z.crossfit){const gym=feature('gym-hardware',0,0,'strengthRig');for(let i=0;i<l('strengthRig');i++){const x=-12.6+i*1.85;for(const side of [-1,1])for(const zz of [-.2,.2]){const plate=cylinder(gym,x+side*.6,.34,-13.8+zz,.2,.09,P.dark);plate.rotation.z=Math.PI/2;const hub=cylinder(gym,x+side*.66,.34,-13.8+zz,.055,.11,P.gold);hub.rotation.z=Math.PI/2;}}}
 if(z.padel&&l('padelCourt')){const court=feature('padel-club-detail',0,0,'padelKit');box(court,15.1,.38,-10.2,.45,.7,.55,P.dark);for(let j=0;j<4;j++)ball(court,15.1+(j%2)*.14-.07,.77,-10.2+Math.floor(j/2)*.14-.07,.065,P.gold);for(const x of [8.6,9.1]){box(court,x,.37,-16.25,.42,.09,.38,P.oak);for(const side of [-1,1])box(court,x+side*.13,.19,-16.25,.035,.36,.035,P.dark);}}
 const street=feature('street-furniture');
 for(const side of [-1,1]){const x=side*19.1;for(let j=0;j<4;j++)box(street,x,.47,6.8+j*.15,2,.07,.12,P.oak);for(const dx of [-.7,.7])box(street,x+dx,.23,7.02,.08,.46,.6,P.dark);box(street,x,.8,6.67,2,.36,.07,P.oak);}
 const frontage=feature('frontage',0,0,'cafeDecor');for(const x of [-6.9,6.9]){box(frontage,x,.2,5.95,.37,.35,.37,P.oak);box(frontage,x,1.3,5.95,.16,2.3,.16,P.dark);box(frontage,x,2.48,5.95,.4,.12,.4,P.oak);}for(let i=0;i<7;i++)box(frontage,-6.8+i*.32,.2,6.12,.26,.16,.22,P.sage);
 const spots=L.tables(s).map(([x,z])=>({x,z,y:z>6.3?-.03:.135,w:2.8,d:2.2}));spots.push({x:-3.1,z:-2.9,w:6.3,d:1.8});for(const id of ['pressotherapy','massage'])for(const a of L.serviceSlots(s,id))spots.push({x:a.x,z:a.z,w:1.7,d:2.8});const shadows=contactLayer(spots.length);setContacts(shadows,spots);root.add(shadows);
 return features;
}

// Joints keep their independent transforms; identical meshes share one draw.
export class CrowdLayer{
 constructor(scene){this.root=new THREE.Group();this.root.name='Personajes agrupados';scene.add(this.root);this.batches=new Map();}
 update(actors){
  for(const batch of this.batches.values())batch.used=0;
  for(const actor of actors){if(!actor?.root?.visible)continue;actor.root.updateMatrixWorld(true);
   const collect=obj=>{if(!obj.visible)return;if(obj.isMesh&&!obj.isInstancedMesh){obj.layers.set(1);const key=obj.geometry.uuid+':'+obj.material.uuid;let batch=this.batches.get(key);if(!batch){const mesh=new THREE.InstancedMesh(obj.geometry,obj.material,256);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.raycast=()=>{};this.root.add(mesh);batch={mesh,used:0};this.batches.set(key,batch);}if(batch.used<256)batch.mesh.setMatrixAt(batch.used++,obj.matrixWorld);}for(const child of obj.children)collect(child);};
   collect(actor.root);
  }
  for(const {mesh,used}of this.batches.values()){mesh.count=used;mesh.visible=used>0;mesh.instanceMatrix.needsUpdate=true;}
 }
 dispose(){for(const {mesh}of this.batches.values())mesh.dispose();this.batches.clear();this.root.removeFromParent();}
}
