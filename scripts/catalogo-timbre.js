#!/usr/bin/env node
/* Genera las imágenes del catálogo del WhatsApp de Timbre (1080×1080 PNG),
   una por plan y por mercado, a partir de config/planes.json.
   Uso: node scripts/catalogo-timbre.js
   Salida: timbre-whatsapp/catalogo/<mercado>/NN-<plan>.png */
'use strict';
const fs = require('fs');
const path = require('path');
const { TINTA, AMARILLO, PAPEL, xml, partir, png } = require('./lib/imagenes.js');

const RAIZ = path.resolve(__dirname, '..');
const planes = JSON.parse(fs.readFileSync(path.join(RAIZ, 'config/planes.json'), 'utf8'));
const marca = JSON.parse(fs.readFileSync(path.join(RAIZ, 'config/marca.json'), 'utf8'));

const CAMPANA = 'M32 14c-1.7 0-3 1.3-3 3v1.2c-6 1.4-9.5 6.6-9.5 12.8v7.5L16 43v2h32v-2l-3.5-4.5V31c0-6.2-3.5-11.4-9.5-12.8V17c0-1.7-1.3-3-3-3zM27 47.5a5 5 0 0 0 10 0z';

function dinero(v, moneda, idioma) {
  if (v == null) return null;
  const miles = String(v).replace(/\B(?=(\d{3})+(?!\d))/g, moneda === 'COP' ? '.' : ',');
  if (moneda === 'COP') return '$' + miles;
  return idioma === 'en' ? '$' + miles : 'US$' + miles;
}

function imagen(m, p, i) {
  const en = m.idioma === 'en';
  const precio = dinero(p.precio, m.moneda, m.idioma);
  const mensual = p.mensual ? dinero(p.mensual, m.moneda, m.idioma) : null;
  const sufijo = p.periodo === 'mes' ? (en ? 'per month' : 'al mes') : mensual ? (en ? 'setup' : 'instalación') : (en ? 'one-time' : 'pago único');
  const titulo = partir(p.nombre.toUpperCase(), 900, 150, 0.46, 2);
  const tamTitulo = titulo.length > 1 ? 110 : 150;
  const yTitulo = titulo.length > 1 ? 250 : 300;
  const yPrecio = yTitulo + (titulo.length - 1) * (tamTitulo + 4) + 150;
  // Se agregan puntos completos mientras quepan antes de la línea del pie (y = 930).
  const lineasPorPunto = p.incluye.map((t) => partir(t, 860, 34, 0.5, 2).map((l, j) => ({ l, primera: j === 0 })));
  const yLista = yPrecio + (mensual ? 168 : 120);
  const maxLineas = Math.floor((925 - yLista) / 46) + 1;
  const incluye = [];
  for (const lineas of lineasPorPunto) {
    if (incluye.length + lineas.length > maxLineas) break;
    incluye.push(...lineas);
  }
  const lista = incluye.map((x, k) => `
    ${x.primera ? `<rect x="90" y="${yLista + k * 46 - 24}" width="22" height="22" rx="4" fill="${PAPEL}" stroke="${TINTA}" stroke-width="4"/>` : ''}
    <text x="132" y="${yLista + k * 46}" font-family="Figtree" font-weight="700" font-size="34" fill="${TINTA}">${xml(x.l)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <rect width="1080" height="1080" fill="${AMARILLO}"/>
  <rect x="30" y="30" width="1020" height="1020" rx="44" fill="none" stroke="${TINTA}" stroke-width="8"/>
  <rect x="80" y="80" width="${en ? 300 : 330}" height="64" rx="32" fill="${TINTA}"/>
  <text x="${en ? 230 : 245}" y="124" text-anchor="middle" font-family="Figtree" font-weight="800" font-size="30" fill="${AMARILLO}" letter-spacing="2">${en ? 'TIMBRE PLAN' : 'PLAN TIMBRE'}</text>
  <g transform="translate(900 66) scale(1.6)"><circle cx="32" cy="32" r="30" fill="${PAPEL}" stroke="${TINTA}" stroke-width="4"/><path d="${CAMPANA}" fill="${TINTA}"/></g>
  ${titulo.map((l, k) => `<text x="80" y="${yTitulo + k * (tamTitulo + 4)}" font-family="Anton" font-size="${tamTitulo}" fill="${TINTA}">${xml(l)}</text>`).join('')}
  ${precio
    ? `<text x="80" y="${yPrecio}" font-family="Anton" font-size="110" fill="${TINTA}">${xml(precio)}</text>
  <text x="${80 + precio.length * 52 + 30}" y="${yPrecio}" font-family="Figtree" font-weight="800" font-size="38" fill="${TINTA}">${xml(sufijo)}</text>`
    : `<text x="80" y="${yPrecio}" font-family="Anton" font-size="80" fill="${TINTA}">${xml(en ? 'FREE DISCOVERY CALL' : 'DIAGNÓSTICO SIN COSTO')}</text>`}
  ${mensual ? `<text x="80" y="${yPrecio + 58}" font-family="Figtree" font-weight="800" font-size="40" fill="${TINTA}">${xml(`+ ${mensual} ${en ? 'per month' : 'al mes, sin permanencia'}`)}</text>` : ''}
  <text x="80" y="${yPrecio + (mensual ? 106 : 56)}" font-family="Figtree" font-weight="700" font-size="32" fill="${TINTA}">${xml(p.entrega)}</text>
  ${lista}
  <line x1="80" y1="962" x2="1000" y2="962" stroke="${TINTA}" stroke-width="4"/>
  <text x="80" y="1010" font-family="Figtree" font-weight="800" font-size="30" fill="${TINTA}">${xml(en ? marca.fraseEn : marca.frase)}</text>
  <text x="1000" y="1010" text-anchor="end" font-family="Figtree" font-weight="700" font-size="30" fill="${TINTA}">${xml(marca.contacto.whatsapp)}</text>
</svg>`;
}

const salida = path.join(RAIZ, 'timbre-whatsapp/catalogo');
let total = 0;
for (const [id, m] of Object.entries(planes.mercados)) {
  const dir = path.join(salida, id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  m.planes.forEach((p, i) => {
    png(imagen(m, p, i), path.join(dir, `${String(i + 1).padStart(2, '0')}-${p.id}.png`));
    total++;
  });
}
console.log(`Listo: ${total} imágenes en timbre-whatsapp/catalogo/.`);
