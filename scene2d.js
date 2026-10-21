(function () {
  'use strict';
  const colors=['#9c6e57','#b98469','#674d44','#d0a581'];
  class VenueScene {
    constructor(canvas,getState) {
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.getState=getState;
      this.people=new Map();this.time=0;this.last=0;
      this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.resize=()=>{const dpr=Math.min(devicePixelRatio||1,2);canvas.width=360*dpr;canvas.height=270*dpr;this.ctx.setTransform(dpr,0,0,dpr,0,0);};
      this.resize();this.frame=this.frame.bind(this);requestAnimationFrame(this.frame);
    }
    point(x,y,z=0){const c=window.BloomCampus;if(c){x=(c.x(x*2.1-7.35)+7.35)/2.1;y=(c.z(y*1.77-6.2)+6.2)/1.77;}return [180+(x-y)*21,42+(x+y)*13-z];}
    poly(points,fill,stroke) {const c=this.ctx;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
    tile(x,y,w,d,z,color) {this.poly([this.point(x,y,z),this.point(x+w,y,z),this.point(x+w,y+d,z),this.point(x,y+d,z)],color);}
    box(x,y,w,d,h,top='#dbb18c',side='#b48663') {
      this.poly([this.point(x,y+d),this.point(x+w,y+d),this.point(x+w,y+d,h),this.point(x,y+d,h)],side);
      this.poly([this.point(x+w,y),this.point(x+w,y+d),this.point(x+w,y+d,h),this.point(x+w,y,h)],'#a97858');
      this.tile(x,y,w,d,h,top);
    }
    ellipse(x,y,rx,ry,fill) {const c=this.ctx;c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
    plant(x,y,size=1) {
      const [px,py]=this.point(x,y),c=this.ctx;
      this.ellipse(px,py+1,8*size,3*size,'#41573b20');
      c.fillStyle='#c99373';c.fillRect(px-4*size,py-7*size,8*size,8*size);
      c.strokeStyle='#547d57';c.lineWidth=2;c.beginPath();c.moveTo(px,py-7*size);c.lineTo(px,py-24*size);c.stroke();
      this.ellipse(px-5*size,py-19*size,6*size,3*size,'#789f72');this.ellipse(px+5*size,py-24*size,6*size,3*size,'#527c59');
    }
    person(x,y,kind,working=false,t=0,role='cafe',activity=null) {
      const [px,py]=this.point(x,y),c=this.ctx,bob=this.reduced?0:Math.sin(t*(activity?.moving?9:1.65)+kind)*(activity?.moving?1.1:.25);
      this.ellipse(px,py,6,2.5,'#3d473723');
      c.strokeStyle='#5c594f';c.lineWidth=2.5;c.lineCap='round';c.beginPath();c.moveTo(px-2,py-6);c.lineTo(px-3+(this.reduced||!activity?.moving?0:Math.sin(t*9+kind)*3),py);c.moveTo(px+2,py-6);c.lineTo(px+3-(this.reduced||!activity?.moving?0:Math.sin(t*9+kind)*3),py);c.stroke();
      c.fillStyle=role==='premium'?'#293847':role==='padel'?'#fff3db':role==='crossfit'?'#47624e':role==='wellness'?'#f4e9d4':role==='pilates'?'#b898b2':role==='yoga'?'#9dafa0':working?'#527b61':['#c18c79','#8da0b0','#b1a178','#a79bb4'][kind%4];
      c.beginPath();c.roundRect(px-5,py-17+bob,10,12,4);c.fill();
      this.ellipse(px,py-22+bob,4.5,5,colors[kind%4]);
      c.fillStyle='#524339';c.beginPath();c.arc(px,py-24+bob,4.5,Math.PI,Math.PI*2);c.fill();
      c.fillStyle='#344b55';for(const side of [-1,1]){c.fillRect(px+side*2-1,py-22+bob,1.5,1.5);}
      if(role==='premium'){c.fillStyle='#fff8e6';c.fillRect(px-2,py-16,4,7);c.fillStyle='#9d5261';c.fillRect(px-.6,py-15,1.2,6);}
      const gesture=this.reduced?0:Math.sin(t*2+kind);c.strokeStyle=c.fillStyle;c.lineWidth=3;c.beginPath();for(const side of [-1,1]){c.moveTo(px+side*4,py-14+bob);const raised=activity?.stage==='active'&&role==='yoga';c.lineTo(px+side*(raised?8:6),py+(raised?-22-gesture*2:activity?.stage==='consuming'?-15-gesture*2:working?-12+gesture*2:-8+bob));}c.stroke();
      if(working){c.fillStyle='#f4e9d6';c.fillRect(px-3,py-13,6,7);}
    }
    text(text,x,y,color='#68725c',size=9) {const c=this.ctx;c.fillStyle=color;c.font=`600 ${size}px system-ui`;c.textAlign='center';c.fillText(text,x,y);}
    draw(s,t,dt) {
      const c=this.ctx,B=window.Bloom,l=id=>B.level(s,id),p=B.params(s),clocks=[];
      c.clearRect(0,0,360,270);
      const gradient=c.createLinearGradient(0,0,0,270);gradient.addColorStop(0,'#e4e8dc');gradient.addColorStop(1,'#f2e6d1');c.fillStyle=gradient;c.fillRect(0,0,360,270);
      c.save();const expanded=window.BloomLayout.ROOMS.some(r=>l(r.id+'Wing'));if(expanded){const f=window.BloomLayout.footprint(s),points=[[f.left,f.back],[f.right,f.back],[f.left,10],[f.right,10]].map(([x,z])=>this.point((x+7.35)/2.1,(z+6.2)/1.77)),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),scale=Math.min(.68,320/(Math.max(...xs)-Math.min(...xs)),220/(Math.max(...ys)-Math.min(...ys)));c.translate(180,140);c.scale(scale,scale);c.translate(-(Math.min(...xs)+Math.max(...xs))/2,-(Math.min(...ys)+Math.max(...ys))/2);}else{c.translate(180,135);c.scale(.68,.68);c.translate(-180,-135);}
      const zones=window.BloomLayout.zones(s);
      const roomColors={cycling:'#344b55',nails:'#f5dfd9',beauty:'#e9b77a',thermal:'#b7c4ad',boxing:'#344b55',cold:'#dcebed',cowork:'#e9b77a',pool:'#b1deea',golf:'#86bd7d',dance:'#e9a998'};
      if(expanded)for(const [x,z,w,d]of [[3,-17.7,40,2],[-2,-28.7,30,2],[-7,-23.2,2,13],[3,-23.2,2,13],[13,-23.2,2,13],[-15.35,-4.1,2.15,27]])this.tile((x-w/2+7.35)/2.1,(z-d/2+6.2)/1.77,w/2.1,d/1.77,2,'#fff3d7');
      for(const r of window.BloomLayout.ROOMS)if(l(r.id+'Wing')){const q={x:(r.x+7.35)/2.1,y:(r.z+6.2)/1.77};this.box(q.x-r.width/2/2.1,q.y-r.depth/2/1.77,r.width/2.1,r.depth/1.77,5,roomColors[r.id]);for(const spot of window.BloomLayout.serviceSlots(s,r.id)){const x=(spot.x+7.35)/2.1,y=(spot.z+6.2)/1.77;this.box(x-.3,y-.35,.6,.7,8,r.id==='nails'?'#d39aaa':r.id==='boxing'?'#a46c59':'#a7c9bd');this.text(r.icon,...this.point(x,y,14),'#345e54',9);}}

      this.tile(-5,8.8,17,2.1,0,'#78868a');this.tile(-5,7.5,17,1.3,1,'#e3dfd0');
      for(let i=-4;i<11;i+=3)this.tile(i,9.75,1.3,.08,1,'#fff4cf');
      if(zones.cafe)this.box(-3.3,0,3.3,7,5,'#edcda7');
      if(zones.wellness){this.box(7,0,3.4,7,5,'#d4e4da');for(const id of ['pressotherapy','massage'])for(let i=0;i<Math.min(2,l(id));i++){const x=7.35+i*1.45,y=id==='pressotherapy'?1:4.3;this.box(x,y,1,1.8,12,id==='pressotherapy'?'#92bfa8':'#d4aca0');this.tile(x+.1,y+.1,.8,.35,15,'#fff0d4');}}
      if(zones.yoga){this.box(0,-3.4,3.7,3.4,5,'#e5cab9');for(let i=0;i<Math.min(6,l('yoga')*2);i++)this.tile(.3+(i%3)*1.1,-2.9+Math.floor(i/3)*1.5,.7,1.1,7,'#c797a1');}
      if(zones.studio)this.box(3.7,-3.4,3.3,3.4,5,'#c7dfcf');
      if(zones.crossfit){this.box(-3.3,-4.8,3.2,4.8,5,'#c6b89e');for(const spot of window.BloomLayout.sportSlots(s,'crossfit')){const q={x:(spot.x+7.35)/2.1,y:(spot.z+6.2)/1.77};this.tile(q.x-.25,q.y-.4,.5,.8,7,'#416658');}}
      if(zones.padel){this.box(7,-5.8,3.8,5.8,5,'#72aaa1');this.box(7.15,-3,3.5,.04,19,'#f1e7c8');for(const x of [7.1,10.65])this.box(x,-5.5,.03,5.3,8,'#f6efdb');}
      this.ellipse(180,241,155,27,'#b09b7a20');
      // A continuous 2.5D floor and two back walls; no external image assets.
      this.box(0,0,7,7,5,'#d8bd97','#b99a76');
      this.poly([this.point(0,0,5),this.point(7,0,5),this.point(7,0,68),this.point(0,0,68)],'#dfd6bc');
      this.poly([this.point(0,0,5),this.point(0,7,5),this.point(0,7,68),this.point(0,0,68)],'#eee6d4');
      for(let x=0;x<7;x++)for(let y=0;y<7;y++){if(x>=4)this.tile(x,y,.97,.97,5,l('mat')?'#d9dfc9':'#d8d2c5');else for(let j=0;j<3;j++)this.tile(x+((x+y)%2?0:j*.32),y+((x+y)%2?j*.32:0),(x+y)%2?.97:.30,(x+y)%2?.30:.97,5,['#e4c298','#efcfaa','#e8cba5'][(x+y+j)%3]);}
      // Windows, botanical sign and warm pendants.
      this.poly([this.point(0,1,24),this.point(0,3.2,24),this.point(0,3.2,57),this.point(0,1,57)],'#a5bdb1','#c7b393');
      this.poly([this.point(4.6,0,22),this.point(6.5,0,22),this.point(6.5,0,54),this.point(4.6,0,54)],'#9db6aa','#c7b393');
      this.text('bloom & brew',180,25,'#51684e',13);
      if(s.chapters?.length)this.text('🏆'.repeat(Math.min(6,s.chapters.length)),180,39,'#ad8239',10);
      if(s.campaign&&s.campaign.remaining>0)this.text(s.campaign.id==='coffee'?'CLUB DEL CAFÉ':s.campaign.id==='brunch'?'BRUNCH EN BLOOM':'TARDE WELLNESS',180,251,'#54794f',9);
      for(const [x,y] of [[1.4,1.8],[3.1,1.8]]) {
        const [px,py]=this.point(x,y,57);c.strokeStyle='#9e8c6d';c.lineWidth=1;c.beginPath();c.moveTo(px,py-18);c.lineTo(px,py);c.stroke();
        this.ellipse(px,py+9,20,10,'#ffe9ac24');this.ellipse(px,py,7,3,'#c5a471');
      }
      this.box(.5,1,2.9,.7,20,'#e2b68c','#ac7d5b');
      this.box(.7,1.05,.6,.4,34,l('machine')?'#799788':'#777d6d','#65725f');
      const [mx,my]=this.point(1,1.6,32);c.fillStyle='#fff8e8';c.fillRect(mx-2,my-2,4,5);
      if(s.queue.some(o=>o.remaining!==null)) {for(let i=0;i<3;i++)this.ellipse(mx+(i-1)*4,my-9-((t*9+i*5)%13),1.5,3,'#fff9edaa');}
      if(l('pastries'))this.box(2.15,1.04,.8,.45,31,'#d9e1d1','#b99573');
      if(l('matcha')){this.box(3.45,.55,.4,.5,18,'#a2b49a','#6b8970');this.text('🍵',...this.point(3.65,.8,22),'#668660',10);}
      if(l('brewBar'))for(let i=0;i<Math.min(3,l('brewBar'));i++)this.box(.5+i*.42,.35,.3,.25,23,'#f6e8cf','#a28b5d');
      if(l('bakeryOven')){this.box(3.2,.15,.7,.7,27,'#627a6d','#435b54');for(let i=0;i<Math.min(3,l('bakeryOven'));i++)this.text('—',...this.point(3.6,.8,9+i*6),'#e4b570',9);}
      if(l('tableService')){this.box(.15,5.4,.35,.5,17,'#d6b68b','#8b7254');for(let i=0;i<Math.min(3,l('tableService'));i++)this.box(.18,5.43+i*.12,.27,.09,20,'#fff5df','#d6cbb5');}
      if(l('latteBar')){this.box(.7,.3,.65,.5,24,'#d6ab83','#657b64');this.text('🥛',...this.point(1,.5,30),'#668660',12);}
      if(l('cakeDisplay')){this.box(2,.3,.65,.5,23,'#b7d5be','#a78060');this.text('🍰',...this.point(2.3,.5,30),'#668660',12);}
      if(l('toastKitchen')){this.box(.2,6.2,.4,.45,19,'#dab98b','#785744');this.text('🥑',...this.point(.4,6.4,25),'#668660',11);}
      if(l('cafeLounge'))this.box(-2.5,5.8,2,.6,15,'#d8a098','#b57e6f');
      this.plant(.35,.4,1.2);this.plant(.3,6.3,1.3);
      const map=p=>({x:(p.x+7.35)/2.1,y:(p.z+6.2)/1.77});
      for(const [x,z] of window.BloomLayout.tables(s)) {const q=map({x,z});this.box(q.x-.3,q.y-.3,.6,.6,13,'#f3e5c9','#bf9772');this.plant(q.x,q.y,.3);}
      for(const seat of window.BloomLayout.cafeSeats(s)){const q=map(seat);this.box(q.x-.12,q.y-.12,.24,.24,7,'#9baf90','#788c70');}
      if(l('mat')) {
        for(const spot of window.BloomLayout.pilates(s)) {const q=map(spot);if(spot.premium){this.box(q.x-.15,q.y-.4,.4,.9,8,'#e8d8be','#8b927c');this.tile(q.x-.1,q.y-.3,.3,.7,10,'#899980');}else this.tile(q.x-.15,q.y-.4,.4,.9,7,'#a7b8a0');}
        this.plant(6.7,.5,.9);this.plant(6.7,6.2,.9);
        if(l('coach'))this.person(6.5,1.4,2,true,t);
        if(l('spa'))this.box(4.1,.4,1.2,.45,18,'#b7c6a4','#93a07f');
        for(let i=0;i<Math.min(3,l('pilatesKit'));i++)this.box(6.5,2+i*.65,.3,.4,10,'#d7a28d','#9a8469');
        for(let i=0;i<Math.min(3,l('studioMirror'));i++)this.box(4+i*.8,.2,.65,.08,44,'#b3cdcd','#bda384');
      } else {
        this.text('Respira. Tu próxima aventura',252,180,'#8f917d',8);this.text('Estudio desde 850 €',252,195,'#828774',9);
      }
      for(let i=0;i<p.baristas;i++)this.person(1+i*.75,.75,i,true,t);
      if(!p.baristas&&s.queue.some(o=>o.remaining!==null))this.person(1.8,.8,0,true,t);
      const actors=window.BloomTraffic.agents(s).filter(a=>a.position).sort((a,b)=>(a.position.x+a.position.z)-(b.position.x+b.position.z));
      for(const agent of actors){const q=map(agent.position);let activity=null,kind=null;
        if(agent.type==='treatment'&&agent.stage==='active'&&['pressotherapy','massage'].includes(agent.service)) {const [px,py]=this.point(q.x,q.y,16);this.ellipse(px,py,4,4,colors[agent.kind]);c.fillStyle='#54765e';c.fillRect(px-3,py+3,6,12);if(agent.service==='pressotherapy'){c.fillStyle='#a1d4be';c.fillRect(px-6,py+12,5,10);c.fillRect(px+1,py+12,5,10);}}
        else this.person(q.x,q.y,agent.kind,false,t,agent.outfit||agent.sport||(agent.type==='pilates'?'pilates':agent.service==='yoga'?'yoga':agent.type==='treatment'?'wellness':'cafe'),agent);
        if(agent.type==='sport'&&agent.stage==='playing'){const g=s.sportsGroups[agent.sport];activity={remaining:g.remaining,duration:g.duration};kind=agent.sport;if(agent.sport==='padel')this.text('🎾',...this.point(q.x+.25,q.y,15),'#567c58',10);else{const [px,py]=this.point(q.x,q.y,12);c.fillStyle='#344c48';c.fillRect(px-8,py,16,3);}}

        if(agent.type==='cafe'&&agent.stage==='preparing'&&agent.remaining>0){activity=agent;kind='prepare';}
        if(agent.stage==='consuming'){activity=agent;kind='consume';}
        if(agent.type==='pilates'&&agent.stage==='exercising'){activity={remaining:s.classRemaining,duration:s.classDuration};kind='pilates';}
        if(agent.type==='treatment'&&agent.stage==='active'){activity=agent;kind=agent.service;}
        if(agent.type==='cafe'&&agent.stage==='consuming'){const seat=agent.seat,table=seat?.table>=0?window.BloomLayout.tables(s)[seat.table]:null;if(table){const at=map({x:table[0]+(seat.x<table[0]?-.34:.34),z:table[1]+.22});const [px,py]=this.point(at.x,at.y,14);this.ellipse(px,py,5,2,'#fff9ec');this.text(B.PRODUCTS.find(p=>p.id===agent.product)?.icon||'☕',px,py+2,'#37684d',10);}}
        if(agent.type==='pilates'&&agent.stage==='exercising'&&l('pilatesBands')){const [px,py]=this.point(q.x,q.y,14);c.strokeStyle='#bf78a0';c.lineWidth=2;c.beginPath();c.moveTo(px-7,py);c.lineTo(px+7,py);c.stroke();}
        if(agent.type==='treatment'&&agent.stage==='active'&&((agent.service==='yoga'&&l('soundRitual'))||(agent.service==='massage'&&l('aromaMassage'))))this.text(agent.service==='yoga'?'🔔':'🪻',...this.point(q.x+.35,q.y,18),'#668660',10);
        if(activity){const [px,py]=this.point(q.x,q.y,45);clocks.push({x:px,y:py,remaining:activity.remaining,duration:activity.duration,kind,product:agent.type==='cafe'?agent.product:null});}
      }
      if(l('second')) {this.text(`${1+Math.min(l('second'),2)} LOCALES · TU COMUNIDAD CRECE`,180,262,'#667a5f',8);}
      for(const clock of clocks)window.BloomClocks.drawClock(c,clock.x,clock.y,clock.remaining,clock.duration,clock.kind,11,clock.product);
      c.restore();
    }
    frame(now) {
      requestAnimationFrame(this.frame);
      if(document.hidden||!this.canvas.closest('.view.active')){this.last=now;return;}
      if(now-this.last<(this.reduced?200:33))return;
      const dt=Math.min(1,(now-this.last)/1000||.033);this.last=now;this.time+=dt;
      this.draw(this.getState(),this.time,dt);
    }
  }
  window.VenueScene2D=VenueScene;
})();

