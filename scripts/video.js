#!/usr/bin/env node
/* Timbre — renderiza el reel vertical con voz (1080 × 1920, 30 cuadros por segundo) a MP4.
   Uso: node scripts/video.js
   Antes, si cambió el guion: python3 scripts/voz/generar.py (crea video/reel/voz.flac y tiempos.json).
   Necesita ffmpeg y Playwright con Chromium (npm i --no-save playwright && npx playwright install chromium).
   Salida en video/salida/:
     timbre-reel.mp4             voz, efectos y música propia
     timbre-reel-sin-musica.mp4  voz y efectos, para ponerle una canción desde Instagram o TikTok
     timbre-reel-portada.jpg     cuadro para la portada */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, spawnSync, execFileSync } = require('child_process');
const sonido = require('../video/reel/sonido');

const RAIZ = path.join(__dirname, '..');
const REEL = path.join(RAIZ, 'video', 'reel');
const SALIDA = path.join(RAIZ, 'video', 'salida');
const FPS = 30;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };

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

function wav(archivo, p, sr) {
  const n = p.L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, p.L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, p.R[i])) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(archivo, buf);
}

/* Sonoridad integrada (LUFS) de un archivo de audio, medida por ffmpeg. */
function sonoridad(archivo) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', archivo, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
  return parseFloat(JSON.parse(r.stderr.slice(r.stderr.lastIndexOf('{'))).input_i);
}

function ffmpeg(args) {
  return new Promise((ok, mal) => spawn('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: ['ignore', 'inherit', 'inherit'] })
    .on('close', (c) => (c === 0 ? ok() : mal(new Error('ffmpeg falló')))));
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
  const voz = path.join(REEL, 'voz.flac');
  if (!fs.existsSync(voz)) { console.error('Falta video/reel/voz.flac: python3 scripts/voz/generar.py'); process.exit(1); }
  const tiempos = JSON.parse(fs.readFileSync(path.join(REEL, 'tiempos.json'), 'utf8'));
  fs.mkdirSync(SALIDA, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'timbre-reel-'));
  const t = (n) => path.join(tmp, n);

  console.log('1/3 Sonido…');
  wav(t('efectos.wav'), sonido.efectos(tiempos), sonido.SR);
  wav(t('musica.wav'), sonido.musica(tiempos), sonido.SR);
  /* La música queda en promedio unos 13 dB por debajo de la voz: se oye, pero baja un poco cada vez que la voz habla. */
  const gMusica = (sonoridad(voz) - 9 - sonoridad(t('musica.wav'))).toFixed(2);
  const vozEstereo = '[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0';
  await ffmpeg(['-i', voz, '-i', t('efectos.wav'), '-i', t('musica.wav'), '-filter_complex',
    `${vozEstereo},asplit=2[v][guia];[2:a]volume=${gMusica}dB[m];[m][guia]sidechaincompress=threshold=0.06:ratio=2.5:attack=25:release=450[md];` +
    '[1:a]volume=0.5[fx];[v][fx][md]amix=inputs=3:normalize=0:duration=longest[s]', '-map', '[s]', t('con-musica.wav')]);
  await ffmpeg(['-i', voz, '-i', t('efectos.wav'), '-filter_complex',
    `${vozEstereo}[v];[1:a]volume=0.5[fx];[v][fx]amix=inputs=2:normalize=0:duration=longest[s]`, '-map', '[s]', t('sin-musica.wav')]);

  console.log('2/3 Imagen…');
  const s = await servidor();
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1920 } });
  pagina.on('pageerror', (e) => { console.error('Error en la animación:', e.message); process.exit(1); });
  await pagina.goto(`http://127.0.0.1:${s.address().port}/video/reel/reel.html`);
  await pagina.waitForFunction(() => document.body.dataset.listo === '1');
  const duracion = await pagina.evaluate(() => window.DURACION);
  const cuadros = Math.round(duracion * FPS);
  const video = t('video.mp4');
  const fx = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), video], { stdio: ['pipe', 'inherit', 'inherit'] });
  const terminado = new Promise((ok, mal) => fx.on('close', (c) => (c === 0 ? ok() : mal(new Error('ffmpeg falló')))));
  for (let i = 0; i < cuadros; i++) {
    await pagina.evaluate((s) => window.render(s), i / FPS);
    const jpg = await pagina.screenshot({ type: 'jpeg', quality: 95 });
    if (!fx.stdin.write(jpg)) await new Promise((r) => fx.stdin.once('drain', r));
    if (i % 150 === 0) process.stdout.write(`   ${Math.round((i / cuadros) * 100)}%\n`);
  }
  fx.stdin.end();
  await terminado;
  await pagina.evaluate((s) => window.render(s), 1.0);
  await pagina.screenshot({ path: path.join(SALIDA, 'timbre-reel-portada.jpg'), type: 'jpeg', quality: 90 });
  await navegador.close();
  s.close();

  console.log('3/3 Uniendo imagen y sonido…');
  /* Volumen llevado a unos −14 LUFS (el nivel al que Instagram, TikTok y YouTube dejan el audio),
     con un limitador para que los picos queden por debajo de −1 dB y no se distorsione al comprimir. */
  for (const [nombre, audio] of [['timbre-reel.mp4', 'con-musica.wav'], ['timbre-reel-sin-musica.mp4', 'sin-musica.wav']]) {
    const ganancia = (-14 - sonoridad(t(audio))).toFixed(2);
    await ffmpeg(['-i', video, '-i', t(audio), '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
      '-af', `volume=${ganancia}dB,alimiter=limit=0.7:level=false:latency=true`, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
      '-t', String(duracion), '-movflags', '+faststart', path.join(SALIDA, nombre)]);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Listo: video/salida/');
})().catch((e) => { console.error(e); process.exit(1); });
