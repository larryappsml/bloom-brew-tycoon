(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BloomProgression=api;})(typeof globalThis==='undefined'?this:globalThis,function(){
  'use strict';
  const CHAPTERS=[
    {id:'aroma',name:'El primer aroma',icon:'☕',reward:35,tasks:[['served',5,'Pedidos servidos'],['machine',1,'Nivel de cafetera']]},
    {id:'team',name:'Un café concurrido',icon:'🥐',reward:100,tasks:[['barista',1,'Baristas'],['pastries',1,'Vitrina de bollería'],['served',25,'Pedidos servidos']]},
    {id:'flavours',name:'Una carta con identidad',icon:'🍵',reward:180,tasks:[['menu',4,'Recetas disponibles'],['seats',2,'Nivel de mesas'],['served',70,'Pedidos servidos']]},
    {id:'movement',name:'Café y movimiento',icon:'🧘',reward:260,tasks:[['mat',1,'Estudio de pilates'],['coach',1,'Instructoras'],['sessions',4,'Clases terminadas']]},
    {id:'recovery',name:'Un refugio de bienestar',icon:'🌿',reward:400,tasks:[['wellness',6,'Tratamientos terminados'],['yoga',4,'Sesiones de yoga'],['area',136,'Superficie del centro (m²)']]},
    {id:'community',name:'El centro del barrio',icon:'🏆',reward:700,tasks:[['served',250,'Pedidos servidos'],['sessions',20,'Clases terminadas'],['area',184,'Superficie del centro (m²)']]}
  ];
  const CAMPAIGNS=[
    {id:'coffee',name:'Club del café',icon:'☕',description:'Da protagonismo al café, los lattes y el matcha.',products:['coffee','latte','matcha'],target:8,reward:60},
    {id:'brunch',name:'Mesa de brunch',icon:'🥑',description:'Atrae pedidos de bollería, tartas y tostadas.',products:['breakfast','cake','toast'],target:6,reward:90},
    {id:'wellness',name:'Tarde de bienestar',icon:'🧘',description:'Completa clases o tratamientos, manuales o automáticos.',products:[],target:3,reward:160}
  ];
  const day=now=>new Date(now).toISOString().slice(0,10),integer=(n,max)=>Number.isInteger(n)&&n>=0&&n<=max;
  function fresh(now){return {chapters:[],campaign:null,campaignWins:0,campaignDaily:{day:day(now),wins:0}};}
  function restore(data,s,now){
    if(data.chapters!==undefined){if(!Array.isArray(data.chapters)||data.chapters.length>CHAPTERS.length||data.chapters.some((id,i)=>id!==CHAPTERS[i].id))throw Error('Capítulos inválidos');s.chapters=[...data.chapters];}
    if(data.campaignWins!==undefined){if(!integer(data.campaignWins,1e9))throw Error('Retos inválidos');s.campaignWins=data.campaignWins;}
    if(data.campaignDaily!==undefined){const d=data.campaignDaily;if(!d||typeof d.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d.day)||!integer(d.wins,3))throw Error('Límite de retos inválido');if(d.day===day(now))s.campaignDaily={day:d.day,wins:d.wins};}
    if(data.campaign!==undefined&&data.campaign!==null){const c=data.campaign,def=CAMPAIGNS.find(d=>d.id===c.id);if(!def||!integer(c.tier,2)||!integer(c.count,def.target+c.tier*2)||!Number.isFinite(c.remaining)||c.remaining<0||c.remaining>300)throw Error('Reto activo inválido');s.campaign={id:c.id,tier:c.tier,count:c.count,remaining:c.remaining};}
  }
  function status(s,metrics){const index=s.chapters.length,def=CHAPTERS[index];if(!def)return {complete:true,index,tasks:[],ready:false};const tasks=def.tasks.map(([key,target,label])=>({key,target,label,value:Math.min(target,metrics[key]??s.levels[key]??0)}));return {...def,index,tasks,ready:tasks.every(t=>t.value>=t.target),next:CHAPTERS[index+1]?.name};}
  function claimChapter(s,metrics){const c=status(s,metrics);if(!c.ready)return 0;s.chapters.push(c.id);s.money+=c.reward;s.rewards+=c.reward;return c.reward;}
  function resetDay(s,now){if(s.campaignDaily.day!==day(now))s.campaignDaily={day:day(now),wins:0};}
  function requirement(s,id){if(!CAMPAIGNS.some(c=>c.id===id))return 'Reto desconocido';if(id==='brunch'&&!['pastries','cakeDisplay','toastKitchen'].some(k=>s.levels[k]))return 'Desbloquea bollería, tartas o tostadas';if(id==='wellness'&&!['mat','yoga','pressotherapy','massage'].some(k=>s.levels[k]))return 'Abre pilates o un servicio wellness';return '';}
  function campaignStatus(s){const c=s.campaign;if(!c)return null;const def=CAMPAIGNS.find(d=>d.id===c.id),target=def.target+c.tier*2;return {...def,...c,target,reward:def.reward+c.tier*20,ready:c.count>=target,expired:c.remaining===0&&c.count<target};}
  function startCampaign(s,id,now=Date.now()){resetDay(s,now);if(s.campaign||s.campaignDaily.wins>=3||requirement(s,id))return false;s.campaign={id,tier:Math.min(2,Math.floor(s.campaignWins/3)),count:0,remaining:300};return true;}
  function claimCampaign(s,now=Date.now()){resetDay(s,now);const c=campaignStatus(s);if(!c?.ready||s.campaignDaily.wins>=3)return 0;s.money+=c.reward;s.rewards+=c.reward;s.campaignWins++;s.campaignDaily.wins++;s.campaign=null;return c.reward;}
  function cancelCampaign(s){if(!s.campaign)return false;s.campaign=null;return true;}
  function chooseProduct(s,products,rng){const c=campaignStatus(s);let pool=products;if(c&&!c.ready&&!c.expired&&c.products.length&&rng()<.6){const matching=products.filter(p=>c.products.includes(p.id));if(matching.length)pool=matching;}return pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];}
  function tick(s,dt,events,now){resetDay(s,now);const c=campaignStatus(s);if(!c||c.ready||c.expired)return;s.campaign.remaining=Math.max(0,c.remaining-dt);const added=events.filter(e=>c.id==='wellness'?['class','service'].includes(e.type):e.type==='sale'&&c.products.includes(e.productId)).length;s.campaign.count=Math.min(c.target,c.count+added);if(s.campaign.count>=c.target)events.push({type:'campaignReady',name:c.name});else if(s.campaign.remaining===0)events.push({type:'campaignExpired',name:c.name});}
  return {CHAPTERS,CAMPAIGNS,fresh,restore,status,claimChapter,requirement,campaignStatus,startCampaign,claimCampaign,cancelCampaign,chooseProduct,tick};
});
