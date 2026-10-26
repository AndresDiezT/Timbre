# E3 · Mensaje entrante de WhatsApp → palabra clave (IA opcional) → registro → alerta

Cuando un cliente escribe al WhatsApp del negocio (Cloud API), recibe una respuesta según lo que pregunta: precios, horario, ubicación o medios de pago. Si pide una persona, el dueño recibe una alerta. Todo queda en la hoja. La IA es opcional y viene apagada.

Archivo: `e3-whatsapp-palabras-clave.json`

> Las respuestas se envían dentro de la **ventana de 24 horas** que se abre cuando el cliente escribe; por eso no necesitan plantilla. Son mensajes de servicio.

## Credenciales

- WhatsApp Trigger API (Client ID y Secret de la app de Meta)
- Header Auth «WhatsApp Cloud API (token)»
- Google Sheets OAuth2 API
- Gmail OAuth2
- Opcional: Header Auth «Anthropic (x-api-key)»

## Nodo por nodo

| # | Nodo | Tipo | Qué hace | Qué configurar |
|---|---|---|---|---|
| 1 | Mensaje entrante | WhatsApp Trigger (`messages`) | Recibe cada mensaje que llega al número. n8n registra el webhook en la app de Meta al activar. | Credencial WhatsApp Trigger. |
| 2 | Datos del negocio | Set | Horario, dirección, enlaces, medios de pago, respuesta por defecto, `usarIA` y la información para la IA. | Reemplace los `[CORCHETES]`. |
| 3 | Leer mensaje | Code | Saca número, nombre, texto y fecha. Ignora los avisos de «entregado» y «leído». | Nada. |
| 4 | Respuesta por palabra clave | Code | Busca palabras (sin tildes ni mayúsculas) en el orden: persona, precios, horario, ubicación, pago. Si nada coincide, usa la respuesta por defecto. | Ajuste las listas `palabras` y los textos a cada negocio. |
| 5 | IA opcional (Claude) | HTTP Request · POST `api.anthropic.com/v1/messages` | **Desactivado.** Si se activa y `usarIA` es `si`, responde preguntas sin palabra clave usando solo la información del negocio, con el modelo `claude-haiku-5-5`. | Para activarlo: credencial con la clave del cliente, `usarIA = si`, clic derecho → *Activate*. |
| 6 | Elegir texto | Code | Usa la respuesta de la IA si existe; si no, la de palabra clave o la de por defecto. | Nada. |
| 7 | Responder por WhatsApp | HTTP Request · POST Graph API | Envía el texto al cliente. | Credencial del token. |
| 8 | Registrar conversación | Google Sheets · Append row | Fila en `Conversaciones` con mensaje, categoría, respuesta y fuente. | ID de la hoja. |
| 9 | ¿Pide una persona? | If | Sigue solo si el cliente pidió hablar con alguien. | Nada. |
| 10 | Alerta: pide una persona | Gmail · Send | Correo al dueño con el mensaje y el número. | Nada. |

## Buenas prácticas

- No ponga menús numerados en la respuesta por defecto («escriba 1 para…»): invite a escribir con palabras.
- Si el cliente escribe muchas veces seguidas, recibirá varias respuestas. Para negocios con mucho volumen, agregue una pausa o un registro de «ya respondido hoy» (cotizar como ajuste).
- Si el negocio usa también la app de WhatsApp Business con coexistencia, el dueño ve estas respuestas en su celular.

## Costo

Mensajes de servicio dentro de la ventana de 24 horas (según Timbre, 1.000 gratis al mes por número desde el 1 de octubre de 2026; verificar con Meta). La IA, si se activa, cobra por uso en la cuenta del cliente.
