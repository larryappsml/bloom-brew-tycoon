import * as THREE from './vendor/three.module.min.mjs';
import './layout.js';
const glass=new THREE.MeshStandardMaterial({color:0xb8e4df,transparent:true,opacity:.16,roughness:.18,depthWrite:false});
export function buildSports(root,s,kit){
  const {box,cylinder,ball,group,label,plant,mesh,geometry,palette:P}=kit,L=globalThis.BloomLayout,z=L.zones(s),n=id=>Math.min(3,s.levels[id]||0);
  function plot(x,back,w,d,id,name){const g=group(root,x,0,back+d/2,id);box(g,0,-.2,0,w,.18,d,0xa6bd96);for(const a of [-1,1])for(const b of [-1,1])box(g,a*(w/2-.2),.3,b*(d/2-.2),.1,.6,.1,P.cream);box(g,0,.08,0,1.1,.08,1.1,P.sage);box(g,0,.14,0,.65,.06,.12,P.white);box(g,0,.14,0,.12,.06,.65,P.white);label(g,name,0,1.1,0,w*.75);}
  if(!z.crossfit)plot(-10.7,-14.6,6.6,8.4,'crossfitWing','+ BLOOM STRENGTH');
  else{const g=group(root,0,0,0,'crossfitWing');g.name='Box de entrenamiento';box(g,-10.7,-.22,-10.4,6.6,.5,8.4,P.oak);box(g,-10.7,.05,-10.4,6.5,.08,8.3,0xd9c4a9);box(g,-10.7,1.2,-14.6,6.6,2.5,.14,P.cream);for(const zz of [-13.7,-11.3,-8.9]){box(g,-14,1,zz,.15,2,.5,P.cream);box(g,-13.9,1.8,zz,.04,.12,.5,P.gold);}label(g,'BLOOM STRENGTH',-10.7,2.55,-14.4,5.7);
    for(let i=0;i<6;i++)box(g,-13.55+i*1.13,.11,-6.5,1.05,.04,.13,P.sage);plant(g,-8.1,-7.1,.8);
    if(!n('functionalStations')){const spot=group(g,-10.7,0,-10.2,'functionalStations');box(spot,0,.12,0,2,.1,2,P.sage);label(spot,'+ CIRCUITO FUNCIONAL',0,1,0,4.4);}
    for(const spot of L.sportSlots(s,'crossfit')){const station=group(g,spot.x,0,spot.z,'functionalStations');station.name='Estación funcional '+spot.index;box(station,0,.13,0,1.45,.09,1.8,P.dark);box(station,0,.185,-.65,.95,.015,.05,P.gold);for(const side of [-1,1]){ball(station,side*.45,.28,-.65,.13,P.ink,1,.85,1);const handle=mesh(station,geometry('kettleHandle',()=>new THREE.TorusGeometry(.08,.025,5,10)),P.gold,side*.45,.44,-.65);handle.rotation.y=.2;}box(station,0,.25,.72,.42,.25,.3,P.oak);}
    for(let i=0;i<n('strengthRig');i++){const rack=group(g,-12.6+i*1.85,0,-14.1,'strengthRig');for(const side of [-1,1])box(rack,side*.62,1.1,0,.08,2.2,.1,P.dark);box(rack,0,2.2,0,1.4,.07,.08,P.dark);cylinder(rack,0,.9,.3,.025,1.3,P.gold).rotation.z=Math.PI/2;for(const side of [-1,1]){const weight=cylinder(rack,side*.48,.9,.3,.2,.08,P.ink,16);weight.rotation.z=Math.PI/2;}}
    for(let i=0;i<n('gymAtmosphere');i++){const x=-12.7+i*1.9;box(g,x,1.45,-14.46,1.55,1.25,.05,0xb7d5d3);box(g,x,2.18,-14.35,1.6,.045,.08,P.gold);const locker=group(g,-7.9,0,-13.5+i*1.2,'gymAtmosphere');box(locker,0,.75,0,.5,1.5,.85,P.sage);box(locker,-.26,.85,0,.02,.32,.04,P.gold);}
  }
  if(!z.padel)plot(11.4,-16.6,8,10.4,'padelWing','+ CLUB DE PÁDEL');
  else{const court=group(root,0,0,0,'padelCourt');court.name='Club de pádel';box(court,11.4,-.2,-11.4,8,.5,10.4,P.oak);box(court,11.4,.08,-11.4,7.8,.08,10.2,s.levels.padelCourt?0x74afa8:0xa4bb9b);label(court,'BLOOM PÁDEL',11.4,2.65,-16.35,6.3);plant(court,7.9,-6.7,.7);
    if(!s.levels.padelCourt)label(court,'+ INSTALAR PISTA',11.4,1.2,-11.4,4.8);
    else{box(court,11.4,.13,-11.4,6.8,.025,9.2,0x5c9e91);for(const x of [8,14.8])box(court,x,.155,-11.4,.035,.015,9.2,P.white);for(const zz of [-16,-13.8,-9,-6.8])box(court,11.4,.155,zz,6.8,.015,.035,P.white);for(const zz of [-14.9,-7.9])box(court,11.4,.155,zz,.035,.015,2.2,P.white);
      for(const x of [7.9,14.9]){box(court,x,.65,-11.4,.055,1.3,.055,P.dark);for(const zz of [-16.1,-11.4,-6.7])box(court,x,1.1,zz,.055,2.2,.055,P.dark);for(const zz of [-15.9,-11.4,-6.9]){const pane=box(court,x,1,zz,.025,1.9,1.15,P.sky);pane.material=glass;pane.castShadow=false;pane.receiveShadow=false;}}
      for(const zz of [-16.15,-6.65]){const pane=box(court,11.4,1,zz,7,.025,1,P.sky);pane.scale.set(7,1.9,.025);pane.material=glass;pane.castShadow=false;pane.receiveShadow=false;box(court,11.4,2,zz,7,.045,.045,P.dark);}
      for(let i=0;i<24;i++)box(court,8.05+i*.285,.55,-11.4,.012,.8,.015,P.dark);for(let j=0;j<5;j++)box(court,11.4,.2+j*.18,-11.4,6.8,.012,.015,P.dark);box(court,11.4,1,-11.4,6.8,.045,.06,P.white);
      const tennisBall=ball(court,11.4,.45,-11.4,.09,0xe3e56a);tennisBall.name='Pelota de pádel';tennisBall.visible=false;
      for(let i=0;i<n('padelKit');i++){const rack=group(court,15,.2,-7.2-i*.65,'padelKit');box(rack,0,.3,0,.3,.6,.4,P.oak);ball(rack,0,.8,0,.16,[P.rose,P.gold,P.sage][i],1,1.2,.2);box(rack,0,.53,0,.045,.25,.04,P.dark);}
      if(n('courtLights'))for(const x of [7.6,15.15])for(const zz of n('courtLights')>1?[-15.8,-7.1]:[-15.8]){const light=group(court,x,0,zz,'courtLights');box(light,0,1.6,0,.06,3.2,.06,P.dark);box(light,0,3.25,0,.5,.14,.3,P.gold);box(light,0,3.16,.05,.4,.025,.2,P.white);}
    }
  }
}
