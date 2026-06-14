/* =========================================================
   CONTENIDO EDITABLE — "Silueteando"
   Este es el unico archivo que toca el equipo para cambiar textos
   o reordenar el recorrido. No hace falta abrir app.js.
   Cada seccion tiene un "tipo" que define como se muestra.

   FUENTES (para consulta del equipo, no se ven en la web):
   03 Liprandi / Lopez Iglesias   06 Kexel / Fernandez / Buntinx
   04 Flores / Hebe / Fernandez    07 Fernandez / Mango-Warley
   05 Amigo / Ameijeiras / Gruner  08 Liprandi / Buntinx / Amigo
   09 Amigo Cerisola / Liprandi    10 Amigo / Fernandez / Flores
   11 Liprandi / Kexel             12 Objetivos del brief
   ========================================================= */

const DATOS = {
  meta: {
    titulo: "Silueteando",
    subtitulo: "Un acercamiento al Siluetazo",
    registro: "Relevamiento",
    numero: "30.000"
  },

  secciones: [
    { tipo:"portada",
      titulo:"Silueteando",
      sub:"Un acercamiento al Siluetazo",
      entrada:"Bajá para entrar" },

    { tipo:"pregunta", num:"01",
      texto:"¿Quién va a dibujar tu silueta?",
      pie:"Nadie puede contornearse solo. Siempre hace falta otro que te marque." },

    { tipo:"dibujo", num:"02",
      instruccion:"Dibujá una silueta",
      ayuda:"Arrastrá el dedo para trazar un cuerpo. Cuando lo cierres, va a caminar con vos.",
      cierre:"Eso que acabás de hacer, miles lo hicieron una sola noche de 1983." },

    { tipo:"texto", num:"03", titulo:"El silencio",
      lineas:[
        "Entre 1976 y 1983, una dictadura hizo desaparecer a 30.000 personas.",
        "Todos sabían. Casi nadie lo decía." ],
      consigna:"el silencio es salud" },

    { tipo:"texto", num:"04", titulo:"La ausencia",
      lineas:[
        "No tenían tumba. No tenían cuerpo.",
        "¿Cómo se muestra a alguien que ya no está?" ] },

    { tipo:"texto", num:"05", titulo:"La idea",
      lineas:[
        "Tres artistas propusieron algo simple.",
        "Dibujar 30.000 cuerpos vacíos, a tamaño real.",
        "Cada figura, una persona. Todas, todos." ],
      pie:"La técnica venía de un ejercicio de escuela: contornear a un compañero acostado sobre el papel." },

    { tipo:"texto", num:"06", titulo:"Las reglas de las Madres",
      lineas:[
        "De pie, nunca tiradas en el piso.",
        "Sin rostro, todas iguales.",
        "Una sola frase." ],
      consigna:"aparición con vida",
      pie:"Un cuerpo en el suelo es la marca de un muerto. Erguido, es alguien que todavía reclama." },

    { tipo:"texto", num:"07", titulo:"Cualquiera podía",
      lineas:[
        "No hacía falta saber dibujar.",
        "Te acostabas, alguien marcaba tu contorno, y listo.",
        "El que miraba pasaba a hacer." ] },

    { tipo:"texto", num:"08", titulo:"Poner el cuerpo",
      lineas:[
        "Acostarse sobre el papel era ocupar el lugar del que ya no estaba.",
        "Llenar ese vacío con el cuerpo propio." ],
      cita:"«Hacé a mi papá», pedía un pibe." },

    { tipo:"texto", num:"09", titulo:"Estética y política",
      lineas:[
        "Diseñar, dibujar y pegar se volvieron formas de resistir.",
        "Una toma estética que era, al mismo tiempo, política." ] },

    { tipo:"texto", num:"10", titulo:"La noche en la calle",
      lineas:[
        "Las siluetas aparecieron por todos lados.",
        "Paredes, árboles, monumentos, cabinas de teléfono.",
        "La policía tenía orden de cuidar las paredes." ],
      cita:"«Ése que estás arrancando es mi hijo», gritó una Madre." },

    { tipo:"texto", num:"11", titulo:"La huella",
      lineas:[
        "La silueta es lo que queda de un cuerpo ausente.",
        "El gesto siguió, en otras luchas." ],
      pie:"«Las siluetas no son lo importante. Los desaparecidos sí.»" },

    { tipo:"cierre", num:"12", titulo:"Tu silueta, entre las 30.000",
      lineas:[
        "Volvé a la primera pregunta.",
        "¿Quién va a dibujar tu silueta?" ],
      pie:"Hacer memoria, hoy, también es un gesto gráfico." }
  ]
};
