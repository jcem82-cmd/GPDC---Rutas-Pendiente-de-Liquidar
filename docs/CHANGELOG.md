# CHANGELOG — PDC Analytics Center | Grupo PDC

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
