(() => {
  'use strict';
  const B=window.Bloom,$=id=>document.getElementById(id),fmt=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:n>=100?0:2}).format(n);
  let s=B.fresh(),filter='all',toastTimer,dirty=true,loadWarning='',readOnly=false,selectedZone=null,venueScene,serviceMarkup='';
  function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);}
  function celebrate(){for(let i=0;i<12;i++){const star=document.createElement('span');star.className='celebration-star';star.textContent=i%3?'✦':'🌿';star.style.left=(12+i*6.5)+'%';star.style.top=(36+(i%4)*8)+'%';star.style.animationDelay=i*.025+'s';$('app').append(star);setTimeout(()=>star.remove(),2100);}}
  try {
    const current=localStorage.getItem(B.KEY),legacy=localStorage.getItem(B.LEGACY_KEY),raw=current||legacy;
    if(raw)s=B.validate(JSON.parse(raw));
    if(!current&&legacy) {localStorage.setItem(B.KEY+'-legacy-backup',legacy);loadWarning='Partida anterior migrada: conservamos tu dinero, mejoras y premios.';}
  } catch(error) {readOnly=true;loadWarning='No pudimos leer la partida. Exporta una copia antes de importar o reiniciar; no sobrescribiremos el guardado.';}
  const offline=B.offline(s);
  function save() {
    if(readOnly)return false;
    try {
      s.last=Date.now();
      const previous=localStorage.getItem(B.KEY);
      if(previous) {try{B.validate(JSON.parse(previous));localStorage.setItem(B.KEY+'-backup',previous);}catch{}}
      localStorage.setItem(B.KEY,JSON.stringify(s));
      $('save-status').textContent='Guardado en este dispositivo · '+new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
      $('save-status').classList.remove('error');return true;
    } catch { $('save-status').textContent='No se pudo guardar. Exporta tu partida para conservarla.';$('save-status').classList.add('error');return false; }
  }
  const lockedReason=u=>B.requirement(s,u);
  function benefit(u) {
    if(u.id==='tableService')return `−10 % de tiempo de consumo por nivel · ahora −${Math.min(3,B.level(s,u.id))*10} % · máximo −30 %. Se aplica a los próximos pedidos.`;
    const descriptions={latteBar:'Desbloquea latte · +6 % rapidez por nivel; niveles 2–3: +0,50 € por taza',cakeDisplay:'Desbloquea tartas · +6 % rapidez por nivel; niveles 2–3: +0,50 € por porción',toastKitchen:'Desbloquea tostadas · +6 % rapidez por nivel; niveles 2–3: +0,50 € por tostada',pilatesBands:'+2 € por alumno y nivel · material +0,50 €',soundRitual:'−1 s y +2 € por sesión y nivel · coste +0,50 €',aromaMassage:'+4 € por masaje y nivel · aceites +1 €',machine:'Más velocidad y precio por taza',pastries:'Pedidos de desayuno · 9 € base',seats:'+2 plazas de café por nivel',barista:'Un pedido simultáneo más · 0,65 €/venta',matcha:'Pedidos de matcha · 8 € base',mat:'+2 plazas · clases de 45 s',coach:'Clases automáticas · 3 €/alumno',reformer:'+5 € por plaza y nivel',terrace:'+4 plazas de café por nivel',classes:'+4 plazas de pilates por nivel',manager:'−8 % costes de café · +15 % velocidad',spa:'Smoothies y +3 € por plaza de pilates',second:'+1,05 €/s netos por sede'};
    Object.assign(descriptions,{cafeWing:'+32 m² y tres mesas · habilita más mesas',wellnessWing:'+32 m² · habilita presoterapia y masajes',yogaWing:'+24 m² · instala después las esterillas',pressotherapy:'+1 plaza · hasta dos tumbonas',pressureCare:'−3 s y +4 € por sesión y nivel',massage:'+1 plaza · hasta dos camillas',massageCare:'−3 s y +4 € por sesión y nivel',recoveryComfort:'+2 € por sesión de recuperación y nivel',therapist:'Automatiza servicios · nivel 2 reduce 2 s',yoga:'+2 plazas de yoga · máximo seis',yogaCare:'−2 s y +2 € por sesión y nivel',cafeDecor:'+4 % al precio base de la carta por nivel',roaster:'+8 % a calidad y +6 % a velocidad por nivel'});
    Object.assign(descriptions,{brewBar:'+8 % a rapidez y +0,35 € por café y nivel',bakeryOven:'+10 % a rapidez y +0,40 € por desayuno y nivel',cafeLounge:'+2,5 % a calidad de la carta por nivel',pilatesKit:'+1 € por alumno y nivel',studioMirror:'−1 s por clase y nivel',studioAudio:'+1 € por alumno y nivel',yogaBolsters:'−1 s y +1 € por sesión y nivel',zenGarden:'+1 € por sesión de yoga y nivel',yogaTea:'+2 € por sesión y nivel · coste +0,50 €',pressurePump:'−2 s y +2 € por sesión y nivel',massageStones:'+3 € por sesión y nivel · coste +1 €',wellnessLinen:'+1 € por tratamiento y nivel'});
    return (descriptions[u.id]||u.desc)+(B.level(s,u.id)>=u.max?' · Nivel máximo':'');
  }
  function row(u) {
    const l=B.level(s,u.id),cost=B.price(s,u),reason=lockedReason(u),max=l>=u.max;
    return `<div class="item ${reason?'locked':''}"><div class="item-icon">${u.emoji}</div><div class="item-info"><b>${u.name} <span class="muted">Nv. ${l}</span></b><small>${reason||u.desc}</small><em>${benefit(u)}</em></div><button class="buy ${s.money<cost?'secondary':''}" data-buy="${u.id}" ${reason||max||s.money<cost?'disabled':''} aria-label="${max?'Nivel máximo':`Comprar ${u.name} por ${fmt(cost)}`}">${max?'✓ Máx.':reason?'🔒':fmt(cost)}</button></div>`;
  }
  function renderLists() {
    $('shop-title').textContent=filter==='team'?'Tu equipo':filter==='pilates'?'Tu estudio de pilates':filter==='yoga'?'Tu sala de yoga':filter==='cafe'?'Tu cafetería':filter==='zones'?'Amplía tu centro':filter==='wellness'?'Tu sala wellness':'Invierte y crece';
    const needed=new Set(B.chapterStatus(s).tasks.filter(t=>t.value<t.target).map(t=>t.key));
    const relevant=u=>needed.has(u.id)||(needed.has('menu')&&['pastries','matcha','spa','latteBar','cakeDisplay','toastKitchen'].includes(u.id)&&!B.level(s,u.id));
    const available=B.UPGRADES.filter(u=>B.unlocked(s,u)&&B.level(s,u.id)<u.max).sort((a,b)=>Number(relevant(b))-Number(relevant(a))||B.price(s,a)-B.price(s,b));
    $('featured').innerHTML=available.slice(0,2).map(row).join('')||'<p>Tu imperio está completo. ¡Disfruta del local!</p>';
    $('shop-list').innerHTML=B.UPGRADES.filter(u=>filter==='all'||u.cat===filter).map(row).join('');
    $('milestone-list').innerHTML=B.GOALS.map(g=>{
      const done=s.claimed.includes(g.id),v=B.value(s,g),ready=v>=g.target;
      return `<div class="card mission"><div class="mission-ico">${g.emoji}</div><div class="mission-content"><h3>${g.title}</h3><p>${g.desc} · ${Math.min(Math.floor(v),g.target)}/${g.target}</p><p class="highlight">Premio ${fmt(g.reward)}</p></div><button class="claim" data-claim="${g.id}" ${!ready||done?'disabled':''}>${done?'✓':ready?'Cobrar':'🔒'}</button></div>`;
    }).join('');dirty=false;
    renderZone();
  }
  function renderZone(){
    const u=B.UPGRADES.find(u=>u.id===selectedZone);if(!u)return;
    const cost=B.price(s,u),max=B.level(s,u.id)>=u.max,reason=lockedReason(u);
    $('zone-title').textContent=u.name;$('zone-level').textContent='NIVEL '+B.level(s,u.id);
    $('zone-description').textContent=reason||benefit(u);
    $('zone-buy').disabled=!!reason||max||s.money<cost;$('zone-buy').textContent=max?'✓ Nivel máximo':reason?'Zona bloqueada':`Mejorar · ${fmt(cost)}`;
  }
  function selectZone(id){
    if(!B.UPGRADES.some(u=>u.id===id))return;
    selectedZone=id;$('zone-panel').hidden=false;$('app').classList.add('zone-open');venueScene?.select(id);renderZone();
  }
  function closeZone(){selectedZone=null;$('zone-panel').hidden=true;$('app').classList.remove('zone-open');}
  let journeyMarkup='',campaignMarkup='';
  function renderProgression(){
    const c=B.chapterStatus(s),campaign=B.campaignStatus(s);
    const journey=c.complete?'<span class="pill">6 / 6 CAPÍTULOS</span><h3>🏆 El centro del barrio</h3><p>Tu colección está completa. Sigue probando retos y nuevas inversiones.</p>':`<span class="pill">CAPÍTULO ${c.index+1} / ${B.CHAPTERS.length}</span><h3>${c.icon} ${c.name}</h3><ul class="chapter-tasks">${c.tasks.map(t=>`<li class="${t.value>=t.target?'done':''}"><span>${t.value>=t.target?'✓':'○'} ${t.label}</span><b>${Math.floor(t.value)}/${t.target}</b></li>`).join('')}</ul><p class="highlight">${fmt(c.reward)} + un trofeo visible en tu local</p><button class="claim" data-chapter="${c.id}" ${c.ready?'':'disabled'}>${c.ready?'Completar capítulo':'En progreso'}</button>${c.next?`<small>Después: ${c.next}</small>`:''}`;
    if(journey!==journeyMarkup){$('journey-card').innerHTML=journey;journeyMarkup=journey;}
    const chip=$('journey-chip');chip.textContent=campaign?`${campaign.icon} ${campaign.ready?'¡Reto conseguido!':campaign.expired?'Reto terminado':campaign.name+' · '+campaign.count+'/'+campaign.target}`:c.complete?'🏆 Tu centro florece':`${c.icon} ${c.ready?'¡Capítulo listo!':c.name}`;chip.classList.toggle('ready',!!(campaign?.ready||c.ready));
    const won=s.campaignDaily.day===new Date().toISOString().slice(0,10)?s.campaignDaily.wins:0;
    let board='<div class="section-head"><h3>Elige tu próximo reto</h3><span class="pill">'+won+'/3 PREMIOS HOY</span></div><p>Cinco minutos de juego activo. Cuenta solo nuevas ventas o sesiones. Sin penalización económica.</p>';
    if(campaign){const seconds=Math.ceil(campaign.remaining);board+=`<div class="campaign-active"><b>${campaign.icon} ${campaign.name}</b><p>${campaign.count}/${campaign.target} ${campaign.id==='wellness'?'sesiones terminadas':'pedidos entregados'} · ${campaign.ready?'¡Objetivo conseguido!':campaign.expired?'Tiempo agotado':Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' restantes'}</p><div class="bar"><i style="width:${Math.min(100,campaign.count/campaign.target*100)}%"></i></div><p class="highlight">Premio ${fmt(campaign.reward)}</p>${campaign.ready?'<button class="claim" data-campaign-action="claim">Cobrar recompensa</button>':`<button class="tab" data-campaign-action="watch">Volver al mapa</button><button class="tab" data-campaign-action="cancel">${campaign.expired?'Elegir otro reto':'Abandonar reto'}</button>`}</div>`;}
    else board+=B.CAMPAIGNS.map(d=>{const reason=B.campaignRequirement(s,d.id),tier=Math.min(2,Math.floor(s.campaignWins/3));return `<div class="campaign-option"><div><b>${d.icon} ${d.name}</b><small>${reason||d.description}</small><em>${d.target+tier*2} ${d.id==='wellness'?'sesiones':'pedidos'} · premio ${fmt(d.reward+tier*20)}</em></div><button class="claim" data-campaign="${d.id}" ${reason||won>=3?'disabled':''}>${reason?'🔒':won>=3?'Mañana':'Elegir'}</button></div>`;}).join('');
    if(board!==campaignMarkup){$('campaign-board').innerHTML=board;campaignMarkup=board;}
  }
  function render() {
    renderProgression();
    const p=B.params(s),estimate=B.estimate(s),serving=s.queue.find(o=>o.remaining!==null&&!o.worker),waiting=s.queue.find(o=>o.stage==='waiting'),pilates=B.level(s,'mat')>0,boost=Date.now()<s.boostUntil;
    $('money').textContent=fmt(s.money);$('income').textContent=fmt(estimate.total);$('rep').textContent='⭐ '+(s.reputation/20).toFixed(1);
    $('level').textContent='NIVEL '+(1+Math.floor(Math.sqrt(s.earned/120)));
    $('subtitle').textContent=pilates?'Café de especialidad · Pilates y wellness':'Un café, mil posibilidades';
    $('venue-status').textContent=`${p.area} m² · ${s.queue.length+s.seated.length+s.treatments.length+s.classGuests.length} clientes`;
    $('customers').textContent=pilates?'☕ + 🧘':'☕ Abierto';
    $('serve').disabled=!!serving||!waiting;
    $('serve-label').textContent=serving?'Preparando…':waiting?'Atender':'Sin pedidos';
    $('serve').setAttribute('aria-label',serving?'Preparando pedido':waiting?'Preparar '+B.PRODUCTS.find(p=>p.id===waiting.product).name.toLowerCase():'Sin pedidos pendientes');
    $('tap-gain').textContent=serving?Math.ceil(serving.remaining)+' s · entrega automática':waiting?'Toca para iniciar · cobra al entregar':'Los clientes llegarán en unos segundos';
    const remaining=Math.ceil((s.rushReady-Date.now())/1000);
    $('rush').disabled=remaining>0;$('rush').innerHTML=`⚡<small>${boost?'¡Hora punta!':remaining>0?`${remaining}s`:'Hora punta'}</small>`;
    $('orders').innerHTML=s.queue.map(o=>{
      const product=B.PRODUCTS.find(p=>p.id===o.product),working=o.remaining!==null;
      return `<div class="order ${o.wait>o.patience*.7?'urgent':''}"><span>${product.icon} ${['Habitual','Estudiante','De paso','Wellness'][o.kind]}</span><b>${product.name}</b><small>${o.stage==='arrival'?'Llegando al mostrador':working?(o.remaining===0?'Esperando una silla libre':(o.worker?'Barista · ':'Tú · ')+Math.ceil(o.remaining)+' s'):'Espera '+Math.floor(o.wait)+' s'}</small><div class="bar"><i style="width:${working?Math.max(0,(1-o.remaining/(o.duration||B.orderDuration(s,o.product)))*100):Math.max(0,1-o.wait/o.patience)*100}%"></i></div></div>`;
    }).join('')||'<div class="empty-orders">🌿 Un momento de calma. El próximo cliente está en camino.</div>';
    $('business-strip').innerHTML=`<span>Cafetería <b>${s.seated.length}/${p.seats} plazas</b></span><span>Equipo <b>${p.baristas} baristas</b></span><span>Margen aprox. <b>${fmt(estimate.total*60)}/min</b></span>`;
    $('studio-description').textContent=!pilates?'Abre tu estudio desde 850 €. Empieza dando clases y contrata después una instructora.':`${p.capacity} plazas · ${fmt(p.classPrice)}/alumno · ${p.classTime} s por clase. ${B.level(s,'coach')?'Instructora contratada: clases automáticas.':'Impartes las clases; sin salario de instructora.'}`;
    const ready=s.classGuests.filter(g=>g.stage==='ready').length,boarding=s.classPhase==='boarding';
    if(pilates)$('studio-description').textContent+=boarding?` Llegando ${s.classGuests.length-ready} · en su plaza ${ready}/${p.capacity}.`:s.classPhase==='leaving'?' El grupo está saliendo; después recibiremos al siguiente.':' Cada grupo entra desde la calle y sale al terminar.';
    $('class-start').disabled=pilates&&(s.classPhase==='active'||s.classPhase==='leaving'||s.classCooldown>0||(boarding&&(!ready||ready!==s.classGuests.length)));
    $('class-start').textContent=!pilates?'Ver inversión del estudio →':s.classPhase==='active'?`Clase en marcha · ${s.classSeats} alumnos`:s.classPhase==='leaving'?'El grupo está saliendo':boarding?(ready===s.classGuests.length&&ready?`Empezar con ${ready} alumnos`:'Esperando a los alumnos'):s.classCooldown>0?'Preparando el estudio':'Convocar clase de pilates';
    $('class-progress').style.width=pilates&&s.classRemaining>0?(1-s.classRemaining/(s.classDuration||p.classTime))*100+'%':'0%';
    const nextServiceMarkup=B.SERVICES.map(service=>{
      const c=B.serviceConfig(s,service.id),active=s.treatments.filter(t=>t.service===service.id),arriving=active.filter(t=>t.stage==='arrival').length,occupied=B.serviceOccupancy(s,service.id);
      return `<div class="service-row"><div><b>${service.icon} ${service.name}</b><small>${c.capacity?`${active.length}/${c.capacity} plazas · ${fmt(c.price)}/sesión · ${c.duration} s`:'Instala el servicio desde Mejoras'}</small><small>${c.capacity?(arriving?`${arriving} clientes en camino · `:'')+(c.automatic?'Atención automática':'Atención manual'):''}</small></div><div class="service-actions"><button class="tab" data-focus="${service.id}" ${!c.capacity?'disabled':''}>Ver sala</button><button class="claim" data-service="${service.id}" ${!c.capacity||occupied>=c.capacity?'disabled':''}>${occupied>=c.capacity&&c.capacity?(occupied>active.length?'Saliendo':'En sesión'):'Recibir'}</button></div></div>`;
    }).join('');
    if(nextServiceMarkup!==serviceMarkup){$('service-list').innerHTML=nextServiceMarkup;serviceMarkup=nextServiceMarkup;}
    const next=B.GOALS.find(g=>!s.claimed.includes(g.id));
    $('goal-label').textContent=next?.title||'Todos los hitos completados';
    $('goal-count').textContent=next?`${Math.min(Math.floor(B.value(s,next)),next.target)} / ${next.target}`:'✓';
    $('goal-progress').style.width=next?Math.min(100,B.value(s,next)/next.target*100)+'%':'100%';
    $('mission-title').textContent=next?.title||'Tu comunidad florece';$('mission-desc').textContent=next?`${next.desc} · Premio ${fmt(next.reward)}`:'Sigue cuidando a tus clientes';
    $('claim').disabled=!next||B.value(s,next)<next.target;$('claim').textContent=next&&B.value(s,next)>=next.target?'COBRAR':'EN CURSO';
    $('daily-text').textContent=`${Math.min(s.daily.count,30)}/30 pedidos hoy · Premio 80 €`;$('daily-claim').disabled=s.daily.claimed||s.daily.count<30;$('daily-claim').textContent=s.daily.claimed?'✓ Cobrado':'Cobrar';
    $('total-earned').textContent=fmt(s.earned);$('served').textContent=Math.floor(s.served).toLocaleString('es-ES');$('clients').textContent=Math.floor(s.happy).toLocaleString('es-ES');
    $('purchases').textContent=Object.values(s.levels).reduce((a,b)=>a+b,0);$('sessions').textContent=s.sessions.toLocaleString('es-ES');$('playtime').textContent=Math.floor(s.seconds/60)+' min';
    $('expenses').textContent=fmt(s.expenses);$('profit').textContent=fmt(s.earned-s.expenses);$('lost').textContent=s.lost;$('students').textContent=s.students;
    $('floor-area').textContent=p.area+' m²';$('services-completed').textContent=Object.values(s.completedServices).reduce((a,b)=>a+b,0);
    $('tip').textContent=!p.baristas?'Prepara pedidos y ahorra 220 € para un barista. Las ventas descuentan ingredientes; el barista cobra 0,65 € por pedido.':!pilates?'El café tiene demanda y aforo limitados. Invierte en mesas o abre pilates para diversificar.':'Las clases descuentan operación y materiales por alumno, más 3 € si tienes instructora. El beneficio offline se estima al 35 %, hasta 4 horas.';
    const tutorial=[['Tu primer café','Toca «Preparar» cuando llegue un pedido. Se cobrará al terminar.'],['Hazlo tuyo','Compra una cafetera o una vitrina en Mejoras. El mobiliario aparece en tu local.'],['Tu primer equipo','Contrata un barista para servir sin tocar. Más mesas atraen más visitas.'],['Café y movimiento','Ahorra para abrir el estudio. Puedes dar clases antes de contratar instructora.']];
    $('tutorial').hidden=s.tutorial>=4;if(s.tutorial<4){$('tutorial-title').textContent=tutorial[s.tutorial][0];$('tutorial-copy').textContent=tutorial[s.tutorial][1];$('tutorial-next').textContent=s.tutorial===3?'¡A jugar!':'Siguiente';}
    if(dirty)renderLists();
  }
  function nav(view){
    closeZone();$('app').classList.toggle('menu-open',view!=='home');$('app').classList.toggle('mode-home',view==='home');
    document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id==='home'||x.id===view));
    document.querySelectorAll('.nav-btn').forEach(x=>{x.classList.toggle('active',x.dataset.view===view);x.setAttribute('aria-current',x.dataset.view===view?'page':'false');});
    if($(view))$(view).scrollTop=0;dirty=true;render();
  }
  document.querySelectorAll('.nav-btn').forEach(x=>x.onclick=()=>nav(x.dataset.view));$('all-upgrades').onclick=()=>nav('shop');
  document.querySelectorAll('#filter-tabs button').forEach(x=>x.onclick=()=>{filter=x.dataset.filter;document.querySelectorAll('#filter-tabs button').forEach(y=>y.classList.toggle('active',x===y));dirty=true;render();});
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-buy],[data-claim],[data-service],[data-focus],[data-chapter],[data-campaign],[data-campaign-action]');if(!button)return;
    if(button.dataset.chapter){if(B.chapterStatus(s).id!==button.dataset.chapter)return;const reward=B.claimChapter(s);if(reward){toast('¡Capítulo completado! Trofeo nuevo · +'+fmt(reward));chime();celebrate();save();dirty=true;render();}return;}
    if(button.dataset.campaign){if(B.startCampaign(s,button.dataset.campaign)){toast('Reto iniciado · cinco minutos de juego, sin riesgo para tu dinero');save();dirty=true;render();}return;}
    if(button.dataset.campaignAction){if(button.dataset.campaignAction==='watch'){nav('home');return;}if(button.dataset.campaignAction==='claim'){const reward=B.claimCampaign(s);if(reward){toast('Reto conseguido · +'+fmt(reward));chime();celebrate();}}else B.cancelCampaign(s);save();dirty=true;render();return;}
    if(button.dataset.focus){nav('home');venueScene?.focus(button.dataset.focus);return;}
    if(button.dataset.service){if(B.startTreatment(s,button.dataset.service)){save();render();toast('Cliente en camino desde la calle');}return;}
    if(button.dataset.buy){if(B.purchase(s,button.dataset.buy)){toast('Tu local crece ✨');save();dirty=true;render();}return;}
    const reward=B.claim(s,button.dataset.claim);if(reward){toast('Objetivo completado · +'+fmt(reward));save();dirty=true;render();}
  });
  let audio=null,muted=true;
  function chime(){if(muted)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.setValueAtTime(660,audio.currentTime);o.frequency.exponentialRampToValueAtTime(990,audio.currentTime+.12);g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.2);o.start();o.stop(audio.currentTime+.22);}catch{}}
  $('sound').onclick=()=>{muted=!muted;$('sound').textContent=muted?'🔈':'🔊';$('sound').setAttribute('aria-pressed',String(!muted));if(!muted)chime();};
  $('serve').onclick=()=>{if(B.startOrder(s)){chime();render();}};
  $('rush').onclick=()=>{if(B.rush(s)){toast('Hora punta · relojes +25 %, preparación +50 % y más visitas durante 20 s');save();render();}};
  $('class-start').onclick=()=>{if(!B.level(s,'mat')){filter='pilates';document.querySelectorAll('#filter-tabs button').forEach(x=>x.classList.toggle('active',x.dataset.filter===filter));nav('shop');return;}if(B.startClass(s)){save();render();}};
  $('claim').onclick=()=>{const g=B.GOALS.find(g=>!s.claimed.includes(g.id));const reward=g&&B.claim(s,g.id);if(reward){toast('Recompensa · +'+fmt(reward));save();dirty=true;render();}};
  $('daily-claim').onclick=()=>{if(B.claimDaily(s)){toast('Turno completado · +80 €');save();dirty=true;render();}};
  $('tutorial-next').onclick=()=>{s.tutorial++;save();render();};
  $('export').onclick=()=>{
    let data;try {data=readOnly?(localStorage.getItem(B.KEY)||localStorage.getItem(B.LEGACY_KEY)):JSON.stringify({...s,last:Date.now()},null,2);}catch{data=JSON.stringify(s);}
    const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.href=url;a.download='bloom-brew-partida-v2.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  $('import').onclick=()=>$('import-file').click();
  $('import-file').onchange=async e=>{
    const file=e.target.files[0];if(!file)return;
    try{
      if(file.size>1000000)throw Error('Archivo demasiado grande');
      const candidate=B.validate(JSON.parse(await file.text()));candidate.last=Date.now();
      if(!confirm('¿Sustituir la partida actual por esta copia? La partida anterior quedará respaldada en este dispositivo.'))return;
      try{localStorage.setItem(B.KEY+'-before-import',readOnly?(localStorage.getItem(B.KEY)||''):JSON.stringify(s));}catch{throw Error('No se pudo crear el respaldo');}
      s=candidate;readOnly=false;save();dirty=true;render();toast('Partida importada correctamente');
    }catch(error){toast(error.message==='Versión de partida incompatible'?error.message:'Archivo no válido o no se pudo crear el respaldo.');}
    finally{e.target.value='';}
  };
  $('reset').onclick=()=>{if(confirm('¿Reiniciar tu progreso? Exporta antes si quieres conservarlo.')){try{localStorage.setItem(B.KEY+'-before-reset',readOnly?(localStorage.getItem(B.KEY)||''):JSON.stringify(s));}catch{toast('Exporta una copia antes de reiniciar: no pudimos respaldar.');return;}s=B.fresh();readOnly=false;save();dirty=true;nav('home');}};
  $('restore').onclick=()=>{
    try{const raw=localStorage.getItem(B.KEY+'-before-import')||localStorage.getItem(B.KEY+'-before-reset')||localStorage.getItem(B.KEY+'-backup')||localStorage.getItem(B.KEY+'-legacy-backup');if(!raw)throw Error();const candidate=B.validate(JSON.parse(raw));if(confirm('¿Restaurar la última copia de seguridad disponible?')){s=candidate;s.last=Date.now();readOnly=false;save();dirty=true;render();toast('Copia restaurada');}}catch{toast('No hay una copia de seguridad válida disponible');}
  };
  function feedback(events){for(const event of events){if(['sale','class','service'].includes(event.type)){dirty=true;const f=document.createElement('div');f.className='floating';f.style.left=(event.type==='sale'?'35%':'65%');f.style.top='45%';f.textContent='+'+fmt(event.net);$('venue').append(f);setTimeout(()=>f.remove(),1000);if(event.type==='class')toast('Clase completada · beneficio '+fmt(event.net));if(event.type==='service'&&event.first)toast(B.SERVICES.find(x=>x.id===event.service).name+' completada · '+fmt(event.net)+' netos');}else if(event.type==='campaignReady'){dirty=true;toast('¡'+event.name+' completado! Cobra el premio en Objetivos');}else if(event.type==='campaignExpired'){dirty=true;toast('Reto terminado · puedes volver a intentarlo sin perder dinero');}else if(event.type==='lost')dirty=true;}}
  let tick=performance.now(),renderAt=0,listsAt=0;
  setInterval(()=>{
    const now=performance.now();if(document.hidden){tick=now;return;}
    let dt=Math.min(1,(now-tick)/1000);tick=now;
    while(dt>0){const part=Math.min(.1,dt);feedback(B.step(s,part,Date.now()));dt-=part;}
    if(now-listsAt>=1000){dirty=true;listsAt=now;}
    if(now-renderAt>=250){render();renderAt=now;}
  },100);
  setInterval(()=>{if(!document.hidden)save();},5000);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){save();return;}
    const result=B.offline(s);tick=performance.now();if(result.net>0)toast('Mientras descansabas · +'+fmt(result.net)+' netos');save();dirty=true;render();
  });
  window.addEventListener('pagehide',save);
  window.addEventListener('pageshow',e=>{if(e.persisted){tick=performance.now();const result=B.offline(s);if(result.net>0)toast('Bienvenido de nuevo · +'+fmt(result.net));save();render();}});
  $('zone-close').onclick=closeZone;
  $('menu-close').onclick=()=>nav('home');
  $('staff-menu').onclick=()=>{filter='team';document.querySelectorAll('#filter-tabs button').forEach(x=>x.classList.toggle('active',x.dataset.filter===filter));nav('shop');};
  $('expand-menu').onclick=()=>{filter='zones';document.querySelectorAll('#filter-tabs button').forEach(x=>x.classList.toggle('active',x.dataset.filter===filter));nav('shop');};
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeZone();nav('home');}});
  $('zone-buy').onclick=()=>{if(B.purchase(s,selectedZone)){toast('¡Tu negocio sube de nivel!');save();dirty=true;render();}};
  $('zoom-in').onclick=()=>venueScene?.changeZoom(.15);$('zoom-out').onclick=()=>venueScene?.changeZoom(-.15);
  $('camera-reset').onclick=()=>venueScene?.focus('all');
  document.querySelectorAll('[data-camera]').forEach(button=>button.onclick=()=>{closeZone();venueScene?.focus(button.dataset.camera);document.querySelectorAll('[data-camera]').forEach(other=>other.classList.toggle('active',other===button));});
  $('cafe-zone').onclick=()=>selectZone('machine');$('studio-zone').onclick=()=>selectZone('mat');
  $('journey-chip').onclick=()=>nav('goals');
  render();venueScene=new window.VenueScene($('scene'),()=>s,selectZone);
  if(loadWarning)setTimeout(()=>toast(loadWarning),500);else if(offline.net>0)setTimeout(()=>toast('Mientras descansabas · +'+fmt(offline.net)+' netos (máx. 4 h)'),600);
  save();
  if('serviceWorker' in navigator&&!['localhost','127.0.0.1'].includes(location.hostname))navigator.serviceWorker.register('./sw.js').catch(()=>{$('save-status').textContent+=' · Sin conexión no disponible en este navegador';});
})();
