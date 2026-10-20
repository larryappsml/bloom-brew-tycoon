(function(){
  'use strict';
  class VenueScene {
    constructor(canvas,getState,onSelect){
      this.delegate=null;this.pending=[];canvas.dataset.renderer='loading';
      import('./scene3d.mjs').then(({Venue3D})=>{
        this.delegate=new Venue3D(canvas,getState,onSelect);
        for(const [method,value]of this.pending)this.delegate[method]?.(value);
        this.pending=[];
      }).catch(()=>{
        // A new canvas is necessary after a failed WebGL context creation.
        const fallback=canvas.cloneNode(false);canvas.replaceWith(fallback);fallback.dataset.renderer='2d';
        const script=document.createElement('script');script.src='./scene2d.js';
        script.onload=()=>{this.delegate=new window.VenueScene2D(fallback,getState);};document.head.append(script);
      });
    }
    focus(zone){if(this.delegate)this.delegate.focus?.(zone);else this.pending.push(['focus',zone]);}
    changeZoom(delta){if(this.delegate)this.delegate.changeZoom?.(delta);}
    select(id){if(this.delegate)this.delegate.select?.(id);else this.pending.push(['select',id]);}
  }
  window.VenueScene=VenueScene;
})();
