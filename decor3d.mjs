import * as THREE from './vendor/three.module.min.mjs';
import './layout.js';

// Original procedural furnishings, grouped by room and purchase for static batching.
export function dressWorld(root,state,kit){
  const {box,cylinder,ball,group,plant,cup,mesh,geometry,palette:P}=kit;
  const L=globalThis.BloomLayout,zones=L.zones(state),levels=state.levels||{};
  const level=id=>Math.min(3,levels[id]||0),features=[];
  function feature(id,x,z){const g=group(root,x,0,z,id);g.name='upgrade:'+id;features.push(id);return g;}
  function sconce(parent,x,z){const g=group(parent,x,0,z);box(g,0,1.8,0,.15,.5,.12,P.gold);ball(g,0,2,.13,.17,0xffe9ae,1,1.3,.7);}
  function picture(parent,x,z,color=P.sage){const g=group(parent,x,0,z);box(g,0,1.65,0,.82,1,.09,P.oak);box(g,0,1.65,.055,.7,.88,.025,P.cream);cylinder(g,0,1.4,.08,.07,.23,P.rose);for(const side of [-1,1]){const leaf=ball(g,side*.12,1.72,.09,.2,color,.55,1,.1);leaf.rotation.z=side*-.5;}return g;}
  function towel(parent,x,y,z,color=P.white){box(parent,x,y,z,.38,.09,.27,color);box(parent,x,y+.055,z-.02,.32,.025,.22,color);}
  function bottle(parent,x,y,z,color){cylinder(parent,x,y+.12,z,.065,.24,color);cylinder(parent,x,y+.27,z,.035,.06,P.gold);}
  function shelf(parent,x,z,width=1.5){const g=group(parent,x,0,z);for(const y of [.35,1.05,1.75])box(g,0,y,0,width,.08,.43,P.oak);for(const a of [-1,1])box(g,a*(width/2-.05),.9,-.13,.07,1.9,.08,P.dark);return g;}
  function roomTrim(left,right,back,front){
    const w=right-left,mid=(left+right)/2;
    box(root,mid,.18,back+.13,w-.2,.22,.07,P.wood);box(root,mid,2.42,back+.12,w-.1,.11,.11,P.oak);
    for(let x=left+.5;x<right-.2;x+=1.1){box(root,x,.6,back+.12,.045,.7,.035,P.oak);}
    for(const x of [left+.7,right-.7])sconce(root,x,back+.2);
    // Warm plank floor, with staggered seams rather than a flat rectangle.
    for(let x=left+.28,i=0;x<right-.1;x+=.55,i++)for(let start=back+.1;start<front-.1;start+=2.05){const length=Math.min(1.98,front-start-.12);if(length>.1)box(root,x,.092,start+length/2,.52,.018,length,i%3===0?0xe4c298:i%3===1?0xefcfaa:0xe8cba5);}
  }
  // Café: ceramic backsplash, chalk menu, mug rail and counter accessories.
  const cafe=group(root,0,0,0,'cafeDecor');cafe.name='detail:cafe';features.push('detail:cafe');
  for(let i=0;i<12;i++)for(let j=0;j<2;j++)box(cafe,-5.8+i*.39,1+j*.28,-5.57,.37,.26,.035,(i+j)%3?0xe2ddd0:0x8cab95);
  box(cafe,-2.5,1.65,-5.44,1.45,1.14,.1,P.wood);box(cafe,-2.5,1.65,-5.37,1.3,1,.03,P.dark);
  for(let i=0;i<4;i++){box(cafe,-2.64,1.96-i*.19,-5.34,.77-i*.06,.025,.01,0xe8e3c5);box(cafe,-2,1.96-i*.19,-5.34,.12,.025,.01,P.gold);}
  for(let i=0;i<4;i++){cup(cafe,-5.6+i*.27,1.51,-3.15);bottle(cafe,-3.15+i*.15,1.5,-3.12,[P.rose,P.sage,P.gold,P.cream][i]);}
  box(cafe,-.55,.5,-4.75,.56,1,.54,P.oak);for(let j=0;j<3;j++)towel(cafe,-.55,1.05+j*.09,-4.75);
  // Empty settings stay empty: dishes belong to real orders in the live renderer.
  for(const [x,z]of L.tables(state)){cylinder(cafe,x,1.058,z,.58,.012,0xe6cda8,24);for(const side of [-1,1]){box(cafe,x+side*.34,1.072,z+.15,.34,.012,.43,0xf8ebd5);box(cafe,x+side*.5,1.086,z+.14,.025,.018,.26,P.gold);box(cafe,x+side*.53,1.086,z+.14,.025,.018,.26,P.gold);box(cafe,x+side*1.01,.605,z+.08,.42,.05,.44,side<0?0xd8aa8f:0xbad6b9);}}
  picture(cafe,-6.2,-5.4);sconce(cafe,-.2,-5.45);
  if(zones.cafe){roomTrim(-14,-7.5,-6.1,6);picture(root,-10.7,-5.9,P.rose);const side=shelf(root,-12.6,-5.55,1.8);for(let i=0;i<4;i++)bottle(side,-.55+i*.33,1.8,0,[P.rose,P.sage,P.cream,P.gold][i]);}

  if(level('brewBar')){const g=feature('brewBar',-3.7,-5.02);box(g,0,.53,0,1.9,1.05,.5,P.oak);box(g,0,1.09,0,2,.09,.6,P.cream);
    for(let i=0;i<level('brewBar');i++){const x=-.6+i*.6;box(g,x,1.5,0,.04,.75,.04,P.gold);box(g,x,1.86,.13,.45,.04,.3,P.gold);mesh(g,geometry('dripper',()=>new THREE.ConeGeometry(.16,.24,12)),P.white,x,1.62,.15);cup(g,x,1.14,.15);}
  }
  if(level('bakeryOven')){const g=feature('bakeryOven',-.7,-4.95);box(g,0,.62,0,1.1,1.24,.75,P.dark);box(g,0,1.28,0,1.15,.08,.82,P.oak);
    for(let i=0;i<level('bakeryOven');i++){box(g,0,.28+i*.32,.4,.9,.26,.04,0x6d8c91);box(g,0,.37+i*.32,.45,.55,.035,.06,P.gold);for(let j=0;j<3;j++)ball(g,-.27+j*.27,.25+i*.32,.44,.09,0xe5af64,1,.5,.8);}
    bottle(g,-.34,1.34,0,P.cream);
  }
  if(level('cafeLounge')){const g=feature('cafeLounge',-10.7,5.05),n=level('cafeLounge');box(g,0,.28,0,2.8,.12,1.25,0xdfc6a2);box(g,0,.55,0,2.6,.45,.95,P.rose);box(g,0,.96,-.42,2.6,.7,.18,0xd78f85);for(const x of [-1.25,1.25])box(g,x,.78,0,.2,.5,1.1,0xd78f85);
    for(let i=0;i<n;i++){box(g,-.8+i*.8,.88,-.15,.48,.22,.45,[P.mint,P.gold,P.cream][i]);const book=box(g,-1.1+i*.55,.24,.9,.3,.06,.42,[P.sage,P.rose,P.dark][i]);book.rotation.y=.2*i;}const shelfUnit=shelf(g,2,-.2,.65);for(let i=0;i<n*2;i++)box(shelfUnit,-.2+i%3*.17,.6+Math.floor(i/3)*.7,0,.1,.42,.28,[P.rose,P.gold,P.sage][i%3]);
  }
  if(level('tableService')){const g=feature('tableService',-6.75,3.85),n=level('tableService');box(g,0,.45,0,.58,.8,.7,P.oak);box(g,0,.91,0,.65,.08,.76,P.cream);
    for(const x of [-.22,.22])for(const z of [-.25,.25])cylinder(g,x,.12,z,.06,.12,P.dark,8);
    for(let i=0;i<n;i++){const z=-.22+i*.22;for(let j=0;j<3;j++)cylinder(g,0,.98+j*.035,z,.16,.025,P.white);box(g,.19,1.01,z,.09,.16,.13,[P.sage,P.rose,P.gold][i]);}
    if(n>1)towel(g,0,.55,0,P.mint);if(n>2)bottle(g,0,1.08,-.23,P.sage);
  }
  if(level('latteBar')){const g=feature('latteBar',-5.1,-5);box(g,0,.55,0,.78,1.1,.65,P.oak);box(g,0,1.15,0,.84,.08,.72,P.cream);for(let i=0;i<level('latteBar');i++){const x=-.25+i*.24;cylinder(g,x,1.3,0,.09,.25,P.white);box(g,x,1.47,0,.12,.04,.14,P.sage);cup(g,x,1.2,.2);}box(g,-.22,1.46,-.2,.045,.55,.04,P.gold);}
  if(level('cakeDisplay')){const g=feature('cakeDisplay',-1.7,-5);box(g,0,.55,0,.85,1.1,.68,P.sage);box(g,0,1.12,0,.94,.08,.76,P.cream);for(let j=0;j<level('cakeDisplay');j++){cylinder(g,0,1.22+j*.27,0,.26,.04,P.gold,16);cylinder(g,0,1.32+j*.27,0,.22,.15,[0xce9c86,0xe6b8c3,0xad926b][j],16);for(let i=0;i<5;i++)ball(g,Math.sin(i*1.26)*.15,1.42+j*.27,Math.cos(i*1.26)*.15,.04,0xc85068);}box(g,0,2.06,0,1,.06,.8,P.dark);for(const x of [-.44,.44])box(g,x,1.6,0,.035,.9,.7,P.gold);}
  if(level('toastKitchen')){const g=feature('toastKitchen',-6.65,5.6);box(g,0,.5,0,.6,1,.65,P.oak);box(g,0,1.05,0,.68,.08,.73,P.cream);box(g,0,1.25,0,.48,.32,.4,P.dark);for(let i=0;i<level('toastKitchen');i++){box(g,-.16+i*.16,1.43,0,.09,.16,.3,0xdbad6c);ball(g,-.18+i*.16,1.16,.25,.08,P.sage,.7,.6,1);}box(g,0,.8,.34,.4,.04,.04,P.gold);}
  // Pilates: wall mirror, towel station, articulated reformer details and equipment.
  if(levels.mat){const g=group(root,0,0,0,'mat');g.name='detail:pilates';features.push('detail:pilates');
    const rear=zones.studio?-12.38:-5.6;
    box(g,4.45,1.52,rear,2.4,1.3,.09,P.oak);box(g,4.45,1.52,rear+.06,2.25,1.15,.025,0xa9c8c9);
    const reflection=box(g,4.2,1.52,rear+.08,.06,1.02,.012,0xe6f1e6);reflection.rotation.z=-.35;
    const towels=shelf(g,6.8,4.6,.7);for(let i=0;i<3;i++)towel(towels,0,.45+i*.16,0,i%2?P.rose:P.white);
    for(const spot of L.pilates(state)){if(spot.premium){for(const side of [-1,1])box(g,spot.x+side*.32,.43,spot.z,.035,.035,1.7,0x536e67);for(let i=0;i<4;i++)cylinder(g,spot.x-.2+i*.13,.48,spot.z-.74,.022,.15,P.gold,6);}else{box(g,spot.x,.115,spot.z-.69,.75,.012,.025,0xdfb8c3);box(g,spot.x,.115,spot.z+.69,.75,.012,.025,0xdfb8c3);}}
  }
  if(level('pilatesKit')){const g=feature('pilatesKit',6.65,-4.75);box(g,0,.35,0,.8,.08,.7,P.dark);box(g,0,.85,0,.8,.08,.7,P.oak);
    for(let i=0;i<level('pilatesKit');i++){ball(g,-.22+i*.22,.55,0,.16,[P.rose,P.sage,P.gold][i]);const ring=mesh(g,geometry('fitnessRing',()=>new THREE.TorusGeometry(.22,.04,6,18)),P.sage,-.2+i*.2,1.15,-.1);ring.rotation.y=.3;for(const x of [-.15,.15])cylinder(g,x,1.02,.22,.06,.1,P.dark);}
  }
  if(level('studioMirror')){const g=feature('studioMirror',0,zones.studio?-12.33:-5.55);for(let i=0;i<level('studioMirror');i++){const x=1.4+i*1.9;box(g,x,1.4,0,1.65,1.7,.08,P.oak);box(g,x,1.4,.05,1.5,1.55,.02,0xb7d5d3);box(g,x,1.02,.32,1.65,.05,.06,P.oak);for(const dx of [-.65,.65])box(g,x+dx,1.02,.2,.035,.05,.3,P.gold);}}
  if(level('studioAudio')){const g=feature('studioAudio',0,zones.studio?-12.1:-5.3);for(let i=0;i<level('studioAudio');i++){const x=1+i*2.35;box(g,x,.5,0,.4,1,.4,P.dark);for(const y of [.28,.65]){const speaker=cylinder(g,x,y,.22,.13,.035,0x7e9a8e);speaker.rotation.x=Math.PI/2;}box(g,x,2.29,-.16,1.65,.055,.06,0xe5c885);}}
  if(level('pilatesBands')){const g=feature('pilatesBands',6.65,2.8);box(g,0,.45,0,.5,.9,.45,P.oak);for(let i=0;i<level('pilatesBands')*2;i++){const band=mesh(g,geometry('bandRack',()=>new THREE.TorusGeometry(.14,.035,6,16)),i%2?P.rose:P.sage,-.1+(i%2)*.2,1+Math.floor(i/2)*.3,0);band.rotation.y=.35;}}
  // Yoga: woven carpet, wall art, candle niche and purchased rituals.
  if(zones.yoga){const g=group(root,0,0,0,'yogaCare');g.name='detail:yoga';features.push('detail:yoga');roomTrim(-7.3,-.5,-12.5,-6.3);
    picture(g,-4,-12.3,0xb6a175);for(let i=0;i<3;i++){cylinder(g,-6.65+i*.22,.5,-11.9,.07,.3+i*.1,P.cream);ball(g,-6.65+i*.22,.7+i*.1,-11.9,.025,P.gold);}
    for(const spot of L.serviceSlots(state,'yoga')){box(g,spot.x,.105,spot.z,.94,.025,1.96,0xc09885);box(g,spot.x,.13,spot.z-.73,.65,.012,.025,P.cream);}
  }
  if(level('yogaBolsters')){const g=feature('yogaBolsters',0,0);for(const spot of L.serviceSlots(state,'yoga'))for(let i=0;i<level('yogaBolsters');i++){const bolster=cylinder(g,spot.x+.65,.23,spot.z-.5+i*.48,.15,.42,[P.rose,P.mint,P.gold][i]);bolster.rotation.z=Math.PI/2;box(g,spot.x+.65,.1,spot.z-.5+i*.48,.45,.08,.36,0xe5d1bc);}}
  if(level('zenGarden')){const g=feature('zenGarden',-6.55,-7.25);box(g,0,.3,0,.9,.6,1.4,P.wood);box(g,0,.64,0,.8,.08,1.3,0xece0bf);for(let i=0;i<level('zenGarden');i++){ball(g,-.15+i*.15,.77,-.4+i*.4,.13,0x879184,1,.6,.75);cylinder(g,.15,1.15+i*.15,-.45+i*.4,.035,1,P.sage,6);}if(level('zenGarden')>1)plant(g,0,.35,.5);}
  if(level('yogaTea')){const g=feature('yogaTea',-3.65,-11.95);box(g,0,.48,0,1.5,.95,.55,P.oak);box(g,0,1,0,1.6,.08,.65,P.cream);ball(g,-.4,1.2,0,.21,P.sage,1,.9,1);cylinder(g,-.4,1.41,0,.1,.04,P.gold);for(let i=0;i<level('yogaTea')*2;i++)cup(g,.02+i*.25,1.05,.05);}
  if(level('soundRitual')){const g=feature('soundRitual',-1.1,-7.2);box(g,0,.18,0,.65,.28,.6,P.oak);for(let i=0;i<level('soundRitual');i++){const x=-.17+i*.34;cylinder(g,x,.4,0,.14,.15,P.gold);cylinder(g,x,.48,0,.11,.015,0x6e553a);box(g,x,.48,.23,.2,.025,.035,P.wood);}}
  // Recovery: privacy screen, stonewash rugs, towels, controls and tubing.
  if(zones.wellness){const g=group(root,0,0,0,'recoveryComfort');g.name='detail:wellness';features.push('detail:wellness');roomTrim(7.5,14,-6.1,6);picture(g,10.7,-5.9,P.sage);
    for(const id of ['pressotherapy','massage'])for(const spot of L.serviceSlots(state,id)){box(g,spot.x,.105,spot.z,1.9,.025,2.85,id==='massage'?0xc9b9ad:0xafc7bc);towel(g,spot.x+.4,.79,spot.z-.85);const side=shelf(g,spot.x+.8,spot.z+.65,.42);bottle(side,0,1.8,0,P.cream);
      if(id==='pressotherapy'){const hose=geometry('compressionHose',()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.8,.9,-.3),new THREE.Vector3(.65,.4,.2),new THREE.Vector3(.42,.55,.8),new THREE.Vector3(.18,.7,.8)]),12,.025,5,false));mesh(g,hose,P.dark,spot.x,0,spot.z);box(g,spot.x+.82,.95,spot.z-.25,.19,.015,.22,0x78c8c4);}
      else{for(let i=0;i<3;i++)bottle(g,spot.x+.78,.9,spot.z-.2+i*.22,[P.gold,P.sage,P.rose][i]);}
    }
    for(let i=0;i<7;i++)box(g,10.7,.5,1.5+i*.3,.06,.9,.08,P.oak);
  }
  if(level('pressurePump')){const g=feature('pressurePump',13.4,-4.6);for(let i=0;i<level('pressurePump');i++){box(g,0,.42,i*.72,.65,.84,.6,P.dark);cylinder(g,0,.94,i*.72,.21,.22,0x9cb8b0);box(g,0,.63,i*.72+.31,.38,.2,.025,P.sky);ball(g,.22,.25,i*.72+.31,.05,P.gold);}}
  if(level('massageStones')){const g=feature('massageStones',0,0);for(const spot of L.serviceSlots(state,'massage')){box(g,spot.x+.74,.62,spot.z-1,.48,1.2,.6,P.oak);box(g,spot.x+.74,1.25,spot.z-1,.5,.12,.64,P.dark);for(let i=0;i<level('massageStones')*2;i++)ball(g,spot.x+.62+i%2*.22,1.36,spot.z-1.2+Math.floor(i/2)*.2,.07,0x646c69,1,.5,.7);}}
  if(level('wellnessLinen')){const g=feature('wellnessLinen',13.5,.1),s=shelf(g,0,0,.7);for(let i=0;i<level('wellnessLinen')*3;i++)towel(s,0,.45+Math.floor(i/3)*.7+(i%3)*.1,0,i%2?P.mint:P.white);for(const spot of L.serviceSlots(state,'massage'))box(g,spot.x,.72,spot.z+.65,.92,.07,.52,[P.cream,P.mint,P.rose][level('wellnessLinen')-1]);}
  if(level('aromaMassage')){const g=feature('aromaMassage',13.3,3.4);box(g,0,.45,0,.6,.9,.7,P.oak);for(let i=0;i<level('aromaMassage');i++){const z=-.17+i*.34;ball(g,0,1.02,z,.14,P.cream,1,.8,1);cylinder(g,0,1.14,z,.045,.06,P.gold);bottle(g,.19,.93,z,P.rose);}for(const spot of L.serviceSlots(state,'massage')){ball(g,spot.x+.66,.97,spot.z,.12,P.cream);cylinder(g,spot.x+.66,1.1,spot.z,.025,.035,P.gold);}}
  // Street furniture ties the miniature to its surroundings.
  const chapters=Math.min(6,state.chapters?.length||0);
  if(chapters){const awards=group(root,-2.25,0,-5.35);awards.name='Colección de capítulos';box(awards,0,2.3,0,2.2,.1,.4,P.oak);for(let i=0;i<chapters;i++){const x=-.88+i*.35;cylinder(awards,x,2.41,0,.11,.15,P.gold);ball(awards,x,2.57,0,.13,i===5?0xe4bd59:[P.sage,P.rose,P.gold][i%3],1,.85,1);box(awards,x,2.68,0,.025,.1,.025,P.gold);}}
  if(state.campaign&&state.campaign.remaining>0){const event=group(root,0,0,5.95);event.name='Campaña del centro';const id=state.campaign.id,color=id==='coffee'?P.gold:id==='brunch'?P.rose:P.sage;box(event,0,2.7,0,3.6,.035,.035,P.oak);for(let i=0;i<7;i++){const flag=mesh(event,geometry('eventFlag',()=>new THREE.ConeGeometry(.14,.26,3)),i%2?color:P.cream,-1.5+i*.5,2.57,0);flag.rotation.z=Math.PI;}kit.label(event,id==='coffee'?'CLUB DEL CAFÉ':id==='brunch'?'BRUNCH EN BLOOM':'TARDE WELLNESS',0,2.98,0,3.8,'#35624b','#fff3ce');}
  // Street furniture ties the miniature to its surroundings.
  const street=group(root,0,0,0);street.name='detail:street';features.push('detail:street');
  for(const x of [-6.8,6.8]){box(street,x,.4,8,.9,.8,.5,P.wood);for(let i=0;i<3;i++){ball(street,x-.28+i*.28,.92,8,.15,0x6fa36b);ball(street,x-.28+i*.28,1.05,8,.07,[P.rose,P.gold,P.white][i]);}}
  box(street,-12.5,.5,8.2,2,.14,.5,P.oak);box(street,-12.5,.95,8,2,.6,.1,P.oak);for(const x of [-13.25,-11.75])box(street,x,.24,8.2,.08,.5,.48,P.dark);
  return features;
}
