/* Timbre — efectos y música del reel con voz, sintetizados desde cero (sin música de terceros).
   Devuelve dos pistas estéreo a 48 kHz:
   - «efectos»: timbre, avisos, toques y transiciones, en los momentos de eventos.js.
   - «musica»: base suave a 96 pulsaciones por minuto (piano eléctrico, bajo y percusión ligera)
     que arranca de lleno cuando suena el timbre. La mezcla con la voz (y la bajada de volumen
     cuando habla) la hace scripts/video.js con ffmpeg. */
'use strict';

const eventos = require('./eventos');

const SR = 48000;

function pista(duracion) {
  const n = Math.ceil(duracion * SR);
  return { L: new Float32Array(n), R: new Float32Array(n) };
}

/* Generador de ruido con semilla: el audio sale idéntico en cada render. */
function azar(semilla) {
  let a = semilla >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 * 2 - 1;
  };
}
const ruido = azar(1581);

/* Suma un sonido mono en la pista, con volumen y paneo (−1 izquierda, 1 derecha). */
function poner(p, t0, muestras, vol = 1, pan = 0) {
  const i0 = Math.round(t0 * SR);
  const gl = Math.cos((pan + 1) * Math.PI / 4) * vol;
  const gr = Math.sin((pan + 1) * Math.PI / 4) * vol;
  for (let i = 0; i < muestras.length; i++) {
    const j = i0 + i;
    if (j < 0 || j >= p.L.length) continue;
    p.L[j] += muestras[i] * gl;
    p.R[j] += muestras[i] * gr;
  }
}

function crear(seg, fn) {
  const n = Math.round(seg * SR);
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) m[i] = fn(i / SR, i);
  return m;
}

/* Filtro de estado variable (pasa banda, bajos o altos) con frecuencia que puede cambiar. */
function filtro(m, frecuencia, { q = 0.8, tipo = 'banda' } = {}) {
  let bajo = 0, banda = 0;
  const out = new Float32Array(m.length);
  for (let i = 0; i < m.length; i++) {
    const fc = typeof frecuencia === 'function' ? frecuencia(i / SR) : frecuencia;
    const f = 2 * Math.sin(Math.PI * Math.min(fc, SR / 6) / SR);
    bajo += f * banda;
    const alto = m[i] - bajo - q * banda;
    banda += f * alto;
    out[i] = tipo === 'banda' ? banda : tipo === 'bajo' ? bajo : alto;
  }
  return out;
}

/* Reverberación sencilla (filtros peine + pasa todo) para darle aire. */
function reverb(p, { mezcla = 0.25, retro = 0.82, amort = 0.25 } = {}) {
  const peines = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => Math.round(d * SR / 44100));
  const pasa = [556, 441, 341].map((d) => Math.round(d * SR / 44100));
  for (const [canal, desfase] of [['L', 0], ['R', 23]]) {
    const x = p[canal];
    const y = new Float32Array(x.length);
    for (const d0 of peines) {
      const d = d0 + desfase;
      const buf = new Float32Array(d);
      let idx = 0, filt = 0;
      for (let i = 0; i < x.length; i++) {
        const salida = buf[idx];
        filt = salida * (1 - amort) + filt * amort;
        buf[idx] = x[i] * 0.015 + filt * retro;
        y[i] += salida;
        idx = (idx + 1) % d;
      }
    }
    for (const d0 of pasa) {
      const d = d0 + desfase;
      const buf = new Float32Array(d);
      let idx = 0;
      for (let i = 0; i < y.length; i++) {
        const b = buf[idx];
        const v = -y[i] + b;
        buf[idx] = y[i] + b * 0.5;
        y[i] = v;
        idx = (idx + 1) % d;
      }
    }
    for (let i = 0; i < x.length; i++) x[i] += y[i] * mezcla * 4;
  }
}

