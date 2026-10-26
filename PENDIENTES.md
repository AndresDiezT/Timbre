# Pendientes

Datos que faltan o decisiones por confirmar. En los archivos aparecen como `[ASÍ]`.

## Datos de contacto y legales

| Marcador | Dónde | Qué falta |
|---|---|---|
| `[CORREO DE CONTACTO]` | `config/marca.json`, `privacidad.html`, `en/privacy.html` | Correo de Timbre. |
| `[CIUDAD]` | `config/marca.json`, `privacidad.html` | Ciudad de domicilio de Andres Diez. |
| `[C.C. O NIT]` | `privacidad.html` | Documento o NIT del responsable del tratamiento. |
| `[FECHA]` / `[DATE]` | `privacidad.html`, `en/privacy.html` | Fecha de entrada en vigencia de la política. |
| `[LEGAL ENTITY / ADDRESS]` | `en/privacy.html` | Entidad legal y dirección para clientes en EE. UU. |
| `[REVISAR CON ABOGADO ...]` | `privacidad.html`, `en/privacy.html` | Lista de proveedores, transferencias internacionales y requisitos por estado. **Las dos políticas son plantillas: revisarlas con un abogado antes de publicarlas como definitivas.** |
| `[REVIEW-LINK]` | `assets/js/leads.js` (demo EN) | Es un ejemplo ficticio; no necesita cambio. |
| `[HORARIO DE ATENCIÓN DE TIMBRE]` | `timbre-whatsapp/LEEME.md` | Horario en que Andres atiende el WhatsApp de Timbre. |
| `[ENLACE VIDEO]` | `timbre-whatsapp/LEEME.md`, `config/marca.json` | Grabar con `video/grabar.md` y subir (YouTube no listado o similar). |

## Publicación

- [x] Repositorio público (no contiene datos de clientes: `negocios/privado/` está ignorado).
- [x] Publicado en Netlify: https://timbre-demo.netlify.app/ (configuración en `netlify.toml`). Si se subió a mano y no conectado al repositorio, conectarlo en *Site configuration → Build & deploy → Link repository* para que cada cambio en `main` se publique solo.
- [ ] GitHub Pages queda como alternativa manual (el workflow ya no corre en cada push). Para usarlo: resolver la facturación de GitHub, activar *Settings → Pages → Source: GitHub Actions* y ejecutar el workflow a mano.
- [x] Dirección actualizada en `config/marca.json`, `timbre-whatsapp/LEEME.md`, `upwork/` y README.
- [ ] Opcional: dominio propio (por ejemplo `timbre.co`), configurado en *Settings → Pages → Custom domain*.

## WhatsApp de Timbre

- [ ] La página principal dice «Este número le responde al instante». Configurar en el WhatsApp Business de +57 314 331 9442 la bienvenida, el mensaje fuera de horario, las respuestas rápidas, las etiquetas y el catálogo de `timbre-whatsapp/LEEME.md`.

## Kit de entrega

- [ ] Los ejemplos usan números ficticios (`+57 300 000 0000`, `+1 787 555 0123`) y enlaces de reseñas de `example.com`. En clientes reales, el generador avisa si falta el enlace de reseñas y no crea ese QR.
- [ ] La categoría del perfil de WhatsApp Business se elige de una lista cerrada en la app: el generador pone el nombre del gremio como guía; escoja la más parecida.
- [ ] La verificación del negocio en Google Maps la hace Google y puede tardar varios días: no depende de Timbre. Avisarle al dueño.
- [ ] La página del negocio no usa servidor: el pedido, la reserva y el formulario abren WhatsApp con el mensaje ya escrito y exigen la autorización de datos. Si un cliente quiere además recibirlos en una hoja o por correo, eso es la automatización E1.
- [ ] Las reservas son **solicitudes**: la página muestra las horas en que el negocio abre, pero no sabe qué horas ya están ocupadas. El dueño confirma cada una por WhatsApp. Si un cliente necesita agenda con disponibilidad real, es desarrollo a la medida.
- [ ] La página de recordatorios guarda las citas solo en el navegador del celular del dueño. Si cambia de celular o borra los datos, se pierden: explicárselo en la capacitación.

## Automatizaciones

