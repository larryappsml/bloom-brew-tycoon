import * as THREE from './vendor/three.module.min.mjs';
import './campus.js';
const C=globalThis.BloomCampus;
// Models and live actors share one continuous, spacing-preserving expansion.
// Simulation coordinates stay save-compatible; all passages grow in the view.
export function arrangeCampus(root,s,kit){
 const {box,cylinder,ball,plant,group,palette:P}=kit;
 root.updateMatrixWorld(true);const entries=[];
 root.traverse(o=>{if(o.isMesh||o.isSprite){const p=o.getWorldPosition(new THREE.Vector3()),b=o.isMesh?new THREE.Box3().setFromObject(o):null,size=b?.getSize(new THREE.Vector3());entries.push({o,p,b,size});}});
 for(const {o,p,b,size}of entries){
  // Shared old foundations and divider strips are replaced by separate wings.
  let oldDoor=false;for(let parent=o.parent;parent;parent=parent.parent)if(parent.name==='Acceso antiguo')oldDoor=true;
  const shared=size&&Math.abs(p.z)<.1&&size.x>14&&size.z>12&&p.y<.2;
  const divider=p.x>.35&&p.x<.9&&p.z>-5.4&&p.z<4&&p.y<1.8;
  const boundary=size&&((p.x>-7.8&&p.x<-7&&size.x<.7)||(p.x>6.9&&p.x<7.9&&size.x<.7))&&size.y>.35;
  if(shared||divider||boundary||oldDoor){o.removeFromParent();continue;}
  const pos=new THREE.Vector3(C.x(p.x),p.y,C.z(p.z));
  // Keep road, pavement and long rails continuous across the wider campus.
  if(size&&size.x>5){const lo=C.x(b.min.x),hi=C.x(b.max.x);pos.x=(lo+hi)/2;o.scale.x*=(hi-lo)/size.x;}
  o.position.copy(o.parent.worldToLocal(pos));
 }
 const hall=group(root);hall.name='Paseo central · todas las salas';
 const rect=(x,z,w,d,color=P.cream,y=.14)=>box(hall,x,y,z,w,.08,d,color);
 const a=C.x(-.4),b=C.x(1.05),c=C.x(6.9),d=C.x(7.9),rear=-7.7;
 // Full-height central and right galleries, plus a rear cross passage.
 rect((a+b)/2,-3.5,b-a,22);rect((c+d)/2,-3.5,d-c,23);
 rect((C.x(-14.1)+C.x(.2))/2,rear,C.x(.2)-C.x(-14.1),3);
 rect((c+C.x(15.4))/2,rear,C.x(15.4)-c,3);
 rect((C.x(-7.8)+C.x(-7))/2,-13,C.x(-7)-C.x(-7.8),10.5);
 // The café lounge and the pilates extension remain a single continuous room.
 rect((C.x(-7.8)+C.x(-7))/2,0,C.x(-7)-C.x(-7.8),12.3,P.oak,.04);
 rect((b+c)/2,rear,c-b,3,P.mint,.04);
 rect((C.x(-7.4)+a)/2,0,a-C.x(-7.4),12.3,P.cream,.02);
 rect((b+c)/2,0,c-b,12.3,P.mint,.02);
 // Recovery is now two distinct treatment rooms around its own cross corridor.
 rect((d+C.x(14.1))/2,-3.65,C.x(14.1)-d,5.1,P.mint,.12);rect((d+C.x(14.1))/2,3.65,C.x(14.1)-d,5.1,0xf0dbd5,.12);
 rect((d+C.x(14.1))/2,0,C.x(14.1)-d,2.2);
 for(const zz of [-1.2,1.2])for(const xx of [8.15,13.45])box(hall,C.x(xx),.42,zz,.9,.75,.12,P.cream);
 // Clear paving and edge lighting make the hierarchy legible without labels.
 for(const [xx,zz,ww,dd]of [[(a+b)/2,-3.5,.06,22],[(c+d)/2,-3.5,.06,23],[(C.x(-14.1)+a)/2,rear,a-C.x(-14.1),.05]])rect(xx,zz,ww,dd,P.gold,.19);
 for(const [xx,zz]of [[a+.24,4.8],[b-.24,-3.8],[c+.25,4.7],[d-.25,-4.5],[C.x(-7.8)+.3,-15.8]]){cylinder(hall,xx,1.3,zz,.035,2.4,P.dark);ball(hall,xx,2.55,zz,.16,P.gold);}
 const court=group(hall);court.name='Vestíbulo y jardines';
 for(const [xx,zz]of [[a-.65,5.4],[c+.2,-15.8],[C.x(-13.5),-7.7]]){plant(court,xx,zz,.65);box(court,xx+.8,.35,zz,.8,.13,.45,P.wood);}
 // New entrance is aligned to the main promenade rather than the old shared wall.
 rect((a+b-.6)/2,6.1,b-a+.6,1.6);const door=group(hall,(a+b-.6)/2,0,6.15);for(const side of [-1,1])box(door,side*(b-a+.6)/2,1.1,0,.11,2.2,.12,P.dark);box(door,0,2.3,0,b-a+.95,.15,.55,P.sage);
 return hall;
}
export function projectActors(objects){const saved=[];for(const o of new Set(objects.filter(o=>o?.position))){saved.push([o,o.position.x,o.position.z]);o.position.x=C.x(o.position.x);o.position.z=C.z(o.position.z);}return saved;}
export function restoreActors(saved){for(const [o,x,z]of saved){o.position.x=x;o.position.z=z;}}
