(function(root){
  'use strict';
  const n=(s,id)=>s.levels?.[id]||0;
  function zones(s){return {cafe:n(s,'cafeWing')>0||n(s,'seats')>=4,wellness:n(s,'wellnessWing')>0||n(s,'pressotherapy')>0||n(s,'massage')>0,studio:n(s,'classes')>0,yoga:n(s,'yogaWing')>0||n(s,'yoga')>0};}
  function footprint(s){const z=zones(s);return {area:72+(z.cafe?32:0)+(z.wellness?32:0)+(z.studio?24:0)+(z.yoga?24:0),left:z.cafe?-14.1:-7.4,right:z.wellness?14.1:7.4,back:z.studio||z.yoga?-12.6:-6.2,front:6.2,zones:z};}
  function tables(s){const result=[[-4.8,.25],[-1.8,.25],[-4.8,3.05],[-1.8,3.05]].slice(0,Math.min(4,1+n(s,'seats')));if(zones(s).cafe)result.push(...[[-12,-3.3],[-9.2,-3.3],[-12,.2],[-9.2,.2],[-12,3.5]].slice(0,Math.min(5,3+Math.max(0,n(s,'seats')-3))));if(n(s,'terrace'))result.push([-4.8,7.1],[3.8,7.1]);if(n(s,'terrace')>1)result.push([-10,7.1],[10,7.1]);return result;}
  function cafeSeats(s){const result=[];tables(s).forEach(([x,z],table)=>{for(const side of [-1,1])result.push({key:`table:${table}:${side}`,table,x:x+side*1.01,z:z+.08,facing:side>0?-Math.PI/2:Math.PI/2});});result.push({key:'bar:0',table:-1,x:-5.6,z:-1.55,facing:Math.PI});return result;}
  const queueSlots=()=>[[-3.6,-1.5],[-2.85,-1.5],[-2.1,-1.5],[-1.35,-1.5],[-.6,-1.5],[-.6,-.75]].map(([x,z],index)=>({x,z,index}));
  function entryRoute(end){return [{x:-.6,z:9.2},{x:-.6,z:6.3},{x:-.35,z:4.65},...insideRoute(end)];}
  function insideRoute(end){const route=[],add=(x,z)=>route.push({x,z});
    if(end.z>6.3){add(-.35,4.65);add(-.6,6.3);add(-.6,8.5);add(end.x,8.5);add(end.x,end.z);return route;}
    if(end.x>7.3){add(-.35,-.15);add(7.7,-.15);add(end.x,-.15);}
    else if(end.x<-7.3){const aisle=end.z<-1.6?-1.6:1.65;add(-.35,1.65);add(-7.8,1.65);add(-7.8,aisle);add(end.x,aisle);}
    else if(end.x>.8){add(1.05,4.4);add(1.05,end.z+1.16);add(end.x,end.z+1.16);}
    else if(end.z<-6){add(-.35,1.65);add(-.35,-6.5);add(end.x,-6.5);}
    else if(end.table===-1){add(-.35,1.65);add(-6.6,1.65);add(-6.6,end.z);}
    else if(end.table!==undefined){add(-.35,1.65);add(end.x,1.65);}
    else{add(-.35,-.1);add(end.x,-.1);}
    add(end.x,end.z);return route;
  }
  function exitRoute(start,side=1){const route=[],add=(x,z)=>route.push({x,z});
    if(start.z>6.3){add(start.x,8.5);add(side*21,8.5);return route;}
    if(start.x>7.3){add(start.x,2.05);add(7.7,2.05);add(.55,2.05);}
    else if(start.x<-7.3){const aisle=start.z<-1.6?-1.6:1.65;add(start.x,aisle);add(-7.8,aisle);add(-7.8,2.05);add(.55,2.05);}
    else if(start.x>.8){add(start.x,start.z+1.16);add(6.65,start.z+1.16);add(6.65,4.65);}
    else if(start.z<-6){add(start.x,start.z+1.16);add(-.05,start.z+1.16);add(-.05,-6.5);add(.2,4.65);}
    else if(start.x<-5&&start.z<0){add(-6.6,start.z);add(-6.6,2.05);add(.55,2.05);}
    else{add(start.x,2.05);add(.55,2.05);}
    add(.55,4.9);add(.55,6.4);add(.55,8.5);add(side*21,8.5);return route;
  }
  function pilates(s){if(!n(s,'mat'))return [];const count=2+Math.min(4,n(s,'mat'))*2+Math.min(2,n(s,'classes'))*4,result=[];for(let i=0;i<Math.min(count,10);i++)result.push({x:1.7+(i%3)*1.9,z:-3.5+Math.floor(i/3)*2.25,premium:i<Math.min(4,n(s,'reformer'))});for(let i=10;i<count;i++)result.push({x:1.7+((i-10)%3)*1.9,z:-10.8+Math.floor((i-10)/3)*2.2,premium:i-10<Math.max(0,n(s,'reformer')-2)});return result;}
  function serviceSlots(s,id){if(id==='pressotherapy'||id==='massage'){if(!zones(s).wellness)return [];return Array.from({length:Math.min(2,n(s,id))},(_,i)=>({x:9.25+i*2.8,z:id==='pressotherapy'?-2.7:2.6,service:id,index:i}));}if(id==='yoga'&&zones(s).yoga)return Array.from({length:Math.min(6,n(s,'yoga')*2)},(_,i)=>({x:-5.4+(i%3)*2.05,z:-10.7+Math.floor(i/3)*2.6,service:id,index:i}));return [];}
  function route(start,end,arriving=false,leaving=false){const points=[];const add=(x,z)=>points.push({x,z});
    if(arriving){add(-.4,9.25);add(-.4,6.2);add(-.1,4.7);add(-.1,.8);}
    if(leaving){if(start.x>7.5)add(7.5,.8);if(start.x<-7.5)add(-7.8,1.6);if(start.z<-5.8)add(start.x,-4.7);add(-.1,.8);add(-.1,4.7);add(-.4,7.8);add(-.4,9.25);add(end.x,end.z);return points;}
    if(end.x>7.5){add(-.1,.8);add(7.5,.8);}else if(end.x<-7.5){add(-.1,1.6);add(-7.8,1.6);}else if(end.z<-5.8){add(-.1,.8);add(-.1,-4.6);add(end.x,-4.7);add(end.x,-6.6);}else if(!arriving&&start.x>-.8&&end.x<-.8)add(-.1,.8);
    add(end.x,end.z);return points;
  }
  const api={zones,footprint,tables,cafeSeats,queueSlots,pilates,serviceSlots,entryRoute,insideRoute,exitRoute,route};root.BloomLayout=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis==='undefined'?this:globalThis);