- [ ] **Probar cada workflow en una instancia real de n8n** antes del primer cliente: se armaron con la estructura de nodos actual (Webhook v2, Code v2, Google Sheets v4.5, Gmail v2.1, HTTP Request v4.2, If v2), pero no se ejecutaron contra cuentas reales. Si n8n marca un nodo, ábralo y vuelva a elegir la operación.
- [ ] Confirmar la tabla de precios vigente de WhatsApp Business Platform. Los textos dicen, según su indicación, que desde el 1 de octubre de 2026 cada número tiene 1.000 mensajes de servicio gratis al mes y las plantillas se pagan.
- [ ] Confirmar planes y créditos vigentes de Make y de n8n Cloud antes de cotizar.
- [ ] Coexistencia app + API de WhatsApp: verificar con cada cliente si su número la permite.
- [ ] Marcadores de los workflows (`[ID DE LA HOJA DE GOOGLE]`, `[PHONE NUMBER ID DE META]`, `[CORREO DEL DUEÑO]`, etc.) se llenan por cliente en el nodo **Datos del negocio**.

## Ventas y entrega

- [ ] `entrega/cuenta-de-cobro.md`: completar cédula, llave Bre-B y cuenta bancaria, y confirmar con un contador la declaración tributaria (IVA, factura electrónica).
- [ ] `entrega/acuerdo-encargo-datos.md`: plantilla; revisar con un abogado antes del primer cliente con automatizaciones.
- [ ] `upwork/perfil.md`: definir `[TARIFA POR HORA]`.
- [ ] Capturas y video del portafolio de Upwork (lista de tomas en `upwork/portafolio.md`).

## Nueva oferta (validar en 3 semanas)

- [ ] Precio de lista de Pedidos y Reservas: $450.000. La escala de descuentos va en la guía de vendedoras, **no en este repositorio ni en el sitio** (los dos son públicos). Anotar cada descuento que se dé y el motivo.
- [ ] Definir la comisión de las asesoras en la guía de vendedoras (calculada sobre el precio final, después del descuento).
- [ ] Medir el costo real del plan Asistente con el primer cliente (IA, servidor de automatización y mensajes de Meta) antes de dejar fijo el precio.
- [x] Material de vendedoras rehecho en `ventas/` (hoja de planes, guía, tarjetas y registro), con PDF por asesora en `ventas/pdf/`. Las páginas leen `config/planes.json`: si cambia un precio, ábralas y toque «Imprimir o guardar PDF».
- [ ] La hoja de condiciones (escala de descuentos y comisión) es privada: se entregó aparte y vive en `negocios/privado/`, que no se sube. Completar la comisión `[DEFINIR CON ANDRES]` y entregársela a cada asesora en persona.

## Códigos de asesora

- [ ] El código de Sofía cambió a **T101**. Avisarle y que guarde de nuevo su herramienta de visita: https://timbre-demo.netlify.app/visita/?asesora=T101.
- [ ] Yarimar (T102) está inactiva por ahora (`config/marca.json → asesorasInactivas`): sus enlaces ya no agregan su código. Para reactivarla, moverla a `asesoras` e imprimir su material desde `ventas/`.
- [ ] Cambiar la etiqueta del WhatsApp de Timbre «SOFIA» por «Asesora T101» y borrar la de «YARIMAR».
- [ ] Cuando ya nadie use los enlaces viejos, quitar los `alias` de `config/marca.json`.

## Contenido

- [ ] Testimonios reales con permiso escrito del dueño → `config/marca.json → testimonios`. Mientras esté vacío, la sección queda oculta.
- [ ] Revisar los precios de ejemplo de los gremios ficticios (están pensados para 2026, pero son de referencia).
- [ ] Fotos reales para los catálogos de clientes: los gremios usan cuadros de color con la inicial del producto.

## Decisiones tomadas sin preguntar (revisar si no le gustan)

- La calculadora pide un cuarto dato, «de cada 10 que preguntan, ¿cuántos compran?» (3 por defecto), para que la estimación no suponga que cada mensaje sin responder es una venta perdida. Usa 30 días al mes.
- En la demo de la página principal el negocio es la panadería ficticia, porque a las 9:47 p. m. está cerrada y se ve el mensaje fuera de horario.
- El modo interactivo del simulador aclara que responder cualquier pregunta es un asistente virtual con IA (desarrollo a la medida); el modo automático muestra solo lo que incluye el plan Esencial (bienvenida, fuera de horario, catálogo y respuestas rápidas que el dueño envía).
- Puerto Rico y EE. UU. en español quedaron desactivados (guardados en `config/planes.json → mercadosDesactivados`). Se quitaron los precios en dólares de los gremios en español y el ejemplo de Puerto Rico.
- La mensualidad de Pedidos y Reservas incluye hasta 5 cambios al mes; cada cambio adicional cuesta $15.000 (el valor del antiguo mantenimiento).
- En la demo de la portada, el negocio es una panadería (Pedidos); en «Así le llega un pedido», un asadero (Pedidos) y una barbería (Reservas).
- El tema claro/oscuro sigue al sistema; el botón de la luna lo cambia y se recuerda en el navegador. El sonido nunca se recuerda: siempre empieza apagado.
