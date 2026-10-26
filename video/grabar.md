# Cómo grabar los videos con el simulador

El simulador tiene un **modo grabación** que oculta los controles y centra el escenario en un formato fijo. No hace falta editar capturas: se graba la pantalla tal cual.

## URL listas

| Video | URL (agregue `&asesora=CODIGO` si es para una asesora) |
|---|---|
| Colombia 16:9 | `/demo/?gremio=panaderia&modo=auto&formato=169&grabar=1` |
| Colombia 9:16 (Reels, TikTok) | `/demo/?gremio=panaderia&modo=auto&formato=916&grabar=1` |
| PR y EE. UU. 16:9 | `/demo/?gremio=restaurante&m=usd&modo=auto&formato=169&grabar=1` |
| PR y EE. UU. 9:16 | `/demo/?gremio=restaurante&m=usd&modo=auto&formato=916&grabar=1` |
| Inglés 16:9 (Upwork) | `/demo/en.html?gremio=cleaning&formato=169&grabar=1` |
| Inglés 9:16 | `/demo/en.html?gremio=cleaning&formato=916&grabar=1` |
| Con el nombre de un negocio | agregue `&nombre=Panadería%20Doña%20Rosa` (solo con permiso del dueño) |

`velocidad=0.6` hace todo más lento si la voz necesita más tiempo; `velocidad=1.5` lo acelera.

## Paso a paso

1. **Prepare el computador:** active «No molestar», cierre pestañas con notificaciones y use el navegador en modo claro (o el oscuro, pero el mismo en todo el video).
2. **Tamaño de ventana:** para 16:9, ventana a pantalla completa (F11) en un monitor 1920×1080. Para 9:16 hay dos opciones:
   - En la misma pantalla: el escenario vertical queda centrado; grabe solo esa zona (en OBS: *Fuente → Captura de pantalla → Recortar*, o use un lienzo de 1080×1920).
   - Con las herramientas de desarrollador (F12) → modo dispositivo → tamaño personalizado 1080×1920.
3. **Abra la URL** de la tabla. El modo automático arranca solo y se repite en bucle (unos 45 segundos por vuelta, con la tarjeta final).
4. **Sonido:** si quiere el «tilín» de la campanita, salga del modo grabación (Esc), toque «Sonido apagado» para encenderlo y vuelva a «Modo grabación». Por defecto va silenciado.
5. **Grabe** con OBS Studio (gratis) o con la grabadora del sistema: 30 cuadros por segundo, 1080p. Espere a que empiece una vuelta nueva (cuando desaparece la tarjeta amarilla) y grabe una vuelta completa.
6. **Las tomas de la página principal** (control de hora, Google Maps, planes y garantía) se graban en `/` con `?m=co` o `?m=usd`, desplazándose despacio. En la versión 9:16 use el modo dispositivo de 390 px de ancho.
7. **Voz:** grábela aparte siguiendo el guion (`guion-colombia.md`, `guion-usd.md` o `guion-upwork-en.md`) y móntela sobre las tomas en CapCut, DaVinci Resolve o el editor que use.
8. **Subtítulos:** importe el archivo `.srt` de `subtitulos/` en el editor y ajuste los tiempos a su voz. En 9:16 súbalos al tercio medio para que no los tapen los botones de Reels o TikTok.
9. **Exporte:** 16:9 a 1920×1080; 9:16 a 1080×1920; MP4 H.264, 30 fps. Reels y TikTok: menos de 90 segundos.
10. **Publique el enlace** del video en `config/marca.json → video` y en los textos del WhatsApp de Timbre (`[ENLACE VIDEO]`).

## Reglas

- En pantalla siempre debe verse «Demostración de Timbre» (ya lo muestra el simulador).
- Solo negocios ficticios, salvo que el dueño haya autorizado usar su nombre.
- No muestre números de clientes reales ni conversaciones reales.
- No diga que Timbre aumenta las ventas: «nadie se queda sin respuesta» es la promesa.
