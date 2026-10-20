import * as THREE from './vendor/three.module.min.mjs';
import './layout.js';
const Layout=globalThis.BloomLayout;

// Original low-poly art. Shared materials/geometries keep the scene inexpensive.
const palette={cream:0xfff2d7,sage:0x6fbc99,dark:0x24564d,mint:0xb7dec4,wood:0xba8054,oak:0xe9b77a,gold:0xf4c45f,rose:0xe9a998,sky:0xb1deea,white:0xfffdf2,ink:0x344b55};
const mats=new Map(),geometries=new Map();
function material(color){if(!mats.has(color))mats.set(color,new THREE.MeshStandardMaterial({color,roughness:.82,metalness:0}));return mats.get(color);}
function geometry(key,create){if(!geometries.has(key))geometries.set(key,create());return geometries.get(key);}
function mesh(parent,geo,color,x,y,z,sx=1,sy=1,sz=1){const obj=new THREE.Mesh(geo,material(color));obj.position.set(x,y,z);obj.scale.set(sx,sy,sz);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;}
function box(parent,x,y,z,w,h,d,color){return mesh(parent,geometry('box',()=>new THREE.BoxGeometry(1,1,1)),color,x,y,z,w,h,d);}
function cylinder(parent,x,y,z,r,h,color,segments=12){return mesh(parent,geometry('cyl'+segments,()=>new THREE.CylinderGeometry(1,1,1,segments)),color,x,y,z,r,h,r);}
function ball(parent,x,y,z,r,color,sx=1,sy=1,sz=1){return mesh(parent,geometry('sphere',()=>new THREE.SphereGeometry(1,12,8)),color,x,y,z,r*sx,r*sy,r*sz);}
function group(parent,x=0,y=0,z=0,zone){const g=new THREE.Group();g.position.set(x,y,z);if(zone)g.userData.zone=zone;parent.add(g);return g;}
function label(parent,text,x,y,z,width=3,color='#285b4d',background='#fff8e6'){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');
  c.fillStyle=background;c.beginPath();c.roundRect(3,3,506,122,26);c.fill();c.font='800 43px system-ui';c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,67,468);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));sprite.position.set(x,y,z);sprite.scale.set(width,width/4,1);sprite.renderOrder=3;parent.add(sprite);return sprite;
}
function plant(parent,x,z,size=1){const g=group(parent,x,0,z);cylinder(g,0,.28,0,.25,.56,0xe3a984);cylinder(g,0,.58,0,.28,.09,0xf0be9c);cylinder(g,0,.88,0,.035,.7,0x638653,6);for(let i=0;i<7;i++){const a=i*2.4;const leaf=ball(g,Math.cos(a)*.23,1+i*.07,Math.sin(a)*.23,.3,i%2?0x5f9a70:0x86bd7d,1,.45,.65);leaf.rotation.z=Math.sin(a)*.8;}g.scale.setScalar(size);return g;}
function cup(parent,x,y,z,color=palette.white){const g=group(parent,x,y,z);cylinder(g,0,.09,0,.13,.18,color);cylinder(g,0,.19,0,.11,.015,0x72462c);const handle=mesh(g,geometry('handle',()=>new THREE.TorusGeometry(.09,.025,5,10)),color,.14,.1,0);handle.rotation.y=Math.PI/2;return g;}
function table(parent,x,z,tier=0){const g=group(parent,x,0,z,'seats');cylinder(g,0,.48,0,.075,.9,palette.dark);cylinder(g,0,.08,0,.4,.09,palette.dark);cylinder(g,0,.99,0,.71,.12,tier>2?palette.white:palette.oak,20);cup(g,.2,1.06,.15);cylinder(g,-.21,1.14,-.15,.09,.17,0xe0a08b);ball(g,-.21,1.3,-.15,.12,palette.sage);for(const offset of [-1,1]){const chair=group(g,offset*1.01,0,.08);box(chair,0,.5,0,.52,.16,.55,palette.sage);box(chair,offset*.23,.85,0,.09,.65,.57,palette.mint);for(const a of [-.18,.18])for(const b of [-.18,.18])box(chair,a,.24,b,.055,.45,.055,palette.wood);}return g;}
function counter(parent,levels){const g=group(parent,-3.1,0,-2.9,'machine');box(g,0,.68,0,5.4,1.35,1.04,palette.wood);box(g,0,1.4,0,5.7,.18,1.23,palette.cream);for(let i=0;i<13;i++)box(g,-2.5+i*.42,.7,.53,.04,1.12,.035,0xe1a66b);box(g,-2.15,.22,.57,.16,.13,.04,palette.gold);
  const machine=group(g,-1.5,1.5,0);box(machine,0,.39,0,1.15,.78,.74,levels.machine?palette.sage:0x9faaa3);box(machine,0,.55,.39,.92,.19,.05,palette.dark);box(machine,0,.12,.4,1.04,.08,.24,0x6b7b75);for(let i=0;i<3;i++)ball(machine,-.34+i*.34,.56,.43,.055,palette.gold);for(const x of [-.23,.23]){box(machine,x,.31,.39,.08,.18,.12,0x647777);cup(machine,x,0,.43);}cup(g,.1,1.5,.15);box(g,.43,1.69,-.1,.48,.35,.36,palette.dark);box(g,.43,1.87,-.16,.4,.04,.3,0xa1d4be);
  if(levels.pastries){const display=group(g,1.65,1.5,0,'pastries');display.name='Vitrina de bollería';box(display,0,.04,0,1.3,.09,.8,palette.gold);box(display,0,.88,0,1.35,.08,.88,palette.dark);for(const x of [-.62,.62])box(display,x,.46,0,.045,.82,.8,palette.mint);
    if(!mats.has('glass'))mats.set('glass',new THREE.MeshStandardMaterial({color:0xc4edee,transparent:true,opacity:.18,roughness:.15,depthWrite:false}));
    const glass=box(display,0,.46,.38,1.22,.8,.02,palette.sky);glass.material=mats.get('glass');
    for(let tier=0;tier<Math.min(2,levels.pastries);tier++){box(display,0,.12+tier*.35,0,1.2,.025,.7,palette.cream);for(let i=0;i<Math.min(6,2+levels.pastries);i++){const pastry=ball(display,-.46+(i%3)*.45,.24+tier*.35,-.18+Math.floor(i/3)*.36,.16,0xe3a04c,1,.55,.7);pastry.name='Bollo';pastry.rotation.y=i*.6;box(display,-.46+(i%3)*.45,.31+tier*.35,-.18+Math.floor(i/3)*.36,.13,.025,.04,0xffdf94);}}
  }
  if(levels.machine){for(let i=0;i<Math.min(6,levels.machine);i++)cylinder(g,-2.25+i*.23,2.36,-.15,.07,.18,i%2?palette.gold:palette.white);}
  if(levels.matcha){const tea=group(parent,-6,0,-1.6,'matcha');box(tea,0,.5,0,.8,1,.7,palette.sage);for(let i=0;i<Math.min(4,levels.matcha);i++)cylinder(tea,-.26+i*.17,1.2,0,.075,.3,0x8caf59);}
  if(levels.roaster){const roast=group(parent,-6,0,-4.9,'roaster');box(roast,0,.65,0,.8,1.3,.8,palette.dark);cylinder(roast,0,1.45,0,.32,.4,palette.gold);for(let i=0;i<Math.min(2,levels.roaster);i++)box(roast,.6+i*.36,.23,0,.3,.46,.5,palette.oak);}
  return {g,steamPosition:new THREE.Vector3(-4.6,2.8,-2.5)};
}
function reformer(parent,x,z,premium){const g=group(parent,x,0,z,premium?'reformer':'mat');if(premium){box(g,0,.31,0,.91,.18,1.94,palette.oak);for(const a of [-.37,.37])for(const b of [-.77,.77])box(g,a,.13,b,.08,.27,.08,palette.dark);box(g,0,.48,.05,.73,.2,1.23,0x779f95);box(g,0,.56,-.65,.6,.17,.3,0xd3b6a7);for(const a of [-.37,.37])box(g,a,.67,.79,.035,.7,.04,0x6a807b);box(g,0,1,.79,.78,.045,.045,palette.dark);}else box(g,0,.055,0,.88,.1,1.94,0xc396a5);return g;}
export function buildWorld(state){
  const root=new THREE.Group(),levels=state.levels||{},p=windowParams(state),studio=!!levels.mat,zones=Layout.zones(state),footprint=Layout.footprint(state);
  root.name='Bloom & Brew world';const targets={};
  box(root,0,-.39,0,15.6,.65,13.2,0x9db59b);box(root,0,-.03,0,14.7,.16,12.4,palette.cream);
  // Large ceramic tiles, warm parquet, tiled studio and an open storefront.
  for(let x=0;x<7;x++)for(let z=0;z<6;z++)box(root,-6.2+x*2.05,.065,-5.05+z*2.02,2,.035,1.97,(x<4?((x+z)%2?0xf3d5ab:0xffe6c5):(studio?((x+z)%2?0xb9d8c6:0xc9e3d3):0xc4cbbf)));
  if(zones.studio||zones.yoga){for(const x of [-6.9,.5,6.9])box(root,x,1.25,-5.83,.55,2.65,.2,0xf3e6c9);}else box(root,0,1.25,-5.83,14.7,2.65,.2,0xf3e6c9);
  if(zones.cafe){for(const z of [-3.25,4.7])box(root,-7.25,1.25,z,.2,2.65,z<0?5.1:2.1,0xe8dfcb);}else box(root,-7.25,1.25,0,.2,2.65,11.7,0xe8dfcb);
  box(root,0,.23,-5.67,14.5,.24,.08,palette.sage);box(root,-7.08,.23,0,.08,.24,11.6,palette.sage);
  // Rear window frames and blue glass with diagonal sunlight.
  for(const x of [-5.6,4.55]){box(root,x,1.67,-5.68,2.25,1.28,.08,palette.white);box(root,x,1.67,-5.61,2.02,1.05,.035,palette.sky);box(root,x,1.67,-5.56,.055,1.08,.025,palette.white);box(root,x,1.67,-5.54,2.05,.055,.025,palette.white);}
  label(root,'bloom & brew',-1.1,2.32,-5.5,4.5,'#2f6a56','#fff2d4');
  // Wall shelves and merchandise; each unlock has a distinct silhouette.
  for(const y of [.95,1.8]){box(root,-6.96,y,-3.65,.42,.08,2.5,palette.oak);for(let i=0;i<5;i++)cylinder(root,-6.83,y+.18,-4.55+i*.43,.12,.29,i%2?palette.white:palette.sage);}
  const bar=counter(root,levels);targets.machine=bar.g;targets.pastries=bar.g;
  for(const x of [-4.85,-1.7]){const lamp=group(root,x,0,-2.35);cylinder(lamp,0,3.18,0,.025,1.25,0x6c7e69,6);mesh(lamp,geometry('shade',()=>new THREE.ConeGeometry(.38,.3,16)),palette.gold,0,2.62,0);cylinder(lamp,0,2.48,0,.23,.025,0xfff0b3);}
  const tablePositions=Layout.tables(state),tableCount=tablePositions.length;
  tablePositions.forEach(([x,z])=>table(root,x,z,levels.seats||0));
  for(let i=0;i<Math.min(3,levels.cafeDecor||0);i++){plant(root,-5.8+i*2.3,5.05,.8+i*.1);box(root,-5.8+i*2.3,2.8,-5.45,1.2,.6,.08,[palette.rose,palette.mint,palette.gold][i]);}
  plant(root,-6.15,4.7,1.25);plant(root,.05,-4.8,1.1);plant(root,6.3,4.8,1.2);
  // Divider is low so that the studio remains legible on a phone.
  box(root,.65,.28,-1.1,.12,.5,8.7,palette.white);for(const z of [-4.8,-1.1,2.65])plant(root,.65,z,.63);
  const studioGroup=group(root,3.85,0,-.3,'mat');targets.mat=studioGroup;
  label(studioGroup,studio?'ESTUDIO PILATES':'PRÓXIMA APERTURA',0,2.35,-3.7,3.8,studio?'#326b55':'#687b70',studio?'#e8f8da':'#edf0e4');
  const students=[];
  if(studio){
    for(const spot of Layout.pilates(state)){reformer(root,spot.x,spot.z,spot.premium);students.push(spot);}
    box(root,4.85,.52,-4.9,2.1,1,.48,palette.oak);for(let i=0;i<5;i++)box(root,4.1+i*.35,1.1,-4.9,.27,.15,.36,i%2?palette.rose:palette.white);
    if(levels.spa){const wellness=group(root,6,.1,-1,'spa');box(wellness,0,.55,0,.75,1.1,1.4,palette.sage);cylinder(wellness,0,1.4,0,.22,.55,palette.sky);}
  }else{
    // A tangible construction zone rather than an empty dim room.
    const lock=group(studioGroup,0,.5,.1);box(lock,0,.35,0,1.3,.95,.45,palette.gold);const hoop=mesh(lock,geometry('lock',()=>new THREE.TorusGeometry(.43,.1,8,16,Math.PI)),0xe8b245,0,.85,0);hoop.rotation.z=0;box(lock,0,.4,.24,.1,.3,.03,0x9f7c2b);
    for(const z of [-2.4,2.5]){box(studioGroup,0,.7,z,4.8,.18,.12,0xf4d875);for(const x of [-2.1,2.1])box(studioGroup,x,.35,z,.1,.7,.1,palette.dark);}
    for(let i=0;i<3;i++)box(studioGroup,1.25,.18+i*.18,1.5,1.4,.17,.5,0xbda78b);
    label(studioGroup,'ABRIR · 850 €',0,1.08,1.3,3,'#795d20','#fff0b8');
  }
  const serviceSpots=buildExpansions(root,state);
  // A continuous street and pavement connect arriving guests to the front door.
  box(root,0,-.3,11.6,48,.3,4.1,0x718086);box(root,0,-.18,8.25,46,.24,2.55,0xd8ded4);
  for(let i=0;i<30;i++)box(root,-22+i*1.5,-.045,8.25,1.45,.025,2.4,0xe9e8db);
  for(let i=0;i<10;i++)box(root,-21+i*4.5,-.135,11.8,2,.015,.1,palette.cream);
  for(let i=0;i<5;i++)box(root,-1.6+i*.62,-.13,10.7,.36,.015,1.9,palette.white);
  for(const x of [-17,17]){plant(root,x,7.8,1.7);cylinder(root,x,1.7,9.2,.06,3.6,palette.dark);ball(root,x,3.55,9.2,.26,palette.gold);const car=group(root,x,0,12.3);box(car,0,.32,0,2.9,.6,1.3,palette.sage);box(car,0,.83,0,1.4,.55,1.15,palette.sky);for(const a of [-.9,.9])for(const b of [-.65,.65]){const wheel=cylinder(car,a,.1,b,.24,.13,palette.ink);wheel.rotation.x=Math.PI/2;}}
  for(const x of [-15,15])for(const z of [-4.7,1.6,5.5])plant(root,x,z,1.5);
  const entrance=group(root,-.4,0,5.95);for(const x of [-1.85,1.85])box(entrance,x,1.1,0,.13,2.2,.13,palette.dark);box(entrance,0,2.32,0,4.2,.22,.8,palette.sage);for(let i=0;i<8;i++)box(entrance,-1.84+i*.52,2.44,0,.48,.06,.83,i%2?palette.cream:palette.sage);label(entrance,'CAFÉ · WELLNESS',0,2.12,.18,3.3,'#fff9e4','#356c56');
  if(levels.terrace){for(const x of (levels.terrace>1?[-10,-4.8,3.8,10]:[-4.8,3.8])){table(root,x,7.1);cylinder(root,x,1.55,7.1,.035,3.1,palette.wood);mesh(root,geometry('parasol',()=>new THREE.ConeGeometry(1.35,.45,8)),palette.cream,x,3.1,7.1);}plant(root,-6.4,7.25,.8);}
  if(levels.second)label(root,`${1+Math.min(2,levels.second)} LOCALES · EMPIRE`,4.8,3.2,4,3.8,'#76551c','#fff0b4');
  return {root,targets,students,tablePositions,tableCount,bar,studio,serviceSpots,footprint};
}
function buildExpansions(root,s){const z=Layout.zones(s),l=id=>Math.min(s.levels?.[id]||0,6),spots=[];
  function room(x,back,w,d,color,title,zone){const g=group(root,x,0,back+d/2,zone);box(g,0,-.25,0,w,.55,d,0xa4b39c);box(g,0,.04,0,w-.1,.1,d-.1,color);box(g,0,1.15,-d/2,w,2.4,.15,palette.cream);if(zone==='wellnessWing'){box(g,-w/2,1.15,-3.3,.15,2.4,5.1,palette.cream);box(g,-w/2,1.15,4.7,.15,2.4,2.1,palette.cream);}else box(g,-w/2,1.15,0,.15,2.4,d,palette.cream);label(g,title,0,2.7,-d/2+.3,w*.73);return g;}
  function plot(x,back,w,d,id,title){const g=group(root,x,0,back+d/2,id);box(g,0,-.35,0,w,.16,d,0xa9c49b);for(const a of [-1,1])for(const b of [-1,1])box(g,a*(w/2-.2),.23,b*(d/2-.2),.12,.6,.12,palette.white);box(g,0,.08,0,1.15,.08,1.15,palette.sage);box(g,0,.14,0,.65,.07,.14,palette.white);box(g,0,.14,0,.14,.07,.65,palette.white);label(g,title,0,.9,0,w*.65,'#4b7051','#e5f0d8');}
  if(z.cafe){room(-10.7,-6.2,6.6,12.4,0xf3d5ab,'SALÓN BOTÁNICO','cafeWing');plant(root,-13,-4.8,1.2);plant(root,-13,5,1.1);}else plot(-10.7,-6.2,6.6,12.4,'cafeWing','AMPLIAR CAFÉ');
  if(z.studio)room(3.9,-12.6,7,6.4,0xc9e3d3,'PILATES · GRUPOS','classes');
  if(z.yoga){room(-3.9,-12.6,7,6.4,0xe8d3c6,'YOGA & CALMA','yogaWing');for(const spot of Layout.serviceSlots(s,'yoga')){const g=group(root,spot.x,0,spot.z,'yoga');box(g,0,.08,0,.85,.12,1.8,palette.rose);for(let i=0;i<l('yogaCare');i++)box(g,.65,.15,-.5+i*.4,.23,.26,.3,[palette.mint,palette.oak,palette.cream][i]);spots.push(spot);}plant(root,-6.6,-11.7,1.2);}else plot(-3.9,-12.6,7,6.4,'yogaWing','SALA YOGA');
  if(z.wellness){room(10.7,-6.2,6.6,12.4,0xd7e7df,'SALA WELLNESS','wellnessWing');
    for(const id of ['pressotherapy','massage'])for(const spot of Layout.serviceSlots(s,id)){const g=group(root,spot.x,0,spot.z,id);g.name=id+' station '+spot.index;
      for(const x of [-.43,.43])for(const a of [-.7,.7])box(g,x,.27,a,.08,.5,.08,palette.oak);
      box(g,0,.55,0,1.1,.24,2.3,id==='pressotherapy'?palette.sage:palette.rose);box(g,0,.75,-.8,.85,.2,.52,palette.cream);
      if(id==='pressotherapy'){const head=box(g,0,.77,-.68,1.05,.15,.85,palette.mint);head.rotation.x=.35;box(g,.82,.45,-.25,.42,.9,.48,palette.dark);box(g,.82,.94,-.25,.36,.09,.38,palette.sky);for(let i=0;i<=l('pressureCare');i++)ball(g,.7+i*.075,.9,.01,.03,palette.gold);}
      else{for(let i=0;i<=l('massageCare');i++){cylinder(g,.83,.87,-.6+i*.25,.065,.23,i%2?palette.sage:palette.gold);}box(g,.83,.6,-.2,.5,.08,1.3,palette.oak);}
      spots.push(spot);
    }
    for(let i=0;i<l('recoveryComfort');i++){plant(root,13.2,-4.8+i*4.2,.85+i*.13);box(root,8.5+i*2,2.3,-6.05,1.25,.5,.1,[palette.rose,palette.gold,palette.mint][i]);}
    if(!l('pressotherapy')){const g=group(root,10.5,0,-2.7,'pressotherapy');box(g,0,.1,0,2,.12,1.6,palette.mint);label(g,'+ PRESOTERAPIA',0,1.2,0,3);}
    if(!l('massage')){const g=group(root,10.5,0,2.6,'massage');box(g,0,.1,0,2,.12,1.6,palette.rose);label(g,'+ MASAJE',0,1.2,0,2.8);}
  }else plot(10.7,-6.2,6.6,12.4,'wellnessWing','AMPLIAR WELLNESS');
  return spots;
}
function windowParams(s){return {capacity:2+Math.min(s.levels?.mat||0,4)*2+Math.min(s.levels?.classes||0,2)*4};}

