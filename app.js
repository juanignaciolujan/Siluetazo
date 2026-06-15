/* =========================================================
   EL SILUETAZO — logica (version final, una pagina)
   Maquina de estados: intro -> narrativa -> lienzo -> recorrido(stub).
   Etapa 1 implementa pantallas 1 a 3. El recorrido inmersivo (4-9)
   y el cierre (10) llegan en las proximas etapas.
   Todo del lado del navegador. Nada se sube a ningun lado.
   ========================================================= */

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const color = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const escena = document.getElementById('escena');

/* figura humana de la guia (plantilla a trazar) */
const SVG_FIG = `<svg class="fig" viewBox="0 0 120 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <circle cx="60" cy="42" r="30"/>
  <path d="M60 78 C92 78 104 104 104 150 L96 300 L24 300 L16 150 C16 104 28 78 60 78 Z"/></svg>`;

/* silueta normalizada (0..1) — se guarda para las etapas siguientes */
let silueta = null;
function guardarSilueta(s){ try{ sessionStorage.setItem('siluetazo:silueta', JSON.stringify(s)); }catch(e){} }

function ajustar(cv){
  const r = cv.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.max(1, Math.round(r.width*dpr));
  cv.height = Math.max(1, Math.round(r.height*dpr));
  cv.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
  return r;
}

/* fade-in helper: agrega .in en el proximo frame */
function entrar(el, t){ if(t) el.style.setProperty('--t', t+'ms'); requestAnimationFrame(()=> requestAnimationFrame(()=> el.classList.add('in'))); }

/* =========================================================
   PANTALLA 1 — INTRO
   ========================================================= */
function irIntro(){
  const I = DATOS.intro;
  escena.innerHTML = `
    <section class="intro">
      <h1 class="titulo fade">${I.titulo}</h1>
      <p class="subtitulo fade">${I.subtitulo}</p>
      <button class="cta fade" id="comenzar">${I.cta}</button>
    </section>`;
  const bloques = [...escena.querySelectorAll('.fade')];
  // fade-in pausado (800-1200ms) con stagger de 200ms de arriba hacia abajo
  bloques.forEach((b,i)=> b.style.setProperty('--t', '1100ms'));
  if(reducido){ bloques.forEach(b=> b.classList.add('in')); }
  else bloques.forEach((b,i)=> setTimeout(()=> entrar(b), i*200));

  document.getElementById('comenzar').addEventListener('click', ()=>{
    // fade-out de todos los textos; el negro queda para la secuencia
    bloques.forEach(b=> b.classList.remove('in'));
    setTimeout(irNarrativa, reducido ? 0 : 700);
  });
}

/* =========================================================
   PANTALLA 2 — SECUENCIA NARRATIVA (automatica, scroll bloqueado)
   ========================================================= */
function irNarrativa(){
  escena.innerHTML = `<section class="narrativa">${
    DATOS.narrativa.map((p,i)=>`<div class="placa" data-i="${i}"><div class="h1">${p.h1}</div><div class="h2">${p.h2}</div></div>`).join('')
  }</section>`;
  const placas = [...escena.querySelectorAll('.placa')];
  const R = DATOS.ritmo;
  let i = 0;
  function mostrar(){
    if(i >= placas.length){ setTimeout(irLienzo, R.gap); return; }
    const pl = placas[i];
    pl.classList.add('on');                                   // fade in
    setTimeout(()=>{
      pl.classList.remove('on');                              // fade out
      setTimeout(()=>{ i++; mostrar(); }, R.fadeOut + R.gap); // delay de negro entre placas
    }, R.fadeIn + R.hold);
  }
  setTimeout(mostrar, R.gap);
}

/* =========================================================
   PANTALLA 3 — LIENZO (el gancho interactivo)
   ========================================================= */
