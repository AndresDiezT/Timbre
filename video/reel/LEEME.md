# Reel de Timbre con voz (9:16, 42 segundos)

Video vertical para Instagram Reels, TikTok, YouTube Shorts y los Estados de WhatsApp. Estilo oscuro con un teléfono en 3D, voz en off y subtítulos grandes que aparecen palabra por palabra al ritmo de la voz (se entiende también con el sonido apagado).

**Archivos listos** en `video/salida/`:

| Archivo | Para qué |
|---|---|
| `timbre-reel.mp4` | Voz, efectos y música propia. Para Estados de WhatsApp, Facebook, enviar por chat o subir tal cual. |
| `timbre-reel-sin-musica.mp4` | Voz y efectos. Para Reels o TikTok, poniéndole una canción desde la app con el volumen bajo (10 a 20 %) para que se entienda la voz. |
| `timbre-reel-portada.jpg` | Portada. |

Página para compartir: **https://timbre-demo.netlify.app/video/** (el video, el botón de WhatsApp y el enlace para probar un pedido). Con `?asesora=T101` el mensaje de WhatsApp lleva el código de la asesora.

## Qué dice

| Segundos | Voz | Pantalla |
|---|---|---|
| 0–4 | «Este pedido llegó casi a las once de la noche, con el negocio cerrado.» | Pantalla bloqueada con el aviso de un pedido de $90.000. |
| 4–8 | «Sin Timbre, el cliente pregunta… y nadie le responde.» | Preguntas sin contestar y «Sin respuesta». |
| 8–10 | «Con Timbre, nadie se queda sin respuesta.» | Suena el timbre. |
| 10–17 | «Su cliente arma el pedido desde el celular, y a usted le llega completo a su WhatsApp, con el total.» | La página del negocio y el pedido que llega al chat. |
| 17–18 | «Sin comisiones por pedido.» | Sello «Sin comisiones · $0 por pedido». |
| 19–22 | «Y si ya cerró, su WhatsApp contesta al instante.» | La respuesta automática. |
| 22–27 | «¿Trabaja con citas? Sus clientes eligen servicio, día y hora, y usted confirma con un toque.» | Barbería: reserva y confirmación con una respuesta rápida. |
| 28–35 | «Cuatrocientos cincuenta mil pesos de instalación, cincuenta y nueve mil al mes, y el saldo lo paga cuando lo vea funcionando.» | Precio, «Listo en 5 días hábiles», «Sin comisiones · sin permanencia». |
| 35–42 | «Toque el timbre: escríbanos por WhatsApp y pruebe un pedido usted mismo.» | WhatsApp 314 331 9442 y timbre-demo.netlify.app. |

Todo lo que muestra el video lo hace el producto. No promete más ventas ni muestra cifras de resultados, y los negocios son ficticios («Demostración»).

## La voz

- Es una **voz generada con IA**: Supertonic 3, de Supertone (voz «M5», la número 10 del muestrario), a velocidad 1,1. Se genera en el computador, sin servicios pagos ni claves.
- Licencia del modelo: OpenRAIL-M, que permite el uso comercial del audio con reglas de uso responsable (por ejemplo, no hacerse pasar por una persona real).
- Al final del video dice «Voz generada con IA». Al publicar, active también la etiqueta de contenido con IA que ofrecen Instagram y TikTok.

## Cómo publicarlo

**Texto para la publicación** (Instagram, TikTok o Facebook):

```
Su cliente arma el pedido desde el celular y a su WhatsApp le llega completo, con el total. Sin comisiones por pedido y sin apps que instalar.

Para restaurantes, panaderías, tiendas, barberías y talleres.

Pruebe un pedido usted mismo: timbre-demo.netlify.app
O escríbanos al WhatsApp 314 331 9442

Demostración con negocios ficticios. Voz generada con IA.

#negociospequeños #emprendedorescolombia #[CIUDAD]
```

**Comentario fijado:** «¿Qué negocio tiene? Escríbalo aquí y le mostramos cómo quedaría el suyo.» Responda cada comentario el mismo día: es lo que más ayuda a que el video se siga mostrando.

**Estados de WhatsApp:** suba `timbre-reel.mp4` a su Estado y pídales a las asesoras que lo suban al suyo. Para enviarlo por chat, mejor el enlace de la página (con el código de la asesora): pesa menos y trae el botón de WhatsApp.

**Música en Reels o TikTok:** en cuentas de empresa solo se pueden usar canciones de la biblioteca comercial de la app. Use `timbre-reel-sin-musica.mp4` si quiere elegir la canción allí. No le ponga canciones bajadas de internet: silencian o bajan el video.

**Qué medir** (en las estadísticas de la app, no en los «me gusta»): cuántos pasan de los 3 segundos, tiempo promedio de reproducción, cuántos lo guardan o comparten y, sobre todo, cuántos escriben al WhatsApp diciendo que vieron el video. Ningún video garantiza clientes: su trabajo es que el dueño del negocio escriba; la venta se hace en la conversación y en la demostración.

## Cómo cambiarlo y volverlo a sacar

1. **Textos:** `guion.json`. En cada subtítulo, «dice» es lo que se oye (los números escritos en letras) y «texto» lo que se ve; «resalte» va en amarillo. Para probar otro comienzo, cambie la primera línea.
2. **Voz** (cada vez que cambie el guion):

   ```
   scripts/voz/armar-modelo.sh        # solo la primera vez: baja el modelo de voz (145 MB) desde npm
   python3 scripts/voz/generar.py     # crea video/reel/voz.flac y video/reel/tiempos.json
   ```

   Necesita Python con `onnxruntime` y `numpy`, y ffmpeg. Para otra voz cambie `"estilo"` en `guion.json` (F1 a F5 son de mujer, M1 a M5 de hombre).
3. **Animación y sonido:** `reel.html` (escenas), `eventos.js` (los momentos de cada cosa, calculados desde la voz) y `sonido.js` (efectos y música, sintetizados con código, sin música de nadie). Se ve en el navegador con `npm run servir` en `http://localhost:8080/video/reel/reel.html`.
4. **Renderizar:**

   ```
   npm i --no-save playwright && npx playwright install chromium   # solo la primera vez
   node scripts/video.js
   ```

   Tarda alrededor de un minuto. Sale a 1080 × 1920, 30 cuadros por segundo, H.264 y audio AAC a −14 LUFS, el volumen que usan Instagram, TikTok y YouTube. La música queda unos 13 dB por debajo de la voz y baja un poco cada vez que la voz habla.

Si cambia el precio en `config/planes.json`, cámbielo también en `guion.json` y en la escena de precio de `reel.html`, y vuelva a generar la voz y el video.
