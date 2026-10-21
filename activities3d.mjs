import './activities.js';
import './layout.js';
export function buildActivities(root,s,kit){
  const {group,box,cylinder,ball,plant,palette:P}=kit,L=globalThis.BloomLayout;
  for(const room of L.ROOMS){
    const id=room.id,n=s.levels[id]||0,quality=s.levels[id+'Quality']||0,decor=s.levels[id+'Decor']||0;
    if(!s.levels[id+'Wing'])continue;
    const g=group(root,0,0,0,id+'Wing');g.name=room.name;
    box(g,room.x,-.18,-23,8,.45,9,P.oak);box(g,room.x,.07,-23,7.9,.08,8.9,id==='thermal'||id==='cold'?P.mint:P.cream);
    box(g,room.x,1.2,-27.5,8,2.4,.15,P.cream);box(g,room.x-4,.7,-23,.13,1.4,9,P.sage);
    for(let i=0;i<4;i++){box(g,room.x-2.9+i*1.9,1.6,-27.37,1.4,1,.04,P.sky);box(g,room.x-2.9+i*1.9,2.2,-27.3,1.5,.05,.08,P.gold);}
    // Each wing has a door onto a continuous outdoor promenade.
    box(g,room.x,-.04,-17.5,8,.1,2,P.oak);for(const x of [-1.2,1.2])box(g,room.x+x,1,-18.5,.1,2,.1,P.dark);
    if(!n){const plot=group(g,room.x,0,-23,id);box(plot,0,.15,0,2,.1,2,P.sage);box(plot,0,.23,0,.8,.05,.12,P.cream);box(plot,0,.23,0,.12,.05,.8,P.cream);}
    for(const spot of L.serviceSlots(s,id)){
      const a=group(g,spot.x,0,spot.z,id);a.name=room.name+' · puesto '+(spot.index+1);
      if(id==='cycling'){
        for(const z of [-.45,.45]){const wheel=cylinder(a,0,.38,z,.31,.14,P.dark,16);wheel.rotation.z=Math.PI/2;}
        box(a,0,.55,0,.15,.15,.9,P.sage);box(a,0,.7,-.18,.12,.6,.12,P.gold);box(a,0,1,-.18,.45,.12,.3,P.ink);
        box(a,0,.8,.48,.09,.7,.09,P.dark);box(a,0,1.14,.48,.65,.09,.08,P.ink);
      }else if(id==='boxing'){
        box(a,0,.12,0,1.7,.1,1.8,P.dark);cylinder(a,0,.75,.8,.3,1.3,P.rose,12);box(a,0,1.5,.8,.07,.3,.07,P.gold);cylinder(a,0,.16,.8,.45,.1,P.ink);
      }else if(id==='thermal'||id==='cold'){
        box(a,0,.38,0,1.7,.6,1.8,id==='cold'?P.sky:P.oak);box(a,0,.7,0,1.45,.035,1.55,0x82caca);
        for(const x of [-.78,.78])box(a,x,.79,0,.12,.12,1.8,P.cream);box(a,0,.79,-.84,1.65,.12,.12,P.cream);
        for(let j=0;j<quality;j++)ball(a,-.35+j*.3,.74,.4,.06,P.white);
      }else{
        box(a,0,.45,-.15,.7,.12,.65,P.rose);box(a,0,.8,-.5,.7,.65,.12,P.sage);for(const x of [-.25,.25])box(a,x,.23,-.15,.07,.4,.07,P.gold);
        if(id==='cowork'){
          box(a,0,.86,.6,1.4,.09,.7,P.oak);for(const x of [-.5,.5])box(a,x,.43,.6,.07,.8,.07,P.dark);
          box(a,0,1.1,.7,.6,.4,.055,P.ink);box(a,0,1.1,.66,.5,.3,.015,P.sky);box(a,0,.92,.48,.6,.035,.32,P.ink);cylinder(a,.47,.99,.48,.07,.15,P.cream);
        }else if(id==='nails'){
          box(a,0,.88,.55,1.4,.1,.6,P.cream);box(a,.55,.5,.5,.12,.9,.5,P.sage);for(let j=0;j<3+quality;j++)cylinder(a,-.5+j*.15,1,.55,.04,.15,[P.rose,P.gold,P.sage][j%3]);
          box(a,0,1.01,.4,.4,.17,.25,P.sky);
        }else{
          box(a,0,1.2,.8,1.3,1.5,.1,P.gold);box(a,0,1.25,.73,1.1,1.2,.04,P.sky);box(a,.9,.7,.5,.45,1.2,.55,P.sage);for(let j=0;j<2+quality;j++)cylinder(a,.9,.9+j*.09,.2,.055,.17,P.rose);
          cylinder(a,-.65,1,-.1,.18,.22,P.ink).rotation.z=.5;
        }
      }
      if(quality){const premium=group(a,1.02,0,-.45,id+'Quality');box(premium,0,.4,0,.35,.7,.4,P.sage);for(let j=0;j<quality;j++)box(premium,0,.84+j*.11,0,.3,.08,.3,[P.gold,P.rose,P.mint][j%3]);}
    }
    const premium=group(g,room.x,0,-26.3,id+'Quality');
    if(id==='cycling'){box(premium,0,1.65,-.9,2.1,1,.08,P.ink);box(premium,0,1.65,-.84,1.9,.8,.015,P.sky);for(let j=0;j<quality;j++)box(premium,-.5+j*.5,1.5,-.82,.25,.1+j*.12,.025,P.gold);}
    if(id==='thermal'&&quality){box(premium,2.6,.85,0,1.5,1.7,1.5,P.oak);box(premium,2.6,.6,.78,1.3,.18,.4,P.wood);box(premium,2.6,1.4,.78,1.2,.5,.04,P.gold);}
    if(id==='cold'&&quality){box(premium,0,.75,0,.8,1.5,.6,P.rose);for(let j=0;j<quality;j++)box(premium,-.25+j*.25,1.2,-.33,.08,.4,.03,P.gold);}
    if(id==='boxing'&&quality>1){box(premium,2.5,.3,0,1.7,.3,1.7,P.rose);for(const a of [-.75,.75])for(const b of [-.75,.75])box(premium,2.5+a,.85,b,.05,1.3,.05,P.gold);for(const z of [-.75,.75])for(let j=0;j<3;j++)box(premium,2.5,.6+j*.22,z,1.5,.035,.035,P.cream);}
    if(id==='beauty'&&quality){box(premium,2.7,.5,0,.8,1,.9,P.dark);ball(premium,2.7,1,0,.4,P.cream,1,.35,1);ball(premium,2.7,1.07,0,.28,P.ink,1,.2,1);}
    if(id==='nails'&&quality){box(premium,2.7,.25,0,.8,.4,.8,P.rose);box(premium,2.7,.48,0,.65,.03,.65,P.sky);}
    if(id==='cowork'&&quality>1){box(premium,2.7,1,0,1.5,2,.15,P.sage);box(premium,3.4,1,.6,.1,2,1.2,P.sky);box(premium,2.7,.8,.4,.8,.1,.5,P.oak);}
    for(let j=0;j<decor;j++){const d=group(g,room.x-2.6+j*2.6,0,-26.8,id+'Decor');plant(d,0,0,.7);box(d,0,2,-.43,.8,.5,.05,[P.rose,P.gold,P.mint][j]);}
    if(s.levels[id+'Staff']){const desk=group(g,room.x,0,-26.8,id+'Staff');box(desk,0,.5,0,1.2,1,.5,P.sage);box(desk,0,1.05,0,1.3,.09,.6,P.oak);}
  }
  if(L.ROOMS.some(r=>s.levels[r.id+'Wing'])){box(root,0,-.04,-17.5,65,.1,2,P.oak);box(root,0,-.04,9.25,65,.1,1.6,P.oak);for(const x of [-32,32])box(root,x,-.08,-4.1,1.6,.12,27,P.oak);}
}
