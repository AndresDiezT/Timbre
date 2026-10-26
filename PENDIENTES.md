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
- [ ] **Netlify (recomendado mientras GitHub Actions esté bloqueado por facturación):** app.netlify.com → *Add new site → Import an existing project → GitHub* → elegir `AndresDiezT/Timbre` → *Deploy*. La configuración ya está en `netlify.toml`. Luego, en *Site configuration → Change site name*, poner por ejemplo `timbre` para quedar en `timbre.netlify.app`.
- [ ] GitHub Pages (alternativa): resolver la facturación de la cuenta y activar *Settings → Pages → Source: GitHub Actions*.
- [ ] Confirmar la URL final y actualizar `config/marca.json → sitio.url`, `timbre-whatsapp/LEEME.md` y el portafolio de `upwork/` (hoy apuntan a `andresdiezt.github.io/Timbre`).
- [ ] Opcional: dominio propio (por ejemplo `timbre.co`), configurado en *Settings → Pages → Custom domain*.

## WhatsApp de Timbre

- [ ] La página principal dice «Este número le responde al instante». Configurar en el WhatsApp Business de +57 314 331 9442 la bienvenida, el mensaje fuera de horario, las respuestas rápidas, las etiquetas y el catálogo de `timbre-whatsapp/LEEME.md`.

## Kit de entrega

- [ ] Los ejemplos usan números ficticios (`+57 300 000 0000`, `+1 787 555 0123`) y enlaces de reseñas de `example.com`. En clientes reales, el generador avisa si falta el enlace de reseñas y no crea ese QR.
- [ ] La categoría del perfil de WhatsApp Business se elige de una lista cerrada en la app: el generador pone el nombre del gremio como guía; escoja la más parecida.
- [ ] La verificación del negocio en Google Maps la hace Google y puede tardar varios días: no depende de Timbre. Avisarle al dueño.
- [ ] El formulario de la página Pro no usa servidor: abre WhatsApp con el mensaje ya escrito y exige la autorización de datos. Si un cliente quiere recibir los formularios por correo o en una hoja, eso es la automatización E1 (Fase 3).

## Automatizaciones

- [ ] **Probar cada workflow en una instancia real de n8n** antes del primer cliente: se armaron con la estructura de nodos actual (Webhook v2, Code v2, Google Sheets v4.5, Gmail v2.1, HTTP Request v4.2, If v2), pero no se ejecutaron contra cuentas reales. Si n8n marca un nodo, ábralo y vuelva a elegir la operación.
- [ ] Confirmar la tabla de precios vigente de WhatsApp Business Platform. Los textos dicen, según su indicación, que desde el 1 de octubre de 2026 cada número tiene 1.000 mensajes de servicio gratis al mes y las plantillas se pagan.
- [ ] Confirmar planes y créditos vigentes de Make y de n8n Cloud antes de cotizar.
- [ ] Coexistencia app + API de WhatsApp: verificar con cada cliente si su número la permite.
- [ ] Marcadores de los workflows (`[ID DE LA HOJA DE GOOGLE]`, `[PHONE NUMBER ID DE META]`, `[CORREO DEL DUEÑO]`, etc.) se llenan por cliente en el nodo **Datos del negocio**.

## Ventas y entrega

- [ ] `entrega/cuenta-de-cobro.md`: completar cédula, llave Bre-B y cuenta bancaria, y confirmar con un contador la declaración tributaria (IVA, factura electrónica).
- [ ] `entrega/acuerdo-encargo-datos.md`: plantilla; revisar con un abogado antes del primer cliente con automatizaciones.
- [ ] `upwork/perfil.md`: definir `[TARIFA POR HORA]` y reemplazar `[URL DE GITHUB PAGES]` en el portafolio cuando el sitio esté publicado.
- [ ] Capturas y video del portafolio de Upwork (lista de tomas en `upwork/portafolio.md`).

## Contenido

- [ ] Testimonios reales con permiso escrito del dueño → `config/marca.json → testimonios`. Mientras esté vacío, la sección queda oculta.
- [ ] Revisar los precios de ejemplo de los gremios ficticios (están pensados para 2026, pero son de referencia).
- [ ] Fotos reales para los catálogos de clientes: los gremios usan cuadros de color con la inicial del producto.

## Decisiones tomadas sin preguntar (revisar si no le gustan)

- La calculadora pide un cuarto dato, «de cada 10 que preguntan, ¿cuántos compran?» (3 por defecto), para que la estimación no suponga que cada mensaje sin responder es una venta perdida. Usa 30 días al mes.
- En la demo de la página principal el negocio es la panadería ficticia, porque a las 9:47 p. m. está cerrada y se ve el mensaje fuera de horario.
- El modo interactivo del simulador aclara que responder cualquier pregunta es un asistente virtual con IA (desarrollo a la medida); el modo automático muestra solo lo que incluye el plan Esencial (bienvenida, fuera de horario, catálogo y respuestas rápidas que el dueño envía).
- Para el mercado USD en español se usan los mismos gremios con un precio de referencia en dólares (`precioUSD`).
- El tema claro/oscuro sigue al sistema; el botón de la luna lo cambia y se recuerda en el navegador. El sonido nunca se recuerda: siempre empieza apagado.
