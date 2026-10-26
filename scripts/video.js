#!/usr/bin/env node
/* Timbre — renderiza el reel vertical (1080 × 1920, 30 cuadros por segundo) a MP4.
   Uso: node scripts/video.js [--gancho 2]   (ganchos 1 a 5, definidos en video/reel/reel.html)
   Necesita ffmpeg y Playwright con Chromium (npm i --no-save playwright && npx playwright install chromium).
   Salida en video/salida/:
     timbre-reel.mp4               con música y efectos propios
     timbre-reel-solo-efectos.mp4  para ponerle en la app una canción de la biblioteca de Instagram o TikTok
     timbre-reel-portada.jpg       cuadro para la portada
   Con --gancho N (distinto de 1) los nombres llevan «-gancho-N». */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, spawnSync, execFileSync } = require('child_process');
const sonido = require('../video/reel/sonido');

const RAIZ = path.join(__dirname, '..');
const SALIDA = path.join(RAIZ, 'video', 'salida');
const FPS = 30;
const GANCHO = process.argv.includes('--gancho') ? process.argv[process.argv.indexOf('--gancho') + 1] : '1';
const NOMBRE = GANCHO === '1' ? 'timbre-reel' : `timbre-reel-gancho-${GANCHO}`;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };

function servidor() {
  return new Promise((resolver) => {
    const s = http.createServer((req, res) => {
      const ruta = path.normalize(path.join(RAIZ, decodeURIComponent(req.url.split('?')[0])));
      if (!ruta.startsWith(RAIZ) || !fs.existsSync(ruta) || fs.statSync(ruta).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(ruta)] || 'application/octet-stream' });
      fs.createReadStream(ruta).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => resolver(s));
  });
}

function wav(archivo, pistas, sr) {
  const n = pistas[0].L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    for (const [k, c] of [[0, 'L'], [1, 'R']]) {
      let v = 0;
      for (const [p, vol] of pistas.map((x) => [x, x.vol])) v += p[c][i] * vol;
      v = Math.tanh(v * 1.2) / Math.tanh(1.2); /* limitador suave para que no recorte */
      buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 4 + k * 2);
    }
  }
  fs.writeFileSync(archivo, buf);
}

/* Sonoridad integrada (LUFS) de un archivo de audio, medida por ffmpeg. */
function sonoridad(archivo) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', archivo, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
  return parseFloat(JSON.parse(r.stderr.slice(r.stderr.lastIndexOf('{'))).input_i);
}

function ffmpeg(args, opciones = {}) {
  return spawn('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: ['pipe', 'inherit', 'inherit'], ...opciones });
}

(async function () {
  let chromium;
  try { ({ chromium } = require('playwright')); } catch (e) {
    console.error('Falta Playwright: npm i --no-save playwright && npx playwright install chromium');
    process.exit(1);
  }
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); } catch (e) {
    console.error('Falta ffmpeg (https://ffmpeg.org/download.html).');
    process.exit(1);
  }
  fs.mkdirSync(SALIDA, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'timbre-reel-'));

  console.log('1/3 Sonido…');
  const efectos = sonido.efectos();
  const musica = sonido.musica();
  wav(path.join(tmp, 'mezcla.wav'), [Object.assign(efectos, { vol: 0.8 }), Object.assign(musica, { vol: 0.3 })], sonido.SR);
  wav(path.join(tmp, 'efectos.wav'), [Object.assign(efectos, { vol: 0.9 })], sonido.SR);

  console.log('2/3 Imagen…');
  const s = await servidor();
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1920 } });
  pagina.on('pageerror', (e) => { console.error('Error en la animación:', e.message); process.exit(1); });
  await pagina.goto(`http://127.0.0.1:${s.address().port}/video/reel/reel.html?gancho=${GANCHO}`);
  await pagina.waitForFunction(() => document.body.dataset.listo === '1');
  const duracion = await pagina.evaluate(() => window.DURACION);
  const cuadros = Math.round(duracion * FPS);
  const video = path.join(tmp, 'video.mp4');
  const fx = ffmpeg(['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), video]);
  const terminado = new Promise((ok, mal) => fx.on('close', (c) => (c === 0 ? ok() : mal(new Error('ffmpeg falló')))));
  for (let i = 0; i < cuadros; i++) {
    await pagina.evaluate((t) => window.render(t), i / FPS);
    const jpg = await pagina.screenshot({ type: 'jpeg', quality: 95 });
    if (!fx.stdin.write(jpg)) await new Promise((r) => fx.stdin.once('drain', r));
    if (i % 150 === 0) process.stdout.write(`   ${Math.round((i / cuadros) * 100)}%\n`);
  }
  fx.stdin.end();
  await terminado;
  await pagina.evaluate((t) => window.render(t), 1.4);
  await pagina.screenshot({ path: path.join(SALIDA, `${NOMBRE}-portada.jpg`), type: 'jpeg', quality: 90 });
  await navegador.close();
  s.close();

  console.log('3/3 Uniendo imagen y sonido…');
  /* Volumen llevado a unos −14 LUFS (el nivel al que Instagram, TikTok y YouTube dejan el audio),
     con un limitador para que los picos queden por debajo de −1 dB y no se distorsione al comprimir. */
  for (const [nombre, audio] of [[`${NOMBRE}.mp4`, 'mezcla.wav'], [`${NOMBRE}-solo-efectos.mp4`, 'efectos.wav']]) {
    const ganancia = (-14 - sonoridad(path.join(tmp, audio))).toFixed(2);
    await new Promise((ok, mal) => ffmpeg(['-i', video, '-i', path.join(tmp, audio), '-map', '0:v', '-map', '1:a',
      '-c:v', 'copy', '-af', `volume=${ganancia}dB,alimiter=limit=0.7:level=false:latency=true`, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
      '-t', String(duracion), '-movflags', '+faststart', path.join(SALIDA, nombre)]).on('close', (c) => (c === 0 ? ok() : mal(new Error('ffmpeg falló')))));
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Listo: video/salida/');
})().catch((e) => { console.error(e); process.exit(1); });
