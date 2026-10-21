import './evolution.js';
// Each reform dresses its actual room without adding fake visitors or equipment.
export function evolveInteriors(root,s,K){
 const {group,box,cylinder,ball,plant,palette:P}=K;
 const legacy={cafe:{x:-3,z:0,width:8,depth:10},pilates:{x:3.8,z:0,width:6,depth:10},wellness:{x:10.6,z:0,width:6,depth:10},yoga:{x:-3,z:-9.5,width:7,depth:5},crossfit:{x:-10.5,z:-10.7,width:7,depth:8},padel:{x:11.1,z:-11.5,width:8,depth:10}};
 for(const r of globalThis.BloomEvolution.ROOMS){
  const tier=s.renovations?.[r.id]||0,style=s.roomStyles?.[r.id]||'balanced';if(!tier&&style==='balanced')continue;
  const room=legacy[r.id]||globalThis.BloomLayout.ROOMS.find(d=>d.id===r.id);if(!room)continue;
  const {x,z,width:w,depth:d}=room,outdoor=['golf','padel','pool'].includes(r.id),back=outdoor?d/2-.6:-d/2+.6;
  const key={cafe:'cafeDecor',pilates:'mat',wellness:'recoveryComfort',yoga:'yogaCare',crossfit:'gymAtmosphere',padel:'courtLights'}[r.id]||r.id+'Decor';
  const g=group(root,x,0,z,key);g.name='evolution:'+r.id;g.userData.tier=tier;g.userData.style=style;
  const accent=style==='premium'?P.gold:style==='express'?P.sky:P.sage;
  if(tier){
   if(!outdoor){
    const floor=group(g,0,0,0);floor.name='reform:floor:'+r.id;
    const nx=Math.max(2,Math.floor(w)),nz=Math.max(2,Math.floor(d));
    for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)box(floor,-w/2+(i+.5)*w/nx,.117,-d/2+(j+.5)*d/nz,w/nx-.025,.012,d/nz-.025,tier===1?((i+j)%2?P.cream:P.oak):tier===2?((i+j)%2?P.cream:P.white):((i+j)%4?P.white:P.sage));
   }
   // Stone/metal perimeter strips replace the plain base edge progressively.
   for(const side of [-1,1]){box(g,side*(w/2-.12),.18,0,.08,.04,d-.4,P.gold);box(g,0,.18,side*(d/2-.12),w-.3,.04,.08,P.gold);}
   for(const side of [-1,1]){box(g,side*(w/2-.65),.25,back,.7,.45,.7,P.cream);plant(g,side*(w/2-.65),back,.65+tier*.08);}
  }
  if(tier>=2){
   const feature=group(g,0,0,back);feature.name='reform:signature:'+r.id;
   if(outdoor){for(const side of [-1,1]){cylinder(feature,side*(w/2-1.2),1.3,0,.04,2.6,P.dark,12);ball(feature,side*(w/2-1.2),2.6,0,.17,P.cream);}}
   else{box(feature,0,1.45,0,2.5,1.4,.08,P.oak);box(feature,0,1.45,.05,2.3,1.2,.04,accent);for(let j=0;j<3;j++)ball(feature,-.65+j*.65,1.45,.1,.24,P.cream,1,.85,.15);}
  }
  if(tier>=3){
   const lounge=group(g,w/2-1.4,0,back+(outdoor?-1:1));lounge.name='reform:luxury:'+r.id;
   box(lounge,0,.2,0,1.6,.04,1.8,P.sage);box(lounge,0,.55,0,1.25,.18,.5,P.cream);box(lounge,0,.82,-.25,1.25,.55,.12,P.rose);for(const side of [-1,1])box(lounge,side*.5,.3,0,.06,.5,.4,P.gold);
   cylinder(lounge,-.85,.42,.5,.3,.06,P.oak,12);cylinder(lounge,-.85,.22,.5,.03,.4,P.gold,12);cylinder(lounge,-.85,.54,.5,.08,.18,P.white,12);
  }
  if(style!=='balanced'){
   const stand=group(g,-w/2+1.25,0,back+(outdoor?-1.5:1));stand.name='specialization:'+style;
   if(style==='express'){box(stand,0,.65,0,.75,.1,.45,P.oak);for(const side of [-1,1])box(stand,side*.28,.35,0,.035,.6,.035,P.dark);for(let i=0;i<3;i++)cylinder(stand,-.22+i*.22,.77,0,.08,.14,P.white,12);box(stand,0,.9,-.2,.5,.25,.04,accent);}
   else{cylinder(stand,0,.45,0,.22,.8,P.cream,12);for(let i=0;i<5;i++)ball(stand,Math.sin(i*2.4)*.2,.95+(i%2)*.12,Math.cos(i*2.4)*.2,.12,P.rose);box(stand,0,.14,0,.8,.03,.8,P.gold);}
  }
 }
}
