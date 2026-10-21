import './campus.js';
import './activities.js';
import {Group} from './vendor/three.module.min.mjs';
export function cartPose(time,reduced=false){
 const points=[[-24,11.3],[24,11.3],[24,-13],[-24,-13]],lengths=points.map((p,i)=>Math.hypot(p[0]-points[(i+1)%4][0],p[1]-points[(i+1)%4][1])),total=lengths.reduce((a,b)=>a+b,0);
 let distance=reduced?0:((time*1.7)%total+total)%total;for(let i=0;i<4;i++){if(distance<=lengths[i]){const a=points[i],b=points[(i+1)%4],f=distance/lengths[i];return {x:a[0]+(b[0]-a[0])*f,z:a[1]+(b[1]-a[1])*f,heading:Math.atan2(b[0]-a[0],b[1]-a[1])};}distance-=lengths[i];}
}
export function buildGolfCart(K){
 const {box,cylinder,ball,palette:P}=K,g=new Group();g.name='Carrito de golf';g.userData.zone='golfDecor';
 box(g,0,.48,0,1.3,.28,2.3,P.sage);box(g,0,.72,.9,1.28,.4,.4,P.cream);box(g,0,.8,-.85,1.28,.4,.45,P.sage);box(g,0,.34,0,1.18,.1,2.5,P.dark);
 for(const x of [-.71,.71])for(const z of [-.75,.75]){const wheel=cylinder(g,x,.3,z,.29,.16,P.dark,12);wheel.rotation.z=Math.PI/2;const hub=cylinder(g,x*1.025,.3,z,.14,.17,P.gold,12);hub.rotation.z=Math.PI/2;}
 for(const x of [-.55,.55])for(const z of [-.85,.85])box(g,x,1.25,z,.055,1.5,.055,P.gold);box(g,0,2.03,0,1.55,.13,2.6,P.cream);
 box(g,0,.78,-.1,1,.2,.65,P.rose);box(g,0,1.06,-.4,1,.55,.13,P.rose);box(g,0,1.03,.7,1.1,.12,.25,P.dark);
 for(const x of [-.4,.4])box(g,x,.8,1.13,.23,.15,.035,P.gold);
 // A seated groundskeeper makes the moving cart read as a vehicle, not a prop.
 box(g,-.25,1.13,-.05,.38,.55,.3,P.sage);ball(g,-.25,1.57,-.02,.2,P.oak);ball(g,-.25,1.72,-.02,.23,P.cream,1,.25,1);box(g,-.25,1.7,.15,.35,.025,.22,P.cream);
 for(const x of [-.4,-.1]){const arm=box(g,x,1.2,.25,.09,.1,.45,P.oak);arm.rotation.x=-.15;box(g,x,.73,.28,.12,.13,.5,P.dark);}
 for(const x of [-.3,.3]){cylinder(g,x,.8,-1.05,.17,.75,P.rose,12);for(let i=0;i<3;i++){box(g,x+(i-1)*.08,1.35,-1.05,.025,.7,.025,P.gold);box(g,x+(i-1)*.08,1.7,-1.05,.12,.07,.06,P.dark);}}
 return g;
}
export function animateGolfCart(cart,time,reduced=false){const r=globalThis.BloomActivities.find(r=>r.id==='golf'),p=cartPose(time,reduced),C=globalThis.BloomCampus;cart.position.set(C.x(r.x+p.x),.03,C.z(r.z+p.z));cart.rotation.y=p.heading;return p;}