export function character(kind=0,staff=false){
  const g=new THREE.Group(),skin=[0xf1c39c,0xc59069,0x8b5b42,0xe7b895][kind%4],shirt=staff?palette.sage:[0xe6a496,0x8badc9,0xd9bd75,0xaa9fc8][kind%4];
  const body=group(g,0,.47,0);cylinder(body,0,.25,0,.2,.48,shirt);ball(body,0,.66,0,.22,skin,1,1.12,.95);ball(body,0,.79,-.035,.224,0x594333,1,.55,1);if(kind%2)ball(body,0,.72,-.2,.14,0x594333);
  const legs=[],arms=[];
  for(const side of [-1,1]){const leg=group(g,side*.105,.43,0);box(leg,0,-.17,0,.13,.34,.14,0x43596a);box(leg,0,-.34,.04,.15,.09,.23,palette.white);legs.push(leg);const arm=group(body,side*.25,.43,0);cylinder(arm,0,-.14,0,.065,.3,shirt,8);ball(arm,0,-.31,0,.07,skin);arms.push(arm);}
  for(const side of [-1,1])ball(body,side*.075,.68,.205,.019,palette.ink);if(staff){box(body,0,.2,.19,.27,.35,.025,palette.cream);box(body,0,.43,.2,.15,.04,.025,palette.cream);}
  return {root:g,body,legs,arms};
}
function disposeGroup(root){root.traverse(o=>{if(o.isSprite){o.material.map?.dispose();o.material.dispose();}if(o.isInstancedMesh)o.dispose();});root.removeFromParent();}

