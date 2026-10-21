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
    const cycle=reduced?0:Math.sin(time*5+id*.2),slow=reduced?0:Math.sin(time*1.3+id);
    if(target.service==='pool'){
      const wave=reduced?0:Math.sin(time*1.2+id),direction=reduced?1:Math.cos(time*1.2+id);p.root.rotation.set(-Math.PI/2,0,direction>0?Math.PI:0);p.root.position.y=.55;
      const desired=target.z-5.65+wave*2.8;const elapsed=(target.treatment.duration||68)-target.treatment.remaining;p.root.position.z=target.z+(desired-target.z)*(reduced?1:Math.min(1,elapsed/2));
      p.body.rotation.x=0;p.arms.forEach((a,i)=>{a.rotation.x=reduced?-.4:Math.sin(time*4+i*Math.PI)*1.2;a.rotation.z=(i?1:-1)*.3;});p.legs.forEach((l,i)=>l.rotation.x=reduced?0:Math.sin(time*6+i*Math.PI)*.16);
    }else if(target.service==='golf'){
      const shot=reduced?0:(time*.2+id*.17)%1,backswing=shot<.15?shot/.15:Math.max(0,1-(shot-.15)/.3);p.body.rotation.y=backswing*.5;p.arms.forEach(a=>a.rotation.x=-.2-backswing*1.1);p.arms[1].rotation.z=-backswing*.6;p.knees.forEach(k=>k.rotation.x=.12);
    }else if(target.service==='dance'){
      const beat=reduced?0:Math.sin(time*6.2);p.root.position.x=target.x+beat*.17;p.body.rotation.z=beat*.055;p.arms.forEach((a,i)=>{a.rotation.z=(i?1:-1)*(.6+beat*.35);a.rotation.x=-.15;});p.legs.forEach((l,i)=>l.rotation.x=(i?1:-1)*beat*.2);p.knees.forEach(k=>k.rotation.x=.12+Math.abs(beat)*.12);
    }else if(target.service==='cycling'){

      p.root.position.y=.37;p.body.rotation.x=.17;p.body.position.y=.47+Math.abs(cycle)*.012;
      p.legs.forEach((l,i)=>l.rotation.x=-1.18+(i?-1:1)*cycle*.48);
      p.knees.forEach((k,i)=>{k.rotation.x=1.25+(i?1:-1)*cycle*.38;k.scale.y=1.35;});
      p.arms.forEach(a=>a.rotation.x=-1.12);
    }else if(['nails','beauty','cowork'].includes(target.service)){
      p.root.position.y=.16;p.legs.forEach(l=>l.rotation.x=-1.4);p.knees.forEach(k=>{k.rotation.x=1.4;k.scale.y=1.35;});
      if(target.service==='nails'){p.arms[0].rotation.x=-.95;p.arms[1].rotation.x=-.95;p.body.rotation.x=.06;}
      if(target.service==='beauty'){p.arms.forEach(a=>a.rotation.x=-.3);p.body.rotation.x=.015;p.body.rotation.z=slow*.018;}
      if(target.service==='cowork'){p.arms.forEach((a,i)=>a.rotation.x=-.94+(reduced?0:Math.sin(time*7+i*Math.PI)*.045));p.body.rotation.x=.09;}
    }else if(target.service==='boxing'){
      const jab=reduced?0:Math.pow(Math.max(0,Math.sin(time*4.2+id)),4),cross=reduced?0:Math.pow(Math.max(0,Math.sin(time*4.2+id-1.8)),4);
      p.arms[0].rotation.x=-.7-jab*1.05;p.arms[1].rotation.x=-.75-cross*.95;
      p.arms[0].rotation.z=-.18;p.arms[1].rotation.z=.18;p.body.rotation.y=(jab-cross)*.18;p.body.rotation.z=(jab-cross)*.045;
      p.body.position.y=.47+(reduced?0:Math.abs(Math.sin(time*4.2+id))*.025);p.knees.forEach(k=>k.rotation.x=.2);
    }else if(['thermal','cold'].includes(target.service)){
      p.root.position.y=-.05;p.legs.forEach(l=>l.rotation.x=-1.2);p.arms.forEach((a,i)=>{a.rotation.x=-.25;a.rotation.z=(i?1:-1)*.4;});p.body.rotation.x=.025;
      if(target.service==='cold')p.body.position.y=.47+(reduced?0:Math.sin(time*2+id)*.008);
    }
  }
  if((target.sport!=='padel'||target.athlete?.stage!=='playing')&&!(['boxing','golf'].includes(target.service)&&target.treatment?.stage==='active'))p.body.rotation.y=0;
  const joints=[p.root,p.body,...p.legs,...p.knees,...p.arms],blend=reduced?1:1-Math.exp(-Math.min(dt,.15)*12);
  if(previous)joints.forEach((o,i)=>{for(const axis of ['x','y','z'])o.rotation[axis]=turn(previous[i][axis],o.rotation[axis],blend);});
}
export function animateStaff(p,role,active,time,reduced){
  if(!p.body)return;
  const wave=reduced?0:Math.sin(time*(role==='cafe'?3.8:role==='nails'?5:role==='beauty'?2.5:1.5));
  p.body.position.y=.47+(reduced?0:Math.sin(time*1.6)*.008);
  if(p.legs){const walk=reduced||!p.staffMoving?0:Math.sin(time*9)*.3;p.legs[0].rotation.x=walk;p.legs[1].rotation.x=-walk;p.knees?.forEach(k=>k.rotation.x=0);}
  p.body.rotation.x=active?.035:0;p.body.rotation.z=active?wave*.025:0;
  p.arms.forEach((a,i)=>{a.rotation.x=active?-.5+wave*(i?-.22:.3):-.08;a.rotation.z=active&&role!=='cafe'?(i?1:-1)*(.35+wave*.12):0;if(active&&role==='nails'){a.rotation.x=-.95+wave*.04;a.rotation.z=(i?1:-1)*.12;}if(active&&role==='beauty'){a.rotation.x=-1.05+wave*.16;a.rotation.z=(i?1:-1)*.2;}});
}
