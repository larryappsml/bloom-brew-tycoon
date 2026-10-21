import {snapshot,animatePose,animateStaff,rally} from './animation3d.mjs';
import * as THREE from './vendor/three.module.min.mjs';
import './layout.js';
import './clocks.js';
import {dressWorld} from './decor3d.mjs';
import {buildActivities} from './activities3d.mjs';
import {buildSports} from './sports3d.mjs';
import {polishWorld,contactLayer,setContacts,CrowdLayer} from './art3d.mjs';
const Layout=globalThis.BloomLayout;

// Original low-poly art. Shared materials/geometries keep the scene inexpensive.
const palette={cream:0xfff2d7,sage:0x6fbc99,dark:0x24564d,mint:0xb7dec4,wood:0xba8054,oak:0xe9b77a,gold:0xf4c45f,rose:0xe9a998,sky:0xb1deea,white:0xfffdf2,ink:0x344b55};
const mats=new Map(),geometries=new Map();
function material(color){if(!mats.has(color)){const options={color,roughness:color===palette.white?.38:color===palette.gold?.34:.82,metalness:color===palette.gold?.48:color===palette.dark?.08:0};if([palette.wood,palette.oak,0xe4c298,0xefcfaa,0xe8cba5].includes(color)){const data=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,v=221+Math.round(Math.sin(x*.56+Math.sin(y*.14)*1.8)*12)+(x*13+y*7)%9;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}const map=new THREE.DataTexture(data,64,64);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(2,2);map.colorSpace=THREE.SRGBColorSpace;map.needsUpdate=true;options.map=mats.get('woodgrain')||map;mats.set('woodgrain',options.map);}mats.set(color,new THREE.MeshStandardMaterial(options));}return mats.get(color);}
function geometry(key,create){if(!geometries.has(key))geometries.set(key,create());return geometries.get(key);}
function mesh(parent,geo,color,x,y,z,sx=1,sy=1,sz=1){const obj=new THREE.Mesh(geo,material(color));obj.position.set(x,y,z);obj.scale.set(sx,sy,sz);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;}
function box(parent,x,y,z,w,h,d,color){return mesh(parent,geometry('softbox',()=>{const shape=new THREE.Shape(),a=.46,r=.08;shape.moveTo(-a+r,-a);shape.lineTo(a-r,-a);shape.quadraticCurveTo(a,-a,a,-a+r);shape.lineTo(a,a-r);shape.quadraticCurveTo(a,a,a-r,a);shape.lineTo(-a+r,a);shape.quadraticCurveTo(-a,a,-a,a-r);shape.lineTo(-a,-a+r);shape.quadraticCurveTo(-a,-a,-a+r,-a);const geo=new THREE.ExtrudeGeometry(shape,{depth:.92,steps:1,bevelEnabled:true,bevelSegments:1,bevelSize:.04,bevelThickness:.04,curveSegments:2});geo.translate(0,0,-.46);return geo;}),color,x,y,z,w,h,d);}
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
function plant(parent,x,z,size=1){const g=group(parent,x,0,z);mesh(g,geometry('ceramicPlanter',()=>new THREE.LatheGeometry([[.17,0],[.21,.025],[.25,.13],[.28,.46],[.27,.54],[.235,.55]].map(([x,y])=>new THREE.Vector2(x,y)),16)),0xe3a984,0,0,0);cylinder(g,0,.58,0,.28,.09,0xf0be9c);cylinder(g,0,.88,0,.035,.7,0x638653,6);for(let i=0;i<7;i++){const a=i*2.4;const leaf=ball(g,Math.cos(a)*.23,1+i*.07,Math.sin(a)*.23,.3,i%2?0x5f9a70:0x86bd7d,1,.45,.65);leaf.rotation.z=Math.sin(a)*.8;}g.scale.setScalar(size);return g;}
function cup(parent,x,y,z,color=palette.white){const g=group(parent,x,y,z);cylinder(g,0,.09,0,.13,.18,color);cylinder(g,0,.19,0,.11,.015,0x72462c);const handle=mesh(g,geometry('handle',()=>new THREE.TorusGeometry(.09,.025,5,10)),color,.14,.1,0);handle.rotation.y=Math.PI/2;return g;}
// One shared draw mesh per recipe, attached to the order rather than the table.
export function buildServing(product){const root=new THREE.Group();root.name='Consumición: '+product;root.userData.product=product;
  cylinder(root,0,.025,0,.3,.035,palette.white,20);cylinder(root,0,.046,0,.26,.012,0xe6d5b6,20);
  if(['coffee','matcha','latte'].includes(product)){const color=product==='matcha'?palette.sage:product==='latte'?0xd69b72:palette.white;
    const mug=cup(root,0,.06,0,color);mug.children[1].material=material(product==='matcha'?0x7baf53:product==='latte'?0xd8ae7a:0x69412c);
    if(product==='latte'){for(let i=0;i<3;i++){const leaf=ball(mug,-.045+i*.043,.205,0,.04,palette.white,1,.12,1.5);leaf.rotation.y=i*.45;}}
    if(product==='coffee')ball(mug,-.035,.2,-.03,.035,0xd9b685,1,.1,1);
    // Flatten the mug's rigid pieces before batching the recipe.
    mug.updateMatrix();for(const part of [...mug.children]){part.applyMatrix4(mug.matrix);root.add(part);}root.remove(mug);
  }else if(product==='smoothie'){cylinder(root,0,.22,0,.15,.36,0xdd8f9f,16);cylinder(root,0,.41,0,.17,.035,0xffdfce,16);box(root,.045,.56,.01,.025,.3,.025,palette.sage);ball(root,-.07,.44,0,.07,0xc44c62);}
  else if(product==='breakfast'){const crescent=mesh(root,geometry('croissant',()=>new THREE.TorusGeometry(.15,.085,7,16,Math.PI*1.45)),0xd89643,0,.15,0);crescent.rotation.x=Math.PI/2;crescent.rotation.z=-.7;for(let i=0;i<3;i++){const ridge=box(root,-.1+i*.08,.22,.04,.026,.02,.15,0xffd28b);ridge.rotation.y=(i-1)*.35;}}
  else if(product==='cake'){const shape=new THREE.Shape();shape.moveTo(-.17,-.17);shape.lineTo(.22,0);shape.lineTo(-.17,.17);shape.closePath();const geo=geometry('cakeSlice',()=>{const g=new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false});g.rotateX(-Math.PI/2);return g;});for(let i=0;i<5;i++)mesh(root,geo,i%2?0xf9e9ce:0x9a6350,0,.07+i*.045,0,1,.044,1);ball(root,-.08,.34,0,.065,0xc75066);ball(root,-.11,.39,.01,.04,palette.sage,1,.2,.5);}
  else if(product==='toast'){box(root,0,.105,0,.39,.08,.3,0xa56d36);box(root,0,.15,0,.34,.025,.26,0xf2ca80);for(let i=0;i<4;i++){const slice=ball(root,-.12+i*.075,.185,0,.065,i%2?0x77a348:0x9ac669,.6,.2,1.65);slice.rotation.y=-.35;}ball(root,.04,.22,0,.075,palette.white,1.2,.23,1);ball(root,.04,.239,0,.04,palette.gold,1,.25,1);}
  batchCharacterPart(root,'serving:'+product);if(['coffee','matcha','latte'].includes(product)){const steam=group(root,0,.42,0);steam.name='Vapor';for(let j=0;j<3;j++)ball(steam,(j-1)*.055,j*.12,0,.028,palette.white,1,1.7,1);batchCharacterPart(steam,'serving:steam');}return root;
}
function table(parent,x,z,tier=0){const g=group(parent,x,0,z,'seats');cylinder(g,0,.48,0,.075,.9,palette.dark);cylinder(g,0,.08,0,.4,.09,palette.dark);cylinder(g,0,.99,0,.71,.12,tier>2?palette.white:palette.oak,20);cylinder(g,-.21,1.14,-.15,.09,.17,0xe0a08b);ball(g,-.21,1.3,-.15,.12,palette.sage);for(const offset of [-1,1]){const chair=group(g,offset*1.01,0,.08);box(chair,0,.5,0,.52,.16,.55,palette.sage);box(chair,offset*.23,.85,0,.09,.65,.57,palette.mint);for(const a of [-.18,.18])for(const b of [-.18,.18])box(chair,a,.24,b,.055,.45,.055,palette.wood);}return g;}
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