export function batchStaticWorld(root){
  root.updateMatrixWorld(true);const batches=new Map();
  root.traverse(obj=>{if(!obj.isMesh||obj.isInstancedMesh)return;let parent=obj,zone;while(parent){if(parent.userData.zone){zone=parent.userData.zone;break;}parent=parent.parent;}const key=obj.geometry.uuid+':'+obj.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push({obj,matrix:obj.matrixWorld.clone(),zone});});
  for(const entries of batches.values()){
    if(entries.length<2)continue;
    const instanced=new THREE.InstancedMesh(entries[0].obj.geometry,entries[0].obj.material,entries.length);instanced.castShadow=true;instanced.receiveShadow=true;instanced.userData.zones=[];
    entries.forEach(({obj,matrix,zone},i)=>{instanced.setMatrixAt(i,matrix);instanced.userData.zones[i]=zone;obj.removeFromParent();});instanced.instanceMatrix.needsUpdate=true;root.add(instanced);
  }
}
export function hitZone(hit){
  if(hit.object.isInstancedMesh)return hit.object.userData.zones?.[hit.instanceId];
  let obj=hit.object;while(obj&&!obj.userData.zone)obj=obj.parent;return obj?.userData.zone;
}

export class Venue3D {
  constructor(canvas,getState,onSelect=()=>{}){
    this.canvas=canvas;this.getState=getState;this.onSelect=onSelect;this.people=new Map();this.time=0;this.last=0;this.fingerprint='';this.target=new THREE.Vector3(0,.1,1.8);this.look=this.target.clone();this.zoom=.58;this.selected='';this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));this.renderer.setClearColor(0xb5d5ba);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0xb5d5ba);this.scene.fog=new THREE.Fog(0xb5d5ba,40,85);
    this.camera=new THREE.OrthographicCamera(-12,12,12,-12,.1,100);this.camera.position.set(18,22,26);this.camera.lookAt(this.look);
    this.scene.add(new THREE.HemisphereLight(0xfff8e4,0x789579,1.8));const sun=new THREE.DirectionalLight(0xffe9bd,2.2);sun.position.set(-8,18,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:.1,far:45});sun.shadow.normalBias=.04;sun.shadow.bias=-.0003;sun.shadow.radius=3;this.scene.add(sun);this.scene.add(new THREE.AmbientLight(0xffffff,.2));
    box(this.scene,0,-.81,0,180,.1,180,0xb5d5ba);
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();
    this.pointers=new Map();
    this.onDown=e=>{this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.gestureStart={x:e.clientX,y:e.clientY};this.dragged=false;canvas.setPointerCapture?.(e.pointerId);};
    this.onMove=e=>{
      const previous=this.pointers.get(e.pointerId);if(!previous)return;
      const others=[...this.pointers.entries()].filter(([id])=>id!==e.pointerId);
      if(others.length){const other=others[0][1],oldDistance=Math.hypot(previous.x-other.x,previous.y-other.y),newDistance=Math.hypot(e.clientX-other.x,e.clientY-other.y);if(oldDistance>2)this.zoom=THREE.MathUtils.clamp(this.zoom*newDistance/oldDistance,.22,1.7);this.dragged=true;}
      else {const dx=e.clientX-previous.x,dy=e.clientY-previous.y,scale=(this.camera.right-this.camera.left)/this.camera.zoom/canvas.getBoundingClientRect().width;this.target.x+=(-.822*dx-.569*dy*1.4)*scale;this.target.z+=(.569*dx-.822*dy*1.4)*scale;this.target.x=THREE.MathUtils.clamp(this.target.x,-18,18);this.target.z=THREE.MathUtils.clamp(this.target.z,-18,18);if(Math.hypot(e.clientX-this.gestureStart.x,e.clientY-this.gestureStart.y)>7)this.dragged=true;}
      this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    };
    this.onPointer=e=>{this.pointers.delete(e.pointerId);if(this.dragged)return;const r=canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);for(const hit of this.raycaster.intersectObject(this.world.root,true)){const zone=hitZone(hit);if(zone){this.select(zone);this.onSelect(zone);break;}}};
    this.onCancel=e=>{this.pointers.delete(e.pointerId);};this.onWheel=e=>{e.preventDefault();this.changeZoom(e.deltaY<0?.08:-.08);};
    canvas.addEventListener('pointerdown',this.onDown);canvas.addEventListener('pointermove',this.onMove);canvas.addEventListener('pointerup',this.onPointer);canvas.addEventListener('pointercancel',this.onCancel);canvas.addEventListener('wheel',this.onWheel,{passive:false});
    this.resize=()=>{const r=canvas.getBoundingClientRect(),width=Math.max(240,r.width),height=Math.max(260,r.height),aspect=width/height;this.renderer.setSize(width,height,false);const vertical=11,horizontal=vertical*aspect;this.fitZoom=Math.min(1,horizontal*2/this.worldWidth());this.camera.left=-horizontal;this.camera.right=horizontal;this.camera.top=vertical;this.camera.bottom=-vertical;this.camera.updateProjectionMatrix();};
    this.observer=new ResizeObserver(this.resize);this.observer.observe(canvas);this.resize();
    this.rebuild();this.frame=this.frame.bind(this);requestAnimationFrame(this.frame);
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.dataset.renderer='recovering';});canvas.addEventListener('webglcontextrestored',()=>{canvas.dataset.renderer='3d';});canvas.dataset.renderer='3d';
  }
  worldWidth(){const f=this.world?.footprint;return f?(f.right-f.left)*.83+(14-f.back)*.57+6:30;}
  rebuild(){const s=this.getState(),previous=this.world?.footprint;if(this.world)disposeGroup(this.world.root);this.world=buildWorld(s);batchStaticWorld(this.world.root);this.scene.add(this.world.root);this.fingerprint=JSON.stringify(s.levels);this.staff=[];
    this.fitZoom=Math.min(1,(this.camera.right-this.camera.left)/this.worldWidth());if(previous&&previous.area!==this.world.footprint.area)this.focus('all');
    this.steam=[];for(let i=0;i<5;i++){const puff=ball(this.world.root,-4.6,2.7,-2.5,.08,palette.white);puff.castShadow=false;puff.receiveShadow=false;this.steam.push(puff);}
    for(let i=0;i<Math.min(3,s.levels.barista||0);i++){const staff=character(i,true);staff.root.position.set(-4.7+i*1.3,0,-4.2);this.world.root.add(staff.root);this.staff.push(staff);}
    if(s.levels.coach){const staff=character(2,true);staff.root.position.set(5.9,0,-3.7);this.world.root.add(staff.root);this.staff.push(staff);}
    for(let i=0;i<Math.min(2,s.levels.therapist||0);i++){const staff=character(i+1,true);staff.root.position.set(8.4+i*2.8,0,1.5);this.world.root.add(staff.root);this.staff.push(staff);}
    this.students=this.world.students.map((spot,i)=>{const p=character(i);p.root.position.set(spot.x,spot.premium ? .66 : .17,spot.z);p.root.rotation.set(-Math.PI/2,0,0);this.world.root.add(p.root);return p;});
    this.manual=character(0,true);this.manual.root.position.set(-3,0,-4.2);this.world.root.add(this.manual.root);
    if(this.ring){this.ring.geometry.dispose();this.ring.material.dispose();this.ring.removeFromParent();this.ring=null;}
    if(this.selected)this.select(this.selected);
  }
  select(id){this.selected=id;if(this.ring){this.ring.geometry.dispose();this.ring.material.dispose();this.ring.removeFromParent();}const locations={machine:[-3.1,-2.9,3],pastries:[-1.4,-2.9,1.4],matcha:[-5,-3,1.5],seats:[-3.3,1.5,3],mat:[3.7,-.2,3.8],reformer:[3.7,-.2,3.8],barista:[-3.2,-4.2,2],coach:[5.9,-3.7,1.4],terrace:[0,7.1,2.5],classes:[3.7,2.5,3],spa:[6,-1,1.5],manager:[-3.2,-4.2,2],second:[0,6,2]};const [x,z,r]=locations[id]||({cafeWing:[-10.7,0,3],wellnessWing:[10.7,0,3],yogaWing:[-3.9,-9.4,3],pressotherapy:[10.6,-2.7,2.5],pressureCare:[10.6,-2.7,2.5],massage:[10.6,2.6,2.5],massageCare:[10.6,2.6,2.5],recoveryComfort:[10.7,0,3],therapist:[9.8,1.5,2],yoga:[-3.9,-9.4,3],yogaCare:[-3.9,-9.4,3],cafeDecor:[-4,4.5,2],roaster:[-6,-4.9,1.4]}[id])||locations.machine;this.ring=new THREE.Mesh(new THREE.RingGeometry(r-.055,r,64),new THREE.MeshBasicMaterial({color:0xffdf75,side:THREE.DoubleSide,transparent:true,opacity:.9}));this.ring.rotation.x=-Math.PI/2;this.ring.position.set(x,.13,z);this.scene.add(this.ring);}
  focus(zone){if(zone==='cafe'){this.target.set(-3,.1,-.3);this.zoom=.95;}else if(['pressotherapy','massage','yoga'].includes(zone)){const spot=Layout.serviceSlots(this.getState(),zone)[0];if(spot){this.target.set(spot.x,.1,spot.z);this.zoom=.85;}}else if(zone==='pilates'){this.target.set(3.7,.1,-.1);this.zoom=1.05;}else{const f=this.world.footprint;this.target.set((f.left+f.right)/2,.1,(f.back+12)/2);this.zoom=this.fitZoom;} }
  changeZoom(delta){this.zoom=THREE.MathUtils.clamp(this.zoom+delta,.22,1.7);}
  updatePeople(s,dt){const targets=new Map();
    s.queue.forEach((o,i)=>targets.set(o.id,{x:-3.8+(i%3)*.7,z:-1.45+Math.floor(i/3)*.62,order:o,kind:o.kind}));
    s.seated.forEach(o=>{const [x,z]=this.world.tablePositions[o.id%this.world.tableCount];targets.set(o.id,{x:x+.98,z,kind:o.kind,seated:true});});
    for(const t of s.treatments||[]){const spot=Layout.serviceSlots(s,t.service)[t.slot];if(spot)targets.set(t.id,{...spot,kind:t.kind,treatment:t});}
    for(const [id,target]of targets)if(!this.people.has(id)){const p=character(target.kind);p.root.position.set(id%2?-11:11,0,9.25);p.cup=cup(p.body,.19,.22,.3);p.cup.visible=false;p.boots=[];
      for(const leg of p.legs){const boot=group(leg);boot.name='Bota de presoterapia';for(let j=0;j<4;j++){const cuff=cylinder(boot,0,-.05-j*.09,.01,.115,.075,j%2?0x89cad5:0x355d72,10);cuff.name='Cámara de compresión';}box(boot,0,-.34,.08,.22,.13,.31,0x355d72);boot.visible=false;p.boots.push(boot);}
      this.people.set(id,p);this.scene.add(p.root);
    }
    for(const [id,p]of this.people){const target=targets.get(id),current=p.root.position,destination=target||{x:id%2?17:-17,z:9.25};
      const key=target?`${target.x}/${target.z}`:'leaving';if(p.destinationKey!==key){p.destinationKey=key;p.route=Layout.route(current,destination,current.z>6.2, !target);}
      p.root.rotation.x=0;current.y=0;
      while(p.route.length&&Math.hypot(p.route[0].x-current.x,p.route[0].z-current.z)<.1)p.route.shift();
      const goal=p.route[0],moving=!!goal;
      if(goal){const dx=goal.x-current.x,dz=goal.z-current.z,dist=Math.hypot(dx,dz),amount=Math.min(dist,dt*3.5);current.x+=dx/dist*amount;current.z+=dz/dist*amount;p.root.rotation.y=Math.atan2(dx,dz);}
      else{p.root.rotation.y=target?.seated?-Math.PI/2:Math.PI;if(target){current.x=target.x;current.z=target.z;}}
      const gait=this.reduced?0:Math.sin(this.time*11+id)*.5*(moving?1:.08);p.legs[0].rotation.x=gait;p.legs[1].rotation.x=-gait;p.arms[0].rotation.x=-gait*.7;p.arms[1].rotation.x=gait*.7;
      p.body.position.y=.47+(moving&&!this.reduced?Math.abs(Math.sin(this.time*11+id))*.025:0);
      const treating=!moving&&target?.treatment?.stage==='active',pressure=treating&&target.service==='pressotherapy';
      p.boots.forEach(boot=>{boot.visible=pressure;boot.scale.x=1+(this.reduced?0:Math.sin(this.time*2)*.045);});
      if(treating){if(target.service==='yoga'){p.arms[0].rotation.z=-1.25;p.arms[1].rotation.z=1.25;p.legs[0].rotation.x=.25;}else{p.root.rotation.set(-Math.PI/2,0,0);current.y=.73;current.z=target.z+.55;p.legs.forEach(leg=>leg.rotation.x=0);p.arms.forEach(arm=>arm.rotation.x=0);}}
      else p.arms.forEach(arm=>arm.rotation.z=0);
      p.cup.visible=!!target?.seated&&!moving;if(p.cup.visible)p.arms[1].rotation.x=-.85;
      if(target?.order&&(!p.bubble||p.product!==target.order.product)){if(p.bubble)disposeGroup(p.bubble);p.product=target.order.product;const words={coffee:'☕',breakfast:'🥐',matcha:'🍵',smoothie:'🥤'};p.bubble=group(p.root);label(p.bubble,words[p.product]||'☕',0,1.65,0,.95,'#42604e','#fff9e9');}
      if(p.bubble)p.bubble.visible=!!target?.order&&(s.queue.slice(0,2).some(o=>o.id===id)||target.order.remaining!==null);
      if(!target?.order&&p.bubble){disposeGroup(p.bubble);p.bubble=null;}
      if(!target&&!moving){disposeGroup(p.root);this.people.delete(id);}
    }
  }
  frame(now){if(this.stopped)return;requestAnimationFrame(this.frame);if(document.hidden||!this.canvas.closest('.view.active')||this.canvas.dataset.renderer==='recovering'){this.last=now;return;}if(now-this.last<(this.reduced?180:33))return;const dt=Math.min(.08,(now-this.last)/1000||.033);this.last=now;this.time+=dt;const s=this.getState();if(JSON.stringify(s.levels)!==this.fingerprint)this.rebuild();
    this.updatePeople(s,dt);const brewing=s.queue.some(o=>o.remaining!==null);this.manual.root.visible=!(s.levels.barista)&&brewing;this.steam.forEach((p,i)=>{p.visible=brewing;const phase=(this.time*.6+i*.2)%1;p.position.y=2.45+phase*.8;p.position.x=-4.6+Math.sin(this.time*2+i)*.08;p.scale.setScalar(.04+phase*.09);});this.staff.forEach((p,i)=>{p.arms[0].rotation.x=this.reduced?-.3:-.7+Math.sin(this.time*5+i)*.28;p.arms[1].rotation.x=-.4;});
    this.students.forEach((p,i)=>{p.root.visible=s.classRemaining>0&&i<s.classSeats;p.legs[0].rotation.x=this.reduced ? .3 : Math.sin(this.time*1.6+i)*.38;p.legs[1].rotation.x=-p.legs[0].rotation.x;});
    const a=this.reduced?1:Math.min(1,dt*5);this.look.lerp(this.target,a);this.camera.position.set(this.look.x+18,this.look.y+22,this.look.z+26);this.camera.lookAt(this.look);this.camera.zoom+=(this.zoom-this.camera.zoom)*a;this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);
  }
  destroy(){this.stopped=true;this.observer.disconnect();for(const [type,handler]of [['pointerdown',this.onDown],['pointermove',this.onMove],['pointerup',this.onPointer],['pointercancel',this.onCancel],['wheel',this.onWheel]])this.canvas.removeEventListener(type,handler);if(this.world)disposeGroup(this.world.root);for(const p of this.people.values())disposeGroup(p.root);this.renderer.dispose();}
}
