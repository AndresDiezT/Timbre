#!/usr/bin/env node
/* Arma la carpeta _site/ con lo que se publica (Netlify o GitHub Pages).
   Deja fuera documentos internos, dependencias y cualquier dato de clientes
   reales: solo publica las entregas de ejemplo (ficticias).
   Uso: node scripts/armar-sitio.js */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const DESTINO = path.join(RAIZ, '_site');
const EXCLUIR = new Set(['.git', '.github', '_site', 'node_modules', '.netlify']);

function publicar(rel) {
  const partes = rel.split(path.sep);
  if (EXCLUIR.has(partes[0])) return false;
  if (rel.endsWith('.md')) return false;
  if (partes[0] === 'negocios' && partes[1] === 'privado') return false;
  if (partes[0] === 'entregas' && partes.length > 1 && !partes[1].startsWith('ejemplo-')) return false;
  return true;
}

function copiar(dirRel) {
  let total = 0;
  for (const e of fs.readdirSync(path.join(RAIZ, dirRel), { withFileTypes: true })) {
    const rel = path.join(dirRel, e.name);
    if (!publicar(rel)) continue;
    if (e.isDirectory()) total += copiar(rel);
    else if (e.isFile()) {
      fs.mkdirSync(path.join(DESTINO, dirRel), { recursive: true });
      fs.copyFileSync(path.join(RAIZ, rel), path.join(DESTINO, rel));
      total++;
    }
  }
  return total;
}

fs.rmSync(DESTINO, { recursive: true, force: true });
fs.mkdirSync(DESTINO, { recursive: true });
const total = copiar('');
fs.writeFileSync(path.join(DESTINO, '.nojekyll'), '');
console.log(`Sitio armado en _site/ (${total} archivos).`);
