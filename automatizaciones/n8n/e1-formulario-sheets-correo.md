# E1 · Formulario → Google Sheets → correo inmediato → alerta al dueño

Cuando alguien llena el formulario de la página, queda guardado en la hoja, recibe al instante un correo de confirmación y el dueño recibe una alerta. Sin WhatsApp API: es la automatización más sencilla y barata.

Archivo: `e1-formulario-sheets-correo.json`

## Credenciales

- Google Sheets OAuth2 API (cuenta del negocio)
- Gmail OAuth2 (cuenta del negocio)

## Hoja

Pestaña `Leads` con las columnas de `../hojas-de-calculo.md`.

## Nodo por nodo

| # | Nodo | Tipo | Qué hace | Qué configurar |
|---|---|---|---|---|
| 1 | Formulario | Webhook (POST `/timbre-e1-formulario`) | Recibe los datos del formulario en JSON o como formulario. | Copie la *Production URL* y péguela en el formulario (ver `../formulario-ejemplo.html`). En `allowedOrigins` puede poner el dominio del cliente en lugar de `*`. |
| 2 | Datos del negocio | Set | Guarda nombre del negocio, correo del dueño, URL de la hoja y firma. | Reemplace los `[CORCHETES]`. |
| 3 | Validar y limpiar | Code | Rechaza el envío si no trae la autorización de datos; recorta textos, limpia el teléfono y agrega fecha. | Nada. |
| 4 | Guardar en la hoja | Google Sheets · Append row | Agrega una fila en `Leads` con estado «Nuevo». | ID de la hoja y pestaña `Leads`. |
| 5 | Correo al cliente | Gmail · Send | Confirma que recibimos su mensaje. Si el cliente no dejó correo, el nodo falla sin detener el flujo (*On error: continue*). | Revise el texto. |
| 6 | Alerta al dueño | Gmail · Send | Correo al dueño con todos los datos y el enlace a la hoja. | Nada (usa `correoDueno`). |
| 7 | Responder al formulario | Respond to Webhook | Devuelve `{ "ok": true }` para que la página muestre «Enviado». | Nada. |

## Datos que debe enviar el formulario

```json
{ "nombre": "Laura Gómez", "telefono": "3001234567", "correo": "laura@example.com", "servicio": "Corte y barba", "mensaje": "¿Tienen turno el sábado?", "autorizacion": true, "origen": "Página web" }
```

## Probar

1. Abra el workflow, toque *Listen for test event* en **Formulario**.
2. Envíe `../formulario-ejemplo.html` con la *Test URL*.
3. Verifique: fila nueva en la hoja, correo al cliente y alerta al dueño.
4. Active el workflow y cambie el formulario a la *Production URL*.

## Costo

n8n: 1 ejecución por formulario. Gmail y Sheets: gratis dentro de los límites normales de una cuenta de Google.
