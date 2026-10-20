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
    point(x,y,z=0){return [180+(x-y)*21,42+(x+y)*13-z];}
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
    person(x,y,kind,working=false,t=0) {
      const [px,py]=this.point(x,y),c=this.ctx,bob=this.reduced?0:Math.sin(t*5+kind)*.7;
      this.ellipse(px,py,6,2.5,'#3d473723');
      c.strokeStyle='#5c594f';c.lineWidth=2.5;c.lineCap='round';c.beginPath();c.moveTo(px-2,py-6);c.lineTo(px-3,py);c.moveTo(px+2,py-6);c.lineTo(px+3,py);c.stroke();
      c.fillStyle=working?'#527b61':['#c18c79','#8da0b0','#b1a178','#a79bb4'][kind%4];
      c.beginPath();c.roundRect(px-5,py-17+bob,10,12,4);c.fill();
      this.ellipse(px,py-22+bob,4.5,5,colors[kind%4]);
      c.fillStyle='#524339';c.beginPath();c.arc(px,py-24+bob,4.5,Math.PI,Math.PI*2);c.fill();
      if(working){c.fillStyle='#f4e9d6';c.fillRect(px-3,py-13,6,7);}
    }
    text(text,x,y,color='#68725c',size=9) {const c=this.ctx;c.fillStyle=color;c.font=`600 ${size}px system-ui`;c.textAlign='center';c.fillText(text,x,y);}
    draw(s,t,dt) {
      const c=this.ctx,B=window.Bloom,l=id=>B.level(s,id),p=B.params(s);
      c.clearRect(0,0,360,270);
      const gradient=c.createLinearGradient(0,0,0,270);gradient.addColorStop(0,'#e4e8dc');gradient.addColorStop(1,'#f2e6d1');c.fillStyle=gradient;c.fillRect(0,0,360,270);
      c.save();c.translate(180,135);c.scale(.68,.68);c.translate(-180,-135);
      const zones=window.BloomLayout.zones(s);
      this.tile(-5,8.8,17,2.1,0,'#78868a');this.tile(-5,7.5,17,1.3,1,'#e3dfd0');
      for(let i=-4;i<11;i+=3)this.tile(i,9.75,1.3,.08,1,'#fff4cf');
      if(zones.cafe){this.box(-3.3,0,3.3,7,5,'#edcda7');for(let i=0;i<Math.min(6,2+Math.max(0,l('seats')-3)*2);i++)this.box(-2.8+(i%2)*1.5,.7+Math.floor(i/2)*2,.8,.8,13);}
      if(zones.wellness){this.box(7,0,3.4,7,5,'#d4e4da');for(const id of ['pressotherapy','massage'])for(let i=0;i<Math.min(2,l(id));i++){const x=7.35+i*1.45,y=id==='pressotherapy'?1:4.3;this.box(x,y,1,1.8,12,id==='pressotherapy'?'#92bfa8':'#d4aca0');this.tile(x+.1,y+.1,.8,.35,15,'#fff0d4');const t=(s.treatments||[]).find(t=>t.service===id&&t.slot===i&&t.stage==='active');if(t){const [px,py]=this.point(x+.5,y+.65,16);this.ellipse(px,py,4,4,colors[t.kind]);c.fillStyle='#54765e';c.fillRect(px-3,py+3,6,12);if(id==='pressotherapy'){c.fillStyle='#a1d4be';c.fillRect(px-6,py+12,5,10);c.fillRect(px+1,py+12,5,10);}}}}
      if(zones.yoga){this.box(0,-3.4,3.7,3.4,5,'#e5cab9');for(let i=0;i<Math.min(6,l('yoga')*2);i++)this.tile(.3+(i%3)*1.1,-2.9+Math.floor(i/3)*1.5,.7,1.1,7,'#c797a1');}
      if(zones.studio)this.box(3.7,-3.4,3.3,3.4,5,'#c7dfcf');
      this.ellipse(180,241,155,27,'#b09b7a20');
      // A continuous 2.5D floor and two back walls; no external image assets.
      this.box(0,0,7,7,5,'#d8bd97','#b99a76');
      this.poly([this.point(0,0,5),this.point(7,0,5),this.point(7,0,68),this.point(0,0,68)],'#dfd6bc');
      this.poly([this.point(0,0,5),this.point(0,7,5),this.point(0,7,68),this.point(0,0,68)],'#eee6d4');
      for(let x=0;x<7;x++)for(let y=0;y<7;y++)this.tile(x,y,.97,.97,5,x>=4?(l('mat')?'#d9dfc9':'#d8d2c5'):((x+y)%2?'#e5cbaa':'#e9d4b6'));
      // Windows, botanical sign and warm pendants.
      this.poly([this.point(0,1,24),this.point(0,3.2,24),this.point(0,3.2,57),this.point(0,1,57)],'#a5bdb1','#c7b393');
      this.poly([this.point(4.6,0,22),this.point(6.5,0,22),this.point(6.5,0,54),this.point(4.6,0,54)],'#9db6aa','#c7b393');
      this.text('bloom & brew',180,25,'#51684e',13);
      this.text('CAFÉ',102,131,'#7f6349',8);this.text(l('mat')?'ESTUDIO':'FUTURO ESTUDIO',256,139,'#718263',8);
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
      this.plant(.35,.4,1.2);this.plant(.3,6.3,1.3);
      const tables=1+Math.min(l('seats'),3);
      for(let i=0;i<tables;i++) {
        const x=1.1+(i%2)*1.7,y=3.6+Math.floor(i/2)*1.8;
        this.box(x,y,.85,.8,13,'#f3e5c9','#bf9772');
        this.box(x-.35,y+.45,.3,.35,7,'#9baf90','#788c70');this.box(x+.9,y,.3,.35,7,'#9baf90','#788c70');
        this.plant(x+.45,y+.35,.35);
      }
      if(l('terrace')) {this.tile(1,7.3,4,1.2,0,'#c6ccb4');this.plant(1.1,7.9,.85);this.plant(4.6,7.9,.85);this.box(2.2,7.45,.9,.7,10);}
      if(l('mat')) {
        const n=Math.min(p.capacity,6);
        for(let i=0;i<n;i++) {
          const x=4.35+(i%2)*1.1,y=1.8+Math.floor(i/2)*1.7;
          if(l('reformer')&&i<l('reformer')) {this.box(x,y,.65,1.2,8,'#e8d8be','#8b927c');this.tile(x+.08,y+.15,.5,.8,10,'#899980');}
          else this.tile(x,y,.65,1.15,7,['#a7b8a0','#c8ac9c'][i%2]);
          if(s.classRemaining>0&&i<s.classSeats) {
            const [px,py]=this.point(x+.3,y+.65,10);const bend=this.reduced?0:Math.sin(t*1.8+i)*3;
            this.ellipse(px,py-3,3.4,3.8,colors[i%4]);c.strokeStyle=i%2?'#b3857a':'#768c9d';c.lineWidth=4;c.beginPath();c.moveTo(px,py);c.lineTo(px+4+bend,py+6);c.lineTo(px+10,py+8);c.stroke();
          }
        }
        this.plant(6.7,.5,.9);this.plant(6.7,6.2,.9);
        if(l('coach'))this.person(6.5,1.4,2,true,t);
        if(l('spa'))this.box(4.1,.4,1.2,.45,18,'#b7c6a4','#93a07f');
      } else {
        this.text('Respira. Tu próxima aventura',252,180,'#8f917d',8);this.text('Estudio desde 850 €',252,195,'#828774',9);
      }
      for(let i=0;i<p.baristas;i++)this.person(1+i*.75,.75,i,true,t);
      if(!p.baristas&&s.queue.some(o=>o.remaining!==null))this.person(1.8,.8,0,true,t);
      const targets=new Map();
      s.queue.forEach((o,i)=>targets.set(o.id,{x:2.7+(i%2)*.55,y:2.5+Math.floor(i/2)*.65,kind:o.kind,order:o}));
      s.seated.forEach((o,i)=>targets.set(o.id,{x:1.1+(i%2)*1.7,y:4.4+(Math.floor(i/2)%2)*1.8,kind:o.kind}));
      for(const [id,target] of targets)if(!this.people.has(id))this.people.set(id,{x:3.8,y:7.7,...{kind:target.kind}});
      for(const [id,person] of this.people) {
        const target=targets.get(id)||{x:3.8,y:8.3};const factor=this.reduced?1:Math.min(1,dt*2.4);
        person.x+=(target.x-person.x)*factor;person.y+=(target.y-person.y)*factor;
        if(!targets.has(id)&&person.y>8.1){this.people.delete(id);continue;}
      }
      [...this.people.entries()].sort((a,b)=>(a[1].x+a[1].y)-(b[1].x+b[1].y)).forEach(([id,person])=>{
        this.person(person.x,person.y,person.kind,false,t);const o=targets.get(id)?.order;
        if(o){const [px,py]=this.point(person.x,person.y,36);this.ellipse(px,py,9,7,'#fffaf0');this.text(B.PRODUCTS.find(p=>p.id===o.product).icon,px,py+3,'#536a4b',9);}
      });
      if(l('second')) {this.text(`${1+Math.min(l('second'),2)} LOCALES · TU COMUNIDAD CRECE`,180,262,'#667a5f',8);}
      c.restore();
    }
    frame(now) {
      requestAnimationFrame(this.frame);
      if(document.hidden||!this.canvas.closest('.view.active')){this.last=now;return;}
      if(now-this.last<(this.reduced?200:33))return;
      const dt=Math.min(.1,(now-this.last)/1000||.033);this.last=now;this.time+=dt;
      this.draw(this.getState(),this.time,dt);
    }
  }
  window.VenueScene2D=VenueScene;
})();

