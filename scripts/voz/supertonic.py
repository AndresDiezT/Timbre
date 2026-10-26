#!/usr/bin/env python3
"""Timbre — voz en off con Supertonic 3 (Supertone), sin internet ni claves.

Usa solo onnxruntime y numpy. El modelo (unos 145 MB, licencia OpenRAIL-M, permite uso
comercial) no se guarda en el repositorio: se arma con scripts/voz/armar-modelo.sh.

Uso como módulo:
    from supertonic import Voz
    voz = Voz('ruta/al/modelo')
    audio = voz.decir('Hola, ¿cómo está?', voz=0, velocidad=1.05)   # numpy float32, 44,1 kHz
"""
import json
import re
import unicodedata
import wave

import numpy as np
import onnxruntime as ort

# Orden de los estilos dentro de voice.bin: alfabético, F1–F5 (mujeres) y M1–M5 (hombres).
NOMBRES = ['F1', 'F2', 'F3', 'F4', 'F5', 'M1', 'M2', 'M3', 'M4', 'M5']


class Voz:
    def __init__(self, carpeta, pasos=10, hilos=4):
        opciones = ort.SessionOptions()
        opciones.intra_op_num_threads = hilos
        abrir = lambda n: ort.InferenceSession(f'{carpeta}/{n}.onnx', opciones, providers=['CPUExecutionProvider'])
        self.dp = abrir('duration_predictor')
        self.enc = abrir('text_encoder')
        self.vec = abrir('vector_estimator')
        self.voc = abrir('vocoder')
        cfg = json.load(open(f'{carpeta}/tts.json', encoding='utf-8'))
        self.sr = cfg['ae']['sample_rate']
        self.bloque = cfg['ae']['base_chunk_size'] * cfg['ttl']['chunk_compress_factor']
        self.ldim = cfg['ttl']['latent_dim'] * cfg['ttl']['chunk_compress_factor']
        self.pasos = pasos
        self.indice = np.frombuffer(open(f'{carpeta}/unicode_indexer.bin', 'rb').read(), dtype='<i4')
        datos = open(f'{carpeta}/voice.bin', 'rb').read()
        dims = np.frombuffer(datos[:48], dtype='<i8')
        n_ttl = int(np.prod(dims[:3]))
        flotantes = np.frombuffer(datos[48:], dtype='<f4')
        self.ttl = flotantes[:n_ttl].reshape(dims[:3])
        self.estilo_dp = flotantes[n_ttl:].reshape(dims[3:])

    @staticmethod
    def preparar(texto, idioma='es'):
        texto = unicodedata.normalize('NFKD', texto)
        for a, b in {'–': '-', '—': '-', '“': '"', '”': '"', '‘': "'", '’': "'", '…': '...', '/': ' ', '_': ' '}.items():
            texto = texto.replace(a, b)
        texto = re.sub(r'\s+', ' ', texto).strip()
        if not re.search(r'[.!?;:,\'")\]]$', texto):
            texto += '.'
        return f'<{idioma}>{texto}</{idioma}>'

    def ids(self, texto, idioma):
        t = self.preparar(texto, idioma)
        cod = [self.indice[ord(c)] if ord(c) < len(self.indice) else -1 for c in t]
        faltan = sorted({c for c, i in zip(t, cod) if i < 0})
        if faltan:
            raise ValueError(f'Caracteres sin soporte: {faltan!r}')
        return np.array([cod], dtype=np.int64)

    def decir(self, texto, voz=0, velocidad=1.05, idioma='es', semilla=7):
        if isinstance(voz, str):
            voz = NOMBRES.index(voz)
        ids = self.ids(texto, idioma)
        mascara = np.ones((1, 1, ids.shape[1]), dtype=np.float32)
        ttl = self.ttl[voz:voz + 1].astype(np.float32)
        sdp = self.estilo_dp[voz:voz + 1].astype(np.float32)
        dur = self.dp.run(None, {'text_ids': ids, 'style_dp': sdp, 'text_mask': mascara})[0] / velocidad
        emb = self.enc.run(None, {'text_ids': ids, 'style_ttl': ttl, 'text_mask': mascara})[0]
        muestras = int(dur[0] * self.sr)
        largo = (muestras + self.bloque - 1) // self.bloque
        rng = np.random.default_rng(semilla)
        x = rng.standard_normal((1, self.ldim, largo)).astype(np.float32)
        mlat = np.ones((1, 1, largo), dtype=np.float32)
        total = np.array([self.pasos], dtype=np.float32)
        for paso in range(self.pasos):
            x = self.vec.run(None, {'noisy_latent': x, 'text_emb': emb, 'style_ttl': ttl, 'latent_mask': mlat,
                                    'text_mask': mascara, 'current_step': np.array([paso], dtype=np.float32),
                                    'total_step': total})[0]
        audio = self.voc.run(None, {'latent': x})[0][0]
        return audio[:muestras].astype(np.float32)


def guardar_wav(ruta, audio, sr):
    pcm = (np.clip(audio, -1, 1) * 32767).astype('<i2')
    with wave.open(ruta, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())
