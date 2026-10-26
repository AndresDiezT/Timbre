#!/usr/bin/env python3
"""Une las partes del modelo Supertonic 3 publicadas en npm (@3sln/donki-lle-voice-multi*).

Uso: python3 armar-modelo.py <carpeta con st1, st2, st3 descomprimidos> <carpeta de salida>
Lo llama armar-modelo.sh. Comprueba el tamaño exacto de cada archivo.
"""
import base64
import json
import os
import re
import sys

origen, destino = sys.argv[1], sys.argv[2]
os.makedirs(destino, exist_ok=True)
voz = open(os.path.join(origen, 'st1/package/voice.js'), encoding='utf-8').read()
cfg = json.loads(voz[voz.index('{'):voz.rindex('}') + 1])
carpetas = {'@3sln/donki-lle-voice-multi@0.1.1': 'st1', '@3sln/donki-lle-voice-multi-2@0.1.1': 'st2',
            '@3sln/donki-lle-voice-multi-3@0.1.1': 'st3'}
for nombre, info in cfg['files'].items():
    datos = b''
    for parte in info['parts']:
        paquete, ruta = parte.split('/c/')
        js = open(os.path.join(origen, carpetas[paquete], 'package/c', ruta), encoding='utf-8').read()
        m = re.match(r'\s*export default "([A-Za-z0-9+/=]*)";?\s*$', js)
        if not m:
            sys.exit(f'Formato inesperado en {parte}')
        datos += base64.b64decode(m.group(1))
    if len(datos) != info['size']:
        sys.exit(f'{nombre}: tamaño {len(datos)}, se esperaba {info["size"]}')
    with open(os.path.join(destino, nombre), 'wb') as f:
        f.write(datos)
    print(f'{nombre:<24} {len(datos):>10} bytes')
