(function (root, factory) {
  const api = factory(typeof module==='object'&&module.exports?require('./layout.js'):root.BloomLayout);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Bloom = api;
})(typeof globalThis === 'undefined' ? this : globalThis, function (Layout) {
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
    ['classes','Sala de clases en grupo','Cuatro plazas extra de pilates','👯','zones',4200,2],
    ['manager','Gerente','Mejora productividad y reduce costes variables','🧑‍💼','team',6500,2],
    ['spa','Wellness y smoothies','Carta premium y sesiones de mayor valor','🥤','pilates',10500,2],
    ['second','Nueva sede','Abre hasta dos sedes satélite con margen limitado','🏬','cafe',24000,2],
    ['cafeWing','Ampliar cafetería','Construye un salón lateral con nuevas mesas','🏗️','zones',1800,1],
    ['wellnessWing','Ala de recuperación','Amplía el centro con una sala wellness','🏗️','zones',3200,1],
    ['yogaWing','Sala de yoga','Construye una sala al fondo del centro','🏗️','zones',2600,1],
    ['pressotherapy','Tumbonas de presoterapia','Una tumbona con botas por nivel · hasta dos','🦵','wellness',1100,2],
    ['pressureCare','Equipo de presoterapia','Mejores botas, consola y sesiones más rentables','⚙️','wellness',780,3],
    ['massage','Cabinas de masaje','Una camilla equipada por nivel · hasta dos','💆','wellness',1700,2],
    ['massageCare','Equipamiento de masaje','Calentador de toallas, aceites y mejor servicio','🕯️','wellness',920,3],
    ['recoveryComfort','Confort de la sala','Plantas, cuadros y detalles premium','🪴','wellness',650,3],
    ['therapist','Especialista wellness','Automatiza presoterapia y masajes','🧑‍⚕️','team',1250,2],
    ['yoga','Esterillas de yoga','Dos plazas nuevas por nivel','🧘','yoga',900,3],
    ['yogaCare','Accesorios de yoga','Bloques y accesorios para la sala','🕯️','yoga',560,3],
    ['cafeDecor','Ambientación del café','Plantas, lámparas y decoración por nivel','🌿','cafe',310,3],
    ['roaster','Tostador y molinillo','Más calidad y una nueva estación de café','⚙️','cafe',720,2],
    ['brewBar','Barra de filtrados','Drippers y jarras · café más rápido y de mayor valor','🫖','cafe',480,3],
    ['bakeryOven','Horno de obrador','Horno y bandejas · desayunos más rápidos y rentables','🥖','cafe',640,3],
    ['cafeLounge','Rincón de lectura','Librería y sillones · mejora la calidad de la carta','📚','cafe',720,3],
    ['pilatesKit','Accesorios de fuerza','Pesas, pelotas y aros para cada sesión','🏋️','pilates',450,3],
    ['studioMirror','Espejos y barras','Amplía los espejos y reduce el tiempo de clase','🪞','pilates',680,3],
    ['studioAudio','Ambiente del estudio','Altavoces e iluminación para clases premium','🎵','pilates',890,3],
    ['yogaBolsters','Cojines y mantas','Bolsters, textiles y sesiones de mayor valor','🧶','yoga',380,3],
    ['zenGarden','Jardín zen','Bambú, piedras y bonsáis en tu sala de yoga','🎋','yoga',760,3],
    ['yogaTea','Rincón de infusiones','Tetera y tazas para el ritual después de yoga','🫖','yoga',950,2],
    ['pressurePump','Central de compresión','Bombas y tubos · sesiones más rápidas','🦵','wellness',980,3],
    ['massageStones','Piedras calientes','Calentador y bandejas para un masaje premium','🪨','wellness',1150,3],
    ['wellnessLinen','Textiles premium','Toallas y mantas de calidad para los tratamientos','🧺','wellness',540,3]
  ].map(([id,name,desc,emoji,cat,base,max])=>({id,name,desc,emoji,cat,base,max}));
  const GOALS = [
    ['first','Tu primer turno','Sirve 10 pedidos',10,'served',45,'☕'],
    ['earn','Un rincón con futuro','Factura 500 € en ventas',500,'earned',100,'🌱'],
    ['passive','Un equipo de confianza','Contrata un barista',1,'barista',150,'👩‍🍳'],
    ['pilates','Respira y crece','Abre el estudio de pilates',1,'mat',180,'🧘'],
    ['growth','Una comunidad wellness','Completa 10 clases',10,'sessions',350,'✨'],
    ['empire','El siguiente capítulo','Abre una segunda sede',1,'second',1500,'🏬'],
    ['recovery','Un centro para cuidarse','Completa 8 sesiones de presoterapia o masaje',8,'wellness',300,'🌿'],
    ['yogaCommunity','Encuentra tu equilibrio','Completa 12 sesiones de yoga',12,'yogaSessions',240,'🧘']
  ].map(([id,title,desc,target,key,reward,emoji])=>({id,title,desc,target,key,reward,emoji}));
  const PRODUCTS = [
    {id:'coffee',name:'Café',icon:'☕',price:5,cost:1.2,time:3.6},
    {id:'breakfast',name:'Desayuno',icon:'🥐',price:9,cost:3,time:5.2},
    {id:'matcha',name:'Matcha',icon:'🍵',price:8,cost:2,time:4.4},
    {id:'smoothie',name:'Smoothie',icon:'🥤',price:12,cost:3.5,time:5.2}
  ];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const level=(s,id)=>s.levels[id]||0;
  const fresh=(now=Date.now())=>({version:VERSION,money:20,earned:0,expenses:0,rewards:0,served:0,happy:0,lost:0,sessions:0,students:0,levels:{},claimed:[],last:now,seconds:0,reputation:75,tutorial:0,boostUntil:0,rushReady:0,classRemaining:0,classSeats:0,nextId:1,arrival:0.5,daily:{day:new Date(now).toISOString().slice(0,10),count:0,claimed:false},queue:[],seated:[],satellite:0,treatments:[],treatmentArrival:2,completedServices:{pressotherapy:0,massage:0,yoga:0},wellnessRevenue:0});
  function validate(data, now=Date.now()) {
    if (!data || typeof data!=='object' || Array.isArray(data)) throw Error('Partida inválida');
    if (data.version!==undefined && data.version!==1 && data.version!==2) throw Error('Versión de partida incompatible');
    if (!Number.isFinite(data.money)||data.money<0 || !data.levels || typeof data.levels!=='object' || Array.isArray(data.levels)) throw Error('Datos de partida inválidos');
    const s=fresh(now), migrating=data.version!==VERSION;
    for(const key of ['money','earned','expenses','rewards','served','happy','lost','sessions','students','seconds','satellite','wellnessRevenue']) {
      if(data[key]!==undefined && (!Number.isFinite(data[key])||data[key]<0||data[key]>1e15)) throw Error('Valor inválido: '+key);
      if(data[key]!==undefined) s[key]=data[key];
    }
    for(const [id,n] of Object.entries(data.levels)) {
      if(!UPGRADES.some(u=>u.id===id)||!Number.isInteger(n)||n<0||n>1000) throw Error('Mejora inválida');
      s.levels[id]=n; // Preserve legacy investments, even when above the new purchase limit.
    }
    if(data.claimed!==undefined && (!Array.isArray(data.claimed)||data.claimed.some(id=>!GOALS.some(g=>g.id===id)))) throw Error('Objetivos inválidos');
    s.claimed=[...new Set(data.claimed||[])];
    if(data.completedServices!==undefined){if(!data.completedServices||typeof data.completedServices!=='object'||Array.isArray(data.completedServices))throw Error('Servicios inválidos');for(const [key,n]of Object.entries(data.completedServices)){if(!['pressotherapy','massage','yoga'].includes(key)||!Number.isInteger(n)||n<0||n>1e12)throw Error('Servicios inválidos');s.completedServices[key]=n;}}
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
    const seats=3+l('seats')*2+l('terrace')*4+(Layout.zones(s).cafe?6:0);
    const arrival=Math.max(1.4,6.5-l('seats')*.22-l('terrace')*.7-l('matcha')*.12)*(1.15-s.reputation/300);
    const speed=1+l('machine')*.18+l('manager')*.15+l('roaster')*.06;
    const capacity=2+l('mat')*2+l('classes')*4;
    const classPrice=12+l('reformer')*5+l('spa')*3+l('pilatesKit')+l('studioAudio');
    return {seats,arrival,speed,baristas:l('barista'),capacity,classPrice,classTime:Math.max(25,45-l('coach')*4-l('studioMirror')),quality:1+l('machine')*.12+l('pastries')*.05+l('matcha')*.04+l('cafeDecor')*.04+l('roaster')*.08+l('cafeLounge')*.025,manager:l('manager'),branches:l('second'),area:Layout.footprint(s).area};
  }
  const price=(s,u)=>Math.ceil(u.base*Math.pow(1.65,level(s,u.id)));
  function requirement(s,u) {
    if(['coach','reformer','classes','spa','wellnessWing','yogaWing'].includes(u.id)&&!level(s,'mat'))return 'Abre el estudio de pilates primero';
    if(['manager','second'].includes(u.id)&&s.sessions<10)return 'Completa 10 clases primero';
    if(u.id==='cafeWing'&&s.served<40)return 'Sirve 40 pedidos para ampliar';
    if(['pressotherapy','massage','recoveryComfort','therapist'].includes(u.id)&&!Layout.zones(s).wellness)return 'Construye el ala de recuperación primero';
    if(u.id==='pressureCare'&&!level(s,'pressotherapy'))return 'Instala una tumbona de presoterapia';
    if(u.id==='massageCare'&&!level(s,'massage'))return 'Instala una camilla de masaje';
    if(['yoga','yogaCare'].includes(u.id)&&!Layout.zones(s).yoga)return 'Construye la sala de yoga primero';
    if(u.id==='seats'&&level(s,'seats')>=3&&!Layout.zones(s).cafe)return 'Amplía la cafetería para añadir más mesas';
    if(u.id==='brewBar'&&!level(s,'machine'))return 'Mejora la cafetera primero';
    if(u.id==='bakeryOven'&&!level(s,'pastries'))return 'Instala una vitrina de repostería';
    if(u.id==='cafeLounge'&&!Layout.zones(s).cafe)return 'Amplía la cafetería primero';
    if(['pilatesKit','studioMirror','studioAudio'].includes(u.id)&&!level(s,'mat'))return 'Abre el estudio de pilates primero';
    if(['yogaBolsters','yogaTea'].includes(u.id)&&!level(s,'yoga'))return 'Instala esterillas de yoga primero';
    if(u.id==='zenGarden'&&!Layout.zones(s).yoga)return 'Construye la sala de yoga primero';
    if(u.id==='pressurePump'&&!level(s,'pressotherapy'))return 'Instala una tumbona de presoterapia';
    if(u.id==='massageStones'&&!level(s,'massage'))return 'Instala una camilla de masaje';
    if(u.id==='wellnessLinen'&&!Layout.zones(s).wellness)return 'Construye el ala de recuperación primero';
    return '';
  }
  const unlocked=(s,u)=>!requirement(s,u);
  const SERVICES=[{id:'pressotherapy',name:'Presoterapia',icon:'🦵'},{id:'massage',name:'Masaje',icon:'💆'},{id:'yoga',name:'Yoga',icon:'🧘'}];
  function serviceConfig(s,id){const l=x=>Math.min(level(s,x),UPGRADES.find(u=>u.id===x).max),capacity=Layout.serviceSlots(s,id).length,comfort=l('recoveryComfort');
    if(id==='pressotherapy')return {capacity,duration:36-l('pressureCare')*3-Math.max(0,l('therapist')-1)*2-l('pressurePump')*2,price:28+l('pressureCare')*4+comfort*2+l('pressurePump')*2+l('wellnessLinen'),cost:6,automatic:l('therapist')>0,travel:18};
    if(id==='massage')return {capacity,duration:42-l('massageCare')*3-Math.max(0,l('therapist')-1)*2,price:36+l('massageCare')*4+comfort*2+l('massageStones')*3+l('wellnessLinen'),cost:8+l('massageStones'),automatic:l('therapist')>0,travel:18};
    if(id==='yoga')return {capacity,duration:30-l('yogaCare')*2-l('yogaBolsters'),price:14+l('yogaCare')*2+l('yogaBolsters')+l('zenGarden')+l('yogaTea')*2,cost:2+l('yogaTea')*.5,automatic:l('coach')>0,travel:20};
    return {capacity:0,duration:1,price:0,cost:0,automatic:false,travel:0};
  }
  function startTreatment(s,id,rng=Math.random){if(!SERVICES.some(x=>x.id===id))return false;const p=serviceConfig(s,id);const taken=s.treatments.filter(t=>t.service===id).map(t=>t.slot);const slot=Array.from({length:p.capacity},(_,i)=>i).find(i=>!taken.includes(i));if(slot===undefined)return false;s.treatments.push({id:s.nextId++,service:id,slot,stage:'arrival',travel:p.travel,remaining:p.duration,duration:p.duration,kind:Math.min(3,Math.floor(rng()*4)),automatic:p.automatic});return true;}
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
    order.remaining=orderDuration(s,order.product);order.duration=order.remaining;
    order.worker=false; return true;
  }
  function orderDuration(s,id){const product=PRODUCTS.find(p=>p.id===id);return product.time/params(s).speed/(1+(id==='coffee'?Math.min(3,level(s,'brewBar'))*.08:id==='breakfast'?Math.min(3,level(s,'bakeryOven'))*.1:0));}
  function orderPrice(s,id){const product=PRODUCTS.find(p=>p.id===id);return product.price*params(s).quality+(id==='coffee'?Math.min(3,level(s,'brewBar'))*.35:id==='breakfast'?Math.min(3,level(s,'bakeryOven'))*.4:0);}
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
    s.classRemaining=p.classTime;s.classDuration=p.classTime; return true;
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
    for(const o of s.queue)if(workers<p.baristas&&o.remaining===null) {o.remaining=orderDuration(s,o.product);o.duration=o.remaining;o.worker=true;workers++;}
    const pending=[];
    for(const o of s.queue) {
      o.wait+=dt;
      if(o.remaining!==null)o.remaining-=dt*(active(s,now)?1.5:1);
      if(o.remaining!==null&&o.remaining<=0&&s.seated.length<p.seats) {
        const product=PRODUCTS.find(x=>x.id===o.product),gross=orderPrice(s,o.product);
        const cost=(product.cost+(o.worker?.65:0))*(1-p.manager*.08);
        revenue(s,gross,cost);s.served++;s.happy++;s.daily.count++;s.reputation=clamp(s.reputation+.5,20,100);
        s.seated.push({id:o.id,kind:o.kind,remaining:18,duration:18,product:o.product});
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
    s.treatmentArrival-=dt;
    if(s.treatmentArrival<=0){for(const service of SERVICES)if(serviceConfig(s,service.id).automatic)startTreatment(s,service.id,rng);s.treatmentArrival=6;}
    const ongoing=[];
    for(const treatment of s.treatments){
      if(treatment.stage==='arrival'){treatment.travel=Math.max(0,treatment.travel-dt);if(treatment.travel===0)treatment.stage='active';ongoing.push(treatment);continue;}
      treatment.remaining=Math.max(0,treatment.remaining-dt);
      if(treatment.remaining>0){ongoing.push(treatment);continue;}
      const config=serviceConfig(s,treatment.service),cost=config.cost+(treatment.automatic?(treatment.service==='yoga'?2:4):0);
      revenue(s,config.price,cost);s.wellnessRevenue+=config.price;s.completedServices[treatment.service]++;s.happy++;s.reputation=clamp(s.reputation+.3,20,100);
      events.push({type:'service',service:treatment.service,net:config.price-cost,first:s.completedServices[treatment.service]===1});
    }
    s.treatments=ongoing;
    if(p.branches) {const gross=p.branches*dt*3,cost=gross*.65;revenue(s,gross,cost);s.satellite+=gross-cost;}
    return events;
  }
  function estimate(s) {
    const p=params(s), products=menu(s),avg=products.reduce((a,x)=>a+orderPrice(s,x.id)-x.cost-.65,0)/products.length;
    const orders=p.baristas?Math.min(1/p.arrival,p.baristas*p.speed/4.5):0;
    const cafe=Math.max(0,avg*orders),pilates=level(s,'mat')&&level(s,'coach')?Math.floor(p.capacity*.85)*(p.classPrice-5)/p.classTime:0;
    const wellness=SERVICES.reduce((sum,service)=>{const c=serviceConfig(s,service.id);return sum+(c.automatic?c.capacity*(c.price-c.cost-(service.id==='yoga'?2:4))/(c.duration+c.travel+6):0);},0);
    return {cafe,pilates,wellness,total:cafe+pilates+wellness+p.branches*1.05};
  }
  function offline(s,now=Date.now()) {
    const duration=clamp((now-s.last)/1000,0,4*3600), net=estimate(s).total*duration*.35;
    s.last=now;
    if(duration<30||net<=0)return {duration,net:0};
    // Conservative approximation, with identical net accounting to the displayed award.
    revenue(s,net/0.65,net/0.65-net);
    return {duration,net};
  }
  const value=(s,g)=>g.key==='served'?s.served:g.key==='earned'?s.earned:g.key==='sessions'?s.sessions:g.key==='wellness'?s.completedServices.pressotherapy+s.completedServices.massage:g.key==='yogaSessions'?s.completedServices.yoga:level(s,g.key);
  function claim(s,id) {
    const g=GOALS.find(g=>g.id===id);if(!g||s.claimed.includes(id)||value(s,g)<g.target)return 0;
    s.money+=g.reward;s.rewards+=g.reward;s.claimed.push(id);return g.reward;
  }
  function claimDaily(s,now=Date.now()) {
    daily(s,now);if(s.daily.claimed||s.daily.count<30)return 0;
    s.daily.claimed=true;s.money+=80;s.rewards+=80;return 80;
  }
  return {VERSION,KEY,LEGACY_KEY,UPGRADES,GOALS,PRODUCTS,SERVICES,fresh,validate,params,level,price,requirement,unlocked,purchase,menu,spawn,startOrder,orderDuration,orderPrice,startClass,startTreatment,serviceConfig,rush,step,estimate,offline,value,claim,claimDaily};
});
