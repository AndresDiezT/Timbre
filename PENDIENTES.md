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
| `[ENLACE VIDEO]` | `config/marca.json` | Enlace al video de demostración (se graba con el simulador, Fase 2). |
| `[REVIEW-LINK]` | `assets/js/leads.js` (demo EN) | Es un ejemplo ficticio; no necesita cambio. |

## GitHub Pages

- [ ] El repositorio es **privado**: GitHub Pages en repositorios privados requiere un plan de pago (GitHub Pro, Team o Enterprise). Opciones: activar el plan, hacer público el repositorio (no contiene datos de clientes: `negocios/privado/` está ignorado) o publicar el sitio desde un repositorio público aparte.
- [ ] Activar Pages: *Settings → Pages → Source: GitHub Actions*. Luego hacer merge a `main` para que corra `.github/workflows/pages.yml`.
- [ ] Confirmar la URL final y actualizar `config/marca.json → sitio.url` y la tabla del README.
- [ ] Opcional: dominio propio (por ejemplo `timbre.co`), configurado en *Settings → Pages → Custom domain*.

## WhatsApp de Timbre

- [ ] La página principal dice «Este número le responde al instante». Configurar la bienvenida y el mensaje fuera de horario en el WhatsApp Business de +57 314 331 9442 (los textos llegan en la Fase 2, carpeta `timbre-whatsapp/`).

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
