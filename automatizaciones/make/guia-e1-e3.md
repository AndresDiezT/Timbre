# Make · Guía módulo por módulo de E1 a E3

La misma lógica de los workflows de n8n, armada en Make (make.com) en la cuenta del cliente. Make cobra por **créditos**: cada módulo que se ejecuta gasta 1 crédito; los filtros y los routers no gastan. Las cifras de abajo son estimaciones para **100 leads al mes**; confirme los planes y precios vigentes en make.com.

Conexiones que se crean una vez por cliente (*Connections*): Google Sheets, Gmail y WhatsApp Business Cloud (con el token permanente del usuario del sistema de Meta y el *Phone number ID*).

Hojas: las mismas de `../hojas-de-calculo.md`.

---

## E1 · Formulario → Sheets → correo al cliente → alerta al dueño

| # | Módulo | Configuración |
|---|---|---|
| 1 | **Webhooks › Custom webhook** | Crear webhook «timbre-e1». Copiar la URL al formulario. Enviar una prueba para que Make aprenda los campos. |
| — | Filtro (entre 1 y 2) | Condición: `autorizacion` = `true`. Sin autorización, no sigue. |
| 2 | **Google Sheets › Add a row** | Hoja del cliente, pestaña `Leads`. Mapear Fecha (`now`), Nombre, Teléfono, Correo, Servicio, Mensaje, Autorización («Sí» + fecha), Origen, Estado = «Nuevo». |
| 3 | **Gmail › Send an email** (al cliente) | Para: `correo`. Asunto: «Recibimos su mensaje, {{nombre}}». Texto igual al de n8n. Filtro previo: `correo` existe. |
| 4 | **Gmail › Send an email** (al dueño) | Para: correo del dueño. Asunto: «Nuevo cliente: {{nombre}}». Cuerpo con todos los datos y el enlace a la hoja. |
| 5 | **Webhooks › Webhook response** | Status 200, cuerpo `{"ok":true}`. |

**Créditos por lead:** 5 → **unos 500 al mes** con 100 leads.

## E2 · Formulario → plantilla de WhatsApp → Sheets → alerta

| # | Módulo | Configuración |
|---|---|---|
| 1 | **Webhooks › Custom webhook** | Webhook «timbre-e2». |
| — | Filtro | `autorizacion` = `true` y `telefono` existe. |
| 2 | **Tools › Set multiple variables** (opcional) | `telefonoIntl`: si el teléfono tiene 10 dígitos, anteponer el indicativo (`57` o `1`). |
| 3 | **WhatsApp Business Cloud › Send a Template Message** | Plantilla `confirmacion_solicitud`, idioma `es`. Variables del cuerpo: nombre, negocio, servicio. Destinatario: `telefonoIntl`. En *Error handling* agregar la directiva **Resume** para que un error no detenga el resto. |
| 4 | **Google Sheets › Add a row** | Pestaña `Leads`, con la columna `WhatsApp` = id del mensaje o el error. |
| 5 | **Gmail › Send an email** (al dueño) | Alerta con los datos del cliente. |
| 6 | **Webhooks › Webhook response** | `{"ok":true}`. |

**Créditos por lead:** 5 o 6 → **unos 500 a 600 al mes**. A esto se suma lo que Meta cobra por cada plantilla.

## E3 · Mensaje de WhatsApp → palabra clave → registro → alerta

| # | Módulo | Configuración |
|---|---|---|
| 1 | **WhatsApp Business Cloud › Watch Events** | Conexión del cliente. Make crea el webhook; en la app de Meta, suscribir el campo `messages`. |
| — | Filtro | Solo eventos que traen mensaje de texto (`messages[].text.body` existe). Así los avisos de «entregado» y «leído» no siguen. |
| 2 | **Tools › Set variable** | `texto` = mensaje en minúsculas y sin tildes (`lower` + `replace` de á é í ó ú). |
| 3 | **Router** con 6 rutas y filtros | Persona (`persona`, `asesor`, `hablar con`, `llamar`, `urgente`) · Precios (`precio`, `cuanto`, `vale`, `catalogo`) · Horario (`horario`, `abren`, `cierran`) · Ubicación (`donde`, `direccion`, `llegar`) · Pago (`pago`, `nequi`, `tarjeta`, `transferencia`) · Ruta por defecto (*fallback*). |
| 4 | **WhatsApp Business Cloud › Send a Message** (uno por ruta) | Tipo texto, destinatario: el número que escribió. Mismos textos que en n8n. Va dentro de la ventana de 24 horas, sin plantilla. |
| 5 | **Google Sheets › Add a row** (al final de cada ruta, o después de un **Flow control › Aggregator**) | Pestaña `Conversaciones`: fecha, nombre, teléfono, mensaje, categoría, respuesta. |
| 6 | **Gmail › Send an email** (solo en la ruta Persona) | Alerta al dueño con el mensaje y el número. |
| 7 (opcional) | **Anthropic Claude › Create a Message** en la ruta por defecto | Modelo `claude-haiku-5-5`, sistema con la información del negocio y la instrucción de no inventar. Solo si el cliente contrata la IA: tiene costo por uso en su cuenta de Anthropic y gasta 1 crédito más por mensaje. |

**Créditos:** suponiendo 4 mensajes por lead (400 mensajes al mes):

| Concepto | Créditos al mes |
|---|---|
| Disparador por cada evento con mensaje (400) | 400 |
| Disparador por avisos de estado (enviado, entregado, leído: unos 3 por respuesta) | 1.200 |
| Set variable + respuesta + registro (3 por mensaje) | 1.200 |
| Alertas al dueño (10% piden persona) | 40 |
| **Total aproximado** | **2.840** |
| Con IA en la ruta por defecto (estimando 40% sin palabra clave) | + 160 |

> Los avisos de estado gastan créditos aunque el filtro los detenga. Si el volumen crece, conviene n8n (cobra por ejecución, no por módulo) o desactivar en Meta los campos que no se usan.

## Resumen con 100 leads al mes

| Escenario | Créditos aproximados |
|---|---|
| Solo E1 | 500 |
| Solo E2 | 500–600 |
| Solo E3 | 2.840 |
| E1 + E3 | 3.340 |
| E2 + E3 | 3.340–3.440 |

El plan gratuito de Make tiene un límite bajo de créditos al mes (consulte el valor vigente); E1 o E2 solos suelen caber, E3 casi siempre necesita un plan pago **del cliente**. Mida el consumo real el primer mes en *Organization › Usage* y ajuste.
