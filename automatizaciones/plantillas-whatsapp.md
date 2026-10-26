# Plantillas de WhatsApp para aprobación de Meta

Plantillas para la WhatsApp Business Platform (Cloud API). Se crean en **Meta Business Suite → WhatsApp Manager → Plantillas de mensajes**, en la cuenta del cliente.

## Antes de crear

- **Precios.** Según la información de Timbre, **desde el 1 de octubre de 2026 cada número tiene 1.000 mensajes de servicio gratis al mes y las plantillas se pagan** (cada plantilla enviada se cobra según su categoría y el país del destinatario). Confirme la tabla vigente en la documentación de precios de Meta antes de cotizarle al cliente.
- **Mensajes de servicio** = respuestas dentro de las 24 horas siguientes al último mensaje del cliente. No necesitan plantilla (E3 los usa).
- **Plantillas** = mensajes que el negocio inicia o que van fuera de esas 24 horas (E2, E4 y E5).
- **Categorías:** *Utilidad* (confirmaciones, recordatorios y avisos sobre algo que el cliente pidió) y *Marketing* (todo lo que promociona, invita a volver o pide reseñas). Meta puede reclasificar una plantilla: si una de utilidad queda como marketing, cuesta más.
- **Variables:** se escriben `{{1}}`, `{{2}}`… Cada una necesita un ejemplo al enviarla a revisión. No pueden ir al principio ni al final del texto, ni dos seguidas.
- **Idioma:** `es` (español) y `en_US` (inglés). El idioma de la plantilla debe coincidir con `idiomaPlantilla` en n8n.
- Sin emojis de más, sin mayúsculas sostenidas, sin enlaces acortados. El nombre de la plantilla: minúsculas y guiones bajos.
- Solo se envían a personas que aceptaron recibir mensajes del negocio.

---

## 1. `confirmacion_solicitud` · Utilidad · E2

**Español (`es`)**

```
Hola, {{1}}. Gracias por escribir a {{2}}. Recibimos su solicitud de {{3}} y le respondemos muy pronto por este medio.
```

Ejemplos: `{{1}}` Laura · `{{2}}` Barbería El Parche · `{{3}}` corte y barba
Botón (opcional): respuesta rápida «Tengo una pregunta»

**English (`en_US`)**

```
Hi {{1}}, thanks for contacting {{2}}. We received your request for {{3}} and we'll get back to you here shortly.
```

Examples: Maria · Tidy Wren Cleaning · a deep clean

## 2. `recordatorio_cita_24h` · Utilidad · E4

**Español**

```
Hola, {{1}}. Le recordamos su cita de {{2}} el {{3}} a las {{4}} en {{5}}. Si necesita cambiarla, responda a este mensaje.
```

Ejemplos: Laura · corte y barba · jueves 5 de noviembre · 3:30 p. m. · Barbería El Parche
Botones: respuesta rápida «Confirmo» y «Necesito cambiarla»

**English**

```
Hi {{1}}, this is a reminder of your {{2}} appointment on {{3}} at {{4}} with {{5}}. Need to reschedule? Just reply to this message.
```

## 3. `recordatorio_cita_2h` · Utilidad · E4

**Español**

```
Hola, {{1}}. Su cita de {{2}} es hoy, {{3}}, a las {{4}}. Lo esperamos en {{5}}.
```

**English**

```
Hi {{1}}, your {{2}} appointment is today, {{3}}, at {{4}}. See you soon at {{5}}.
```

## 4. `solicitud_resena` · Marketing · E5

Meta suele clasificar las solicitudes de reseña como marketing. Agregue el botón de darse de baja que ofrece Meta para marketing.

**Español**

```
Hola, {{1}}. Gracias por elegir a {{2}}. Si quedó contento con el servicio, nos ayuda mucho con una reseña en Google: {{3}}
Si no desea recibir más mensajes, toque «Dejar de recibir».
```

Ejemplos: Carlos · Repostería Dulce Coquí · https://g.page/r/EJEMPLO/review
(Se puede usar un botón de URL con el enlace en lugar de la variable `{{3}}`.)

**English**

```
Hi {{1}}, thanks for choosing {{2}}. If you were happy with the service, a quick Google review would mean a lot to us: {{3}}
Not interested in these messages? Tap "Stop".
```

Nunca ofrezca descuentos ni regalos a cambio de reseñas.

## 5. `seguimiento_cotizacion_1` · Marketing · E5 (día 2)

**Español**

```
Hola, {{1}}. Le escribimos de {{2}} para saber si pudo revisar la cotización que le enviamos. Si tiene alguna pregunta, con gusto se la respondemos por aquí.
```

**English**

```
Hi {{1}}, it's {{2}}. Just checking whether you had a chance to look at the quote we sent. Happy to answer any questions here.
```

## 6. `seguimiento_cotizacion_2` · Marketing · E5 (día 5)

**Español**

```
Hola, {{1}}. Este es nuestro último mensaje sobre su cotización de {{2}}. Si más adelante la necesita, aquí estamos. Gracias por tenernos en cuenta.
```

**English**

```
Hi {{1}}, this is our last note about your quote from {{2}}. If you need us later, just reply anytime. Thanks for considering us.
```

## 7. `alerta_dueno` · Utilidad (opcional)

Para avisarle al dueño por WhatsApp en vez de por correo. El dueño debe haber aceptado recibir estos avisos.

**Español**

```
Nuevo contacto en {{1}}: {{2}}, teléfono {{3}}. Escribió: {{4}}. Revise la hoja de clientes para responder.
```

**English**

```
New lead for {{1}}: {{2}}, phone {{3}}. They wrote: {{4}}. Check your lead sheet to follow up.
```

---

## Si Meta rechaza una plantilla

- Quite palabras promocionales de las plantillas de utilidad («oferta», «descuento», «no se lo pierda»).
- Revise que ninguna variable quede al principio o al final y que los ejemplos sean realistas.
- Si la reclasifican como marketing, decida con el cliente si la usa así (más costosa) o si cambia el texto.
