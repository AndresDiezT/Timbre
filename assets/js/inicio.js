/* Página principal: selector de mercado, celular con hora del día,
   galería de gremios, calculadora, planes y preguntas frecuentes. */
(async function () {
  'use strict';
  const T = window.Timbre;
  const $ = (s) => document.querySelector(s);

  // ?m=en lleva a la versión en inglés.
  if ((T.params.get('m') || '').toLowerCase() === 'en') {
    location.replace('en/' + location.search);
    return;
  }

  let datos;
  try {
    datos = await T.cargar({ idioma: 'es' });
  } catch (e) {
    document.querySelectorAll('#telefono-portada, #telefono-galeria').forEach((el) => {
      el.innerHTML = '<p class="tarjeta">No se pudo cargar la demostración. Abra el sitio desde un servidor (por ejemplo GitHub Pages).</p>';
    });
    return;
  }
  const { marca, planes, gremios } = datos;
  const asesora = T.asesora(marca);
  let mercado = T.mercado(planes, ['co', 'usd']);

  /* ---------- WhatsApp ---------- */
  function pintarWhatsapp() {
    const url = T.enlaceWhatsapp(marca, { texto: marca.mensajesWhatsapp[mercado], asesora });
    document.querySelectorAll('.js-whatsapp').forEach((a) => { a.href = url; a.target = '_blank'; a.rel = 'noopener'; });
  }

  /* ---------- Celular de la portada con la hora del día ---------- */
  const negocioPortada = gremios.find((g) => g.id === 'panaderia') || gremios[0];
  const telPortada = new TimbreTelefono($('#telefono-portada'), { negocio: negocioPortada, idioma: 'es' });
  const rango = $('#hora-dia');
  const salida = $('#hora-salida');
  const estado = $('#hora-estado');
  let temporizador;

  function textoHora(min) { return T.hora(Math.floor(min / 60), min % 60, 'es'); }

  function actualizarHora(reproducir) {
    const min = +rango.value;
    salida.textContent = textoHora(min);
    rango.setAttribute('aria-valuetext', textoHora(min));
    const abierto = T.abierto(negocioPortada, 'mar', min);
    estado.innerHTML = abierto
      ? `A las ${textoHora(min)} el negocio está <b>abierto</b>: responde con la bienvenida al instante.`
      : `A las ${textoHora(min)} el negocio está <b>cerrado</b>, y aun así el cliente recibe respuesta.`;
    telPortada.setReloj(min, 'mar');
    if (reproducir) {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => telPortada.ejecutar(TimbreTelefono.guionLlegada(negocioPortada, { minutos: min, moneda: monedaActual() })), 180);
    }
  }
  rango.addEventListener('input', () => actualizarHora(true));
  document.querySelectorAll('[data-hora]').forEach((b) => b.addEventListener('click', () => {
    rango.value = b.dataset.hora;
    actualizarHora(true);
  }));

  function monedaActual() { return planes.mercados[mercado].moneda; }

  /* ---------- Antes y después ---------- */
  function msj(clase, texto, hora, extra = '') {
    return `<div class="msj ${clase}"><p>${T.esc(texto)}</p><div class="msj__pie">${extra}<span>${hora}</span></div></div>`;
  }
  function pintarComparacion() {
    const neg = negocioPortada;
    const pregunta = neg.conversacion[0].cliente;
    $('#chat-antes').innerHTML =
      msj('msj--cliente', pregunta, '9:47 p. m.') +
      '<span class="chat-mini__espera">Sin respuesta durante 11 horas</span>' +
      msj('msj--negocio', 'Buenos días, sí podemos. ¿Todavía la necesita?', '8:52 a. m.') +
      msj('msj--cliente', 'Gracias, ya la encargué en otro lado.', '9:05 a. m.');
    $('#chat-despues').innerHTML =
      msj('msj--cliente', pregunta, '9:47 p. m.') +
      msj('msj--negocio', T.plantilla(neg.mensajes.bienvenida, { negocio: neg.nombre, horario: neg.horarioTexto }), '9:47 p. m.', '<span class="msj__auto">Automático</span>') +
      msj('msj--cliente', 'Perfecto, se la encargo. Le mando el sabor y el nombre.', '9:48 p. m.');
    document.querySelectorAll('.chat-mini').forEach((c) => {
      c.style.setProperty('--acento', neg.acento);
      c.style.setProperty('--sobre-acento', T.contraste(neg.acento));
    });
  }

  /* ---------- Perfil en el mapa (ilustración genérica) ---------- */
  function pintarMapa(g) {
    const u = g.ubicacion || {};
    const ahora = new Date();
    const dia = T.DIAS[ahora.getDay()];
    const min = ahora.getHours() * 60 + ahora.getMinutes();
    const abierto = T.abierto(g, dia, min);
    const fila = T.horarioFilas(g, 'es').find((f) => f.dias.includes(dia));
    const caja = $('#perfil-mapa');
    caja.style.setProperty('--acento', g.acento);
    caja.innerHTML = `
      <div class="perfil-mapa__mapa" aria-hidden="true"><span class="perfil-mapa__pin"></span></div>
      <div class="perfil-mapa__cuerpo">
        <p class="pildora pildora--hueca" style="justify-self:start">Demostración de Timbre</p>
        <p class="perfil-mapa__nombre">${T.esc(g.nombre)}</p>
        <p class="perfil-mapa__cat">${T.esc(g.maps.categoriaPrincipal)} · ${T.esc(u.barrio || '')}</p>
        <p class="perfil-mapa__estado"><b class="${abierto ? '' : 'cerrado'}">${abierto ? 'Abierto' : 'Cerrado'}</b> · Hoy: ${T.esc(fila ? fila.texto : '')}</p>
        <p class="perfil-mapa__dir">${T.esc([u.direccion, u.ciudad].filter(Boolean).join(', '))}</p>
        <div class="perfil-mapa__acciones" aria-hidden="true">
          <span>Cómo llegar</span><span class="destacado">WhatsApp</span><span>Llamar</span>
        </div>
      </div>`;
  }

  /* ---------- Galería de gremios ---------- */
  const telGaleria = new TimbreTelefono($('#telefono-galeria'), { negocio: gremios[0], idioma: 'es' });
  let gremioActual = gremios[0];
  const lista = $('#lista-gremios');
  lista.innerHTML = gremios.map((g, i) => `
    <button type="button" class="gremio" data-gremio="${g.id}" aria-pressed="${i === 0}" style="--c:${g.acento}">
      <span class="gremio__color" aria-hidden="true"></span>
      <span class="gremio__tipo">${T.esc(g.gremioCorto)}</span>
      <span class="gremio__nombre">${T.esc(g.nombre)}</span>
    </button>`).join('');
  function mostrarGremio(g) {
    gremioActual = g;
    lista.querySelectorAll('.gremio').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.gremio === g.id)));
    telGaleria.setNegocio(g);
    pintarMapa(g);
    telGaleria.o.moneda = monedaActual();
    telGaleria.ejecutar(TimbreTelefono.guionLlegada(g, { minutos: 21 * 60 + 47, moneda: monedaActual() }));
  }
  lista.addEventListener('click', (e) => {
    const b = e.target.closest('[data-gremio]');
    if (b) mostrarGremio(gremios.find((g) => g.id === b.dataset.gremio));
  });

  // La galería empieza a reproducirse cuando se ve en pantalla.
  let galeriaVista = false;
  new IntersectionObserver((entradas, obs) => {
    if (entradas.some((e) => e.isIntersecting) && !galeriaVista) { galeriaVista = true; mostrarGremio(gremioActual); obs.disconnect(); }
  }, { threshold: 0.3 }).observe($('#telefono-galeria'));

  /* ---------- Calculadora ---------- */
  const calc = { mensajes: $('#c-mensajes'), sin: $('#c-sin'), valor: $('#c-valor'), cierre: $('#c-cierre') };
  function calcular() {
    const num = (el) => Math.max(0, Number(el.value) || 0);
    const mensajes = num(calc.mensajes);
    let sin = num(calc.sin);
    if (sin > mensajes) { sin = mensajes; calc.sin.value = mensajes; }
    const cierre = Math.min(10, Math.max(1, num(calc.cierre)));
    const personas = Math.round(sin * 30);
    const clientes = Math.round(personas * cierre / 10);
    const valor = clientes * num(calc.valor);
    $('#c-cierre-salida').textContent = `${cierre} de cada 10`;
    $('#r-personas').textContent = new Intl.NumberFormat('es-CO').format(personas);
    $('#r-cierre').textContent = cierre;
    $('#r-clientes').textContent = new Intl.NumberFormat('es-CO').format(clientes);
    $('#r-valor').textContent = T.dinero(valor, monedaActual(), 'es');
  }
  Object.values(calc).forEach((el) => el.addEventListener('input', calcular));
  $('#form-calculadora').addEventListener('submit', (e) => e.preventDefault());

  /* ---------- Planes ---------- */
  function precioPlan(p, m) {
    if (p.precio == null) return '<p class="plan__precio plan__precio--texto">Diagnóstico sin costo</p>';
    const sufijo = p.periodo === 'mes' ? '<small>al mes</small>' : '<small>pago único</small>';
    return `<p class="plan__precio">${T.esc(T.dinero(p.precio, m.moneda, 'es'))}${sufijo}</p>`;
  }
  function pintarPlanes() {
    const m = planes.mercados[mercado];
    $('#planes-mercado').textContent = m.etiqueta;
    $('#planes-modalidad').textContent = m.modalidad;
    $('#planes-pago').textContent = m.pago;
    $('#planes-garantia').textContent = m.garantia;
    $('#lista-planes').innerHTML = m.planes.map((p) => `
      <article class="tarjeta plan ${p.destacado ? 'plan--destacado' : ''}">
        ${p.destacado ? '<span class="pildora plan__cinta">El más completo</span>' : ''}
        <h3>${T.esc(p.nombre)}</h3>
        ${precioPlan(p, m)}
        <p class="plan__entrega">${T.esc(p.entrega)}</p>
        <ul>${p.incluye.map((i) => `<li>${T.esc(i)}</li>`).join('')}</ul>
        ${p.nota ? `<p class="plan__nota">${T.esc(T.plantilla(p.nota, { cambioAdicional: T.dinero(m.cambioAdicional, m.moneda, 'es') }))}</p>` : ''}
        <a class="boton ${p.destacado ? 'boton--primario' : ''} boton--bloque" target="_blank" rel="noopener"
           href="${T.esc(T.enlaceWhatsapp(marca, { texto: `Hola, me interesa el plan ${p.nombre} de Timbre.`, asesora }))}">${T.esc(p.boton || 'Me interesa')}</a>
      </article>`).join('');
  }

  /* ---------- Preguntas frecuentes ---------- */
  function pintarPreguntas() {
    const m = planes.mercados[mercado];
    const plan = (id) => m.planes.find((p) => p.id === id);
    const d = (v) => T.dinero(v, m.moneda, 'es');
    const distancia = mercado === 'co' ? 'en persona o por videollamada' : 'por videollamada';
    const preguntas = [
      ['¿Es caro?', `El plan Esencial cuesta ${d(plan('esencial').precio)} una sola vez, sin mensualidad obligatoria. Incluye el perfil, el catálogo, los mensajes automáticos, su negocio en Google Maps, el código QR y la capacitación. Y paga la mitad al empezar y la otra mitad cuando lo vea funcionando.`],
      ['¿No lo puedo hacer yo mismo?', 'Claro que sí: todo se puede hacer con tiempo y paciencia. Lo que usted paga es que quede bien hecho, rápido y probado, sin quitarle horas a su negocio. Además le enseñamos a manejarlo para que no dependa de nadie.'],
      ['Ya tengo WhatsApp Business, ¿me sirve?', 'Perfecto, partimos de ahí y no pierde sus chats. Completamos el perfil y el catálogo, escribimos la bienvenida, el mensaje fuera de horario y las respuestas rápidas, y organizamos a sus clientes con etiquetas.'],
      ['¿Y si no funciona?', `${m.garantia} Usted paga el 50% para empezar y el resto cuando compruebe que todo responde como acordamos. Si algo no queda bien, lo corregimos antes.`],
      ['¿Me van a pedir claves?', `No le pedimos contraseñas por mensaje. Hacemos la configuración con usted y en su celular, ${distancia}, y usted queda como único dueño de sus cuentas.`],
      ['¿Hay que pagar todos los meses?', `No es obligatorio. Los planes Esencial y Pro se pagan una sola vez. Si quiere que le hagamos cambios cada mes, existe el mantenimiento por ${d(plan('mantenimiento').precio)} al mes, sin permanencia.`],
      ['¿Cómo lo hacen a distancia?', 'Por WhatsApp y videollamada. Usted nos envía fotos, precios y horario; nosotros preparamos todo y lo configuramos juntos en una llamada. Al final le damos la capacitación gratuita.'],
      ['¿Su WhatsApp contesta cualquier pregunta solo?', 'Con los planes Esencial y Pro, su WhatsApp responde solo con la bienvenida y el mensaje fuera de horario, que llevan su catálogo y su horario; usted contesta lo demás en segundos con las respuestas rápidas. Si quiere respuestas automáticas a cualquier pregunta, eso es un asistente virtual con IA, que hacemos como desarrollo a la medida.']
    ];
    $('#lista-preguntas').innerHTML = preguntas.map(([p, r]) => `
      <details class="pregunta"><summary>${T.esc(p)}</summary><p>${T.esc(r)}</p></details>`).join('');
  }

  /* ---------- Testimonios (solo si hay reales) ---------- */
  if (Array.isArray(marca.testimonios) && marca.testimonios.length) {
    $('#lista-testimonios').innerHTML = marca.testimonios.map((t) => `
      <figure class="tarjeta testimonio"><blockquote>${T.esc(t.texto)}</blockquote><figcaption><b>${T.esc(t.nombre)}</b>, ${T.esc(t.negocio)}</figcaption></figure>`).join('');
    $('#testimonios').hidden = false;
  }

  /* ---------- Mercado ---------- */
  const selector = $('#mercado');
  function cambiarMercado(nuevo, actualizarUrl) {
    if (nuevo === 'en') { location.href = 'en/' + (asesora ? `?asesora=${asesora.codigo}` : ''); return; }
    mercado = nuevo;
    selector.value = mercado;
    const valor = calc.valor;
    if (actualizarUrl) valor.value = mercado === 'co' ? 40000 : 25;
    valor.step = mercado === 'co' ? 1000 : 1;
    $('.js-moneda-calc').textContent = `(${monedaActual()})`;
    telPortada.o.moneda = monedaActual();
    telGaleria.o.moneda = monedaActual();
    if (actualizarUrl) {
      const url = new URL(location.href);
      url.searchParams.set('m', mercado);
      history.replaceState(null, '', url);
      if (galeriaVista) mostrarGremio(gremioActual);
      actualizarHora(true);
    }
    pintarPlanes();
    pintarPreguntas();
    pintarWhatsapp();
    calcular();
  }
  selector.addEventListener('change', () => cambiarMercado(selector.value, true));

  cambiarMercado(mercado, false);
  if (mercado === 'usd') calc.valor.value = 25;
  calcular();
  pintarComparacion();
  pintarMapa(negocioPortada);
  actualizarHora(true);
})();
