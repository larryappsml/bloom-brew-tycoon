(function(root){'use strict';
 const spread=(v,a,b,extra)=>v<=a?0:v>=b?extra:(v-a)/(b-a)*extra;
 const x=v=>v+spread(v,-7.8,-7,2)+spread(v,-.4,1.05,2.6)+spread(v,6.9,7.9,2.2);
 const z=v=>v>=-5.8?v:v<=-6.8?v-3:v-(-5.8-v)*3;
 const point=p=>({...p,x:x(p.x),z:z(p.z)});
 const bounds=f=>({...f,left:x(f.left),right:x(f.right),back:z(f.back),front:z(f.front)});
 const api={x,z,point,bounds};root.BloomCampus=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis==='undefined'?this:globalThis);
