# Hojas de Google para las automatizaciones

Cree **una hoja de cálculo por cliente**, en el Google Drive del cliente, con estas pestañas. La primera fila son los encabezados, escritos exactamente así.

## Leads (E1 y E2)

| Fecha | Nombre | Teléfono | Correo | Servicio | Mensaje | Autorización | Origen | Estado | WhatsApp |
|---|---|---|---|---|---|---|---|---|---|

`WhatsApp` solo la usa E2 (guarda el id del mensaje enviado o el error).

## Conversaciones (E3)

| Fecha | Nombre | Teléfono | Mensaje | Categoría | Respuesta | Fuente |
|---|---|---|---|---|---|---|

## Citas (E4)

| ID | Cliente | Teléfono | Fecha | Hora | Servicio | Estado | Recordatorio24 | Recordatorio2 |
|---|---|---|---|---|---|---|---|---|
| 1 | Laura Gómez | 3001234567 | 2026-11-05 | 15:30 | Corte y barba | Confirmada | | |

- `Fecha` en formato AAAA-MM-DD y `Hora` en HH:MM de 24 horas (formato de texto sin formato en Sheets, para que Google no las convierta).
- Si una cita se cancela, escriba «Cancelada» en `Estado` y no se envían recordatorios.
- Las columnas `Recordatorio24` y `Recordatorio2` las llena la automatización.

## Clientes (E5)

| ID | Cliente | Teléfono | Estado | FechaCotizacion | RespondioCotizacion | Seguimiento1 | Seguimiento2 | ResenaEnviada |
|---|---|---|---|---|---|---|---|---|
| 7 | Carlos Pérez | 3009876543 | Cotizó | 2026-11-02 | | | | |

- `Estado`: el dueño escribe «Cotizó» cuando envía una cotización y «Pagó» cuando le pagan.
- `RespondioCotizacion`: «Sí» si el cliente contestó (así no le llegan seguimientos).
- Las etiquetas de la app de WhatsApp Business **no** se pueden leer desde fuera; por eso el estado vive en esta hoja.
