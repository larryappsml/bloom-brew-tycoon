(function (root, factory) {
  const api = factory(typeof module==='object'&&module.exports?require('./layout.js'):root.BloomLayout,typeof module==='object'&&module.exports?require('./traffic.js'):root.BloomTraffic,typeof module==='object'&&module.exports?require('./progression.js'):root.BloomProgression);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Bloom = api;
})(typeof globalThis === 'undefined' ? this : globalThis, function (Layout,Traffic,Progression) {
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
    ['tableService','Servicio de mesas','Consumos más ágiles y sillas libres antes · hasta −30 %','🍽️','cafe',180,3],
    ['latteBar','Lattes de autor','Nueva receta con leche y estación de espumado','🥛','cafe',420,3],
    ['cakeDisplay','Tartas artesanas','Porciones de tarta y expositor refrigerado','🍰','cafe',560,3],
    ['toastKitchen','Tostadas de aguacate','Nueva cocina de desayunos con tostador','🥑','cafe',680,3],
    ['pilatesBands','Sesiones con bandas','Bandas elásticas durante las clases · servicio premium','🎗️','pilates',640,2],
    ['soundRitual','Ritual sonoro de yoga','Cuencos sonoros durante la sesión de yoga','🔔','yoga',720,2],
    ['aromaMassage','Masaje aromático','Difusores y aceites durante el masaje','🪻','wellness',860,2],
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
    {id:'smoothie',name:'Smoothie',icon:'🥤',price:12,cost:3.5,time:5.2},
    {id:'latte',name:'Latte de autor',icon:'🥛',price:9,cost:2.6,time:4.8},
    {id:'cake',name:'Tarta artesana',icon:'🍰',price:11,cost:3.8,time:4.5},
    {id:'toast',name:'Tostada de aguacate',icon:'🥑',price:14,cost:5,time:6.2}
  ];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const level=(s,id)=>s.levels[id]||0;
  const fresh=(now=Date.now())=>({...Progression.fresh(now),version:VERSION,money:20,earned:0,expenses:0,rewards:0,served:0,happy:0,lost:0,sessions:0,students:0,levels:{},claimed:[],last:now,seconds:0,reputation:75,tutorial:0,boostUntil:0,rushReady:0,classRemaining:0,classSeats:0,classPhase:'idle',classGuests:[],classBoardRemaining:0,classRecruitRemaining:0,classCooldown:0,departing:[],seatCursor:0,nextId:1,arrival:0.5,daily:{day:new Date(now).toISOString().slice(0,10),count:0,claimed:false},queue:[],seated:[],satellite:0,treatments:[],treatmentArrival:2,completedServices:{pressotherapy:0,massage:0,yoga:0},wellnessRevenue:0});
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
    Progression.restore(data,s,now);
    return s;
  }
  function params(s) {
    const l=id=>Math.min(level(s,id),UPGRADES.find(u=>u.id===id).max);
    const seats=Layout.cafeSeats(s).length;
    const arrival=Math.max(1.25,6.5-l('seats')*.55-l('terrace')*.95-l('matcha')*.18-l('cafeDecor')*.24)*(1.15-s.reputation/300);
    const speed=1+l('machine')*.18+l('manager')*.15+l('roaster')*.06;
    const capacity=2+l('mat')*2+l('classes')*4;
    const classPrice=12+l('reformer')*5+l('spa')*3+l('pilatesKit')+l('studioAudio')+l('pilatesBands')*2;
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
    if(u.id==='tableService'&&!level(s,'barista'))return 'Contrata un barista primero';
    if(u.id==='latteBar'&&!level(s,'machine'))return 'Mejora la cafetera primero';
    if(['cakeDisplay','toastKitchen'].includes(u.id)&&!level(s,'pastries'))return 'Instala una vitrina de repostería';
    if(u.id==='pilatesBands'&&!level(s,'mat'))return 'Abre el estudio de pilates primero';
    if(u.id==='soundRitual'&&!level(s,'yoga'))return 'Instala esterillas de yoga primero';
    if(u.id==='aromaMassage'&&!level(s,'massage'))return 'Instala una camilla de masaje';
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
    if(id==='massage')return {capacity,duration:42-l('massageCare')*3-Math.max(0,l('therapist')-1)*2,price:36+l('massageCare')*4+comfort*2+l('massageStones')*3+l('wellnessLinen')+l('aromaMassage')*4,cost:8+l('massageStones')+l('aromaMassage'),automatic:l('therapist')>0,travel:18};
    if(id==='yoga')return {capacity,duration:30-l('yogaCare')*2-l('yogaBolsters')-l('soundRitual'),price:14+l('yogaCare')*2+l('yogaBolsters')+l('zenGarden')+l('yogaTea')*2+l('soundRitual')*2,cost:2+l('yogaTea')*.5+l('soundRitual')*.5,automatic:l('coach')>0,travel:20};
    return {capacity:0,duration:1,price:0,cost:0,automatic:false,travel:0};
  }
  function serviceOccupancy(s,id){return s.treatments.filter(t=>t.service===id).length+s.departing.filter(t=>t.reservedService===id).length;}
  function startTreatment(s,id,rng=Math.random){
    if(!SERVICES.some(x=>x.id===id))return false;
    const p=serviceConfig(s,id),spots=Layout.serviceSlots(s,id),taken=new Set([...s.treatments.filter(t=>t.service===id).map(t=>t.slot),...s.departing.filter(t=>t.reservedService===id).map(t=>t.reservedSlot)]);
    const slot=spots.findIndex((_,i)=>!taken.has(i));if(slot<0)return false;
    s.treatments.push({...Traffic.create(s,spots[slot],'treatment',rng),service:id,slot,remaining:p.duration,duration:p.duration,automatic:p.automatic});return true;
  }
  function purchase(s,id) {
    const u=UPGRADES.find(u=>u.id===id);
    if(!u||!unlocked(s,u)||level(s,id)>=u.max)return false;
    const cost=price(s,u); if(s.money<cost)return false;
    s.money-=cost; s.levels[id]=level(s,id)+1; return true;
  }
  function menu(s) {const unlock={breakfast:'pastries',matcha:'matcha',smoothie:'spa',latte:'latteBar',cake:'cakeDisplay',toast:'toastKitchen'};return PRODUCTS.filter(p=>p.id==='coffee'||level(s,unlock[p.id]));}
  function spawn(s,rng=Math.random) {
    const slots=Layout.queueSlots(),used=new Set(s.queue.map(o=>o.queueSlot)),slot=slots.find(p=>!used.has(p.index));if(!slot)return false;
    const types=menu(s),product=Progression.chooseProduct(s,types,rng);
    s.queue.push({...Traffic.create(s,slot,'cafe',rng),queueSlot:slot.index,product:product.id,wait:0,patience:28+rng()*12,remaining:null,worker:false});return true;
  }
  function startOrder(s) {
    if(s.queue.some(o=>o.remaining!==null&&!o.worker))return false;
    const order=s.queue.find(o=>o.remaining===null&&o.stage==='waiting'); if(!order)return false;
    order.remaining=orderDuration(s,order.product);order.duration=order.remaining;
    order.worker=false;order.stage='preparing';return true;
  }
  function orderDuration(s,id){const product=PRODUCTS.find(p=>p.id===id),recipe={latte:'latteBar',cake:'cakeDisplay',toast:'toastKitchen'}[id];return product.time/params(s).speed/(1+(recipe?Math.min(3,level(s,recipe))*.06:id==='coffee'?Math.min(3,level(s,'brewBar'))*.08:id==='breakfast'?Math.min(3,level(s,'bakeryOven'))*.1:0));}
  function orderPrice(s,id){const product=PRODUCTS.find(p=>p.id===id),recipe={latte:'latteBar',cake:'cakeDisplay',toast:'toastKitchen'}[id];return product.price*params(s).quality+(recipe?Math.max(0,Math.min(3,level(s,recipe))-1)*.5:id==='coffee'?Math.min(3,level(s,'brewBar'))*.35:id==='breakfast'?Math.min(3,level(s,'bakeryOven'))*.4:0);}
  const active=(s,now)=>now<s.boostUntil;
  function rush(s,now=Date.now()) {
    if(now<s.rushReady)return false;
    s.boostUntil=now+20000;s.rushReady=now+180000;return true;
  }
  function startClass(s,now=Date.now()) {
    if(!level(s,'mat'))return false;
    if(s.classPhase==='boarding'){if(!s.classGuests.length||s.classGuests.some(g=>g.stage!=='ready'))return false;beginClass(s);return true;}
    if(s.classPhase!=='idle'||s.classCooldown>0)return false;
    s.classPhase='boarding';s.classBoardRemaining=22;s.classRecruitRemaining=.5;s.classGuests=[];s.classSeats=0;return true;
  }
  function classDemand(s){return Math.max(1,4.8-Math.min(4,level(s,'mat'))*.35-Math.min(4,level(s,'reformer'))*.25-Math.min(3,level(s,'studioAudio'))*.2-Math.min(2,level(s,'spa'))*.1-s.reputation/150);}
  function beginClass(s){s.classPhase='active';s.classSeats=s.classGuests.length;s.classDuration=params(s).classTime;s.classRemaining=s.classDuration;s.classAuto=!!level(s,'coach');s.classGuests.forEach(g=>g.stage='exercising');}
  function consumptionTime(id,kind=0,s=null){const base=({coffee:26,breakfast:38,matcha:30,smoothie:32,latte:32,cake:40,toast:42}[id]||26)+kind*2;return base*(1-.1*Math.min(3,s?level(s,'tableService'):0));}
  function freeSeat(s){
    const seats=Layout.cafeSeats(s),busy=new Set([...s.seated.map(g=>g.seat.key),...s.departing.map(g=>g.reservedSeat).filter(Boolean)]),available=seats.filter(p=>!busy.has(p.key));
    const tables=Layout.tables(s).length,load=table=>seats.filter(p=>p.table===table&&busy.has(p.key)).length;
    available.sort((a,b)=>(a.table<0?10:load(a.table))-(b.table<0?10:load(b.table))||((a.table-s.seatCursor+tables)%tables)-((b.table-s.seatCursor+tables)%tables));
    const seat=available[0];if(seat)s.seatCursor=(seat.table+1)%tables;return seat;
  }
  function revenue(s,gross,cost) {s.earned+=gross;s.expenses+=cost;s.money+=gross-cost;}
  function daily(s,now) {
    const day=new Date(now).toISOString().slice(0,10);
    if(s.daily.day!==day)s.daily={day,count:0,claimed:false};
  }
  function step(s,dt,now=Date.now(),rng=Math.random) {
    dt=clamp(Number.isFinite(dt)?dt:0,0,1);
    const events=[],p=params(s),activityDt=dt*(active(s,now)?1.25:1); daily(s,now); s.seconds+=dt;s.classCooldown=Math.max(0,s.classCooldown-dt);
    s.arrival-=dt*(active(s,now)?1.6:1);
    if(s.arrival<=0){spawn(s,rng);s.arrival=p.arrival;}
    if(level(s,'coach')&&s.classPhase==='idle'&&s.classCooldown===0)startClass(s,now);
    if(s.classPhase==='boarding'){
      s.classBoardRemaining=Math.max(0,s.classBoardRemaining-dt);s.classRecruitRemaining-=dt;
      if(s.classBoardRemaining>0&&s.classRecruitRemaining<=0&&s.classGuests.length<p.capacity){
        if(rng()<.82){const spots=Layout.pilates(s),slot=s.classGuests.length;s.classGuests.push({...Traffic.create(s,spots[slot],'pilates',rng),slot});}
        s.classRecruitRemaining=classDemand(s);
      }
    }
    s.treatmentArrival-=dt;if(s.treatmentArrival<=0){for(const service of SERVICES)if(serviceConfig(s,service.id).automatic)startTreatment(s,service.id,rng);s.treatmentArrival=6;}
    Traffic.advance(s,dt);
    s.departing=s.departing.filter(g=>g.path.length>0);
    for(const order of s.queue)if(order.stage==='arrival'&&!order.path.length)order.stage='waiting';
    const sitting=[];
    for(const guest of s.seated){
      if(guest.stage==='walkingToSeat'){if(!guest.path.length)guest.stage='consuming';sitting.push(guest);continue;}
      guest.remaining=Math.max(0,guest.remaining-activityDt);
      if(guest.remaining>0){sitting.push(guest);continue;}
      guest.reservedSeat=guest.seat.key;Traffic.exit(guest);s.departing.push(guest);
    }
    s.seated=sitting;
    let workers=s.queue.filter(o=>o.worker&&o.remaining!==null).length;
    for(const o of s.queue)if(workers<p.baristas&&o.remaining===null&&o.stage==='waiting'){o.remaining=orderDuration(s,o.product);o.duration=o.remaining;o.worker=true;o.stage='preparing';workers++;}
    const pending=[];
    for(const o of s.queue) {
      if(o.stage==='waiting')o.wait+=dt;
      if(o.remaining!==null)o.remaining=Math.max(0,o.remaining-dt*(active(s,now)?1.5:1));
      const seat=o.remaining===0?freeSeat(s):null;
      if(o.remaining===0&&seat) {
        const product=PRODUCTS.find(x=>x.id===o.product),gross=orderPrice(s,o.product);
        const cost=(product.cost+(o.worker?.65:0))*(1-p.manager*.08);
        revenue(s,gross,cost);s.served++;s.happy++;s.daily.count++;s.reputation=clamp(s.reputation+.5,20,100);
        const duration=consumptionTime(o.product,o.kind,s);o.stage='walkingToSeat';o.seat=seat;o.remaining=duration;o.duration=duration;Traffic.send(o,Layout.insideRoute(seat),seat);s.seated.push(o);
        events.push({type:'sale',net:gross-cost,product:product.name,productId:product.id});
      } else if(o.remaining===null&&o.wait>o.patience){s.lost++;s.reputation=clamp(s.reputation-1.5,20,100);Traffic.exit(o);s.departing.push(o);events.push({type:'lost'});}
      else pending.push(o);
    }
    s.queue=pending;
    for(const guest of s.classGuests)if(guest.stage==='arrival'&&!guest.path.length)guest.stage='ready';
    if(s.classPhase==='boarding'&&(s.classBoardRemaining===0||s.classGuests.length===p.capacity)&&s.classGuests.every(g=>g.stage==='ready')){
      if(s.classGuests.length)beginClass(s);else{s.classPhase='idle';s.classCooldown=4;}
    }
    if(s.classPhase==='active') {
      s.classRemaining=Math.max(0,s.classRemaining-activityDt);
      if(s.classRemaining===0) {
        const gross=s.classSeats*p.classPrice,cost=s.classSeats*(2+(s.classAuto?3:0)+Math.min(2,level(s,'pilatesBands'))*.5);
        revenue(s,gross,cost);s.sessions++;s.students+=s.classSeats;s.reputation=clamp(s.reputation+1,20,100);
        events.push({type:'class',net:gross-cost});s.classSeats=0;s.classPhase='leaving';s.classGuests.forEach(Traffic.exit);
      }
    }
    if(s.classPhase==='leaving'){s.classGuests=s.classGuests.filter(g=>g.path.length);if(!s.classGuests.length){s.classPhase='idle';s.classCooldown=4;}}
    const ongoing=[];
    for(const treatment of s.treatments){
      if(treatment.stage==='arrival'){if(!treatment.path.length)treatment.stage='active';ongoing.push(treatment);continue;}
      treatment.remaining=Math.max(0,treatment.remaining-activityDt);
      if(treatment.remaining>0){ongoing.push(treatment);continue;}
      const config=serviceConfig(s,treatment.service),cost=config.cost+(treatment.automatic?(treatment.service==='yoga'?2:4):0);
      revenue(s,config.price,cost);s.wellnessRevenue+=config.price;s.completedServices[treatment.service]++;s.happy++;s.reputation=clamp(s.reputation+.3,20,100);
      events.push({type:'service',service:treatment.service,net:config.price-cost,first:s.completedServices[treatment.service]===1});
      treatment.reservedService=treatment.service;treatment.reservedSlot=treatment.slot;Traffic.exit(treatment);s.departing.push(treatment);
    }
    s.treatments=ongoing;
    if(p.branches) {const gross=p.branches*dt*3,cost=gross*.65;revenue(s,gross,cost);s.satellite+=gross-cost;}
    Progression.tick(s,dt,events,now);
    return events;
  }
  function estimate(s) {
    const p=params(s), products=menu(s),avg=products.reduce((a,x)=>a+orderPrice(s,x.id)-x.cost-.65,0)/products.length;
    const occupancyTime=products.reduce((sum,x)=>sum+consumptionTime(x.id,1.5,s),0)/products.length+9;
    const orders=p.baristas?Math.min(1/p.arrival,p.baristas*p.speed/4.5,p.seats/occupancyTime):0;
    const expectedStudents=Math.min(p.capacity,22/classDemand(s)*.7);
    const cafe=Math.max(0,avg*orders),pilates=level(s,'mat')&&level(s,'coach')?expectedStudents*(p.classPrice-5-Math.min(2,level(s,'pilatesBands'))*.5)/(p.classTime+22+14+14+4):0;
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
  const journeyMetrics=s=>({served:s.served,sessions:s.sessions,wellness:s.completedServices.pressotherapy+s.completedServices.massage,yoga:s.completedServices.yoga,menu:menu(s).length,area:Layout.footprint(s).area});
  const chapterStatus=s=>Progression.status(s,journeyMetrics(s));
  const claimChapter=s=>Progression.claimChapter(s,journeyMetrics(s));
  return {CHAPTERS:Progression.CHAPTERS,CAMPAIGNS:Progression.CAMPAIGNS,chapterStatus,claimChapter,campaignStatus:Progression.campaignStatus,campaignRequirement:Progression.requirement,startCampaign:Progression.startCampaign,claimCampaign:Progression.claimCampaign,cancelCampaign:Progression.cancelCampaign,VERSION,KEY,LEGACY_KEY,UPGRADES,GOALS,PRODUCTS,SERVICES,fresh,validate,params,level,price,requirement,unlocked,purchase,menu,spawn,startOrder,orderDuration,orderPrice,consumptionTime,startClass,startTreatment,serviceConfig,serviceOccupancy,rush,step,estimate,offline,value,claim,claimDaily};
});
