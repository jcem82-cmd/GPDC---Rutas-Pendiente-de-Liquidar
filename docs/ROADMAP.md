# ROADMAP — PDC Analytics Center | Grupo PDC

**Estado actual: v1.4 ESTABLE** · Próxima versión objetivo: v1.5
**Última actualización:** 21/06/2026

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

## 🔵 FASE 3 — Mejoras Operativas (v1.5 · Próximo sprint)

- [ ] **Análisis de festivos** — campo `hol` ya disponible en `_R` · impacto días festivos en recolección Cash Today
- [ ] **Alertas automáticas en Resumen** — semáforo cuando sede supera 85% cupo o debajo 70% presupuesto (Cash Today)
- [ ] **Export PDF Cash Today** — replicar patrón del PDF de Rutas en `cash_today.html`
- [ ] **TC histórico 2024** — ampliar `_TC_MENSUAL` hacia atrás si se carga data anterior a Jun 2025

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

*PDC Analytics Center · v1.4 · 21 Jun 2026*
