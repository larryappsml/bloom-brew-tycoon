(function(root){
  'use strict';
  const colors={prepare:'#d29a36',consume:'#31846d',pilates:'#8970ba',pressotherapy:'#338caa',massage:'#ba7d81',yoga:'#739657',crossfit:'#bd7957',padel:'#4caa93'};
  const products={coffee:'☕',breakfast:'🥐',matcha:'🍵',smoothie:'🥤',latte:'🥛',cake:'🍰',toast:'🥑'};
  const iconFor=(kind,product)=>products[product]||({pilates:'🧘',pressotherapy:'🦵',massage:'💆',yoga:'🪷',crossfit:'🏋️',padel:'🎾',cycling:'🚲',nails:'💅',beauty:'💇',thermal:'🧖',boxing:'🥊',cold:'❄️',cowork:'💻'}[kind])||'☕';
  function progress(remaining,duration){return Number.isFinite(remaining)&&Number.isFinite(duration)&&duration>0?Math.max(0,Math.min(1,1-remaining/duration)):0;}
  function drawClock(ctx,x,y,remaining,duration,kind,r=11,product=null){
    if(!Number.isFinite(remaining)||!Number.isFinite(duration)||duration<=0)return false;
    const fill=progress(remaining,duration),color=colors[kind]||colors.consume;
    ctx.save();ctx.translate(x,y);ctx.shadowColor='#244a4830';ctx.shadowBlur=4;ctx.shadowOffsetY=2;
    ctx.beginPath();ctx.arc(0,0,r+2,0,Math.PI*2);ctx.fillStyle='#fffcf1';ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.lineWidth=3;ctx.strokeStyle='#e2e9db';ctx.beginPath();ctx.arc(0,0,r-1,0,Math.PI*2);ctx.stroke();
    if(fill>0){ctx.strokeStyle=color;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,0,r-1,-Math.PI/2,-Math.PI/2+Math.PI*2*fill);ctx.stroke();}
    ctx.fillStyle='#315e50';ctx.font=`${Math.round(r*1.05)}px "Apple Color Emoji","Segoe UI Emoji",system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(iconFor(kind,product),0,.5,r*1.4);
    ctx.restore();return true;
  }
  class ClockLayer {
    constructor(sceneCanvas){this.sceneCanvas=sceneCanvas;this.canvas=document.createElement('canvas');this.canvas.className='activity-clocks';this.canvas.setAttribute('aria-hidden','true');this.canvas.style.pointerEvents='none';sceneCanvas.parentElement.append(this.canvas);this.ctx=this.canvas.getContext('2d');this.width=0;this.height=0;}
    draw(entries,project,zoom=1){
      const rect=this.sceneCanvas.getBoundingClientRect(),dpr=Math.min(typeof devicePixelRatio==='number'?devicePixelRatio:1,1.75);
      if(this.width!==rect.width||this.height!==rect.height||this.dpr!==dpr){this.width=rect.width;this.height=rect.height;this.dpr=dpr;this.canvas.width=Math.round(rect.width*dpr);this.canvas.height=Math.round(rect.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);}
      this.ctx.clearRect(0,0,this.width,this.height);let count=0;const counts={},all={};for(const e of entries)all[e.kind]=(all[e.kind]||0)+1;
      for(const entry of entries){const p=project(entry);if(p.z<-1||p.z>1)continue;const x=(p.x*.5+.5)*this.width,y=(-p.y*.5+.5)*this.height;if(x<-20||x>this.width+20||y<-20||y>this.height+20)continue;
        if(drawClock(this.ctx,x,y,entry.remaining,entry.duration,entry.kind,Math.max(9,Math.min(13,8+zoom*6)),entry.product)){count++;counts[entry.kind]=(counts[entry.kind]||0)+1;}
      }
      const summary=JSON.stringify(counts);if(this.canvas.dataset.count!==String(count))this.canvas.dataset.count=String(count);if(this.canvas.dataset.services!==summary)this.canvas.dataset.services=summary;
      const total=JSON.stringify(all);if(this.canvas.dataset.totalServices!==total)this.canvas.dataset.totalServices=total;
    }
    destroy(){this.canvas.remove();}
  }
  const api={progress,drawClock,iconFor,ClockLayer};root.BloomClocks=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis==='undefined'?this:globalThis);
