/* Timbre — momentos clave del reel, calculados desde video/reel/tiempos.json (la voz).
   Lo usan la animación (reel.html) y el sonido (sonido.js), así que imagen, efectos y voz
   quedan sincronizados aunque cambie el guion. Todos los valores están en segundos. */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.TimbreEventos = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  return function eventos(tiempos) {
    const L = {};
    tiempos.lineas.forEach((l) => { L[l.escena] = l; });
    const s = (escena, i) => L[escena].subtitulos[i].inicio;
    const e = {
      duracion: tiempos.duracion,
      aviso: 0.05,
      problema: L.problema.inicio,
      msj1: s('problema', 1) - 0.05,
      msj2: s('problema', 1) + 0.55,
      msj3: s('problema', 2) - 0.15,
      nadie: s('problema', 2),
      giro: L.giro.inicio - 0.2,
      timbre: L.giro.inicio,
      pedido: L.pedido.inicio - 0.25,
      toque1: s('pedido', 0) + 0.45,
      toque2: s('pedido', 0) + 0.9,
      toque3: s('pedido', 0) + 1.3,
      enviar: s('pedido', 1) + 0.45,
      giroTel: s('pedido', 2) - 0.35,
      llegaPedido: s('pedido', 2),
      total: s('pedido', 4),
      comisiones: L.comisiones.inicio,
      escribiendo: s('automatico', 0) + 0.15,
      respuesta: s('automatico', 1),
      citas: L.citas.inicio - 0.2,
      toqueServicio: s('citas', 1) + 0.25,
      toqueHora: s('citas', 1) + 1.15,
      toqueEnviarCita: s('citas', 1) + 1.95,
      giroCita: s('citas', 2) - 0.3,
      llegaCita: s('citas', 2),
      toqueConfirmar: s('citas', 3) - 0.3,
      confirmada: s('citas', 3),
      llamado: L.llamado.inicio - 0.1,
      numero: L.llamado.fin - 0.4,
      nota: L.llamado.fin + 0.3
    };
    return e;
  };
});
