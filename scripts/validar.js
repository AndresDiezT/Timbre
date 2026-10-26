#!/usr/bin/env node
// Valida todos los JSON del repositorio y la estructura de gremios y negocios.
// Uso: node scripts/validar.js                  (todo el repositorio)
//      node scripts/validar.js negocios/privado/cliente.json   (un solo archivo)
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const IGNORAR = new Set(['.git', 'node_modules', 'entregas', 'privado']);
const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
const errores = [];
let total = 0;

function recorrer(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(e.name)) continue;
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(ruta);
    else if (e.name.endsWith('.json')) leer(ruta);
  }
}

function leer(ruta) {
  total++;
  try { return JSON.parse(fs.readFileSync(ruta, 'utf8')); }
  catch (err) { errores.push(`${rel(ruta)}: JSON inválido (${err.message})`); return null; }
}

const rel = (r) => path.relative(RAIZ, r);

function exigir(cond, ruta, msg) { if (!cond) errores.push(`${rel(ruta)}: ${msg}`); }

function validarGremio(ruta, g) {
  if (!g) return;
  const r = (c, m) => exigir(c, ruta, m);
  for (const campo of ['id', 'idioma', 'gremio', 'nombre', 'acento', 'moneda', 'horario', 'horarioTexto', 'catalogo', 'faq', 'mensajes', 'etiquetas', 'maps', 'conversacion']) {
    r(g[campo] !== undefined, `falta el campo "${campo}"`);
  }
  r(/^#[0-9a-f]{6}$/i.test(g.acento || ''), 'acento debe ser un color #RRGGBB');
  r(['COP', 'USD'].includes(g.moneda), 'moneda debe ser COP o USD');
  if (g.horario) for (const d of DIAS) {
    const h = g.horario[d];
    r(h === null || (Array.isArray(h) && h.length === 2 && h.every((x) => /^\d{2}:\d{2}$/.test(x))), `horario.${d} debe ser null o ["HH:MM","HH:MM"]`);
  }
  if (Array.isArray(g.catalogo)) {
    r(g.catalogo.length >= 6 && g.catalogo.length <= 10, `el catálogo debe tener de 6 a 10 productos (tiene ${g.catalogo.length})`);
    g.catalogo.forEach((p, i) => r(p.nombre && typeof p.precio === 'number', `catalogo[${i}] necesita nombre y precio numérico`));
  }
  r(Array.isArray(g.faq) && g.faq.length === 8, 'debe tener exactamente 8 preguntas frecuentes');
  if (g.mensajes) {
    r(g.mensajes.bienvenida && g.mensajes.fueraDeHorario, 'faltan bienvenida o fueraDeHorario');
    r(Array.isArray(g.mensajes.respuestasRapidas) && g.mensajes.respuestasRapidas.length >= 3, 'faltan respuestas rápidas (mínimo 3)');
  }
  r(Array.isArray(g.etiquetas) && g.etiquetas.length >= 4, 'faltan etiquetas (mínimo 4)');
  if (g.maps) r(g.maps.descripcion && g.maps.categoriaPrincipal, 'maps necesita descripcion y categoriaPrincipal');
  if (g.maps && g.maps.descripcion) r(g.maps.descripcion.length <= 750, 'la descripción de Maps supera 750 caracteres');
  if (Array.isArray(g.conversacion)) g.conversacion.forEach((c, i) => {
    r(c.cliente && c.responde, `conversacion[${i}] necesita cliente y responde`);
    const m = /^faq:(\d+)$/.exec(c.responde || '');
    if (m) r(g.faq && g.faq[+m[1]], `conversacion[${i}] apunta a una pregunta que no existe`);
  });
}

const soloUno = process.argv[2];
if (soloUno) {
  const ruta = path.resolve(soloUno);
  const n = leer(ruta);
  if (n) {
    validarGremio(ruta, n);
    const esCliente = ruta.includes(`${path.sep}negocios${path.sep}`);
    if (esCliente && !n.negocio) errores.push(`${rel(ruta)}: falta el bloque "negocio".`);
    if (n.negocio) exigir(n.negocio.whatsapp, ruta, 'falta negocio.whatsapp');
  }
  if (errores.length) { console.error('Problemas:\n- ' + errores.join('\n- ')); process.exit(1); }
  console.log(`${soloUno}: en orden.`);
  process.exit(0);
}

recorrer(RAIZ);

const dirGremios = path.join(RAIZ, 'plantillas/gremios');
const indice = leer(path.join(dirGremios, 'indice.json')) || {};
const listados = [...(indice.es || []), ...(indice.en || [])];
for (const id of listados) {
  const ruta = path.join(dirGremios, `${id}.json`);
  if (!fs.existsSync(ruta)) { errores.push(`indice.json menciona "${id}" pero no existe ${id}.json`); continue; }
  const g = leer(ruta); total--;
  validarGremio(ruta, g);
  if (g) exigir(g.id === id, ruta, `el id "${g.id}" no coincide con el nombre del archivo`);
}
for (const f of fs.readdirSync(dirGremios)) {
  if (f.endsWith('.json') && f !== 'indice.json' && !listados.includes(f.replace('.json', ''))) errores.push(`plantillas/gremios/${f} no está en indice.json`);
}

const dirNegocios = path.join(RAIZ, 'negocios');
if (fs.existsSync(dirNegocios)) for (const f of fs.readdirSync(dirNegocios)) {
  if (!f.endsWith('.json')) continue;
  const ruta = path.join(dirNegocios, f);
  const n = leer(ruta); total--;
  validarGremio(ruta, n);
  if (n) exigir(n.negocio && n.negocio.whatsapp, ruta, 'falta negocio.whatsapp');
}

if (errores.length) {
  console.error(`Se encontraron ${errores.length} problema(s):\n- ` + errores.join('\n- '));
  process.exit(1);
}
console.log(`Todo en orden: ${total} archivos JSON válidos.`);
