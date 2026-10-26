# WhatsApp de Timbre · +57 314 331 9442

El saludo del WhatsApp de Timbre **es la demostración**: quien escribe recibe una respuesta al instante y comprueba en carne propia cómo respondería el WhatsApp de su negocio.

Textos listos para copiar en la app de WhatsApp Business → *Herramientas para la empresa*.

> **Dos reglas de la app que hay que tener en cuenta**
> 1. La **bienvenida solo se envía** en el primer mensaje de una persona o cuando lleva **14 días** sin conversar con usted. Quien escriba seguido no la vuelve a recibir: para eso están las respuestas rápidas.
> 2. La app **no responde sola a opciones numeradas** («escriba 1 para…»). Por eso los mensajes no tienen menús: invitan a escribir con palabras y Andres contesta con una respuesta rápida.

---

## 1. Perfil de empresa

**Nombre:** Timbre

**Categoría:** Servicios profesionales (o «Servicio de marketing», la más parecida que ofrezca la app)

**Descripción** (≤ 512 caracteres):

```
Dejamos el WhatsApp y su negocio en Google Maps listos para responder solos, de día y de noche. Perfil completo, catálogo con fotos y precios, bienvenida, mensaje fuera de horario, respuestas rápidas, etiquetas, código QR y capacitación gratuita. También hacemos automatizaciones y desarrollos a la medida: citas, tiendas en línea, pedidos y asistentes virtuales con IA. Nadie se queda sin respuesta.
```

**Info / Acerca de** (≤ 139):

```
Nadie se queda sin respuesta. Escríbanos y compruébelo.
```

**Dirección:** [CIUDAD] · Atención en persona y a distancia

**Horario:** [HORARIO DE ATENCIÓN DE TIMBRE]

**Correo:** [CORREO DE CONTACTO]

**Sitio web:** https://timbre-demo.netlify.app/ (cambiar si hay dominio propio)

---

## 2. Mensaje de bienvenida

Destinatarios: todos. (Recuerde la regla de los 14 días.)

```
Hola, gracias por escribir a Timbre.

Este mensaje le llegó solo, al instante: así respondería el WhatsApp de su negocio.

Vea los planes y la demostración aquí: https://timbre-demo.netlify.app/
Video de 1 minuto: [ENLACE VIDEO]

Si una asesora lo visitó, escriba su código (por ejemplo SOFIA o YARIMAR). Cuéntenos qué negocio tiene y le respondemos en un momento.

Andres Diez · Timbre
```

## 3. Mensaje fuera de horario

Horario: «Fuera del horario comercial». Destinatarios: todos.

```
Hola, gracias por escribir a Timbre. En este momento estamos fuera de horario, pero este mensaje le llegó al instante: así respondería el WhatsApp de su negocio aunque usted esté descansando.

Mientras tanto, vea los planes y la demostración: https://timbre-demo.netlify.app/

Déjenos el nombre y el tipo de su negocio, y le escribimos a primera hora.
```

## 4. Respuestas rápidas

Se usan escribiendo «/» en el chat.

**/planes**

```
Estos son nuestros planes, con pago único:

Esencial · $600.000 · entrega en 5 días hábiles
WhatsApp Business con perfil completo y catálogo con fotos y precios, bienvenida y mensaje fuera de horario, respuestas rápidas y etiquetas, su negocio en Google Maps, código QR y capacitación gratuita.

Pro · $900.000 · entrega en 7 a 10 días hábiles
Todo lo del Esencial, más una página web sencilla con botón de WhatsApp y formulario, y un QR para pedir reseñas en Google. El dominio se paga aparte.

Mantenimiento opcional: $80.000 al mes, hasta 5 cambios, sin permanencia.

También están en el catálogo de este WhatsApp. ¿Qué negocio tiene?
```

**/video**

```
Aquí puede ver en un minuto cómo queda el WhatsApp de un negocio con Timbre: [ENLACE VIDEO]

Y aquí puede probar la demostración usted mismo, moviendo la hora del día: https://timbre-demo.netlify.app/
```

**/pago**

```
Se paga 50% al empezar y 50% al entregar, por Bre-B o transferencia.

Nuestra garantía: el saldo lo paga cuando lo vea funcionando. Si algo no queda como acordamos, lo corregimos antes de que pague el resto.
```

**/diagnostico**

```
Para desarrollos a la medida (citas y reservas, tienda en línea, pedidos e inventario, asistentes virtuales con IA o conectar los programas que ya usa) hacemos primero un diagnóstico sin costo.

Es una llamada corta: usted nos cuenta cómo trabaja hoy y qué le quita más tiempo, y le enviamos una propuesta con precio. ¿Qué día y a qué hora le queda bien?
```

> Para clientes de Puerto Rico y EE. UU. en español, cambie los precios de /planes a US$300 (Esencial), US$450 (Pro) y US$40 al mes (Mantenimiento), y en /pago use «por transferencia o tarjeta».

## 5. Etiquetas

```
Nuevo
Demo
Cotizó
Pagó
SOFIA
YARIMAR
```

Cuando alguien escriba un código de asesora, póngale la etiqueta con ese código para saber de dónde llegó.

## 6. Catálogo

Herramientas para la empresa → Catálogo → Agregar artículo. Un artículo por plan, con su imagen:

| Imagen | Nombre | Precio | Descripción |
|---|---|---|---|
| `catalogo/co/01-esencial.png` | Plan Esencial | $600.000 | Pago único. WhatsApp Business completo, su negocio en Google Maps, QR y capacitación gratuita. Entrega en 5 días hábiles. |
| `catalogo/co/02-pro.png` | Plan Pro | $900.000 | Pago único. Todo lo del Esencial, más página web con botón de WhatsApp y formulario, y QR de reseñas. Entrega en 7 a 10 días hábiles. Dominio aparte. |
| `catalogo/co/03-mantenimiento.png` | Mantenimiento | $80.000 | Al mes. Hasta 5 cambios pequeños, revisión mensual y soporte. Sin permanencia. Cambio adicional $15.000. |
| `catalogo/co/04-medida.png` | Desarrollo a la medida | (sin precio) | Citas, tiendas en línea, pedidos e inventario, asistentes virtuales con IA. Se cotiza tras un diagnóstico sin costo. |

Las imágenes salen de `config/planes.json`. Si cambia un precio, regenérelas con:

```bash
node scripts/catalogo-timbre.js
```

También se generan las versiones `catalogo/usd/` (Puerto Rico y EE. UU. en español) y `catalogo/en/` (inglés).
