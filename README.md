# Timbre

**Nadie se queda sin respuesta.**

Timbre deja el WhatsApp y la presencia en Google Maps de negocios pequeños listos para responder solos, y hace automatizaciones y desarrollos a la medida. Este repositorio tiene la demo que vende, el sistema de plantillas para no empezar de cero con cada cliente y el kit de entrega.

Contacto: Andres Diez · WhatsApp [+57 314 331 9442](https://wa.me/573143319442)

---

## La oferta (Colombia)

| Plan | Instalación | Mensual | Qué es |
|---|---|---|---|
| **Pedidos** | $450.000 | $59.000 | Página con catálogo y carrito: el pedido llega completo al WhatsApp, sin comisiones. |
| **Reservas** | $450.000 | $59.000 | Página de reservas: servicio, día y hora llegan listos para confirmar; recordatorios con un toque. |
| **Asistente** | $790.000 | $149.000 | Pedidos o Reservas + asistente con IA en WhatsApp. |
| **Arranque** | $200.000 | — | Solo lo básico: WhatsApp Business, Google Maps y QR. Va como opción discreta. |

Todos incluyen WhatsApp Business completo, su negocio en Google Maps, QR y capacitación gratuita. Los precios viven en `config/planes.json`; el porqué está en `estudio/nueva-oferta.md`. La versión en inglés (EE. UU.) sigue con Starter, Pro y Care plan.

## Páginas y sus URL

Todas las rutas son relativas, así que el sitio funciona en cualquier dirección. Hay dos formas de publicarlo; las dos usan `scripts/armar-sitio.js`, que arma `_site/` sin documentos internos ni datos de clientes reales (solo las entregas de ejemplo):

- **Netlify** (`netlify.toml`): en app.netlify.com → *Add new site → Import an existing project → GitHub → AndresDiezT/Timbre*. Netlify lee la configuración solo; no hay que llenar nada. Publica de nuevo en cada push a `main`.
- **GitHub Pages** (`.github/workflows/pages.yml`): *Settings → Pages → Source: GitHub Actions*. Requiere que GitHub Actions esté habilitado en la cuenta.

**Sitio publicado: https://timbre-demo.netlify.app/** (las rutas de abajo se suman a esa dirección; por ejemplo https://timbre-demo.netlify.app/visita/?asesora=T101).

| Página | URL | Para qué sirve |
|---|---|---|
| Principal | `/` | Demo que vende: celular en vivo, «Así le llega un pedido» (`/#probar`), hora del día, antes y después, gremios, calculadora, planes y preguntas. |
| Simulador | `/demo/` | Celular grande + panel del dueño. Modo interactivo y automático, formatos 16:9 y 9:16 para grabar. |
| Visita | `/visita/?asesora=T101` | Herramienta de las asesoras: demo con el nombre del negocio, enlace, QR y botón «Lo quiero». |
| English | `/en/` | Landing para servicios a domicilio en EE. UU. con la demo de respuesta en menos de 60 s. |
| Simulador EN | `/demo/en.html` | Simulador en inglés con modo automático y formatos 16:9 y 9:16. |
| Hoja de planes | `/ventas/hoja-de-planes.html?asesora=T101` | Para mostrar e imprimir; el QR lleva el código de la asesora. PDF listos en `ventas/pdf/`. |
| Guía de vendedoras | `/ventas/guia-vendedoras.html?asesora=T101` | Visita en 6 pasos, objeciones y registro de visitas. |
| Tarjetas | `/ventas/tarjetas.html?asesora=T101` | 10 tarjetas por hoja carta con QR y código de la asesora. |
| Constructor | `/constructor/` | Para Andres: formulario por pasos, vista previa en vivo (chat, página y QR), copiar cada texto y descargar el JSON del cliente. |
| Ejemplo Reservas (moderno) | `/entregas/ejemplo-barberia-el-parche/pagina/` · `/entregas/ejemplo-barberia-el-parche/pagina/recordatorios.html` | Página con reservas y la herramienta de recordatorios de la barbería ficticia. |
| Ejemplo Pedidos (cálido) | `/entregas/ejemplo-asadero-la-brasa-dorada/pagina/` | Página con carrito de pedidos del asadero ficticio. |
| Privacidad | `/privacidad.html` · `/en/privacy.html` | Plantillas legales (revisar con un abogado). |

### Parámetros de URL

| Parámetro | Dónde | Valores | Efecto |
|---|---|---|---|
| `m` | todas | `en` | `en` lleva a la versión en inglés. Puerto Rico y EE. UU. en español están desactivados. |
| `asesora` | todas | `T101` | Agrega «Vengo de parte de [nombre] (código CODIGO)» a cada mensaje de WhatsApp y se conserva en los enlaces internos. |
| `gremio` | demo, visita, demo/en | `barberia`, `restaurante`, `panaderia`, `taller`, `ropa`, `ferreteria`, `gimnasio`, `hogar` · `cleaning`, `hvac`, `plumbing` | Negocio que aparece en el celular. |
| `nombre` | demo, visita | texto | Nombre del negocio del dueño en el chat. |
| `color` | demo | `RRGGBB` (sin #) | Color de acento del negocio. |
| `modo` | demo | `auto`, `interactivo` | Modo del simulador. |
| `formato` | demo, demo/en | `libre`, `169`, `916` | Formato para grabar video horizontal o vertical. |
| `velocidad` | demo, demo/en | `0.6` a `2` | Velocidad del modo automático. |
| `grabar` | demo, demo/en | `1` | Abre directo en modo grabación (sin controles; Esc para salir). |

Ejemplo: `/demo/?gremio=panaderia&nombre=Panadería%20Doña%20Rosa&asesora=T101&formato=916&grabar=1`

---

## Índice del repositorio

```
timbre/
├── index.html                 Página principal (es)
├── demo/index.html            Simulador (es)
├── demo/en.html               Simulador (en)
├── visita/index.html          Herramienta de visita para asesoras
├── en/index.html              Landing en inglés (servicios a domicilio)
├── privacidad.html            Política de datos (plantilla, Ley 1581)
├── en/privacy.html            Privacy policy (template)
├── config/
│   ├── marca.json             Marca, contacto, asesoras, mensajes de WhatsApp, testimonios
│   └── planes.json            Planes y precios (co y en; usd guardado en mercadosDesactivados)
├── plantillas/gremios/        Un JSON por gremio + indice.json
├── constructor/index.html     Generador en el navegador (para Andres)
├── plantillas/pagina-negocio/ Página del negocio con pedidos o reservas: pagina.js + estilos (sobrio, calido, moderno)
├── negocios/
│   ├── ejemplo-barberia-el-parche.json        Cliente ficticio · Reservas · estilo moderno
│   ├── ejemplo-asadero-la-brasa-dorada.json   Cliente ficticio · Pedidos · estilo cálido
│   └── privado/               Clientes reales: en .gitignore, nunca se publica
├── entregas/                  Salida del generador (solo se versionan las de ejemplo)
├── timbre-whatsapp/           Textos e imágenes de catálogo del WhatsApp de Timbre
├── video/                     Guiones, subtítulos .srt y cómo grabar
├── automatizaciones/
│   ├── n8n/                   E1–E5: workflows JSON importables + guía nodo por nodo y credenciales
│   ├── make/guia-e1-e3.md     E1–E3 en Make, módulo por módulo, con créditos estimados (100 leads/mes)
│   ├── plantillas-whatsapp.md Plantillas para aprobación de Meta (es/en), categoría y variables
│   ├── hojas-de-calculo.md    Columnas de cada hoja de Google
│   └── formulario-ejemplo.html Formulario de prueba con autorización de datos
├── entrega/                   Onboarding, diagnóstico, propuesta, cuenta de cobro, acuerdo de datos,
│                              documento de entrega, registro de mantenimiento e informe mensual
├── upwork/                    Perfil, 3 piezas de portafolio y 3 propuestas (< 150 palabras)
├── estudio/nueva-oferta.md    Estudio de la oferta actual y sus precios
├── ventas/                    Hoja de planes, guía de vendedoras, tarjetas, registro de visitas y PDF listos
├── assets/
│   ├── css/                   timbre.css (sistema visual) + estilos por página
│   ├── js/                    timbre.js (núcleo), telefono.js (chat), leads.js (demo EN), kit.js (textos de entrega) y uno por página
│   ├── img/                   campanita y favicon
│   └── vendor/qrcode.js       Generador de QR (MIT, Kazuhiko Arase)
├── scripts/
│   ├── validar.js             Valida todos los JSON (o uno solo) y la estructura de gremios y negocios
│   ├── generar.js             Crea la entrega completa de un cliente
│   ├── catalogo-timbre.js     Imágenes de los planes para el catálogo del WhatsApp de Timbre
│   ├── lib/imagenes.js        PNG y QR con resvg
│   └── fuentes/               Anton y Figtree (OFL) para dibujar las imágenes
├── .github/workflows/pages.yml
├── README.md
└── PENDIENTES.md              Datos que faltan, marcados como [ASÍ]
```

### Cambiar precios, textos o asesoras sin tocar código

- **Precios y planes**: `config/planes.json`. Cada mercado tiene sus planes, forma de pago, garantía y texto del botón.
- **Asesoras**: `config/marca.json` → `asesoras`. Agregar `{ "codigo": "T103", "nombre": "Nombre" }` y el código ya funciona en `?asesora=T103`. Los códigos no llevan el nombre de la asesora. Si se cambia un código, el anterior se pone en `alias` para que sigan funcionando los enlaces y tarjetas viejos.
- **Testimonios**: `config/marca.json` → `testimonios`. La sección está oculta mientras la lista esté vacía. Solo testimonios reales, con permiso: `{ "texto": "...", "nombre": "...", "negocio": "..." }`.
- **Gremios**: copiar un JSON de `plantillas/gremios/`, cambiarlo y agregar su id a `plantillas/gremios/indice.json`.

Después de cualquier cambio: `node scripts/validar.js`.

---

## Verlo en su computador

Las páginas cargan los JSON con `fetch`, así que hay que abrirlas desde un servidor (no con doble clic):

```bash
npm install          # solo para los scripts de imágenes (resvg)
python3 -m http.server 8080
# abrir http://localhost:8080
```

Scripts:

| Comando | Qué hace |
|---|---|
| `npm run validar` | Valida todos los JSON. `node scripts/validar.js archivo.json` valida uno. |
| `npm run generar -- negocios/privado/cliente.json` | Genera la entrega de un cliente. Opciones: `--estilo sobrio\|calido\|moderno`, `--pagina` (forzar página aunque sea Arranque). |
| `npm run ejemplos` | Regenera las dos entregas de ejemplo. |
| `npm run catalogo-timbre` | Regenera las imágenes de los planes desde `config/planes.json`. |

---

## Cómo crear un cliente nuevo en 5 pasos

1. **Arme el JSON** en el constructor (`/constructor/`): elija el gremio, llene los pasos y descargue el archivo. O copie un ejemplo: `cp negocios/ejemplo-barberia-el-parche.json negocios/privado/barberia-juanito.json`. Los clientes reales siempre van en `negocios/privado/`.
2. **Revise los datos**: nombre, color, horario, catálogo y precios, preguntas, mensajes y el bloque `negocio`: dirección, WhatsApp, redes, medios de pago, políticas, enlace de reseñas, `plan` (`pedidos`, `reservas`, `asistente` o `arranque`), `estiloPagina`, y según el caso `costoDomicilio` (Pedidos) o `intervaloReservas` (Reservas, en minutos). Si tiene fotos, agregue `"imagen": "fotos/corte.jpg"` a cada producto (ruta relativa al JSON).
3. **Valide**: `node scripts/validar.js negocios/privado/barberia-juanito.json` (o sin argumento para todo el repositorio).
4. **Genere la entrega**: `node scripts/generar.js negocios/privado/barberia-juanito.json` crea `entregas/barberia-juanito/` con textos para WhatsApp Business y Google Maps, imágenes del catálogo, códigos QR, página web y lista de verificación.
5. **Entregue**: siga `entregas/<negocio>/lista-de-verificacion.md` con el dueño, firme `entrega/documento-de-entrega.md` y cobre el saldo con `entrega/cuenta-de-cobro.md` cuando lo vea funcionando.

---

## Reglas del proyecto

- HTML, CSS y JavaScript puros, sin frameworks ni backend. Node solo para scripts de construcción.
- Mobile-first (390 px) y elegante a 1280 px, modo claro y oscuro, contraste AA, foco visible.
- Toda demostración dice «Demostración de Timbre» y usa negocios ficticios. Chat y tarjetas genéricos, sin logos ni imitación de WhatsApp, Meta o Google.
- Nada de testimonios, cifras de resultados ni logos inventados. Nunca prometemos más ventas.
- Todo formulario lleva la autorización de datos (Ley 1581). Nada de llamadas salientes con IA, SMS masivos ni datos de salud.
- Clientes reales solo en `negocios/privado/` (ignorado por git).

## Estado por fases

- [x] **Fase 1 — La demo que vende**: página principal, simulador, visita, versión en inglés, privacidad y publicación en GitHub Pages.
- [x] **Fase 2 — Kit de entrega con plantillas**: generador, 2 clientes de ejemplo, página del negocio en 3 estilos, constructor, WhatsApp de Timbre y guiones de video.
- [x] **Fase 3 — Automatizaciones reales**: 5 workflows de n8n, guía de Make con créditos y plantillas de WhatsApp para Meta.
- [x] **Fase 4 — Ventas y entrega**: documentos de `entrega/` y material de `upwork/`.
