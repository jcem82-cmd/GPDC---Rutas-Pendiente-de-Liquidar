# 03 — ROADMAP
## PDC Analytics Center · Plan de Evolución

**Estado actual: v2.13 ESTABLE** · Próxima versión objetivo: v2.14
**Última actualización:** 23/07/2026 (agregados pendientes de sesión — ver sección correspondiente)

---

## ✅ FASE 0 — Fundación (COMPLETADA · v1.0)

- [x] Autenticación unificada `login.html` — 11 usuarios iniciales · roles admin/supervisor/consulta
- [x] Portal hub `analytics.html` — cards ejecutivas filtradas por rol/país
- [x] Auth Bridge v2.0 en `index.html` y `cash_today.html`
- [x] Toast notification system (reemplaza todos los `alert()`)
- [x] Session watcher (banner + toast a 15 min · `pdcRenewSession()`)
- [x] Panel administración en `analytics.html`

---

## ✅ FASE 1 — Consolidado Regional (COMPLETADA · v1.1–v1.2)

- [x] `regional/index.html` v1.0 — Consolidado Regional 4 países
- [x] Semáforo de cupo por cajero en `cash_today.html` módulo Resumen
- [x] `?tab=` URL param en `cash_today.html` y `index.html`
- [x] Nombre usuario en header de todos los dashboards
- [x] Timestamp-dated snapshot filenames
- [x] Last-access display en hero section
- [x] Remember-email en `login.html`
- [x] Bloqueo 3 intentos login (30s countdown)

---

## ✅ FASE 2 — Expansión Regional + Cash Today (COMPLETADA · v1.3–v1.4)

- [x] **Alinear librerías:** Chart.js 4.4.1 + SheetJS 0.20.0 en todos los dashboards (cdn.jsdelivr.net / cdn.sheetjs.com)
- [x] **Dashboard Perú v1.0** — `peru/index.html` · 4 módulos · PEN · paleta pe1/pe2 · 3 usuarios HN
- [x] **Dashboard Honduras v1.0** — `honduras/index.html` · 4 módulos · HNL · paleta hn1/hn2 · 3 usuarios HN
- [x] **Módulo Presupuesto vs Real** — `cash_today.html` · `_PRESUPUESTO` 24 filas · KPIs + gráfica dual + tabla semáforo sede×mes
- [x] **Export PDF ejecutivo** — `index.html` · `exportarPDF()` · ventana A4 · `window.print()` · visible solo tab Resumen
- [x] **TC histórico 2025** — `_TC_MENSUAL` expandido Jun 2025→Jun 2026 (13 meses) · 10,507 registros corregidos

---

## ✅ FASE 3 — Mejoras Operativas (COMPLETADA · v2.13 · 22/06/2026)

- [x] **Análisis de festivos** — tab 🗓 Festivos expuesto en nav · `renderFestivos()` conectada · datos `hol` activos
- [x] **Alertas semáforo en Resumen** — `renderAlertasPresupuesto()` 85%/70% ya funcional dentro de `renderResumen`
- [x] **Export PDF Cash Today** — `exportarPDF_CT()` implementado · botón en header · visible solo en Resumen (admin)
- [x] **TC histórico 2024** — `_TC_MENSUAL` 25 meses Ene 2024 → Jun 2026 · aplicado por transacción vía `usd(r)`

---

## 🟡 PENDIENTES — Sesión 23/07/2026 (ver docs/01_MASTER_PROJECT_CONTEXT.md §12 y docs/02_CHANGELOG.md para detalle completo)

- [ ] **Histórico real de Efectividad/Monto para Guatemala** — no existe dashboard país dedicado (`peru/index.html`/`elsalvador/index.html` sí ya tienen su histórico real Ene-Jun 2026; GT queda pendiente de definir dónde correspondería)
- [ ] **Tablas "Resumen Histórico"/"Detalle Mensual" de Cash Today en `regional/index.html`** — siguen siendo 100% estáticas/de referencia, sin conexión a ningún dato real publicado (Hallazgo 3, identificado pero deliberadamente diferido — requiere diseño de pipeline de persistencia mensual)
- [ ] **Cobertura de etiquetas de período abreviadas en `regional/index.html`** — extendida parcialmente; quedan pendientes las fechas con día específico ("24 Jun 2026") ligadas al módulo Cash Today, mezcladas con el punto anterior
- [ ] **Migración de seguridad Supabase Auth** (mencionada en sesiones previas) — confirmada como YA IMPLEMENTADA (`login.html`/`analytics.html` leen `profiles` en Supabase desde el 20/07/2026); pendiente verificar si el token de GitHub embebido en `cash_today.html` (self-publish) ya fue rotado como parte de ese esfuerzo

---

## 🟠 FASE 4 — Automatización y Datos (v1.6)

- [ ] **Script Python standalone** — genera HTML actualizado sin subir a Claude
- [ ] **Validación automática de totales** al cargar Excel (Cash Today)
- [ ] **Detección de nuevas sedes/cajeros** sin modificar código
- [ ] **Módulo Presupuesto actualizable** — conectar hoja `Presupuesto` del Excel fuente a `_PRESUPUESTO`
- [ ] **Alertas vía Teams** — rutas vencidas por umbral configurable

---

## 🔴 FASE 5 — Plataforma Avanzada (v2.0 · Largo plazo)

- [ ] **Admin Dashboard** — métricas de uso de plataforma, sesiones activas
- [ ] **Push notifications** — Teams/email por umbral de KPIs
- [ ] **Modo oscuro** — toggle en header, persistido en localStorage
- [ ] **PWA** — Progressive Web App, installable en móvil
- [ ] **IA predictiva** — flujo de efectivo, tendencias de vencimiento
- [ ] **APIs bancarias** — saldos en tiempo real
- [ ] **Power BI** como capa de visualización alternativa

---

## 🏗 ARQUITECTURA DE MÓDULOS (regla permanente)

Todo nuevo dashboard = módulo independiente en carpeta propia.
`analytics.html` = Hub exclusivo de navegación y auth.

```
repo/
├── analytics.html          ← Hub central (auth + navegación)
├── login.html              ← Auth unificada (14 usuarios)
├── index.html              ← Rutas v12 + Export PDF
├── cash_today.html         ← Cash Today v2.8 + Presupuesto
├── regional/index.html     ← Consolidado Regional v1.0
├── peru/index.html         ← Perú v1.0 (PEN)
├── honduras/index.html     ← Honduras v1.0 (HNL)
└── docs/
```

**Paletas por país:**
| País | Color 1 | Color 2 |
|---|---|---|
| Guatemala | `#002060` | `#00B8D9` |
| El Salvador | `#E6501E` | `#FFAB00` |
| Perú | `#8B1A1A` | `#E8A020` |
| Honduras | `#003F8A` | `#009E60` |
| Regional/Global | `#5B2D8E` | `#A78BFA` |

---

*PDC Analytics Center · v2.13 · 22 Jun 2026*
