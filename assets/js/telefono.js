/* Timbre — celular de demostración con un chat genérico y propio.
   No imita ninguna app real: es un chat con la marca del negocio ficticio.
   Uso:
     const tel = new TimbreTelefono(contenedor, { negocio, idioma: 'es', moneda: 'COP' });
     tel.ejecutar(TimbreTelefono.guionLlegada(negocio, { minutos: 21 * 60 + 47 }));
*/
(function () {
  'use strict';
  const T = window.Timbre;

  const TEXTOS = {
    es: {
      demo: 'Demostración de Timbre · negocio ficticio',
      demoCorta: 'Demostración de Timbre',
      escribir: 'Escriba un mensaje',
      auto: 'Automático',
      rapida: 'Respuesta rápida',
      dueno: 'Dueño',
      catalogo: 'Catálogo',
      productos: (n) => `${n} productos en el catálogo`,
      horario: 'Horario de atención',
      hoy: 'hoy',
      ubicacion: 'Ubicación',
      abrirMapa: 'Abrir en el mapa',
      precios: 'Lista de precios',
      persona: 'Con gusto. Ya le avisé al equipo y le escriben por aquí en cuanto estén disponibles.',
      horarioRespuesta: (h) => `Nuestro horario es ${h}`,
      ubicacionRespuesta: (u) => `Estamos en ${u}.`,
      respondido: 'Respondido al instante, sin que nadie estuviera pendiente',
      hoyFecha: 'Hoy',
      acciones: 'Pregunte como cliente',
      botones: { catalogo: 'Ver catálogo', horario: 'Horario', precios: 'Precios', ubicacion: 'Ubicación', persona: 'Hablar con una persona' },
      preguntas: { catalogo: 'Hola, ¿me muestra el catálogo?', horario: '¿Qué horario tienen?', precios: '¿Me pasa los precios?', ubicacion: '¿Dónde quedan?', persona: 'Quiero hablar con una persona, por favor.' }
    },
    en: {
      demo: 'Timbre demo · fictional business',
      demoCorta: 'Timbre demo',
      escribir: 'Text message',
      auto: 'Automatic',
      rapida: 'Quick reply',
      dueno: 'Owner',
      catalogo: 'Services',
      productos: (n) => `${n} services listed`,
      horario: 'Business hours',
      hoy: 'today',
      ubicacion: 'Service area',
      abrirMapa: 'Open in maps',
      precios: 'Price list',
      persona: "Sure thing. I've let the team know and someone will reach out to you shortly.",
      horarioRespuesta: (h) => `Our hours: ${h}`,
      ubicacionRespuesta: (u) => `We're at ${u}.`,
      respondido: 'Answered instantly, with nobody watching the phone',
      hoyFecha: 'Today',
      acciones: 'Ask like a customer',
      botones: { catalogo: 'See services', horario: 'Hours', precios: 'Prices', ubicacion: 'Location', persona: 'Talk to a person' },
      preguntas: { catalogo: 'Hi, can I see your services?', horario: 'What are your hours?', precios: 'Can you send me prices?', ubicacion: 'Where are you located?', persona: "I'd like to talk to a person, please." }
    }
  };

  class TimbreTelefono {
    constructor(contenedor, opciones = {}) {
      this.el = contenedor;
      this.o = Object.assign({ idioma: 'es', moneda: null, velocidad: 1, campana: true, interactivo: false, anunciar: false, alEvento: null }, opciones);
      this.tx = TEXTOS[this.o.idioma] || TEXTOS.es;
      this.turno = 0;
      this.minutos = 21 * 60 + 47;
      this.dia = 'mar';
      this.render();
      if (this.o.negocio) this.setNegocio(this.o.negocio, opciones);
    }

    render() {
      const tx = this.tx;
      this.el.classList.add('telefono');
      this.el.innerHTML = `
        ${this.o.campana ? T.htmlCampana('telefono__campana') : ''}
        <div class="telefono__pantalla">
          <div class="telefono__estado" aria-hidden="true"><span class="reloj"></span><span class="senal"><i style="height:4px"></i><i style="height:6px"></i><i style="height:8px"></i><i style="height:10px"></i></span></div>
          <div class="chat__cabecera">
            <span class="chat__avatar" aria-hidden="true"></span>
            <div style="min-width:0">
              <div class="chat__nombre"></div>
              <div class="chat__estado-linea">${T.esc(tx.demo)}</div>
            </div>
          </div>
          <ol class="chat__log" role="log" aria-live="${this.o.anunciar ? 'polite' : 'off'}" aria-label="${this.o.idioma === 'en' ? 'Sample conversation' : 'Conversación de ejemplo'}"></ol>
          ${this.o.interactivo ? `<div class="chat__acciones" role="group" aria-label="${T.esc(tx.acciones)}"></div>` : ''}
          <div class="chat__entrada" aria-hidden="true"><span>${T.esc(tx.escribir)}</span><i></i></div>
        </div>`;
      this.log = this.el.querySelector('.chat__log');
      this.campana = this.el.querySelector('.telefono__campana');
      if (this.o.interactivo) this.pintarAcciones();
    }

    pintarAcciones() {
      const caja = this.el.querySelector('.chat__acciones');
      caja.innerHTML = Object.entries(this.tx.botones)
        .map(([k, v]) => `<button type="button" class="chat__accion" data-accion="${k}">${T.esc(v)}</button>`).join('');
      caja.addEventListener('click', (e) => {
        const b = e.target.closest('[data-accion]');
        if (b) this.preguntar(b.dataset.accion);
      });
    }

    async preguntar(tipo) {
      const botones = this.el.querySelectorAll('.chat__accion');
      botones.forEach((b) => { b.disabled = true; });
      await this.ejecutar([{ tipo: 'cliente', texto: this.tx.preguntas[tipo] }, ...TimbreTelefono.respuesta(this.negocio, tipo, this.o)], { limpiar: false });
      botones.forEach((b) => { b.disabled = false; });
    }

    setNegocio(negocio, { nombre, color } = {}) {
      this.negocio = Object.assign({}, negocio);
      if (nombre) this.negocio.nombre = nombre;
      if (color) this.negocio.acento = color;
      const acento = this.negocio.acento;
      this.el.style.setProperty('--acento', acento);
      this.el.style.setProperty('--sobre-acento', T.contraste(acento));
      this.el.querySelector('.chat__nombre').textContent = this.negocio.nombre;
      this.el.querySelector('.chat__estado-linea').textContent = nombre ? this.tx.demoCorta : this.tx.demo;
      this.el.querySelector('.chat__avatar').textContent = T.iniciales(this.negocio.nombre);
      this.el.setAttribute('aria-label', `Celular de demostración: chat con ${this.negocio.nombre}`);
    }

    setReloj(minutos, dia) {
      this.minutos = minutos;
      if (dia) this.dia = dia;
      this.el.querySelector('.reloj').textContent = T.hora(Math.floor(minutos / 60), minutos % 60, this.o.idioma);
    }

    limpiar() { this.log.innerHTML = ''; }
    detener() { this.turno++; this.reanudar(); }

    pausar() { if (!this.pausa) this.pausa = new Promise((r) => { this.soltar = r; }); }
    reanudar() { if (this.pausa) { this.soltar(); this.pausa = null; } }
    async esperarPausa() { while (this.pausa) await this.pausa; }

    vars() {
      return { negocio: this.negocio.nombre, horario: this.negocio.horarioTexto };
    }

    horaTexto() { return T.hora(Math.floor(this.minutos / 60), this.minutos % 60, this.o.idioma); }

    agregar(html, clase) {
      const li = document.createElement('li');
      li.className = clase;
      li.innerHTML = html;
      this.log.appendChild(li);
      this.log.scrollTop = this.log.scrollHeight;
      return li;
    }

    pie(extra = '') { return `<div class="msj__pie">${extra}<span>${T.esc(this.horaTexto())}</span></div>`; }

    /* ---- Piezas del chat ---- */
    cliente(texto) {
      this.agregar(`<p>${T.esc(texto)}</p>${this.pie()}`, 'msj msj--cliente');
      if (this.campana) T.sonar(this.campana);
      this.emitir('mensaje', { texto });
    }

    negocioDice(texto, { auto = false, rapida = null, dueno = false } = {}) {
      const tx = this.tx;
      let marca = '';
      if (auto) marca = `<span class="msj__auto">${tx.auto}</span>`;
      if (rapida) marca = `<span class="msj__rapida">${tx.rapida} /${T.esc(rapida)}</span>`;
      const clase = dueno ? 'msj msj--dueno' : 'msj msj--negocio';
      this.agregar(`<p>${T.esc(T.plantilla(texto, this.vars()))}</p>${this.pie(marca)}`, clase);
      this.emitir('respuesta', { texto, auto, rapida });
    }

    catalogo(n = 4) {
      const neg = this.negocio;
      const tx = this.tx;
      const items = neg.catalogo.slice(0, n).map((p) => `
        <div class="catalogo-mini__item">
          <div class="catalogo-mini__foto" aria-hidden="true">${T.esc(p.nombre.trim()[0].toUpperCase())}</div>
          <div class="catalogo-mini__texto"><b>${T.esc(p.nombre)}</b><span class="catalogo-mini__precio">${T.esc(this.precio(p))}</span></div>
        </div>`).join('');
      this.agregar(`<div class="msj__titulo">${tx.catalogo} · ${T.esc(neg.nombre)}</div>
        <div class="catalogo-mini">${items}</div>
        <div class="msj__boton">${T.esc(tx.productos(neg.catalogo.length))}</div>${this.pie(`<span class="msj__auto">${tx.auto}</span>`)}`, 'msj msj--negocio msj--tarjeta');
    }

    precio(p) {
      const moneda = this.o.moneda || this.negocio.moneda;
      return T.dinero(T.precioDe(p, moneda, this.negocio.moneda), moneda, this.o.idioma);
    }

    horario() {
      const filas = T.horarioFilas(this.negocio, this.o.idioma)
        .map((f) => { const hoy = f.dias.includes(this.dia); return `<tr class="${hoy ? 'hoy' : ''}"><td>${T.esc(f.nombre)}${hoy ? ` <small>(${this.tx.hoy})</small>` : ''}</td><td>${T.esc(f.texto)}</td></tr>`; }).join('');
      this.agregar(`<div class="msj__titulo">${this.tx.horario}</div><table class="horario-mini"><tbody>${filas}</tbody></table>${this.pie(`<span class="msj__auto">${this.tx.auto}</span>`)}`, 'msj msj--negocio msj--tarjeta');
    }

    ubicacion() {
      const u = this.negocio.ubicacion || {};
      this.agregar(`<div class="msj__titulo">${this.tx.ubicacion}</div><div class="mapa-mini" aria-hidden="true"><span></span></div>
        <p><b>${T.esc(u.direccion || '')}</b><br>${T.esc([u.barrio, u.ciudad].filter(Boolean).join(', '))}${u.referencia ? `<br><small>${T.esc(u.referencia)}</small>` : ''}</p>
        <div class="msj__boton">${this.tx.abrirMapa}</div>${this.pie(`<span class="msj__auto">${this.tx.auto}</span>`)}`, 'msj msj--negocio msj--tarjeta');
    }

    precios() {
      const lista = this.negocio.catalogo.map((p) => `${p.nombre}: ${this.precio(p)}`).join('\n');
      this.agregar(`<div class="msj__titulo">${this.tx.precios}</div><p style="white-space:pre-line">${T.esc(lista)}</p>${this.pie(`<span class="msj__auto">${this.tx.auto}</span>`)}`, 'msj msj--negocio msj--tarjeta');
    }

    aviso(texto) { this.agregar(T.esc(texto), 'chat__aviso'); }
    fecha(texto) { this.agregar(T.esc(texto || this.tx.hoyFecha), 'chat__fecha'); }

    emitir(nombre, datos) { if (this.o.alEvento) this.o.alEvento(nombre, Object.assign({ negocio: this.negocio, hora: this.horaTexto() }, datos)); }

    /* ---- Reproductor de guiones ---- */
    async ejecutar(guion, { limpiar = true } = {}) {
      const mio = ++this.turno;
      if (limpiar) this.limpiar();
      const rapido = T.reducido();
      for (const paso of guion) {
        await this.esperarPausa();
        if (mio !== this.turno) return false;
        const espera = (paso.espera != null ? paso.espera : paso.tipo === 'cliente' ? 900 : 500) / (this.o.velocidad || 1);
        if (paso.tipo === 'escribiendo') {
          if (rapido) continue;
          const li = this.agregar('<i></i><i></i><i></i>', 'escribiendo');
          li.setAttribute('aria-hidden', 'true');
          await T.esperar((paso.ms || 900) / (this.o.velocidad || 1));
          li.remove();
          continue;
        }
        if (!rapido) await T.esperar(espera);
        if (mio !== this.turno) return false;
        switch (paso.tipo) {
          case 'cliente': this.cliente(paso.texto); break;
          case 'negocio': this.negocioDice(paso.texto, paso); break;
          case 'catalogo': this.catalogo(paso.n); break;
          case 'horario': this.horario(); break;
          case 'ubicacion': this.ubicacion(); break;
          case 'precios': this.precios(); break;
          case 'aviso': this.aviso(paso.texto); break;
          case 'fecha': this.fecha(paso.texto); break;
          case 'reloj': this.setReloj(paso.minutos, paso.dia); break;
          case 'evento': this.emitir(paso.nombre, paso.datos || {}); break;
          case 'pausa': break;
        }
      }
      return mio === this.turno;
    }

    /* ---- Guiones listos ---- */

    /** Un cliente escribe a la hora dada y recibe la respuesta automática con catálogo y horario. */
    static guionLlegada(negocio, { minutos = 21 * 60 + 47, dia = 'mar', idioma = 'es', moneda = null } = {}) {
      const tx = TEXTOS[idioma] || TEXTOS.es;
      const abierto = T.abierto(negocio, dia, minutos);
      return [
        { tipo: 'reloj', minutos, dia, espera: 0 },
        { tipo: 'fecha', espera: 0 },
        { tipo: 'cliente', texto: negocio.conversacion[0].cliente, espera: 500 },
        { tipo: 'escribiendo', ms: 700 },
        { tipo: 'negocio', texto: abierto ? negocio.mensajes.bienvenida : negocio.mensajes.fueraDeHorario, auto: true, espera: 0 },
        { tipo: 'catalogo', espera: 450 },
        { tipo: 'horario', espera: 450 },
        { tipo: 'aviso', texto: tx.respondido, espera: 500 }
      ];
    }

    /** Pasos de respuesta para un tipo de pregunta (catalogo, horario, precios, ubicacion, persona, faq:N). */
    static respuesta(negocio, tipo, { idioma = 'es', moneda = null } = {}) {
      const tx = TEXTOS[idioma] || TEXTOS.es;
      const u = negocio.ubicacion || {};
      const faq = /^faq:(\d+)$/.exec(tipo);
      const base = [{ tipo: 'escribiendo', ms: 600 }];
      if (faq) return base.concat({ tipo: 'negocio', texto: negocio.faq[+faq[1]].respuesta, auto: true, espera: 0 });
      switch (tipo) {
        case 'catalogo': return base.concat({ tipo: 'catalogo', espera: 0 });
        case 'horario': return base.concat({ tipo: 'negocio', texto: tx.horarioRespuesta(negocio.horarioTexto), auto: true, espera: 0 }, { tipo: 'horario', espera: 300 });
        case 'precios': return base.concat({ tipo: 'precios', espera: 0 });
        case 'ubicacion': return base.concat({ tipo: 'negocio', texto: tx.ubicacionRespuesta([u.direccion, u.barrio, u.ciudad].filter(Boolean).join(', ')), auto: true, espera: 0 }, { tipo: 'ubicacion', espera: 300 });
        case 'persona': return base.concat({ tipo: 'negocio', texto: tx.persona, auto: true, espera: 0 }, { tipo: 'evento', nombre: 'persona', espera: 0 });
        default: return [];
      }
    }
  }

  TimbreTelefono.TEXTOS = TEXTOS;
  window.TimbreTelefono = TimbreTelefono;
})();
