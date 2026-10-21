(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BloomExperience=api;})(typeof globalThis==='undefined'?this:globalThis,function(){
 'use strict';
 const SPECIALTIES=[
 {id:'balanced',name:'Centro equilibrado',icon:'🌿',desc:'Tarifas y demanda habituales. Planes combinados variados.'},
 {id:'brunch',name:'Brunch de autor',icon:'🥐',desc:'+12 % en cafetería y 15 % más demanda de café. −8 % en otros servicios.'},
 {id:'active',name:'Club deportivo',icon:'🎾',desc:'+12 % en pilates y deportes. Clases captan alumnos un 20 % más rápido. −8 % en café y wellness.'},
 {id:'recovery',name:'Recuperación y calma',icon:'🪷',desc:'+12 % en yoga, masaje y presoterapia. Mayor frecuencia de visitas wellness. −8 % en café y deportes.'}];
 const fresh=()=>({specialty:'balanced',specialtyCooldown:0,visits:[],satisfaction:85,ratings:0,combinedCompleted:0,queueAbandoned:0,premiumArrival:90,premiumTips:0,premiumVisits:0});
 function restore(d,s){if(d.specialty!==undefined){if(!SPECIALTIES.some(x=>x.id===d.specialty))throw Error('Especialidad inválida');s.specialty=d.specialty;}for(const key of ['ratings','combinedCompleted','queueAbandoned','premiumVisits'])if(d[key]!==undefined){if(!Number.isInteger(d[key])||d[key]<0||d[key]>1e12)throw Error('Estadística de visitas inválida');s[key]=d[key];}for(const [key,max]of [['satisfaction',100],['specialtyCooldown',120],['premiumArrival',300],['premiumTips',1e15]])if(d[key]!==undefined){if(!Number.isFinite(d[key])||d[key]<0||d[key]>max)throw Error('Experiencia inválida');s[key]=d[key];}}
 function requirement(s,id){if(id==='brunch'&&!s.levels.pastries)return 'Desbloquea bollería';if(id==='active'&&!s.levels.mat&&!s.levels.crossfitWing&&!s.levels.padelWing)return 'Abre una zona deportiva';if(id==='recovery'&&!s.levels.pressotherapy&&!s.levels.massage&&!s.levels.yoga)return 'Abre un servicio wellness';return '';}
 function select(s,id){if(!SPECIALTIES.some(x=>x.id===id)||s.specialty===id||s.specialtyCooldown>0||requirement(s,id))return false;s.specialty=id;s.specialtyCooldown=120;return true;}
 function multiplier(s,category){const focus={brunch:['cafe','cowork'],active:['pilates','crossfit','padel','cycling','boxing','pool','golf','dance'],recovery:['pressotherapy','massage','yoga','thermal','cold','nails','beauty']}[s.specialty];return !focus?1:focus.includes(category)?1.12:.92;}
 function rate(s,a,abandoned=false){if(a.rated)return;a.rated=true;const score=abandoned?20:Math.max(45,100-(a.visitWait||a.wait||0)*.8);s.satisfaction=s.ratings?s.satisfaction*.92+score*.08:score;s.ratings++;if(abandoned)s.queueAbandoned++;else if(a.comboSteps)s.combinedCompleted++;s.reputation=Math.max(20,Math.min(100,s.reputation+(score-70)/100));}
 return {SPECIALTIES,fresh,restore,requirement,select,multiplier,rate};
});
