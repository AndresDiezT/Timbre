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
  // Solo Colombia en español; ?m=en lleva a la versión en inglés.
  const mercado = 'co';

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
      msj('msj--negocio', T.plantilla(neg.mensajes.bienvenida, { negocio: neg.nombre, horario: String(neg.horarioTexto).replace(/\.\s*$/, '') }), '9:47 p. m.', '<span class="msj__auto">Automático</span>') +
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
    const d = (v) => T.esc(T.dinero(v, m.moneda, 'es'));
    if (p.precio == null) return '<p class="plan__precio plan__precio--texto">Diagnóstico sin costo</p>';
    return `<p class="plan__precio">${d(p.precio)}<small>instalación${p.mensual ? ` + ${d(p.mensual)} al mes` : ', pago único'}</small></p>`;
  }
  function enlacePlan(p) {
    return T.esc(T.enlaceWhatsapp(marca, { texto: `Hola, me interesa el plan ${p.nombre} de Timbre.`, asesora }));
  }
  function pintarPlanes() {
    const m = planes.mercados[mercado];
    $('#planes-mercado').textContent = m.etiqueta;
    $('#planes-modalidad').textContent = m.modalidad;
    $('#planes-pago').textContent = m.pago;
    $('#planes-garantia').textContent = m.garantia;
    const principales = m.planes.filter((p) => p.tipo !== 'entrada');
    $('#lista-planes').innerHTML = principales.map((p) => `
      <article class="tarjeta plan ${p.destacado ? 'plan--destacado' : ''}">
        ${p.destacado ? '<span class="pildora plan__cinta">El más pedido</span>' : ''}
        <h3>${T.esc(p.nombre)}</h3>
        <p class="plan__para">${T.esc(p.paraQuien || '')}</p>
        ${precioPlan(p, m)}
        <p class="plan__entrega">${T.esc(p.entrega)}</p>
        <ul>${p.incluye.map((i) => `<li>${T.esc(i)}</li>`).join('')}</ul>
        ${p.mensualIncluye ? `<p class="plan__nota"><b>La mensualidad incluye:</b> ${T.esc(p.mensualIncluye)}</p>` : ''}
        ${p.nota ? `<p class="plan__nota">${T.esc(p.nota)}</p>` : ''}
        <a class="boton ${p.destacado ? 'boton--primario' : ''} boton--bloque" target="_blank" rel="noopener" href="${enlacePlan(p)}">${T.esc(p.boton || 'Me interesa')}</a>
      </article>`).join('');
    // El plan de entrada se muestra aparte, discreto.
    const entrada = m.planes.find((p) => p.tipo === 'entrada');
    const caja = $('#plan-entrada');
    caja.hidden = !entrada;
    if (entrada) {
      caja.innerHTML = `
        <div>
          <p class="plan-entrada__titulo">${T.esc(entrada.paraQuien)}: <b>${T.esc(entrada.nombre)}</b> · ${T.esc(T.dinero(entrada.precio, m.moneda, 'es'))}, pago único</p>
          <p class="plan-entrada__texto">${T.esc(entrada.resumen)} ${T.esc(entrada.entrega)}.</p>
        </div>
        <a class="boton boton--chico" target="_blank" rel="noopener" href="${enlacePlan(entrada)}">${T.esc(entrada.boton)}</a>`;
    }
  }

  /* ---------- Preguntas frecuentes ---------- */
  function pintarPreguntas() {
    const m = planes.mercados[mercado];
    const plan = (id) => m.planes.find((p) => p.id === id) || {};
    const d = (v) => T.dinero(v, m.moneda, 'es');
    const pe = plan('pedidos');
    const preguntas = [
      ['¿Cuánto cuesta?', `Pedidos o Reservas: ${d(pe.precio)} de instalación y ${d(pe.mensual)} al mes, sin permanencia. Incluye la página de su negocio, su WhatsApp Business, su negocio en Google Maps, los códigos QR y la capacitación. La instalación se paga la mitad al empezar y la otra mitad cuando lo vea funcionando.`],
      ['¿Cobran comisión por cada pedido?', 'No. El pedido le llega directo a su WhatsApp y el cliente le paga a usted, como siempre. No hay intermediarios ni porcentajes por venta.'],
      ['¿Mis clientes tienen que instalar algo?', 'No. Abren el enlace o escanean el QR, arman el pedido o eligen su cita, y el mensaje sale de su propio WhatsApp ya escrito.'],
      ['¿Qué incluye la mensualidad?', `Mantenemos al día sus precios, productos y horarios (hasta 5 cambios al mes), la página publicada, una publicación al mes en Google Maps y soporte. Si un mes no la paga, todo sigue funcionando a su nombre, pero sin actualizaciones.`],
      ['¿Y si no funciona?', `${m.garantia} Usted paga el 50% de la instalación para empezar y el resto cuando le llegue el primer pedido o reserva de prueba. Si algo no queda bien, lo corregimos antes.`],
      ['¿Me van a pedir claves?', 'No le pedimos contraseñas por mensaje. Hacemos la configuración con usted, en persona o por videollamada, y usted queda como único dueño de sus cuentas.'],
      ['Solo quiero lo básico, ¿se puede?', `Sí: el Arranque deja listo su WhatsApp Business, su negocio en Google Maps y un código QR por ${d(plan('arranque').precio)}, pago único. Después puede pasar a Pedidos o Reservas cuando quiera.`],
      ['¿Su WhatsApp contesta cualquier pregunta solo?', 'Con Pedidos y Reservas, su WhatsApp responde solo con la bienvenida y el mensaje fuera de horario, y los pedidos y reservas le llegan completos. Si quiere que además conteste cualquier pregunta, eso es el plan Asistente, con un asistente virtual con IA que solo usa la información de su negocio.']
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

  /* ---------- Pruébelo: pedido o reserva que llega al WhatsApp ---------- */
  const telProbar = new TimbreTelefono($('#telefono-probar'), { negocio: gremios[0], idioma: 'es', anunciar: true });
  const demosProbar = { pedidos: gremios.find((g) => g.id === 'restaurante'), reservas: gremios.find((g) => g.id === 'barberia') };
  function mostrarProbar(modo) {
    const neg = demosProbar[modo];
    document.querySelectorAll('[data-probar]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.probar === modo)));
    telProbar.setNegocio(neg);
    telProbar.detener();
    telProbar.limpiar();
    const ahora = new Date();
    telProbar.setReloj(ahora.getHours() * 60 + ahora.getMinutes(), T.DIAS[ahora.getDay()]);
    telProbar.aviso(modo === 'pedidos' ? 'Arme el pedido y toque «Enviar»' : 'Elija servicio, día y hora y toque «Enviar»');
    const caja = $('#tienda-demo');
    const nueva = document.createElement('div');
    caja.replaceWith(nueva);
    nueva.id = 'tienda-demo';
    new TimbreTienda(nueva, {
      negocio: neg,
      modo,
      alEnviar: async (datos) => {
        const ancho = window.matchMedia('(max-width: 899px)').matches;
        if (ancho) $('#telefono-probar').scrollIntoView({ behavior: T.reducido() ? 'auto' : 'smooth', block: 'center' });
        const min = (() => { const a = new Date(); return a.getHours() * 60 + a.getMinutes(); })();
        const abierto = T.abierto(neg, T.DIAS[new Date().getDay()], min);
        await telProbar.ejecutar([
          { tipo: modo === 'pedidos' ? 'pedido' : 'reserva', datos, espera: 300 },
          { tipo: 'escribiendo', ms: 700 },
          { tipo: 'negocio', texto: abierto ? neg.mensajes.bienvenida : neg.mensajes.fueraDeHorario, auto: true, espera: 0 },
          { tipo: 'aviso', texto: modo === 'pedidos' ? 'Pedido completo, con el total. Sin comisiones.' : 'Reserva lista para confirmar con un toque.', espera: 400 }
        ], { limpiar: false });
      }
    });
  }
  document.querySelectorAll('[data-probar]').forEach((b) => b.addEventListener('click', () => mostrarProbar(b.dataset.probar)));
  mostrarProbar('pedidos');

  /* ---------- Mercado ---------- */
  const selector = $('#mercado');
  selector.value = 'co';
  selector.addEventListener('change', () => {
    if (selector.value === 'en') location.href = 'en/' + (asesora ? `?asesora=${asesora.codigo}` : '');
  });
  pintarPlanes();
  pintarPreguntas();
  pintarWhatsapp();
  $('.js-moneda-calc').textContent = '(COP)';

  calcular();
  pintarComparacion();
  pintarMapa(negocioPortada);
  actualizarHora(true);
})();
