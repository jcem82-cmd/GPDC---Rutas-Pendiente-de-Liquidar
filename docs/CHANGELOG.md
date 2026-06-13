# 📜 CHANGELOG — Dashboard Liquidación de Rutas

Formato: `## vX.Y — YYYY-MM-DD` seguido de cambios. Más reciente arriba.

---

## v12 — 2026-06-11/12 (sesión actual)

**Datos:**
- Procesado `Rutas no Liquidadas 11.06.2026.xlsm` (710 rutas, 36 vencidas) vía módulo Tipos de Cambio.
- `KPI_HIST['2026-06']`: vencidas=36, total=2066.
- `EFECT['2026-06']`: mas15=0 (valor real de Efectividad — métrica "≥15 días" distinta de "vencidas").

**Fixes — Módulo Tipos de Cambio (autoservicio):**
- Soporte para subir archivos `.xlsm` (con macros) además de `.xlsx`. SheetJS ignora macros automáticamente.
- Fix botón "🚀 Publicar en GitHub": quedaba `disabled` permanentemente tras procesar el Excel (texto fijo "Publicando...", `disabled=""` en HTML nunca se quitaba). Ahora se habilita correctamente tras parseo exitoso.
- Fix `processWorkbook()`: elimina filas plantilla futuras (`total=0`) del final de `efData` antes de derivar `kpiData` — evita que datos del mes activo se asignen al mes siguiente vacío.
- Fix `processWorkbook()`: `KPI_HIST.vencidas` (mes activo) ahora usa el conteo real de `Estado Real==='Vencidas'` de `General (seguimiento)` cuando supera al valor de Efectividad. `EFECT.mas15` ya NO se sobreescribe — se mantiene como valor real de la hoja Efectividad (métrica "≥15 días" independiente).

**Fixes — Chat de soporte:**
- Root cause: `#chatBox` tenía `style="display:none"` **inline**, que sobreescribía la regla CSS `.chat-box.open{display:flex}` por especificidad → el panel nunca abría para usuarios regulares (admin no usa `toggle()`, por eso "funcionaba" solo para él). Eliminado el inline style.
- Fix secundario: `chatFabIco` (span del ícono del botón flotante) no existía en el HTML para usuarios regulares → error JS al hacer clic. Ahora se inyecta dinámicamente en `initChat()`.
- Fix: `checkNewAdminReply()` / `checkNewUserMsgs()` comparaban `id` (UUID de Supabase) con `>` contra `0` — comparación siempre `false`. Cambiado a comparación por `created_at` (timestamp).

**Fixes — Control de acceso por rol:**
- `⬇ Guardar Snapshot`: traía `class="hdr-dl-btn admin-visible"` **hardcodeada en HTML**, visible para todos sin importar rol. Removida; ahora solo JS la agrega si `role==='admin'`.
- `💱 Tipos de Cambio` (tab + panel): oculto por defecto, visible solo para admin (`admin-visible` vía JS). Antes era además el **panel activo por defecto** para todos — corregido, ahora "Resumen General" es el panel inicial.
- `⏏ Salir` (nuevo): botón en header superior derecho, visible para **todos los roles** (`display:flex !important` inline, independiente de `.hdr-dl-btn` admin-only). Limpia `sessionStorage.pdc_user` y redirige a `login.html`.

---

## v11 — 2026-06-09

- Dashboard reconstruido sobre base 29/05/2026, datos actualizados a 08/06/2026.
- Login con 6 usuarios (1 admin, 5 consulta), roles diferenciados.
- Logo PDC embebido (base64 JPEG).
- Chat de soporte en tiempo real (polling, sin Supabase Realtime).
- `admin.html` — panel de conversaciones.
- Botón "⬇ Guardar Snapshot" (admin-only en su momento).
- Módulo Tipos de Cambio habilitado como canal self-service (`Publicar en GitHub` sin tokens Claude).
- Fix fechas 1899/1900 en gráfica de tendencia (`cellDates:true`, `xlSerialToDate` valida rango 2000-2100).
- `KPI_HIST`/`EFECT` derivados siempre de hoja Efectividad.
- Equipo MS Teams "C & C | Liquidaciones" + Power Automate (OneDrive → Teams).

---

## Versiones anteriores
Ver `PDC_Dashboard_Config.md` en el repo para historial pre-v11.
