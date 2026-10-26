/* Timbre — sonido del reel, sintetizado desde cero (sin música con derechos de autor).
   Devuelve dos pistas estéreo a 48 kHz: «efectos» (timbre, toques, transiciones) y «musica»
   (base a 120 pulsaciones por minuto que arranca cuando suena el timbre).
   Los tiempos coinciden con video/reel/reel.html. */
'use strict';

const SR = 48000;
const DURACION = 37.5;

function pista() {
  const n = Math.ceil(DURACION * SR);
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

/* ---------- Efectos ---------- */

/* Campanita de notificación: dos notas brillantes. */
function aviso(vol = 1) {
  const nota = (f) => crear(1.2, (t) => {
    const env = Math.min(1, t / 0.003) * Math.exp(-t * 5);
    return env * (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 6) + 0.15 * Math.sin(2 * Math.PI * f * 3.02 * t) * Math.exp(-t * 9));
  });
  const a = nota(1568), b = nota(2093);
  const m = new Float32Array(a.length + Math.round(0.09 * SR));
  a.forEach((v, i) => { m[i] += v * 0.8; });
  b.forEach((v, i) => { m[i + Math.round(0.09 * SR)] += v; });
  return m.map((v) => v * 0.3 * vol);
}

/* Timbre de puerta «din-don»: la firma sonora de la marca. */
function dinDon(vol = 1) {
  const golpe = (f) => crear(2.4, (t) => {
    const env = Math.min(1, t / 0.004);
    const parciales = [[1, 1, 1.6], [2, 0.45, 2.4], [3, 0.22, 3.4], [4.2, 0.12, 5], [5.4, 0.06, 7]];
    let s = 0;
    for (const [r, a, d] of parciales) s += a * Math.sin(2 * Math.PI * f * r * t) * Math.exp(-t * d);
    return env * s;
  });
  const din = golpe(659.25), don = golpe(523.25);
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
  return crear(0.12, (t) => {
    const f = (420 + 520 * Math.exp(-t * 45)) * tono;
    return Math.sin(2 * Math.PI * f * t) * Math.min(1, t / 0.002) * Math.exp(-t * 32) * 0.45 * vol;
  });
}

function tic(alto = true, vol = 1) {
  const m = crear(0.03, (t) => ruido() * Math.exp(-t * 260));
  return filtro(m, alto ? 3200 : 2200, { q: 0.25 }).map((v) => v * 0.9 * vol);
}

function barrido(seg = 0.5, { desde = 500, hasta = 4000, vol = 1 } = {}) {
  const m = crear(seg, () => ruido());
  return filtro(m, (t) => desde * Math.pow(hasta / desde, t / seg), { q: 1.1 })
    .map((v, i) => v * Math.pow(Math.sin(Math.PI * Math.min(1, (i / SR) / seg)), 2) * 0.55 * vol);
}

function subida(seg = 0.9, vol = 1) {
  const m = crear(seg, () => ruido());
  return filtro(m, (t) => 300 * Math.pow(20, t / seg), { q: 0.6 })
    .map((v, i) => v * Math.pow((i / SR) / seg, 2.2) * 0.5 * vol);
}

function golpeGrave(vol = 1) {
  return crear(0.8, (t) => {
    const f = 42 + 70 * Math.exp(-t * 18);
    return Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 5) * 0.8 * vol;
  });
}

function sello(vol = 1) {
  const cuerpo = golpeGrave(0.8);
  const choque = filtro(crear(0.15, (t) => ruido() * Math.exp(-t * 40)), 1400, { q: 0.7 });
  choque.forEach((v, i) => { cuerpo[i] += v * 0.6; });
  return cuerpo.map((v) => v * vol);
}

/* ---------- Música ---------- */

const nota = (n) => 440 * Math.pow(2, (n - 69) / 12);
/* C – G – Am – F, un compás (2 s) cada uno. */
const ACORDES = [[48, [60, 64, 67]], [43, [59, 62, 67]], [45, [60, 64, 69]], [41, [60, 65, 69]]];
const INICIO = 7.0, PULSO = 0.5, FIN_RITMO = 36.5;

