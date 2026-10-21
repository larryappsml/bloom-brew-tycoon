// Visual poses only: never write to simulation actors, clocks or room capacity.
const tau=Math.PI*2;
export const ease=(a,b,t)=>a+(b-a)*t;
export function turn(a,b,t){return a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;}
export function rally(time,reduced=false){
  const phase=reduced?.5:((time*.65)%1+1)%1;
  const leg=phase<.5?phase*2:(1-phase)*2;
  return {x:11.2+Math.sin(time*.65*Math.PI)*1.25*(reduced?0:1),y:.45+Math.sin(leg*Math.PI)*1.55,z:-14.4+leg*6};
}
export function snapshot(p){return [p.root,p.body,...p.legs,...p.knees,...p.arms].map(o=>({x:o.rotation.x,y:o.rotation.y,z:o.rotation.z}));}
export function animatePose(p,target,time,dt,reduced,previous){
  const id=Number(target.agent.id)||0,phase=time*2+id*.79;
  const wave=reduced?0:Math.sin(phase),breath=reduced?0:Math.sin(time*1.65+id)*.009;
  p.body.rotation.z=0;p.body.position.y+=breath;
  if(target.agent.moving){
    // Rounded strides and opposing shoulders; no displacement outside the real path.
    const stride=reduced?0:Math.sin(time*9+id*.79);
    p.legs[0].rotation.x=stride*.38;p.legs[1].rotation.x=-stride*.38;
    p.knees[0].rotation.x=Math.max(0,-stride)*.38;p.knees[1].rotation.x=Math.max(0,stride)*.38;
    p.body.rotation.z=stride*.025;p.body.rotation.x=.035;
    p.arms[0].rotation.x=-stride*.28;p.arms[1].rotation.x=p.serving?-.85:stride*.28;
  }else if(target.guest?.stage==='consuming'){
    const bite=reduced?0:Math.pow(Math.max(0,Math.sin(time*1.7+id)),3);
    p.arms[1].rotation.x=-.7-bite*.85;p.body.rotation.x=.045+bite*.055;
  }else if(target.treatment?.stage==='active'&&target.service==='yoga'){
    const stretch=reduced?.5:(1+Math.sin(time*.65+id*.2))*.5;
    p.arms[0].rotation.z=-.55-stretch*1.8;p.arms[1].rotation.z=.55+stretch*1.8;
    p.body.rotation.z=wave*.045;p.legs[0].rotation.x=.18;
  }else if(target.pilates?.stage==='exercising'){
    // Shared class rhythm with small offsets instead of unrelated flailing.
    const stretch=reduced?.4:(1+Math.sin(time*1.35+id*.12))*.5;
    p.legs.forEach(l=>l.rotation.x=.1+stretch*.48);
    p.knees.forEach(k=>k.rotation.x=.12+stretch*.3);
    p.arms.forEach(a=>a.rotation.x=-.12-stretch*.35);
  }else if(target.athlete?.stage==='playing'){
    if(target.sport==='crossfit'){
      const lift=reduced?.5:(1-Math.cos(time*2.2+id*.18))*.5;
      p.body.position.y=.47-lift*.14;p.body.rotation.x=lift*.12;
      p.legs.forEach(l=>l.rotation.x=-lift*.28);p.knees.forEach(k=>k.rotation.x=lift*.58);
      p.arms.forEach(a=>a.rotation.x=-.35-lift*.9);
    }else{
      const hit=reduced?0:Math.pow(Math.max(0,Math.cos(time*.65*tau+(target.z<-11.4?0:Math.PI))),6);
      p.arms[1].rotation.x=-.35-hit*1.15;p.arms[1].rotation.z=-.2-hit*.3;
      p.body.rotation.y=hit*.22;p.knees.forEach(k=>k.rotation.x=.12+hit*.15);
    }
  }
  if(target.treatment?.stage==='active'){
    if(['cycling','nails','beauty','cowork'].includes(target.service)){
      p.root.position.y=target.service==='cycling'?.35:.05;p.legs.forEach((l,i)=>l.rotation.x=-1.25+(target.service==='cycling'&&!reduced?Math.sin(time*5+i*Math.PI)*.35:0));p.knees.forEach(k=>{k.rotation.x=1.35;k.scale.y=1.4;});
      p.arms.forEach((a,i)=>a.rotation.x=target.service==='cycling'?-1.05:-.8+(reduced?0:Math.sin(time*3+i)*.07));
    }else if(target.service==='boxing'){
      p.arms.forEach((a,i)=>a.rotation.x=-.7-(reduced?.3:Math.pow(Math.max(0,Math.sin(time*4+i*Math.PI)),3))*.9);p.body.rotation.z=wave*.045;p.knees.forEach(k=>k.rotation.x=.15);
    }else if(['thermal','cold'].includes(target.service)){
      p.root.position.y=-.05;p.legs.forEach(l=>l.rotation.x=-1.2);p.arms.forEach(a=>a.rotation.x=-.3);p.body.rotation.x=.04;
    }
  }
  if(target.sport!=='padel'||target.athlete?.stage!=='playing')p.body.rotation.y=0;
  const joints=[p.root,p.body,...p.legs,...p.knees,...p.arms],blend=reduced?1:1-Math.exp(-Math.min(dt,.15)*12);
  if(previous)joints.forEach((o,i)=>{for(const axis of ['x','y','z'])o.rotation[axis]=turn(previous[i][axis],o.rotation[axis],blend);});
}
export function animateStaff(p,role,active,time,reduced){
  if(!p.body)return;
  const wave=reduced?0:Math.sin(time*(role==='cafe'?3.8:1.5));
  p.body.position.y=.47+(reduced?0:Math.sin(time*1.6)*.008);
  p.body.rotation.x=active?.035:0;p.body.rotation.z=active?wave*.025:0;
  p.arms.forEach((a,i)=>{a.rotation.x=active?-.5+wave*(i?-.22:.3):-.08;a.rotation.z=active&&role!=='cafe'?(i?1:-1)*(.35+wave*.12):0;});
}