function normalizar(p, pico) {
  let max = 0;
  for (const c of [p.L, p.R]) for (const v of c) max = Math.max(max, Math.abs(v));
  const g = max ? pico / max : 1;
  for (const c of [p.L, p.R]) for (let i = 0; i < c.length; i++) c[i] *= g;
}

/* ---------- Efectos ---------- */

/* Campanita de notificación: dos notas brillantes. */
function aviso(vol = 1) {
  const nota = (f) => crear(1.2, (t) => Math.min(1, t / 0.003) * Math.exp(-t * 5) *
    (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 6)));
  const a = nota(1568), b = nota(2093);
  const sep = Math.round(0.09 * SR);
  const m = new Float32Array(a.length + sep);
  a.forEach((v, i) => { m[i] += v * 0.8; });
  b.forEach((v, i) => { m[i + sep] += v; });
  return m.map((v) => v * 0.3 * vol);
}

/* Timbre de puerta «din-don»: la firma sonora de la marca. */
function dinDon(vol = 1) {
  const golpe = (f) => crear(2.4, (t) => {
    const parciales = [[1, 1, 1.6], [2, 0.45, 2.4], [3, 0.22, 3.4], [4.2, 0.12, 5], [5.4, 0.06, 7]];
    let s = 0;
    for (const [r, a, d] of parciales) s += a * Math.sin(2 * Math.PI * f * r * t) * Math.exp(-t * d);
    return Math.min(1, t / 0.004) * s;
  });
  const din = golpe(698.46), don = golpe(523.25); /* Fa y Do: encajan con la tonalidad de la música */
  const sep = Math.round(0.36 * SR);
  const m = new Float32Array(din.length + sep);
  din.forEach((v, i) => { m[i] += v; });
  don.forEach((v, i) => { m[i + sep] += v * 0.95; });
  return m.map((v) => v * 0.28 * vol);
}

function toque(vol = 1) {
  return crear(0.06, (t) => (Math.sin(2 * Math.PI * 1700 * t) * Math.exp(-t * 90) * 0.6 + ruido() * Math.exp(-t * 600) * 0.5) * 0.5 * vol);
}

function burbuja(tono = 1, vol = 1) {
  return crear(0.12, (t) => Math.sin(2 * Math.PI * (420 + 520 * Math.exp(-t * 45)) * tono * t) * Math.min(1, t / 0.002) * Math.exp(-t * 32) * 0.45 * vol);
}

function tic(vol = 1) {
  return filtro(crear(0.03, (t) => ruido() * Math.exp(-t * 260)), 3200, { q: 0.25 }).map((v) => v * 0.9 * vol);
}

function barrido(seg = 0.5, { desde = 500, hasta = 4000, vol = 1 } = {}) {
  return filtro(crear(seg, () => ruido()), (t) => desde * Math.pow(hasta / desde, t / seg), { q: 1.1 })
    .map((v, i) => v * Math.pow(Math.sin(Math.PI * Math.min(1, (i / SR) / seg)), 2) * 0.55 * vol);
}

function golpeGrave(vol = 1) {
  return crear(0.8, (t) => Math.sin(2 * Math.PI * (42 + 70 * Math.exp(-t * 18)) * t) * Math.exp(-t * 5) * 0.8 * vol);
}

function sello(vol = 1) {
  const cuerpo = golpeGrave(0.8);
  const choque = filtro(crear(0.15, (t) => ruido() * Math.exp(-t * 40)), 1400, { q: 0.7 });
  choque.forEach((v, i) => { cuerpo[i] += v * 0.6; });
  return cuerpo.map((v) => v * vol);
}

