import './layout.js';
// Small repeated forms share the same primitives/materials as the original art.
export function finishInteriors(root,s,K){
 const {group,box,cylinder,ball,plant,palette:P}=K,L=globalThis.BloomLayout,features=[];
 const own=id=>(s.levels[id]||0)>0;
 const detail=(name,x,z,zone)=>{const g=group(root,x,0,z,zone);g.name='finish:'+name;features.push(name);return g;};
 function linen(g,x,y,z,color=P.cream){for(let i=0;i<3;i++)box(g,x,y+i*.055,z,.36,.045,.26,i===1?P.white:color);box(g,x,y+.14,z,.32,.015,.018,P.gold);}
 function book(g,x,y,z,color){box(g,x,y,z,.19,.07,.28,color);box(g,x,y+.04,z,.16,.012,.25,P.cream);}
 function basket(g,x,y,z){cylinder(g,x,y+.12,z,.18,.24,P.oak,12);for(let i=0;i<4;i++)cylinder(g,x,y+.04+i*.055,z,.184,.012,P.wood,12);}
 function frame(g,x,y,z,color,w=.8){box(g,x,y,z,w,.8,.06,P.oak);box(g,x,y,z+.04,w-.1,.7,.02,P.cream);ball(g,x-.08,y+.08,z+.06,.19,color,1,1.3,.08);box(g,x+.15,y-.2,z+.07,.025,.23,.015,P.gold);}
 function lantern(g,x,y,z){box(g,x,y,z,.28,.035,.28,P.gold);for(const side of [-1,1])box(g,x+side*.12,y+.16,z,.025,.32,.025,P.gold);cylinder(g,x,y+.12,z,.065,.2,P.cream,12);box(g,x,y+.33,z,.28,.035,.28,P.gold);}
 function pendant(g,x,z,color=P.gold){cylinder(g,x,2.7,z,.012,.65,P.dark,8);cylinder(g,x,2.36,z,.23,.14,color,16);ball(g,x,2.26,z,.1,P.cream,1,.4,1);}
 function bench(g,x,z,width,color){box(g,x,.38,z,width,.14,.48,color);for(const side of [-1,1])box(g,x+side*(width/2-.12),.18,z,.07,.34,.35,P.dark);}
 const cafe=detail('cafe-artisan',0,0,'cafeDecor');
 for(let i=0;i<4;i++){const x=-6.8+i*.31;cylinder(cafe,x,1.43,-4.4,.09,.32,P.cream,12);cylinder(cafe,x,1.6,-4.4,.095,.025,P.oak,12);box(cafe,x,1.44,-4.29,.09,.09,.015,P.sage);}
 box(cafe,-5.95,1.52,-2.55,.3,.03,.25,P.dark);for(let i=0;i<4;i++)box(cafe,-5.95,1.55+i*.025,-2.55,.24,.018,.19,P.cream);
 for(const [x,z]of L.tables(s)){const g=detail('table-linen',x,z,'seats');box(g,.25,1.07,-.22,.18,.09,.12,P.oak);for(let i=0;i<3;i++)box(g,.25,1.12+i*.012,-.22,.14,.01,.1,P.cream);}
 if(L.zones(s).cafe){const lounge=detail('cafe-gallery',-10.7,-5.8,'cafeWing');for(const x of [-1.8,0,1.8])frame(lounge,x,1.5,.12,x?P.sage:P.rose);for(let j=0;j<3;j++)book(lounge,-1.6+j*.3,.65,.6,[P.sage,P.rose,P.gold][j]);pendant(lounge,0,2,P.cream);}
 if(own('mat')){
  const studio=detail('pilates-boutique',0,0,'mat');
  for(const [x,z]of [[6.1,-5.2],[6.1,-11.8]]){if(z<-6&&!own('classes'))continue;const rack=detail('pilates-storage',x,z,'pilatesKit');box(rack,0,.55,0,.55,1,.42,P.oak);for(let i=0;i<3;i++){linen(rack,0,.25+i*.28,0,P.mint);ball(rack,-.25,1.22+i*.025,0,.12,P.rose);}plant(studio,x+.25,z,.55);}
  for(const spot of L.pilates(s))if(spot.premium){box(studio,spot.x,.49,spot.z+.82,.3,.05,.16,P.dark);for(const side of [-1,1])cylinder(studio,spot.x+side*.3,.4,spot.z+.75,.025,.19,P.gold,8);}
  frame(studio,4.9,1.65,-5.52,P.sage,1.1);
 }
 if(L.zones(s).yoga){const zen=detail('yoga-ritual',-3.9,-11.8,'yogaCare');for(const x of [-1.2,1.2]){lantern(zen,x,.08,.25);basket(zen,x,0,.9);linen(zen,x,.26,.9,P.rose);}pendant(zen,0,0,P.cream);}
 for(const id of ['pressotherapy','massage'])for(const spot of L.serviceSlots(s,id)){
  const g=detail(id+'-care',spot.x,spot.z,id);basket(g,-.74,.04,-.8);linen(g,-.74,.29,-.8,id==='massage'?P.rose:P.mint);
  if(id==='massage'){cylinder(g,.82,.96,-.45,.09,.12,P.oak,12);for(let j=0;j<3;j++)ball(g,.82,1.04+j*.035,-.45,.06,P.dark,1,.4,1);lantern(g,.82,.7,.45);}
  else{for(let j=0;j<3;j++)box(g,.82,.72,-.35+j*.09,.12,.025,.03,P.gold);box(g,.82,.99,-.24,.23,.04,.22,P.dark);}
 }
 if(L.zones(s).wellness){const spa=detail('wellness-library',10.7,-5.8,'recoveryComfort');for(const x of [-1.3,1.3]){frame(spa,x,1.5,0,x<0?P.mint:P.rose);lantern(spa,x,.07,.6);}pendant(spa,0,.1,P.cream);}
 if(L.zones(s).crossfit){const gym=detail('gym-accessories',-8,-13.9,'gymAtmosphere');box(gym,0,.5,0,.45,.9,.45,P.dark);linen(gym,0,1,0);cylinder(gym,0,1.2,0,.07,.3,P.sky,12);for(let j=0;j<3;j++)box(gym,-.55,.25+j*.13,0,.4,.1,.5,P.oak);}
 if(own('padelCourt')){const club=detail('padel-club-lounge',15.05,-8.8,'padelKit');basket(club,0,.05,0);for(let j=0;j<4;j++)ball(club,(j%2)*.13-.06,.28,Math.floor(j/2)*.13-.06,.06,P.gold);linen(club,0,.6,.55,P.mint);box(club,0,.52,.55,.42,.1,.45,P.oak);}
 for(const r of L.ROOMS){if(!own(r.id+'Wing'))continue;const id=r.id,g=detail(id+'-signature',r.x,r.z,id+'Decor'),tier=Math.min(3,s.levels[id+'Decor']||0);
  // Back corners and wall shelves leave the central and door aisles clear.
  if(id==='cycling'){
   for(const side of [-1,1]){box(g,side*3.1,1.7,-4.2,.55,.6,.045,P.ink);for(let i=0;i<3;i++)box(g,side*3.1-.16+i*.16,1.7,-4.16,.04,.1+i*.11,.015,P.gold);}
   bench(g,2.9,-3.55,1.2,P.dark);linen(g,2.9,.49,-3.55);for(let i=0;i<2+tier;i++)cylinder(g,-3.2+i*.15,.35,-3.6,.045,.23,P.sky,12);
  }else if(id==='nails'){
   for(const side of [-1,1]){box(g,side*2.8,1.55,-4.18,1.05,.06,.3,P.gold);for(let i=0;i<5;i++)cylinder(g,side*2.8-.38+i*.19,1.68,-4.18,.035,.18,[P.rose,P.sage,P.cream][i%3],12);}
   frame(g,0,2.1,-4.13,P.rose,1);basket(g,3.25,.05,-3.1);linen(g,3.25,.31,-3.1,P.rose);
  }else if(id==='beauty'){
   for(const side of [-1,1]){box(g,side*3.2,.7,-3.7,.45,1.3,.45,P.dark);for(let i=0;i<3;i++)linen(g,side*3.2,.35+i*.3,-3.7,P.cream);}
   for(let i=0;i<3+tier;i++){const x=-.8+i*.3;cylinder(g,x,.4,-3.5,.05,.24,P.sage,12);cylinder(g,x,.55,-3.5,.025,.07,P.gold,8);}
  }else if(id==='thermal'){
   for(const x of [-3.2,3.2]){lantern(g,x,.15,-2.8);basket(g,x,.05,3.2);linen(g,x,.31,3.2,P.cream);}
   for(let i=0;i<5;i++)ball(g,-3.5+i*.18,.18,-3.85,.09,P.dark,1,.45,1);pendant(g,0,-3.8,P.oak);
  }else if(id==='boxing'){
   for(let i=0;i<3;i++){box(g,-2.5+i*.5,1.75,-4.17,.32,.52,.04,P.cream);box(g,-2.5+i*.5,1.75,-4.13,.1,.3,.015,P.rose);}
   bench(g,3.1,-3.7,1.2,P.wood);for(const side of [-1,1])ball(g,3.1+side*.18,.6,-3.7,.13,P.rose);linen(g,-3.2,.3,-3.4);
  }else if(id==='cold'){
   for(const side of [-1,1]){box(g,side*3.15,.65,-3.7,.65,1.2,.5,P.cream);for(let i=0;i<3;i++)box(g,side*3.15,.4+i*.3,-3.42,.5,.035,.025,P.gold);linen(g,side*3.15,1.3,-3.7,P.mint);}
   frame(g,0,2.15,-4.15,P.sky,1.1);lantern(g,-3.3,.08,3.4);
  }else{
   for(const side of [-1,1]){pendant(g,side*2.6,-2.4,P.sage);bench(g,side*3.1,3.4,1.25,P.sage);book(g,side*3.1,.5,3.4,P.rose);}
   for(let i=0;i<3+tier;i++)book(g,-.7+i*.24,1.05,-3,[P.gold,P.sage,P.rose][i%3]);
  }
  if(tier>0)for(const side of [-1,1]){box(g,side*3.7,1.25,-4.25,.035,1.65,.04,P.gold);ball(g,side*3.7,2.1,-4.18,.09,P.cream,1,1,.5);}
 }
 const frontage=detail('botanical-frontage',0,0,'cafeDecor');
 for(const x of [-12.5,-9.8,-6.9,6.7,13.7]){if(x<-7&&!L.zones(s).cafe||x>7&&!L.zones(s).wellness)continue;box(frontage,x,.3,6.05,.72,.5,.4,P.oak);for(let j=0;j<3;j++){ball(frontage,x-.22+j*.22,.63,6.05,.19,j%2?P.sage:P.mint,1,1.25,.7);ball(frontage,x-.22+j*.22,.87,6.05,.07,j%2?P.rose:P.cream,1,.7,1);}}
 return features;
}
export function finishGalleries(root,K){
 const {group,box,cylinder,ball,palette:P}=K,C=globalThis.BloomCampus,g=group(root);g.name='finish:gallery-craft';
 // Shallow skirting, planters and wall-side benches keep through routes open.
 for(const [x,z]of [[C.x(-13.7),-7.7],[C.x(14),3.7],[C.x(14),-4.9]]){
  box(g,x,.28,z,.55,.48,.7,P.oak);for(let i=0;i<3;i++)ball(g,x,.62+i*.1,z,.19,P.sage,1,.6,1);
  for(let i=0;i<4;i++)box(g,x-.19+i*.13,.3,z+.36,.025,.32,.02,P.wood);
 }
 for(const [x,z]of [[C.x(6.9)+.08,2.4],[C.x(6.9)+.08,-10.4]]){box(g,x,.22,z,.12,.28,1.3,P.oak);for(let i=0;i<3;i++)cylinder(g,x,.4,z-.4+i*.4,.06,.07,P.gold,12);}
 for(const [x,z]of [[-18.8,8.1],[C.x(19.5),8.1]]){box(g,x,.33,z,1.5,.12,.55,P.oak);for(const side of [-1,1])box(g,x+side*.55,.15,z,.06,.3,.4,P.dark);box(g,x,.65,z-.22,1.5,.45,.08,P.oak);}
 return g;
}