function irLienzo(){
  const L = DATOS.lienzo;
  escena.innerHTML = `
    <section class="lienzo-escena">
      <h2 class="titulo fade">${L.titulo}</h2>
      <p class="instruccion fade">${L.instruccion}</p>
      <div class="lienzo fade" id="lienzo">
        <canvas class="papel" id="papel"></canvas>
        <div class="guia">${SVG_FIG}</div>
        <canvas id="trazo"></canvas>
      </div>
      <div class="post" id="post">
        <p class="frase">${L.postDibujo}</p>
        <button class="listo" id="listo">${L.boton}</button>
      </div>
    </section>`;

  escena.querySelectorAll('.fade').forEach(b=> entrar(b, 800));

  const lienzo = document.getElementById('lienzo');
  const papel  = document.getElementById('papel');
  const trazoCv= document.getElementById('trazo');
  const tctx   = trazoCv.getContext('2d');
  const post   = document.getElementById('post');
  const btnListo = document.getElementById('listo');

  // pintar la textura de papel cuando el lienzo ya tiene tamaño
  function prepararPapel(){ pintarPapel(papel); ajustar(trazoCv); }
  requestAnimationFrame(()=> requestAnimationFrame(prepararPapel));

  let puntos = [], trazando = false, validado = false;

  const coord = e => { const r = trazoCv.getBoundingClientRect(); return { x:e.clientX-r.left, y:e.clientY-r.top }; };

  // trazo con leve rugosidad, simulando grafito/marcador sobre papel
  function pintarTrazo(cerrar){
    const r = trazoCv.getBoundingClientRect();
    tctx.clearRect(0,0,r.width,r.height);
    if(puntos.length < 2) return;
    if(cerrar){
      tctx.beginPath();
      puntos.forEach((p,i)=> i?tctx.lineTo(p.x,p.y):tctx.moveTo(p.x,p.y));
      tctx.closePath();
      tctx.fillStyle = color('--tinta'); tctx.fill();
    }
    for(let pass=0; pass<2; pass++){
      tctx.beginPath();
      puntos.forEach((p,i)=>{
        const j = pass ? (Math.random()*1.8 - 0.9) : 0;
        const x=p.x+j, y=p.y+j;
        i ? tctx.lineTo(x,y) : tctx.moveTo(x,y);
      });
      if(cerrar) tctx.closePath();
      tctx.strokeStyle = pass ? 'rgba(17,16,16,.30)' : 'rgba(17,16,16,.95)';
      tctx.lineWidth   = pass ? 5.5 : 3.2;
      tctx.lineJoin='round'; tctx.lineCap='round';
      tctx.stroke();
    }
  }

  lienzo.addEventListener('pointerdown', e=>{
    if(validado) return;
    trazando = true; lienzo.setPointerCapture(e.pointerId);
    puntos.push(coord(e)); pintarTrazo(false);
  });
  lienzo.addEventListener('pointermove', e=>{ if(!trazando) return; puntos.push(coord(e)); pintarTrazo(false); });
  function soltar(){
    if(!trazando) return; trazando = false;
    validar();
  }
  lienzo.addEventListener('pointerup', soltar);
  lienzo.addEventListener('pointercancel', soltar);

  // validacion permisiva: con un trazo de cuerpo de tamaño razonable, se cierra solo
  function validar(){
    if(validado || puntos.length < 12) return;
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    puntos.forEach(p=>{ minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y); });
    const bw=Math.max(1,maxX-minX), bh=Math.max(1,maxY-minY);
    const r = trazoCv.getBoundingClientRect();
    if(bw < r.width*0.12 && bh < r.height*0.12) return;   // demasiado chico, segui dibujando
    validado = true;
    silueta = { norm: puntos.map(p=>({x:(p.x-minX)/bw, y:(p.y-minY)/bh})), aspecto: bw/bh };
    guardarSilueta(silueta);
    pintarTrazo(true);                                    // se cierra y se rellena en negro
    post.classList.add('on');                             // aparece "Eso que acabas..." + Listo (400ms)
  }

  btnListo.addEventListener('click', ()=> salirLienzo(lienzo));

  window.addEventListener('resize', ()=>{ if(!validado){ pintarPapel(papel); ajustar(trazoCv); pintarTrazo(false); } });
}

/* textura de papel arrugado, pintada por codigo (sin imagen externa) */
function pintarPapel(cv){
  const r = ajustar(cv);
  const c = cv.getContext('2d');
  const w=r.width, h=r.height;
  c.fillStyle = color('--papel'); c.fillRect(0,0,w,h);
  for(let i=0;i<6;i++){                                  // pliegues suaves
    const x=Math.random()*w, y=Math.random()*h, rad=Math.max(w,h)*(0.3+Math.random()*0.45);
    const g=c.createRadialGradient(x,y,0,x,y,rad);
    g.addColorStop(0, Math.random()>0.5 ? 'rgba(255,250,234,0.20)' : 'rgba(78,66,42,0.16)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=g; c.fillRect(0,0,w,h);
  }
  const n = Math.min(5200, Math.floor(w*h/110));         // grano
  for(let i=0;i<n;i++){
    c.fillStyle = Math.random()>0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(55,46,32,0.06)';
    c.fillRect(Math.random()*w, Math.random()*h, 1.3, 1.3);
  }
  const v=c.createRadialGradient(w/2,h/2,Math.min(w,h)*0.18,w/2,h/2,Math.max(w,h)*0.72);
  v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(35,26,12,0.24)');
  c.fillStyle=v; c.fillRect(0,0,w,h);
}

/* salida del lienzo: el papel se expande a pantalla completa (el zoom al trazo va en la etapa 2) */
function salirLienzo(lienzo){
  const escenaEl = lienzo.closest('.lienzo-escena');
  // fade-out de los textos y la UI exterior
  escenaEl.querySelectorAll('.titulo, .instruccion, .post').forEach(e=> e.classList.remove('in','on'));
  // el rectangulo de papel crece hasta ocupar todo
  lienzo.classList.add('expandiendo');
  setTimeout(irRecorrido, reducido ? 0 : 950);
}

/* =========================================================
   PANTALLA 4+ — RECORRIDO INMERSIVO  (stub, etapa 2)
   ========================================================= */
function irRecorrido(){
  escena.innerHTML = `<section class="stub"><p>Acá arranca el recorrido inmersivo con paralaje y desgarros. Lo construimos en la etapa 2, sobre esta misma base.</p></section>`;
  const p = escena.querySelector('.stub p');
  p.classList.add('fade'); entrar(p, 800);
}

/* ---------- arranque ---------- */
irIntro();
