# CHANGELOG — PDC Analytics Center | Grupo PDC

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