// Merge only rigid pieces inside a joint. Arms and legs retain their own transforms.
function batchCharacterPart(parent,key){const pieces=parent.children.filter(o=>o.isMesh);if(!pieces.length)return;
  const combined=geometry('person:'+key,()=>{const positions=[],normals=[],colors=[],vector=new THREE.Vector3(),normalMatrix=new THREE.Matrix3();
    for(const piece of pieces){piece.updateMatrix();normalMatrix.getNormalMatrix(piece.matrix);const part=piece.geometry.index?piece.geometry.toNonIndexed():piece.geometry.clone(),p=part.getAttribute('position'),n=part.getAttribute('normal'),color=piece.material.color;
      for(let i=0;i<p.count;i++){vector.fromBufferAttribute(p,i).applyMatrix4(piece.matrix);positions.push(vector.x,vector.y,vector.z);vector.fromBufferAttribute(n,i).applyNormalMatrix(normalMatrix);normals.push(vector.x,vector.y,vector.z);colors.push(color.r,color.g,color.b);}part.dispose();}
    const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));result.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));result.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));result.computeBoundingSphere();return result;
  });
  if(!mats.has('people'))mats.set('people',new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82}));
  pieces.forEach(p=>parent.remove(p));const merged=new THREE.Mesh(combined,mats.get('people'));merged.castShadow=true;merged.receiveShadow=true;parent.add(merged);
}
export function buildWorld(state){
  const root=new THREE.Group(),levels=state.levels||{},p=windowParams(state),studio=!!levels.mat,zones=Layout.zones(state),footprint=Layout.footprint(state);
  root.name='Bloom & Brew world';const targets={};
  box(root,0,-.39,0,15.6,.65,13.2,0x9db59b);box(root,0,-.03,0,14.7,.16,12.4,palette.cream);
  // Large ceramic tiles, warm parquet, tiled studio and an open storefront.
  for(let x=0;x<7;x++)for(let z=0;z<6;z++){
    const xx=-6.2+x*2.05,zz=-5.05+z*2.02;
    if(x<4){for(let j=0;j<4;j++){const across=(j-1.5)*.5,turned=(x+z)%2;const plank=box(root,xx+(turned?0:across),.065,zz+(turned?across:0),.48,.035,1.97,[0xe4c298,0xefcfaa,0xe8cba5][(x+z+j)%3]);plank.rotation.y=turned?Math.PI/2:0;}}
    else box(root,xx,.065,zz,2,.035,1.97,studio?((x+z)%2?0xb9d8c6:0xc9e3d3):0xc4cbbf);
  }
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
  tablePositions.filter(([,z])=>z<6.3).forEach(([x,z])=>table(root,x,z,levels.seats||0));
  const stool=group(root,-5.6,0,-1.55,'seats');cylinder(stool,0,.28,0,.045,.52,palette.dark);cylinder(stool,0,.58,0,.24,.12,palette.sage);
  for(let i=0;i<Math.min(3,levels.cafeDecor||0);i++){plant(root,-5.8+i*2.3,5.05,.8+i*.1);box(root,-5.8+i*2.3,2.8,-5.45,1.2,.6,.08,[palette.rose,palette.mint,palette.gold][i]);}
  plant(root,-6.15,4.7,1.25);plant(root,.05,-4.8,1.1);plant(root,6.3,4.8,1.2);
  // Divider is low so that the studio remains legible on a phone.
  for(const [z,d]of [[-3.1,4.7],[.95,1],[2.95,.6]])box(root,.65,.28,z,.12,.5,d,palette.white);for(const z of [-4.8,-1.1,3.15])plant(root,.65,z,.63);
  const studioGroup=group(root,3.85,0,-.3,'mat');targets.mat=studioGroup;
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
  }
  const serviceSpots=buildExpansions(root,state);
  // A continuous street and pavement connect arriving guests to the front door.
  box(root,0,-.3,11.6,48,.3,4.1,0x718086);box(root,0,-.18,8.25,46,.24,2.55,0xd8ded4);
  for(let i=0;i<30;i++)box(root,-22+i*1.5,-.045,8.25,1.45,.025,2.4,0xe9e8db);
  for(let i=0;i<10;i++)box(root,-21+i*4.5,-.135,11.8,2,.015,.1,palette.cream);
  for(let i=0;i<5;i++)box(root,-1.6+i*.62,-.13,10.7,.36,.015,1.9,palette.white);
  for(const x of [-17,17]){plant(root,x,7.8,1.7);cylinder(root,x,1.7,9.2,.06,3.6,palette.dark);ball(root,x,3.55,9.2,.26,palette.gold);const car=group(root,x,0,12.3);box(car,0,.32,0,2.9,.6,1.3,palette.sage);box(car,0,.83,0,1.4,.55,1.15,palette.sky);for(const a of [-.9,.9])for(const b of [-.65,.65]){const wheel=cylinder(car,a,.1,b,.24,.13,palette.ink);wheel.rotation.x=Math.PI/2;}}
  for(const x of [-15,15])for(const z of [-4.7,1.6,5.5])plant(root,x,z,1.5);
  const entrance=group(root,-.4,0,5.95);for(const x of [-1.85,1.85])box(entrance,x,1.1,0,.13,2.2,.13,palette.dark);box(entrance,0,2.32,0,4.2,.22,.8,palette.sage);for(let i=0;i<8;i++)box(entrance,-1.84+i*.52,2.44,0,.48,.06,.83,i%2?palette.cream:palette.sage);
  if(levels.terrace){for(const x of (levels.terrace>1?[-10,-4.8,3.8,10]:[-4.8,3.8])){table(root,x,7.1);cylinder(root,x,1.55,7.1,.035,3.1,palette.wood);mesh(root,geometry('parasol',()=>new THREE.ConeGeometry(1.35,.45,8)),palette.cream,x,3.1,7.1);}plant(root,-6.4,7.25,.8);}
  const kit={box,cylinder,ball,group,plant,label,cup,geometry,mesh,palette};buildSports(root,state,kit);buildActivities(root,state,kit);
  const detailFeatures=dressWorld(root,state,kit);const artFeatures=polishWorld(root,state,kit);
  return {root,targets,students,tablePositions,tableCount,bar,studio,serviceSpots,footprint,detailFeatures,artFeatures};
}
function buildExpansions(root,s){const z=Layout.zones(s),l=id=>Math.min(s.levels?.[id]||0,6),spots=[];
  function room(x,back,w,d,color,title,zone){const g=group(root,x,0,back+d/2,zone);box(g,0,-.25,0,w,.55,d,0xa4b39c);box(g,0,.04,0,w-.1,.1,d-.1,color);box(g,0,1.15,-d/2,w,2.4,.15,palette.cream);if(zone==='wellnessWing'){box(g,-w/2,1.15,-3.3,.15,2.4,5.1,palette.cream);box(g,-w/2,1.15,4.7,.15,2.4,2.1,palette.cream);}else box(g,-w/2,1.15,0,.15,2.4,d,palette.cream);return g;}
  function plot(x,back,w,d,id,title){const g=group(root,x,0,back+d/2,id);box(g,0,-.35,0,w,.16,d,0xa9c49b);for(const a of [-1,1])for(const b of [-1,1])box(g,a*(w/2-.2),.23,b*(d/2-.2),.12,.6,.12,palette.white);box(g,0,.08,0,1.15,.08,1.15,palette.sage);box(g,0,.14,0,.65,.07,.14,palette.white);box(g,0,.14,0,.14,.07,.65,palette.white);}
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
    if(!l('pressotherapy')){const g=group(root,10.5,0,-2.7,'pressotherapy');box(g,0,.1,0,2,.12,1.6,palette.mint);}
    if(!l('massage')){const g=group(root,10.5,0,2.6,'massage');box(g,0,.1,0,2,.12,1.6,palette.rose);}
  }else plot(10.7,-6.2,6.6,12.4,'wellnessWing','AMPLIAR WELLNESS');
  return spots;
}
function windowParams(s){return {capacity:2+Math.min(s.levels?.mat||0,4)*2+Math.min(s.levels?.classes||0,2)*4};}

