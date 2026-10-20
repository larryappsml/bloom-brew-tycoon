(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Bloom = api;
})(typeof globalThis === 'undefined' ? this : globalThis, function () {
  'use strict';
  const VERSION = 2;
  const KEY = 'bloom-brew-save-v2', LEGACY_KEY = 'bloom-brew-save-v1';
  const UPGRADES = [
    ['machine','Cafetera de especialidad','Café de más calidad y preparación más rápida','☕','cafe',24,6],
    ['pastries','Vitrina de repostería','Desbloquea pedidos de desayunos','🥐','cafe',90,4],
    ['seats','Mesas acogedoras','Dos plazas más y más visitas','🪑','cafe',140,5],
    ['barista','Barista','Prepara pedidos automáticamente · salario por servicio','👩‍🍳','team',220,3],
    ['matcha','Matcha y chai','Una carta de bebidas de mayor margen','🍵','cafe',390,4],
    ['mat','Estudio de pilates','Abre el estudio y añade dos plazas por nivel','🧘','pilates',850,4],
    ['coach','Instructora de pilates','Automatiza las clases · salario por sesión','🤸','team',620,2],
    ['reformer','Pilates reformer','Equipamiento premium y mayor precio por plaza','🛏️','pilates',1600,4],
    ['terrace','Terraza botánica','Cuatro plazas y más demanda de café','🌿','cafe',2900,2],
    ['classes','Sala de clases en grupo','Cuatro plazas extra de pilates','👯','pilates',4200,2],
    ['manager','Gerente','Mejora productividad y reduce costes variables','🧑‍💼','team',6500,2],
    ['spa','Wellness y smoothies','Carta premium y sesiones de mayor valor','🥤','pilates',10500,2],
    ['second','Nueva sede','Abre hasta dos sedes satélite con margen limitado','🏬','cafe',24000,2]
  ].map(([id,name,desc,emoji,cat,base,max])=>({id,name,desc,emoji,cat,base,max}));
  const GOALS = [
    ['first','Tu primer turno','Sirve 10 pedidos',10,'served',45,'☕'],
    ['earn','Un rincón con futuro','Factura 500 € en ventas',500,'earned',100,'🌱'],
    ['passive','Un equipo de confianza','Contrata un barista',1,'barista',150,'👩‍🍳'],
    ['pilates','Respira y crece','Abre el estudio de pilates',1,'mat',180,'🧘'],
    ['growth','Una comunidad wellness','Completa 10 clases',10,'sessions',350,'✨'],
    ['empire','El siguiente capítulo','Abre una segunda sede',1,'second',1500,'🏬']
  ].map(([id,title,desc,target,key,reward,emoji])=>({id,title,desc,target,key,reward,emoji}));
  const PRODUCTS = [
    {id:'coffee',name:'Café',icon:'☕',price:5,cost:1.2,time:3.6},
    {id:'breakfast',name:'Desayuno',icon:'🥐',price:9,cost:3,time:5.2},
    {id:'matcha',name:'Matcha',icon:'🍵',price:8,cost:2,time:4.4},
    {id:'smoothie',name:'Smoothie',icon:'🥤',price:12,cost:3.5,time:5.2}
  ];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const level=(s,id)=>s.levels[id]||0;
  const fresh=(now=Date.now())=>({version:VERSION,money:20,earned:0,expenses:0,rewards:0,served:0,happy:0,lost:0,sessions:0,students:0,levels:{},claimed:[],last:now,seconds:0,reputation:75,tutorial:0,boostUntil:0,rushReady:0,classRemaining:0,classSeats:0,nextId:1,arrival:0.5,daily:{day:new Date(now).toISOString().slice(0,10),count:0,claimed:false},queue:[],seated:[],satellite:0});
  function validate(data, now=Date.now()) {
    if (!data || typeof data!=='object' || Array.isArray(data)) throw Error('Partida inválida');
    if (data.version!==undefined && data.version!==1 && data.version!==2) throw Error('Versión de partida incompatible');
    if (!Number.isFinite(data.money)||data.money<0 || !data.levels || typeof data.levels!=='object' || Array.isArray(data.levels)) throw Error('Datos de partida inválidos');
    const s=fresh(now), migrating=data.version!==VERSION;
    for(const key of ['money','earned','expenses','rewards','served','happy','lost','sessions','students','seconds','satellite']) {
      if(data[key]!==undefined && (!Number.isFinite(data[key])||data[key]<0||data[key]>1e15)) throw Error('Valor inválido: '+key);
      if(data[key]!==undefined) s[key]=data[key];
    }
    for(const [id,n] of Object.entries(data.levels)) {
      if(!UPGRADES.some(u=>u.id===id)||!Number.isInteger(n)||n<0||n>1000) throw Error('Mejora inválida');
      s.levels[id]=n; // Preserve legacy investments, even when above the new purchase limit.
    }
    if(data.claimed!==undefined && (!Array.isArray(data.claimed)||data.claimed.some(id=>!GOALS.some(g=>g.id===id)))) throw Error('Objetivos inválidos');
    s.claimed=[...new Set(data.claimed||[])];
    for(const key of ['last','boostUntil','rushReady']) if(Number.isFinite(data[key])) s[key]=clamp(data[key],0,now+180000);
    s.reputation=migrating?75:clamp(Number.isFinite(data.reputation)?data.reputation:75,20,100);
    s.tutorial=clamp(Number.isInteger(data.tutorial)?data.tutorial:0,0,4);
    if(!migrating && data.daily?.day===s.daily.day) {
      if(!Number.isFinite(data.daily.count)||data.daily.count<0) throw Error('Objetivo diario inválido');
      s.daily={day:s.daily.day,count:Math.floor(data.daily.count),claimed:data.daily.claimed===true};
    }
    // Orders and ongoing classes are transient; restoring them must never mint money.
    if(migrating) { s.boostUntil=0; s.rushReady=0; }
    return s;
  }
  function params(s) {
    const l=id=>Math.min(level(s,id),UPGRADES.find(u=>u.id===id).max);
    const seats=3+l('seats')*2+l('terrace')*4;
    const arrival=Math.max(1.4,6.5-l('seats')*.22-l('terrace')*.7-l('matcha')*.12)*(1.15-s.reputation/300);
    const speed=1+l('machine')*.18+l('manager')*.15;
    const capacity=2+l('mat')*2+l('classes')*4;
    const classPrice=12+l('reformer')*5+l('spa')*3;
    return {seats,arrival,speed,baristas:l('barista'),capacity,classPrice,classTime:Math.max(25,45-l('coach')*4),quality:1+l('machine')*.12+l('pastries')*.05+l('matcha')*.04,manager:l('manager'),branches:l('second')};
  }
  const price=(s,u)=>Math.ceil(u.base*Math.pow(1.65,level(s,u.id)));
  function unlocked(s,u) {
    if(['coach','reformer','classes','spa'].includes(u.id))return level(s,'mat')>0;
    if(['manager','second'].includes(u.id))return s.sessions>=10;
    return true;
  }
  function purchase(s,id) {
    const u=UPGRADES.find(u=>u.id===id);
    if(!u||!unlocked(s,u)||level(s,id)>=u.max)return false;
    const cost=price(s,u); if(s.money<cost)return false;
    s.money-=cost; s.levels[id]=level(s,id)+1; return true;
  }
  function menu(s) {return PRODUCTS.filter(p=>p.id==='coffee'||p.id==='breakfast'&&level(s,'pastries')||p.id==='matcha'&&level(s,'matcha')||p.id==='smoothie'&&level(s,'spa'));}
  function spawn(s,rng=Math.random) {
    const p=params(s), types=menu(s), product=types[Math.min(types.length-1,Math.floor(rng()*types.length))];
    s.queue.push({id:s.nextId++,product:product.id,wait:0,patience:28+rng()*12,remaining:null,worker:false,kind:Math.floor(rng()*4)});
  }
  function startOrder(s) {
    if(s.queue.some(o=>o.remaining!==null&&!o.worker))return false;
    const order=s.queue.find(o=>o.remaining===null); if(!order)return false;
    order.remaining=PRODUCTS.find(p=>p.id===order.product).time/params(s).speed;
    order.worker=false; return true;
  }
  const active=(s,now)=>now<s.boostUntil;
  function rush(s,now=Date.now()) {
    if(now<s.rushReady)return false;
    s.boostUntil=now+20000;s.rushReady=now+180000;return true;
  }
  function startClass(s,now=Date.now()) {
    if(!level(s,'mat')||s.classRemaining>0)return false;
    const p=params(s);
    s.classSeats=Math.max(1,Math.floor(p.capacity*(.55+s.reputation/250)));
    s.classSeats=Math.min(p.capacity,s.classSeats);
    s.classRemaining=p.classTime; return true;
  }
  function revenue(s,gross,cost) {s.earned+=gross;s.expenses+=cost;s.money+=gross-cost;}
  function daily(s,now) {
    const day=new Date(now).toISOString().slice(0,10);
    if(s.daily.day!==day)s.daily={day,count:0,claimed:false};
  }
  function step(s,dt,now=Date.now(),rng=Math.random) {
    dt=clamp(Number.isFinite(dt)?dt:0,0,1);
    const events=[],p=params(s); daily(s,now); s.seconds+=dt;
    s.arrival-=dt*(active(s,now)?1.6:1);
    if(s.arrival<=0) { if(s.queue.length+s.seated.length<p.seats+3)spawn(s,rng); s.arrival=p.arrival; }
    for(const guest of s.seated)guest.remaining-=dt;
    s.seated=s.seated.filter(g=>g.remaining>0);
    let workers=s.queue.filter(o=>o.worker&&o.remaining!==null).length;
    for(const o of s.queue)if(workers<p.baristas&&o.remaining===null) {o.remaining=PRODUCTS.find(x=>x.id===o.product).time/p.speed;o.worker=true;workers++;}
    const pending=[];
    for(const o of s.queue) {
      o.wait+=dt;
      if(o.remaining!==null)o.remaining-=dt*(active(s,now)?1.5:1);
      if(o.remaining!==null&&o.remaining<=0&&s.seated.length<p.seats) {
        const product=PRODUCTS.find(x=>x.id===o.product),gross=product.price*p.quality;
        const cost=(product.cost+(o.worker?.65:0))*(1-p.manager*.08);
        revenue(s,gross,cost);s.served++;s.happy++;s.daily.count++;s.reputation=clamp(s.reputation+.5,20,100);
        s.seated.push({id:o.id,kind:o.kind,remaining:7,product:o.product});
        events.push({type:'sale',net:gross-cost,product:product.name});
      } else if(o.remaining===null&&o.wait>o.patience) {s.lost++;s.reputation=clamp(s.reputation-1.5,20,100);events.push({type:'lost'});}
      else pending.push(o);
    }
    s.queue=pending;
    if(s.classRemaining>0) {
      s.classRemaining=Math.max(0,s.classRemaining-dt);
      if(s.classRemaining===0) {
        const gross=s.classSeats*p.classPrice,cost=s.classSeats*(2+ (level(s,'coach')?3:0));
        revenue(s,gross,cost);s.sessions++;s.students+=s.classSeats;s.reputation=clamp(s.reputation+1,20,100);
        events.push({type:'class',net:gross-cost});s.classSeats=0;
      }
    }
    if(level(s,'coach')&&s.classRemaining===0)startClass(s,now);
    if(p.branches) {const gross=p.branches*dt*3,cost=gross*.65;revenue(s,gross,cost);s.satellite+=gross-cost;}
    return events;
  }
  function estimate(s) {
    const p=params(s), products=menu(s),avg=products.reduce((a,x)=>a+x.price*p.quality-x.cost-.65,0)/products.length;
    const orders=p.baristas?Math.min(1/p.arrival,p.baristas*p.speed/4.5):0;
    const cafe=Math.max(0,avg*orders),pilates=level(s,'mat')&&level(s,'coach')?Math.floor(p.capacity*.85)*(p.classPrice-5)/p.classTime:0;
    return {cafe,pilates,total:cafe+pilates+p.branches*1.05};
  }
  function offline(s,now=Date.now()) {
    const duration=clamp((now-s.last)/1000,0,4*3600), net=estimate(s).total*duration*.35;
    s.last=now;
    if(duration<30||net<=0)return {duration,net:0};
    // Conservative approximation, with identical net accounting to the displayed award.
    revenue(s,net/0.65,net/0.65-net);
    return {duration,net};
  }
  const value=(s,g)=>g.key==='served'?s.served:g.key==='earned'?s.earned:g.key==='sessions'?s.sessions:level(s,g.key);
  function claim(s,id) {
    const g=GOALS.find(g=>g.id===id);if(!g||s.claimed.includes(id)||value(s,g)<g.target)return 0;
    s.money+=g.reward;s.rewards+=g.reward;s.claimed.push(id);return g.reward;
  }
  function claimDaily(s,now=Date.now()) {
    daily(s,now);if(s.daily.claimed||s.daily.count<30)return 0;
    s.daily.claimed=true;s.money+=80;s.rewards+=80;return 80;
  }
  return {VERSION,KEY,LEGACY_KEY,UPGRADES,GOALS,PRODUCTS,fresh,validate,params,level,price,unlocked,purchase,menu,spawn,startOrder,startClass,rush,step,estimate,offline,value,claim,claimDaily};
});
