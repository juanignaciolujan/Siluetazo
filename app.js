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
const SVG_FIG = `<svg class="fig" viewBox="0 0 600 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <path d="M300 20 C372 20 392 96 372 150 C362 178 350 188 338 196
    C432 176 522 196 566 214 C578 230 560 252 470 244 C412 240 372 232 344 226
    C356 270 366 300 372 332 C388 394 396 448 372 488 C360 504 332 502 322 472 C312 432 306 360 300 300
    C294 360 288 432 278 472 C268 502 240 504 228 488 C204 448 212 394 228 332
    C234 300 244 270 256 226 C228 232 188 240 130 244 C40 252 22 230 34 214 C78 196 168 176 262 196
    C250 188 238 178 228 150 C208 96 228 20 300 20 Z"/></svg>`;

/* silueta normalizada (0..1) — se guarda para las etapas siguientes */
let silueta = null;
function guardarSilueta(s){ try{ sessionStorage.setItem('siluetazo:silueta', JSON.stringify(s)); }catch(e){} }
function cargarSilueta(){ try{ const r = sessionStorage.getItem('siluetazo:silueta'); return r ? JSON.parse(r) : null; }catch(e){ return null; } }
const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));

/* caja real (contain) donde se dibuja la silueta, para mapear puntos de foco */
function contener(sil, caja){
  const a = sil.aspecto; let w=caja.w, h=caja.w/a;
  if(h>caja.h){ h=caja.h; w=caja.h*a; }
  return { ox:caja.x+(caja.w-w)/2, oy:caja.y+(caja.h-h)/2, w, h };
}

/* dibuja la silueta guardada dentro de una caja (contain); contorno o relleno */
function rellenarSilueta(c, sil, caja, tinta, contorno, lw){
  if(!sil) return;
  const a = sil.aspecto;
  let w = caja.w, h = caja.w/a;
  if(h > caja.h){ h = caja.h; w = caja.h*a; }
  const ox = caja.x + (caja.w-w)/2, oy = caja.y + (caja.h-h)/2;
  c.beginPath();
  sil.norm.forEach((p,i)=>{ const x=ox+p.x*w, y=oy+p.y*h; i?c.lineTo(x,y):c.moveTo(x,y); });
  c.closePath();
  if(contorno){ c.strokeStyle=tinta; c.lineWidth=lw||3; c.lineJoin='round'; c.lineCap='round'; c.stroke(); }
  else { c.fillStyle=tinta; c.fill(); }
}

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
        <div class="acciones">
          <button class="reintentar" id="reintentar">Reintentar</button>
          <button class="listo" id="listo">${L.boton}</button>
        </div>
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

  // reintentar: borra el trazo y deja dibujar de nuevo
  document.getElementById('reintentar').addEventListener('click', ()=>{
    puntos = []; validado = false; silueta = null;
    post.classList.remove('on');
    pintarPapel(papel); ajustar(trazoCv);   // ajustar limpia el lienzo del trazo
  });

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
/* =========================================================
   PANTALLAS 4 a 9 — RECORRIDO INMERSIVO (etapa 2)
   Capas fijas: papel + silueta (paralaje) + cortina negra (crossfade).
   El contenido scrollea por encima. Las placas de papel muestran la
   silueta de fondo; las documentales bajan la cortina negra.
   ========================================================= */