export const outfitFor=a=>a.outfit||a.sport||(a.type==='pilates'?'pilates':a.service==='yoga'?'yoga':['cycling','boxing'].includes(a.service)?a.service:['thermal','cold'].includes(a.service)?'wellness':a.service==='cowork'?'premium':a.type==='treatment'?(['nails','beauty'].includes(a.service)?'cafe':'wellness'):'cafe');
export function character(kind=0,staff=false,role='cafe'){
  const g=new THREE.Group(),skin=[0xf1c39c,0xc59069,0x8b5b42,0xe7b895][kind%4],hair=[0x594333,0x342e2a,0x73503a,0x976d43][kind%4],apron=staff&&role==='cafe',shirt=role==='premium'?0x293847:role==='wellness'?0xf4ead4:role==='padel'?0xfff7df:role==='crossfit'?[0x4f6b5c,0x996b74,0x424c57,0xb5a080][kind%4]:role==='pilates'?[0xc89cac,0x8caaa4,0xc2ab84,0x9c99ba][kind%4]:role==='yoga'?[0xc6b58f,0xc49ea2,0x96ada3,0xb5a4bc][kind%4]:staff?palette.sage:[0xe6a496,0x8badc9,0xd9bd75,0xaa9fc8][kind%4];g.userData.role=role;
  const sporty=['crossfit','padel','cycling','boxing'].includes(role),pants=role==='premium'?0x293847:role==='padel'?0x597c7e:role==='crossfit'?0x384b49:role==='pilates'?0x657e87:role==='yoga'?0x9e7c98:role==='wellness'?0xf4ead4:0x43596a;
  const body=group(g,0,.47,0);cylinder(body,0,.25,0,.2,.48,shirt);ball(body,0,.66,0,.22,skin,1,1.12,.95);ball(body,0,.79,-.035,.224,hair,1,.55,1);if(kind%2)ball(body,0,.72,-.2,.14,hair);
  for(const side of [-1,1]){ball(body,side*.214,.67,0,.047,skin,.5,1,.65);const brow=box(body,side*.075,.735,.196,.065,.015,.025,hair);brow.rotation.z=side*.08;}
  cylinder(body,0,.49,0,.083,.12,skin);const smile=mesh(body,geometry('smile',()=>new THREE.TorusGeometry(.035,.007,4,8,Math.PI)),palette.ink,0,.61,.215);smile.rotation.z=Math.PI;
  for(let i=0;i<3;i++){const lock=ball(body,-.13+i*.12,.8,.1,.105,hair,.75,.65,.6);lock.rotation.z=(i-1)*.3;}
  if(kind%2){ball(body,0,.91,-.09,.13,hair);const tie=mesh(body,geometry('hairTie',()=>new THREE.TorusGeometry(.095,.018,5,12)),palette.sage,0,.85,-.15);tie.rotation.x=Math.PI/2;}
  if(apron){box(body,0,.2,.215,.18,.12,.025,palette.oak);ball(body,-.09,.4,.22,.025,palette.gold);ball(body,.09,.4,.22,.025,palette.gold);}else if(role==='cafe'){box(body,0,.28,.2,.02,.3,.025,0xffffff);if(kind%2)box(body,-.22,.02,0,.18,.2,.22,palette.oak);}
  if(role==='premium'){box(body,0,.34,.205,.17,.29,.035,palette.white);box(body,0,.32,.235,.045,.25,.025,0x9d5261);for(const side of [-1,1]){const lapel=box(body,side*.11,.37,.22,.075,.28,.03,0x435466);lapel.rotation.z=side*.32;}box(body,-.14,.4,.23,.065,.025,.02,palette.gold);}
  if(role==='wellness'){cylinder(body,0,0,0,.235,.4,shirt);box(body,0,.17,.22,.36,.055,.035,palette.sage);for(const side of [-1,1]){const lapel=box(body,side*.075,.33,.205,.05,.28,.035,palette.white);lapel.rotation.z=side*.35;}}
  if(['pilates','yoga','crossfit'].includes(role)){const band=mesh(body,geometry('headband',()=>new THREE.TorusGeometry(.218,.026,6,18)),role==='yoga'?palette.gold:palette.mint,0,.79,0);band.rotation.x=Math.PI/2;box(body,0,.48,.15,.22,.03,.025,0xf7eddf);}
  if(role==='padel'){ball(body,0,.85,-.015,.23,palette.white,1,.27,1);box(body,0,.82,.23,.36,.035,.22,palette.white);for(const side of [-1,1]){const collar=box(body,side*.065,.47,.18,.13,.045,.08,palette.sage);collar.rotation.z=side*.35;}}
  const legs=[],arms=[],knees=[];
  for(const side of [-1,1]){const leg=group(g,side*.105,.43,0);box(leg,0,-.085,0,.13,.17,.14,pants);const knee=group(leg,0,-.17,0);box(knee,0,-.085,0,.13,.17,.14,sporty?skin:pants);box(knee,0,-.17,.04,.15,.09,.23,role==='premium'?palette.ink:role==='wellness'?palette.mint:palette.white);knees.push(knee);legs.push(leg);const arm=group(body,side*.25,.43,0);cylinder(arm,0,-.14,0,.065,.3,sporty?skin:shirt,8);if(sporty)cylinder(arm,0,-.015,0,.075,.09,shirt,8);ball(arm,0,-.31,0,.07,skin);if(role==='boxing')ball(arm,0,-.31,.02,.12,palette.rose);if(role==='padel'&&side===1){box(arm,0,-.39,.02,.04,.19,.035,palette.dark);ball(arm,0,-.58,.02,.15,[palette.rose,palette.sage,palette.gold,palette.sky][kind%4],1,1.3,.2);for(let j=0;j<3;j++)ball(arm,-.07+j*.07,-.57,.057,.015,palette.ink);}arms.push(arm);}
  for(const side of [-1,1]){ball(body,side*.075,.68,.205,.019,palette.ink);ball(body,side*.135,.615,.18,.035,0xe8a48e,1,.6,.25);ball(body,side*.105,.805,.135,.075,hair,1,.6,.45);}ball(body,0,.635,.222,.028,skin,1,1.2,1);
  if(apron){box(body,0,.2,.19,.27,.35,.025,palette.cream);box(body,0,.43,.2,.15,.04,.025,palette.cream);box(body,0,.14,.215,.12,.09,.02,palette.sage);box(body,-.1,.35,.215,.075,.045,.025,palette.gold);}else if(role==='cafe'||role==='padel')for(let i=0;i<3;i++)ball(body,0,.24+i*.085,.215,.015,palette.gold);
  batchCharacterPart(body,`body:${kind%4}:${staff}:${role}`);legs.forEach(leg=>batchCharacterPart(leg,'thigh:'+role));knees.forEach(knee=>batchCharacterPart(knee,'shin:'+role));arms.forEach((arm,i)=>batchCharacterPart(arm,`arm:${kind%4}:${staff}:${role}:${role==='padel'?i:0}`));
  return {root:g,body,legs,arms,knees};
}
function disposeGroup(root){root.traverse(o=>{if(o.isSprite){o.material.map?.dispose();o.material.dispose();}if(o.isInstancedMesh)o.dispose();});root.removeFromParent();}

