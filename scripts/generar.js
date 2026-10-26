#!/usr/bin/env node
/* Timbre — generador de entregas.
   Uso:
     node scripts/generar.js negocios/<archivo>.json [--estilo sobrio|calido|moderno] [--pagina] [--salida entregas]

   Crea entregas/<archivo>/ con:
     LEEME.md                         índice de la entrega
     textos/whatsapp-business.md      perfil, bienvenida, fuera de horario, respuestas rápidas, etiquetas y catálogo
     textos/google-maps.md            descripción, categorías, horario y 3 publicaciones iniciales
     textos/catalogo.csv              catálogo en tabla
     imagenes/catalogo/*.png          una imagen de 1080×1080 por producto
     qr/qr-whatsapp.svg|png           QR que abre WhatsApp con el mensaje ya escrito
     qr/qr-resenas.svg|png            QR para pedir reseñas en Google (si hay enlace)
     pagina/index.html                página del negocio con pedidos o reservas, autónoma
     pagina/recordatorios.html        herramienta del dueño para recordatorios (Reservas)
     lista-de-verificacion.md         pasos de la entrega
*/
'use strict';
const fs = require('fs');
const path = require('path');
const Kit = require('../assets/js/kit.js');
const Pagina = require('../plantillas/pagina-negocio/pagina.js');

const RAIZ = path.resolve(__dirname, '..');
const { TINTA, PAPEL, AMARILLO, xml, contraste, partir, iniciales, png, imagenDataUri, qrSvgSimple, qrTarjeta } = require('./lib/imagenes.js');

/* ---------- Argumentos ---------- */
function leerArgumentos(argv) {
  const a = { archivo: null, estilo: null, pagina: false, salida: path.join(RAIZ, 'entregas') };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--estilo') a.estilo = argv[++i];
    else if (x === '--pagina') a.pagina = true;
    else if (x === '--salida') a.salida = path.resolve(argv[++i]);
    else if (x === '--ayuda' || x === '-h') a.ayuda = true;
    else a.archivo = x;
  }
  return a;
}

/* ---------- Imagen de catálogo ---------- */
function imagenCatalogo(n, item, precioTexto, rutaImagen) {
  const acento = n.acento;
  const sobre = contraste(acento);
  const nombre = partir(item.nombre.toUpperCase(), 960, 84, 0.5, 2);
  const desc = partir(item.descripcion || '', 960, 36, 0.5, 2);
  const yNombre = 738;
  const yDesc = yNombre + nombre.length * 88 + 6;
  const anchoPrecio = Math.max(240, precioTexto.length * 34 + 80);
  const arte = rutaImagen
    ? `<image href="${imagenDataUri(rutaImagen)}" x="0" y="0" width="1080" height="580" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect width="1080" height="580" fill="${acento}"/>
  <g opacity="0.12" stroke="${sobre}" stroke-width="28">${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 90 - 580}" y1="580" x2="${i * 90}" y2="0"/>`).join('')}</g>
  <text x="540" y="400" text-anchor="middle" font-family="Anton" font-size="300" fill="${sobre}">${xml(iniciales(item.nombre) || '•')}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <rect width="1080" height="1080" fill="${PAPEL}"/>
  ${arte}
  <rect x="0" y="580" width="1080" height="6" fill="${TINTA}"/>
  <rect x="60" y="540" width="${anchoPrecio}" height="88" rx="44" fill="${AMARILLO}" stroke="${TINTA}" stroke-width="5"/>
  <text x="${60 + anchoPrecio / 2}" y="600" text-anchor="middle" font-family="Figtree" font-weight="800" font-size="50" fill="${TINTA}">${xml(precioTexto)}</text>
  ${nombre.map((l, i) => `<text x="60" y="${yNombre + i * 88}" font-family="Anton" font-size="84" fill="${TINTA}">${xml(l)}</text>`).join('\n  ')}
  ${desc.map((l, i) => `<text x="60" y="${yDesc + 40 + i * 46}" font-family="Figtree" font-size="36" fill="#47525E">${xml(l)}</text>`).join('\n  ')}
  <text x="1020" y="1030" text-anchor="end" font-family="Figtree" font-weight="800" font-size="30" fill="${TINTA}">${xml(n.nombre)}</text>
