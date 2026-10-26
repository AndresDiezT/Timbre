#!/usr/bin/env python3
"""Timbre — genera la voz en off del reel y los tiempos de cada subtítulo.

Uso: python3 scripts/voz/generar.py [--modelo scripts/voz/modelo]
Lee video/reel/guion.json y escribe:
  video/reel/voz.flac      pista de voz completa (44,1 kHz)
  video/reel/tiempos.json  inicio y fin de cada línea y de cada subtítulo, en segundos
Necesita onnxruntime y numpy, ffmpeg y el modelo (scripts/voz/armar-modelo.sh).
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
sys.path.insert(0, AQUI)
from supertonic import Voz, guardar_wav  # noqa: E402

VENTANA = 0.01  # segundos por cuadro de análisis


def silabas(texto):
    """Cuenta aproximada de sílabas: grupos de vocales (suficiente para repartir el tiempo)."""
    texto = texto.lower()
    texto = re.sub(r'y\b', 'i', texto)
    return max(1, len(re.findall(r'[aeiouáéíóúü]+', texto)))


def recortar(audio, sr, umbral=0.015):
    energia = np.abs(audio)
    voz = np.where(energia > umbral * energia.max())[0]
    if not len(voz):
        return audio
    a = max(0, voz[0] - int(0.03 * sr))
    b = min(len(audio), voz[-1] + int(0.08 * sr))
    return audio[a:b]


def tramos_con_voz(audio, sr):
    """Máscara por cuadro de 10 ms: True donde hay voz."""
    n = int(VENTANA * sr)
    cuadros = len(audio) // n
    rms = np.sqrt((audio[:cuadros * n].reshape(cuadros, n) ** 2).mean(axis=1))
    umbral = 0.08 * np.percentile(rms, 95)
    mascara = rms > umbral
    # Une huecos cortos (consonantes sordas) para quedarse solo con las pausas reales.
    i = 0
    while i < len(mascara):
        if not mascara[i]:
            j = i
            while j < len(mascara) and not mascara[j]:
                j += 1
            if j - i < 9 and i > 0 and j < len(mascara):
                mascara[i:j] = True
            i = j
        else:
            i += 1
    return mascara


def repartir(subs, audio, sr):
    """Tiempo de inicio de cada subtítulo dentro de la línea, según sus sílabas y las pausas de la voz."""
    mascara = tramos_con_voz(audio, sr)
    acumulado = np.cumsum(mascara) * VENTANA
    total_voz = acumulado[-1]
    pausas = []
    i = 0
    while i < len(mascara):
        if not mascara[i]:
            j = i
            while j < len(mascara) and not mascara[j]:
                j += 1
            if 0 < i and j < len(mascara):
                pausas.append(((i + j) / 2) * VENTANA)
            i = j
        else:
            i += 1
    pesos = [silabas(s['dice']) for s in subs]
    inicios = [0.0]
    for k in range(1, len(subs)):
        objetivo = total_voz * sum(pesos[:k]) / sum(pesos)
        t = float(np.searchsorted(acumulado, objetivo) * VENTANA)
        cerca = [p for p in pausas if abs(p - t) < 0.35]
        if cerca:
            t = min(cerca, key=lambda p: abs(p - t))
        inicios.append(max(t, inicios[-1] + 0.25))
    return inicios


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--modelo', default=os.environ.get('TIMBRE_MODELO_VOZ', os.path.join(AQUI, 'modelo')))
    ap.add_argument('--guion', default=os.path.join(RAIZ, 'video', 'reel', 'guion.json'))
    args = ap.parse_args()
    if not os.path.exists(os.path.join(args.modelo, 'vocoder.onnx')):
        sys.exit(f'No encuentro el modelo en {args.modelo}. Ármelo con scripts/voz/armar-modelo.sh')

    guion = json.load(open(args.guion, encoding='utf-8'))
    cfg = guion['voz']
    voz = Voz(args.modelo)
    sr = voz.sr
    pista = [np.zeros(int(cfg['inicio'] * sr), np.float32)]
    t = cfg['inicio']
    salida = {'lineas': []}
    for n, linea in enumerate(guion['lineas']):
        texto = ' '.join(s['dice'] for s in linea['subtitulos'])
        audio = recortar(voz.decir(texto, voz=cfg['estilo'], velocidad=cfg['velocidad'], semilla=11 + n), sr)
        inicios = repartir(linea['subtitulos'], audio, sr)
        dur = len(audio) / sr
        subs = []
        for k, s in enumerate(linea['subtitulos']):
            fin = inicios[k + 1] if k + 1 < len(inicios) else dur
            subs.append({'texto': s['texto'], 'resalte': s.get('resalte', ''),
                         'inicio': round(t + inicios[k], 3), 'fin': round(t + fin, 3)})
        salida['lineas'].append({'escena': linea['escena'], 'inicio': round(t, 3), 'fin': round(t + dur, 3), 'subtitulos': subs})
        print(f"{linea['escena']:<11} {t:6.2f} → {t + dur:6.2f}  {texto}")
        pista.append(audio)
        t += dur
        if n + 1 < len(guion['lineas']):
            pista.append(np.zeros(int(cfg['pausa'] * sr), np.float32))
            t += cfg['pausa']
    pista.append(np.zeros(int(cfg['final'] * sr), np.float32))
    audio = np.concatenate(pista)
    audio = audio / np.abs(audio).max() * 0.89
    salida['duracion'] = round(len(audio) / sr, 3)

    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'voz.wav')
        guardar_wav(wav, audio, sr)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'flac',
                        os.path.join(RAIZ, 'video', 'reel', 'voz.flac')], check=True)
    with open(os.path.join(RAIZ, 'video', 'reel', 'tiempos.json'), 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print(f"Duración: {salida['duracion']} s · video/reel/voz.flac y video/reel/tiempos.json")


if __name__ == '__main__':
    main()
