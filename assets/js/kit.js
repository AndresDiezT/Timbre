/* Timbre — kit de entrega compartido.
   Arma, a partir del JSON de un negocio, todos los textos que se copian en
   WhatsApp Business y en Google Maps, los enlaces de los QR y la lista de
   verificación. Lo usan scripts/generar.js (Node) y constructor/ (navegador). */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.TimbreKit = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
  const NOMBRE_DIA = {
    es: { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo' },
    en: { lun: 'Monday', mar: 'Tuesday', mie: 'Wednesday', jue: 'Thursday', vie: 'Friday', sab: 'Saturday', dom: 'Sunday' }
  };

  /** Límites de WhatsApp Business y Google, para avisar antes de pegar. */
  const LIMITES = {
    descripcionWhatsapp: 512,
    infoWhatsapp: 139,
    atajo: 25,
    respuestaRapida: 1024,
    mensajeAutomatico: 1024,
    etiquetas: 20,
    descripcionMaps: 750,
    publicacionMaps: 1500
  };

  const plantilla = (t, v) => String(t || '').replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));

  const slug = (s) => String(s || 'negocio').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'negocio';

  function hora(h, m, idioma) {
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const mm = m ? ':' + String(m).padStart(2, '0') : '';
    if (idioma === 'en') return `${h12}${mm} ${h < 12 ? 'AM' : 'PM'}`;
    if (h === 12 && !m) return '12 m.';
    return `${h12}${mm} ${h < 12 ? 'a. m.' : 'p. m.'}`;
  }
  const horaDe = (t, idioma) => { const [h, m] = t.split(':').map(Number); return hora(h, m, idioma); };

  function dinero(valor, moneda, idioma) {
    if (valor == null) return '';
    if (valor === 0) return idioma === 'en' ? 'Free' : 'Gratis';
    const n = Math.round(valor);
    if (moneda === 'COP') return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const usd = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return idioma === 'en' ? '$' + usd : 'US$' + usd;
  }

  /** Horario agrupado por días con el mismo rango. */
  function horarioFilas(n) {
    const idioma = n.idioma || 'es';
    const grupos = [];
    DIAS.forEach((d) => {
      const r = n.horario && n.horario[d];
      const t = r ? `${horaDe(r[0], idioma)} a ${horaDe(r[1], idioma)}`.replace(' a ', idioma === 'en' ? ' – ' : ' a ') : (idioma === 'en' ? 'Closed' : 'Cerrado');
      const u = grupos[grupos.length - 1];
      if (u && u.texto === t) u.dias.push(d); else grupos.push({ dias: [d], texto: t });
    });
    const N = NOMBRE_DIA[idioma];
    return grupos.map((g) => {
      const a = N[g.dias[0]];
      const b = N[g.dias[g.dias.length - 1]];
      let nombre = a;
      if (g.dias.length === 2) nombre = idioma === 'en' ? `${a} & ${b}` : `${a} y ${b.toLowerCase()}`;
      if (g.dias.length > 2) nombre = idioma === 'en' ? `${a}–${b}` : `${a} a ${b.toLowerCase()}`;
      return { dias: g.dias, nombre, texto: g.texto };
    });
  }

  const datos = (n) => n.negocio || {};
  const vars = (n) => ({ negocio: n.nombre, horario: n.horarioTexto });

  function direccionCompleta(n) {
    const d = datos(n);
    const u = n.ubicacion || {};
    return [d.direccion || u.direccion, d.barrio || u.barrio, d.ciudad || u.ciudad].filter(Boolean).join(', ');
  }

  function enlaceMaps(n) {
    const d = datos(n);
    if (d.enlaceMaps && !/\[/.test(d.enlaceMaps)) return d.enlaceMaps;
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${n.nombre}, ${direccionCompleta(n)}`);
  }

  function digitos(tel) { return String(tel || '').replace(/\D/g, ''); }

  function enlaceWhatsapp(n, texto) {
    const d = datos(n);
    const num = digitos(d.whatsapp || d.telefono);
    return `https://wa.me/${num}${texto ? '?text=' + encodeURIComponent(texto) : ''}`;
  }

  function mensajeQR(n) {
    const d = datos(n);
    return d.mensajeQR || (n.idioma === 'en' ? 'Hi! I scanned your QR code and I would like some information.' : 'Hola, vi su código QR y quiero información.');
  }

  function enlaceResenas(n) {
    const e = datos(n).enlaceResenas;
    return e && /^https?:\/\//.test(e) && !/\[/.test(e) ? e : null;
  }

  function recortar(texto, max) {
    if (!texto || texto.length <= max) return texto || '';
    const corte = texto.slice(0, max);
    const punto = corte.lastIndexOf('. ');
    return punto > max * 0.5 ? corte.slice(0, punto + 1) : corte.slice(0, max - 1).trim() + '…';
  }

  /* ---------- WhatsApp Business ---------- */
  function whatsapp(n) {
    const d = datos(n);
    const idioma = n.idioma || 'es';
    const v = vars(n);
    const moneda = n.moneda;
    return {
      perfil: {
        nombre: n.nombre,
        categoria: d.categoriaWhatsapp || n.gremio,
        descripcion: recortar(d.descripcionWhatsapp || (n.maps && n.maps.descripcion), LIMITES.descripcionWhatsapp),
        info: recortar(d.info || (idioma === 'en' ? 'We reply right away. Message us anytime.' : 'Respondemos al instante. Escríbanos a cualquier hora.'), LIMITES.infoWhatsapp),
        direccion: direccionCompleta(n),
        horario: horarioFilas(n),
        correo: d.correo || '',
        sitioWeb: d.sitioWeb || '',
        redes: d.redes || {}
      },
      bienvenida: plantilla(n.mensajes.bienvenida, v),
      fueraDeHorario: plantilla(n.mensajes.fueraDeHorario, v),
      respuestasRapidas: n.mensajes.respuestasRapidas.map((r) => ({ atajo: r.atajo, texto: plantilla(r.texto, v) })),
      etiquetas: n.etiquetas.slice(),
      catalogo: n.catalogo.map((p, i) => ({
        numero: i + 1,
        nombre: p.nombre,
        precio: p.precio,
        precioTexto: dinero(p.precio, moneda, idioma),
        descripcion: p.descripcion || '',
        codigo: `${slug(n.nombre).slice(0, 6).toUpperCase()}-${String(i + 1).padStart(2, '0')}`
      })),
      enlaceDirecto: enlaceWhatsapp(n),
      enlaceQR: enlaceWhatsapp(n, mensajeQR(n))
    };
  }

  /* ---------- Google Maps ---------- */
  function maps(n) {
    const d = datos(n);
    const idioma = n.idioma || 'es';
    const w = whatsapp(n);
    const destacado = n.catalogo[0];
    const pago = (d.mediosPago || []).join(', ');
    const faq = n.faq[0];
    const publicaciones = idioma === 'en' ? [
      { titulo: 'Message us anytime', texto: `${n.nombre} now replies right away, day or night. Send us a message and you'll get our hours and prices instantly. Hours: ${n.horarioTexto}`, boton: 'Contact us' },
      { titulo: destacado.nombre, texto: `${destacado.nombre}: ${destacado.descripcion} ${dinero(destacado.precio, n.moneda, idioma)}. Message us to book.`, boton: 'Book' },
      { titulo: faq.pregunta, texto: `${faq.respuesta}${pago ? ` We accept ${pago}.` : ''}`, boton: 'Learn more' }
    ] : [
      { titulo: 'Escríbanos a cualquier hora', texto: `En ${n.nombre} ahora le respondemos al instante, de día y de noche. Escríbanos por WhatsApp y reciba nuestro catálogo con precios y el horario. Atendemos ${n.horarioTexto}`, boton: 'Enviar mensaje' },
      { titulo: destacado.nombre, texto: `${destacado.nombre}: ${destacado.descripcion} Precio: ${dinero(destacado.precio, n.moneda, idioma)}. Pídalo o pregunte por WhatsApp.`, boton: 'Pedir' },
      { titulo: faq.pregunta, texto: `${faq.respuesta}${pago ? ` Recibimos ${pago}.` : ''} Escríbanos por WhatsApp y le respondemos de una vez.`, boton: 'Más información' }
    ];
    return {
      nombre: n.nombre,
      categoriaPrincipal: n.maps.categoriaPrincipal,
      categoriasAdicionales: n.maps.categoriasAdicionales || [],
      descripcion: recortar(n.maps.descripcion, LIMITES.descripcionMaps),
      direccion: direccionCompleta(n),
      telefono: d.telefono || '',
      sitioWeb: d.sitioWeb || '',
      enlaceWhatsapp: w.enlaceDirecto,
      horario: w.perfil.horario,
      atributos: d.atributos || [],
      publicaciones: publicaciones.map((p) => Object.assign(p, { texto: recortar(p.texto, LIMITES.publicacionMaps) })),
      enlaceMaps: enlaceMaps(n),
      enlaceResenas: enlaceResenas(n)
    };
  }

  /* ---------- Avisos ---------- */
  function avisos(n) {
    const a = [];
    const w = whatsapp(n);
    const d = datos(n);
    if (!digitos(d.whatsapp || d.telefono)) a.push('Falta el número de WhatsApp del negocio (negocio.whatsapp).');
    if ((d.descripcionWhatsapp || n.maps.descripcion || '').length > LIMITES.descripcionWhatsapp) a.push(`La descripción del perfil de WhatsApp se recortó a ${LIMITES.descripcionWhatsapp} caracteres.`);
    if (n.maps.descripcion.length > LIMITES.descripcionMaps) a.push(`La descripción de Google Maps supera ${LIMITES.descripcionMaps} caracteres.`);
    w.respuestasRapidas.forEach((r) => { if (r.atajo.length > LIMITES.atajo) a.push(`El atajo /${r.atajo} supera ${LIMITES.atajo} caracteres.`); });
    if (w.etiquetas.length > LIMITES.etiquetas) a.push(`Hay más de ${LIMITES.etiquetas} etiquetas; WhatsApp Business admite ${LIMITES.etiquetas}.`);
    [['bienvenida', w.bienvenida], ['fuera de horario', w.fueraDeHorario]].forEach(([k, t]) => { if (t.length > LIMITES.mensajeAutomatico) a.push(`El mensaje de ${k} es demasiado largo.`); });
    if (!enlaceResenas(n)) a.push('Falta el enlace para pedir reseñas en Google (negocio.enlaceResenas): el QR de reseñas no se generó.');
    JSON.stringify(n).replace(/\[[A-ZÁÉÍÓÚÑ0-9 .,\-/]{3,}\]/g, (m) => { a.push(`Dato pendiente: ${m}`); return m; });
    return Array.from(new Set(a));
  }

  /* ---------- Markdown listo para copiar ---------- */
  const bloque = (t) => '```\n' + t + '\n```';

  function markdownWhatsapp(n) {
    const w = whatsapp(n);
    const p = w.perfil;
    const redes = Object.entries(p.redes).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' · ');
    return [
      `# WhatsApp Business · ${n.nombre}`,
      '',
      'Textos listos para copiar y pegar. Configuración: *Herramientas para la empresa* en la app de WhatsApp Business.',
      '',
      '## 1. Perfil de empresa',
      '',
      `**Nombre:** ${p.nombre}`, '',
      `**Categoría:** ${p.categoria}`, '',
      `**Descripción** (${p.descripcion.length}/${LIMITES.descripcionWhatsapp} caracteres):`, '', bloque(p.descripcion), '',
      `**Info / Acerca de** (${p.info.length}/${LIMITES.infoWhatsapp}):`, '', bloque(p.info), '',
      `**Dirección:** ${p.direccion}`, '',
      '**Horario** (elegir «Horario personalizado»):', '',
      p.horario.map((h) => `- ${h.nombre}: ${h.texto}`).join('\n'), '',
      p.correo ? `**Correo:** ${p.correo}\n` : '',
      p.sitioWeb ? `**Sitio web:** ${p.sitioWeb}\n` : '',
      redes ? `**Redes:** ${redes}\n` : '',
      '## 2. Mensaje de bienvenida',
      '',
      'Herramientas para la empresa → Mensaje de bienvenida → Activar. Destinatarios: todos.',
      '',
      bloque(w.bienvenida), '',
      '> La app envía la bienvenida solo en el primer mensaje de un cliente o cuando lleva 14 días sin conversar con usted.',
      '',
      '## 3. Mensaje fuera de horario',
      '',
      'Herramientas para la empresa → Mensaje de ausencia → Activar → Horario: «Fuera del horario comercial».',
      '',
      bloque(w.fueraDeHorario), '',
      '## 4. Respuestas rápidas',
      '',
      'Herramientas para la empresa → Respuestas rápidas → Agregar. Se usan escribiendo «/» en el chat.',
      '',
      w.respuestasRapidas.map((r) => `**/${r.atajo}**\n\n${bloque(r.texto)}`).join('\n\n'), '',
      '> La app no responde sola a opciones numeradas (por ejemplo «escriba 1 para precios»). No ponga menús así en los mensajes automáticos.',
      '',
      '## 5. Etiquetas',
      '',
      'Chats → mantener presionado un chat → Etiquetar → Nueva etiqueta.',
      '',
      w.etiquetas.map((e) => `- ${e}`).join('\n'), '',
      '## 6. Catálogo',
      '',
      'Herramientas para la empresa → Catálogo → Agregar artículo. Las imágenes están en `imagenes/catalogo/`.',
      '',
      '| # | Imagen | Nombre | Precio | Descripción | Código |',
      '|---|---|---|---|---|---|',
      w.catalogo.map((c) => `| ${c.numero} | ${String(c.numero).padStart(2, '0')}-${slug(c.nombre)}.png | ${c.nombre} | ${c.precioTexto} | ${c.descripcion} | ${c.codigo} |`).join('\n'), '',
      '## 7. Enlaces',
      '',
      `- Enlace directo: ${w.enlaceDirecto}`,
      `- Enlace del QR (con mensaje ya escrito): ${w.enlaceQR}`,
      ''
    ].join('\n');
  }

  function markdownMaps(n) {
    const m = maps(n);
    const es = (n.idioma || 'es') !== 'en';
    return [
      `# Google Maps · ${n.nombre}`,
      '',
      'Textos para el perfil del negocio en Google (Google Business Profile). Se edita desde business.google.com o buscando el negocio en Google Maps con la cuenta del dueño.',
      '',
      '## Datos básicos', '',
      `**Nombre:** ${m.nombre} (exactamente como aparece en el letrero; no agregue palabras clave).`, '',
      `**Categoría principal:** ${m.categoriaPrincipal}`, '',
      `**Categorías adicionales:** ${m.categoriasAdicionales.join(', ') || '—'}`, '',
      `**Dirección:** ${m.direccion}`, '',
      m.telefono ? `**Teléfono:** ${m.telefono}\n` : '',
      m.sitioWeb ? `**Sitio web:** ${m.sitioWeb}\n` : '',
      `**Botón de WhatsApp / chat:** ${m.enlaceWhatsapp}`, '',
      '## Horario', '',
      m.horario.map((h) => `- ${h.nombre}: ${h.texto}`).join('\n'), '',
      es ? '> Agregue los horarios especiales de festivos con anticipación.' : '> Add holiday hours ahead of time.', '',
      `## Descripción (${m.descripcion.length}/${LIMITES.descripcionMaps} caracteres)`, '',
      bloque(m.descripcion), '',
      m.atributos.length ? '## Atributos\n\n' + m.atributos.map((a) => `- ${a}`).join('\n') + '\n' : '',
      '## Publicaciones iniciales', '',
      m.publicaciones.map((p, i) => `### ${i + 1}. ${p.titulo}\n\nBotón: **${p.boton}** → enlace de WhatsApp\n\n${bloque(p.texto)}`).join('\n\n'), '',
      '## Enlaces', '',
      `- Ver en el mapa: ${m.enlaceMaps}`,
      `- Pedir reseñas: ${m.enlaceResenas || '[ENLACE DE RESEÑAS DE GOOGLE] → en el perfil: «Pedir reseñas» → copiar enlace'}`,
      ''
    ].join('\n');
  }

  function listaVerificacion(n, { plan } = {}) {
    const d = datos(n);
    const w = whatsapp(n);
    const pro = (plan || d.plan || 'esencial') === 'pro';
    const c = (t) => `- [ ] ${t}`;
    const secciones = [
      [`# Lista de verificación de entrega · ${n.nombre}`, '', `Plan: **${pro ? 'Pro' : 'Esencial'}** · Generada por Timbre`, ''].join('\n'),
      ['## Antes de empezar', c('Recibido el 50% inicial.'), c('Datos confirmados con el dueño: nombre, dirección, horario, precios, medios de pago.'), c('Fotos recibidas: logo, fachada, interior y productos (mínimo 5).'), c('Autorización de tratamiento de datos firmada (acuerdo de encargo).')].join('\n'),
      ['## WhatsApp Business', c('App de WhatsApp Business instalada en el celular del negocio (sin perder chats si migra desde WhatsApp).'), c('Perfil completo: nombre, categoría, descripción, dirección, horario, correo y sitio web.'), c(`Catálogo con ${w.catalogo.length} artículos, fotos y precios.`), c('Mensaje de bienvenida activado.'), c('Mensaje fuera de horario activado con «Fuera del horario comercial».'), c(`${w.respuestasRapidas.length} respuestas rápidas creadas.`), c(`${w.etiquetas.length} etiquetas creadas.`), c('Prueba desde otro número: llega la bienvenida (recuerde la regla de 14 días).'), c('Prueba fuera de horario: llega el mensaje de ausencia.')].join('\n'),
      ['## Google Maps', c('Perfil creado o reclamado con la cuenta de Google del dueño (el dueño es propietario; Timbre solo administrador si hace falta).'), c('Verificación iniciada (puede tardar varios días; anotar el método).'), c('Categoría principal y adicionales.'), c('Horario y horarios especiales.'), c('Fotos: logo, portada y al menos 3 más.'), c('Botón de WhatsApp o chat con el enlace directo.'), c('Descripción pegada.'), c('3 publicaciones iniciales hechas.'), c('Enlace para pedir reseñas copiado en negocio.enlaceResenas.')].join('\n'),
      ['## Códigos QR', c('QR de WhatsApp impreso para la vitrina (`qr/qr-whatsapp.png`).'), c('QR publicado en Instagram (historia destacada o publicación).'), c('Probado con la cámara de dos celulares distintos.')].join('\n')
    ];
    if (pro) secciones.push(['## Plan Pro', c('Página web publicada (`pagina/index.html`).'), c('Dominio comprado por el cliente y conectado (se paga aparte).'), c('Formulario probado: abre WhatsApp con el mensaje y exige la autorización de datos.'), c('Enlace de la página agregado en WhatsApp Business y en Google Maps.'), c('QR de reseñas impreso (`qr/qr-resenas.png`).')].join('\n'));
    secciones.push(['## Capacitación gratuita', c('Cómo usar respuestas rápidas escribiendo «/».'), c('Cómo etiquetar chats y revisar etiquetas.'), c('Cómo editar el catálogo y los precios.'), c('Cómo cambiar el horario y los mensajes en festivos o vacaciones.'), c('Cómo responder reseñas en Google.')].join('\n'));
    secciones.push(['## Cierre', c('El dueño vio todo funcionando.'), c('Cobrado el 50% restante.'), c('Documento de entrega enviado.'), c('Ofrecido el plan de mantenimiento mensual.')].join('\n'));
    const av = avisos(n);
    if (av.length) secciones.push(['## Avisos del generador', ...av.map((x) => `- ${x}`)].join('\n'));
    return secciones.join('\n\n') + '\n';
  }

  return { LIMITES, slug, plantilla, dinero, hora, horaDe, horarioFilas, direccionCompleta, enlaceMaps, enlaceWhatsapp, enlaceResenas, mensajeQR, digitos, whatsapp, maps, avisos, markdownWhatsapp, markdownMaps, listaVerificacion };
});
