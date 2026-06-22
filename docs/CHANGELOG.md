## [22/06/2026] — Integración Cash Today en PDC Analytics Center (analytics.html v1.5)

### analytics.html — 2 correcciones quirúrgicas (integración Cash Today v2.8)

**Diagnóstico previo al cambio:**
- Cash Today ya tenía entrada en `PDC_DASHBOARDS`, accent CSS, nav card y admin panel
- Auth Bridge v2.0 confirmado presente en `cash_today.html` (dentro del `<body>`)
- `pdcNavigate()` ya seteaba `pdc_user` para compatibilidad con `cash_today.html`
- Dos inconsistencias menores identificadas y corregidas

**Correcciones aplicadas:**

1. **KPIs de Cash Today actualizados a v2.8:**
   - `{ val:'2', lbl:'Países' }` → `{ val:'10', lbl:'Módulos' }` (refleja los 10 módulos de v2.8 incluyendo Presupuesto)
   - `actualizacion: '11 jun 2026'` → `'21 jun 2026'` (fecha real de última actualización)
   - Antes los KPIs no reflejaban el estado real del dashboard v2.8

2. **Timestamp en filename de snapshot Cash Today (consistencia con Rutas):**
   - `'Dashboard_CashToday.html'` → `'Dashboard_CashToday_'+new Date().toISOString().slice(0,10)+'.html'`
   - Rutas ya tenía timestamp; Cash Today tenía nombre fijo — inconsistencia corregida
   - Ejemplo resultado: `Dashboard_CashToday_2026-06-22.html`

**Arquitectura verificada (sin cambios requeridos):**
- `pdcNavigate('cash_today.html')` → setea `pdc_user` → Auth Bridge v2.0 en CT lo recibe ✅
- `pdcBridgeToTab('cash_today.html','config')` → acceso directo a módulo Config ✅
- `pdcDownload('cash_today.html',...)` → fetch + strip Auth Bridge + watermark ✅
- Accent CSS `.accent-cashtoday` → `linear-gradient(90deg,#E6501E,#FFAB00)` ✅
- `paises: { GT, ESV }` → chips de país correctos ✅

**SHAs post-deploy:**
- `analytics.html`: `991d127c8f8a7e7890406654e2828622d8425680`

---

# CHANGELOG — PDC Analytics Center | Grupo PDC

## [21/06/2026] — TC Histórico 2025 (cash_today.html)

### cash_today.html — 1 cambio quirúrgico
- **`_TC_MENSUAL` expandido:** Jun 2025 → Jun 2026 (13 meses completos)
  - Antes: solo Ene–Jun 2026 (6 meses) · 7 meses usaban TC fallback 7.61815
  - Ahora: cobertura completa del dataset desde el primer registro

| Mes | TC GTQ/USD (BANGUAT) |
|---|---|
| 2025-06 | 7.69800 |
| 2025-07 | 7.70200 |
| 2025-08 | 7.70500 |
| 2025-09 | 7.69900 |
| 2025-10 | 7.69200 |
| 2025-11 | 7.68400 |
| 2025-12 | 7.67500 |
| 2026-01 | 7.66614 (sin cambio) |
| … | … |

- **10,507 registros** de Jun–Dic 2025 ahora usan TC preciso mensual en todas las conversiones USD
- La tabla de Config (⚙️) muestra automáticamente los 13 meses

---

## [21/06/2026] — Export PDF Ejecutivo (index.html · Rutas)

### index.html — 5 cambios quirúrgicos
- **`@media print` CSS** — layout A4, oculta nav/header/filtros, preserva kgrid + de-grid
- **`exportarPDF()`** — abre ventana con reporte HTML limpio y llama `window.print()`
  - Header ejecutivo PDC con logo, título, fecha de corte y usuario
  - Sección KPIs globales (kgrid, 6 tarjetas con semáforo)
  - Sección detalle por país (de-card Despacho + Facturación)
  - Footer corporativo con fecha de datos
  - CSS self-contained (Inter, colores corporativos, bordes print-safe)
- **Botón `📄 Exportar PDF`** — header, `admin-visible`, clase `.pdf-btn`
- **`ST()` hook** — muestra/oculta botón PDF según tab activo (solo visible en Resumen)
- **Init visibility** — botón visible en carga inicial (resumen es tab por defecto)

### Arquitectura
- Sin dependencias externas de PDF — usa `window.print()` nativo
- Compatible con todos los navegadores modernos
- El usuario elige "Guardar como PDF" en el diálogo de impresión del navegador
- Estilo A4 forzado vía `@page{size:A4;margin:12mm 14mm}`

---

## [21/06/2026] — Módulo Presupuesto vs Real (Cash Today v2.8)

### cash_today.html — Cambios quirúrgicos (5 modificaciones)
- **Nav tab:** `🎯 Presupuesto` agregado entre Costo Servicio y Config
- **`renderPage()`:** case `'presupuesto'` → `renderPresupuesto()`
- **`_PRESUPUESTO`:** constante embebida con 24 filas (4 sedes × 6 meses 2026)
  - GT (GTQ): CDA + Xela · SV (USD): Santa Tecla + San Miguel
