# 📜 CHANGELOG — PDC Analytics Center

Formato: `## vX.Y — YYYY-MM-DD` seguido de cambios. Más reciente arriba.

---

## v13 — 2026-06-20 (PDC Analytics Center — Fases 3, 4 y 5)

### Fase 3 — Auth Bridge + navegación en index.html y admin.html
- **Auth Bridge v2.0** insertado en `index.html` (IIFE al inicio del `<body>`):
  - Lee `pdc_session` → mapea a `pdc_user` legacy con campos `pais` y `acceso`
  - Lee `?pdc_token=base64(...)` como fallback
  - Redirige a `analytics.html` si no hay sesión válida
- **Botón ⬅ Portal** agregado en header de `index.html` (visible todos los roles, estilo gris oscuro, a la derecha del botón ⏏ Salir existente)
- **Guard en `admin.html`** verificando `role === 'admin'` antes de renderizar

### Fase 4 — Auth Bridge + filtro país + navegación en cash_today.html
- **Auth Bridge v2.0** insertado en `cash_today.html`:
  - Misma lógica que index.html: lee `pdc_session`, mapea a `pdc_user`, fallback a token URL
  - Verifica que `cashtoday` esté en `acceso[]` del usuario; si no → redirige a `analytics.html`
- **Botón ⏏ Salir** en header de `cash_today.html` (limpia `pdc_session` y `pdc_user`, redirige a `analytics.html`)
- **Botón ⬅ Portal** en header de `cash_today.html` (visible todos los roles)
- **Función `pdcAutoSetPais()`** implementada:
  - Lee `pdc_session` → extrae campo `pais`
  - admin/supervisor/regional → sin restricción, selector libre
  - `GT`/`GT/CDA` → fuerza selector a "Guatemala" y lo deshabilita
  - `ESV` → fuerza selector a "El Salvador" y lo deshabilita
  - `PE` → sin datos en Cash Today (solo Rutas)
- **Llamada a `pdcAutoSetPais()`** en `DOMContentLoaded`, antes de `initFilters()` y `autoFilter()`

### Fase 5 — Token enriquecido + documentación
- **Token URL enriquecido** en `analytics.html`:
  - Antes: `btoa({email, nombre, rol})`
  - Ahora: `btoa({email, nombre, rol, pais, sedes, acceso})` — permite al Auth Bridge leer país y permisos desde el token
- **`PDC_Dashboard_Config.md` v2.0** actualizado con arquitectura completa, flujo de navegación, matriz de usuarios, lógica de filtro país, y guía de mantenimiento
- **`docs/MASTER_PROJECT_CONTEXT.md` v13** actualizado con contexto completo del sistema
- **`docs/CHANGELOG.md`** actualizado con todas las decisiones de esta sesión
- **`docs/ROADMAP.md`** actualizado con ítems completados y nuevos pendientes

---

## v12 — 2026-06-11/12 (Fases 1 y 2 — Auth Core + Portal)

### Fase 1 — Auth Core
- `login.html`: formulario + validación + generación de `pdc_session`
- `js/users.js`: matriz centralizada con 11 usuarios, roles, países y accesos
- `js/auth.js`: funciones `pdcAuthenticate()`, `pdcGetSession()`, `pdcRequireAuth()`, `pdcGetUserDashboards()`
- Roles implementados: `admin`, `supervisor`, `consulta`

### Fase 2 — Portal analytics.html
- Cards ejecutivas por dashboard (`rutas`, `cashtoday`)
- Visibilidad de cards según `dashboards[]` del usuario
- Chip de país y rol en header
- Función `pdcGoToDashboard()`: index.html en misma pestaña, cash_today en nueva pestaña con token
- Botón "Cerrar sesión" en header: limpia `pdc_session` + `pdc_user` → redirige a login.html
- Acciones admin: sección exclusiva para rol admin (Supabase, GitHub, etc.)

### Fixes en index.html (v12)
- Soporte `.xlsm` en módulo Tipos de Cambio
- Fix botón "🚀 Publicar en GitHub" que quedaba disabled permanentemente
- Fix `processWorkbook()`: elimina filas plantilla futuras (`total=0`)
- Fix `KPI_HIST.vencidas` vs `EFECT.mas15` (métricas independientes)
- Fix chat: `#chatBox` tenía `display:none` inline sobreescribiendo CSS
- Fix `chatFabIco` no existía para usuarios regulares
- Fix comparación UUID con `>` (cambiado a `created_at`)
- Fix `⬇ Guardar Snapshot` hardcodeado visible para todos

---

## v11 — 2026-06-09

- Dashboard reconstruido sobre base 29/05/2026, datos actualizados a 08/06/2026
- Login con 6 usuarios (1 admin, 5 consulta), roles diferenciados
- Logo PDC embebido (base64 JPEG)
- Chat de soporte en tiempo real (polling Supabase)
- `admin.html` — panel de conversaciones
- Módulo Tipos de Cambio self-service (Publicar en GitHub)
- Fix fechas 1899/1900 en gráfica de tendencia
- Power Automate: OneDrive → Teams

---

## Versiones anteriores (pre-v11)
Ver historial de commits en GitHub.
