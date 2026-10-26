# Workflows de n8n

Cinco workflows listos para importar. Cada uno trae una nota amarilla con lo esencial y un nodo **Datos del negocio** donde se cambian todos los datos del cliente; el resto no hay que tocarlo.

## Importar

1. En el n8n del cliente: *Workflows → Add workflow → … → Import from File* y elija el `.json`.
2. Abra el nodo **Datos del negocio** y reemplace todo lo que está entre `[CORCHETES]`.
3. Cree las credenciales de la lista de cada guía y asígnelas en cada nodo que muestre un aviso rojo.
4. En los nodos de Google Sheets, pegue el ID de la hoja (la parte larga de la URL entre `/d/` y `/edit`) y elija la pestaña.
5. Pruebe con *Execute workflow* (o *Listen for test event* en los webhooks) y active el workflow con el interruptor.

La zona horaria de los workflows es `America/Bogota`. Para Puerto Rico use `America/Puerto_Rico` (*Settings* del workflow) y cambie `zonaHoraria`, `desfaseUTC` (`-04:00`) e `indicativoPais` (`1`) en **Datos del negocio**.

## Credenciales que usted crea (por cliente)

| Credencial en n8n | Para qué | Se usa en | Cómo se crea |
|---|---|---|---|
| Google Sheets OAuth2 API | Leer y escribir la hoja | E1–E5 | *Credentials → New → Google Sheets OAuth2*. En n8n Cloud basta con «Sign in with Google» usando la cuenta del negocio. En n8n propio, crear un cliente OAuth en Google Cloud Console (proyecto del cliente). |
| Gmail OAuth2 | Correos al cliente y alertas al dueño | E1, E2, E3 | Igual que Sheets, con la cuenta de Gmail del negocio. |
| Header Auth «WhatsApp Cloud API (token)» | Enviar mensajes por la Graph API | E2–E5 | Name: `Authorization` · Value: `Bearer <token permanente del usuario del sistema>` (Meta Business Suite → Configuración → Usuarios del sistema → Generar token con `whatsapp_business_messaging`). |
| WhatsApp Trigger API | Recibir mensajes entrantes | E3 | Client ID y Client Secret de la app de Meta del cliente (developers.facebook.com → su app → Configuración básica). Luego, en la app de Meta, suscribir el webhook de WhatsApp al campo `messages`. |
| Header Auth «Anthropic (x-api-key)» (opcional) | IA para preguntas sin palabra clave | E3 | Name: `x-api-key` · Value: la clave de API del cliente en console.anthropic.com. Solo si el cliente contrata la IA. |

Datos de Meta que van en **Datos del negocio**: `whatsappPhoneNumberId` (WhatsApp → Configuración de la API → *Phone number ID*).

> **Número de WhatsApp.** La Cloud API usa un número registrado en la plataforma de Meta. Verifique si el número del negocio puede usar la *coexistencia* (app de WhatsApp Business y API a la vez); si no, la API necesita un número que no esté en la app.

## Guías nodo por nodo

- `e1-formulario-sheets-correo.md`
- `e2-formulario-whatsapp.md`
- `e3-whatsapp-palabras-clave.md`
- `e4-recordatorios-citas.md`
- `e5-resenas-seguimiento.md`
