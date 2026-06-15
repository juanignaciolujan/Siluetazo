/* =========================================================
   CONTENIDO EDITABLE — "El Siluetazo" (version final, una sola pagina)
   Etapa 1: pantallas 1 a 3 (intro, secuencia narrativa, lienzo).
   El recorrido y el cierre se suman en las proximas etapas.
   ========================================================= */

const DATOS = {

  // PANTALLA 1 — intro
  intro: {
    titulo: "El Siluetazo",
    subtitulo: "Un acercamiento al hecho gráfico",
    cta: "Click para comenzar"
  },

  // PANTALLA 2 — secuencia narrativa automatica (placas que aparecen y desaparecen)
  // h1 = ancla central (sans bold) · h2 = bajada debajo (maquina de escribir)
  narrativa: [
    { h1:"Siluetas...",                    h2:"Faltantes, vacías, desaparecidas." },
    { h1:"¿De quién?",                     h2:"Tuyas, mías, nuestras." },
    { h1:"¿Cuántas?",                      h2:"30.000 ¿Quién va a dibujar tantas?" },
    { h1:"¿Quién va a dibujar tu silueta?", h2:"Nadie puede contornearse solo. Siempre hace falta otro que te remarque." }
  ],

  // tiempos de la secuencia narrativa (en ms) — ajustables
  ritmo: { fadeIn:600, hold:2000, fadeOut:600, gap:300 },

  // PANTALLA 3 — lienzo (el gancho interactivo)
  lienzo: {
    titulo: "Dibujá una silueta",
    instruccion: "Arrastrá el dedo para trazar un cuerpo. Cuando lo cierres, va a caminar con vos.",
    postDibujo: "Eso que acabás de hacer, miles lo hicieron una sola noche de 1983.",
    boton: "Listo"
  }
};