function bombo() {
  return crear(0.45, (t) => {
    const f = 48 + 110 * Math.exp(-t * 32);
    return (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 7) + ruido() * Math.exp(-t * 400) * 0.15) * 0.9;
  });
}
function platillo(seg = 0.05) {
  return filtro(crear(seg, (t) => ruido() * Math.exp(-t * (3 / seg))), 9000, { tipo: 'alto', q: 0.7 }).map((v) => v * 0.35);
}
function palmas() {
  const m = crear(0.25, (t) => {
    const e = [0, 0.011, 0.022].reduce((s, d) => s + (t >= d ? Math.exp(-(t - d) * (d === 0.022 ? 18 : 120)) : 0), 0);
    return ruido() * e;
  });
  return filtro(m, 1500, { q: 0.9 }).map((v) => v * 0.55);
}
function bajo(f, seg) {
  return crear(seg, (t) => {
    let s = 0;
    const brillo = Math.exp(-t * 9);
    for (let h = 1; h <= 8; h++) s += Math.sin(2 * Math.PI * f * h * t) / h * (h === 1 ? 1 : brillo);
    return s * Math.min(1, t / 0.004) * Math.exp(-t * 3.5) * 0.4;
  });
}
function pulsacion(f) {
  return crear(0.35, (t) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 14)) * Math.min(1, t / 0.002) * Math.exp(-t * 11) * 0.22);
}
function colchon(notas, seg) {
  return crear(seg, (t) => {
    const env = Math.min(1, t / 0.35) * Math.min(1, (seg - t) / 0.3);
    let s = 0;
    for (const n of notas) {
      const f = nota(n);
      for (const d of [-0.12, 0.12]) {
        const fd = f * Math.pow(2, d / 12);
        s += Math.sin(2 * Math.PI * fd * t) + Math.sin(2 * Math.PI * fd * 3 * t) / 9;
      }
    }
    return s * env * 0.05;
  });
}

/* Reverberación sencilla (filtros peine + pasa todo) para darle aire al timbre y a la música. */
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

function efectos() {
  const p = pista();
  const ambiente = pista();

  poner(p, 0.03, aviso(1.1));
  poner(p, 0.18, golpeGrave(0.35));
  poner(p, 2.62, barrido(0.45, { desde: 3000, hasta: 400 }));
  [[3.0, 1, 0.25], [3.55, 1.12, -0.2], [4.1, 1.25, 0.25]].forEach(([t, k, pan]) => poner(p, t, burbuja(k), 1, pan));
  for (let t = 2.75; t < 4.9; t += 0.5) poner(p, t, tic(Math.round((t - 2.75) / 0.5) % 2 === 0, 0.7));
  for (let t = 4.9; t < 6.3; t += 0.12) poner(p, t, tic(true, 0.45));
  poner(p, 4.9, golpeGrave(0.6));
  poner(p, 6.0, subida(0.9, 0.9));
  poner(ambiente, 6.9, dinDon(1.25));
  poner(p, 7.0, golpeGrave(0.9));
  poner(p, 6.95, barrido(0.8, { desde: 300, hasta: 6000, vol: 0.8 }));

  poner(p, 8.9, barrido(0.4, { vol: 0.6 }));
  [10.25, 10.85, 11.35].forEach((t, i) => { poner(p, t, toque()); poner(p, t + 0.02, burbuja(1.3 + i * 0.15, 0.7), 1, 0.3); });
  poner(p, 12.55, toque(1.1));
  poner(p, 12.85, barrido(0.55, { desde: 600, hasta: 5000 }));
  poner(ambiente, 13.75, aviso());
  poner(p, 15.5, sello());
  poner(p, 17.35, barrido(0.35, { vol: 0.5 }));
  const azarTeclas = azar(42);
  for (let t = 17.6; t < 18.45; t += 0.07 + 0.05 * (azarTeclas() + 1) / 2) poner(p, t, tic(azarTeclas() > 0, 0.35), 1, 0.15);
  poner(ambiente, 18.5, aviso(0.8));
  poner(p, 21.15, barrido(0.55, { desde: 4000, hasta: 500 }));

  poner(p, 21.55, burbuja(0.8, 0.8));
  [23.25, 23.85, 24.4, 25.95].forEach((t) => poner(p, t, toque()));
  poner(p, 24.5, barrido(0.5, { desde: 600, hasta: 5000 }));
  poner(ambiente, 25.0, aviso(0.9));
  poner(p, 26.2, burbuja(1.5, 0.9));

  poner(p, 27.3, barrido(0.6, { desde: 400, hasta: 7000 }));
  for (let k = 0; k < 14; k++) poner(p, 27.8 + 1.0 * Math.pow(k / 14, 0.7), tic(true, 0.5));
  poner(p, 28.8, sello(0.9));
  [28.6, 29.4, 30.2, 31.0].forEach((t, i) => poner(p, t, burbuja(1 + i * 0.1, 0.6)));

  poner(p, 32.45, barrido(0.5, { desde: 5000, hasta: 500 }));
  poner(ambiente, 32.95, dinDon(1.25));
  poner(p, 33.3, burbuja(1.2, 0.8));
  poner(p, 36.85, barrido(0.5, { desde: 500, hasta: 3000, vol: 0.6 }));

  reverb(ambiente, { mezcla: 0.3 });
  for (const c of ['L', 'R']) for (let i = 0; i < p[c].length; i++) p[c][i] += ambiente[c][i];
  normalizar(p, 0.9);
  return p;
}

