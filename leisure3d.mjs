import './layout.js';
export function buildLeisure(root,s,K,themes){
 const {group,box,cylinder,ball,plant,palette:P}=K,L=globalThis.BloomLayout;
 const n=id=>s.levels[id]||0;
 for(const id of ['pool','golf']){
  if(!n(id+'Wing'))continue;const r=L.ROOMS.find(r=>r.id===id),g=group(root,r.x,0,r.z,id+'Wing');g.name=r.name;g.userData.theme=themes[id].name;
  const slots=L.serviceSlots(s,id),q=n(id+'Quality'),d=n(id+'Decor');
  if(id==='pool'){
   box(g,0,-.18,0,18,.45,14,P.oak);box(g,0,.05,0,17.9,.1,13.9,P.cream);
   box(g,0,.26,0,15.4,.45,10.3,P.white);box(g,0,.5,0,14.6,.035,9.5,0x82caca);
   for(const z of [-4.9,4.9]){box(g,0,.54,z,15.4,.12,.22,P.white);box(g,0,.61,z,14.8,.018,.035,P.gold);}
   for(const x of [-7.6,7.6])box(g,x,.54,0,.22,.12,10.2,P.white);
   for(let i=0;i<7;i++){const x=-7.2+i*2.4;for(let j=0;j<24;j++)ball(g,x,.56,-4.5+j*.39,.055,j%4<2?P.white:P.gold,1,.7,1);}
   for(let i=0;i<6;i++){const x=-6+i*2.4;box(g,x,.52,0,.06,.012,8.2,P.dark);box(g,x,.52,-3.95,.8,.012,.07,P.dark);}
   for(const spot of slots){const a=group(g,spot.x-r.x,0,spot.z-r.z,'pool');a.name=r.name+' · puesto '+spot.index;box(a,0,.46,.2,.65,.7,.75,P.sky);box(a,0,.86,.2,.75,.1,.8,P.white);box(a,0,.93,.2,.32,.02,.05,P.gold);}
   for(const side of [-1,1]){box(g,side*8.4,1.1,0,.12,2.2,14,P.mint);for(let i=0;i<4;i++){box(g,side*8.3,1.35,-4.8+i*3.2,.045,1.3,2.2,P.sky);box(g,side*8.2,2.1,-4.8+i*3.2,.06,.05,2.3,P.gold);}}
   box(g,0,1.2,-7,18,2.4,.15,P.cream);for(const x of [-6,-2,2,6]){box(g,x,1.4,-6.85,2.9,1.3,.05,P.sky);box(g,x,2.1,-6.8,3,.06,.08,P.gold);}
   for(let i=0;i<Math.max(1,d);i++){const x=-7+i*2.3;const deck=group(g,x,0,-5.9,'poolDecor');box(deck,0,.35,0,1.5,.16,.65,P.oak);box(deck,0,.65,-.3,1.5,.5,.1,P.mint);for(let j=0;j<3;j++)box(deck,-.35+j*.35,.46,.1,.24,.04,.3,P.cream);}
   const quality=group(g,0,0,0,'poolQuality');for(let i=0;i<q;i++){box(quality,-3+i*3,1.9,-6.7,.6,.6,.06,P.dark);for(let j=0;j<3;j++)box(quality,-3.18+i*3+j*.18,1.9,-6.65,.045,.25,.015,P.gold);}
   if(n('poolStaff')){const chair=group(g,7.8,0,3.8,'poolStaff');for(const x of [-.3,.3])box(chair,x,.7,0,.06,1.4,.06,P.dark);box(chair,0,1.4,0,.75,.15,.65,P.rose);box(chair,0,1.7,-.3,.75,.6,.1,P.rose);ball(chair,0,2.35,-.2,.5,P.cream,1,.2,1);}
   for(const x of [-7.7,7.7])plant(g,x,-6,.8);
   const detail=group(g,0,0,0,'poolDecor');detail.name='Piscina · mosaico, duchas y tumbonas';
   for(let i=0;i<30;i++)for(const z of [-5.25,5.25])box(detail,-7.25+i*.5,.53,z,.3,.025,.18,i%3?P.sky:P.gold);
   for(const x of [-7.8,7.8])for(const z of [-2.8,2.8]){cylinder(detail,x,.95,z,.035,.9,P.gold,12);ball(detail,x,1.4,z,.04,P.gold);box(detail,x,.98,z,.12,.035,.35,P.gold);}
   for(let i=0;i<3;i++){const lounge=group(detail,-5.5+i*2.5,0,-5.85);box(lounge,0,.33,0,1.85,.14,.65,P.cream);const back=box(lounge,-.65,.54,0,.6,.12,.65,P.mint);back.rotation.z=.45;for(const x of [-.6,.6])box(lounge,x,.17,0,.06,.3,.45,P.gold);box(lounge,.3,.43,0,.45,.05,.5,P.white);}
   for(const x of [-8.1,8.1]){cylinder(detail,x,1.5,-5.4,.035,2.7,P.gold,12);box(detail,x+.23,2.8,-5.4,.5,.04,.35,P.gold);box(detail,x,1,-5.4,.15,.06,.15,P.dark);}
   for(let i=0;i<16;i++){const strip=box(detail,-6.8+(i%4)*4.3,.525,-3.7+Math.floor(i/4)*2.3,.8,.008,.035,P.white);strip.rotation.y=.2;}
   for(const x of [-8.3,8.3]){box(detail,x,.5,0,.55,.9,1.7,P.oak);for(let j=0;j<4;j++)box(detail,x,.7,-.6+j*.4,.58,.32,.3,P.cream);}
  }else{
   box(g,0,-.2,0,51,.4,28,P.dark);box(g,0,.045,0,50.8,.05,27.8,P.mint);
   // One continuous long fairway, shared tee and a single distant green.
   const fairway=group(g,0,0,0,'golfWing');fairway.name='Recorrido continuo de golf';
   ball(fairway,0,.07,-1,18,0x6fbc99,1.22,.004,.45);
   for(let j=0;j<18;j++)box(fairway,-20+j*2.3,.14,-1,2.22,.018,10,j%2?0x74afa8:0x6fbc99);
   ball(fairway,19,.16,-2,4.5,P.sage,1,.012,.9);
   cylinder(fairway,20,1,-2,.025,1.8,P.white,12);box(fairway,20.29,1.65,-2,.55,.32,.035,P.rose);cylinder(fairway,20,.2,-2,.1,.02,P.dark,12);
   for(const [x,z] of [[-8,-8],[9,6],[21,-8]]){ball(g,x,.14,z,2.5,P.oak,1,.012,.55);ball(g,x,.155,z,2.2,P.cream,1,.01,.48);}
   for(const spot of slots){const tee=group(g,spot.x-r.x,0,spot.z-r.z,'golf');tee.name=r.name+' · salida '+spot.index;box(tee,0,.16,0,.75,.12,1,P.dark);for(const side of [-1,1])ball(tee,side*.3,.28,0,.055,P.gold);}
   box(g,-24.5,.12,0,1.5,.08,27,P.cream);box(g,0,.13,11.3,49,.07,1.2,P.cream);
   for(let i=0;i<14;i++){const x=-23+i*3.5,z=i%2?-12.7:12.7;plant(g,x,z,.9+(i%3)*.2);}
   ball(g,-4,.1,7,3.8,P.sky,1,.02,.6);for(let j=0;j<5;j++)ball(g,-7+j,.14,8,.2,P.cream,1,.6,.7);
   const clubhouse=group(g,-17,0,-9,'golfDecor');clubhouse.name='Casa club · recepción y terraza';
   box(clubhouse,0,.18,0,13,.3,6,P.oak);box(clubhouse,0,.36,0,12.8,.08,5.8,P.cream);box(clubhouse,0,1.8,-3,13,2.9,.18,P.cream);
   for(const x of [-6.4,6.4])box(clubhouse,x,1.8,0,.16,2.9,6,P.sage);
   box(clubhouse,0,3.35,-1.7,13.5,.24,3.3,P.sage);for(let j=0;j<19;j++)box(clubhouse,-6.3+j*.7,3.27,1.5,.12,.16,2.8,P.oak);
   for(const x of [-5.7,-1.8,1.8,5.7]){box(clubhouse,x,1.7,2.8,.13,2.8,.13,P.gold);box(clubhouse,x,1.8,-2.86,2.9,1.4,.04,P.sky);}
   box(clubhouse,-2.4,.9,-1.6,4.8,1.1,.9,P.oak);box(clubhouse,-2.4,1.5,-1.6,5,.12,1,P.white);box(clubhouse,-2.4,1.8,-1.6,.65,.45,.15,P.dark);
   for(let i=0;i<3;i++){box(clubhouse,2.2+i*.9,.7,-2.25,.7,.65,.65,P.rose);box(clubhouse,2.2+i*.9,1.08,-2.5,.7,.7,.1,P.rose);}
   for(const x of [-4.5,4.5]){cylinder(clubhouse,x,.85,1.4,.55,.1,P.oak,12);cylinder(clubhouse,x,.6,1.4,.04,.5,P.gold,12);for(const side of [-1,1])box(clubhouse,x+side*.85,.6,1.4,.5,.45,.5,P.cream);plant(clubhouse,x,1.4,.28);}
   for(let i=0;i<2+d;i++){cylinder(clubhouse,-5+i*.65,1.8,-2.68,.1,.25,P.gold,12);ball(clubhouse,-5+i*.65,2,-2.68,.15,P.gold);}
   const equipment=group(g,-16,0,12.6,'golfQuality');for(let i=0;i<q;i++){cylinder(equipment,i*.55,.42,0,.16,.7,P.rose,12);for(let j=0;j<3;j++){box(equipment,i*.55-.08+j*.08,.95,0,.025,.65,.025,P.gold);box(equipment,i*.55-.08+j*.08,1.28,0,.1,.06,.05,P.dark);}}
   if(n('golfStaff')){const desk=group(g,-16,0,-5.3,'golfStaff');box(desk,0,.5,0,1.6,1,.7,P.dark);box(desk,0,1.05,0,1.8,.08,.8,P.oak);}
   const landscape=group(g,0,0,0,'golfDecor');landscape.name='Golf · sendero, rocalla y jardinería';
   for(const z of [-13,11.3])box(landscape,0,.13,z,49,.07,1.3,P.cream);box(landscape,24,.13,0,1.3,.07,26,P.cream);
   for(let i=0;i<15;i++){const x=-22+i*3.2;box(landscape,x,.5,-13.8,.09,.85,.09,P.oak);if(i<14)box(landscape,x+1.6,.78,-13.8,3.2,.08,.08,P.oak);}
   for(const [x,z]of [[-7,7],[3,-9],[14,8],[23,-8]]){plant(landscape,x,z,.55);for(let j=0;j<3;j++)ball(landscape,x+.4+j*.3,.18,z+.5,.25,P.cream,1,.6,.8);}
   for(const spot of slots){const x=spot.x-r.x,z=spot.z-r.z;box(landscape,x,.18,z,1.2,.05,.7,P.sage);cylinder(landscape,x+.7,.6,z,.025,1,P.gold,12);box(landscape,x+.7,1.05,z,.35,.3,.04,P.cream);}
  }
 }
 if(n('poolWing')||n('golfWing')){const hall=group(root);hall.name='Paseo de piscina y golf';box(hall,3,-.04,-35.3,2,.12,15,P.cream);box(hall,15,-.04,-40.6,65,.12,2.8,P.cream);for(const x of [-17.5,2,46]){cylinder(hall,x,1.5,-40.1,.04,3,P.dark);ball(hall,x,3,-40.1,.2,P.gold);}}
}
