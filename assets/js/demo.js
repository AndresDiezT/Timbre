/* Simulador de Timbre: celular grande, panel del dueño, modo interactivo y
   automático con escenas y subtítulos, y formatos 16:9 y 9:16 para grabar.
   Parámetros: ?gremio= &nombre= &color= &m= &asesora= &modo=auto|interactivo
               &formato=libre|169|916 &velocidad= &grabar=1 */
(async function () {
  'use strict';
  const T = window.Timbre;
  const $ = (s) => document.querySelector(s);
  const p = T.params;

  if ((p.get('m') || '').toLowerCase() === 'en') { location.replace('en.html' + location.search); return; }

  let datos;
  try { datos = await T.cargar({ idioma: 'es' }); } catch (e) {
    $('#telefono-demo').innerHTML = '<p class="tarjeta">No se pudo cargar la demostración. Ábrala desde un servidor (por ejemplo GitHub Pages).</p>';
    return;
  }
  const { marca, planes, gremios } = datos;
  const asesora = T.asesora(marca);
  const mercado = T.mercado(planes, ['co', 'usd']);
  const moneda = planes.mercados[mercado].moneda;

  const estado = {
    gremio: gremios.find((g) => g.id === p.get('gremio')) || gremios[0],
    nombre: (p.get('nombre') || '').trim().slice(0, 40),
    color: T.colorValido(p.get('color')),
    modo: p.get('modo') === 'interactivo' ? 'interactivo' : 'auto',
    formato: ['libre', '169', '916'].includes(p.get('formato')) ? p.get('formato') : 'libre',
    velocidad: Math.min(3, Math.max(0.5, parseFloat(p.get('velocidad')) || 1)),
    pausado: false,
    grabando: p.get('grabar') === '1'
  };
  const nombreNegocio = () => estado.nombre || estado.gremio.nombre;

  /* ---------- Controles ---------- */
  const selGremio = $('#d-gremio');
  selGremio.innerHTML = gremios.map((g) => `<option value="${g.id}">${T.esc(g.gremio)}</option>`).join('');
  selGremio.value = estado.gremio.id;
  const inNombre = $('#d-nombre');
  inNombre.value = estado.nombre;
  const selVel = $('#d-velocidad');
  selVel.value = [...selVel.options].some((o) => +o.value === estado.velocidad) ? String(estado.velocidad) : '1';

  /* ---------- Panel del dueño ---------- */
  $('#panel-campana').innerHTML = T.htmlCampana();
  const campanaPanel = $('#panel-campana .campana');
  const Panel = {
    items: {},
    limpiar() {
      $('#panel-lista').innerHTML = '';
      $('#panel-alertas').innerHTML = '';
      this.items = {};
      $('#panel-vacio').hidden = false;
    },
    sonar() {
      campanaPanel.classList.remove('sonando');
      void campanaPanel.offsetWidth;
      campanaPanel.classList.add('sonando');
    },
    contacto(id, { nombre, texto, hora, etiqueta }) {
      let li = this.items[id];
      if (!li) {
        li = document.createElement('li');
        li.className = 'contacto';
        li.innerHTML = '<span class="contacto__avatar" aria-hidden="true"></span><span class="contacto__nombre"></span><span class="contacto__hora"></span><span class="contacto__texto"></span><span class="pildora"></span>';
        this.items[id] = li;
      }
      if (nombre) { li.querySelector('.contacto__nombre').textContent = nombre; li.querySelector('.contacto__avatar').textContent = T.iniciales(nombre); }
      if (texto) li.querySelector('.contacto__texto').textContent = texto;
      if (hora) li.querySelector('.contacto__hora').textContent = hora;
      if (etiqueta) li.querySelector('.pildora').textContent = etiqueta;
      Object.values(this.items).forEach((x) => x.classList.remove('contacto--nuevo'));
      li.classList.add('contacto--nuevo');
      $('#panel-lista').prepend(li);
      $('#panel-vacio').hidden = true;
      this.sonar();
    },
    alerta(texto) {
      const div = document.createElement('div');
      div.className = 'panel__alerta';
      div.textContent = texto;
      const caja = $('#panel-alertas');
      caja.prepend(div);
      while (caja.children.length > 2) caja.lastChild.remove();
      this.sonar();
    }
  };

  /* ---------- Celular ---------- */
  let tel;
  function crearTelefono() {
    if (tel) tel.detener();
    tel = new TimbreTelefono($('#telefono-demo'), {
      negocio: estado.gremio, nombre: estado.nombre, color: estado.color,
      idioma: 'es', moneda, velocidad: estado.velocidad,
      interactivo: estado.modo === 'interactivo', anunciar: estado.modo === 'interactivo',
      alEvento: alEvento
    });
  }

  function alEvento(nombre, d) {
    if (nombre === 'panel' && d.fn) d.fn(d);
    if (estado.modo !== 'interactivo') return;
    if (nombre === 'mensaje') Panel.contacto('usted', { nombre: 'Usted (cliente de prueba)', texto: d.texto, hora: d.hora, etiqueta: estado.gremio.etiquetas[0] });
    if (nombre === 'persona') Panel.alerta('El cliente pidió hablar con una persona. Así le llega el aviso al dueño.');
  }

  const panelPaso = (fn) => ({ tipo: 'evento', nombre: 'panel', datos: { fn }, espera: 200 });

  /* ---------- Escenas del modo automático ---------- */
  function horaCerrado(g) {
    return [21 * 60 + 47, 22 * 60 + 47, 23 * 60 + 47, 3 * 60].find((m) => !T.abierto(g, 'mar', m)) || 3 * 60;
  }
  function horaApertura(g) {
    const r = g.horario.mie || g.horario.jue;
    if (!r) return 8 * 60;
    const [h, m] = r[0].split(':').map(Number);
    return h * 60 + m + 2;
  }
  function elegirRapida(g) {
    const rr = g.mensajes.respuestasRapidas;
    if (moneda === 'COP') return rr[1] || rr[0];
    return rr.find((r) => !r.texto.includes('$')) || rr[0];
  }

  function escenas() {
    const g = estado.gremio;
    const nom = nombreNegocio();
    const [c1, c2, c3] = g.clientesDemo || ['Cliente 1', 'Cliente 2', 'Cliente 3'];
    const conv = g.conversacion;
    const otra = conv.find((c, i) => i > 0 && c.responde !== 'persona') || conv[0];
    const persona = conv.find((c) => c.responde === 'persona') || conv[conv.length - 1];
    const noche = horaCerrado(g);
    const manana = horaApertura(g);
    const hN = T.hora(Math.floor(noche / 60), noche % 60);
    const hM = T.hora(Math.floor(manana / 60), manana % 60);
    const rapida = elegirRapida(g);
    const et = g.etiquetas;
    return [
      { sub: `${hN} ${nom} ya cerró y un cliente escribe.`, pasos: [
        { tipo: 'reloj', minutos: noche, dia: 'mar', espera: 0 },
        { tipo: 'fecha', espera: 0 },
        { tipo: 'cliente', texto: conv[0].cliente, espera: 1100 },
        panelPaso(() => Panel.contacto('c1', { nombre: c1, texto: conv[0].cliente, hora: hN, etiqueta: et[0] }))
      ] },
      { sub: 'Al instante le llega la respuesta, con el catálogo y los precios.', pasos: [
        { tipo: 'escribiendo', ms: 900 },
        { tipo: 'negocio', texto: g.mensajes.fueraDeHorario, auto: true, espera: 0 },
        { tipo: 'catalogo', espera: 1400 }
      ] },
      { sub: 'También el horario, para que sepa cuándo lo atienden.', pasos: [
        { tipo: 'horario', espera: 600 }
      ] },
      { sub: `${hM} El dueño abre el celular y encuentra todo organizado con etiquetas.`, pasos: [
        { tipo: 'reloj', minutos: manana, dia: 'mie', espera: 300 },
        { tipo: 'fecha', texto: 'Al día siguiente', espera: 300 },
        panelPaso(() => { Panel.contacto('c1', { hora: hM, etiqueta: et[1] }); Panel.alerta(`${c1} escribió anoche y ya recibió respuesta.`); })
      ] },
      { sub: 'Con una respuesta rápida, contesta en segundos.', pasos: [
        { tipo: 'negocio', texto: rapida.texto, rapida: rapida.atajo, espera: 1200 }
      ] },
      { sub: 'El cliente responde y la etiqueta cambia. Nada se pierde.', pasos: [
        { tipo: 'cliente', texto: '¡Listo, muchas gracias!', espera: 1200 },
        panelPaso(() => Panel.contacto('c1', { texto: '¡Listo, muchas gracias!', etiqueta: et[2] }))
      ] },
      { sub: 'Mientras tanto, otros clientes también reciben respuesta.', pasos: [
        panelPaso(() => Panel.contacto('c2', { nombre: c2, texto: otra.cliente, hora: hM, etiqueta: et[0] })),
        { tipo: 'pausa', espera: 1300 },
        panelPaso(() => Panel.contacto('c3', { nombre: c3, texto: persona.cliente, hora: hM, etiqueta: et[0] }))
      ] },
      { sub: 'Y si alguien pide hablar con una persona, al dueño le llega una alerta.', pasos: [
        panelPaso(() => Panel.alerta(`${c3} pide hablar con una persona.`))
      ] },
      { cierre: true }
    ];
  }

  let ciclo = 0;
  async function esperar(ms, mio) {
    let t = 0;
    while (t < ms) {
      await T.esperar(100);
      if (mio !== ciclo) return false;
      if (!estado.pausado) t += 100;
    }
    return true;
  }

  async function reproducirAuto() {
    const mio = ++ciclo;
    Panel.limpiar();
    tel.limpiar();
    $('#cierre').hidden = true;
    for (const e of escenas()) {
      if (mio !== ciclo) return;
      if (e.cierre) {
        $('#subtitulo').textContent = '';
        $('#cierre').hidden = false;
        if (!(await esperar(4200 / estado.velocidad, mio))) return;
        $('#cierre').hidden = true;
        continue;
      }
      $('#subtitulo').textContent = e.sub;
      if (!(await esperar(500, mio))) return;
      const ok = await tel.ejecutar(e.pasos, { limpiar: false });
      if (!ok || mio !== ciclo) return;
      if (!(await esperar(2000 / estado.velocidad, mio))) return;
    }
    if (mio === ciclo) reproducirAuto();
  }

  function iniciarInteractivo() {
    ciclo++;
    Panel.limpiar();
    $('#cierre').hidden = true;
    $('#subtitulo').textContent = 'Toque los botones debajo del chat, como si fuera un cliente.';
    const ahora = new Date();
    const min = ahora.getHours() * 60 + ahora.getMinutes();
    const dia = T.DIAS[ahora.getDay()];
    tel.ejecutar(TimbreTelefono.guionLlegada(estado.gremio, { minutos: min, dia, moneda }).filter((x) => x.tipo !== 'aviso'));
  }

  /* ---------- Formatos ---------- */
  function ajustar() {
    const esc = $('#escenario');
    const lienzo = $('#lienzo');
    esc.dataset.formato = estado.formato;
    if (estado.formato === 'libre') { esc.style.transform = ''; lienzo.style.height = ''; return; }
    const [w, h] = estado.formato === '169' ? [1280, 720] : [720, 1280];
    const anchoDisp = lienzo.clientWidth - (estado.grabando ? 0 : 32);
    const altoDisp = estado.grabando ? window.innerHeight : Math.max(window.innerHeight - 60, 420);
    const s = Math.min(anchoDisp / w, altoDisp / h);
    const x = (lienzo.clientWidth - w * s) / 2;
    const y = estado.grabando ? (window.innerHeight - h * s) / 2 : 16;
    esc.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    lienzo.style.height = estado.grabando ? '100vh' : `${h * s + 40}px`;
  }
  window.addEventListener('resize', ajustar);

  function grabacion(activar) {
    estado.grabando = activar;
    document.body.classList.toggle('grabando', activar);
    $('#d-salir').hidden = !activar;
    ajustar();
    if (activar) $('#escenario').focus();
    else $('#d-grabar').focus();
    sincronizarUrl();
  }
  $('#d-grabar').addEventListener('click', () => grabacion(true));
  $('#d-salir').addEventListener('click', () => grabacion(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && estado.grabando) grabacion(false); });

  /* ---------- Enlaces y URL ---------- */
  function sincronizarUrl() {
    const url = new URL(location.href);
    const poner = (k, v) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k));
    poner('gremio', estado.gremio.id);
    poner('nombre', estado.nombre);
    poner('modo', estado.modo);
    poner('formato', estado.formato === 'libre' ? '' : estado.formato);
    poner('velocidad', estado.velocidad === 1 ? '' : String(estado.velocidad));
    poner('grabar', estado.grabando ? '1' : '');
    history.replaceState(null, '', url);
    const texto = estado.nombre
      ? `Hola, vi la demostración de Timbre para ${estado.nombre} (${estado.gremio.gremioCorto.toLowerCase()}) y lo quiero para mi negocio.`
      : `Hola, vi la demostración de Timbre (${estado.gremio.gremioCorto.toLowerCase()}) y lo quiero para mi negocio.`;
    $('#d-loquiero').href = T.enlaceWhatsapp(marca, { texto, asesora });
  }

  function pintarModo() {
    document.querySelectorAll('[data-modo]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === estado.modo)));
    $('#controles-auto').hidden = false;
    $('#d-play').hidden = estado.modo !== 'auto';
    $('#d-reiniciar').hidden = estado.modo !== 'auto';
    $('#nota-modo').textContent = estado.modo === 'interactivo'
      ? 'Modo interactivo: responder a cualquier pregunta así es lo que hace un asistente virtual con IA (desarrollo a la medida). Los planes Esencial y Pro incluyen la bienvenida, el mensaje fuera de horario, el catálogo y las respuestas rápidas.'
      : 'Modo automático: muestra lo que incluye el plan Esencial. La bienvenida y el mensaje fuera de horario se envían solos; el dueño contesta lo demás con respuestas rápidas.';
  }

  function arrancar() {
    crearTelefono();
    pintarModo();
    estado.pausado = false;
    $('#d-play').textContent = 'Pausar';
    if (estado.modo === 'auto') reproducirAuto(); else iniciarInteractivo();
    sincronizarUrl();
  }

  selGremio.addEventListener('change', () => { estado.gremio = gremios.find((g) => g.id === selGremio.value); estado.color = null; arrancar(); });
  let tNombre;
  inNombre.addEventListener('input', () => {
    clearTimeout(tNombre);
    tNombre = setTimeout(() => { estado.nombre = inNombre.value.trim().slice(0, 40); arrancar(); }, 450);
  });
  document.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => { estado.modo = b.dataset.modo; arrancar(); }));
  document.querySelectorAll('[data-formato]').forEach((b) => b.addEventListener('click', () => {
    estado.formato = b.dataset.formato;
    document.querySelectorAll('[data-formato]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    ajustar();
    sincronizarUrl();
  }));
  document.querySelectorAll('[data-formato]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.formato === estado.formato)));
  selVel.addEventListener('change', () => { estado.velocidad = +selVel.value; tel.o.velocidad = estado.velocidad; sincronizarUrl(); });
  $('#d-play').addEventListener('click', (e) => {
    estado.pausado = !estado.pausado;
    if (estado.pausado) tel.pausar(); else tel.reanudar();
    e.currentTarget.textContent = estado.pausado ? 'Reanudar' : 'Pausar';
  });
  $('#d-reiniciar').addEventListener('click', arrancar);

  arrancar();
  if (estado.grabando) grabacion(true); else ajustar();
})();
