/* Constructor de entregas: formulario por pasos para armar el JSON de un
   cliente, con vista previa en vivo (chat, página web y QR), botones para
   copiar cada texto y descarga del JSON. Todo ocurre en el navegador. */
(async function () {
  'use strict';
  const T = window.Timbre;
  const Kit = window.TimbreKit;
  const Pagina = window.TimbrePagina;
  const $ = (s) => document.querySelector(s);
  const CLAVE = 'timbre-constructor-borrador';
  const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
  const PASOS = ['Partida', 'Negocio', 'Horario', 'Catálogo', 'Mensajes', 'Google Maps', 'Textos listos'];

  const { gremios } = await T.cargar({ idioma: 'todos' });
  const clonar = (o) => JSON.parse(JSON.stringify(o));
  let n = null;
  let paso = 0;
  let modificado = false;

  /* ---------- Estado ---------- */
  function desdeGremio(g) {
    const c = clonar(g);
    delete c.ficticio;
    delete c.clientesDemo;
    delete c.automatizacion;
    c.nombre = '[NOMBRE DEL NEGOCIO]';
    const u = c.ubicacion || {};
    c.negocio = {
      mercado: c.idioma === 'en' ? 'en' : 'co',
      plan: c.modulo || 'pedidos', modulo: c.modulo || 'pedidos', estiloPagina: 'sobrio',
      costoDomicilio: null, intervaloReservas: 30,
      direccion: '', barrio: '', ciudad: u.ciudad || '', pais: '',
      telefono: '', whatsapp: '', correo: '', sitioWeb: '',
      redes: { instagram: '', facebook: '', tiktok: '' },
      mediosPago: [], politicas: {}, atributos: [],
      enlaceMaps: '', enlaceResenas: '', mensajeQR: '', info: ''
    };
    c.ubicacion = { direccion: '', barrio: '', ciudad: u.ciudad || '', referencia: '' };
    return c;
  }

  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(n)); } catch (e) { /* sin almacenamiento */ } }
  function cargarBorrador() { try { return JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) { return null; } }

  const leerRuta = (o, ruta) => ruta.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
  function ponerRuta(o, ruta, valor) {
    const partes = ruta.split('.');
    let a = o;
    partes.slice(0, -1).forEach((k) => { if (a[k] == null || typeof a[k] !== 'object') a[k] = {}; a = a[k]; });
    a[partes[partes.length - 1]] = valor;
  }

  /* ---------- Campos simples ---------- */
  function pintarCampos() {
    document.querySelectorAll('[data-campo]').forEach((el) => {
      const v = leerRuta(n, el.dataset.campo);
      el.value = el.dataset.tipo === 'lista' ? (v || []).join(', ') : (v == null ? '' : String(v));
    });
    pintarHorario();
    pintarCatalogo();
    pintarRapidas();
    pintarFaq();
    contadores();
  }

  document.querySelectorAll('[data-campo]').forEach((el) => {
    el.addEventListener('input', () => {
      let v = el.value;
      if (el.dataset.tipo === 'lista') v = v.split(',').map((x) => x.trim()).filter(Boolean);
      if (el.dataset.tipo === 'numero') v = v === '' ? null : Number(v);
      // En Pedidos y Reservas el módulo de la página es el mismo plan.
      if (el.dataset.campo === 'negocio.plan' && (v === 'pedidos' || v === 'reservas')) { n.negocio.modulo = v; document.getElementById('f-modulo').value = v; }
      ponerRuta(n, el.dataset.campo, v);
      // La dirección se refleja en la ubicación que usa el chat.
      if (['negocio.direccion', 'negocio.barrio', 'negocio.ciudad'].includes(el.dataset.campo)) ponerRuta(n, 'ubicacion.' + el.dataset.campo.split('.')[1], v);
      contadores();
      programar();
    });
  });

  function contadores() {
    document.querySelectorAll('[data-contador]').forEach((c) => {
      const el = document.getElementById(c.dataset.contador);
      const max = +c.dataset.max;
      c.textContent = `(${el.value.length}/${max})`;
      c.classList.toggle('pasado', el.value.length > max);
    });
  }

  /* ---------- Editor de horario ---------- */
  function pintarHorario() {
    const caja = $('#editor-horario');
    caja.innerHTML = DIAS.map((d) => {
      const r = n.horario[d];
      const nombre = T.NOMBRE_DIA[n.idioma === 'en' ? 'en' : 'es'][d];
      return `<div class="horario-dia" data-dia="${d}">
        <span><b>${nombre}</b></span>
        <label class="casilla"><input type="checkbox" data-h="abierto" ${r ? 'checked' : ''}> Abre</label>
        <label class="solo-lector" for="h-${d}-a">${nombre}: abre</label><input type="time" id="h-${d}-a" data-h="abre" value="${r ? r[0] : '09:00'}" ${r ? '' : 'disabled'}>
        <label class="solo-lector" for="h-${d}-c">${nombre}: cierra</label><input type="time" id="h-${d}-c" data-h="cierra" value="${r ? r[1] : '18:00'}" ${r ? '' : 'disabled'}>
      </div>`;
    }).join('');
  }
  $('#editor-horario').addEventListener('input', (e) => {
    const fila = e.target.closest('[data-dia]');
    if (!fila) return;
    const abierto = fila.querySelector('[data-h="abierto"]').checked;
    fila.querySelectorAll('input[type="time"]').forEach((i) => { i.disabled = !abierto; });
    n.horario[fila.dataset.dia] = abierto ? [fila.querySelector('[data-h="abre"]').value, fila.querySelector('[data-h="cierra"]').value] : null;
    programar();
  });
  $('#c-horario-auto').addEventListener('click', () => {
    const filas = Kit.horarioFilas(n);
    const en = n.idioma === 'en';
    n.horarioTexto = filas.map((f) => (en ? `${f.nombre} ${f.texto}` : `${f.nombre.toLowerCase()} ${f.texto === 'Cerrado' ? 'cerrado' : 'de ' + f.texto}`)).join('; ') + '.';
    $('#f-horario-texto').value = n.horarioTexto;
    programar();
  });

  /* ---------- Editores de listas ---------- */
  let contador = 0;
  const uid = () => `x${++contador}`;

  function pintarCatalogo() {
    $('#editor-catalogo').innerHTML = n.catalogo.map((p, i) => {
      const a = uid(), b = uid(), c = uid();
      return `<div class="fila fila--producto" data-i="${i}">
        <div class="campo"><label for="${a}">Producto ${i + 1}</label><input id="${a}" data-k="nombre" value="${T.esc(p.nombre)}"></div>
        <div class="campo"><label for="${b}">Descripción</label><input id="${b}" data-k="descripcion" value="${T.esc(p.descripcion || '')}"></div>
        <div class="campo"><label for="${c}">Precio (${T.esc(n.moneda)})</label><input id="${c}" data-k="precio" type="number" min="0" inputmode="numeric" value="${p.precio}"></div>
        <button type="button" class="boton boton--chico quitar" data-quitar="${i}" aria-label="Quitar ${T.esc(p.nombre)}">Quitar</button>
      </div>`;
    }).join('');
  }
  $('#editor-catalogo').addEventListener('input', (e) => {
    const fila = e.target.closest('[data-i]');
    const k = e.target.dataset.k;
    if (!fila || !k) return;
    n.catalogo[+fila.dataset.i][k] = k === 'precio' ? Number(e.target.value) || 0 : e.target.value;
    programar();
  });
  $('#editor-catalogo').addEventListener('click', (e) => {
    const b = e.target.closest('[data-quitar]');
    if (!b) return;
    n.catalogo.splice(+b.dataset.quitar, 1);
    pintarCatalogo();
    programar();
  });
  $('#c-agregar-producto').addEventListener('click', () => {
    n.catalogo.push({ nombre: 'Nuevo producto', descripcion: '', precio: 0 });
    pintarCatalogo();
    $('#editor-catalogo .fila:last-child input').focus();
    programar();
  });

  function pintarRapidas() {
    $('#editor-rapidas').innerHTML = n.mensajes.respuestasRapidas.map((r, i) => {
      const a = uid(), b = uid();
      return `<div class="fila fila--rapida" data-i="${i}">
        <div class="campo"><label for="${a}">Atajo /</label><input id="${a}" data-k="atajo" maxlength="25" value="${T.esc(r.atajo)}"></div>
        <div class="campo"><label for="${b}">Texto</label><textarea id="${b}" data-k="texto" rows="2">${T.esc(r.texto)}</textarea></div>
        <button type="button" class="boton boton--chico quitar" data-quitar="${i}" aria-label="Quitar /${T.esc(r.atajo)}">Quitar</button>
      </div>`;
    }).join('');
  }
  $('#editor-rapidas').addEventListener('input', (e) => {
    const fila = e.target.closest('[data-i]');
    if (!fila || !e.target.dataset.k) return;
    n.mensajes.respuestasRapidas[+fila.dataset.i][e.target.dataset.k] = e.target.dataset.k === 'atajo' ? e.target.value.replace(/^\//, '').replace(/\s+/g, '') : e.target.value;
    programar();
  });
  $('#editor-rapidas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-quitar]');
    if (!b) return;
    n.mensajes.respuestasRapidas.splice(+b.dataset.quitar, 1);
    pintarRapidas();
    programar();
  });
  $('#c-agregar-rapida').addEventListener('click', () => {
    n.mensajes.respuestasRapidas.push({ atajo: 'nueva', texto: '' });
    pintarRapidas();
    programar();
  });

  function pintarFaq() {
    while (n.faq.length < 8) n.faq.push({ pregunta: '', respuesta: '' });
    $('#editor-faq').innerHTML = n.faq.slice(0, 8).map((f, i) => {
      const a = uid(), b = uid();
      return `<div class="fila" data-i="${i}">
        <div class="campo"><label for="${a}">Pregunta ${i + 1}</label><input id="${a}" data-k="pregunta" value="${T.esc(f.pregunta)}"></div>
        <div class="campo"><label for="${b}">Respuesta</label><textarea id="${b}" data-k="respuesta" rows="2">${T.esc(f.respuesta)}</textarea></div>
      </div>`;
    }).join('');
  }
  $('#editor-faq').addEventListener('input', (e) => {
    const fila = e.target.closest('[data-i]');
    if (!fila || !e.target.dataset.k) return;
    n.faq[+fila.dataset.i][e.target.dataset.k] = e.target.value;
    programar();
  });

  /* ---------- Vista previa ---------- */
  const tel = new TimbreTelefono($('#telefono-constructor'), { negocio: gremios[0], idioma: 'es' });
  const cssCache = {};
  async function cssDe(estilo) {
    if (!cssCache[estilo]) {
      const [base, propio] = await Promise.all(['base', estilo].map((e) => fetch(`../plantillas/pagina-negocio/estilos/${e}.css`).then((r) => r.text())));
      cssCache[estilo] = base + '\n' + propio;
    }
    return cssCache[estilo];
  }

  let tPrev;
  function programar() { clearTimeout(tPrev); tPrev = setTimeout(actualizar, 350); }
  document.getElementById('form').addEventListener('input', (e) => { if (!e.target.closest('[data-paso="0"]')) modificado = true; });

  async function actualizar() {
    guardar();
    const pestana = document.querySelector('[role="tab"][aria-selected="true"]').id;
    if (pestana === 't-chat') {
      tel.setNegocio(n);
      tel.o.idioma = n.idioma === 'en' ? 'en' : 'es';
      tel.o.moneda = n.moneda;
      tel.ejecutar(TimbreTelefono.guionLlegada(n, { minutos: 21 * 60 + 47, idioma: tel.o.idioma, moneda: n.moneda }));
    }
    if (pestana === 't-pagina') {
      const estilo = (n.negocio && n.negocio.estiloPagina) || 'sobrio';
      const enlace = Kit.enlaceResenas(n);
      $('#marco-pagina').srcdoc = Pagina.render(n, { estilo, css: await cssDe(estilo), qrResenas: enlace ? T.qrSVG(enlace, { etiqueta: 'QR de reseñas' }) : '' });
    }
    if (pestana === 't-qr') {
      const url = Kit.enlaceWhatsapp(n, Kit.mensajeQR(n));
      $('#qr-vista').innerHTML = Kit.digitos(n.negocio.whatsapp) ? T.qrSVG(url, { etiqueta: `QR de WhatsApp de ${n.nombre}` }) : '<p class="tarjeta">Falta el número de WhatsApp.</p>';
      $('#qr-enlace').textContent = url;
    }
    if (paso === PASOS.length - 1) pintarResultado();
  }

  /* ---------- Resultado ---------- */
  function copiable(titulo, texto) {
    return `<div class="copiable"><div class="copiable__cabeza"><span class="copiable__titulo">${T.esc(titulo)}</span><button type="button" class="boton boton--chico" data-copiar data-copiado="Copiado">Copiar</button></div><pre>${T.esc(texto)}</pre></div>`;
  }
  function pintarResultado() {
    const w = Kit.whatsapp(n);
    const m = Kit.maps(n);
    const av = Kit.avisos(n);
    $('#avisos').innerHTML = av.length ? `<strong>Revise antes de entregar:</strong><ul>${av.map((a) => `<li>${T.esc(a)}</li>`).join('')}</ul>` : '';
    const horario = w.perfil.horario.map((h) => `${h.nombre}: ${h.texto}`).join('\n');
    $('#resultado').innerHTML = [
      '<h3 class="grupo-resultado">WhatsApp Business</h3>',
      copiable('Nombre', w.perfil.nombre),
      copiable(`Descripción (${w.perfil.descripcion.length}/512)`, w.perfil.descripcion),
      copiable(`Info (${w.perfil.info.length}/139)`, w.perfil.info),
      copiable('Dirección', w.perfil.direccion),
      copiable('Horario', horario),
      copiable('Bienvenida', w.bienvenida),
      copiable('Fuera de horario', w.fueraDeHorario),
      ...w.respuestasRapidas.map((r) => copiable(`Respuesta rápida /${r.atajo}`, r.texto)),
      copiable('Etiquetas', w.etiquetas.join('\n')),
      copiable('Catálogo', w.catalogo.map((c) => `${c.nombre} · ${c.precioTexto}\n${c.descripcion}`).join('\n\n')),
      copiable('Enlace del QR de WhatsApp', w.enlaceQR),
      '<h3 class="grupo-resultado">Google Maps</h3>',
      copiable('Categoría principal', m.categoriaPrincipal),
      copiable('Categorías adicionales', m.categoriasAdicionales.join('\n')),
      copiable(`Descripción (${m.descripcion.length}/750)`, m.descripcion),
      ...m.publicaciones.map((p, i) => copiable(`Publicación ${i + 1}: ${p.titulo}`, p.texto)),
      '<h3 class="grupo-resultado">Entrega</h3>',
      copiable('Lista de verificación', Kit.listaVerificacion(n))
    ].join('');
  }
  $('#resultado').addEventListener('click', (e) => {
    const b = e.target.closest('[data-copiar]');
    if (b) T.copiar(b.closest('.copiable').querySelector('pre').textContent, b);
  });

  function nombreArchivo() { return Kit.slug(n.nombre.replace(/\[.*?\]/g, '') || 'cliente') + '.json'; }
  $('#c-descargar').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(n, null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombreArchivo();
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  $('#c-copiar-json').addEventListener('click', (e) => T.copiar(JSON.stringify(n, null, 2), e.currentTarget));
  $('#c-borrar').addEventListener('click', () => {
    if (!window.confirm('¿Borrar el borrador y empezar de nuevo?')) return;
    try { localStorage.removeItem(CLAVE); } catch (err) { /* nada */ }
    iniciar(desdeGremio(gremios.find((g) => g.id === $('#c-gremio').value) || gremios[0]), 'Borrador borrado.');
    irA(0);
  });

  /* ---------- Punto de partida ---------- */
  $('#c-gremio').innerHTML = gremios.map((g) => `<option value="${g.id}">${T.esc(g.gremio)} (${g.idioma === 'en' ? 'inglés' : 'español'})</option>`).join('');
  $('#c-cargar-gremio').addEventListener('click', () => {
    const g = gremios.find((x) => x.id === $('#c-gremio').value);
    if (modificado && !window.confirm('Esto reemplaza lo que lleva escrito. ¿Continuar?')) return;
    iniciar(desdeGremio(g), `Base: ${g.gremio}.`);
    irA(1);
  });
  $('#c-subir').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const datos = JSON.parse(await f.text());
      if (!datos.catalogo || !datos.mensajes) throw new Error('no parece un cliente de Timbre');
      if (!datos.negocio) Object.assign(datos, { negocio: desdeGremio(datos).negocio });
      iniciar(datos, `Abierto: ${f.name}.`);
      irA(1);
    } catch (err) {
      $('#c-origen').textContent = `No se pudo abrir el archivo: ${err.message}.`;
    }
    e.target.value = '';
  });

  function iniciar(datos, origen) {
    n = datos;
    modificado = false;
    n.horario = n.horario || {};
    DIAS.forEach((d) => { if (!(d in n.horario)) n.horario[d] = null; });
    $('#c-origen').textContent = origen || '';
    pintarCampos();
    programar();
  }

  /* ---------- Pasos y pestañas ---------- */
  $('#pasos-nav').innerHTML = PASOS.map((p, i) => `<li><button type="button" data-ir="${i}">${i + 1}. ${p}</button></li>`).join('');
  $('#pasos-nav').addEventListener('click', (e) => { const b = e.target.closest('[data-ir]'); if (b) irA(+b.dataset.ir); });
  function irA(i) {
    paso = Math.max(0, Math.min(PASOS.length - 1, i));
    document.querySelectorAll('.paso').forEach((f) => { f.hidden = +f.dataset.paso !== paso; });
    document.querySelectorAll('[data-ir]').forEach((b) => (+b.dataset.ir === paso ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    $('#c-anterior').disabled = paso === 0;
    $('#c-siguiente').hidden = paso === PASOS.length - 1;
    if (paso === PASOS.length - 1) pintarResultado();
    const leyenda = document.querySelector(`.paso[data-paso="${paso}"] legend`);
    if (leyenda && document.activeElement && document.activeElement.closest('.constructor__nav, .pasos-nav')) {
      leyenda.setAttribute('tabindex', '-1');
      leyenda.focus();
    }
  }
  $('#c-anterior').addEventListener('click', () => irA(paso - 1));
  $('#c-siguiente').addEventListener('click', () => irA(paso + 1));

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function elegirTab(tab) {
    tabs.forEach((t) => {
      const activo = t === tab;
      t.setAttribute('aria-selected', String(activo));
      t.tabIndex = activo ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !activo;
    });
    actualizar();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => elegirTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const sig = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      sig.focus();
      elegirTab(sig);
    });
  });

  /* ---------- Arranque ---------- */
  const borrador = cargarBorrador();
  if (borrador && borrador.catalogo) iniciar(borrador, 'Se recuperó el borrador guardado en este navegador.');
  else iniciar(desdeGremio(gremios[0]), '');
  irA(0);
})();