function musica() {
  const p = pista();
  const colchones = pista();

  /* Gancho y problema: acorde menor suave y grave, que se abre antes del timbre. */
  const tension = filtro(colchon([45, 52, 57, 60], 7.0), (t) => 400 + 2600 * Math.pow(Math.max(0, (t - 5.5) / 1.5), 2), { tipo: 'bajo', q: 0.9 });
  poner(colchones, 0, tension, 0.45);

  /* Desde el timbre: ritmo completo. */
  const pulsos = Math.round((FIN_RITMO - INICIO) / PULSO);
  const bb = bombo(), pl = platillo(), pc = palmas(), abierto = platillo(0.18);
  for (let k = 0; k < pulsos; k++) {
    const t = INICIO + k * PULSO;
    const compas = Math.floor(k / 4);
    const [raiz, triada] = ACORDES[compas % 4];
    const corte = t >= 20.5 && t < 21.5; /* pausa breve antes de las reservas */
    if (!corte) poner(p, t, bb, 1);
    if (t >= 9.0 && !corte) {
      poner(p, t + PULSO / 2, k % 4 === 3 ? abierto : pl, 1, 0.3);
      if (k % 2 === 1) poner(p, t, pc, 0.8, -0.1);
    }
    poner(p, t + PULSO / 2, bajo(nota(raiz), 0.24), 1);
    if (k % 4 === 0) poner(p, t, bajo(nota(raiz), 0.24), 0.9);
    if (t >= 9.0) {
      const arpegio = [triada[0] + 12, triada[1] + 12, triada[2] + 12, triada[1] + 12];
      poner(colchones, t, pulsacion(nota(arpegio[k % 4])), 0.8, -0.35);
      poner(colchones, t + PULSO / 2, pulsacion(nota(arpegio[(k + 2) % 4])), 0.6, 0.35);
    }
    if (k % 4 === 0) poner(colchones, t, colchon(triada, 2.0), 1);
  }
  /* Platillo largo al entrar a reservas y a la oferta; acorde final que se apaga antes del bucle. */
  const choque = filtro(crear(1.6, (t) => ruido() * Math.exp(-t * 2.5)), 6000, { tipo: 'alto', q: 0.7 });
  poner(p, 21.5, choque, 0.35);
  poner(p, 27.5, choque, 0.35);
  poner(colchones, FIN_RITMO, colchon(ACORDES[0][1].concat([72]), 1.0), 1.1);
  poner(p, FIN_RITMO, bajo(nota(36), 0.9), 1);

  /* El bombo «empuja» el colchón (compresión con bombo, típica de la música bailable). */
  for (let i = 0; i < colchones.L.length; i++) {
    const t = i / SR;
    let g = 1;
    if (t >= INICIO && t < FIN_RITMO) g = 1 - 0.55 * Math.exp(-((t - INICIO) % PULSO) * 9);
    p.L[i] += colchones.L[i] * g;
    p.R[i] += colchones.R[i] * g;
  }
  reverb(p, { mezcla: 0.12 });
  /* Se apaga del todo antes de volver a empezar. */
  for (let i = Math.round(36.9 * SR); i < p.L.length; i++) { const g = Math.max(0, 1 - (i / SR - 36.9) / 0.5); p.L[i] *= g; p.R[i] *= g; }
  normalizar(p, 0.9);
  return p;
}

module.exports = { SR, DURACION, efectos, musica };