function efectos(tiempos) {
  const e = eventos(tiempos);
  const p = pista(e.duracion);
  const ambiente = pista(e.duracion);

  poner(ambiente, e.aviso, aviso(1.0));
  [e.msj1, e.msj2, e.msj3].forEach((t, i) => poner(p, t, burbuja(0.8 + i * 0.05, 0.55), 1, -0.2));
  poner(p, e.nadie, golpeGrave(0.45));

  poner(p, e.giro - 0.45, barrido(0.6, { desde: 300, hasta: 5000, vol: 0.6 }));
  poner(ambiente, e.timbre, dinDon(1.1));
  poner(p, e.timbre, golpeGrave(0.5));

  /* Giros del teléfono y entradas o salidas */
  [e.problema - 0.25, e.giroTel, e.citas, e.giroCita].forEach((t) => poner(p, t, barrido(0.45, { desde: 900, hasta: 3500, vol: 0.35 })));
  poner(p, e.pedido - 0.2, barrido(0.5, { desde: 500, hasta: 2500, vol: 0.4 }));
  poner(p, e.precio - 0.2, barrido(0.5, { desde: 2500, hasta: 500, vol: 0.4 }));

  [e.toque1, e.toque2, e.toque3, e.enviar, e.toqueServicio, e.toqueHora, e.toqueEnviarCita, e.toqueConfirmar]
    .forEach((t) => poner(p, t, toque(0.9)));
  [e.toque1, e.toque2, e.toque3].forEach((t, i) => poner(p, t + 0.02, burbuja(1.3 + i * 0.15, 0.45), 1, 0.3));

  poner(ambiente, e.llegaPedido, aviso(0.75));
  poner(p, e.total, burbuja(1.7, 0.5));
  poner(p, e.comisiones, sello(0.75));
  poner(p, e.respuesta, burbuja(1.45, 0.7), 1, 0.2);
  poner(ambiente, e.llegaCita, aviso(0.65));
  poner(p, e.confirmada, burbuja(1.55, 0.7), 1, 0.2);

  for (let k = 0; k < 12; k++) poner(p, e.precio + 0.1 + 1.0 * Math.pow(k / 12, 0.7), tic(0.35));
  [e.mensual, e.lista1, e.lista2, e.saldo].forEach((t, i) => poner(p, t, burbuja(1 + i * 0.1, 0.5)));

  poner(ambiente, e.llamado + 0.05, dinDon(1.1));

  reverb(ambiente, { mezcla: 0.3 });
  for (const c of ['L', 'R']) for (let i = 0; i < p[c].length; i++) p[c][i] += ambiente[c][i];
  normalizar(p, 0.9);
  return p;
}

/* ---------- Música ---------- */

const nota = (n) => 440 * Math.pow(2, (n - 69) / 12);
const PULSO = 60 / 96;
/* Fmaj7 – Am7 – Dm7 – Bbmaj7, un compás cada uno, con las voces cerca para que suene suave. */
const ACORDES = [
  { bajo: 41, voces: [53, 57, 60, 64] },
  { bajo: 45, voces: [55, 57, 60, 64] },
  { bajo: 38, voces: [53, 57, 60, 62] },
  { bajo: 46, voces: [53, 57, 58, 62] }
];

/* Piano eléctrico por síntesis FM: ataque redondo, brillo que se apaga y un leve trémolo. */
function piano(f, seg, vol = 1) {
  return crear(seg + 0.35, (t) => {
    const indice = 1.6 * Math.exp(-t * 3.2) + 0.25;
    const tono = Math.sin(2 * Math.PI * f * t + indice * Math.sin(2 * Math.PI * f * t));
    const campanita = 0.12 * Math.sin(2 * Math.PI * f * 7 * t) * Math.exp(-t * 14);
    const env = Math.min(1, t / 0.006) * Math.exp(-t * 0.9) * (t > seg ? Math.max(0, 1 - (t - seg) / 0.35) : 1);
    return (tono + campanita) * env * (1 + 0.1 * Math.sin(2 * Math.PI * 4.5 * t)) * 0.16 * vol;
  });
}
function bajo(f, seg, vol = 1) {
  return crear(seg + 0.08, (t) => {
    const env = Math.min(1, t / 0.008) * Math.exp(-t * 2.2) * (t > seg ? Math.max(0, 1 - (t - seg) / 0.08) : 1);
    return (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 6)) * env * 0.5 * vol;
  });
}
function bombo(vol = 1) {
  return crear(0.4, (t) => Math.sin(2 * Math.PI * (50 + 60 * Math.exp(-t * 30)) * t) * Math.exp(-t * 8) * 0.8 * vol);
}
function chasquido(vol = 1) {
  const m = filtro(crear(0.16, (t) => ruido() * (Math.exp(-t * 60) + 0.3 * Math.exp(-t * 18))), 1900, { q: 0.9 });
  return m.map((v) => v * 0.5 * vol);
}
function maraca(vol = 1) {
  return filtro(crear(0.05, (t) => ruido() * Math.exp(-t * 70)), 8000, { tipo: 'alto', q: 0.7 }).map((v) => v * 0.22 * vol);
}