</svg>`;
}

/* ---------- Programa ---------- */
function main() {
  const a = leerArgumentos(process.argv.slice(2));
  if (a.ayuda || !a.archivo) {
    console.log('Uso: node scripts/generar.js negocios/<archivo>.json [--estilo sobrio|calido|moderno] [--pagina] [--salida entregas]');
    process.exit(a.ayuda ? 0 : 1);
  }
  const archivo = path.resolve(a.archivo);
  let n;
  try { n = JSON.parse(fs.readFileSync(archivo, 'utf8')); } catch (e) {
    console.error(`No se pudo leer ${a.archivo}: ${e.message}`);
    process.exit(1);
  }
  if (!n.negocio) { console.error('El archivo no tiene el bloque "negocio". Copie la estructura de negocios/ejemplo-*.json.'); process.exit(1); }

  const nombreCarpeta = path.basename(archivo, '.json');
  const destino = path.join(a.salida, nombreCarpeta);
  const esPrivado = archivo.includes(`${path.sep}privado${path.sep}`);
  if (!esPrivado && !nombreCarpeta.startsWith('ejemplo-') && !n.ficticio) {
    console.warn('Aviso: este negocio no está en negocios/privado/ ni marcado como ficticio. Los clientes reales van en negocios/privado/.');
  }

  fs.rmSync(destino, { recursive: true, force: true });
  ['textos', 'imagenes/catalogo', 'qr', 'pagina'].forEach((d) => fs.mkdirSync(path.join(destino, d), { recursive: true }));
  const escribir = (rel, contenido) => fs.writeFileSync(path.join(destino, rel), contenido);
  const creados = [];

  // Textos
  escribir('textos/whatsapp-business.md', Kit.markdownWhatsapp(n));
  escribir('textos/google-maps.md', Kit.markdownMaps(n));
  const w = Kit.whatsapp(n);
  const csv = (s) => `"${String(s).replace(/"/g, '""')}"`;
  escribir('textos/catalogo.csv', ['numero,nombre,precio,precio_texto,descripcion,codigo', ...w.catalogo.map((c) => [c.numero, csv(c.nombre), c.precio, csv(c.precioTexto), csv(c.descripcion), c.codigo].join(','))].join('\n') + '\n');
  creados.push('textos/whatsapp-business.md', 'textos/google-maps.md', 'textos/catalogo.csv');

  // Imágenes de catálogo
  w.catalogo.forEach((c, i) => {
    const item = n.catalogo[i];
    const rutaImg = item.imagen ? path.resolve(path.dirname(archivo), item.imagen) : null;
    const nombre = `imagenes/catalogo/${String(c.numero).padStart(2, '0')}-${Kit.slug(c.nombre)}.png`;
    png(imagenCatalogo(n, item, c.precioTexto, rutaImg && fs.existsSync(rutaImg) ? rutaImg : null), path.join(destino, nombre));
    creados.push(nombre);
  });

  // QR
  const es = n.idioma !== 'en';
  const numero = n.negocio.telefono || '';
  escribir('qr/qr-whatsapp.svg', qrSvgSimple(w.enlaceQR));
  png(qrTarjeta(w.enlaceQR, { titulo: n.nombre, etiqueta: es ? 'ESCRÍBANOS POR WHATSAPP' : 'MESSAGE US ON WHATSAPP', pie: es ? `Escanee con la cámara · ${numero}` : `Scan with your camera · ${numero}`, acento: n.acento }), path.join(destino, 'qr/qr-whatsapp.png'));
  creados.push('qr/qr-whatsapp.svg', 'qr/qr-whatsapp.png');
  const resenas = Kit.enlaceResenas(n);
  if (resenas) {
    escribir('qr/qr-resenas.svg', qrSvgSimple(resenas));
    png(qrTarjeta(resenas, { titulo: es ? '¿Le gustó?' : 'Enjoyed it?', etiqueta: es ? 'DÉJENOS SU RESEÑA' : 'LEAVE US A REVIEW', pie: es ? `Escanee con la cámara · ${n.nombre}` : `Scan with your camera · ${n.nombre}`, acento: n.acento }), path.join(destino, 'qr/qr-resenas.png'));
    creados.push('qr/qr-resenas.svg', 'qr/qr-resenas.png');
  }

  // Página del negocio (Pedidos, Reservas y Asistente)
  const plan = n.negocio.plan || 'arranque';
  if (plan !== 'arranque' || a.pagina) {
    const estilo = a.estilo || n.negocio.estiloPagina || 'sobrio';
    const dirEstilos = path.join(RAIZ, 'plantillas/pagina-negocio/estilos');
    const css = fs.readFileSync(path.join(dirEstilos, 'base.css'), 'utf8') + '\n' + fs.readFileSync(path.join(dirEstilos, `${Pagina.ESTILOS[estilo] ? estilo : 'sobrio'}.css`), 'utf8');
    const qrResenas = resenas ? qrSvgSimple(resenas).replace(/ width="\d+" height="\d+"/, ' width="100%" height="100%"') : '';
    const imagenes = {};
    n.catalogo.forEach((item, i) => { if (item.imagen) imagenes[i] = path.basename(item.imagen); });
    escribir('pagina/index.html', Pagina.render(n, { estilo, css, qrResenas, imagenes }));
    const modulo = Pagina.moduloDe(n);
    creados.push(`pagina/index.html (estilo ${estilo}${modulo ? `, con ${modulo}` : ''})`);
    if (modulo === 'reservas') {
      escribir('pagina/recordatorios.html', Pagina.renderRecordatorios(n, { estilo, css }));
      creados.push('pagina/recordatorios.html');
    }
  } else {
    fs.rmSync(path.join(destino, 'pagina'), { recursive: true, force: true });
  }

  // Lista de verificación y LEEME
  escribir('lista-de-verificacion.md', Kit.listaVerificacion(n, { plan }));
  creados.push('lista-de-verificacion.md');
  const avisos = Kit.avisos(n);
  escribir('LEEME.md', [
    `# Entrega · ${n.nombre}`,
    '',
    `Generada con \`node scripts/generar.js ${path.relative(RAIZ, archivo)}\`.`,
    n.ficticio ? '\n> Negocio ficticio de ejemplo.\n' : '',
    '## Archivos',
    '',
    ...creados.map((c) => `- \`${c}\``),
    '',
    '## Enlaces',
    '',
    `- WhatsApp directo: ${w.enlaceDirecto}`,
    `- WhatsApp desde el QR: ${w.enlaceQR}`,
    `- Google Maps: ${Kit.enlaceMaps(n)}`,
    `- Reseñas: ${resenas || 'pendiente'}`,
    '',
    avisos.length ? '## Avisos\n\n' + avisos.map((x) => `- ${x}`).join('\n') : '## Avisos\n\nNinguno.',
    ''
  ].join('\n'));

  console.log(`Entrega lista en ${path.relative(process.cwd(), destino) || destino}/ (${creados.length} archivos).`);
  if (avisos.length) console.log('Avisos:\n- ' + avisos.join('\n- '));
}

main();
