/* English landing page for home service businesses. */
(async function () {
  'use strict';
  const T = window.Timbre;
  const $ = (s) => document.querySelector(s);

  let datos;
  try { datos = await T.cargar({ idioma: 'en' }); } catch (e) {
    $('#leads-demo').innerHTML = '<p class="tarjeta">The demo could not load. Open the site from a web server (for example GitHub Pages).</p>';
    return;
  }
  const { marca, planes, gremios } = datos;
  const asesora = T.asesora(marca);
  const m = planes.mercados.en;
  const d = (v) => T.dinero(v, 'USD', 'en');

  /* WhatsApp */
  const wa = T.enlaceWhatsapp(marca, { texto: marca.mensajesWhatsapp.en, idioma: 'en', asesora });
  document.querySelectorAll('.js-whatsapp').forEach((a) => { a.href = wa; a.target = '_blank'; a.rel = 'noopener'; });

  /* Market selector */
  $('#market').addEventListener('change', (e) => {
    const v = e.target.value;
    if (v === 'en') return;
    const q = new URLSearchParams({ m: v });
    if (asesora) q.set('asesora', asesora.codigo);
    location.href = '../?' + q.toString();
  });

  /* Plans */
  $('#plans-mode').textContent = m.modalidad;
  $('#plans-pay').textContent = m.pago;
  $('#plans-guarantee').textContent = m.garantia;
  $('#plans-list').innerHTML = m.planes.map((p) => `
    <article class="tarjeta plan ${p.destacado ? 'plan--destacado' : ''}">
      ${p.destacado ? '<span class="pildora plan__cinta">Most complete</span>' : ''}
      <h3>${T.esc(p.nombre)}</h3>
      ${p.precio == null ? '<p class="plan__precio plan__precio--texto">Free discovery call</p>'
        : `<p class="plan__precio">${d(p.precio)}<small>${p.periodo === 'mes' ? 'per month' : 'one-time setup'}</small></p>`}
      <p class="plan__entrega">${T.esc(p.entrega)}</p>
      <ul>${p.incluye.map((i) => `<li>${T.esc(i)}</li>`).join('')}</ul>
      ${p.nota ? `<p class="plan__nota">${T.esc(T.plantilla(p.nota, { cambioAdicional: d(m.cambioAdicional) }))}</p>` : ''}
      <a class="boton ${p.destacado ? 'boton--primario' : ''} boton--bloque" target="_blank" rel="noopener"
         href="${T.esc(T.enlaceWhatsapp(marca, { texto: `Hi! I'm interested in the Timbre ${p.nombre} plan.`, idioma: 'en', asesora }))}">${T.esc(p.boton || 'Get started')}</a>
    </article>`).join('');

  /* FAQ */
  const faq = [
    ['Do I need new software?', 'No. We connect the tools you already have: your website form, a texting number, your email and a Google Sheet or CRM. Everything runs on accounts in your name.'],
    ['Is it legal to text leads?', 'We only text people who asked you to contact them: your form includes a consent checkbox, every text identifies your business and includes “Reply STOP to opt out”. No mass texting, no purchased lists and no AI cold calls.'],
    ['What does it cost to run?', 'Besides the one-time setup, you pay your own providers directly, like your texting number and any automation tool on a paid tier. We go over the exact options on the discovery call, before you commit.'],
    ['Do you need my passwords?', 'No. We set things up together on a screen share, inside your accounts. You stay the only owner and can remove our access anytime.'],
    ['What if it doesn’t work?', `${m.garantia} We test it live with you first. If something isn’t right, we fix it before you pay the rest.`],
    ['Is there a monthly fee?', `Not required. Starter and Pro are one-time. If you want changes over time, the Care plan is ${d(planes.mercados.en.planes.find((p) => p.id === 'care').precio)}/month and you can cancel anytime.`],
    ['Can it answer any question with AI?', 'Starter and Pro send fixed, friendly messages that you approve. An AI assistant that answers open questions is a custom build, quoted after a free discovery call.']
  ];
  $('#faq-list').innerHTML = faq.map(([q, a]) => `<details class="pregunta"><summary>${T.esc(q)}</summary><p>${T.esc(a)}</p></details>`).join('');

  /* Demo */
  const sel = $('#trade');
  sel.innerHTML = gremios.map((g) => `<option value="${g.id}">${T.esc(g.gremio)}</option>`).join('');
  const inicial = gremios.find((g) => g.id === T.params.get('gremio')) || gremios[0];
  sel.value = inicial.id;
  const caption = $('#caption');
  const botonesPro = document.querySelectorAll('[data-pro]');
  const leads = new TimbreLeads($('#leads-demo'), {
    negocio: inicial,
    alEvento: (nombre) => { if (nombre === 'alerta') botonesPro.forEach((b) => { b.disabled = false; }); }
  });

  function reiniciar() {
    leads.reiniciar();
    caption.textContent = '';
    botonesPro.forEach((b) => { b.disabled = true; });
  }
  sel.addEventListener('change', () => { leads.setNegocio(gremios.find((g) => g.id === sel.value)); reiniciar(); });
  $('#reset').addEventListener('click', reiniciar);
  botonesPro.forEach((b) => b.addEventListener('click', async () => {
    botonesPro.forEach((x) => { x.disabled = true; });
    await leads[b.dataset.pro]();
    botonesPro.forEach((x) => { x.disabled = false; });
  }));

  $('#play').addEventListener('click', async () => {
    reiniciar();
    leads.reiniciar(false);
    const mio = ++leads.turno;
    for (const e of leads.escenas()) {
      caption.textContent = e.sub;
      const ok = await e.accion(mio);
      if (!ok || leads.turno !== mio) return;
      if (!(await leads.dormir(1500, mio))) return;
    }
    caption.textContent = 'No lead goes unanswered.';
    botonesPro.forEach((b) => { b.disabled = false; });
  });
})();
