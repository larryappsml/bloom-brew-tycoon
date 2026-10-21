import './activities.js';
import {buildLeisure} from './leisure3d.mjs';
import './layout.js';
// Each activity has its own architectural palette and equipment silhouettes.
export const ROOM_THEMES={pool:{floor:0xb1deea,wall:0xfffdf2,accent:0xf4c45f,seat:0x6fbc99,name:'Piscina · agua y luz'},golf:{floor:0x86bd7d,wall:0x638653,accent:0xf4c45f,seat:0x24564d,name:'Golf · paisaje y jardines'},dance:{floor:0xe9b77a,wall:0xe9a998,accent:0xf4c45f,seat:0x344b55,name:'Baile · parquet y espejos'},
 cycling:{floor:0x344b55,wall:0x24564d,accent:0xf4c45f,seat:0x344b55,name:'Club de cycling · caucho y luz ámbar'},
 nails:{floor:0xf5dfd9,wall:0xe9a998,accent:0xf4c45f,seat:0xd39aaa,name:'Nail bar · terrazo rosa y latón'},
 beauty:{floor:0xe9b77a,wall:0xf2d7ba,accent:0x24564d,seat:0x344b55,name:'Beauty bar · roble y espejos'},
 thermal:{floor:0xb7c4ad,wall:0xba8054,accent:0xe9b77a,seat:0x6fbc99,name:'Spa termal · piedra y cedro'},
 boxing:{floor:0x344b55,wall:0xba8054,accent:0xe9a998,seat:0x24564d,name:'Boxeo · ladrillo y cuero'},
 cold:{floor:0xdcebed,wall:0xb1deea,accent:0x344b55,seat:0xb7dec4,name:'Recuperación · hielo y luz azul'},
 cowork:{floor:0xe9b77a,wall:0xb7dec4,accent:0x24564d,seat:0x6fbc99,name:'Cowork · biblioteca botánica'}
};
export function buildActivities(root,s,kit){
 const {group,box,cylinder,ball,plant,palette:P}=kit,L=globalThis.BloomLayout;
 for(const room of L.ROOMS){
  const id=room.id,n=s.levels[id]||0,q=s.levels[id+'Quality']||0,d=s.levels[id+'Decor']||0,T=ROOM_THEMES[id];
  if(!s.levels[id+'Wing']||['pool','golf'].includes(id))continue;
  const g=group(root,room.x,0,room.z,id+'Wing');g.name=room.name;g.userData.theme=T.name;
  box(g,0,-.18,0,8,.45,9,P.oak);box(g,0,.07,0,7.9,.08,8.9,T.floor);
  box(g,0,1.15,-4.5,8,2.3,.15,T.wall);box(g,-4,.55,0,.13,1.1,9,T.wall);
  // Cut-away front walls frame a generous doorway without hiding the activity.
  for(const side of [-1,1]){box(g,side*2.7,.35,4.45,2.6,.7,.12,T.wall);box(g,side*1.3,1.05,4.45,.09,2.1,.12,T.accent);}
  for(let i=0;i<7;i++){
   if(['beauty','cowork','thermal'].includes(id))box(g,-3.4+i*1.12,.12,0,1.08,.025,8.6,i%2?T.floor:P.oak);
   else if(['nails','cold'].includes(id))for(let j=0;j<5;j++)box(g,-3.35+i*1.1,.12,-3.6+j*1.7,1.05,.025,1.64,(i+j)%2?T.floor:P.cream);
  }
  if(id==='cycling'){
   for(const x of [-2.65,0,2.65]){box(g,x,1.35,-4.38,1.8,1.3,.04,P.ink);box(g,x,2.08,-4.3,1.9,.04,.06,P.gold);}
   box(g,0,1.45,-4.28,2.1,1.05,.06,P.sky);for(const x of [-3.2,3.2]){box(g,x,.75,-3.8,.45,1.5,.4,P.ink);for(const y of [.35,1.05])ball(g,x,y,-3.56,.14,P.gold,1,1,.2);}
   for(const x of [-2.8,2.8])box(g,x,.135,0,.04,.02,7.8,P.gold);
  }else if(id==='dance'){for(const x of [-2.6,0,2.6]){box(g,x,1.35,-4.35,2.3,1.8,.08,P.gold);box(g,x,1.35,-4.28,2.15,1.65,.025,P.sky);box(g,x,2.28,-4.23,2.2,.04,.08,P.cream);for(const side of [-1,1])box(g,x+side*.9,.85,-4.05,.045,.4,.18,P.gold);}box(g,0,.85,-4.05,7.5,.06,.06,P.oak);for(const x of [-3.3,3.3]){box(g,x,.7,-3.65,.4,1.4,.4,P.ink);for(const y of [.35,.75,1.1])ball(g,x,y,-3.42,.13,P.gold,1,1,.2);}
   const craft=group(g,0,0,0,'danceDecor');craft.name='Baile · parquet, vestuario y escenario';
   for(let i=0;i<12;i++)for(let j=0;j<8;j++){const plank=box(craft,-3.65+i*.65,.145,-3.5+j*.95,.61,.015,.9,(i+j)%2?P.oak:P.cream);if(j%2)plank.rotation.y=.025;}
   box(craft,-3.5,1,1.1,.6,1.8,2,P.rose);for(let i=0;i<3;i++){box(craft,-3.16,1,.5+i*.6,.025,1.6,.02,P.gold);box(craft,-3.13,1.1,.7+i*.6,.035,.12,.12,P.gold);}
   box(craft,3.45,.42,2.5,.5,.18,2,P.oak);for(let j=0;j<4;j++)box(craft,3.45,.56,1.8+j*.45,.35,.08,.3,P.white);
   box(craft,0,.22,-3.1,2.2,.16,1.1,P.sage);for(const side of [-1,1]){cylinder(craft,side*2.8,2.65,0,.13,.25,P.gold,12);box(craft,side*2.8,2.4,0,.25,.05,.35,P.cream);}
   for(const x of [-3.6,3.6]){box(craft,x,2.1,-2.8,.3,.8,.15,P.rose);plant(craft,x,3.6,.6);}
  }else if(id==='nails'){
   for(const x of [-2.6,0,2.6]){box(g,x,1.3,-4.35,1.8,1.5,.06,P.cream);ball(g,x,2.02,-4.3,.9,P.cream,1,.65,.08);for(let j=0;j<5;j++)cylinder(g,x-.5+j*.25,1.1,-4.2,.045,.14,[P.rose,P.sage,P.gold][j%3]);}
  }else if(id==='beauty'){
   for(const x of [-3,-1,1,3]){box(g,x,1.45,-4.35,1.4,1.6,.06,P.gold);box(g,x,1.45,-4.3,1.25,1.45,.02,P.sky);box(g,x,2.3,-4.22,1.3,.04,.08,P.cream);}
  }else if(id==='thermal'){
   for(let j=0;j<27;j++)box(g,-3.8+j*.29,1.2,-4.35,.08,2.2,.08,P.oak);
   box(g,-2.8,.35,-3.5,1.7,.45,.6,P.wood);box(g,2.8,.35,-3.5,1.7,.45,.6,P.wood);plant(g,3.3,-3.3,.85);
  }else if(id==='boxing'){
   for(let row=0;row<5;row++)for(let col=0;col<10;col++)box(g,-3.65+col*.79+(row%2)*.2,.28+row*.41,-4.38,.73,.34,.035,row%2?P.wood:P.oak);
   for(const x of [-2.5,2.5]){box(g,x,1.25,-4.24,1.5,1.2,.04,P.ink);box(g,x,1.25,-4.2,.85,.08,.025,P.rose);}
  }else if(id==='cold'){
   for(const x of [-2.6,0,2.6]){box(g,x,1.4,-4.34,1.7,1.45,.08,P.white);box(g,x,1.4,-4.28,1.5,1.2,.03,P.sky);for(let j=0;j<3;j++)box(g,x-.42+j*.42,1.5,-4.23,.045,.55,.02,P.white);}
  }else{
   for(const x of [-2.8,2.8]){box(g,x,1.15,-4.2,1.7,2.2,.35,P.wood);for(let j=0;j<3;j++){box(g,x,.45+j*.65,-3.98,1.7,.07,.45,P.oak);for(let k=0;k<7;k++)box(g,x-.68+k*.22,.7+j*.65,-3.97,.13,.4,.2,[P.sage,P.rose,P.gold,P.cream][k%4]);}}
   plant(g,0,-3.7,.9);
  }
  if(!n){const plot=group(g,0,0,0,id);box(plot,0,.15,0,2,.1,2,T.accent);box(plot,0,.23,0,.8,.05,.12,P.cream);box(plot,0,.23,0,.12,.05,.8,P.cream);}
  for(const spot of L.serviceSlots(s,id)){
   const a=group(g,spot.x-room.x,0,spot.z-room.z,id);a.name=room.name+' · puesto '+(spot.index+1);
   if(id==='cycling'){
    box(a,0,.15,0,1.4,.05,1.8,P.ink);
    for(const z of [-.45,.45]){const wheel=cylinder(a,0,.38,z,.31,.13,P.ink,16);wheel.rotation.z=Math.PI/2;const hub=cylinder(a,.085,.38,z,.18,.025,P.gold,12);hub.rotation.z=Math.PI/2;}
    for(const x of [-.24,.24]){box(a,x,.2,-.4,.5,.08,.08,P.dark);box(a,x,.2,.45,.5,.08,.08,P.dark);}
    const frame=box(a,0,.6,0,.1,.08,.95,T.accent);frame.rotation.x=.38;box(a,0,.75,-.18,.08,.55,.08,P.dark);box(a,0,1,-.18,.38,.11,.3,P.ink);box(a,0,.88,.48,.08,.65,.08,P.dark);box(a,0,1.18,.48,.6,.07,.08,P.ink);
    box(a,0,1.12,.58,.22,.16,.04,P.sky);cylinder(a,.13,.68,.05,.045,.18,P.white);
   }else if(id==='boxing'){
    box(a,0,.13,0,1.65,.07,1.9,P.dark);for(const side of [-1,1])box(a,side*.65,.18,0,.03,.02,1.6,P.rose);
    const bag=group(a,0,0,.8);bag.name='Saco de cuero';cylinder(bag,0,.85,0,.29,1.25,P.rose,16);for(const y of [.32,.47,1.28])cylinder(bag,0,y,0,.3,.035,P.ink,16);box(bag,0,1.54,0,.04,.22,.04,P.gold);cylinder(bag,0,.16,0,.43,.1,P.ink);
   }else if(id==='dance'){box(a,0,.145,0,1.5,.025,1.6,P.oak);for(const side of [-1,1])box(a,side*.3,.165,0,.14,.015,.35,P.gold);
   }else if(id==='thermal'){
    // Cedar tubs with a stone lip, headrest and brass taps.
    cylinder(a,0,.4,0,.88,.6,P.wood,16);cylinder(a,0,.72,0,.83,.09,P.cream,16);cylinder(a,0,.775,0,.71,.025,0x82caca,16);
    for(let j=0;j<12;j++){const angle=j*Math.PI/6;box(a,Math.cos(angle)*.84,.42,Math.sin(angle)*.84,.035,.5,.035,P.oak);}
    box(a,0,.8,-.65,.65,.12,.22,P.sage);cylinder(a,.65,.92,.3,.035,.3,P.gold);box(a,.55,1.04,.3,.25,.04,.06,P.gold);
   }else if(id==='cold'){
    box(a,0,.4,0,1.6,.65,1.8,P.white);box(a,0,.75,0,1.4,.035,1.6,P.sky);for(const x of [-.76,.76])box(a,x,.8,0,.1,.1,1.8,P.dark);
    box(a,.98,.5,0,.32,.9,.6,P.dark);box(a,.98,.98,0,.28,.08,.4,P.sky);for(let j=0;j<3;j++)box(a,-.4+j*.3,.79,.4,.14,.06,.14,P.white);
   }else{
    cylinder(a,0,.17,-.12,.36,.1,P.gold);cylinder(a,0,.36,-.12,.06,.4,P.dark);box(a,0,.56,-.12,.72,.16,.65,T.seat);box(a,0,.85,-.44,.72,.65,.13,T.seat);
    for(const side of [-1,1])box(a,side*.4,.74,-.12,.09,.12,.5,T.seat);
    if(id==='nails'){
     box(a,0,.94,.55,1.45,.1,.62,P.cream);for(const x of [-.55,.55])box(a,x,.48,.55,.12,.85,.45,P.rose);
     for(let j=0;j<3+q;j++)cylinder(a,-.5+j*.17,1.07,.63,.04,.16,[P.rose,P.gold,P.sage][j%3]);box(a,0,1.04,.4,.43,.17,.27,P.sky);ball(a,0,1.09,.33,.18,P.cream,1,.3,.5);
    }else if(id==='beauty'){
     box(a,0,1.4,.8,1.3,1.6,.1,P.gold);box(a,0,1.4,.73,1.13,1.42,.025,P.sky);box(a,.9,.6,.5,.45,1,.5,P.dark);
     for(let j=0;j<2+q;j++)cylinder(a,.9,.83+j*.1,.2,.055,.17,P.rose);cylinder(a,-.65,1,-.1,.18,.22,P.ink).rotation.z=.5;
    }else{
     box(a,0,.95,.6,1.5,.1,.75,P.oak);for(const x of [-.55,.55])box(a,x,.5,.6,.07,.9,.07,P.dark);
     const screen=box(a,0,1.22,.7,.62,.4,.04,P.ink);screen.rotation.x=-.12;box(a,0,1.22,.67,.53,.32,.015,P.sky);box(a,0,1.02,.46,.62,.035,.33,P.ink);box(a,-.55,1.02,.62,.22,.045,.25,P.sage);
    }
   }
   if(q){const u=group(a,1.02,0,-.45,id+'Quality');box(u,0,.4,0,.3,.7,.4,T.seat);for(let j=0;j<q;j++)box(u,0,.83+j*.1,0,.28,.06,.28,j%2?P.cream:T.accent);}
  }
  const premium=group(g,0,0,-3.4,id+'Quality');if(id==='dance')for(let j=0;j<q;j++){box(premium,-.65+j*.65,1.65,-.7,.42,.28,.04,P.dark);box(premium,-.65+j*.65,1.65,-.66,.25,.025,.015,P.gold);}
  if(id==='thermal'&&q){box(premium,2.5,.85,0,1.65,1.7,1.5,P.wood);for(let j=0;j<7;j++)box(premium,1.8+j*.22,1.6,.78,.08,1.4,.05,P.oak);box(premium,2.5,.5,.8,1.4,.15,.35,P.oak);}
  if(id==='cold'&&q){box(premium,0,.8,0,.8,1.5,.6,P.rose);for(let j=0;j<q;j++)box(premium,-.25+j*.25,1.2,-.33,.08,.4,.03,P.gold);}
  if(id==='beauty'&&q){box(premium,2.6,.5,0,.8,1,.9,P.dark);ball(premium,2.6,1,0,.4,P.cream,1,.35,1);ball(premium,2.6,1.07,0,.28,P.ink,1,.2,1);}
  if(id==='nails'&&q){box(premium,2.7,.25,0,.8,.4,.8,P.rose);box(premium,2.7,.48,0,.65,.03,.65,P.sky);}
  if(id==='boxing'&&q>1){box(premium,2.5,.25,0,1.6,.3,1.5,P.rose);for(const x of [1.8,3.2])box(premium,x,.8,0,.05,1.2,.05,P.gold);for(let j=0;j<3;j++)box(premium,2.5,.6+j*.22,0,1.4,.035,.035,P.cream);}
  if(id==='cycling')for(let j=0;j<q;j++)box(premium,-.5+j*.5,1.6,-.8,.25,.15+j*.12,.025,P.gold);
  if(id==='cowork'&&q>1){box(premium,2.5,1,0,1.5,2,.1,P.sage);box(premium,3.2,1,.5,.08,2,1.1,P.sky);box(premium,2.5,.85,.3,.8,.1,.5,P.oak);}
  for(let j=0;j<d;j++){
   const deco=group(g,-3+j*3,0,-3.65,id+'Decor');deco.name=T.name+' · detalle '+j;
   if(['thermal','cold'].includes(id)){for(let k=0;k<3;k++)cylinder(deco,0,.45+k*.1,0,.21,.09,P.cream);plant(deco,.5,0,.55);}
   else if(id==='boxing'){box(deco,0,.6,0,.6,1.1,.5,P.dark);for(const x of [-.18,.18])ball(deco,x,1.2,0,.12,P.rose);}
   else if(id==='cycling'){box(deco,0,.5,0,.5,.9,.5,P.ink);for(let k=0;k<3;k++)box(deco,0,.8+k*.12,0,.4,.08,.35,P.cream);}
   else{plant(deco,0,0,.6);box(deco,0,1.95,-.65,.65,.45,.05,T.accent);}
  }
  if(s.levels[id+'Staff']){const desk=group(g,0,0,-3,id+'Staff');box(desk,0,.48,0,id==='cowork'?1.5:1,.9,.5,T.seat);box(desk,0,.98,0,1.2,.09,.6,id==='thermal'?P.wood:P.oak);}
 }
 buildLeisure(root,s,kit,ROOM_THEMES);
 // Connected, two metre galleries. The spine occupies the gap between wings.
 if(L.ROOMS.some(r=>s.levels[r.id+'Wing'])){
  const hall=group(root);hall.name='Galerías del centro';
  // A planted rear concourse bridges the different depths of the original wings.
  box(hall,0,-.04,-14.65,14.8,.12,4.1,P.cream);box(hall,-10.7,-.04,-15.65,6.8,.12,2.1,P.cream);
  for(const x of [-4.8,4.8]){box(hall,x,.19,-14.65,1.4,.35,1.1,P.oak);plant(hall,x,-14.65,.7);box(hall,x+1.25,.34,-14.65,.8,.15,.55,P.wood);}
  for(const [x,z,w,d]of [[3,-17.7,40,2],[-2,-28.7,30,2],[-7,-23.2,2,13],[3,-23.2,2,13],[13,-23.2,2,13],[-15.35,-4.1,2.15,27]]){box(hall,x,-.04,z,w,.12,d,P.cream);if(w>d)box(hall,x,.035,z,w,.015,.06,P.gold);else box(hall,x,.035,z,.06,.015,d,P.gold);}
  for(const [x,z]of [[-16.2,-17.4],[-5.9,-28.7],[13,-16.85],[13,-29.55]]){plant(hall,x,z,.65);cylinder(hall,x,1.6,z,.035,3,P.dark);ball(hall,x,3.1,z,.18,P.gold);}
 }
}
