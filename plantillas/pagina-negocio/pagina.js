/* Timbre — página del negocio para los planes Pedidos, Reservas y Asistente.
   Un solo renderizador para los tres estilos (sobrio, calido, moderno), a
   partir del JSON del negocio. Devuelve un HTML completo y autónomo.
   Lo usan scripts/generar.js (Node) y constructor/ (vista previa en vivo). */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica(require('../../assets/js/kit.js'));
  else raiz.TimbrePagina = fabrica(raiz.TimbreKit);
})(typeof self !== 'undefined' ? self : this, function (Kit) {
  'use strict';

  const ESTILOS = {
    sobrio: { nombre: 'Sobrio', fuentes: 'https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;700;800&display=swap' },
    calido: { nombre: 'Cálido', fuentes: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Nunito+Sans:wght@400;600;700;800&display=swap' },
    moderno: { nombre: 'Moderno', fuentes: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap' }
  };

  const TX = {
    es: {
      catalogo: 'Catálogo', horario: 'Horario', ubicacion: 'Ubicación', contacto: 'Contacto', preguntas: 'Preguntas frecuentes',
      escribir: 'Escribir por WhatsApp', verCatalogo: 'Ver catálogo', pedir: 'Pedir por WhatsApp', meInteresa: 'Hola, me interesa',
      abiertoHoy: 'Hoy', abierto: 'Abierto ahora', cerrado: 'Cerrado ahora', abrirMapa: 'Abrir en Google Maps',
      formTitulo: 'Escríbanos', formTexto: 'Déjenos su mensaje y le respondemos por WhatsApp.', nombre: 'Su nombre', telefono: 'Su teléfono',
      mensaje: '¿En qué le podemos ayudar?', enviar: 'Enviar por WhatsApp',
      autorizo: (n) => `Autorizo a ${n} a usar mis datos solo para responder esta solicitud, según la Ley 1581 de 2012. Puedo pedir que los borren cuando quiera.`,
      errorAutorizo: 'Para enviar, marque la autorización de datos.', errorNombre: 'Escriba su nombre.',
      soy: 'Hola, soy', miTel: 'Mi teléfono:', pago: 'Medios de pago', resenas: '¿Ya nos visitó?', resenasTexto: 'Su opinión nos ayuda mucho. Escanee el código o toque el botón para dejarnos una reseña en Google.',
      dejarResena: 'Dejar una reseña', politicas: 'Políticas', privacidad: 'Privacidad: los datos que nos envía se usan solo para responderle. Para consultarlos o borrarlos, escríbanos.',
      hecha: 'Página hecha con Timbre', qrResenas: 'Código QR para dejar una reseña en Google', redes: 'Redes',
      agregar: 'Agregar', quitar: 'Quitar uno de', sumar: 'Agregar uno de', cantidadDe: 'Cantidad de',
      hacerPedido: 'Hacer un pedido', suPedido: 'Su pedido', verPedido: 'Ver pedido', productos: (c) => c === 1 ? '1 producto' : c + ' productos',
      pedidoVacio: 'Todavía no ha agregado productos. Use los botones + del catálogo.', subtotal: 'Subtotal', domicilio: 'Domicilio', total: 'Total',
      entrega: '¿Cómo lo quiere?', aDomicilio: 'A domicilio', recoger: 'Recoger en el local', direccion: 'Dirección de entrega', pagoCampo: 'Medio de pago', notas: 'Notas (opcional)',
      enviarPedido: 'Enviar pedido por WhatsApp', errorVacio: 'Agregue al menos un producto.', errorDireccion: 'Escriba la dirección de entrega.',
      domicilioConfirmar: 'El valor del domicilio se lo confirmamos por WhatsApp.',
      msjPedido: (neg) => 'Hola, quiero hacer un pedido en ' + neg + ':', msjEntrega: 'Entrega', msjDireccion: 'Dirección', msjPago: 'Pago', msjNombre: 'A nombre de', msjNotas: 'Notas',
      reservar: 'Reservar cita', reservarTitulo: 'Reserve su cita', reservarTexto: 'Elija el servicio, el día y la hora. Le confirmamos por WhatsApp.', servicio: 'Servicio', dia: 'Día', hora: 'Hora',
      enviarReserva: 'Enviar solicitud por WhatsApp', reservaNota: 'La hora queda reservada cuando se la confirmemos por WhatsApp.', sinHoras: 'No hay horas disponibles ese día.',
      msjReserva: (neg) => 'Hola, quiero reservar en ' + neg + ':', msjConfirmen: '¿Me confirman, por favor?', manana: 'Mañana', hoyDia: 'Hoy',
      meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      diasSemana: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    },
    en: {
      catalogo: 'Services', horario: 'Hours', ubicacion: 'Location', contacto: 'Contact', preguntas: 'FAQ',
      escribir: 'Message us', verCatalogo: 'See services', pedir: 'Ask about this', meInteresa: "Hi! I'm interested in",
      abiertoHoy: 'Today', abierto: 'Open now', cerrado: 'Closed now', abrirMapa: 'Open in Google Maps',
      formTitulo: 'Get in touch', formTexto: "Leave us a message and we'll reply right away.", nombre: 'Your name', telefono: 'Your phone',
      mensaje: 'How can we help?', enviar: 'Send message',
      autorizo: (n) => `I agree that ${n} may use my information only to respond to this request. I can ask them to delete it anytime.`,
      errorAutorizo: 'Please check the consent box to send.', errorNombre: 'Please enter your name.',
      soy: "Hi, I'm", miTel: 'My phone:', pago: 'Payment methods', resenas: 'Been here before?', resenasTexto: 'Your review helps a small business a lot. Scan the code or tap the button.',
      dejarResena: 'Leave a review', politicas: 'Policies', privacidad: 'Privacy: we only use the information you send us to reply to you. Ask us anytime to see or delete it.',
      hecha: 'Website by Timbre', qrResenas: 'QR code to leave a Google review', redes: 'Social',
      agregar: 'Add', quitar: 'Remove one', sumar: 'Add one', cantidadDe: 'Quantity of',
      hacerPedido: 'Place an order', suPedido: 'Your order', verPedido: 'View order', productos: (c) => c === 1 ? '1 item' : c + ' items',
      pedidoVacio: 'No items yet. Use the + buttons in the menu.', subtotal: 'Subtotal', domicilio: 'Delivery', total: 'Total',
      entrega: 'How would you like it?', aDomicilio: 'Delivery', recoger: 'Pick up', direccion: 'Delivery address', pagoCampo: 'Payment method', notas: 'Notes (optional)',
      enviarPedido: 'Send order on WhatsApp', errorVacio: 'Add at least one item.', errorDireccion: 'Please enter the delivery address.',
      domicilioConfirmar: "We'll confirm the delivery fee on WhatsApp.",
      msjPedido: (neg) => 'Hi! I would like to order from ' + neg + ':', msjEntrega: 'Delivery', msjDireccion: 'Address', msjPago: 'Payment', msjNombre: 'Name', msjNotas: 'Notes',
      reservar: 'Book now', reservarTitulo: 'Book an appointment', reservarTexto: "Pick the service, day and time. We'll confirm on WhatsApp.", servicio: 'Service', dia: 'Day', hora: 'Time',
      enviarReserva: 'Send request on WhatsApp', reservaNota: 'Your time is booked once we confirm it on WhatsApp.', sinHoras: 'No times available that day.',
      msjReserva: (neg) => 'Hi! I would like to book with ' + neg + ':', msjConfirmen: 'Can you confirm, please?', manana: 'Tomorrow', hoyDia: 'Today',
      meses: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      diasSemana: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  };

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function contraste(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#FFFFFF';
    const n = parseInt(m[1], 16);
    const c = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const L = 0.2126 * c((n >> 16) & 255) + 0.7152 * c((n >> 8) & 255) + 0.0722 * c(n & 255);
    return 1.05 / (L + 0.05) >= (L + 0.05) / 0.0315 ? '#FFFFFF' : '#16202A';
  }

  const iniciales = (s) => String(s || '?').split(/\s+/).filter((p) => p && !/^(de|del|la|las|el|los|y|&|x|the|and)$/i.test(p) && /[a-záéíóúñ]/i.test(p)).slice(0, 2).map((p) => p.replace(/^[^a-záéíóúñ]+/i, '')[0]).join('').toUpperCase() || '•';

  /** pedidos | reservas | null, según el plan o el gremio. */
  function moduloDe(n) {
    const d = n.negocio || {};
    if (d.modulo === 'pedidos' || d.modulo === 'reservas') return d.modulo;
    if (d.plan === 'pedidos' || d.plan === 'reservas') return d.plan;
    if (d.plan === 'asistente') return n.modulo || null;
    return null;
  }

  /** Solo los textos que usa el script del navegador (las funciones no se pueden serializar). */
  function textosCliente(t) {
    const fuera = {};
    Object.keys(t).forEach((k) => { if (typeof t[k] !== 'function') fuera[k] = t[k]; });
    fuera.msjPedido = t.msjPedido('{negocio}');
    fuera.msjReserva = t.msjReserva('{negocio}');
    fuera.uno = t.productos(1);
    fuera.varios = t.productos(2).replace('2', '{n}');
    return fuera;
  }

  function seccionPedido(n, t, pagos) {
    const d = n.negocio || {};
    return `
    <section class="seccion seccion--suave" id="pedido" aria-labelledby="t-pedido">
      <div class="envoltura dos">
        <div>
          <h2 id="t-pedido">${t.suPedido}</h2>
          <div class="pedido" id="pedido-lista" aria-live="polite"><p class="pedido__vacio">${t.pedidoVacio}</p></div>
          ${typeof d.costoDomicilio === 'number' ? '' : `<p class="pedido__nota">${t.domicilioConfirmar}</p>`}
        </div>
        <form class="formulario" id="form-pedido" novalidate>
          <fieldset class="opciones">
            <legend>${t.entrega}</legend>
            <label class="opcion"><input type="radio" name="entrega" value="domicilio" checked> ${t.aDomicilio}</label>
            <label class="opcion"><input type="radio" name="entrega" value="recoger"> ${t.recoger}</label>
          </fieldset>
          <div id="campo-direccion">
            <label for="p-direccion">${t.direccion}</label>
            <textarea id="p-direccion" name="direccion" rows="2" autocomplete="street-address"></textarea>
          </div>
          <label for="p-pago">${t.pagoCampo}</label>
          <select id="p-pago" name="pago">${pagos.map((p) => `<option>${esc(p)}</option>`).join('')}</select>
          <label for="p-nombre">${t.nombre}</label>
          <input id="p-nombre" name="nombre" autocomplete="name" required>
          <label for="p-notas">${t.notas}</label>
          <textarea id="p-notas" name="notas" rows="2"></textarea>
          <label class="casilla"><input type="checkbox" name="autorizo" required> <span>${esc(t.autorizo(n.nombre))}</span></label>
          <p class="error" id="p-error" role="alert" hidden></p>
          <button class="boton boton--acento" type="submit">${t.enviarPedido}</button>
        </form>
      </div>
    </section>
`;
  }

  function seccionReservas(n, t, w) {
    return `
    <section class="seccion seccion--suave" id="reservar" aria-labelledby="t-reservar">
      <div class="envoltura dos">
        <div>
          <h2 id="t-reservar">${t.reservarTitulo}</h2>
          <p>${t.reservarTexto}</p>
          <p class="pedido__nota">${t.reservaNota}</p>
        </div>
        <form class="formulario" id="form-reserva" novalidate>
          <label for="r-servicio">${t.servicio}</label>
          <select id="r-servicio" name="servicio">${w.catalogo.map((c, i) => `<option value="${i}">${esc(c.nombre)}${c.precio ? ' · ' + esc(c.precioTexto) : ''}</option>`).join('')}</select>
          <div class="fila-dos">
            <div><label for="r-dia">${t.dia}</label><select id="r-dia" name="dia"></select></div>
            <div><label for="r-hora">${t.hora}</label><select id="r-hora" name="hora"></select></div>
          </div>
          <label for="r-nombre">${t.nombre}</label>
          <input id="r-nombre" name="nombre" autocomplete="name" required>
          <label for="r-notas">${t.notas}</label>
          <textarea id="r-notas" name="notas" rows="2"></textarea>
          <label class="casilla"><input type="checkbox" name="autorizo" required> <span>${esc(t.autorizo(n.nombre))}</span></label>
          <p class="error" id="r-error" role="alert" hidden></p>
          <button class="boton boton--acento" type="submit">${t.enviarReserva}</button>
        </form>
      </div>
    </section>
`;
  }

  /* Lógica de pedidos y reservas en el navegador del cliente (ES5 para celulares viejos). */
  const SCRIPT_MODULOS = String.raw`
    var fmt = function (v) {
      var n = String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, MONEDA === 'COP' ? '.' : ',');
      return MONEDA === 'COP' ? '$' + n : (IDIOMA === 'en' ? '$' + n : 'US$' + n);
    };
    var abrirWa = function (texto) { window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(texto), '_blank', 'noopener'); };
    var mostrarError = function (el, msj, foco) { el.textContent = msj; el.hidden = false; if (foco) foco.focus(); };

    if (MODULO === 'pedidos') {
      var cant = {};
      var lista = document.getElementById('pedido-lista');
      var barra = document.getElementById('barra-pedido');
      var formP = document.getElementById('form-pedido');
      var errP = document.getElementById('p-error');
      try { cant = JSON.parse(sessionStorage.getItem('pedido-' + WA) || '{}'); } catch (e) { cant = {}; }
      var items = function () {
        var out = [];
        CATALOGO.forEach(function (c, i) { if (cant[i] > 0) out.push({ nombre: c.nombre, precio: c.precio, cantidad: cant[i] }); });
        return out;
      };
      var domicilio = function () { return formP.entrega.value === 'domicilio'; };
      var pintar = function () {
        var its = items(), sub = 0, unidades = 0;
        CATALOGO.forEach(function (c, i) { var o = document.querySelector('[data-cant="' + i + '"]'); if (o) o.textContent = cant[i] || 0; });
        its.forEach(function (it) { sub += it.precio * it.cantidad; unidades += it.cantidad; });
        var envio = domicilio() && COSTO_DOMICILIO ? COSTO_DOMICILIO : 0;
        if (!its.length) {
          lista.innerHTML = '<p class="pedido__vacio">' + TX.pedidoVacio + '</p>';
        } else {
          var filas = its.map(function (it) {
            return '<tr><td>' + it.cantidad + ' × ' + it.nombre.replace(/</g, '&lt;') + '</td><td>' + fmt(it.precio * it.cantidad) + '</td></tr>';
          }).join('');
          if (envio) filas += '<tr><td>' + TX.domicilio + '</td><td>' + fmt(envio) + '</td></tr>';
          lista.innerHTML = '<table class="pedido__tabla"><tbody>' + filas + '<tr class="pedido__total"><td>' + TX.total + '</td><td>' + fmt(sub + envio) + '</td></tr></tbody></table>';
        }
        barra.hidden = !unidades;
        document.body.classList.toggle('con-barra', !!unidades);
        document.getElementById('barra-texto').textContent = (unidades === 1 ? TX.uno : TX.varios.replace('{n}', unidades)) + ' · ' + fmt(sub + envio);
        try { sessionStorage.setItem('pedido-' + WA, JSON.stringify(cant)); } catch (e) {}
        return { its: its, sub: sub, envio: envio };
      };
      document.addEventListener('click', function (e) {
        var mas = e.target.closest('[data-mas]'), menos = e.target.closest('[data-menos]');
        if (mas) { var i = mas.getAttribute('data-mas'); cant[i] = Math.min(50, (cant[i] || 0) + 1); pintar(); }
        if (menos) { var j = menos.getAttribute('data-menos'); cant[j] = Math.max(0, (cant[j] || 0) - 1); pintar(); }
      });
      formP.addEventListener('input', function () { errP.hidden = true; });
      formP.addEventListener('change', function () {
        document.getElementById('campo-direccion').hidden = !domicilio();
        pintar();
      });
      formP.addEventListener('submit', function (e) {
        e.preventDefault();
        var r = pintar();
        if (!r.its.length) return mostrarError(errP, TX.errorVacio, document.getElementById('catalogo'));
        if (domicilio() && !formP.direccion.value.trim()) return mostrarError(errP, TX.errorDireccion, formP.direccion);
        if (!formP.nombre.value.trim()) return mostrarError(errP, TX.errorNombre, formP.nombre);
        if (!formP.autorizo.checked) return mostrarError(errP, TX.errorAutorizo, formP.autorizo);
        errP.hidden = true;
        var l = [TX.msjPedido.replace('{negocio}', NEGOCIO)];
        r.its.forEach(function (it) { l.push('• ' + it.cantidad + ' × ' + it.nombre + ': ' + fmt(it.precio * it.cantidad)); });
        if (r.envio) { l.push(TX.subtotal + ': ' + fmt(r.sub)); l.push(TX.domicilio + ': ' + fmt(r.envio)); }
        l.push(TX.total + ': ' + fmt(r.sub + r.envio));
        l.push(TX.msjEntrega + ': ' + (domicilio() ? TX.aDomicilio : TX.recoger));
        if (domicilio()) l.push(TX.msjDireccion + ': ' + formP.direccion.value.trim());
        l.push(TX.msjPago + ': ' + formP.pago.value);
        l.push(TX.msjNombre + ': ' + formP.nombre.value.trim());
        if (formP.notas.value.trim()) l.push(TX.msjNotas + ': ' + formP.notas.value.trim());
        abrirWa(l.join('\n'));
      });
      pintar();
    }

    if (MODULO === 'reservas') {
      var formR = document.getElementById('form-reserva');
      var errR = document.getElementById('r-error');
      var selDia = formR.dia, selHora = formR.hora;
      var claves = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
      var horaTexto = function (m) {
        var h = Math.floor(m / 60), mm = m % 60, h12 = h % 12 === 0 ? 12 : h % 12;
        var t = h12 + ':' + (mm < 10 ? '0' : '') + mm;
        if (IDIOMA === 'en') return t + (h < 12 ? ' AM' : ' PM');
        return t + (h < 12 ? ' a. m.' : ' p. m.');
      };
      var dias = [];
      var base = new Date();
      for (var k = 0; k < 21 && dias.length < 14; k++) {
        var f = new Date(base.getFullYear(), base.getMonth(), base.getDate() + k);
        var r = horario[claves[f.getDay()]];
        if (!r) continue;
        var cierre = aMin(r[1]), inicio = aMin(r[0]);
        if (k === 0) inicio = Math.max(inicio, Math.ceil((base.getHours() * 60 + base.getMinutes() + 60) / INTERVALO) * INTERVALO);
        if (inicio + INTERVALO > cierre) continue;
        var nombre = TX.diasSemana[f.getDay()];
        var etiqueta = (k === 0 ? TX.hoyDia + ', ' : k === 1 ? TX.manana + ', ' : '') + nombre + ' ' + f.getDate() + (IDIOMA === 'en' ? ' ' + TX.meses[f.getMonth()] : ' de ' + TX.meses[f.getMonth()]);
        dias.push({ etiqueta: etiqueta, inicio: inicio, cierre: cierre });
      }
      selDia.innerHTML = dias.map(function (d, i) { return '<option value="' + i + '">' + d.etiqueta + '</option>'; }).join('');
      var pintarHoras = function () {
        var d = dias[+selDia.value];
        var horas = [];
        if (d) for (var m = d.inicio; m + INTERVALO <= d.cierre; m += INTERVALO) horas.push(horaTexto(m));
        selHora.innerHTML = horas.length ? horas.map(function (h) { return '<option>' + h + '</option>'; }).join('') : '<option value="">' + TX.sinHoras + '</option>';
      };
      selDia.addEventListener('change', pintarHoras);
      pintarHoras();
      document.addEventListener('click', function (e) {
        var a = e.target.closest('[data-servicio]');
        if (a) formR.servicio.value = a.getAttribute('data-servicio');
      });
      formR.addEventListener('input', function () { errR.hidden = true; });
      formR.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!formR.hora.value) return mostrarError(errR, TX.sinHoras, selDia);
        if (!formR.nombre.value.trim()) return mostrarError(errR, TX.errorNombre, formR.nombre);
        if (!formR.autorizo.checked) return mostrarError(errR, TX.errorAutorizo, formR.autorizo);
        errR.hidden = true;
        var l = [TX.msjReserva.replace('{negocio}', NEGOCIO)];
        l.push(TX.servicio + ': ' + CATALOGO[+formR.servicio.value].nombre);
        l.push(TX.dia + ': ' + dias[+selDia.value].etiqueta);
        l.push(TX.hora + ': ' + formR.hora.value);
        l.push(TX.msjNombre + ': ' + formR.nombre.value.trim());
        if (formR.notas.value.trim()) l.push(TX.msjNotas + ': ' + formR.notas.value.trim());
        l.push(TX.msjConfirmen);
        abrirWa(l.join('\n'));
      });
    }
`;

  /**
   * @param n        JSON del negocio
   * @param opciones { estilo, css (texto del CSS), qrResenas (SVG), imagenes: { indice: url } }
   */
  function render(n, opciones = {}) {
    const estilo = ESTILOS[opciones.estilo] ? opciones.estilo : ((n.negocio && n.negocio.estiloPagina) || 'sobrio');
    const idioma = n.idioma === 'en' ? 'en' : 'es';
    const t = TX[idioma];
    const d = n.negocio || {};
    const w = Kit.whatsapp(n);
    const m = Kit.maps(n);
    const acento = n.acento || '#1F5FBF';
    const resenas = Kit.enlaceResenas(n);
    const descripcion = n.maps.descripcion;
    const redes = Object.entries(d.redes || {}).filter(([, v]) => v);
    const politicas = Object.entries(d.politicas || {}).filter(([, v]) => v);
    const imagenes = opciones.imagenes || {};
    const modulo = moduloDe(n);
    const pagos = (d.mediosPago || []).length ? d.mediosPago : [idioma === 'en' ? 'Card' : 'Efectivo'];

    const catalogo = w.catalogo.map((c, i) => `
        <article class="producto">
          <div class="producto__foto" aria-hidden="true">${imagenes[i] ? `<img src="${esc(imagenes[i])}" alt="" loading="lazy">` : `<span>${esc(iniciales(c.nombre))}</span>`}</div>
          <div class="producto__cuerpo">
            <h3>${esc(c.nombre)}</h3>
            ${c.descripcion ? `<p>${esc(c.descripcion)}</p>` : ''}
            <div class="producto__pie">
              <span class="producto__precio">${esc(c.precioTexto)}</span>
              ${modulo === 'pedidos' && c.precio > 0 ? `<span class="cantidad" role="group" aria-label="${t.cantidadDe} ${esc(c.nombre)}">
                <button type="button" data-menos="${i}" aria-label="${t.quitar} ${esc(c.nombre)}">−</button>
                <output data-cant="${i}" aria-live="polite">0</output>
                <button type="button" data-mas="${i}" aria-label="${t.sumar} ${esc(c.nombre)}">+</button>
              </span>` : modulo === 'reservas'
                ? `<a class="enlace-pedir" href="#reservar" data-servicio="${i}">${t.reservar}<span class="oculto">: ${esc(c.nombre)}</span></a>`
                : `<a class="enlace-pedir" href="${esc(Kit.enlaceWhatsapp(n, `${t.meInteresa} ${c.nombre}.`))}" target="_blank" rel="noopener">${t.pedir}<span class="oculto"> ${esc(c.nombre)}</span></a>`}
            </div>
          </div>
        </article>`).join('');

    const horario = w.perfil.horario.map((h) => `<tr data-dias="${h.dias.join(' ')}"><th scope="row">${esc(h.nombre)}</th><td>${esc(h.texto)}</td></tr>`).join('');
    const faq = n.faq.slice(0, 6).map((f) => `<details><summary>${esc(f.pregunta)}</summary><p>${esc(f.respuesta)}</p></details>`).join('');
    const css = opciones.css ? `<style>\n${opciones.css}\n</style>` : `<link rel="stylesheet" href="estilo.css">`;
    const digitosWa = Kit.digitos(d.whatsapp || d.telefono);

    return `<!doctype html>
<html lang="${idioma}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(n.nombre)}</title>
  <meta name="description" content="${esc(descripcion.slice(0, 155))}">
  <meta property="og:title" content="${esc(n.nombre)}">
  <meta property="og:description" content="${esc(descripcion.slice(0, 155))}">
  <meta name="theme-color" content="${esc(acento)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${ESTILOS[estilo].fuentes}" rel="stylesheet">
  ${css}
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'LocalBusiness', name: n.nombre, description: descripcion,
    telephone: d.telefono || undefined, email: d.correo || undefined, url: d.sitioWeb || undefined,
    address: { '@type': 'PostalAddress', streetAddress: d.direccion || (n.ubicacion || {}).direccion, addressLocality: d.ciudad || (n.ubicacion || {}).ciudad }
  }).replace(/</g, '\\u003c')}</script>
</head>
<body class="estilo-${estilo}" style="--acento:${esc(acento)};--sobre-acento:${contraste(acento)}">
  <a class="saltar" href="#principal">${idioma === 'en' ? 'Skip to content' : 'Saltar al contenido'}</a>
  <header class="cab">
    <div class="envoltura cab__fila">
      <a class="marca" href="#principal"><span class="marca__logo" aria-hidden="true">${esc(iniciales(n.nombre))}</span><span class="marca__nombre">${esc(n.nombre)}</span></a>
      <nav class="cab__nav" aria-label="${idioma === 'en' ? 'Main' : 'Principal'}">
        <a href="#catalogo">${t.catalogo}</a>${modulo === 'pedidos' ? `<a href="#pedido">${t.suPedido}</a>` : modulo === 'reservas' ? `<a href="#reservar">${t.reservar}</a>` : ''}<a href="#horario">${t.horario}</a><a href="#contacto">${t.contacto}</a>
      </nav>
      <a class="boton boton--acento cab__wa" href="${esc(w.enlaceDirecto)}" target="_blank" rel="noopener">WhatsApp</a>
    </div>
  </header>

  <main id="principal">
    <section class="portada">
      <div class="envoltura portada__fila">
        <div>
          <p class="etiqueta">${esc(n.gremio)}${d.barrio || d.ciudad ? ` · ${esc([d.barrio, d.ciudad].filter(Boolean).join(', '))}` : ''}</p>
          <h1>${esc(n.nombre)}</h1>
          <p class="portada__texto">${esc(descripcion)}</p>
          <div class="botones">
            ${modulo === 'pedidos' ? `<a class="boton boton--acento" href="#catalogo">${t.hacerPedido}</a>`
              : modulo === 'reservas' ? `<a class="boton boton--acento" href="#reservar">${t.reservar}</a>`
              : `<a class="boton boton--acento" href="${esc(w.enlaceDirecto)}" target="_blank" rel="noopener">${t.escribir}</a>`}
            ${modulo ? `<a class="boton boton--borde" href="${esc(w.enlaceDirecto)}" target="_blank" rel="noopener">${t.escribir}</a>` : `<a class="boton boton--borde" href="#catalogo">${t.verCatalogo}</a>`}
          </div>
          <p class="estado" id="estado" hidden></p>
        </div>
        <div class="portada__arte" aria-hidden="true"><span>${esc(iniciales(n.nombre))}</span></div>
      </div>
    </section>

    <section class="seccion" id="catalogo" aria-labelledby="t-catalogo">
      <div class="envoltura">
        <h2 id="t-catalogo">${t.catalogo}</h2>
        <div class="catalogo${modulo ? ' catalogo--compacto' : ''}">${catalogo}</div>
      </div>
    </section>
${modulo === 'pedidos' ? seccionPedido(n, t, pagos) : ''}${modulo === 'reservas' ? seccionReservas(n, t, w) : ''}
    <section class="seccion seccion--suave" id="horario" aria-labelledby="t-horario">
      <div class="envoltura dos">
        <div>
          <h2 id="t-horario">${t.horario}</h2>
          <table class="horario"><tbody>${horario}</tbody></table>
        </div>
        <div id="ubicacion">
          <h2>${t.ubicacion}</h2>
          <p class="direccion"><strong>${esc(m.direccion)}</strong>${(n.ubicacion || {}).referencia ? `<br>${esc(n.ubicacion.referencia)}` : ''}</p>
          <a class="boton boton--borde" href="${esc(m.enlaceMaps)}" target="_blank" rel="noopener">${t.abrirMapa}</a>
          ${(d.mediosPago || []).length ? `<h3>${t.pago}</h3><ul class="pastillas">${d.mediosPago.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
        </div>
      </div>
    </section>

    <section class="seccion" aria-labelledby="t-preguntas">
      <div class="envoltura estrecha">
        <h2 id="t-preguntas">${t.preguntas}</h2>
        <div class="preguntas">${faq}</div>
      </div>
    </section>

    <section class="seccion seccion--suave" id="contacto" aria-labelledby="t-contacto">
      <div class="envoltura dos">
        <div>
          <h2 id="t-contacto">${t.formTitulo}</h2>
          <p>${t.formTexto}</p>
          <form class="formulario" id="formulario" novalidate>
            <label for="f-nombre">${t.nombre}</label>
            <input id="f-nombre" name="nombre" autocomplete="name" required>
            <label for="f-telefono">${t.telefono}</label>
            <input id="f-telefono" name="telefono" type="tel" autocomplete="tel">
            <label for="f-mensaje">${t.mensaje}</label>
            <textarea id="f-mensaje" name="mensaje" rows="3"></textarea>
            <label class="casilla"><input type="checkbox" id="f-autorizo" name="autorizo" required> <span>${esc(t.autorizo(n.nombre))}</span></label>
            <p class="error" id="f-error" role="alert" hidden></p>
            <button class="boton boton--acento" type="submit">${t.enviar}</button>
          </form>
        </div>
        ${resenas ? `<div class="resenas">
          <h2>${t.resenas}</h2>
          <p>${t.resenasTexto}</p>
          ${opciones.qrResenas ? `<div class="resenas__qr" role="img" aria-label="${t.qrResenas}">${opciones.qrResenas}</div>` : ''}
          <a class="boton boton--borde" href="${esc(resenas)}" target="_blank" rel="noopener">${t.dejarResena}</a>
        </div>` : ''}
      </div>
    </section>
  </main>

  <footer class="pie">
    <div class="envoltura pie__fila">
      <div>
        <p class="pie__nombre">${esc(n.nombre)}</p>
        <p>${esc(m.direccion)}</p>
        ${d.telefono ? `<p>${esc(d.telefono)}</p>` : ''}
        ${redes.length ? `<p>${redes.map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(' · ')}</p>` : ''}
      </div>
      ${politicas.length ? `<div><p class="pie__titulo">${t.politicas}</p><ul>${politicas.map(([, v]) => `<li>${esc(v)}</li>`).join('')}</ul></div>` : ''}
      <div><p class="pie__privacidad">${t.privacidad}</p><p class="pie__hecha">${t.hecha}</p></div>
    </div>
  </footer>

  ${modulo === 'pedidos' ? `<div class="barra-pedido" id="barra-pedido" hidden><span id="barra-texto"></span><a class="boton boton--acento" href="#pedido">${t.verPedido}</a></div>` : ''}
  <a class="flotante" href="${esc(w.enlaceDirecto)}" target="_blank" rel="noopener" aria-label="${t.escribir}">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
  </a>

  <script>
  (function () {
    var horario = ${JSON.stringify(n.horario)};
    var MODULO = ${JSON.stringify(modulo)};
    var NEGOCIO = ${JSON.stringify(n.nombre)};
    var WA = ${JSON.stringify(digitosWa)};
    var MONEDA = ${JSON.stringify(n.moneda)};
    var IDIOMA = ${JSON.stringify(idioma)};
    var TX = ${JSON.stringify(textosCliente(t))};
    var CATALOGO = ${JSON.stringify(n.catalogo.map((c) => ({ nombre: c.nombre, precio: c.precio })))};
    var COSTO_DOMICILIO = ${JSON.stringify(typeof d.costoDomicilio === 'number' ? d.costoDomicilio : null)};
    var INTERVALO = ${JSON.stringify(d.intervaloReservas || 30)};
    var dias = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    var ahora = new Date(), hoy = dias[ahora.getDay()], r = horario[hoy];
    var min = ahora.getHours() * 60 + ahora.getMinutes();
    var aMin = function (t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; };
    var fila = document.querySelector('tr[data-dias~="' + hoy + '"]');
    if (fila) fila.className = 'hoy';
    var estado = document.getElementById('estado');
    var abierto = r && min >= aMin(r[0]) && min < aMin(r[1]);
    estado.textContent = (abierto ? ${JSON.stringify(t.abierto)} : ${JSON.stringify(t.cerrado)}) + (fila ? ' · ${t.abiertoHoy}: ' + fila.cells[1].textContent : '');
    estado.className = 'estado ' + (abierto ? 'estado--abierto' : 'estado--cerrado');
    estado.hidden = false;

    var form = document.getElementById('formulario');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var error = document.getElementById('f-error');
      var nombre = form.nombre.value.trim();
      if (!nombre) { error.textContent = ${JSON.stringify(t.errorNombre)}; error.hidden = false; form.nombre.focus(); return; }
      if (!form.autorizo.checked) { error.textContent = ${JSON.stringify(t.errorAutorizo)}; error.hidden = false; form.autorizo.focus(); return; }
      error.hidden = true;
      var texto = ${JSON.stringify(t.soy)} + ' ' + nombre + '. ' + form.mensaje.value.trim() + (form.telefono.value.trim() ? ' ' + ${JSON.stringify(t.miTel)} + ' ' + form.telefono.value.trim() : '');
      window.open('https://wa.me/${digitosWa}?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    });

    ${SCRIPT_MODULOS}
  })();
  </script>
</body>
</html>
`;
  }

  /**
   * Página privada del dueño para enviar recordatorios de citas con un toque.
   * Las citas se guardan solo en el navegador del celular del dueño.
   */
  function renderRecordatorios(n, opciones = {}) {
    const estilo = ESTILOS[opciones.estilo] ? opciones.estilo : ((n.negocio && n.negocio.estiloPagina) || 'sobrio');
    const d = n.negocio || {};
    const acento = n.acento || '#1F5FBF';
    const css = opciones.css ? `<style>\n${opciones.css}\n</style>` : `<link rel="stylesheet" href="estilo.css">`;
    const indicativo = String(d.indicativoPais || (Kit.digitos(d.whatsapp).startsWith('1') ? '1' : '57'));
    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Recordatorios · ${esc(n.nombre)}</title>
  <meta name="theme-color" content="${esc(acento)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${ESTILOS[estilo].fuentes}" rel="stylesheet">
  ${css}
  <style>
    .rec { padding: 24px 0 80px; }
    .rec h1 { font-size: clamp(2rem, 8vw, 3rem); }
    .rec__grupo { margin-top: 28px; }
    .rec__lista { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
    .rec__cita { display: grid; gap: 8px; padding: 14px; background: var(--tarjeta); border: var(--borde-tarjeta); border-radius: var(--radio); }
    .rec__cita p { margin: 0; }
    .rec__cita .botones { margin: 4px 0 0; }
    .rec__enviada { color: #1E7A46; font-weight: 700; }
    .rec__vacio { color: var(--suave); }
    .rec__aviso { font-size: .9rem; color: var(--suave); }
    .rec .boton { min-height: 44px; }
  </style>
</head>
<body class="estilo-${estilo}" style="--acento:${esc(acento)};--sobre-acento:${contraste(acento)}">
  <main class="envoltura rec">
    <p class="etiqueta">${esc(n.nombre)}</p>
    <h1>Recordatorios de citas</h1>
    <p>Anote cada cita cuando la confirme. El día anterior, toque «Enviar recordatorio» y se abre su WhatsApp con el mensaje ya escrito.</p>
    <p class="rec__aviso">Las citas se guardan solo en este celular: no se envían a ningún lado. Si borra los datos del navegador, se borran.</p>

    <form class="formulario" id="form-cita" novalidate>
      <label for="c-nombre">Nombre del cliente</label>
      <input id="c-nombre" name="nombre" required autocomplete="off">
      <label for="c-telefono">Celular del cliente</label>
      <input id="c-telefono" name="telefono" type="tel" inputmode="tel" required autocomplete="off" placeholder="300 000 0000">
      <label for="c-servicio">Servicio</label>
      <select id="c-servicio" name="servicio">${n.catalogo.map((c) => `<option>${esc(c.nombre)}</option>`).join('')}</select>
      <div class="fila-dos">
        <div><label for="c-fecha">Día</label><input id="c-fecha" name="fecha" type="date" required></div>
        <div><label for="c-hora">Hora</label><input id="c-hora" name="hora" type="time" required step="900"></div>
      </div>
      <p class="error" id="c-error" role="alert" hidden></p>
      <button class="boton boton--acento" type="submit">Guardar cita</button>
    </form>

    <section class="rec__grupo" aria-labelledby="t-manana"><h2 id="t-manana">Mañana</h2><ul class="rec__lista" id="lista-manana"></ul></section>
    <section class="rec__grupo" aria-labelledby="t-hoy"><h2 id="t-hoy">Hoy</h2><ul class="rec__lista" id="lista-hoy"></ul></section>
    <section class="rec__grupo" aria-labelledby="t-proximas"><h2 id="t-proximas">Próximas</h2><ul class="rec__lista" id="lista-proximas"></ul></section>
    <p class="pie__hecha">Herramienta de Timbre para ${esc(n.nombre)}</p>
  </main>
  <script>
  (function () {
    var CLAVE = 'timbre-citas-' + ${JSON.stringify(Kit.slug(n.nombre))};
    var NEGOCIO = ${JSON.stringify(n.nombre)};
    var INDICATIVO = ${JSON.stringify(indicativo)};
    var dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var citas = [];
    try { citas = JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch (e) { citas = []; }
    var guardar = function () { try { localStorage.setItem(CLAVE, JSON.stringify(citas)); } catch (e) {} };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var claveDia = function (f) { return f.getFullYear() + '-' + ('0' + (f.getMonth() + 1)).slice(-2) + '-' + ('0' + f.getDate()).slice(-2); };
    var hoy = new Date(), manana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
    var kHoy = claveDia(hoy), kManana = claveDia(manana);
    var horaTexto = function (t) { var p = t.split(':'), h = +p[0], h12 = h % 12 === 0 ? 12 : h % 12; return h12 + ':' + p[1] + (h < 12 ? ' a. m.' : ' p. m.'); };
    var fechaTexto = function (k) { var p = k.split('-'), f = new Date(+p[0], +p[1] - 1, +p[2]); return dias[f.getDay()] + ' ' + f.getDate() + ' de ' + meses[f.getMonth()]; };
    var telefono = function (t) { var d = String(t).replace(/\D/g, ''); return d.length === 10 ? INDICATIVO + d : d; };
    var mensaje = function (c) {
      var cuando = c.fecha === kManana ? 'mañana, ' + fechaTexto(c.fecha) + ',' : c.fecha === kHoy ? 'hoy' : 'el ' + fechaTexto(c.fecha);
      return 'Hola, ' + c.nombre.split(' ')[0] + '. Le recordamos su cita de ' + c.servicio.toLowerCase() + ' ' + cuando + ' a las ' + horaTexto(c.hora) + ' en ' + NEGOCIO + '. Si necesita cambiarla, responda este mensaje.';
    };
    var tarjeta = function (c, i) {
      var enviada = c.enviado && c.enviado[c.fecha === kHoy ? 'hoy' : 'antes'];
      return '<li class="rec__cita"><p><b>' + esc(horaTexto(c.hora)) + ' · ' + esc(c.nombre) + '</b><br>' + esc(c.servicio) + ' · ' + esc(fechaTexto(c.fecha)) + '</p>' +
        (enviada ? '<p class="rec__enviada">Recordatorio enviado</p>' : '') +
        '<div class="botones">' + (c.fecha === kManana || c.fecha === kHoy ? '<a class="boton boton--acento" data-enviar="' + i + '" target="_blank" rel="noopener" href="https://wa.me/' + telefono(c.telefono) + '?text=' + encodeURIComponent(mensaje(c)) + '">Enviar recordatorio</a>' : '') +
        '<button type="button" class="boton boton--borde" data-borrar="' + i + '">Borrar</button></div></li>';
    };
    var pintar = function () {
      citas = citas.filter(function (c) { return c.fecha >= kHoy; });
      citas.sort(function (a, b) { return (a.fecha + a.hora) < (b.fecha + b.hora) ? -1 : 1; });
      guardar();
      [['lista-manana', function (c) { return c.fecha === kManana; }], ['lista-hoy', function (c) { return c.fecha === kHoy; }], ['lista-proximas', function (c) { return c.fecha > kManana; }]].forEach(function (g) {
        var html = '';
        citas.forEach(function (c, i) { if (g[1](c)) html += tarjeta(c, i); });
        document.getElementById(g[0]).innerHTML = html || '<li class="rec__vacio">Sin citas.</li>';
      });
    };
    var form = document.getElementById('form-cita');
    form.fecha.value = kManana;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = document.getElementById('c-error');
      if (!form.nombre.value.trim() || telefono(form.telefono.value).length < 10 || !form.fecha.value || !form.hora.value) {
        err.textContent = 'Complete nombre, celular, día y hora.'; err.hidden = false; return;
      }
      err.hidden = true;
      citas.push({ nombre: form.nombre.value.trim(), telefono: form.telefono.value.trim(), servicio: form.servicio.value, fecha: form.fecha.value, hora: form.hora.value, enviado: {} });
      form.nombre.value = ''; form.telefono.value = ''; form.hora.value = '';
      pintar();
      form.nombre.focus();
    });
    document.addEventListener('click', function (e) {
      var env = e.target.closest('[data-enviar]'), bor = e.target.closest('[data-borrar]');
      if (env) { var c = citas[+env.getAttribute('data-enviar')]; c.enviado = c.enviado || {}; c.enviado[c.fecha === kHoy ? 'hoy' : 'antes'] = true; guardar(); setTimeout(pintar, 300); }
      if (bor && window.confirm('¿Borrar esta cita?')) { citas.splice(+bor.getAttribute('data-borrar'), 1); pintar(); }
    });
    pintar();
  })();
  </script>
</body>
</html>
`;
  }

  return { ESTILOS, render, renderRecordatorios, moduloDe };
});
