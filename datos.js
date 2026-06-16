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
  },

  // PANTALLAS 4 a 9 — recorrido inmersivo
  // tipos: contexto | doc | nota | nota-doble
  // bg: 'papel' (claro, con la silueta de fondo) o 'negro' (placa documental)
  desarrollo: [
    { tipo:"contexto", bg:"papel",
      html:"El <b>21 de septiembre de 1983</b>, aún en dictadura, durante la III Marcha de la Resistencia convocada por las Madres de Plaza de Mayo se improvisó un inmenso taller al aire libre que duró hasta la medianoche." },

    { tipo:"contexto", bg:"papel",
      html:"Cientos de manifestantes pintaron, <b>pusieron el cuerpo</b> para bosquejar las siluetas, y luego las pegaron sobre paredes, monumentos y árboles, a pesar del dispositivo policial. Este hecho se conoce como <b>el Siluetazo</b>." },

    { tipo:"doc", bg:"negro", fotos:1,
      cita:"La participación y la creatividad unidas demuestran que cuando el pueblo es sensibilizado por el llamado de quienes lo necesitan, toma conciencia." },

    { tipo:"nota-doble", bg:"papel",
      arriba:{ titulo:"La idea", cuerpo:"El procedimiento fue iniciativa de tres artistas visuales: Rodolfo Aguerreberry, Julio Flores y Guillermo Kexel." },
      abajo: { titulo:"La idea", cuerpo:"Llevaron una propuesta escrita a las Madres de Plaza de Mayo, detallando su intención de realizar <b>30.000 imágenes</b> de figuras humanas a tamaño natural." } },

    { tipo:"doc", bg:"negro", fotos:3,
      cita:"Rodolfo Aguerreberry, Julio Flores y Guillermo Kexel." },

    { tipo:"nota", bg:"papel", lado:"der", titulo:"Las Abuelas",
      cuerpo:"“Las siluetas deben estar de pie, erguidas. En el suelo eran símbolo de muerte.” Fueron las Abuelas las que preguntaron dónde estaban las siluetas de las embarazadas y los niños desaparecidos. Nadie lo había pensado." },

    { tipo:"doc", bg:"negro", fotos:1,
      cita:"Las siluetas tienen relación con el silencio. Todo el mundo sabía pero nadie hablaba de ello. Era un gran pacto tácito de silencio." },

    { tipo:"nota", bg:"papel", lado:"izq", titulo:"El silencio",
      cuerpo:"Las siluetas ayudaron a la ruptura de ese pacto. Lo denunciaron." },

    { tipo:"nota-doble", bg:"papel",
      arriba:{ titulo:"Hecho gráfico", cuerpo:"La propuesta inicial no habla de arte, sino de crear un hecho gráfico que golpee por su magnitud física y por lo inusual de su realización." },
      abajo: { titulo:"Estética y política", cuerpo:"La toma política no se podría haber dado sin la toma estética. Implica una recuperación de los <b>lazos solidarios</b> perdidos en la dictadura." } },

    { tipo:"doc", bg:"negro", fotos:1,
      cita:"La conciencia del genocidio a partir del impacto de la imagen y de la transformación del espacio urbano." },

    { tipo:"nota-doble", bg:"papel",
      arriba:{ titulo:"Cualquiera podía", cuerpo:"No hacía falta saber dibujar. Te acostabas, alguien marcaba tu contorno, y listo. El que miraba pasaba a hacer." },
      abajo: { titulo:"Poner el cuerpo", cuerpo:"La acción de poner el cuerpo porta una <b>ambigüedad intrínseca</b>: ocupar el lugar del ausente es aceptar que cualquiera de los presentes <b>podría haber desaparecido</b>." } },

    { tipo:"doc", bg:"negro", fotos:1,
      cita:"Algunos jóvenes se acostaban sobre el papel, y otros marcaban con lápiz el formato del cuerpo." },

    { tipo:"nota", bg:"papel", lado:"der", titulo:"La huella",
      cuerpo:"La silueta es una <b>huella</b>, lo que queda de un <b>cuerpo ausente</b>. El <b>gesto siguió</b>, en otras siluetadas, en otras luchas." }
  ]
};