- **`renderPresupuesto()`:** función completa
  - Selectores año + país (Consolidado / GT / SV)
  - 4 KPI cards: Cumplimiento % (semáforo) · Presupuesto · Recolectado · Superávit/Déficit
  - Gráfica barras agrupadas + línea cumplimiento % (eje dual)
  - Tabla sede × mes con semáforo (verde ≥100% · amarillo ≥85% · rojo <85%)
  - Fila total con fondo navy suave
- **`page-presupuesto`:** HTML completo con toolbar, kpi-grid, canvas, tabla + nota de actualización
- **CSS:** `.pres-total`, `td.g/y/r`, `td.total-cell`

### Arquitectura
- Datos de presupuesto como constante `_PRESUPUESTO` (editable inline o via futura hoja Excel)
- Cálculo de real en tiempo real sobre `RECS` existente (sin duplicar datos)
- Presupuesto filtrable por año y país — listo para expansión multi-año

---

## [21/06/2026] — Sesión de desarrollo (continuación)

### Nuevos módulos
- **honduras/index.html v1.0** — Dashboard Liquidación de Rutas Honduras
  - 4 módulos: Resumen · Análisis · Detalle Rutas · Tendencias
  - Paleta corporativa Honduras: `--hn1:#003F8A` / `--hn2:#009E60`
  - KPIs: 52 rutas, 8 vencidas, 84.6% efectividad, L. 3,124,680 pendiente (≈ USD 125,996)
  - Moneda: HNL (Lempira) · TC referencial 24.80 HNL/USD
  - Dataset: 22 rutas detalle + 6 meses histórico Ene–Jun 2026
  - Distribución geográfica: Tegucigalpa · San Pedro Sula · La Ceiba · Choluteca
  - Auth Bridge v2.0 · `?tab=` URL param · nombre usuario en header

### Modificaciones
- **analytics.html** — Registro dashboard `honduras` + `accent-honduras` CSS + acción admin
- **login.html** — 3 usuarios HN creados: `carlos.reyes`, `maria.funez`, `liquidaciones.hn`
  - Admin y Supervisor: acceso `honduras` habilitado

---

---

## [21/06/2026] — Sesión de desarrollo

### Nuevos módulos
- **peru/index.html v1.0** — Dashboard Liquidación de Rutas Perú
  - 4 módulos: Resumen · Análisis · Detalle Rutas · Tendencias
  - Paleta corporativa Perú: `--pe1:#8B1A1A` / `--pe2:#E8A020`
  - KPIs: 74 rutas, 12 vencidas, 83.8% efectividad, S/ 2,847,320 pendiente
  - Dataset: 25 rutas detalle + 6 meses histórico Ene–Jun 2026
  - Distribución geográfica: Lima · Arequipa · Trujillo · Cusco
  - Auth Bridge v2.0 · `?tab=` URL param · nombre usuario en header

### Modificaciones
- **analytics.html** — Registro dashboard `peru` + `accent-peru` CSS + acción admin Panel Perú
- **login.html** — Acceso `peru` habilitado: `claudio.rojas`, `jose.mallqui`, `transportes.peru`, admin, supervisor

### Alineación de librerías (Fase 2 ítem 1)
| Archivo | Librería | Antes | Después |
|---|---|---|---|
| `index.html` | Chart.js | 4.4.0 cdnjs | **4.4.1 jsdelivr** |
| `cash_today.html` | SheetJS | 0.18.5 cdnjs | **0.20.0 cdn.sheetjs.com** |
| `cash_today.html` | Chart.js CDN | cdnjs | **jsdelivr** (versión igual 4.4.1) |
| `regional/index.html` | — | 4.4.1 ✅ | Sin cambio |
| `peru/index.html` | — | 4.4.1 ✅ | Sin cambio |

### Estado post-sesión
- Todas las librerías alineadas al estándar del Style Guide §7
- 5 archivos desplegados en producción · 5 pipelines success

---

## [v1.3] — 21/06/2026 · Alertas Semáforo Cash Today ✅

### `cash_today.html`
| # | Cambio | Detalle |
|---|---|---|
| 1 | Semáforo de cupo por cajero | Panel dinámico en módulo Resumen · respeta filtros activos |
| 2 | Umbrales 🟢🟡🔴 | <85% OK · 85–99% Alerta · ≥100% Crítico |
| 3 | AMAT consolidado | I + II como fila única · cupo Q18,000,000 combinado |
| 4 | Barra de progreso | Visual por cajero con dep actual vs cupo contratado |
| 5 | Contador de alertas | Header del panel muestra "N cajeros en alerta" en rojo |

### Estado datos Jun 2026
- PDC Comercial (Monedera) Santa Tecla: 91.7% → 🟡 Alerta activa

### Commits
| Commit | Descripción |
|---|---|
| `3eee0e40` | feat(cash_today): semáforo de cupo por cajero en módulo Resumen |

---

## [v1.2] — 21/06/2026 · Dashboard Consolidado Regional ✅
- `regional/index.html` creado · PDC_DASHBOARDS + admin panel actualizados

## [v1.1] — 21/06/2026 · Fase 1 completa ✅
- Regex unificado · Toast · Session watcher · ?tab= cash_today · Login lockout + remember email

## [v1.0] — 20/06/2026 · Lanzamiento inicial ✅
- login.html · analytics.html · Auth Bridge index.html + cash_today.html

---
*PDC Analytics Center · Grupo PDC · Departamento Financiero*
