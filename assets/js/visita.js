/* Herramienta de visita: arma una demostración con el nombre del negocio del
   dueño, con enlace y QR, y un botón "Lo quiero" hacia el WhatsApp de Timbre.
   No guarda datos: todo vive en la URL y en el navegador. */
(async function () {
  'use strict';
  const T = window.Timbre;
  const $ = (s) => document.querySelector(s);

  let datos;
  try { datos = await T.cargar({ idioma: 'es' }); } catch (e) {
    $('#telefono-visita').innerHTML = '<p class="tarjeta">No se pudo cargar la demostración. Ábrala desde un servidor (por ejemplo GitHub Pages).</p>';
    return;
  }
  const { marca, planes, gremios } = datos;

  const inNombre = $('#v-nombre');
  const selGremio = $('#v-gremio');
  const selAsesora = $('#v-asesora');
  const selMercado = $('#v-mercado');

  selGremio.innerHTML = gremios.map((g) => `<option value="${g.id}">${T.esc(g.gremio)}</option>`).join('');
  selAsesora.innerHTML += marca.asesoras.map((a) => `<option value="${a.codigo}">${T.esc(a.nombre)} (${a.codigo})</option>`).join('');

  const p = T.params;
  inNombre.value = (p.get('nombre') || '').slice(0, 40);
  if (gremios.some((g) => g.id === p.get('gremio'))) selGremio.value = p.get('gremio');
  const asesoraUrl = T.asesora(marca);
  if (asesoraUrl) selAsesora.value = asesoraUrl.codigo;
  selMercado.value = T.mercado(planes, ['co', 'usd']);

  const tel = new TimbreTelefono($('#telefono-visita'), { negocio: gremios[0], idioma: 'es' });

  function estado() {
    const gremio = gremios.find((g) => g.id === selGremio.value) || gremios[0];
    return {
      gremio,
      nombre: inNombre.value.trim().slice(0, 40),
      asesora: T.asesora(marca, selAsesora.value),
      mercado: selMercado.value,
      moneda: planes.mercados[selMercado.value].moneda
    };
  }

  function enlaceDemo(e) {
    const url = new URL('../demo/', location.href);
    url.searchParams.set('gremio', e.gremio.id);
    if (e.nombre) url.searchParams.set('nombre', e.nombre);
    if (e.mercado !== 'co') url.searchParams.set('m', e.mercado);
    if (e.asesora) url.searchParams.set('asesora', e.asesora.codigo);
    url.searchParams.set('modo', 'auto');
    return url.href;
  }

  function reproducir() {
    const e = estado();
    tel.setNegocio(e.gremio, { nombre: e.nombre || null });
    tel.o.moneda = e.moneda;
    tel.ejecutar(TimbreTelefono.guionLlegada(tel.negocio, { minutos: 21 * 60 + 47, moneda: e.moneda }));
  }

  function actualizar() {
    const e = estado();
    const enlace = enlaceDemo(e);
    $('#v-abrir').href = enlace;
    $('#qr').innerHTML = T.qrSVG(enlace, { etiqueta: `Código QR para abrir la demostración de ${e.nombre || e.gremio.nombre}` });
    const negocio = e.nombre || '[nombre del negocio]';
    const texto = `Hola, quiero Timbre para ${negocio} (${e.gremio.gremioCorto.toLowerCase()}).`;
    const mensaje = T.mensajeWhatsapp(marca, { texto, asesora: e.asesora });
    $('#v-loquiero').href = `https://wa.me/${marca.contacto.whatsappDigitos}?text=${encodeURIComponent(mensaje)}`;
    $('#v-mensaje').textContent = `Mensaje: «${mensaje}»`;
    // La URL de esta página conserva lo escrito para poder recargar sin perderlo.
    const url = new URL(location.href);
    ['nombre', 'gremio', 'asesora', 'm'].forEach((k) => url.searchParams.delete(k));
    if (e.nombre) url.searchParams.set('nombre', e.nombre);
    url.searchParams.set('gremio', e.gremio.id);
    if (e.asesora) url.searchParams.set('asesora', e.asesora.codigo);
    if (e.mercado !== 'co') url.searchParams.set('m', e.mercado);
    history.replaceState(null, '', url);
  }

  let t;
  inNombre.addEventListener('input', () => { actualizar(); clearTimeout(t); t = setTimeout(reproducir, 500); });
  [selGremio, selMercado].forEach((s) => s.addEventListener('change', () => { actualizar(); reproducir(); }));
  selAsesora.addEventListener('change', actualizar);
  $('#form-visita').addEventListener('submit', (ev) => { ev.preventDefault(); inNombre.blur(); });
  $('#v-repetir').addEventListener('click', reproducir);
  $('#v-copiar').addEventListener('click', (ev) => T.copiar(enlaceDemo(estado()), ev.currentTarget));
  if (navigator.share) {
    const b = $('#v-compartir');
    b.hidden = false;
    b.addEventListener('click', () => {
      const e = estado();
      navigator.share({ title: 'Demostración de Timbre', text: `Así respondería el WhatsApp de ${e.nombre || 'su negocio'}:`, url: enlaceDemo(e) }).catch(() => {});
    });
  }

  actualizar();
  reproducir();
})();
