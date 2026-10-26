# E2 · Formulario → plantilla de WhatsApp → Sheets → alerta

Igual que E1, pero la confirmación al cliente llega por **WhatsApp** usando la Cloud API de Meta y una plantilla aprobada.

Archivo: `e2-formulario-whatsapp.json`

## Credenciales

- Header Auth «WhatsApp Cloud API (token)»: `Authorization: Bearer <token>`
- Google Sheets OAuth2 API
- Gmail OAuth2

## Antes de importar

1. Cuenta de WhatsApp Business Platform del cliente en Meta Business Suite, con un número registrado y método de pago (las plantillas se cobran).
2. Plantilla `confirmacion_solicitud` aprobada (texto en `../plantillas-whatsapp.md`). Tiene tres variables: nombre, negocio y servicio.
3. Pestaña `Leads` con la columna extra `WhatsApp`.

## Nodo por nodo

| # | Nodo | Tipo | Qué hace | Qué configurar |
|---|---|---|---|---|
| 1 | Formulario | Webhook (POST `/timbre-e2-formulario`) | Recibe el formulario. | Pegue la URL en el formulario. |
| 2 | Datos del negocio | Set | Negocio, correo del dueño, hoja, `whatsappPhoneNumberId`, nombre e idioma de la plantilla, indicativo del país. | Reemplace los `[CORCHETES]`. Idioma `es` o `en_US`, igual al de la plantilla aprobada. |
| 3 | Validar y limpiar | Code | Exige la autorización de datos y deja el teléfono en formato internacional (agrega el indicativo si viene de 10 dígitos). | Nada. |
| 4 | WhatsApp: confirmación al cliente | HTTP Request · POST Graph API `/messages` | Envía la plantilla con las variables. Si Meta responde con error, sigue y lo anota en la hoja. | Credencial del token. |
| 5 | Guardar en la hoja | Google Sheets · Append row | Fila nueva con el resultado del envío en `WhatsApp`. | ID de la hoja. |
| 6 | Alerta al dueño | Gmail · Send | Aviso con los datos del cliente. | Nada. |
| 7 | Responder al formulario | Respond to Webhook | `{ "ok": true }`. | Nada. |

## Probar

Use su propio número en el formulario de prueba. En la hoja, la columna `WhatsApp` debe decir «Enviado wamid…». Si dice «Error», revise: plantilla aprobada, idioma correcto, número con indicativo y token vigente.

## Costo

Cada confirmación es una plantilla de **utilidad**, que Meta cobra por mensaje según el país. Según la información de Timbre, desde el 1 de octubre de 2026 cada número tiene 1.000 mensajes de servicio gratis al mes y las plantillas se pagan; confirme la tabla vigente en la documentación de precios de WhatsApp Business Platform antes de cotizar.
