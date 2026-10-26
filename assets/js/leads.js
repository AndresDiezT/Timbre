/* Timbre — speed-to-lead demo for home service businesses (English).
   Web form → instant text and email → new row in a simulated sheet → owner
   alert → missed-call text-back → two follow-ups → review request.
   Everything is simulated in the browser; nothing is sent anywhere. */
(function () {
  'use strict';
  const T = window.Timbre;

  class TimbreLeads {
    constructor(raiz, opciones = {}) {
      this.raiz = raiz;
      this.o = Object.assign({ velocidad: 1, interactivo: true, alEvento: null }, opciones);
      this.turno = 0;
      this.pausado = false;
      this.render();
      this.setNegocio(this.o.negocio);
    }

    render() {
      this.raiz.classList.add('leads');
      this.raiz.innerHTML = `
        <section class="leads__form tarjeta" aria-label="Fictional company website">
          <div class="sitio__barra"><span class="sitio__logo"></span><span class="sitio__nombre"></span><span class="sitio__demo">Timbre demo · fictional</span></div>
          <form class="sitio__form" novalidate>
            <h3 class="sitio__titulo">Request a free quote</h3>
            <div class="sitio__dos">
              <div class="campo"><label for="l-nombre">Name</label><input id="l-nombre" name="nombre" autocomplete="off"></div>
              <div class="campo"><label for="l-telefono">Mobile phone</label><input id="l-telefono" name="telefono" inputmode="tel" autocomplete="off"></div>
            </div>
            <div class="sitio__dos">
              <div class="campo"><label for="l-servicio">Service</label><select id="l-servicio" name="servicio"></select></div>
              <div class="campo"><label for="l-zip">ZIP code</label><input id="l-zip" name="codigoPostal" inputmode="numeric" autocomplete="off"></div>
            </div>
            <div class="campo"><label for="l-mensaje">Details</label><textarea id="l-mensaje" name="mensaje" rows="2"></textarea></div>
            <label class="casilla"><input type="checkbox" id="l-consent" name="consent"> <span>I agree to receive texts and emails about my request from this company. Msg &amp; data rates may apply. Reply STOP to opt out. See the <a href="${T.raiz}en/privacy.html">privacy policy</a>.</span></label>
            <p class="leads__error" role="alert" hidden>Please check the consent box so we can text you back.</p>
            <button type="submit" class="boton boton--primario boton--bloque sitio__enviar">Get my quote</button>
          </form>
        </section>

        <div class="leads__telefono">
          <div class="cronometro tarjeta" aria-live="off">
            <span class="cronometro__num">0:00</span>
            <span class="cronometro__texto">Time to first reply</span>
            <span class="pildora cronometro__meta">Goal: under 60 seconds</span>
          </div>
          <div class="leads__cel"></div>
        </div>

        <section class="leads__dueno" aria-label="Owner view">
          <div class="alerta-dueno tarjeta" hidden>
            <span class="alerta-dueno__campana"></span>
            <div><p class="alerta-dueno__titulo">Owner alert</p><p class="alerta-dueno__texto"></p></div>
          </div>
          <div class="correo tarjeta" hidden>
            <p class="correo__meta"><b>Email sent to lead</b> · <span class="correo__para"></span></p>
            <p class="correo__asunto"></p>
            <p class="correo__cuerpo"></p>
          </div>
          <div class="hoja tarjeta">
            <p class="hoja__titulo">Leads <span class="pildora pildora--hueca">Simulated sheet</span></p>
            <div class="hoja__marco">
              <table>
                <thead><tr><th scope="col">Time</th><th scope="col">Name</th><th scope="col">Service</th><th scope="col">ZIP</th><th scope="col">Status</th></tr></thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </section>`;
      this.$ = (s) => this.raiz.querySelector(s);
      this.form = this.$('.sitio__form');
      this.tel = new TimbreTelefono(this.$('.leads__cel'), { idioma: 'en', campana: true, velocidad: this.o.velocidad, anunciar: this.o.interactivo });
      this.$('.alerta-dueno__campana').innerHTML = T.htmlCampana();
      this.form.addEventListener('submit', (e) => { e.preventDefault(); if (this.o.interactivo) this.enviar(); });
    }

    setNegocio(n) {
      this.negocio = n;
      this.a = n.automatizacion;
      this.raiz.style.setProperty('--acento', n.acento);
      this.raiz.style.setProperty('--sobre-acento', T.contraste(n.acento));
      this.$('.sitio__nombre').textContent = n.nombre;
      this.$('.sitio__logo').textContent = T.iniciales(n.nombre);
      this.$('#l-servicio').innerHTML = this.a.servicios.map((s) => `<option>${T.esc(s)}</option>`).join('');
      this.tel.setNegocio(n);
      this.reiniciar();
    }

    /* ---- Control de tiempo ---- */
    detener() { this.turno++; this.tel.detener(); clearInterval(this.intervalo); }
    pausar() { this.pausado = true; this.tel.pausar(); }
    reanudar() { this.pausado = false; this.tel.reanudar(); }
    async dormir(ms, mio) {
      let t = 0;
      const total = ms / (this.o.velocidad || 1);
      while (t < total) {
        await T.esperar(50);
        if (mio !== this.turno) return false;
        if (!this.pausado) t += 50;
      }
      return true;
    }

    reiniciar(prellenar = true) {
      this.detener();
      this.estadoPaso = 'form';
      this.raiz.dataset.paso = 'form';
      this.tel.limpiar();
      this.tel.setReloj(20 * 60 + 12, 'mar');
      this.$('.hoja tbody').innerHTML = `<tr class="hoja__vieja"><td>Mon 4:03 PM</td><td>Earlier lead</td><td>${T.esc(this.a.servicios[0])}</td><td>—</td><td>Booked</td></tr>`;
      this.$('.alerta-dueno').hidden = true;
      this.$('.correo').hidden = true;
      this.$('.cronometro__num').textContent = '0:00';
      this.$('.cronometro').classList.remove('cronometro--listo', 'cronometro--corriendo');
      this.$('.leads__error').hidden = true;
      this.$('#l-consent').checked = false;
      const f = this.a.formulario;
      const campos = { nombre: f.nombre, telefono: f.telefono, codigoPostal: f.codigoPostal, mensaje: f.mensaje };
      Object.entries(campos).forEach(([k, v]) => { this.form.elements[k].value = prellenar ? v : ''; });
      this.form.elements.servicio.value = f.servicio;
      this.form.querySelectorAll('input, select, textarea, button').forEach((el) => { el.disabled = false; });
    }

    datos() {
      const el = this.form.elements;
      const nombreCompleto = (el.nombre.value || this.a.formulario.nombre).trim().slice(0, 40);
      return {
        cliente: nombreCompleto.split(/\s+/)[0],
        nombreCompleto,
        telefono: (el.telefono.value || this.a.formulario.telefono).trim().slice(0, 20),
        servicio: ((v) => (/^.[a-z]/.test(v) ? v[0].toLowerCase() + v.slice(1) : v))(el.servicio.value || this.a.formulario.servicio),
        servicioOriginal: el.servicio.value,
        codigoPostal: (el.codigoPostal.value || this.a.formulario.codigoPostal).trim().slice(0, 10),
        negocio: this.negocio.nombre,
        enlaceResena: 'g.page/r/[REVIEW-LINK]'
      };
    }

    emitir(nombre, d) { if (this.o.alEvento) this.o.alEvento(nombre, d || {}); }

    /* ---- Pasos ---- */
    async escribirFormulario(mio) {
      const f = this.a.formulario;
      const campos = [['nombre', f.nombre], ['telefono', f.telefono], ['codigoPostal', f.codigoPostal], ['mensaje', f.mensaje]];
      Object.keys(Object.fromEntries(campos)).forEach((k) => { this.form.elements[k].value = ''; });
      this.form.elements.servicio.value = f.servicio;
      for (const [k, v] of campos) {
        const el = this.form.elements[k];
        if (T.reducido()) { el.value = v; continue; }
        for (let i = 1; i <= v.length; i++) {
          el.value = v.slice(0, i);
          if (!(await this.dormir(k === 'mensaje' ? 22 : 45, mio))) return false;
        }
        if (!(await this.dormir(200, mio))) return false;
      }
      this.$('#l-consent').checked = true;
      return this.dormir(500, mio);
    }

    async enviar(mio = ++this.turno) {
      if (!this.$('#l-consent').checked) {
        this.$('.leads__error').hidden = false;
        this.$('#l-consent').focus();
        return false;
      }
      this.$('.leads__error').hidden = true;
      const d = this.datos();
      this.form.querySelectorAll('input, select, textarea, button').forEach((el) => { el.disabled = true; });
      this.estadoPaso = 'enviado';
      this.raiz.dataset.paso = 'enviado';
      this.emitir('enviado', d);
      T.sonar(this.tel.campana);

      // Cronómetro visible hasta que llega el texto.
      const crono = this.$('.cronometro');
      const num = this.$('.cronometro__num');
      crono.classList.add('cronometro--corriendo');
      const segundosObjetivo = 7;
      let s = 0;
      for (s = 1; s <= segundosObjetivo; s++) {
        if (!(await this.dormir(1000, mio))) return false;
        num.textContent = `0:${String(s).padStart(2, '0')}`;
      }
      crono.classList.remove('cronometro--corriendo');
      crono.classList.add('cronometro--listo');
      this.tel.setReloj(20 * 60 + 12, 'mar');
      await this.tel.ejecutar([
        { tipo: 'fecha', texto: 'Today', espera: 0 },
        { tipo: 'negocio', texto: T.plantilla(this.a.textoInmediato, d), auto: true, espera: 0 }
      ], { limpiar: true });
      this.emitir('texto', d);
      if (!(await this.dormir(1200, mio))) return false;

      // Correo
      const c = this.$('.correo');
      c.hidden = false;
      this.$('.correo__para').textContent = this.form.elements.nombre.value ? `${d.cliente.toLowerCase()}@example.com` : this.a.formulario.correo;
      this.$('.correo__asunto').textContent = T.plantilla(this.a.correoInmediato.asunto, d);
      this.$('.correo__cuerpo').textContent = T.plantilla(this.a.correoInmediato.cuerpo, d);
      this.emitir('correo', d);
      if (!(await this.dormir(1200, mio))) return false;

      // Fila en la hoja
      const tr = document.createElement('tr');
      tr.className = 'hoja__nueva';
      tr.innerHTML = `<td>Tue 8:12 PM</td><td>${T.esc(d.nombreCompleto)}</td><td>${T.esc(d.servicioOriginal)}</td><td>${T.esc(d.codigoPostal)}</td><td class="hoja__estado">Texted in 0:0${segundosObjetivo}</td>`;
      this.$('.hoja tbody').prepend(tr);
      this.fila = tr;
      this.emitir('hoja', d);
      if (!(await this.dormir(1000, mio))) return false;

      // Alerta al dueño
      this.alerta(T.plantilla(this.a.alertaDueno, d));
      this.emitir('alerta', d);
      this.estadoPaso = 'listo';
      this.raiz.dataset.paso = 'listo';
      return true;
    }

    alerta(texto) {
      const a = this.$('.alerta-dueno');
      a.hidden = false;
      this.$('.alerta-dueno__texto').textContent = texto;
      const camp = a.querySelector('.campana');
      camp.classList.remove('sonando'); void camp.offsetWidth; camp.classList.add('sonando');
    }

    estadoFila(texto) { if (this.fila) this.fila.querySelector('.hoja__estado').textContent = texto; }

    async llamadaPerdida(mio = ++this.turno) {
      const d = this.datos();
      await this.tel.ejecutar([
        { tipo: 'reloj', minutos: 20 * 60 + 40, espera: 0 },
        { tipo: 'aviso', texto: `Missed call to ${this.negocio.nombre} · 8:40 PM`, espera: 300 },
        { tipo: 'escribiendo', ms: 700 },
        { tipo: 'negocio', texto: T.plantilla(this.a.llamadaPerdida, d), auto: true, espera: 0 }
      ], { limpiar: false });
      if (mio !== this.turno) return false;
      this.estadoFila('Missed call · texted back');
      this.alerta(`Missed call from ${d.telefono}. Text-back sent automatically.`);
      return true;
    }

    async seguimientos(mio = ++this.turno) {
      const d = this.datos();
      await this.tel.ejecutar([
        { tipo: 'reloj', minutos: 10 * 60, dia: 'jue', espera: 0 },
        { tipo: 'fecha', texto: 'Day 2 · no reply yet', espera: 300 },
        { tipo: 'negocio', texto: T.plantilla(this.a.seguimiento1, d), auto: true, espera: 400 },
        { tipo: 'evento', nombre: 'fila', espera: 0 }
      ], { limpiar: false });
      if (mio !== this.turno) return false;
      this.estadoFila('Follow-up 1 sent');
      if (!(await this.dormir(1400, mio))) return false;
      await this.tel.ejecutar([
        { tipo: 'cliente', texto: 'Hi! Sorry, busy week. Does Friday morning work?', espera: 300 }
      ], { limpiar: false });
      if (mio !== this.turno) return false;
      this.estadoFila('Replied · call back');
      this.alerta(`${d.nombreCompleto} replied: “Does Friday morning work?”`);
      return true;
    }

    async resena(mio = ++this.turno) {
      const d = this.datos();
      await this.tel.ejecutar([
        { tipo: 'reloj', minutos: 15 * 60 + 30, dia: 'vie', espera: 0 },
        { tipo: 'fecha', texto: 'Friday · job done and paid', espera: 300 },
        { tipo: 'negocio', texto: T.plantilla(this.a.resena, d), auto: true, espera: 400 }
      ], { limpiar: false });
      if (mio !== this.turno) return false;
      this.estadoFila('Paid · review requested');
      return true;
    }

    /** Scenes for auto mode: [{ sub, accion(mio) }]. */
    escenas() {
      return [
        { sub: 'A homeowner fills out the quote form at 8:12 PM.', accion: (m) => this.escribirFormulario(m) },
        { sub: 'Timbre texts them back in seconds, and emails them too. The lead lands in your sheet and you get an alert.', accion: (m) => this.enviar(m) },
        { sub: 'Pro: if you miss their call, they get a text right away.', accion: (m) => this.llamadaPerdida(m) },
        { sub: 'Pro: if they go quiet, a friendly follow-up goes out on its own.', accion: (m) => this.seguimientos(m) },
        { sub: 'Pro: when the job is paid, a review request goes out.', accion: (m) => this.resena(m) }
      ];
    }
  }

  window.TimbreLeads = TimbreLeads;
})();
