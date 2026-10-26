/* Timbre — página web del plan Pro.
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
      hecha: 'Página hecha con Timbre', qrResenas: 'Código QR para dejar una reseña en Google', redes: 'Redes'
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
      hecha: 'Website by Timbre', qrResenas: 'QR code to leave a Google review', redes: 'Social'
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

    const catalogo = w.catalogo.map((c, i) => `
        <article class="producto">
          <div class="producto__foto" aria-hidden="true">${imagenes[i] ? `<img src="${esc(imagenes[i])}" alt="" loading="lazy">` : `<span>${esc(iniciales(c.nombre))}</span>`}</div>
          <div class="producto__cuerpo">
            <h3>${esc(c.nombre)}</h3>
            ${c.descripcion ? `<p>${esc(c.descripcion)}</p>` : ''}
            <div class="producto__pie">
              <span class="producto__precio">${esc(c.precioTexto)}</span>
              <a class="enlace-pedir" href="${esc(Kit.enlaceWhatsapp(n, `${t.meInteresa} ${c.nombre}.`))}" target="_blank" rel="noopener">${t.pedir}<span class="oculto"> ${esc(c.nombre)}</span></a>
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
        <a href="#catalogo">${t.catalogo}</a><a href="#horario">${t.horario}</a><a href="#contacto">${t.contacto}</a>
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
            <a class="boton boton--acento" href="${esc(w.enlaceDirecto)}" target="_blank" rel="noopener">${t.escribir}</a>
            <a class="boton boton--borde" href="#catalogo">${t.verCatalogo}</a>
          </div>
          <p class="estado" id="estado" hidden></p>
        </div>
        <div class="portada__arte" aria-hidden="true"><span>${esc(iniciales(n.nombre))}</span></div>
      </div>
    </section>

    <section class="seccion" id="catalogo" aria-labelledby="t-catalogo">
      <div class="envoltura">
        <h2 id="t-catalogo">${t.catalogo}</h2>
        <div class="catalogo">${catalogo}</div>
      </div>
    </section>

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

  <a class="flotante" href="${esc(w.enlaceDirecto)}" target="_blank" rel="noopener" aria-label="${t.escribir}">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
  </a>

  <script>
  (function () {
    var horario = ${JSON.stringify(n.horario)};
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
  })();
  </script>
</body>
</html>
`;
  }

  return { ESTILOS, render };
});
