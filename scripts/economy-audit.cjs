const fs=require('node:fs'),B=require('../core.js');
const now=1800000000000,seconds=480,warmup=90,dt=.25;
const basic={machine:1,pastries:1,seats:1,barista:1,mat:1,coach:1,cafeWing:1,wellnessWing:1,yogaWing:1,pressotherapy:1,massage:1,therapist:1,yoga:1,crossfitWing:1,functionalStations:1,functionalCoach:1,padelWing:1,padelCourt:1,padelCoach:1};
const max=Object.fromEntries(B.UPGRADES.map(u=>[u.id,u.max]));
function runAudit(output){const records=[];
for(const [stage,levels]of Object.entries({basic,max}))for(const seed of [1,37]){
 const s=B.fresh(now);s.money=1e6;s.reputation=90;s.levels={...levels};let random=seed;const rng=()=>((random=(Math.imul(random,1664525)+1013904223)>>>0)/4294967296),net=Object.fromEntries(Object.keys(B.estimate(s).rooms).map(id=>[id,0]));
 let branchStart=0;
 for(let i=0;i<(seconds+warmup)/dt;i++){const events=B.step(s,dt,now+i*dt*1000,rng);if(i*dt<warmup){branchStart=s.satellite;continue;}for(const e of events){const id=e.type==='sale'?'cafe':e.type==='class'?'pilates':e.type==='sport'?e.sport:e.type==='service'?(e.service==='yoga'?'yoga':'wellness'):null;if(id)net[id]+=e.net;}}
 net.branches=s.satellite-branchStart;for(const id in net)net[id]=+(net[id]*60/seconds).toFixed(2);
 const estimated=Object.fromEntries(Object.entries(B.estimate(s).rooms).map(([id,n])=>[id,+(n*60).toFixed(2)]));const costs=Object.fromEntries(Object.keys(net).map(id=>[id,0]));for(const u of B.UPGRADES){const room=B.roomEconomy(s,u.id)?.id;if(!room)continue;for(let i=0;i<(levels[u.id]||0);i++)costs[room]+=Math.ceil(u.base*1.65**i);}
 const record={stage,seed,minutes:seconds/60,netPerMinute:net,estimatedPerMinute:estimated,investment:costs,paybackMinutes:Object.fromEntries(Object.keys(net).map(id=>[id,net[id]>0?+(costs[id]/net[id]).toFixed(1):null])),completed:{coffee:s.served,pilates:s.sessions,crossfit:s.sportSessions.crossfit,padel:s.sportSessions.padel}};records.push(record);console.log(JSON.stringify(record));
}
const report={warmup,seconds,dt,records};if(output)fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');return report;}
module.exports={basic,max,runAudit};if(require.main===module)runAudit(process.argv[2]);
