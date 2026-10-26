# Reel de Timbre (9:16, 37 segundos)

Video vertical para Instagram Reels, TikTok, YouTube Shorts y los Estados de WhatsApp. Es animación hecha con código, sin cámara y sin voz: todo se entiende con el sonido apagado, que es como lo ve la mayoría.

**Archivos listos** en `video/salida/`:

| Archivo | Para qué |
|---|---|
| `timbre-reel.mp4` | Con música y efectos propios. Para Estados de WhatsApp, Facebook y para enviar por chat. |
| `timbre-reel-solo-efectos.mp4` | Sin música, solo efectos. Para subir a Reels o TikTok y ponerle una canción desde la app. |
| `timbre-reel-portada.jpg` | Portada (el cuadro del segundo 1,4). |

Página para compartir: **https://timbre-demo.netlify.app/video/** (el video, el botón de WhatsApp y el enlace para probar un pedido). Con `?asesora=T101` el mensaje de WhatsApp lleva el código de la asesora.

## Qué cuenta

| Segundos | Pantalla |
|---|---|
| 0–2,7 | Notificación de un pedido de $90.000 a las 9:47 p. m. «Este pedido llegó a las 9:47 p. m., con el negocio cerrado». |
| 2,7–7 | Sin Timbre: «¿Siguen abiertos?», «¿Hacen domicilio?»… y nadie responde. |
| 7–9 | Suena el timbre: «Timbre · Nadie se queda sin respuesta». |
| 9–17 | El cliente arma el pedido en la página del negocio y llega completo al WhatsApp, con el total. Sello «Sin comisiones». |
| 17–21 | Respuesta automática fuera de horario. |
| 21–27 | Reservas: servicio, día y hora; el dueño confirma con una respuesta rápida. |
| 27–32 | Precio: $450.000 + $59.000 al mes, listo en 5 días hábiles, el saldo se paga al verlo funcionando. |
| 32–37 | «Toque el timbre»: WhatsApp 314 331 9442 y timbre-demo.netlify.app. |

El final vuelve a mostrar la notificación del principio, así que el video empalma consigo mismo y la gente lo ve más de una vez sin darse cuenta.

Todo lo que muestra el video lo hace el producto. No promete más ventas ni muestra cifras de resultados, y los negocios son ficticios («Demostración»).

## Ganchos para probar

Los primeros 3 segundos deciden si la gente sigue viendo. Hay 5 versiones del comienzo; el resto del video es igual.

| N.º | Título | Para quién |
|---|---|---|
| 1 | Este pedido llegó a las 9:47 p. m. | Restaurantes y comidas (la principal) |
| 2 | Pedidos por WhatsApp sin pagar comisión | Negocios que usan apps de domicilios |
| 3 | ¿Sus pedidos llegan en 4 audios? | Negocios con muchos pedidos por chat |
| 4 | Esta cita llegó a las 11:20 p. m. | Barberías, salones, talleres |
| 5 | ¿Quién le contesta a este cliente? | Todos |

Cómo probarlos: publique uno por semana, el mismo día y a la misma hora, y compare cuántas personas pasan de los 3 segundos y cuántas escriben. Si algún día pauta, Meta permite probar dos versiones del mismo anuncio con poco presupuesto.

## Cómo publicarlo

**Texto para la publicación** (Instagram, TikTok o Facebook):

```
Su cliente arma el pedido desde el celular y a su WhatsApp le llega completo, con el total. Sin comisiones por pedido y sin apps que instalar.

Para restaurantes, panaderías, tiendas, barberías y talleres.

Pruebe un pedido usted mismo: timbre-demo.netlify.app
O escríbanos al WhatsApp 314 331 9442

Demostración con negocios ficticios.

#negociospequeños #emprendedorescolombia #[CIUDAD]
```

**Comentario fijado:** «¿Qué negocio tiene? Escríbalo aquí y le mostramos cómo quedaría el suyo.» Responda cada comentario el mismo día: es lo que más ayuda a que el video se siga mostrando.

**Estados de WhatsApp:** suba `timbre-reel.mp4` a su Estado y pídales a las asesoras que lo suban al suyo. Para enviarlo por chat, mejor el enlace de la página (con el código de la asesora): pesa menos y trae el botón de WhatsApp.

**Música:** en cuentas de empresa, Instagram y TikTok solo permiten canciones de su biblioteca comercial. Use `timbre-reel-solo-efectos.mp4` y elija la canción dentro de la app, con el volumen bajo para que se sigan oyendo el timbre y los toques. No le ponga canciones bajadas de internet: silencian o bajan el video.

**Qué medir** (en las estadísticas de la app, no en los «me gusta»): cuántos pasan de los 3 segundos, tiempo promedio de reproducción, cuántos lo ven de nuevo, cuántos lo guardan o comparten y, sobre todo, cuántos escriben al WhatsApp diciendo que vieron el video. Ningún video garantiza clientes: su trabajo es que el dueño del negocio escriba; la venta se hace en la conversación y en la demostración.

## Cómo cambiarlo y volverlo a sacar

1. Textos y tiempos: `reel.html`. Abra `http://localhost:8080/video/reel/reel.html` con `npm run servir` para verlo (agregue `?gancho=2` para otro comienzo). Cada escena está comentada con sus segundos.
2. Sonido: `sonido.js`. Está sintetizado con código (no usa música de nadie). Si mueve una escena, mueva también sus sonidos.
3. Renderizar:

   ```
   npm i --no-save playwright && npx playwright install chromium   # solo la primera vez
   node scripts/video.js              # gancho 1
   node scripts/video.js --gancho 3   # otro comienzo (archivos «-gancho-3»)
   ```

   Necesita ffmpeg. Tarda alrededor de un minuto. Sale a 1080 × 1920, 30 cuadros por segundo, H.264 y audio AAC a unos −14 LUFS, el volumen que usan Instagram, TikTok y YouTube.

Los videos de los ganchos 2 a 5 no se guardan en el repositorio (pesan); se sacan con el comando de arriba.

Si cambia el precio en `config/planes.json`, cámbielo también en `reel.html` (escena 7) y vuelva a renderizar.
