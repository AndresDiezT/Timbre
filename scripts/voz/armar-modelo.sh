#!/usr/bin/env bash
# Timbre — arma el modelo de voz Supertonic 3 (unos 145 MB) en scripts/voz/modelo/.
# Lo baja de npm (tres paquetes con el modelo partido) y une las partes. No se guarda en git.
# Modelo: Supertone, licencia OpenRAIL-M (permite uso comercial con restricciones de uso responsable).
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cd "$TMP"
for p in @3sln/donki-lle-voice-multi@0.1.1 @3sln/donki-lle-voice-multi-2@0.1.1 @3sln/donki-lle-voice-multi-3@0.1.1; do
  npm pack "$p" --silent >/dev/null
done
mkdir -p st1 st2 st3
tar xzf 3sln-donki-lle-voice-multi-0.1.1.tgz -C st1
tar xzf 3sln-donki-lle-voice-multi-2-0.1.1.tgz -C st2
tar xzf 3sln-donki-lle-voice-multi-3-0.1.1.tgz -C st3
python3 "$AQUI/armar-modelo.py" "$TMP" "$AQUI/modelo"
echo "Modelo listo en scripts/voz/modelo/"