function irRecorrido(){
  const sil = silueta || cargarSilueta();
  const VIDEO = 'https://www.youtube.com/watch?v=TaqDxMBPYdk';
  const LOGO_X = `<svg class="x-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

  // habilitar scroll y montar capas de fondo fijas
  document.body.classList.add('recorriendo');
  escena.classList.add('host-recorrido');
  escena.style.position = 'static'; escena.style.height = 'auto';
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="fondo-papel"><canvas id="fPapel"></canvas></div>
    <div class="fondo-silueta"><canvas id="fSil"></canvas></div>
    <div class="cortina" id="cortina"></div>`);

  const nota = (t,c)=> `<div class="nota"><h3>${t}</h3><p>${c}</p></div>`;
  const phHTML = (label)=> `<div class="foto-ph">${label || 'imagen de archivo<br>(placeholder)'}</div>`;

  function seccionHTML(s){
    if(s.tipo === 'contexto')
      return `<section class="seccion-r r-contexto" data-bg="papel"><div class="eje rev"></div><div class="texto rev">${s.html}</div></section>`;
    if(s.tipo === 'doc'){
      const fotos = Array.from({length:s.fotos||1}, ()=> phHTML(s.fotoTexto)).join('');
      return `<section class="seccion-r r-doc" data-bg="negro"><div class="eje"></div>
                <div class="fotos rev">${fotos}</div>
                <p class="cita rev"><span class="comillas">“</span>${s.cita}</p></section>`;
    }
    if(s.tipo === 'nota')
      return `<section class="seccion-r r-nota lado-${s.lado||'der'}" data-bg="papel">
                <div class="marco rev"><span class="chinche"></span>${nota(s.titulo,s.cuerpo)}</div></section>`;
    if(s.tipo === 'nota-doble')
      // seccion alta + contenido sticky: la nota se fija mientras se desgarra (legible)
      return `<section class="seccion-r r-nota-doble" data-bg="papel"><div class="sticky">
                <div class="nota-stack rev"><span class="chinche"></span>
                  <div class="abajo">${nota(s.abajo.titulo,s.abajo.cuerpo)}</div>
                  <div class="arriba">${nota(s.arriba.titulo,s.arriba.cuerpo)}</div></div></div></section>`;
    return '';
  }

  const cierreHTML = ()=> `
    <section class="seccion-r cierre c-muro" data-bg="negro">
      <div class="muro-wrap rev"><canvas id="muro"></canvas></div>
      <div class="muro-cap rev">
        <h2 class="c-titulo">Tu silueta, entre las 30.000</h2>
        <p class="c-bajada">Hacer memoria, hoy, también es un gesto gráfico.</p>
      </div>
    </section>

    <section class="seccion-r cierre c-doc" data-bg="negro">
      <div class="eje"></div>
      <div class="doc-ext rev">
        <h3 class="doc-invita">Si querés saber más sobre el Siluetazo, te invitamos a ver el documental.</h3>
        <a class="thumb" href="${VIDEO}" target="_blank" rel="noopener">
          <img src="https://img.youtube.com/vi/TaqDxMBPYdk/hqdefault.jpg" alt="Documental sobre el Siluetazo"
               onerror="this.style.display='none';this.parentNode.classList.add('sin-img')">
          <span class="thumb-ph">documental<br>(miniatura)</span>
          <span class="play" aria-hidden="true">►</span>
          <span class="dur">24:06</span>
        </a>
        <p class="ficha">Este video forma parte de la investigación “Imágenes del siluetazo y otras estrategias creativas en el movimiento de Derechos Humanos en la Argentina” (2010-2011), de Fernanda Carvajal, Marcelo Expósito, Cora Gamarnik, Ana Longoni y Jaime Vindel.</p>
      </div>
    </section>

    <section class="seccion-r cierre c-cta" data-bg="negro">
      <div class="eje"></div>
      <div class="cta rev">
        <p class="cta-texto">En 1983, el espacio fue la calle. Hoy, la memoria también disputa las redes.</p>
        <div class="cta-acciones">
          <button id="compartir" class="btn-x">${LOGO_X} Compartir mi huella</button>
          <button id="descargar" class="btn-sec">Descargar mi huella (.png)</button>
        </div>
      </div>
    </section>

    <footer class="pie">
      <div class="pie-grid">
        <p class="pie-acad">Experiencia interactiva desarrollada en el marco de la asignatura Laboratorio Digital. Licenciatura en Diseño, Universidad Provincial de Córdoba (UPC). Año 2026.</p>
        <p class="pie-cc">Este sitio y sus contenidos están bajo licencia <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es" target="_blank" rel="noopener">Creative Commons Atribución-NoComercial-SinDerivadas 4.0 Internacional (CC BY-NC-ND 4.0)</a>. Se permite la distribución siempre que se reconozca la autoría, no se use con fines comerciales y no se generen obras derivadas.</p>
      </div>
      <button class="volver-inicio" id="volverPie">Volver al inicio ↑</button>
    </footer>`;

  escena.innerHTML = `<div class="recorrido">${DATOS.desarrollo.map(seccionHTML).join('')}${cierreHTML()}</div>`;
  window.scrollTo(0,0);

  // capas de fondo
  const fPapel = document.getElementById('fPapel');
  const fSil   = document.getElementById('fSil');
  const cortina= document.getElementById('cortina');

  // puntos de foco sobre la figura (coords 0..1): cabeza, manos, torso, caderas, piernas
  const TARGETS = [
    {fx:.50,fy:.12,s:2.2}, {fx:.90,fy:.42,s:2.3}, {fx:.50,fy:.46,s:1.9},
    {fx:.10,fy:.42,s:2.3}, {fx:.50,fy:.60,s:2.0}, {fx:.64,fy:.90,s:2.2},
    {fx:.36,fy:.90,s:2.2}, {fx:.50,fy:.50,s:1.7}
  ];
  const suave = t => t*t*(3-2*t);

  let rectSil = null;
  function dibujarFondo(){
    pintarPapel(fPapel);
    const r = ajustar(fSil);
    const c = fSil.getContext('2d');
    c.clearRect(0,0,r.width,r.height);
    const lado = Math.min(r.width, r.height);
    const box = { x:r.width*0.5 - lado*0.42, y:r.height*0.5 - lado*0.40, w:lado*0.84, h:lado*0.80 };
    rectSil = contener(sil, box);
    rellenarSilueta(c, sil, box, 'rgba(20,18,16,0.92)', true, 4);   // la línea negra del trazo
  }
  requestAnimationFrame(()=> requestAnimationFrame(dibujarFondo));

  const secciones = [...escena.querySelectorAll('.seccion-r')];
  const arribas   = [...escena.querySelectorAll('.nota-stack .arriba')];

  // aparicion de cada seccion
  const io = new IntersectionObserver(es=> es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); }), {threshold:.3});
  secciones.forEach(s=> io.observe(s));

  /* ----- cierre (etapa 3): muro de las 30.000 + acciones ----- */
  function dibujarMuro(){
    const cv = document.getElementById('muro'); if(!cv || !sil) return;
    const r = ajustar(cv);
    const c = cv.getContext('2d');
    c.clearRect(0,0,r.width,r.height);
    const cell = Math.max(34, Math.min(r.width, r.height)/12);
    const cols = Math.ceil(r.width/cell)+1, rows = Math.ceil(r.height/cell)+1;
    const hc = Math.floor(cols/2), hr = Math.floor(rows/2);   // la del usuario, al centro
    for(let row=0; row<rows; row++) for(let col=0; col<cols; col++){
      c.save(); c.translate(col*cell + cell*0.5, row*cell + cell*0.5);
      if(col===hc && row===hr){
        const s = cell*1.3, caja = {x:-s/2, y:-s/2, w:s, h:s};
        c.shadowColor='rgba(176,58,44,.75)'; c.shadowBlur=20;
        rellenarSilueta(c, sil, caja, '#f1e7cf', false);      // hueso, destaca
        c.shadowBlur=0;
        rellenarSilueta(c, sil, caja, '#b03a2c', true, 3);    // contorno rojo
      } else {
        c.rotate((Math.random()*2-1)*0.18);
        const s = cell*0.74*(0.82+Math.random()*0.3), caja = {x:-s/2, y:-s/2, w:s, h:s};
        c.globalAlpha = 0.10 + Math.random()*0.22;            // gentío anónimo, gris tenue
        rellenarSilueta(c, sil, caja, '#cfcabf', false);
      }
      c.restore();
    }
    // viñeta: el gentío se pierde hacia los bordes
    const g = c.createRadialGradient(r.width/2, r.height/2, Math.min(r.width,r.height)*0.18, r.width/2, r.height/2, Math.max(r.width,r.height)*0.62);
    g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,0.9)');
    c.globalAlpha=1; c.fillStyle=g; c.fillRect(0,0,r.width,r.height);
  }

  function compartirX(){
    const url = location.href.split('#')[0];
    const texto = 'Dibujé mi silueta. En 1983, el espacio fue la calle. Hoy, la memoria también disputa las redes. Sumá tu voz para que el pacto de silencio no se repita. #ElSiluetazo';
    window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(texto)+'&url='+encodeURIComponent(url), '_blank', 'noopener');
  }
  function descargarHuella(){
    if(!sil) return;
    const tam=1000, m=130, cv=document.createElement('canvas'); cv.width=tam; cv.height=tam;
    const c=cv.getContext('2d');
    rellenarSilueta(c, sil, {x:m, y:m, w:tam-2*m, h:tam-2*m}, '#141210', true, 9);
    cv.toBlob(b=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='mi-huella.png'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1500); });
  }

  const alInicio = ()=> window.scrollTo({ top:0, behavior:'smooth' });
  document.body.insertAdjacentHTML('beforeend', `<button class="volver-flota" id="volverFlota" aria-label="Volver a recorrer">↑</button>`);
  const volverFlota = document.getElementById('volverFlota');
  volverFlota.addEventListener('click', alInicio);
  document.getElementById('volverPie')?.addEventListener('click', alInicio);
  document.getElementById('compartir')?.addEventListener('click', compartirX);
  document.getElementById('descargar')?.addEventListener('click', descargarHuella);
  requestAnimationFrame(()=> requestAnimationFrame(dibujarMuro));

  // loop de scroll: paralaje de la silueta + crossfade papel/negro + desgarro
  let pidiendo = false;
  function actualizar(){
    const vh = window.innerHeight, vw = window.innerWidth;

    // camara de fondo: enfoca distintas partes de la figura segun el avance del scroll
    if(!reducido && sil && rectSil){
      const max = Math.max(1, document.body.scrollHeight - vh);
      const prog = clamp(window.scrollY / max, 0, 1);
      const f = prog * (TARGETS.length - 1);
      const i0 = Math.floor(f), i1 = Math.min(TARGETS.length-1, i0+1), t = suave(f - i0);
      const A = TARGETS[i0], B = TARGETS[i1];
      const fx = A.fx+(B.fx-A.fx)*t, fy = A.fy+(B.fy-A.fy)*t, S = A.s+(B.s-A.s)*t;
      const px = rectSil.ox + fx*rectSil.w, py = rectSil.oy + fy*rectSil.h;
      fSil.style.transform = `translate(${(vw/2 - px*S).toFixed(1)}px, ${(vh/2 - py*S).toFixed(1)}px) scale(${S.toFixed(3)})`;
    }

    // seccion activa -> cortina (negra en documentales, transparente en papel)
    let activa = secciones[0], mejor = Infinity;
    secciones.forEach(s=>{ const r=s.getBoundingClientRect(); const d=Math.abs((r.top+r.height/2)-vh/2); if(d<mejor){ mejor=d; activa=s; } });
    cortina.style.opacity = (activa && activa.dataset.bg === 'negro') ? '1' : '0';

    // boton flotante visible al acercarse al final
    if(volverFlota){
      const cerca = (window.scrollY + vh) > (document.body.scrollHeight - vh*1.2);
      volverFlota.classList.toggle('ver', cerca);
    }

    // desgarro: progreso dentro de la seccion alta (la nota queda fija mientras se rompe)
    if(!reducido) arribas.forEach(a=>{
      const r = a.closest('.seccion-r').getBoundingClientRect();
      const prog = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
      const tear = clamp((prog - 0.15) / 0.5, 0, 1);
      a.style.transform = `translateY(${(tear*130).toFixed(0)}%) rotate(${(3 + tear*15).toFixed(1)}deg) scale(${(1 + tear*0.12).toFixed(3)})`;
      a.style.opacity = (1 - tear).toFixed(2);
    });

    pidiendo = false;
  }
  window.addEventListener('scroll', ()=>{ if(!pidiendo){ requestAnimationFrame(actualizar); pidiendo=true; } }, {passive:true});
  window.addEventListener('resize', ()=>{ dibujarFondo(); dibujarMuro(); actualizar(); });
  actualizar();
}

/* ---------- arranque ---------- */
irIntro();
