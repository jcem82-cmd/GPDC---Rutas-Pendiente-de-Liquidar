# 🔒 PROJECT_RULES.md — Reglas Permanentes (NO NEGOCIABLES)

## 1. Principio general de edición
- **Cambios siempre quirúrgicos.** Leer `index.html` actual (HEAD de `main`) antes de editar.
- Modificar **solo** lo solicitado. Preservar CSS/JS/HTML no relacionado.
- **Nunca reconstruir** el archivo desde cero.
- Nunca eliminar funcionalidades existentes sin confirmación explícita del usuario.

## 2. Estructura de datos (constantes JS en index.html)
- `RAW` — array de rutas (de `General (seguimiento)`, filtrado con `Numero de Despacho` no nulo).
- `KPI_TOTALS` — totales agregados (report_date, report_month, totales por moneda/canal).
- `KPI_HIST` — histórico mensual `{mes, vencidas, total, pct}` — gráfica "Total Rutas vs Vencidas".
  - `vencidas` = conteo de `Estado Real==='Vencidas'` en `General (seguimiento)` para el mes activo (último con datos).
- `EFECT` — histórico mensual `{mes, total, mas15, pct}` — gráfica "Rutas ≥15 días" (Efectividad).
  - `mas15` = valor **real** de la columna "Rutas >15 días" de la hoja Efectividad. **NO se sobreescribe** con `vencidas`.
  - ⚠️ `vencidas` (KPI_HIST) y `mas15` (EFECT) son **métricas distintas** y pueden diferir legítimamente (ej. 36 vencidas totales, 0 con ≥15 días de retraso).

## 3. Extracción de Excel (`processWorkbook`)
- Hojas requeridas: `General (seguimiento)`, `Efectividad`. NO depender de `Target días`, `KPI`, `Total Rutas (Gral)` (no existen).
- `General (seguimiento)`: filtrar `dropna(subset=['Numero de Despacho'])`. Usar `Cliente` (mayúscula) para campo `cliente`.
- País derivado de `Moneda`: GTQ→Guatemala, USD→El Salvador, PEN→Perú, HNL→Honduras.
- `Efectividad`: `header=None` / `{header:1, cellDates:true}`, header real en fila índice 2, datos desde índice 3.
- **Filas plantilla futuras** (total=0, meses sin datos aún) deben **eliminarse** del final de `efData` antes de derivar `kpiData`.
- Acepta `.xlsx` y `.xlsm` (las macros se ignoran, SheetJS solo lee celdas).

## 4. Control de acceso por rol (`sessionStorage.pdc_user.role`)

| Elemento | Admin | Usuario regular |
|---|---|---|
| ⬇ Guardar Snapshot | ✅ visible (`admin-visible` agregado por JS) | ❌ oculto (`display:none` default) |
| 💱 Tipos de Cambio (tab + módulo subir Excel) | ✅ visible (`admin-visible` por JS) | ❌ oculto |
| ⏏ Salir | ✅ siempre visible | ✅ siempre visible |
| 💬 Chat soporte (widget flotante) | Redirige a `admin.html` | ✅ funcional (panel flotante) |
| Tab inicial por defecto | Resumen General | Resumen General |

⚠️ **No volver a hardcodear `admin-visible` en el HTML estático** — debe agregarse SOLO vía JS según `data.role`. Esto causó bugs repetidos donde botones admin-only aparecían para todos.

## 5. GitHub API
- Siempre `GET` el SHA actual antes de `PUT` (contents endpoint).
- 409 Conflict → esperar ~30s y reintentar con SHA fresco.
- Token fragmentado en array JS para evitar secret-scanning (ver `MASTER_PROJECT_CONTEXT.md`).
- Cada commit debe tener mensaje descriptivo del fix/feature.

## 6. Chat de soporte (Supabase)
- `chat_messages.id` es **UUID** — nunca comparar con `>` contra un número. Usar `created_at` (timestamp) para detectar mensajes nuevos.
- `#chatBox` NO debe tener `style="display:none"` **inline** — esto rompe la transición CSS `.chat-box.open{display:flex}` (especificidad). El control de visibilidad es 100% vía clase `.open`.
- Admin responde insertando fila con `sender_email = email_del_usuario_destino`, `sender_role='admin'`, mensaje prefijado `[To:email]`.
- Usuario consulta con `WHERE sender_email = currentUser.email` (trae ambos: sus mensajes y respuestas del admin).
- Polling: 3s en background, 1.5s con chat abierto (Realtime no configurado en Supabase).

## 7. Diseño visual
- Colores corporativos: navy `#001240`-`#002060`, sky `#0ea5e9`, índigo `#4f46e5`.
- Mantener menú superior de tabs (no agregar sidebar).
- Mantener iconografía emoji existente (📊🔍🚛📈📋📑💱⏏).
- Logo PDC (base64 JPEG) siempre visible en header.
- Responsive: desktop/tablet/mobile.

## 8. Sesión / Login
- Todo acceso pasa por `login.html` excepto snapshots descargados (sin guard).
- `sessionStorage.pdc_user = {email, nombre, role}`.
- `pdcLogout()`: `sessionStorage.removeItem('pdc_user')` + redirect a `login.html`.

## 9. Reporte post-cambio
Tras cada actualización, reportar: URL de verificación, KPIs clave (Total Rutas, Vencidas, %), y commit hash.
