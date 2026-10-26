# Checklist de onboarding · [NOMBRE DEL NEGOCIO]

Plan: [PEDIDOS / RESERVAS / ASISTENTE / ARRANQUE] · Asesora: [CÓDIGO O «directo»] · Fecha de inicio: [FECHA]

## 1. Cierre de la venta

- [ ] Plan elegido y precio confirmado por escrito (WhatsApp sirve).
- [ ] Propuesta enviada (`propuesta.md`) si el cliente la pidió.
- [ ] Cuenta de cobro del 50% enviada y **pago recibido**.
- [ ] Etiqueta «Pagó» en el WhatsApp de Timbre y, si aplica, etiqueta de la asesora.
- [ ] Fecha de entrega acordada: Arranque 3 días hábiles, Pedidos o Reservas 5, Asistente 10 (cuentan desde que llegan todos los datos).
- [ ] Fecha de cobro de la mensualidad acordada (Pedidos, Reservas y Asistente), por adelantado cada mes.

## 2. Lo que el dueño debe enviar

- [ ] Nombre exacto del negocio, como aparece en el letrero.
- [ ] Dirección con barrio y ciudad, y una referencia para llegar.
- [ ] Horario de cada día y festivos.
- [ ] Número de WhatsApp del negocio.
- [ ] Catálogo: productos o servicios con precio (entre 6 y 10 para empezar) y fotos si las tiene.
- [ ] Logo y al menos 5 fotos: fachada, interior, productos o trabajos.
- [ ] Medios de pago que recibe.
- [ ] Redes sociales (Instagram, Facebook, TikTok).
- [ ] Las preguntas que más le hacen sus clientes.
- [ ] Políticas: domicilios, cambios, cancelaciones, garantía.
- [ ] Pedidos: si cobra domicilio y cuánto, zonas a las que entrega y medios de pago.
- [ ] Reservas: duración de cada servicio y cada cuántos minutos puede recibir citas.
- [ ] Si ya tiene dominio o si lo va a comprar (opcional; lo paga el cliente).

## 3. Cuentas (siempre a nombre del cliente)

- [ ] WhatsApp Business instalado en el celular del negocio. Si viene de WhatsApp normal, hacer copia de seguridad antes de migrar.
- [ ] Cuenta de Google del negocio (si no tiene, se crea con él). El dueño es el propietario del perfil en Google Maps.
- [ ] No pedir contraseñas por mensaje. La configuración se hace con el dueño presente, en persona o por videollamada.
- [ ] Si hay automatizaciones: cuentas de n8n o Make, hoja de Google y Meta Business a nombre del cliente.

## 4. Datos personales

- [ ] Si Timbre va a manejar datos de clientes del negocio (formularios, hojas, automatizaciones): firmar `acuerdo-encargo-datos.md`.
- [ ] Todo formulario lleva la casilla de autorización (Ley 1581).
- [ ] El JSON del cliente se guarda en `negocios/privado/`, nunca en una carpeta publicada.

## 5. Arranque

- [ ] JSON del cliente armado en el constructor y validado (`node scripts/validar.js negocios/privado/<archivo>.json`).
- [ ] Entrega generada (`node scripts/generar.js negocios/privado/<archivo>.json`).
- [ ] Sesión de configuración agendada: [FECHA Y HORA].
- [ ] Capacitación gratuita agendada: [FECHA Y HORA].
- [ ] Seguir `entregas/<archivo>/lista-de-verificacion.md` durante la configuración.
