(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./layout.js'):root.BloomLayout);if(typeof module==='object'&&module.exports)module.exports=api;else root.BloomTraffic=api;})(typeof globalThis==='undefined'?this:globalThis,function(Layout){
  'use strict';
  const GAP=.52,SPEED=3.2;
  const agents=s=>[...(s.departing||[]),...(s.classGuests||[]),...(s.queue||[]),...(s.seated||[]),...(s.treatments||[])];
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  function create(s,target,type,rng=Math.random){const id=s.nextId++,others=agents(s);let position;
    for(let i=0;i<24;i++){const candidate={x:(id%2?1:-1)*(13+(i%12)*.7),z:9.25};if(others.every(a=>!a.position||distance(candidate,a.position)>=GAP)){position=candidate;break;}}
    position=position||{x:(id%2?1:-1)*22,z:9.25};
    return {id,type,kind:Math.max(0,Math.min(3,Math.floor(rng()*4))),position,previousPosition:{...position},path:Layout.entryRoute(target),destination:{...target},moving:true,stage:'arrival'};
  }
  function send(agent,path,target){agent.path=path;agent.detour=[];agent.navAge=0;agent.navDistance=Infinity;agent.destination={...target};agent.moving=path.length>0;}
  function exit(agent){agent.stage='exiting';agent.exitOrigin={...agent.position};const path=Layout.exitRoute(agent.position,agent.id%2?1:-1);send(agent,path,path.at(-1));}
  // A short local search lets visitors go around a stationary queue or a seated
  // guest instead of oscillating forever on the same side of the obstacle.
  function detour(agent,goal,list){const origin=agent.position,spacing=.3,limit=14,queue=[{x:0,z:0,parent:-1}],seen=new Set(['0,0']);let best=0,bestDistance=distance(origin,goal);
    const point=n=>({x:origin.x+n.x*spacing,z:origin.z+n.z*spacing});
    const clear=p=>list.every(a=>a===agent||!a.position||distance(p,a.position)>=GAP+.015);
    for(let i=0;i<queue.length&&i<1300;i++){const node=queue[i],p=point(node),d=distance(p,goal);if(d<bestDistance){bestDistance=d;best=i;}if(d<.24){best=i;break;}
      for(const [x,z] of [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[-1,-1],[1,-1]]){const next={x:node.x+x,z:node.z+z,parent:i},key=next.x+','+next.z;if(Math.abs(next.x)>limit||Math.abs(next.z)>limit||seen.has(key))continue;seen.add(key);const q=point(next);if(clear(q)&&clear({x:(p.x+q.x)/2,z:(p.z+q.z)/2}))queue.push(next);}
    }
    if(bestDistance>distance(origin,goal)-.15)return [];
    const result=[];for(let i=best;i>0;i=queue[i].parent)result.push(point(queue[i]));return result.reverse();
  }
  function advance(s,dt){const list=agents(s);for(const agent of list){if(!agent.position)continue;agent.previousPosition={...agent.position};let budget=SPEED*dt;agent.moving=false;
      agent.navAge=(agent.navAge||0)+dt;
      if(agent.path?.length&&agent.navAge>1.2){const d=distance(agent.position,agent.path[0]);if(d>(agent.navDistance??Infinity)-.25)agent.detour=detour(agent,agent.path[0],list);agent.navDistance=d;agent.navAge=0;}
      while(agent.path?.length&&budget>.00001){const avoiding=agent.detour?.length>0,route=avoiding?agent.detour:agent.path,goal=route[0],dx=goal.x-agent.position.x,dz=goal.z-agent.position.z,len=Math.hypot(dx,dz);
        if(len<(avoiding?.035:agent.path.length>1?1:.005)){route.shift();continue;}
        const amount=Math.min(budget,len,.15),ux=dx/len,uz=dz/len;
        const clear=p=>list.every(other=>other===agent||!other.position||distance(p,other.position)>=GAP-.00001);
        let proposed={x:agent.position.x+ux*amount,z:agent.position.z+uz*amount};
        if(!clear(proposed)){const right={x:agent.position.x+uz*amount,z:agent.position.z-ux*amount},left={x:agent.position.x-uz*amount,z:agent.position.z+ux*amount};if(clear(right))proposed=right;else if(clear(left))proposed=left;else break;budget=0;}
        else budget-=amount;
        agent.position=proposed;agent.moving=true;agent.heading=Math.atan2(proposed.x-agent.previousPosition.x,proposed.z-agent.previousPosition.z);
        if(distance(agent.position,goal)<.005)route.shift();
      }
      if(agent.stage==='exiting'&&agent.exitOrigin&&distance(agent.position,agent.exitOrigin)>1){delete agent.reservedSeat;delete agent.reservedService;delete agent.reservedSlot;}
    }
  }
  return {GAP,SPEED,agents,create,send,exit,advance};
});

