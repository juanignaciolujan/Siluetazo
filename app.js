/* =========================================================
   SILUETEANDO — logica
   Construye el recorrido desde datos.js, maneja el dibujo de la
   silueta, su caminata por el scroll y la llegada al muro final.
   Todo del lado del navegador. Nada se sube a ningun lado.
   ========================================================= */

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* la silueta dibujada se guarda normalizada (0..1) para redibujarla
   en cualquier tamaño y color: en el tablero, en el companion, en el muro */
let silueta = null;   // { norm:[{x,y}], aspecto }

/* ---------- color util ---------- */
function color(varName){
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/* ---------- 1. CONSTRUIR EL RECORRIDO DESDE DATOS ---------- */
const scroll = document.getElementById('scroll');

function lineasHTML(arr){ return (arr||[]).map(t=>`<p>${t}</p>`).join(''); }

function plantilla(s){
  const ficha = s.num
    ? `<div class="ficha bloque"><span class="reg">${DATOS.meta.registro}</span> · ${s.num}</div>` : '';

  if(s.tipo === 'portada'){
    return `<h1 class="marca bloque">${s.titulo}</h1>
            <p class="sub bloque">${s.sub}</p>
            <p class="entrada bloque">${s.entrada} ↓</p>`;
  }
  if(s.tipo === 'pregunta'){
    return `${ficha}
            <h2 class="titulo bloque">${s.texto}</h2>
            <p class="pie bloque">${s.pie||''}</p>`;
  }
  if(s.tipo === 'dibujo'){
    return `${ficha}
            <h2 class="instruccion bloque">${s.instruccion}</h2>
            <p class="ayuda bloque">${s.ayuda||''}</p>
            <div class="tablero bloque">
              <canvas id="lienzo"></canvas>
              <div class="marca-toque" id="marcaToque">Trazá acá</div>
            </div>
            <div class="controles bloque">
              <button class="btn btn--ghost" id="btnOtra">Otra vez</button>
              <button class="btn" id="btnListo" disabled>Listo</button>
            </div>
            <p class="cierre-dibujo" id="cierreDibujo">${s.cierre||''}</p>`;
  }
  if(s.tipo === 'cierre'){
    return `${ficha}
            <h2 class="titulo bloque">${s.titulo}</h2>
            <div class="muro bloque"><canvas id="muroLienzo"></canvas></div>
            <p class="numerazo bloque">${DATOS.meta.numero}<small>desaparecidos</small></p>
            ${lineasHTML(s.lineas) ? `<div class="lineas bloque">${lineasHTML(s.lineas)}</div>` : ''}
            <p class="pie bloque">${s.pie||''}</p>`;
  }
  // texto
  return `${ficha}
          <h2 class="titulo bloque">${s.titulo}</h2>
          <div class="lineas bloque">${lineasHTML(s.lineas)}</div>
          ${s.consigna ? `<span class="consigna bloque">${s.consigna}</span>` : ''}
          ${s.cita ? `<p class="cita bloque">${s.cita}</p>` : ''}
          ${s.pie ? `<p class="pie bloque">${s.pie}</p>` : ''}`;
}

DATOS.secciones.forEach((s, i)=>{
  const el = document.createElement('section');
  el.className = 'seccion ' + s.tipo + (s.tipo==='portada' ? ' portada' : '');
  el.dataset.tipo = s.tipo;
  el.dataset.indice = i;
  el.innerHTML = plantilla(s);
  scroll.appendChild(el);
});

/* ---------- 2. DIBUJAR UNA SILUETA (path -> normalizado) ---------- */
const lienzo   = document.getElementById('lienzo');
const ctx      = lienzo.getContext('2d');
const marca    = document.getElementById('marcaToque');
const btnListo = document.getElementById('btnListo');
const btnOtra  = document.getElementById('btnOtra');
const cierreD  = document.getElementById('cierreDibujo');
const tablero  = lienzo.parentElement;

let puntos = [];      // puntos en px CSS del tablero
let trazando = false;

function ajustar(cv){
  const r = cv.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  cv.width = Math.round(r.width*dpr);
  cv.height = Math.round(r.height*dpr);
  const c = cv.getContext('2d');
  c.setTransform(dpr,0,0,dpr,0,0);
  return r;
}

function pintarTrazo(){
  const r = lienzo.getBoundingClientRect();
  ctx.clearRect(0,0,r.width,r.height);
  if(puntos.length){
    ctx.beginPath();
    ctx.moveTo(puntos[0].x, puntos[0].y);
    for(let i=1;i<puntos.length;i++) ctx.lineTo(puntos[i].x, puntos[i].y);
    if(puntos.length>3) ctx.closePath();
    ctx.fillStyle = 'rgba(217,199,161,.22)';
    ctx.fill();
    ctx.strokeStyle = color('--papel');
    ctx.lineWidth = 2.5; ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.stroke();
  }
}

function coord(e){
  const r = lienzo.getBoundingClientRect();
  return { x:e.clientX - r.left, y:e.clientY - r.top };
}

tablero.addEventListener('pointerdown', e=>{
  trazando = true; tablero.setPointerCapture(e.pointerId);
  marca.style.display = 'none';
  puntos.push(coord(e)); pintarTrazo();
});
tablero.addEventListener('pointermove', e=>{
  if(!trazando) return;
  puntos.push(coord(e));
  if(puntos.length>5) btnListo.disabled = false;
  pintarTrazo();
});
function soltar(){ trazando = false; }
tablero.addEventListener('pointerup', soltar);
tablero.addEventListener('pointercancel', soltar);

btnOtra.addEventListener('click', ()=>{
  puntos = []; btnListo.disabled = true;
  const r = lienzo.getBoundingClientRect();
  ctx.clearRect(0,0,r.width,r.height);
  marca.style.display = '';
  cierreD.classList.remove('on');
});

btnListo.addEventListener('click', ()=>{
  if(puntos.length < 6) return;
  // normalizar a 0..1 dentro del bounding box
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  puntos.forEach(p=>{ minX=Math.min(minX,p.x); minY=Math.min(minY,p.y); maxX=Math.max(maxX,p.x); maxY=Math.max(maxY,p.y); });
  const bw = Math.max(1,maxX-minX), bh = Math.max(1,maxY-minY);
  silueta = {
    norm: puntos.map(p=>({ x:(p.x-minX)/bw, y:(p.y-minY)/bh })),
    aspecto: bw/bh
  };
  // confirmar el trazo en el tablero, ya como recorte de papel
  const r = lienzo.getBoundingClientRect();
  ctx.clearRect(0,0,r.width,r.height);
  rellenarSilueta(ctx, {x:minX,y:minY,w:bw,h:bh}, color('--papel'));
  cierreD.classList.add('on');
  encenderCompanion();
});

/* dibuja la silueta guardada dentro de una caja destino (contain), de un color */
function rellenarSilueta(c, caja, tinta){
  if(!silueta) return;
  const a = silueta.aspecto;
  let w = caja.w, h = caja.w/a;
  if(h > caja.h){ h = caja.h; w = caja.h*a; }
  const ox = caja.x + (caja.w-w)/2;
  const oy = caja.y + (caja.h-h)/2;
  c.beginPath();
  silueta.norm.forEach((p,i)=>{
    const x = ox + p.x*w, y = oy + p.y*h;
    i ? c.lineTo(x,y) : c.moveTo(x,y);
  });
  c.closePath();
  c.fillStyle = tinta; c.fill();
}

/* ---------- 3. LA SILUETA QUE CAMINA (companion) ---------- */
const compEl = document.getElementById('companion');
const compCv = compEl.querySelector('canvas');

function dibujarCompanion(){
  if(!silueta) return;
  const r = ajustar(compCv);
  const c = compCv.getContext('2d');
  c.clearRect(0,0,r.width,r.height);
  rellenarSilueta(c, {x:6,y:4,w:r.width-12,h:r.height-8}, color('--papel'));
}
function encenderCompanion(){
  dibujarCompanion();
  compEl.classList.add('on');
}

/* ---------- 4. SCROLL: aparicion de secciones + disparar el muro ---------- */
const io = new IntersectionObserver((entradas)=>{
  entradas.forEach(en=>{
    if(en.isIntersecting){
      en.target.classList.add('visible');
      if(en.target.dataset.tipo === 'cierre') llegarAlMuro();
    }
  });
}, { threshold:.28 });
document.querySelectorAll('.seccion').forEach(s=> io.observe(s));

/* ---------- 5. EL MURO DE LAS 30.000 ---------- */
const muroLienzo = document.getElementById('muroLienzo');
let muroPintado = false;

// figura generica de la multitud (un cuerpo simple, anonimo)
function figuraGenerica(c, x, y, h, tinta){
  const w = h*0.42;
  c.fillStyle = tinta;
  c.beginPath();                                   // cabeza
  c.arc(x, y + h*0.14, h*0.12, 0, Math.PI*2);
  c.fill();
  c.beginPath();                                   // cuerpo
  c.moveTo(x - w*0.5, y + h);
  c.quadraticCurveTo(x - w*0.5, y + h*0.30, x, y + h*0.28);
  c.quadraticCurveTo(x + w*0.5, y + h*0.30, x + w*0.5, y + h);
  c.closePath();
  c.fill();
}

function pintarMuro(){
  const r = ajustar(muroLienzo);
  const c = muroLienzo.getContext('2d');
  c.clearRect(0,0,r.width,r.height);

  // multitud: muchas figuras de papel, tenues, evocando la magnitud
  const filas = 7;
  const fh = r.height / (filas + .5);
  const figAlto = fh * 0.92;
  for(let f=0; f<filas; f++){
    const y = f*fh + fh*0.2;
    const sep = figAlto*0.46;
    const jitterFila = (f%2) * sep*0.5;
    for(let x = -sep; x < r.width + sep; x += sep){
      const jx = (Math.sin((f*13.3 + x)*0.7)) * sep*0.12;
      const op = 0.18 + ((f+ x*0.013) % 1) * 0.12;
      c.globalAlpha = Math.min(.4, op);
      figuraGenerica(c, x + jitterFila + jx, y, figAlto, color('--papel'));
    }
  }
  c.globalAlpha = 1;

  // tu silueta, mas grande y plena, sumada a la multitud
  if(silueta){
    const w = r.width*0.20, h = r.height*0.62;
    const x = r.width*0.5 - w/2, y = r.height*0.5 - h/2;
    rellenarSilueta(c, {x, y, w, h}, color('--papel'));
    // marca de "la tuya": un contorno rojo apenas
    c.save();
    c.translate(0,0);
    c.beginPath();
    const a = silueta.aspecto; let dw=w, dh=w/a; if(dh>h){dh=h;dw=h*a;}
    const ox = x+(w-dw)/2, oy = y+(h-dh)/2;
    silueta.norm.forEach((p,i)=>{ const px=ox+p.x*dw, py=oy+p.y*dh; i?c.lineTo(px,py):c.moveTo(px,py); });
    c.closePath();
    c.strokeStyle = color('--rojo'); c.lineWidth = 2; c.stroke();
    c.restore();
  }
}

function llegarAlMuro(){
  if(muroPintado) return;
  muroPintado = true;
  if(silueta){
    compEl.classList.add('llego');            // el companion se suma y se apaga
  } else {
    // si nunca dibujo, lo invitamos a hacerlo
    const aviso = document.createElement('p');
    aviso.className = 'sin-silueta bloque';
    aviso.textContent = 'Todavía no dibujaste tu silueta. Volvé arriba para sumarla.';
    muroLienzo.parentElement.insertAdjacentElement('afterend', aviso);
  }
  pintarMuro();
}

/* ---------- 6. RESIZE ---------- */
let t;
window.addEventListener('resize', ()=>{
  clearTimeout(t);
  t = setTimeout(()=>{
    if(compEl.classList.contains('on')) dibujarCompanion();
    if(muroPintado) pintarMuro();
  }, 180);
});

/* primer ajuste del tablero cuando entra en pantalla */
const ioTablero = new IntersectionObserver((en)=>{
  en.forEach(e=>{ if(e.isIntersecting){ ajustar(lienzo); pintarTrazo(); } });
}, { threshold:.2 });
ioTablero.observe(tablero);
