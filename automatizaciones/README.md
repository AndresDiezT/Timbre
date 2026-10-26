# Automatizaciones de Timbre

Automatizaciones reales que se instalan **en las cuentas de cada cliente**. Timbre no tiene servidores compartidos ni guarda datos de clientes: cada negocio es dueño de su n8n o Make, su hoja de Google, su correo y su número de WhatsApp.

| Código | Qué hace | n8n | Make |
|---|---|---|---|
| E1 | Formulario → Google Sheets → correo inmediato al cliente → alerta al dueño | `n8n/e1-formulario-sheets-correo.json` | `make/guia-e1-e3.md` |
| E2 | Formulario → plantilla de WhatsApp (Cloud API) → Sheets → alerta | `n8n/e2-formulario-whatsapp.json` | `make/guia-e1-e3.md` |
| E3 | Mensaje entrante de WhatsApp → respuesta por palabra clave (IA opcional) → registro → alerta si pide una persona | `n8n/e3-whatsapp-palabras-clave.json` | `make/guia-e1-e3.md` |
| E4 | Recordatorios de citas 24 h y 2 h antes | `n8n/e4-recordatorios-citas.json` | — |
| E5 | Solicitud de reseña tras «Pagó» y seguimiento a cotizaciones a los 2 y 5 días | `n8n/e5-resenas-seguimiento.json` | — |

Otros archivos:

- `plantillas-whatsapp.md`: plantillas para aprobación de Meta (español e inglés), con categoría y variables.
- `formulario-ejemplo.html`: formulario de prueba con la autorización de datos (Ley 1581) que envía a E1 o E2.
- `hojas-de-calculo.md`: columnas exactas de cada hoja de Google.

## Dónde corre cada automatización

Siempre en una cuenta a nombre del cliente:

1. **n8n Cloud** del cliente (plan pago del cliente; tiene prueba gratis). Es lo más simple de mantener.
2. **n8n en un servidor del cliente** (por ejemplo, un VPS pequeño contratado por él). Más barato, pero alguien debe mantenerlo actualizado.
3. **Make** del cliente (ver `make/guia-e1-e3.md` y los créditos estimados).

Timbre entra como colaborador invitado y sale al terminar. Las credenciales las crea el dueño o se crean con él en una videollamada; nunca se piden contraseñas por mensaje.

## Reglas que no se negocian

- Solo se escribe a quien pidió que lo contactaran (formulario con casilla de autorización) o a quien escribió primero.
- Nada de llamadas salientes con IA, SMS masivos ni listas compradas. Nada de datos de salud.
- Las plantillas de WhatsApp se usan solo para lo que dice su categoría y se respetan las políticas de WhatsApp Business.
- Cada mensaje de marketing tiene forma de darse de baja.
- La IA es opcional, va desactivada por defecto y solo responde con la información que el negocio le da.
