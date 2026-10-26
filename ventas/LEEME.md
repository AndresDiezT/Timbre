# Material de vendedoras

| Archivo | Para qué | PDF listo |
|---|---|---|
| `hoja-de-planes.html` | Hoja de planes para mostrar en la visita o imprimir. El QR abre el WhatsApp de Timbre con el código de la asesora. | `pdf/hoja-de-planes.pdf` (genérica), `pdf/hoja-de-planes-T101.pdf`, `pdf/hoja-de-planes-T102.pdf`, `pdf/hoja-de-planes.png` (para enviar por WhatsApp) |
| `guia-vendedoras.html` | Guía de visita: qué ofrecer a cada gremio, la visita en 6 pasos, preguntas, objeciones y registro. | `pdf/guia-vendedoras.pdf`, `pdf/guia-vendedoras-T101.pdf`, `pdf/guia-vendedoras-T102.pdf` |
| `tarjetas.html` | 10 tarjetas de 3,5 × 2 pulgadas por hoja carta, con QR y código de la asesora. | `pdf/tarjetas-T101.pdf`, `pdf/tarjetas-T102.pdf` |
| `registro-de-visitas.csv` | Plantilla para Google Sheets (*Archivo → Importar*). Una fila por visita. | — |

**Códigos de asesora:** T101 es Sofía y T102 es Yarimar (lista completa en `config/marca.json`). Los códigos no llevan el nombre; los anteriores (SOFIA, YARIMAR) quedan como alias para que no se pierdan los enlaces viejos.

Todas las páginas leen los precios de `config/planes.json` y las asesoras de `config/marca.json`. Si cambia un precio o entra una asesora nueva, abra la página en el navegador, elija la asesora arriba y toque **Imprimir o guardar PDF** (papel carta, márgenes ninguno, con gráficos de fondo).

La escala de descuentos y la comisión **no están aquí**, porque este repositorio y el sitio son públicos. Están en la hoja de condiciones privada (`negocios/privado/`, que no se sube).