export function batchStaticWorld(root){
  root.updateMatrixWorld(true);const batches=new Map();
  root.traverse(obj=>{if(!obj.isMesh||obj.isInstancedMesh)return;let parent=obj,zone;while(parent){if(parent.userData.zone){zone=parent.userData.zone;break;}parent=parent.parent;}const key=obj.geometry.uuid+':'+obj.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push({obj,matrix:obj.matrixWorld.clone(),zone});});
  for(const entries of batches.values()){
    if(entries.length<2)continue;
    const instanced=new THREE.InstancedMesh(entries[0].obj.geometry,entries[0].obj.material,entries.length);instanced.castShadow=entries.some(e=>e.obj.castShadow);instanced.receiveShadow=entries.some(e=>e.obj.receiveShadow);instanced.userData.zones=[];
    entries.forEach(({obj,matrix,zone},i)=>{instanced.setMatrixAt(i,matrix);instanced.userData.zones[i]=zone;obj.removeFromParent();});instanced.instanceMatrix.needsUpdate=true;root.add(instanced);
  }
}
export function hitZone(hit){
  if(hit.object.isInstancedMesh)return hit.object.userData.zones?.[hit.instanceId];
  let obj=hit.object;while(obj&&!obj.userData.zone)obj=obj.parent;return obj?.userData.zone;
}

export function walkPath(position,route,budget){
  let heading=0;
  while(route.length&&budget>0){const point=route[0],dx=point.x-position.x,dz=point.z-position.z,distance=Math.hypot(dx,dz);
    if(distance<.001){position.x=point.x;position.z=point.z;route.shift();continue;}
    heading=Math.atan2(dx,dz);const step=Math.min(budget,distance);position.x+=dx/distance*step;position.z+=dz/distance*step;budget-=step;
    if(step>=distance-.001){position.x=point.x;position.z=point.z;route.shift();}else break;
  }
  return {moving:route.length>0,heading};
}

