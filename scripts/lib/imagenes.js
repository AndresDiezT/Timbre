/* Utilidades compartidas para dibujar imágenes PNG y códigos QR desde Node. */
'use strict';
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const qrcode = require('../../assets/vendor/qrcode.js');

const FUENTES = ['Anton-Regular.ttf', 'Figtree-Regular.ttf', 'Figtree-Bold.ttf', 'Figtree-ExtraBold.ttf'].map((f) => path.join(__dirname, '..', 'fuentes', f));
const TINTA = '#16202A';
const PAPEL = '#FFFDF5';
const AMARILLO = '#FFC933';

/* ---------- Utilidades de SVG ---------- */
const xml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

function contraste(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const c = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = 0.2126 * c((n >> 16) & 255) + 0.7152 * c((n >> 8) & 255) + 0.0722 * c(n & 255);
  return 1.05 / (L + 0.05) >= (L + 0.05) / 0.0315 ? '#FFFFFF' : TINTA;
}

/** Corta un texto en líneas según un ancho aproximado (factor = ancho medio de letra / tamaño). */
function partir(texto, anchoMax, tam, factor, maxLineas) {
  const palabras = String(texto).split(/\s+/);
  const lineas = [];
  let actual = '';
  const cabe = (t) => t.length * tam * factor <= anchoMax;
  for (const p of palabras) {
    const prueba = actual ? actual + ' ' + p : p;
    if (cabe(prueba)) actual = prueba;
    else { if (actual) lineas.push(actual); actual = p; }
  }
  if (actual) lineas.push(actual);
  if (lineas.length > maxLineas) {
    const cortadas = lineas.slice(0, maxLineas);
    cortadas[maxLineas - 1] = cortadas[maxLineas - 1].replace(/\s*\S*$/, '') + '…';
    return cortadas;
  }
  return lineas;
}

const iniciales = (s) => String(s).split(/\s+/).filter((p) => p && !/^(de|del|la|las|el|los|y|&|x|the)$/i.test(p) && /[a-záéíóúñ]/i.test(p)).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

function png(svg, ruta) {
  const r = new Resvg(svg, { fitTo: { mode: 'original' }, font: { fontFiles: FUENTES, loadSystemFonts: false, defaultFontFamily: 'Figtree' } });
  fs.writeFileSync(ruta, r.render().asPng());
}

function imagenDataUri(ruta) {
  const ext = path.extname(ruta).toLowerCase().replace('.', '');
  const tipo = ext === 'jpg' ? 'jpeg' : ext;
  return `data:image/${tipo};base64,${fs.readFileSync(ruta).toString('base64')}`;
}

/* ---------- QR ---------- */
function qrMatriz(texto) {
  const qr = qrcode(0, 'M');
  qr.addData(texto);
  qr.make();
  return qr;
}

function qrPath(qr, x0, y0, modulo) {
  const n = qr.getModuleCount();
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x0 + x * modulo} ${y0 + y * modulo}h${modulo}v${modulo}h-${modulo}z`;
  return d;
}

function qrSvgSimple(texto) {
  const qr = qrMatriz(texto);
  const n = qr.getModuleCount();
  const m = 4;
  const tam = n + m * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tam} ${tam}" width="${tam * 10}" height="${tam * 10}" shape-rendering="crispEdges"><rect width="${tam}" height="${tam}" fill="#FFFFFF"/><path d="${qrPath(qr, m, m, 1)}" fill="${TINTA}"/></svg>\n`;
}

function qrTarjeta(texto, { titulo, etiqueta, pie, acento }) {
  const qr = qrMatriz(texto);
  const n = qr.getModuleCount();
  const lado = 600;
  const modulo = Math.floor(lado / (n + 8));
  const real = modulo * (n + 8);
  const x0 = (1080 - real) / 2;
  const y0 = 210;
  const lineasTitulo = partir(titulo.toUpperCase(), 940, 72, 0.5, 2);
  const sobre = contraste(acento);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <rect width="1080" height="1080" fill="${PAPEL}"/>
  <rect x="24" y="24" width="1032" height="1032" rx="40" fill="none" stroke="${TINTA}" stroke-width="6"/>
  ${lineasTitulo.map((l, i) => `<text x="540" y="${lineasTitulo.length === 1 ? 150 : 108 + i * 76}" text-anchor="middle" font-family="Anton" font-size="72" fill="${TINTA}">${xml(l)}</text>`).join('\n  ')}
  <rect x="${x0}" y="${y0}" width="${real}" height="${real}" rx="24" fill="#FFFFFF" stroke="${TINTA}" stroke-width="6"/>
  <path d="${qrPath(qr, x0 + modulo * 4, y0 + modulo * 4, modulo)}" fill="${TINTA}"/>
  <rect x="140" y="${y0 + real + 40}" width="800" height="96" rx="48" fill="${acento}" stroke="${TINTA}" stroke-width="5"/>
  <text x="540" y="${y0 + real + 102}" text-anchor="middle" font-family="Figtree" font-weight="800" font-size="40" fill="${sobre}">${xml(etiqueta)}</text>
  <text x="540" y="${y0 + real + 186}" text-anchor="middle" font-family="Figtree" font-weight="700" font-size="34" fill="${TINTA}">${xml(pie)}</text>
</svg>`;
}


module.exports = { FUENTES, TINTA, PAPEL, AMARILLO, xml, contraste, partir, iniciales, png, imagenDataUri, qrMatriz, qrPath, qrSvgSimple, qrTarjeta };
