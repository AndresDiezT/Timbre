# E5 · Solicitud de reseña tras «Pagó» y seguimiento a cotizaciones

Todos los días a las 10:00 revisa la pestaña `Clientes`:

- Si el estado es **Pagó** y aún no se pidió reseña, envía la plantilla de reseña con el enlace de Google.
- Si el estado es **Cotizó**, el cliente no ha respondido y pasaron **2 días** desde la cotización, envía el primer seguimiento; a los **5 días**, el segundo. Nunca más de dos.

Archivo: `e5-resenas-seguimiento.json`

> Las etiquetas «Pagó» y «Cotizó» de la app de WhatsApp Business no se pueden leer desde una automatización. El dueño marca el estado en la hoja (o lo hace su sistema de ventas).

## Credenciales

- Header Auth «WhatsApp Cloud API (token)»
- Google Sheets OAuth2 API

## Antes de importar

- Plantillas aprobadas: `solicitud_resena` (3 variables: nombre, negocio, enlace), `seguimiento_cotizacion_1` y `seguimiento_cotizacion_2` (2 variables: nombre y negocio). Ver `../plantillas-whatsapp.md`.
- Enlace de reseñas del perfil del negocio en Google (en el perfil: *Pedir reseñas* → copiar enlace).
- Pestaña `Clientes` con las columnas de `../hojas-de-calculo.md`.

## Nodo por nodo

| # | Nodo | Tipo | Qué hace | Qué configurar |
|---|---|---|---|---|
| 1 | Todos los días 10:00 | Schedule Trigger | Arranca una vez al día. | Cambie la hora si quiere. |
| 2 | Datos del negocio | Set | Phone number ID, enlace de reseñas, nombres de plantillas, idioma, indicativo y zona horaria. | Reemplace los `[CORCHETES]`. |
| 3 | Leer clientes | Google Sheets · Get rows | Trae `Clientes`. | ID de la hoja. |
| 4 | ¿Qué enviar hoy? | Code | Decide reseña, seguimiento 1 o seguimiento 2 para cada fila, según estado y días desde la cotización. | Nada. |
| 5 | WhatsApp: plantilla | HTTP Request · Graph API | Envía la plantilla con sus variables. | Credencial del token. |
| 6 | Marcar en la hoja | Google Sheets · Update row (por `ID`) | Escribe la fecha en `ResenaEnviada`, `Seguimiento1` o `Seguimiento2`. | ID de la hoja. |

## Cuidado

- Ofrezca siempre la reseña sin condiciones: no se ofrecen descuentos ni regalos a cambio de reseñas (va contra las políticas de Google).
- Si el cliente responde «no me interesa», márquelo como «Respondió» para que no reciba más seguimientos.
- Las plantillas de seguimiento suelen quedar como **marketing**: llevan opción de darse de baja.