export const worldStamp=s=>JSON.stringify({levels:s.levels,chapters:s.chapters||[],campaign:s.campaign&&s.campaign.remaining>0?s.campaign.id:null});
export class Venue3D {
  constructor(canvas,getState,onSelect=()=>{}){
    this.canvas=canvas;this.getState=getState;this.onSelect=onSelect;this.people=new Map();this.time=0;this.last=0;this.fingerprint='';this.target=new THREE.Vector3(0,.1,1.8);this.look=this.target.clone();this.zoom=.46;this.selected='';this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));this.renderer.setClearColor(0xb5d5ba);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.98;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0xb5d5ba);this.scene.fog=new THREE.Fog(0xb5d5ba,75,150);
    this.camera=new THREE.OrthographicCamera(-12,12,12,-12,.1,100);this.camera.position.set(18,22,26);this.camera.lookAt(this.look);
    this.scene.add(new THREE.HemisphereLight(0xfff4df,0x6f8a80,1.45));const sun=new THREE.DirectionalLight(0xffe6c4,2.5);sun.position.set(-8,18,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:.1,far:45});sun.shadow.normalBias=.035;sun.shadow.bias=-.0003;sun.shadow.radius=3;this.scene.add(sun);this.scene.add(new THREE.AmbientLight(0xffffff,.2));
    box(this.scene,0,-.81,0,180,.1,180,0xb5d5ba);
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();
    this.pointers=new Map();
    this.onDown=e=>{this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.gestureStart={x:e.clientX,y:e.clientY};this.dragged=false;canvas.setPointerCapture?.(e.pointerId);};
    this.onMove=e=>{
      const previous=this.pointers.get(e.pointerId);if(!previous)return;
      const others=[...this.pointers.entries()].filter(([id])=>id!==e.pointerId);
      if(others.length){const other=others[0][1],oldDistance=Math.hypot(previous.x-other.x,previous.y-other.y),newDistance=Math.hypot(e.clientX-other.x,e.clientY-other.y);if(oldDistance>2)this.zoom=THREE.MathUtils.clamp(this.zoom*newDistance/oldDistance,.22,1.7);this.dragged=true;}
      else {const dx=e.clientX-previous.x,dy=e.clientY-previous.y,scale=(this.camera.right-this.camera.left)/this.camera.zoom/canvas.getBoundingClientRect().width;this.target.x+=(-.822*dx-.569*dy*1.4)*scale;this.target.z+=(.569*dx-.822*dy*1.4)*scale;this.target.x=THREE.MathUtils.clamp(this.target.x,-35,35);this.target.z=THREE.MathUtils.clamp(this.target.z,-30,18);if(Math.hypot(e.clientX-this.gestureStart.x,e.clientY-this.gestureStart.y)>7)this.dragged=true;}
      this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    };
    this.onPointer=e=>{this.pointers.delete(e.pointerId);if(this.dragged)return;const r=canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);for(const hit of this.raycaster.intersectObject(this.world.root,true)){const zone=hitZone(hit);if(zone){this.select(zone);this.onSelect(zone);break;}}};
    this.onCancel=e=>{this.pointers.delete(e.pointerId);};this.onWheel=e=>{e.preventDefault();this.changeZoom(e.deltaY<0?.08:-.08);};
    canvas.addEventListener('pointerdown',this.onDown);canvas.addEventListener('pointermove',this.onMove);canvas.addEventListener('pointerup',this.onPointer);canvas.addEventListener('pointercancel',this.onCancel);canvas.addEventListener('wheel',this.onWheel,{passive:false});
    this.resize=()=>{const r=canvas.getBoundingClientRect(),width=Math.max(240,r.width),height=Math.max(260,r.height),aspect=width/height;this.renderer.setSize(width,height,false);const vertical=11,horizontal=vertical*aspect;this.fitZoom=Math.min(1,horizontal*2/this.worldWidth());this.camera.left=-horizontal;this.camera.right=horizontal;this.camera.top=vertical;this.camera.bottom=-vertical;this.camera.updateProjectionMatrix();};
    this.observer=new ResizeObserver(this.resize);this.observer.observe(canvas);this.resize();
    this.rebuild();this.crowd=new CrowdLayer(this.scene);this.contactShadows=contactLayer(96);this.scene.add(this.contactShadows);this.clockLayer=new globalThis.BloomClocks.ClockLayer(canvas);this.clockVector=new THREE.Vector3();this.frame=this.frame.bind(this);requestAnimationFrame(this.frame);
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.dataset.renderer='recovering';});canvas.addEventListener('webglcontextrestored',()=>{canvas.dataset.renderer='3d';});canvas.dataset.renderer='3d';
  }
  worldWidth(){const f=this.world?.footprint;return f?(f.right-f.left)*.83+(14-f.back)*.57+6:30;}
  rebuild(){const s=this.getState(),previous=this.world?.footprint;if(this.world)disposeGroup(this.world.root);this.world=buildWorld(s);batchStaticWorld(this.world.root);this.scene.add(this.world.root);this.fingerprint=worldStamp(s);this.staff=[];
    this.fitZoom=Math.min(1,(this.camera.right-this.camera.left)/this.worldWidth(),(this.camera.top-this.camera.bottom)/((this.world.footprint.right-this.world.footprint.left)*.4+(14-this.world.footprint.back)*.6+6));if(previous&&previous.area!==this.world.footprint.area)this.focus('all');
    this.steam=[];for(let i=0;i<5;i++){const puff=ball(this.world.root,-4.6,2.7,-2.5,.08,palette.white);puff.castShadow=false;puff.receiveShadow=false;this.steam.push(puff);}
    for(let i=0;i<Math.min(3,s.levels.barista||0);i++){const staff=character(i,true);staff.workRole='cafe';staff.root.position.set(-4.7+i*1.3,0,-4.2);this.world.root.add(staff.root);this.staff.push(staff);}
    if(s.levels.coach){const staff=character(2,true,'pilates');staff.workRole='pilates';staff.root.position.set(5.9,0,-3.7);this.world.root.add(staff.root);this.staff.push(staff);}
    for(let i=0;i<Math.min(2,s.levels.therapist||0);i++){const staff=character(i+1,true);staff.workRole='wellness';staff.root.position.set(8.4+i*2.8,0,1.5);this.world.root.add(staff.root);this.staff.push(staff);}
    if(s.levels.functionalCoach){const coach=character(0,true,'crossfit');coach.workRole='crossfit';coach.root.position.set(-8.1,0,-7.2);this.world.root.add(coach.root);this.staff.push(coach);}
    if(s.levels.padelCoach){const coach=character(1,true,'padel');coach.workRole='padel';coach.root.position.set(15.05,0,-6.8);this.world.root.add(coach.root);this.staff.push(coach);}
    this.students=[];
    for(const r of Layout.ROOMS)if(s.levels[r.id+'Staff']){const worker=character(1,true,['cycling','boxing'].includes(r.id)?'crossfit':'wellness');worker.workRole=r.id;worker.root.position.set(r.x,0,-26);this.world.root.add(worker.root);this.staff.push(worker);}
    this.manual=character(0,true);this.manual.root.position.set(-3,0,-4.2);this.world.root.add(this.manual.root);
    if(this.ring){this.ring.geometry.dispose();this.ring.material.dispose();this.ring.removeFromParent();this.ring=null;}
    if(this.selected)this.select(this.selected);
  }
  select(id){this.selected=id;const activity=Layout.ROOMS.find(r=>id.startsWith(r.id));if(this.ring){this.ring.geometry.dispose();this.ring.material.dispose();this.ring.removeFromParent();}const locations={machine:[-3.1,-2.9,3],pastries:[-1.4,-2.9,1.4],matcha:[-5,-3,1.5],seats:[-3.3,1.5,3],mat:[3.7,-.2,3.8],reformer:[3.7,-.2,3.8],barista:[-3.2,-4.2,2],coach:[5.9,-3.7,1.4],terrace:[0,7.1,2.5],classes:[3.7,2.5,3],spa:[6,-1,1.5],manager:[-3.2,-4.2,2],second:[0,6,2]};const [x,z,r]=activity?[activity.x,activity.z,3.5]:locations[id]||({crossfitWing:[-10.7,-10.4,3],functionalStations:[-10.7,-10.4,2],strengthRig:[-10.7,-14,2],gymAtmosphere:[-10.7,-14,2],functionalCoach:[-8.1,-7.2,1],padelWing:[11.4,-11.4,3],padelCourt:[11.4,-11.4,3],padelKit:[14.7,-7.5,1],courtLights:[14.8,-15.8,1],padelCoach:[15.05,-6.8,1],latteBar:[-5.1,-5,1],cakeDisplay:[-1.7,-5,1],toastKitchen:[-6.65,5.6,1],pilatesBands:[6.55,2.8,1],soundRitual:[-1.1,-7.2,1],aromaMassage:[13.4,3.4,1],tableService:[-6.75,3.85,1],brewBar:[-3.7,-5.02,1.4],bakeryOven:[-.7,-4.95,1],cafeLounge:[-10.7,5.05,2.2],pilatesKit:[6.65,-4.75,1],studioMirror:[3.4,this.world.footprint.zones.studio?-12.2:-5.5,2],studioAudio:[3.4,this.world.footprint.zones.studio?-12.2:-5.5,2],yogaBolsters:[-3.9,-9.4,3],zenGarden:[-6.55,-7.25,1],yogaTea:[-3.65,-11.95,1.3],pressurePump:[13.4,-3.9,1.4],massageStones:[10.6,1.6,2.5],wellnessLinen:[13.5,.1,1.2],cafeWing:[-10.7,0,3],wellnessWing:[10.7,0,3],yogaWing:[-3.9,-9.4,3],pressotherapy:[10.6,-2.7,2.5],pressureCare:[10.6,-2.7,2.5],massage:[10.6,2.6,2.5],massageCare:[10.6,2.6,2.5],recoveryComfort:[10.7,0,3],therapist:[9.8,1.5,2],yoga:[-3.9,-9.4,3],yogaCare:[-3.9,-9.4,3],cafeDecor:[-4,4.5,2],roaster:[-6,-4.9,1.4]}[id])||locations.machine;this.ring=new THREE.Mesh(new THREE.RingGeometry(r-.055,r,64),new THREE.MeshBasicMaterial({color:0xffdf75,side:THREE.DoubleSide,transparent:true,opacity:.9}));this.ring.rotation.x=-Math.PI/2;this.ring.position.set(x,.13,z);this.scene.add(this.ring);}
  focus(zone){const room=Layout.ROOMS.find(r=>r.id===zone);if(room){this.target.set(room.x,.1,room.z);this.zoom=.9;}else if(zone==='cafe'){this.target.set(-3,.1,-.3);this.zoom=.95;}else if(['crossfit','padel'].includes(zone)){const at=zone==='crossfit'?[-10.7,-10.4]:[11.4,-11.4];this.target.set(at[0],.1,at[1]);this.zoom=.8;}else if(['pressotherapy','massage','yoga'].includes(zone)){const spot=Layout.serviceSlots(this.getState(),zone)[0];if(spot){this.target.set(spot.x,.1,spot.z);this.zoom=.85;}}else if(zone==='pilates'){this.target.set(3.7,.1,-.1);this.zoom=1.05;}else{const f=this.world.footprint;this.target.set((f.left+f.right)/2,.1,(f.back+12)/2);this.zoom=this.fitZoom;} }
  changeZoom(delta){this.zoom=THREE.MathUtils.clamp(this.zoom+delta,.22,1.7);}
  updatePeople(s,dt){const targets=new Map();
    const add=(agent,extra)=>targets.set(agent.id,{...agent.position,agent,kind:agent.kind,...extra});
    (s.visits||[]).forEach(a=>add(a,{}));s.queue.forEach(o=>add(o,{order:o}));s.seated.forEach(o=>add(o,{guest:o}));s.treatments.forEach(t=>add(t,{service:t.service,treatment:t}));s.classGuests.forEach(g=>add(g,{pilates:g}));s.departing.forEach(g=>add(g,{}));Object.values(s.sportsGroups||{}).forEach(g=>g?.guests.forEach(a=>add(a,{sport:a.sport,athlete:a})));
    for(const [id,target]of targets)if(!this.people.has(id)){const p=character(target.kind,false,outfitFor(target.agent));p.root.position.set(target.x,0,target.z);p.serving=null;p.boots=[];
      for(const leg of p.legs){const boot=group(leg);boot.name='Bota de presoterapia';for(let j=0;j<4;j++){const cuff=cylinder(boot,0,-.05-j*.09,.01,.115,.075,j%2?0x89cad5:0x355d72,10);cuff.name='Cámara de compresión';}box(boot,0,-.34,.08,.22,.13,.31,0x355d72);batchCharacterPart(boot,'boot');boot.visible=false;p.boots.push(boot);}
      this.people.set(id,p);this.scene.add(p.root);
    }
    for(const [id,p]of this.people){const target=targets.get(id);if(!target){if(p.serving)disposeGroup(p.serving);if(p.taskEffect)disposeGroup(p.taskEffect);disposeGroup(p.root);this.people.delete(id);continue;}const current=p.root.position,agent=target.agent,moving=agent.moving;
      const previous=p.poseReady?snapshot(p):null;p.poseReady=true;p.activity=target;p.body.rotation.x=0;p.root.rotation.x=0;current.y=0;const blend=moving?Math.min(1,dt*18):1;current.x+=(target.x-current.x)*blend;current.z+=(target.z-current.z)*blend;
      p.root.rotation.y=moving?(agent.heading||0):(target.guest?.seat.facing??(Layout.ROOMS.some(r=>r.id===target.service)?0:Math.PI));p.knees.forEach(k=>{k.rotation.x=0;k.scale.y=1;});p.arms.forEach(a=>a.rotation.z=0);
      const gait=this.reduced?0:Math.sin(this.time*11+id)*.5*(moving?1:.08);p.legs[0].rotation.x=gait;p.legs[1].rotation.x=-gait;p.arms[0].rotation.x=-gait*.7;p.arms[1].rotation.x=gait*.7;
      p.body.position.y=.47+(moving&&!this.reduced?Math.abs(Math.sin(this.time*11+id))*.025:0);
      const treating=!moving&&target?.treatment?.stage==='active',pressure=treating&&target.service==='pressotherapy';
      p.boots.forEach(boot=>{boot.visible=pressure;boot.scale.x=1+(this.reduced?0:Math.sin(this.time*2)*.045);});
      if(treating){if(target.service==='yoga'){p.arms[0].rotation.z=-1.25;p.arms[1].rotation.z=1.25;p.legs[0].rotation.x=.25;}else if(['pressotherapy','massage'].includes(target.service)){p.root.rotation.set(-Math.PI/2,0,0);current.y=.73;current.z=target.z+.55;p.legs.forEach(leg=>leg.rotation.x=0);p.arms.forEach(arm=>arm.rotation.x=0);}}
      if(target.pilates?.stage==='exercising'){const spot=Layout.pilates(s)[target.pilates.slot];p.root.rotation.set(-Math.PI/2,0,0);current.y=spot.premium?.66:.17;current.z=target.z+.5;p.legs[0].rotation.x=this.reduced?.3:Math.sin(this.time*1.6+id)*.38;p.legs[1].rotation.x=-p.legs[0].rotation.x;}
      else if(target.pilates?.stage==='ready')current.y=Layout.pilates(s)[target.pilates.slot].premium?.5:0;
      if(target.guest?.stage==='consuming'&&target.guest.seat.table>=0){const sip=this.reduced?0:Math.max(0,Math.sin(this.time*1.1+id)-.3);p.body.rotation.x=.035+sip*.08;p.arms[0].rotation.x=-.65;p.arms[1].rotation.x=-.8-sip*.8;p.arms[1].rotation.z=-.1;current.y=.08;p.legs.forEach(leg=>leg.rotation.x=-Math.PI/2);p.knees.forEach(k=>{k.rotation.x=Math.PI/2;k.scale.y=2.6;});}
      const display=target.guest||(target.order?.stage==='preparing'?target.order:null);
      if(display){if(!p.serving||p.serving.userData.product!==display.product){if(p.serving)disposeGroup(p.serving);p.serving=buildServing(display.product);this.scene.add(p.serving);}
        if(target.guest?.stage==='consuming'){const seat=target.guest.seat,table=seat.table>=0?Layout.tables(s)[seat.table]:null;if(table)p.serving.position.set(table[0]+(seat.x<table[0]?-.34:.34),1.065,table[1]+.22);else p.serving.position.set(-5.6,1.5,-2.5);p.serving.scale.setScalar(1);}
        else if(target.order){p.serving.position.set(-5.05+target.order.queueSlot*.72,1.51,-2.55);p.serving.scale.setScalar(.9);}
        else{p.serving.position.set(current.x+.18,.95,current.z+.18);p.serving.scale.setScalar(.7);p.arms[1].rotation.x=-.85;}
        const steam=p.serving.getObjectByName('Vapor');if(steam){steam.visible=target.guest?.stage==='consuming'||target.order?.stage==='preparing';steam.position.y=.46+(this.reduced?0:Math.sin(this.time*1.4+id)*.045);}
      }else if(p.serving){disposeGroup(p.serving);p.serving=null;}
      if(target.athlete?.stage==='playing'){if(target.sport==='padel'){p.root.rotation.y=target.z<-11.4?0:Math.PI;p.arms[1].rotation.x=this.reduced?-.5:-.5+Math.sin(this.time*2.2+target.athlete.slot)*.85;p.arms[1].rotation.z=-.3;}else{p.body.position.y=.47-(this.reduced?.05:Math.abs(Math.sin(this.time*2.7+id))*.12);p.arms.forEach(a=>a.rotation.x=this.reduced?-.6:-.7+Math.sin(this.time*2.7+id)*.3);p.knees.forEach(k=>k.rotation.x=.25);}}
      const weights=target.athlete?.stage==='playing'&&target.sport==='crossfit';
      const band=target.pilates?.stage==='exercising'&&s.levels.pilatesBands,aroma=treating&&target.service==='massage'&&s.levels.aromaMassage,sound=treating&&target.service==='yoga'&&s.levels.soundRitual;
      const extra=treating&&Layout.ROOMS.some(r=>r.id===target.service)?target.service:null;const effect=weights?'weights':band?'band':aroma?'aroma':sound?'sound':extra;
      if(effect){if(p.effectKind!==effect){if(p.taskEffect)disposeGroup(p.taskEffect);p.taskEffect=new THREE.Group();p.effectKind=effect;p.taskEffect.name='Actividad: '+effect;
        if(['thermal','cold'].includes(effect))for(let j=0;j<3;j++)ball(p.taskEffect,(j-1)*.2,j*.13,0,.055,palette.white);
        if(effect==='nails'){cylinder(p.taskEffect,0,0,0,.035,.16,palette.rose);box(p.taskEffect,0,.12,0,.025,.1,.025,palette.ink);}
        if(effect==='beauty'){cylinder(p.taskEffect,0,0,0,.09,.25,palette.ink).rotation.z=Math.PI/2;box(p.taskEffect,0,-.13,0,.07,.18,.08,palette.rose);}
        if(effect==='cowork')box(p.taskEffect,0,0,0,.45,.025,.2,palette.gold);
        if(effect==='cycling'){box(p.taskEffect,0,0,0,.18,.03,.18,palette.gold);}
        if(effect==='boxing')ball(p.taskEffect,0,0,0,.11,palette.rose);
        if(effect==='weights')for(const x of [-.27,.27]){const grip=cylinder(p.taskEffect,x,0,0,.025,.23,palette.gold);grip.rotation.z=Math.PI/2;for(const side of [-1,1]){const disc=cylinder(p.taskEffect,x+side*.09,0,0,.09,.05,palette.ink);disc.rotation.z=Math.PI/2;}}
        if(effect==='band'){for(const x of [-.26,.26])ball(p.taskEffect,x,.02,0,.06,palette.gold);box(p.taskEffect,0,.02,0,.55,.025,.035,0xba7b9b);}
        if(effect==='aroma')for(let j=0;j<3;j++)ball(p.taskEffect,Math.sin(j*2)*.07,j*.15,0,.085,0xe5dcea,1,1.4,1);
        if(effect==='sound'){cylinder(p.taskEffect,0,.08,0,.14,.14,palette.gold);cylinder(p.taskEffect,0,.155,0,.115,.015,0x6e553a);}
        if(effect==='sound')for(let j=0;j<3;j++){const ring=mesh(p.taskEffect,geometry('soundRing',()=>new THREE.TorusGeometry(1,.025,5,24)),palette.gold,0,j*.1,0,.22+j*.1,.22+j*.1,.22+j*.1);ring.rotation.x=-Math.PI/2;}
        batchCharacterPart(p.taskEffect,'task:'+effect);this.scene.add(p.taskEffect);}
        p.taskEffect.visible=true;p.taskEffect.position.set(target.x+(band||weights?0:.66),weights?.76:band?.83:aroma?1.15:.4,target.z+(band||weights?.1:0));if(weights&&!this.reduced)p.taskEffect.position.y+=(1-Math.cos(this.time*2.2+id*.18))*.12;p.taskEffect.scale.setScalar(this.reduced?1:1+Math.sin(this.time*2+id)*.1);if(aroma)p.taskEffect.position.y+=this.reduced?0:(1+Math.sin(this.time*.9+id))*.15;
        if(extra){p.taskEffect.position.set(target.x+(extra==='beauty'?.35:0),extra==='beauty'?1.02:extra==='thermal'||extra==='cold'?1.1:.96,target.z+(extra==='boxing'?.55:.4));if(!this.reduced)p.taskEffect.position.y+=Math.sin(this.time*2+id)*.035;}
      }else if(p.taskEffect)p.taskEffect.visible=false;
      animatePose(p,target,this.time,dt,this.reduced,previous);
      if(target?.order&&(!p.bubble||p.product!==target.order.product)){if(p.bubble)disposeGroup(p.bubble);p.product=target.order.product;const words={coffee:'☕',breakfast:'🥐',matcha:'🍵',smoothie:'🥤',latte:'🥛',cake:'🍰',toast:'🥑'};p.bubble=group(p.root);label(p.bubble,words[p.product]||'☕',0,1.65,0,.95,'#42604e','#fff9e9');}
      if(p.bubble)p.bubble.visible=!!target?.order&&(s.queue.slice(0,2).some(o=>o.id===id)||target.order.remaining!==null);
      if(!target?.order&&p.bubble){disposeGroup(p.bubble);p.bubble=null;}
    }
  }
  drawClocks(s){const entries=[];
    for(const p of this.people.values()){const t=p.activity,pos=p.root.position;if(!t)continue;
      if(t.order?.remaining!==null&&t.order?.remaining!==undefined)entries.push({x:pos.x,y:1.95,z:pos.z,remaining:t.order.remaining,duration:t.order.duration||window.Bloom.orderDuration(s,t.order.product),kind:'prepare',product:t.order.product});
      else if(t.guest?.stage==='consuming')entries.push({x:pos.x,y:1.8,z:pos.z,remaining:t.guest.remaining,duration:t.guest.duration,kind:'consume',product:t.guest.product});
      else if(t.treatment?.stage==='active')entries.push({x:pos.x,y:pos.y+(['pressotherapy','massage'].includes(t.service)?1:1.95),z:pos.z-(t.service==='yoga'?0:.5),remaining:t.treatment.remaining,duration:t.treatment.duration||window.Bloom.serviceConfig(s,t.service).duration,kind:t.service});
      else if(t.athlete?.stage==='playing'){const g=s.sportsGroups[t.sport];entries.push({x:pos.x,y:1.95,z:pos.z,remaining:g.remaining,duration:g.duration,kind:t.sport});}
      else if(t.pilates?.stage==='exercising')entries.push({x:pos.x,y:pos.y+1,z:pos.z-.4,remaining:s.classRemaining,duration:s.classDuration,kind:'pilates'});
    }
    this.clockLayer.draw(entries,entry=>this.clockVector.set(entry.x,entry.y,entry.z).project(this.camera),this.camera.zoom);
  }
  frame(now){if(this.stopped)return;requestAnimationFrame(this.frame);if(document.hidden||!this.canvas.closest('.view.active')||this.canvas.dataset.renderer==='recovering'){this.last=now;this.statsAt=now;this.statsFrames=0;return;}if(now-this.last<(this.reduced?180:33))return;const dt=Math.min(1,(now-this.last)/1000||.033);this.last=now;this.time+=dt;const s=this.getState();if(worldStamp(s)!==this.fingerprint)this.rebuild();
    this.updatePeople(s,dt);if(this.contactShadows){const spots=[...this.people.values()].filter(p=>p.root.visible).map(p=>({x:p.root.position.x,z:p.root.position.z,y:p.root.position.z>6.3?-.025:.14,w:.85,d:.65}));setContacts(this.contactShadows,spots);}const tennisBall=this.world?.root.getObjectByName('Pelota de pádel');if(tennisBall){const playing=s.sportsGroups?.padel?.phase==='active';tennisBall.visible=playing;if(playing){const ball=rally(this.time,this.reduced);tennisBall.position.set(ball.x,ball.y,ball.z);}}const brewing=s.queue.some(o=>o.remaining>0);this.manual.root.visible=!(s.levels.barista)&&brewing;this.steam.forEach((p,i)=>{p.visible=brewing;const phase=this.reduced?.5:(this.time*.6+i*.2)%1;p.position.y=2.45+phase*.8;p.position.x=-4.6+(this.reduced?0:Math.sin(this.time*2+i)*.08);p.scale.setScalar(.04+phase*.09);});this.staff.forEach((p,i)=>{const role=p.workRole||'cafe',active=role==='cafe'?brewing:role==='pilates'?s.classPhase==='active':role==='wellness'?s.treatments.some(t=>t.stage==='active'):(s.sportsGroups?.[role]?.phase==='active'||s.treatments.some(t=>t.service===role&&t.stage==='active'));if(Layout.ROOMS.some(r=>r.id===role)){const room=Layout.ROOMS.find(r=>r.id===role),client=s.treatments.find(t=>t.service===role&&t.stage==='active'),x=client?client.position.x+.85:room.x,z=client?client.position.z+.55:-26,blend=this.reduced?1:1-Math.exp(-dt*3);p.root.position.x+=(x-p.root.position.x)*blend;p.root.position.z+=(z-p.root.position.z)*blend;p.root.rotation.y=client?-Math.PI/2:0;}animateStaff(p,role,active,this.time+i*.4,this.reduced);});animateStaff(this.manual,'cafe',brewing,this.time,this.reduced);
    this.crowd?.update([...this.people.values(),...this.staff,this.manual]);const a=this.reduced?1:Math.min(1,dt*5);this.look.lerp(this.target,a);this.camera.position.set(this.look.x+18,this.look.y+22,this.look.z+26);this.camera.lookAt(this.look);this.camera.zoom+=(this.zoom-this.camera.zoom)*a;this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);this.drawClocks?.(s);
    this.statsFrames=(this.statsFrames||0)+1;if(this.renderer.info&&now-(this.statsAt||0)>=1000){this.canvas.dataset.fps=String(Math.round(this.statsFrames*1000/(now-(this.statsAt||0))));this.canvas.dataset.drawCalls=String(this.renderer.info.render.calls);this.canvas.dataset.triangles=String(this.renderer.info.render.triangles);this.statsFrames=0;this.statsAt=now;}
  }
  destroy(){this.stopped=true;this.clockLayer?.destroy();this.observer.disconnect();for(const [type,handler]of [['pointerdown',this.onDown],['pointermove',this.onMove],['pointerup',this.onPointer],['pointercancel',this.onCancel],['wheel',this.onWheel]])this.canvas.removeEventListener(type,handler);if(this.world)disposeGroup(this.world.root);for(const p of this.people.values()){disposeGroup(p.root);if(p.serving)disposeGroup(p.serving);if(p.taskEffect)disposeGroup(p.taskEffect);}this.crowd?.dispose();this.contactShadows?.dispose();this.renderer.dispose();}
}
