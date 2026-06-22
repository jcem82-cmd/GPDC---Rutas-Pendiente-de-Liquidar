# ROADMAP — PDC Analytics Center | Grupo PDC

**Estado actual: v1.3 ESTABLE** · Próxima versión objetivo: v1.4
**Última actualización:** 21/06/2026

---

## ✅ FASE 0 — Fundación (COMPLETADA · v1.0)
## ✅ FASE 1 — Consolidación Portal (COMPLETADA · v1.1)
## ✅ FASE 2 · Ítem 1 — Consolidado Regional (COMPLETADA · v1.2)
## ✅ FASE 2 · Ítem 2 — Alertas Semáforo Cash Today (COMPLETADA · v1.3)

- [x] **Semáforo de cupo por cajero** en módulo Resumen de `cash_today.html`
  - Panel dinámico: se renderiza con `fData` (respeta filtros activos de mes/país/sede)
  - Umbrales: 🟢 <85% OK · 🟡 85–99% Alerta · 🔴 ≥100% Crítico
  - AMAT consolidado: I + II como una sola fila (cupo Q18M combinado)
  - Barra de progreso visual por cajero con valores dep/cupo
  - Se oculta si no hay cajeros con movimiento en el periodo seleccionado
  - Jun 2026: PDC Comercial (Monedera) Santa Tecla al 91.7% → 🟡 en producción

---

## 🔵 FASE 2 — Continuación (v1.4)
- [x] **Alinear versiones librerías:** ✅ COMPLETADO 21/06/2026 — Chart.js 4.4.1 + SheetJS 0.20.0 en todos los dashboards
- [x] **Dashboard Perú (PE):** ✅ COMPLETADO 21/06/2026 — `peru/index.html` v1.0 · 4 módulos · Auth Bridge · paleta pe1/pe2 módulo independiente `peru/index.html`
- [x] **Dashboard Honduras (HN):** ✅ COMPLETADO 21/06/2026 — `honduras/index.html` v1.0 · 4 módulos · Auth Bridge · paleta hn1/hn2 · 3 usuarios HN módulo independiente `honduras/index.html`

## 🟠 FASE 3 — Evolución Dashboard Rutas (v13)
- [ ] Alertas vencidas vía Teams · Export PDF · Histórico snapshots

## 🟠 FASE 4 — Evolución Dashboard Cash Today (v2.8)
- [x] **Presupuesto vs Real · Export PDF · TC histórico 2025 · Análisis festivos** — Presupuesto ✅ COMPLETADO 21/06/2026

## 🔴 FASE 5 — Plataforma Avanzada (v2.0)
- [ ] Admin Dashboard · Push notifications · Modo oscuro · PWA · IA predictiva

---

## 🏗 ARQUITECTURA DE MÓDULOS (regla permanente)
Todo nuevo dashboard = módulo independiente en carpeta propia.
`analytics.html` = Hub exclusivo de navegación y auth.

```
repo/
├── analytics.html        ← Hub central
├── login.html            ← Auth unificada
├── index.html            ← Rutas v12
├── cash_today.html       ← Cash Today v2.7 + semáforo
├── regional/index.html   ← Consolidado Regional v1.0
└── docs/
```

*PDC Analytics Center · v1.3 · 21 Jun 2026*
