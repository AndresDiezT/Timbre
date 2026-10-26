/* Timbre — núcleo compartido por todas las páginas.
   Carga la configuración, arma enlaces de WhatsApp con código de asesora,
   formatea precios y horas, y hace sonar la campanita. */
(function () {
  'use strict';

  const script = document.currentScript;
  const RAIZ = (script && script.dataset.raiz) || './';
  const params = new URLSearchParams(location.search);
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  const NOMBRE_DIA = {
    es: { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo' },
    en: { lun: 'Monday', mar: 'Tuesday', mie: 'Wednesday', jue: 'Thursday', vie: 'Friday', sab: 'Saturday', dom: 'Sunday' }
  };

  const T = {
    raiz: RAIZ,
    params,
    reducido: () => reducido.matches,
    DIAS,
    NOMBRE_DIA
  };

  /* ---------- Datos ---------- */
  const cache = {};
  T.json = function (ruta) {
    if (!cache[ruta]) {
      cache[ruta] = fetch(RAIZ + ruta, { cache: 'no-cache' }).then((r) => {
        if (!r.ok) throw new Error('No se pudo cargar ' + ruta);
        return r.json();
      });
    }
    return cache[ruta];
  };

  /** Carga marca, planes y gremios. idioma: 'es', 'en' o 'todos'. */
  T.cargar = async function ({ idioma = 'es' } = {}) {
    const [marca, planes, indice] = await Promise.all([
      T.json('config/marca.json'),
      T.json('config/planes.json'),
      T.json('plantillas/gremios/indice.json')
    ]);
    const ids = idioma === 'todos' ? [...indice.es, ...indice.en] : indice[idioma] || [];
    const gremios = await Promise.all(ids.map((id) => T.json(`plantillas/gremios/${id}.json`)));
    return { marca, planes, gremios };
  };

  /* ---------- Utilidades ---------- */
  T.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  T.plantilla = (texto, vars) => String(texto || '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));

  T.iniciales = (nombre) => {
    const ignorar = /^(de|del|la|las|el|los|y|&|co\.?|the)$/i;
    const partes = String(nombre || '').split(/\s+/).filter((p) => p && !ignorar.test(p));
    return ((partes[0] || '?')[0] + (partes[1] ? partes[1][0] : '')).toUpperCase();
  };

  /** Devuelve tinta o blanco, el que tenga mejor contraste sobre el color dado. */
  T.contraste = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#FFFFFF';
    const n = parseInt(m[1], 16);
    const canal = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const L = 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
    const conBlanco = 1.05 / (L + 0.05);
    const conTinta = (L + 0.05) / 0.0315;
    return conBlanco >= conTinta ? '#FFFFFF' : '#16202A';
  };

  T.colorValido = (c) => (/^#?[0-9a-f]{6}$/i.test(c || '') ? '#' + c.replace('#', '') : null);

  /* ---------- Dinero y horas ---------- */
  T.dinero = function (valor, moneda = 'COP', idioma = 'es') {
    if (valor == null) return '';
    if (valor === 0) return idioma === 'en' ? 'Free' : 'Gratis';
    if (moneda === 'COP') return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(valor);
    const n = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(valor);
    return idioma === 'en' ? '$' + n : 'US$' + n;
  };

  /** Precio de un producto en la moneda pedida (los gremios en español traen precioUSD). */
  T.precioDe = (item, moneda, monedaGremio) => {
    if (moneda === monedaGremio || moneda == null) return item.precio;
    if (moneda === 'USD' && item.precioUSD != null) return item.precioUSD;
    return item.precio;
  };

  T.hora = function (h, m = 0, idioma = 'es') {
    const hh = ((h % 24) + 24) % 24;
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    const mm = String(m).padStart(2, '0');
    if (idioma === 'en') return `${h12}:${mm} ${hh < 12 ? 'AM' : 'PM'}`;
    if (hh === 12 && m === 0) return '12:00 m.';
    return `${h12}:${mm} ${hh < 12 ? 'a. m.' : 'p. m.'}`;
  };

  /** Hora compacta para tablas: "9 a. m.", "9:30 p. m.", "9 AM". */
  T.horaCorta = function (h, m = 0, idioma = 'es') {
    const largo = T.hora(h, m, idioma);
    return m === 0 && !(h === 12 && idioma === 'es') ? largo.replace(':00', '') : largo;
  };

  const aMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const deMin = (min, idioma) => T.horaCorta(Math.floor(min / 60), min % 60, idioma);

  /** ¿Está abierto? dia: 'lun'…'dom'; minutos desde medianoche. */
  T.abierto = (negocio, dia, minutos) => {
    const r = negocio.horario && negocio.horario[dia];
    return !!r && minutos >= aMin(r[0]) && minutos < aMin(r[1]);
  };

  /** Filas del horario agrupando días seguidos con el mismo horario ("Lunes a sábado"). */
  T.horarioFilas = (negocio, idioma = 'es') => {
    const orden = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
    const texto = (d) => {
      const r = negocio.horario[d];
      return r ? `${deMin(aMin(r[0]), idioma)} – ${deMin(aMin(r[1]), idioma)}` : idioma === 'en' ? 'Closed' : 'Cerrado';
    };
    const grupos = [];
    orden.forEach((d) => {
      const t = texto(d);
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.texto === t) ultimo.dias.push(d); else grupos.push({ dias: [d], texto: t });
    });
    const N = NOMBRE_DIA[idioma];
    return grupos.map((g) => {
      const a = N[g.dias[0]];
      const b = N[g.dias[g.dias.length - 1]];
      let nombre = a;
      if (g.dias.length === 2) nombre = idioma === 'en' ? `${a} & ${b}` : `${a} y ${b.toLowerCase()}`;
      if (g.dias.length > 2) nombre = idioma === 'en' ? `${a}–${b}` : `${a} a ${b.toLowerCase()}`;
      return { dias: g.dias, dia: g.dias[0], nombre, texto: g.texto };
    });
  };

  /* ---------- Mercados, asesoras y WhatsApp ---------- */
  T.mercado = function (planes, permitidos) {
    const pedido = (params.get('m') || '').toLowerCase();
    const lista = permitidos || Object.keys(planes.mercados);
    return lista.includes(pedido) ? pedido : planes.mercadoPorDefecto;
  };

  T.asesora = function (marca, codigo) {
    const c = String(codigo || params.get('asesora') || '').trim().toUpperCase();
    if (!c) return null;
    // Los alias permiten que sigan funcionando enlaces viejos después de cambiar un código.
    return marca.asesoras.find((a) => a.codigo === c || (a.alias || []).includes(c)) || null;
  };

  T.mensajeWhatsapp = function (marca, { texto, idioma = 'es', asesora } = {}) {
    let t = texto || marca.mensajesWhatsapp[idioma === 'en' ? 'en' : 'co'];
    if (asesora) t += ' ' + T.plantilla(marca.mensajesWhatsapp[idioma === 'en' ? 'asesoraEn' : 'asesora'], asesora);
    return t;
  };

  T.enlaceWhatsapp = function (marca, opciones = {}) {
    return `https://wa.me/${marca.contacto.whatsappDigitos}?text=${encodeURIComponent(T.mensajeWhatsapp(marca, opciones))}`;
  };

  /** Lleva ?asesora y ?m a los enlaces internos marcados con data-propagar. */
  T.propagar = function () {
    const llevar = ['asesora', 'm'].filter((k) => params.get(k));
    if (!llevar.length) return;
    document.querySelectorAll('a[data-propagar]').forEach((a) => {
      const url = new URL(a.getAttribute('href'), location.href);
      llevar.forEach((k) => { if (!url.searchParams.has(k)) url.searchParams.set(k, params.get(k)); });
      a.href = url.href;
    });
  };

  /* ---------- Campanita ---------- */
  T.SVG_CAMPANA = '<svg viewBox="16 13 32 38" aria-hidden="true" focusable="false"><path fill="currentColor" d="M32 14c-1.7 0-3 1.3-3 3v1.2c-6 1.4-9.5 6.6-9.5 12.8v7.5L16 43v2h32v-2l-3.5-4.5V31c0-6.2-3.5-11.4-9.5-12.8V17c0-1.7-1.3-3-3-3z"/><path fill="currentColor" d="M27 47.5a5 5 0 0 0 10 0z"/></svg>';

  T.htmlCampana = (clase = '') =>
    `<span class="campana ${clase}" aria-hidden="true"><span class="campana__onda"></span><span class="campana__onda"></span><span class="campana__onda"></span>${T.SVG_CAMPANA}</span>`;

  let audio = null;
  let sonidoActivo = false;

  T.sonidoActivo = () => sonidoActivo;

  function ding() {
    if (!sonidoActivo) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const ahora = audio.currentTime;
      [[1318.5, 0.22], [1975.5, 0.12], [2637, 0.05]].forEach(([f, v]) => {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, ahora);
        g.gain.exponentialRampToValueAtTime(v, ahora + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ahora + 1.3);
        o.connect(g).connect(audio.destination);
        o.start(ahora);
        o.stop(ahora + 1.35);
      });
    } catch (e) { /* sin audio disponible */ }
  }

  /** Hace sonar una o varias campanitas (selector, elemento o lista). */
  T.sonar = function (objetivo = '.campana') {
    const els = typeof objetivo === 'string' ? document.querySelectorAll(objetivo) : objetivo.length != null ? objetivo : [objetivo];
    els.forEach((el) => {
      el.classList.remove('sonando');
      void el.offsetWidth;
      el.classList.add('sonando');
    });
    ding();
  };

  /** Conecta los botones .boton-sonido (silenciado por defecto). */
  T.iniciarSonido = function () {
    document.querySelectorAll('.boton-sonido').forEach((b) => {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        sonidoActivo = !sonidoActivo;
        document.querySelectorAll('.boton-sonido').forEach((x) => x.setAttribute('aria-pressed', String(sonidoActivo)));
        if (sonidoActivo) ding();
      });
    });
  };

  /* ---------- Tema claro / oscuro ---------- */
  T.iniciarTema = function () {
    let guardado = null;
    try { guardado = localStorage.getItem('timbre-tema'); } catch (e) { /* sin almacenamiento */ }
    if (guardado === 'light' || guardado === 'dark') document.documentElement.dataset.theme = guardado;
    document.querySelectorAll('[data-tema]').forEach((b) => {
      b.addEventListener('click', () => {
        const oscuroAhora = document.documentElement.dataset.theme
          ? document.documentElement.dataset.theme === 'dark'
          : window.matchMedia('(prefers-color-scheme: dark)').matches;
        const nuevo = oscuroAhora ? 'light' : 'dark';
        document.documentElement.dataset.theme = nuevo;
        try { localStorage.setItem('timbre-tema', nuevo); } catch (e) { /* sin almacenamiento */ }
      });
    });
  };

  /* ---------- QR (usa assets/vendor/qrcode.js si está cargado) ---------- */
  T.qrSVG = function (texto, { margen = 2, etiqueta = 'Código QR' } = {}) {
    if (typeof window.qrcode !== 'function') return '';
    const qr = window.qrcode(0, 'M');
    qr.addData(texto);
    qr.make();
    const n = qr.getModuleCount();
    const tam = n + margen * 2;
    let d = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x + margen} ${y + margen}h1v1h-1z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tam} ${tam}" role="img" aria-label="${T.esc(etiqueta)}" shape-rendering="crispEdges"><rect width="${tam}" height="${tam}" fill="#fff"/><path d="${d}" fill="#16202A"/></svg>`;
  };

  T.copiar = async function (texto, boton) {
    try {
      await navigator.clipboard.writeText(texto);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = texto; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (err) { /* nada */ }
      ta.remove();
    }
    if (boton) {
      const antes = boton.textContent;
      boton.textContent = boton.dataset.copiado || 'Copiado';
      setTimeout(() => { boton.textContent = antes; }, 1600);
    }
  };

  T.esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  window.Timbre = T;
  document.addEventListener('DOMContentLoaded', () => { T.iniciarTema(); T.iniciarSonido(); T.propagar(); });
})();
