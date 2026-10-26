# E4 · Recordatorios de citas 24 h y 2 h antes

Cada 15 minutos revisa la pestaña `Citas` y envía por WhatsApp un recordatorio 24 horas antes y otro 2 horas antes de cada cita. Marca en la hoja lo que ya envió para no repetir.

Archivo: `e4-recordatorios-citas.json`

## Credenciales

- Header Auth «WhatsApp Cloud API (token)»
- Google Sheets OAuth2 API

## Antes de importar

- Plantillas aprobadas `recordatorio_cita_24h` y `recordatorio_cita_2h` (categoría utilidad, 5 variables: nombre, servicio, fecha, hora y negocio). Textos en `../plantillas-whatsapp.md`.
- Pestaña `Citas` con las columnas de `../hojas-de-calculo.md`. El dueño o su sistema de reservas agrega cada cita.
- El cliente debe haber aceptado recibir recordatorios por WhatsApp al pedir la cita.

## Nodo por nodo

| # | Nodo | Tipo | Qué hace | Qué configurar |
|---|---|---|---|---|
| 1 | Cada 15 minutos | Schedule Trigger | Arranca el flujo cada 15 minutos. | Nada. |
| 2 | Datos del negocio | Set | Phone number ID, nombres de las plantillas, idioma, indicativo, zona horaria y desfase UTC. | Reemplace los `[CORCHETES]`. |
| 3 | Leer citas | Google Sheets · Get rows | Trae todas las filas de `Citas`. | ID de la hoja. |
| 4 | ¿A quién recordar? | Code | Calcula cuánto falta para cada cita. Si faltan entre 2,5 y 24 horas y no se ha enviado el de 24 h, lo programa; si faltan menos de 2 horas, el de 2 h. Salta citas canceladas. | Nada. |
| 5 | WhatsApp: recordatorio | HTTP Request · Graph API | Envía la plantilla que corresponda. | Credencial del token. |
| 6 | Marcar como enviado | Google Sheets · Update row (por `ID`) | Escribe «Enviado AAAA-MM-DD HH:mm» en la columna correspondiente. | ID de la hoja. |

## Probar

Cree una cita de prueba con su número para dentro de 23 horas y otra para dentro de 90 minutos, y ejecute el workflow a mano. Deben llegar los dos recordatorios y quedar marcados.

## Costo

Dos plantillas de utilidad por cita. Con 100 citas al mes, unas 200 plantillas.
