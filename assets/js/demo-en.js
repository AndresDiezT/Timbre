/* Full-screen English simulator with auto mode, captions and 16:9 / 9:16 formats.
   Params: ?gremio=cleaning|hvac|plumbing &formato=libre|169|916 &velocidad= &asesora= &grabar=1 */
(async function () {
  'use strict';
  const T = window.Timbre;
  const $ = (s) => document.querySelector(s);
  const p = T.params;

  let datos;
  try { datos = await T.cargar({ idioma: 'en' }); } catch (e) {
    $('#leads-demo').innerHTML = '<p class="tarjeta">The demo could not load. Open it from a web server (for example GitHub Pages).</p>';
    return;
  }
  const { marca, gremios } = datos;
  const asesora = T.asesora(marca);
  const estado = {
    gremio: gremios.find((g) => g.id === p.get('gremio')) || gremios[0],
    formato: ['libre', '169', '916'].includes(p.get('formato')) ? p.get('formato') : 'libre',
    velocidad: Math.min(3, Math.max(0.5, parseFloat(p.get('velocidad')) || 1)),
    pausado: false,
    grabando: p.get('grabar') === '1'
  };

  const sel = $('#d-gremio');
  sel.innerHTML = gremios.map((g) => `<option value="${g.id}">${T.esc(g.gremio)}</option>`).join('');
  sel.value = estado.gremio.id;
  const selVel = $('#d-velocidad');
  selVel.value = [...selVel.options].some((o) => +o.value === estado.velocidad) ? String(estado.velocidad) : '1';

  const esc = $('#escenario');
  const leads = new TimbreLeads($('#leads-demo'), {
    negocio: estado.gremio, interactivo: false, velocidad: estado.velocidad,
    alEvento: () => { esc.dataset.paso = leads.estadoPaso; }
  });
  // Mantener data-paso del escenario sincronizado con el componente.
  new MutationObserver(() => { esc.dataset.paso = $('#leads-demo').dataset.paso || 'form'; })
    .observe($('#leads-demo'), { attributes: true, attributeFilter: ['data-paso'] });

  async function reproducir() {
    leads.reiniciar(false);
    $('#cierre').hidden = true;
    const mio = ++leads.turno;
    for (const e of leads.escenas()) {
      $('#subtitulo').textContent = e.sub;
      if (!(await leads.dormir(600, mio))) return;
      const ok = await e.accion(mio);
      if (!ok || leads.turno !== mio) return;
      if (!(await leads.dormir(1800, mio))) return;
    }
    $('#subtitulo').textContent = '';
    $('#cierre').hidden = false;
    if (!(await leads.dormir(4200, mio))) return;
    reproducir();
  }

  function ajustar() {
    const lienzo = $('#lienzo');
    esc.dataset.formato = estado.formato;
    if (estado.formato === 'libre') { esc.style.transform = ''; lienzo.style.height = ''; return; }
    const [w, h] = estado.formato === '169' ? [1280, 720] : [720, 1280];
    const anchoDisp = lienzo.clientWidth - (estado.grabando ? 0 : 32);
    const altoDisp = estado.grabando ? window.innerHeight : Math.max(window.innerHeight - 60, 420);
    const s = Math.min(anchoDisp / w, altoDisp / h);
    esc.style.transform = `translate(${(lienzo.clientWidth - w * s) / 2}px, ${estado.grabando ? (window.innerHeight - h * s) / 2 : 16}px) scale(${s})`;
    lienzo.style.height = estado.grabando ? '100vh' : `${h * s + 40}px`;
  }
  window.addEventListener('resize', ajustar);

  function sincronizarUrl() {
    const url = new URL(location.href);
    const poner = (k, v) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k));
    poner('gremio', estado.gremio.id);
    poner('formato', estado.formato === 'libre' ? '' : estado.formato);
    poner('velocidad', estado.velocidad === 1 ? '' : String(estado.velocidad));
    poner('grabar', estado.grabando ? '1' : '');
    history.replaceState(null, '', url);
    $('#d-loquiero').href = T.enlaceWhatsapp(marca, { texto: `Hi! I saw the Timbre ${estado.gremio.gremioCorto} demo and I want this for my business.`, idioma: 'en', asesora });
  }

  function grabacion(activar) {
    estado.grabando = activar;
    document.body.classList.toggle('grabando', activar);
    $('#d-salir').hidden = !activar;
    ajustar();
    (activar ? esc : $('#d-grabar')).focus();
    sincronizarUrl();
  }

  sel.addEventListener('change', () => { estado.gremio = gremios.find((g) => g.id === sel.value); leads.setNegocio(estado.gremio); reproducir(); sincronizarUrl(); });
  document.querySelectorAll('[data-formato]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.formato === estado.formato));
    b.addEventListener('click', () => {
      estado.formato = b.dataset.formato;
      document.querySelectorAll('[data-formato]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      ajustar(); sincronizarUrl();
    });
  });
  selVel.addEventListener('change', () => { estado.velocidad = +selVel.value; leads.o.velocidad = estado.velocidad; leads.tel.o.velocidad = estado.velocidad; sincronizarUrl(); });
  $('#d-play').addEventListener('click', (e) => {
    estado.pausado = !estado.pausado;
    if (estado.pausado) leads.pausar(); else leads.reanudar();
    e.currentTarget.textContent = estado.pausado ? 'Resume' : 'Pause';
  });
  $('#d-reiniciar').addEventListener('click', () => { estado.pausado = false; leads.reanudar(); $('#d-play').textContent = 'Pause'; reproducir(); });
  $('#d-grabar').addEventListener('click', () => grabacion(true));
  $('#d-salir').addEventListener('click', () => grabacion(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && estado.grabando) grabacion(false); });

  sincronizarUrl();
  if (estado.grabando) grabacion(true); else ajustar();
  reproducir();
})();
