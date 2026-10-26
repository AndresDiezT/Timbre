/* Timbre — mini página de un negocio ficticio para la demo de Pedidos y Reservas.
   El visitante arma un pedido (o pide una cita) y el resultado llega al celular
   de demostración como un solo mensaje ordenado. No envía nada a ningún lado.
   Uso:
     new TimbreTienda(contenedor, { negocio, modo: 'pedidos' | 'reservas', alEnviar(datos) }) */
(function () {
  'use strict';
  const T = window.Timbre;

  class TimbreTienda {
    constructor(el, opciones) {
      this.el = el;
      this.o = Object.assign({ modo: 'pedidos', alEnviar: null }, opciones);
      this.n = this.o.negocio;
      this.cantidades = {};
      this.el.classList.add('tienda');
      this.el.style.setProperty('--acento', this.n.acento);
      this.el.style.setProperty('--sobre-acento', T.contraste(this.n.acento));
      this.o.modo === 'reservas' ? this.pintarReservas() : this.pintarPedidos();
    }

    cabecera(titulo) {
      return `<div class="tienda__barra"><span class="tienda__logo" aria-hidden="true">${T.esc(T.iniciales(this.n.nombre))}</span><span class="tienda__nombre">${T.esc(this.n.nombre)}</span><span class="tienda__demo">Demostración</span></div>
        <p class="tienda__titulo">${T.esc(titulo)}</p>`;
    }

    /* ---------- Pedidos ---------- */
    pintarPedidos() {
      const productos = this.n.catalogo.filter((p) => p.precio > 0).slice(0, 4);
      this.productos = productos;
      const pagos = ['Nequi', 'Efectivo', 'Bre-B'];
      this.el.innerHTML = `${this.cabecera('Haga su pedido')}
        <ul class="tienda__lista">${productos.map((p, i) => `
          <li class="tienda__item">
            <span class="tienda__foto" aria-hidden="true">${T.esc(p.nombre.trim()[0].toUpperCase())}</span>
            <span class="tienda__info"><b>${T.esc(p.nombre)}</b><span>${T.esc(T.dinero(p.precio, 'COP'))}</span></span>
            <span class="tienda__cantidad" role="group" aria-label="Cantidad de ${T.esc(p.nombre)}">
              <button type="button" data-menos="${i}" aria-label="Quitar uno de ${T.esc(p.nombre)}">−</button>
              <output data-cant="${i}" aria-live="polite">0</output>
              <button type="button" data-mas="${i}" aria-label="Agregar uno de ${T.esc(p.nombre)}">+</button>
            </span>
          </li>`).join('')}
        </ul>
        <div class="tienda__fila">
          <label>Entrega<select data-campo="entrega"><option>Domicilio</option><option>Recoger en el local</option></select></label>
          <label>Pago<select data-campo="pago">${pagos.map((x) => `<option>${x}</option>`).join('')}</select></label>
        </div>
        <label class="tienda__nombre-campo">Su nombre<input data-campo="nombre" value="Laura" maxlength="30" autocomplete="off"></label>
        <p class="tienda__total">Total: <b data-total>$0</b></p>
        <p class="tienda__error" role="alert" hidden>Agregue al menos un producto.</p>
        <button type="button" class="tienda__enviar" data-enviar>Enviar pedido por WhatsApp</button>`;
      // Pedido inicial para que se vea lleno desde el principio.
      this.cantidades = { 0: 1, 1: 2 };
      this.el.addEventListener('click', (e) => {
        const mas = e.target.closest('[data-mas]');
        const menos = e.target.closest('[data-menos]');
        if (mas) this.cambiar(+mas.dataset.mas, 1);
        if (menos) this.cambiar(+menos.dataset.menos, -1);
        if (e.target.closest('[data-enviar]')) this.enviarPedido();
      });
      this.actualizar();
    }

    cambiar(i, d) {
      this.cantidades[i] = Math.max(0, Math.min(20, (this.cantidades[i] || 0) + d));
      this.actualizar();
    }

    actualizar() {
      let total = 0;
      this.productos.forEach((p, i) => {
        const c = this.cantidades[i] || 0;
        total += c * p.precio;
        this.el.querySelector(`[data-cant="${i}"]`).textContent = c;
      });
      this.total = total;
      this.el.querySelector('[data-total]').textContent = T.dinero(total, 'COP');
      this.el.querySelector('.tienda__error').hidden = true;
    }

    campo(nombre) { return this.el.querySelector(`[data-campo="${nombre}"]`).value.trim(); }

    enviarPedido() {
      const items = this.productos.map((p, i) => ({ nombre: p.nombre, precio: p.precio, cantidad: this.cantidades[i] || 0 })).filter((x) => x.cantidad > 0);
      if (!items.length) { this.el.querySelector('.tienda__error').hidden = false; return; }
      if (this.o.alEnviar) this.o.alEnviar({ items, total: this.total, entrega: this.campo('entrega'), pago: this.campo('pago'), nombre: this.campo('nombre') || 'Cliente' });
    }

    /* ---------- Reservas ---------- */
    pintarReservas() {
      const servicios = this.n.catalogo.slice(0, 5);
      const dias = this.proximosDias(6);
      this.dias = dias;
      this.el.innerHTML = `${this.cabecera('Reserve su cita')}
        <label>Servicio<select data-campo="servicio">${servicios.map((p) => `<option>${T.esc(p.nombre)}</option>`).join('')}</select></label>
        <div class="tienda__fila">
          <label>Día<select data-campo="dia">${dias.map((d, i) => `<option value="${i}">${T.esc(d.texto)}</option>`).join('')}</select></label>
          <label>Hora<select data-campo="hora"></select></label>
        </div>
        <label class="tienda__nombre-campo">Su nombre<input data-campo="nombre" value="Julián" maxlength="30" autocomplete="off"></label>
        <p class="tienda__nota">Solo aparecen las horas en que el negocio atiende.</p>
        <button type="button" class="tienda__enviar" data-enviar>Enviar solicitud por WhatsApp</button>`;
      this.el.querySelector('[data-campo="dia"]').addEventListener('change', () => this.pintarHoras());
      this.el.addEventListener('click', (e) => { if (e.target.closest('[data-enviar]')) this.enviarReserva(); });
      this.pintarHoras();
    }

    proximosDias(cuantos) {
      const salida = [];
      const hoy = new Date();
      for (let k = 1; salida.length < cuantos && k < 21; k++) {
        const f = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + k);
        const clave = T.DIAS[f.getDay()];
        if (!this.n.horario[clave]) continue;
        const nombre = T.NOMBRE_DIA.es[clave];
        const texto = k === 1 ? `Mañana, ${nombre.toLowerCase()}` : `${nombre} ${f.getDate()}`;
        salida.push({ clave, texto });
      }
      return salida;
    }

    pintarHoras() {
      const d = this.dias[+this.campo('dia')] || this.dias[0];
      const [a, b] = this.n.horario[d.clave];
      const aMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      const horas = [];
      for (let m = aMin(a); m + 60 <= aMin(b); m += 60) horas.push(T.hora(Math.floor(m / 60), m % 60));
      this.el.querySelector('[data-campo="hora"]').innerHTML = horas.map((h) => `<option>${h}</option>`).join('');
    }

    enviarReserva() {
      const d = this.dias[+this.campo('dia')] || this.dias[0];
      if (this.o.alEnviar) this.o.alEnviar({ servicio: this.campo('servicio'), dia: d.texto, hora: this.campo('hora'), nombre: this.campo('nombre') || 'Cliente' });
    }
  }

  window.TimbreTienda = TimbreTienda;
})();