function musica(tiempos) {
  const e = eventos(tiempos);
  const p = pista(e.duracion);
  const inicio = e.timbre; /* el ritmo completo cae justo con el timbre */
  const finRitmo = e.duracion - 1.6;
  const primerPulso = inicio - Math.ceil(inicio / PULSO) * PULSO;
  for (let k = 0; ; k++) {
    const t = primerPulso + k * PULSO;
    if (t >= finRitmo) break;
    const relativo = Math.round((t - inicio) / PULSO);
    const compas = Math.floor(relativo / 4);
    const tiempo = ((relativo % 4) + 4) % 4;
    const acorde = ACORDES[((compas % 4) + 4) % 4];
    const lleno = t >= inicio;
    /* Antes del timbre: solo piano, más bajito, y casi nada mientras «nadie le responde». */
    const calma = lleno ? 1 : (t >= e.nadie - 0.3 ? 0.35 : 0.7);
    if (t < 0) continue;
    if (tiempo === 0) acorde.voces.forEach((n, i) => poner(p, t + i * 0.012, piano(nota(n), PULSO * 2.6, calma), 1, -0.3 + i * 0.2));
    if (tiempo === 2 && lleno) acorde.voces.slice(1).forEach((n, i) => poner(p, t + PULSO / 2 + i * 0.01, piano(nota(n), PULSO * 1.2, 0.55), 1, 0.25 - i * 0.2));
    if (!lleno) continue;
    if (tiempo === 0) poner(p, t, bajo(nota(acorde.bajo), PULSO * 0.9));
    if (tiempo === 1) poner(p, t + PULSO / 2, bajo(nota(acorde.bajo), PULSO * 0.45, 0.8));
    if (tiempo === 3) poner(p, t, bajo(nota(acorde.bajo + 12), PULSO * 0.45, 0.7));
    if (tiempo === 0 || tiempo === 2) poner(p, t, bombo(tiempo === 0 ? 1 : 0.8));
    if (tiempo === 1 || tiempo === 3) poner(p, t, chasquido(), 1, 0.1);
    poner(p, t + PULSO / 2, maraca(1), 1, 0.4);
    poner(p, t, maraca(0.5), 1, 0.4);
  }
  /* Subida suave antes del timbre y acorde final que se apaga. */
  const subida = filtro(crear(1.2, () => ruido()), (t) => 400 * Math.pow(12, t / 1.2), { q: 0.7 }).map((v, i) => v * Math.pow(i / (1.2 * SR), 2) * 0.25);
  poner(p, inicio - 1.2, subida);
  const final = ACORDES[0];
  final.voces.concat([65]).forEach((n, i) => poner(p, finRitmo + i * 0.02, piano(nota(n), 1.2, 0.9), 1, -0.3 + i * 0.15));
  poner(p, finRitmo, bajo(nota(final.bajo), 1.2));

  reverb(p, { mezcla: 0.18 });
  for (let i = Math.round((e.duracion - 0.4) * SR); i < p.L.length; i++) {
    const g = Math.max(0, (e.duracion - i / SR) / 0.4);
    p.L[i] *= g; p.R[i] *= g;
  }
  normalizar(p, 0.9);
  return p;
}

module.exports = { SR, efectos, musica };
