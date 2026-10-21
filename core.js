(function (root, factory) {
  const api = factory(typeof module==='object'&&module.exports?require('./layout.js'):root.BloomLayout,typeof module==='object'&&module.exports?require('./traffic.js'):root.BloomTraffic,typeof module==='object'&&module.exports?require('./progression.js'):root.BloomProgression,typeof module==='object'&&module.exports?require('./sports.js'):root.BloomSports,typeof module==='object'&&module.exports?require('./experience.js'):root.BloomExperience);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Bloom = api;
})(typeof globalThis === 'undefined' ? this : globalThis, function (Layout,Traffic,Progression,Sports,Experience) {
  'use strict';
  const VERSION = 2;
  const KEY = 'bloom-brew-save-v2', LEGACY_KEY = 'bloom-brew-save-v1';
  const UPGRADES = [
    ['machine','Cafetera de especialidad','Café de más calidad y preparación más rápida','☕','cafe',24,6],
    ['pastries','Vitrina de repostería','Desbloquea pedidos de desayunos','🥐','cafe',90,4],
    ['seats','Mesas acogedoras','Dos plazas más y más visitas','🪑','cafe',140,5],
    ['barista','Barista','Prepara pedidos automáticamente · salario por servicio','👩‍🍳','team',220,3],
    ['matcha','Matcha y chai','Una carta de bebidas de mayor margen','🍵','cafe',150,4],
    ['mat','Estudio de pilates','Abre el estudio y añade dos plazas por nivel','🧘','pilates',850,4],
    ['coach','Instructora de pilates','Automatiza las clases · salario por sesión','🤸','team',620,2],
    ['reformer','Pilates reformer','Equipamiento premium y mayor precio por plaza','🛏️','pilates',1600,4],
    ['terrace','Terraza botánica','Cuatro plazas y más demanda de café','🌿','cafe',2900,2],
    ['classes','Sala de clases en grupo','Cuatro plazas extra de pilates','👯','zones',2400,2],
    ['manager','Gerente','Mejora productividad y reduce costes variables','🧑‍💼','team',500,2],
    ['spa','Wellness y smoothies','Carta premium y sesiones de mayor valor','🥤','pilates',2200,2],
    ['second','Nueva sede','Abre hasta dos sedes satélite con margen limitado','🏬','cafe',21000,2],
    ['cafeWing','Ampliar cafetería','Construye un salón lateral con nuevas mesas','🏗️','zones',1800,1],
    ['wellnessWing','Ala de recuperación','Amplía el centro con una sala wellness','🏗️','zones',3200,1],
    ['yogaWing','Sala de yoga','Construye una sala al fondo del centro','🏗️','zones',2600,1],
    ['pressotherapy','Tumbonas de presoterapia','Una tumbona con botas por nivel · hasta dos','🦵','wellness',1100,2],
    ['pressureCare','Equipo de presoterapia','Mejores botas, consola y sesiones más rentables','⚙️','wellness',780,3],
    ['massage','Cabinas de masaje','Una camilla equipada por nivel · hasta dos','💆','wellness',1700,2],
    ['massageCare','Equipamiento de masaje','Calentador de toallas, aceites y mejor servicio','🕯️','wellness',920,3],
    ['recoveryComfort','Confort de la sala','Plantas, cuadros y detalles premium','🪴','wellness',500,3],
    ['therapist','Especialista wellness','Automatiza presoterapia y masajes','🧑‍⚕️','team',1250,2],
    ['yoga','Esterillas de yoga','Dos plazas nuevas por nivel','🧘','yoga',900,3],
    ['yogaCare','Accesorios de yoga','Bloques y accesorios para la sala','🕯️','yoga',560,3],
    ['cafeDecor','Ambientación del café','Plantas, lámparas y decoración por nivel','🌿','cafe',240,3],
    ['roaster','Tostador y molinillo','Más calidad y una nueva estación de café','⚙️','cafe',720,2],
    ['brewBar','Barra de filtrados','Drippers y jarras · café más rápido y de mayor valor','🫖','cafe',40,3],
    ['bakeryOven','Horno de obrador','Horno y bandejas · desayunos más rápidos y rentables','🥖','cafe',55,3],
    ['cafeLounge','Rincón de lectura','Librería y sillones · mejora la calidad de la carta','📚','cafe',120,3],
    ['tableService','Servicio de mesas','Consumos más ágiles y sillas libres antes · hasta −30 %','🍽️','cafe',180,3],
    ['latteBar','Lattes de autor','Nueva receta con leche y estación de espumado','🥛','cafe',400,3],
    ['cakeDisplay','Tartas artesanas','Porciones de tarta y expositor refrigerado','🍰','cafe',450,3],
    ['toastKitchen','Tostadas de aguacate','Nueva cocina de desayunos con tostador','🥑','cafe',500,3],
    ['pilatesBands','Sesiones con bandas','Bandas elásticas durante las clases · servicio premium','🎗️','pilates',640,2],
    ['soundRitual','Ritual sonoro de yoga','Cuencos sonoros durante la sesión de yoga','🔔','yoga',720,2],
    ['aromaMassage','Masaje aromático','Difusores y aceites durante el masaje','🪻','wellness',860,2],
    ['pilatesKit','Accesorios de fuerza','Pesas, pelotas y aros para cada sesión','🏋️','pilates',450,3],
    ['studioMirror','Espejos y barras','Amplía los espejos y reduce el tiempo de clase','🪞','pilates',240,3],
    ['studioAudio','Ambiente del estudio','Altavoces e iluminación para clases premium','🎵','pilates',890,3],
    ['yogaBolsters','Cojines y mantas','Bolsters, textiles y sesiones de mayor valor','🧶','yoga',380,3],
    ['zenGarden','Jardín zen','Bambú, piedras y bonsáis en tu sala de yoga','🎋','yoga',600,3],
    ['yogaTea','Rincón de infusiones','Tetera y tazas para el ritual después de yoga','🫖','yoga',950,2],
    ['pressurePump','Central de compresión','Bombas y tubos · sesiones más rápidas','🦵','wellness',980,3],
    ['massageStones','Piedras calientes','Calentador y bandejas para un masaje premium','🪨','wellness',400,3],
    ['wellnessLinen','Textiles premium','Toallas y mantas de calidad para los tratamientos','🧺','wellness',420,3]
    ,['crossfitWing','Box de entrenamiento aesthetic','Amplía el centro con una zona de fuerza de 48 m²','🏗️','zones',5200,1]
    ,['functionalStations','Circuito funcional','Dos estaciones con pesas por nivel · hasta seis','🏋️','crossfit',1400,3]
    ,['strengthRig','Rack y fuerza','Barras, discos y sesiones más rápidas y rentables','💪','crossfit',1100,3]
    ,['gymAtmosphere','Ambiente del box','Espejos, luz cálida y taquillas premium','✨','crossfit',780,3]
    ,['functionalCoach','Entrenador funcional','Organiza y dirige circuitos automáticamente','🧑‍🏫','team',1800,1]
    ,['padelWing','Club de pádel','Añade una zona deportiva de 80 m²','🏗️','zones',9000,1]
    ,['padelCourt','Pista de pádel','Pista con red y cuatro jugadores por partido','🎾','padel',2200,1]
    ,['padelKit','Palas y entrenamiento','Material premium · partidos más ágiles','🏸','padel',950,3]
    ,['courtLights','Iluminación de pista','Focos y acabados de un club premium','💡','padel',1400,2]
    ,['padelCoach','Monitor de pádel','Organiza partidos de cuatro automáticamente','🧑‍🏫','team',2100,1]
  ].map(([id,name,desc,emoji,cat,base,max])=>({id,name,desc,emoji,cat,base,max}));
  const ROOMS=Layout.ROOMS;
  for(const r of ROOMS)UPGRADES.push(...[[r.id+'Wing',r.name,'Construye '+(r.area||56)+' m² con acceso desde el paseo',r.icon,'zones',r.base,1],[r.id,r.equipment||'Puestos de '+r.name,r.equipmentDesc||'Dos plazas equipadas por nivel',r.icon,'activities',Math.round(r.base*.22),3],[r.id+'Quality','Servicio premium · '+r.name,'Mejora tarifa y rapidez; añade equipamiento', '✨','activities',Math.round(r.base*.12),3],[r.id+'Decor','Ambiente · '+r.name,'Más confort y tarifa; nueva decoración','🪴','activities',Math.round(r.base*.08),3],[r.id+'Staff','Especialista · '+r.name,'Atención automática con salario por sesión','🧑‍🏫','team',Math.round(r.base*.18),1]].map(([id,name,desc,emoji,cat,base,max])=>({id,name,desc,emoji,cat,base,max})));
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
    {id:'latte',name:'Latte de autor',icon:'🥛',price:11,cost:2.6,time:4.8},
    {id:'cake',name:'Tarta artesana',icon:'🍰',price:11,cost:3.8,time:4.5},
    {id:'toast',name:'Tostada de aguacate',icon:'🥑',price:14,cost:5,time:6.2}
  ];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const level=(s,id)=>s.levels[id]||0;
  const fresh=(now=Date.now())=>({...Progression.fresh(now),...Sports.fresh(),...Experience.fresh(),version:VERSION,money:20,earned:0,expenses:0,rewards:0,served:0,happy:0,lost:0,sessions:0,students:0,levels:{},claimed:[],last:now,seconds:0,reputation:75,tutorial:0,boostUntil:0,rushReady:0,classRemaining:0,classSeats:0,classPhase:'idle',classGuests:[],classBoardRemaining:0,classRecruitRemaining:0,classCooldown:0,departing:[],seatCursor:0,nextId:1,arrival:0.5,daily:{day:new Date(now).toISOString().slice(0,10),count:0,claimed:false},queue:[],seated:[],satellite:0,treatments:[],treatmentArrival:2,completedServices:Object.fromEntries(['pressotherapy','massage','yoga',...ROOMS.map(r=>r.id)].map(id=>[id,0])),wellnessRevenue:0});
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
    if(data.completedServices!==undefined){if(!data.completedServices||typeof data.completedServices!=='object'||Array.isArray(data.completedServices))throw Error('Servicios inválidos');for(const [key,n]of Object.entries(data.completedServices)){if(!SERVICES.some(d=>d.id===key)||!Number.isInteger(n)||n<0||n>1e12)throw Error('Servicios inválidos');s.completedServices[key]=n;}}
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
    Sports.restore(data,s);Experience.restore(data,s);
    return s;
  }
  function params(s) {
    const l=id=>Math.min(level(s,id),UPGRADES.find(u=>u.id===id).max);
    const seats=Layout.cafeSeats(s).length;
    const arrival=(s.specialty==='brunch'?1/1.15:s.specialty==='balanced'?1:1.12)*Math.max(1.25,6.5-l('seats')*.55-l('terrace')*.95-l('matcha')*.18-l('cafeDecor')*.24)*(1.15-s.reputation/300);
    const speed=1+l('machine')*.18+l('manager')*.15+l('roaster')*.06;
    const capacity=2+l('mat')*2+l('classes')*4;
    const classPrice=Experience.multiplier(s,'pilates')*(40+l('reformer')*8+l('spa')*4+l('pilatesKit')*3+l('studioAudio')*3+l('pilatesBands')*4);
    return {seats,arrival,speed,baristas:l('barista'),capacity,classPrice,classTime:Math.max(25,45-l('coach')*4-l('studioMirror')),quality:1+l('machine')*.12+l('pastries')*.05+l('matcha')*.04+l('cafeDecor')*.04+l('roaster')*.08+l('cafeLounge')*.025+(l('pastries')?.08:0)+(l('matcha')?.14:0)+(l('latteBar')?.03:0)+(l('cakeDisplay')?.05:0),manager:l('manager'),branches:l('second'),area:Layout.footprint(s).area};
  }
  const price=(s,u)=>Math.ceil(u.base*Math.pow(1.65,level(s,u.id)));
  function requirement(s,u) {
    const room=ROOMS.find(r=>u.id===r.id||u.id.startsWith(r.id));if(room){if(u.id===room.id+'Wing'&&room.prerequisite&&!level(s,room.prerequisite))return 'Abre primero '+UPGRADES.find(u=>u.id===room.prerequisite).name;if(u.id===room.id+'Wing')return !level(s,'mat')?'Abre primero el estudio de pilates':!level(s,'padelWing')&&!level(s,'crossfitWing')?'Abre primero una zona deportiva':'';if(!level(s,room.id+'Wing'))return 'Construye '+room.name;if(u.id!==room.id&&!level(s,room.id))return 'Instala los primeros puestos';return '';}
    if(u.id==='crossfitWing'&&s.sessions<6)return 'Completa 6 clases de pilates';
    if(u.id==='padelWing'&&s.sessions<10)return 'Completa 10 clases de pilates';
    if(u.id==='functionalStations'&&!Layout.zones(s).crossfit)return 'Construye el box de entrenamiento';
    if(['strengthRig','gymAtmosphere','functionalCoach'].includes(u.id)&&!level(s,'functionalStations'))return 'Instala un circuito funcional';
    if(u.id==='padelCourt'&&!Layout.zones(s).padel)return 'Construye el club de pádel';
    if(['padelKit','courtLights','padelCoach'].includes(u.id)&&!level(s,'padelCourt'))return 'Instala la pista de pádel';
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
  const SERVICES=[{id:'pressotherapy',name:'Presoterapia',icon:'🦵'},{id:'massage',name:'Masaje',icon:'💆'},{id:'yoga',name:'Yoga',icon:'🧘'},...ROOMS.map(({id,name,icon})=>({id,name,icon}))];
  function baseServiceConfig(s,id){const l=x=>Math.min(level(s,x),UPGRADES.find(u=>u.id===x).max),capacity=Layout.serviceSlots(s,id).length,comfort=l('recoveryComfort');
    const room=ROOMS.find(r=>r.id===id);if(room)return {capacity,duration:room.duration-l(id+'Quality')*3,price:room.price+l(id+'Quality')*(room.qualityBonus||40)+l(id+'Decor')*(room.decorBonus||22),cost:room.cost+l(id+'Quality')*3,salary:22,automatic:l(id+'Staff')>0,travel:room.travel};
    if(id==='pressotherapy')return {capacity,duration:36-l('pressureCare')*3-Math.max(0,l('therapist')-1)*2-l('pressurePump')*2,price:90+l('pressureCare')*9+comfort*4+l('pressurePump')*6+l('wellnessLinen')*3,cost:12,salary:8,automatic:l('therapist')>0,travel:6};
    if(id==='massage')return {capacity,duration:42-l('massageCare')*3-Math.max(0,l('therapist')-1)*2,price:120+l('massageCare')*12+comfort*4+l('massageStones')*8+l('wellnessLinen')*3+l('aromaMassage')*12,cost:18+l('massageStones')+l('aromaMassage'),salary:8,automatic:l('therapist')>0,travel:6};
    if(id==='yoga')return {capacity,duration:30-l('yogaCare')*2-l('yogaBolsters')-l('soundRitual'),price:55+l('yogaCare')*5+l('yogaBolsters')*2+l('zenGarden')*3+l('yogaTea')*5+l('soundRitual')*4,cost:4+l('yogaTea')*.5+l('soundRitual')*.5,salary:3,automatic:l('coach')>0,travel:12};
    return {capacity:0,duration:1,price:0,cost:0,automatic:false,travel:0};
  }
  function serviceConfig(s,id){const c=baseServiceConfig(s,id);return {...c,price:c.price*Experience.multiplier(s,id)};}
  function serviceOccupancy(s,id){return s.treatments.filter(t=>t.service===id).length+[...s.departing,...s.visits].filter(t=>t.reservedService===id).length;}
  function startTreatment(s,id,rng=Math.random){
    if(!SERVICES.some(x=>x.id===id))return false;
    const p=serviceConfig(s,id),spots=Layout.serviceSlots(s,id),taken=new Set([...s.treatments.filter(t=>t.service===id).map(t=>t.slot),...[...s.departing,...s.visits].filter(t=>t.reservedService===id).map(t=>t.reservedSlot)]);
    const slot=spots.findIndex((_,i)=>!taken.has(i));if(slot<0)return false;
    s.treatments.push({...Traffic.create(s,spots[slot],'treatment',rng),service:id,slot,remaining:p.duration,duration:p.duration,automatic:p.automatic,price:p.price,cost:p.cost,salary:p.automatic?p.salary:0});return true;
  }
  function purchase(s,id) {
    const u=UPGRADES.find(u=>u.id===id);
    if(!u||!unlocked(s,u)||level(s,id)>=u.max)return false;
    const cost=price(s,u); if(s.money<cost)return false;
    s.money-=cost; s.levels[id]=level(s,id)+1; return true;
  }
  function menu(s) {const unlock={breakfast:'pastries',matcha:'matcha',smoothie:'spa',latte:'latteBar',cake:'cakeDisplay',toast:'toastKitchen'};return PRODUCTS.filter(p=>p.id==='coffee'||level(s,unlock[p.id]));}
  function spawn(s,rng=Math.random,premium=false) {
    const slots=Layout.queueSlots(),used=new Set(s.queue.map(o=>o.queueSlot)),slot=slots.find(p=>!used.has(p.index));if(!slot)return false;
    const types=menu(s),product=Progression.chooseProduct(s,types,rng);
    s.queue.push({...Traffic.create(s,slot,'cafe',rng),queueSlot:slot.index,product:product.id,premium,outfit:premium?'premium':undefined,wait:0,patience:(28+rng()*12)*(premium?1.5:1),remaining:null,worker:false});return true;
  }
  function startOrder(s) {
    if(s.queue.some(o=>o.remaining!==null&&!o.worker))return false;
    const order=s.queue.find(o=>o.remaining===null&&o.stage==='waiting'); if(!order)return false;
    order.remaining=orderDuration(s,order.product);order.duration=order.remaining;
    order.worker=false;order.stage='preparing';return true;
  }
  function orderDuration(s,id){const product=PRODUCTS.find(p=>p.id===id),recipe={latte:'latteBar',cake:'cakeDisplay',toast:'toastKitchen'}[id];return product.time/params(s).speed/(1+(recipe?Math.min(3,level(s,recipe))*.06:id==='coffee'?Math.min(3,level(s,'brewBar'))*.08:id==='breakfast'?Math.min(3,level(s,'bakeryOven'))*.1:0));}
  function orderPrice(s,id){const product=PRODUCTS.find(p=>p.id===id),recipe={latte:'latteBar',cake:'cakeDisplay',toast:'toastKitchen'}[id];return Experience.multiplier(s,'cafe')*(product.price*params(s).quality+(recipe?Math.max(0,Math.min(3,level(s,recipe))-1)*6:id==='coffee'?Math.min(3,level(s,'brewBar'))*.35:id==='breakfast'?Math.min(3,level(s,'bakeryOven'))*.4:0));}
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
  function classDemand(s){return (s.specialty==='active'?1/1.2:1)*Math.max(1,4.8-Math.min(4,level(s,'mat'))*.35-Math.min(4,level(s,'reformer'))*.25-Math.min(3,level(s,'studioAudio'))*.2-Math.min(2,level(s,'spa'))*.1-s.reputation/150);}
  function beginClass(s){s.classPhase='active';s.classSeats=s.classGuests.length;s.classDuration=params(s).classTime;s.classRemaining=s.classDuration;s.classAuto=!!level(s,'coach');s.classPrice=params(s).classPrice;s.classGuests.forEach(g=>g.stage='exercising');}
  function consumptionTime(id,kind=0,s=null){const base=({coffee:26,breakfast:38,matcha:30,smoothie:32,latte:32,cake:40,toast:42}[id]||26)+kind*2;return base*(1-.1*Math.min(3,s?level(s,'tableService'):0));}
  function freeSeat(s){
    const seats=Layout.cafeSeats(s),busy=new Set([...s.seated.map(g=>g.seat.key),...[...s.departing,...s.visits].map(g=>g.reservedSeat).filter(Boolean)]),available=seats.filter(p=>!busy.has(p.key));
    const tables=Layout.tables(s).length,load=table=>seats.filter(p=>p.table===table&&busy.has(p.key)).length;
    available.sort((a,b)=>(a.table<0?10:load(a.table))-(b.table<0?10:load(b.table))||((a.table-s.seatCursor+tables)%tables)-((b.table-s.seatCursor+tables)%tables));
    const seat=available[0];if(seat)s.seatCursor=(seat.table+1)%tables;return seat;
  }
  // Keep the same visitor and outfit across a two-stop plan. Waiting spots are
  // separate from service capacity; a full room never creates an extra bed/chair.
  function visitTarget(s,source,rng){
    if(rng()>=(s.specialty==='balanced'?.2:.45))return null;
    const recovery=SERVICES.filter(d=>d.id!=='yoga'&&serviceConfig(s,d.id).capacity&&serviceConfig(s,d.id).automatic);
    if((source==='padel'||source==='crossfit'||source==='cafe')&&recovery.length)return recovery[Math.floor(rng()*recovery.length)%recovery.length].id;
    if(source!=='cafe'&&level(s,'barista'))return 'cafe';
    return null;
  }
  function finishVisit(s,a,source,rng){
    if(a.premium&&!a.premiumTipPaid){a.premiumTipPaid=true;const tip=Math.round(Math.max(15,estimate(s).total*60*.75)*100)/100;revenue(s,tip,0);s.premiumTips+=tip;s.premiumVisits++;s.premiumEvent={type:'premiumTip',net:tip};}

    const target=!a.comboSteps&&s.visits.length<6?visitTarget(s,source,rng):null;
    if(target){
      const slots=Array.from({length:6},(_,i)=>({x:2.1+i*.72,z:5.7,index:i})),taken=new Set(s.visits.map(v=>v.lobbySlot)),spot=slots.find(v=>!taken.has(v.index));
      a.outfit=a.outfit||a.sport||(a.type==='pilates'?'pilates':a.service==='yoga'?'yoga':a.type==='treatment'?'wellness':'cafe');
      a.comboSteps=1;a.nextService=target;a.lobbySlot=spot.index;a.stage='transfer';a.wait=0;a.patience=55+Math.min(3,level(s,'recoveryComfort'))*5;a.reservationOrigin={...a.position};
      const route=Layout.exitRoute({...a.position,sport:a.sport,activity:a.destination?.activity},1).slice(0,-1).concat(Layout.entryRoute(spot));Traffic.send(a,route,spot);s.visits.push(a);return true;
    }
    Experience.rate(s,a);Traffic.exit(a);return false;
  }
  function updateVisits(s,dt,events,rng){
    const pending=[];
    for(const a of s.visits){
      if(a.reservationOrigin&&Math.hypot(a.position.x-a.reservationOrigin.x,a.position.z-a.reservationOrigin.z)>1){delete a.reservedService;delete a.reservedSlot;delete a.reservedSeat;delete a.reservationOrigin;}
      if(a.path.length){pending.push(a);continue;}
      a.stage='visitWaiting';a.wait+=dt;a.visitWait=(a.visitWait||0)+dt;
      let target=null;
      if(a.nextService==='cafe'){
        target=Layout.queueSlots().find(p=>!s.queue.some(o=>o.queueSlot===p.index));
        if(target){const types=menu(s),preferred=types.find(p=>p.id===(s.specialty==='brunch'?'breakfast':'matcha'))||types[0];Object.assign(a,{type:'cafe',sport:undefined,service:undefined,queueSlot:target.index,product:preferred.id,remaining:null,worker:false,stage:'arrival'});s.queue.push(a);}
      }else{
        const id=a.nextService,spots=Layout.serviceSlots(s,id),busy=new Set([...s.treatments.filter(t=>t.service===id).map(t=>t.slot),...[...s.departing,...s.visits.filter(v=>v!==a)].filter(t=>t.reservedService===id).map(t=>t.reservedSlot)]),slot=spots.findIndex((_,i)=>!busy.has(i));
        if(slot>=0){target=spots[slot];const c=serviceConfig(s,id);Object.assign(a,{type:'treatment',sport:undefined,service:id,slot,duration:c.duration,remaining:c.duration,automatic:c.automatic,price:c.price,cost:c.cost,salary:c.automatic?c.salary:0,stage:'arrival'});s.treatments.push(a);}
      }
      if(target){Traffic.send(a,Layout.insideRoute(target),target);events.push({type:'comboNext',service:a.nextService});}
      else if(a.wait>=a.patience){Experience.rate(s,a,true);s.lost++;Traffic.exit(a);s.departing.push(a);events.push({type:'lost'});}
      else pending.push(a);
    }
    s.visits=pending;
  }
  function revenue(s,gross,cost) {s.earned+=gross;s.expenses+=cost;s.money+=gross-cost;}
  function daily(s,now) {
    const day=new Date(now).toISOString().slice(0,10);
    if(s.daily.day!==day)s.daily={day,count:0,claimed:false};
  }
  function step(s,dt,now=Date.now(),rng=Math.random) {
    dt=clamp(Number.isFinite(dt)?dt:0,0,1);s.specialtyCooldown=Math.max(0,s.specialtyCooldown-dt);
    const events=[],p=params(s),activityDt=dt*(active(s,now)?1.25:1); daily(s,now); s.seconds+=dt;s.classCooldown=Math.max(0,s.classCooldown-dt);
    updateVisits(s,dt,events,rng);
    s.premiumArrival=Math.max(0,s.premiumArrival-dt);if(s.premiumArrival===0&&level(s,'barista')&&spawn(s,rng,true)){s.premiumArrival=180+rng()*120;events.push({type:'premiumArrival'});}
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
    s.treatmentArrival-=dt;if(s.treatmentArrival<=0){for(const service of SERVICES)if(serviceConfig(s,service.id).automatic)startTreatment(s,service.id,rng);s.treatmentArrival=s.specialty==='recovery'?4.8:6;}
    Sports.prepare(s,dt,rng);
    Traffic.advance(s,dt);
    s.departing=s.departing.filter(g=>g.path.length>0);
    for(const order of s.queue)if(order.stage==='arrival'&&!order.path.length)order.stage='waiting';
    const sitting=[];
    for(const guest of s.seated){
      if(guest.stage==='walkingToSeat'){if(!guest.path.length)guest.stage='consuming';sitting.push(guest);continue;}
      guest.remaining=Math.max(0,guest.remaining-activityDt);
      if(guest.remaining>0){sitting.push(guest);continue;}
      guest.reservedSeat=guest.seat.key;if(!finishVisit(s,guest,'cafe',rng))s.departing.push(guest);
    }
    s.seated=sitting;
    let workers=s.queue.filter(o=>o.worker&&o.remaining!==null).length;
    for(const o of s.queue)if(workers<p.baristas&&o.remaining===null&&o.stage==='waiting'){o.remaining=orderDuration(s,o.product);o.duration=o.remaining;o.worker=true;o.stage='preparing';workers++;}
    const pending=[];
    for(const o of s.queue) {
      if(o.stage!=='arrival'){o.wait+=dt;o.visitWait=(o.visitWait||0)+dt;}
      if(o.remaining!==null)o.remaining=Math.max(0,o.remaining-dt*(active(s,now)?1.5:1));
      const seat=o.remaining===0?freeSeat(s):null;
      if(o.remaining===0&&seat) {
        const product=PRODUCTS.find(x=>x.id===o.product),gross=orderPrice(s,o.product);
        const cost=(product.cost+(o.worker?.65:0))*(1-p.manager*.08);
        revenue(s,gross,cost);s.served++;s.happy++;s.daily.count++;s.reputation=clamp(s.reputation+.5,20,100);
        const duration=consumptionTime(o.product,o.kind,s);o.stage='walkingToSeat';o.seat=seat;o.remaining=duration;o.duration=duration;Traffic.send(o,Layout.insideRoute(seat),seat);s.seated.push(o);
        events.push({type:'sale',net:gross-cost,product:product.name,productId:product.id});
      } else if(o.wait>o.patience){Experience.rate(s,o,true);s.lost++;s.reputation=clamp(s.reputation-1.5,20,100);Traffic.exit(o);s.departing.push(o);events.push({type:'lost'});}
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
        const gross=s.classSeats*(s.classPrice??p.classPrice),cost=s.classSeats*(2+(s.classAuto?3:0)+Math.min(2,level(s,'pilatesBands'))*.5);
        revenue(s,gross,cost);s.sessions++;s.students+=s.classSeats;s.reputation=clamp(s.reputation+1,20,100);
        events.push({type:'class',net:gross-cost});s.classSeats=0;s.classPhase='leaving';s.classGuests=s.classGuests.filter(g=>!finishVisit(s,g,'pilates',rng));
      }
    }
    if(s.classPhase==='leaving'){s.classGuests=s.classGuests.filter(g=>g.path.length);if(!s.classGuests.length){s.classPhase='idle';s.classCooldown=4;}}
    const ongoing=[];
    for(const treatment of s.treatments){
      if(treatment.stage==='arrival'){if(!treatment.path.length)treatment.stage='active';ongoing.push(treatment);continue;}
      treatment.remaining=Math.max(0,treatment.remaining-activityDt);
      if(treatment.remaining>0){ongoing.push(treatment);continue;}
      const config=serviceConfig(s,treatment.service),cost=(treatment.cost??config.cost)+(treatment.salary??(treatment.automatic?config.salary:0));
      revenue(s,treatment.price??config.price,cost);s.wellnessRevenue+=treatment.price??config.price;s.completedServices[treatment.service]=(s.completedServices[treatment.service]||0)+1;s.happy++;s.reputation=clamp(s.reputation+.3,20,100);
      events.push({type:'service',service:treatment.service,net:(treatment.price??config.price)-cost,first:s.completedServices[treatment.service]===1});
      treatment.reservedService=treatment.service;treatment.reservedSlot=treatment.slot;if(!finishVisit(s,treatment,treatment.service,rng))s.departing.push(treatment);
    }
    s.treatments=ongoing;
    if(p.branches) {const gross=p.branches*dt*30,cost=gross*.65;revenue(s,gross,cost);s.satellite+=gross-cost;}
    Sports.update(s,activityDt,events,revenue,(a,id)=>finishVisit(s,a,id,rng));
    if(s.premiumEvent){events.push(s.premiumEvent);delete s.premiumEvent;}
    Progression.tick(s,dt,events,now);
    return events;
  }
  function estimate(s) {
    const p=params(s), products=menu(s),avg=products.reduce((a,x)=>a+orderPrice(s,x.id)-(x.cost+.65)*(1-p.manager*.08),0)/products.length;
    const occupancyTime=products.reduce((sum,x)=>sum+consumptionTime(x.id,1.5,s),0)/products.length+9;
    const preparation=products.reduce((sum,x)=>sum+orderDuration(s,x.id),0)/products.length;
    const orders=p.baristas?Math.min(1/p.arrival,p.baristas*p.speed/4.5,p.seats/occupancyTime,Layout.queueSlots().length/(10+preparation)):0;
    const expectedStudents=Math.min(p.capacity,22/classDemand(s)*.7);
    const cafe=Math.max(0,avg*orders),pilates=level(s,'mat')&&level(s,'coach')?expectedStudents*(p.classPrice-5-Math.min(2,level(s,'pilatesBands'))*.5)/(p.classTime+38+Math.min(16,Math.max(0,expectedStudents-4)*16/11.4)):0;
    const services=Object.fromEntries(SERVICES.map(service=>{const c=serviceConfig(s,service.id);return [service.id,c.automatic?c.capacity*(c.price-c.cost-c.salary)/(c.duration+c.travel+6):0];}));
    const sporting=Sports.estimateRooms(s);
    const wellness=Object.values(services).reduce((sum,n)=>sum+n,0),sports=Object.values(sporting).reduce((sum,n)=>sum+n,0);
    const rooms={cafe,pilates,yoga:services.yoga,wellness:services.pressotherapy+services.massage,...sporting,...Object.fromEntries(ROOMS.map(r=>[r.id,services[r.id]])),branches:p.branches*10.5};
    return {cafe,pilates,wellness,sports,services,rooms,total:Object.values(rooms).reduce((sum,n)=>sum+n,0)};
  }
  function upgradeEconomy(s,id){
    const u=UPGRADES.find(u=>u.id===id);if(!u||level(s,id)>=u.max||requirement(s,u))return null;
    const next={...s,levels:{...s.levels,[id]:level(s,id)+1}},delta=Math.max(0,(estimate(next).total-estimate(s).total)*60);
    return {deltaPerMinute:delta,cost:price(s,u),paybackMinutes:delta>1e-6?price(s,u)/delta:null};
  }
  function roomEconomy(s,upgradeId){
    const upgrade=UPGRADES.find(u=>u.id===upgradeId);if(!upgrade)return null;
    const special={barista:'cafe',manager:'cafe',coach:'pilates',therapist:'wellness',functionalCoach:'crossfit',padelCoach:'padel',cafeWing:'cafe',crossfitWing:'crossfit',padelWing:'padel',wellnessWing:'wellness',yogaWing:'yoga',classes:'pilates',second:'branches'};
    const room=ROOMS.find(r=>upgradeId===r.id||upgradeId.startsWith(r.id));const id=room?.id||special[upgradeId]||upgrade.cat,names={cafe:'Cafetería',pilates:'Pilates',yoga:'Yoga',wellness:'Recuperación',crossfit:'Entrenamiento funcional',padel:'Pádel',branches:'Sedes satélite'};
    for(const r of ROOMS)names[r.id]=r.name;if(!names[id])return null;
    const e=estimate(s),rate=e.rooms[id],rank=rate>0?1+Object.values(e.rooms).filter(n=>n>rate+1e-9).length:0;
    const available=!!room&&serviceConfig(s,id).capacity>0||id==='cafe'||id==='branches'&&level(s,'second')>0||id==='pilates'&&level(s,'mat')>0||id==='wellness'&&['pressotherapy','massage'].some(x=>serviceConfig(s,x).capacity>0)||id==='yoga'&&serviceConfig(s,'yoga').capacity>0||['crossfit','padel'].includes(id)&&Sports.config(s,id).capacity>0;
    return {id,name:names[id],perMinute:rate*60,share:e.total>0?rate/e.total*100:0,rank,
      note:!available?'Instala el equipamiento de esta zona para generar ingresos.':rate<=0?'Atención manual: cobras al atender. Contrata personal para generar ingresos automáticos.':'Estimación automática tras materiales y salarios. La ocupación real puede variar.',
      breakdown:id==='wellness'?[{name:'Presoterapia',perMinute:e.services.pressotherapy*60},{name:'Masaje',perMinute:e.services.massage*60}]:[]};
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
  const journeyMetrics=s=>({served:s.served,sessions:s.sessions,wellness:s.completedServices.pressotherapy+s.completedServices.massage,yoga:s.completedServices.yoga,menu:menu(s).length,crossfit:s.sportSessions.crossfit,padel:s.sportSessions.padel,area:Layout.footprint(s).area});
  const chapterStatus=s=>Progression.status(s,journeyMetrics(s));
  const claimChapter=s=>Progression.claimChapter(s,journeyMetrics(s));
  return {SPECIALTIES:Experience.SPECIALTIES,specialtyRequirement:Experience.requirement,selectSpecialty:Experience.select,SPORTS:Sports.SPORTS,sportConfig:Sports.config,startSport:Sports.start,CHAPTERS:Progression.CHAPTERS,CAMPAIGNS:Progression.CAMPAIGNS,chapterStatus,claimChapter,campaignStatus:Progression.campaignStatus,campaignRequirement:Progression.requirement,startCampaign:Progression.startCampaign,claimCampaign:Progression.claimCampaign,cancelCampaign:Progression.cancelCampaign,VERSION,KEY,LEGACY_KEY,UPGRADES,GOALS,PRODUCTS,SERVICES,fresh,validate,params,level,price,requirement,unlocked,purchase,menu,spawn,startOrder,orderDuration,orderPrice,consumptionTime,startClass,startTreatment,serviceConfig,serviceOccupancy,rush,step,estimate,roomEconomy,upgradeEconomy,offline,value,claim,claimDaily};
});
