# ROADMAP — PDC Analytics Center | Grupo PDC

**Estado actual: v1.2 ESTABLE** · Próxima versión objetivo: v1.3
**Última actualización:** 21/06/2026

---

## ✅ FASE 0 — Fundación de Plataforma (COMPLETADA · v1.0 · Jun 2026)
- [x] `login.html` · `analytics.html` · Auth unificado · despliegue GitHub Pages

## ✅ FASE 1 — Consolidación y Mejoras Portal (COMPLETADA · v1.1 · Jun 2026)
- [x] Regex Auth Bridge unificado (index.html + cash_today.html)
- [x] Toast de descarga · session expiry watcher · pdcRenewSession
- [x] login.html: bloqueo 3 intentos + remember-email
- [x] cash_today.html: ?tab= URL param + nombre usuario en header

## ✅ FASE 2 — Nuevos Dashboards · Ítem 1 (COMPLETADA · v1.2 · Jun 2026)
- [x] **Dashboard Consolidado Regional** — `regional/index.html`
  - 4 tabs: Resumen Regional · Liquidación de Rutas · Cash Today · Por País
  - KPIs: 680 rutas pendientes · 39 vencidas · USD 21.7M YTD
  - Datos: GT, SV, PE, HN (Honduras placeholder)
  - Auth Bridge v2.0 · ?tab= URL param · nombre usuario
  - Registrado en analytics.html PDC_DASHBOARDS
  - Acceso: admin + supervisor regional

---

## 🔵 FASE 2 — Nuevos Dashboards (v1.3 · Continuación)
- [ ] **Dashboard Perú (PE):** Liquidación rutas específico
- [ ] **Dashboard Honduras (HN):** Liquidación rutas Honduras
- [ ] **Alertas semáforo Cash Today:** ≥85% cupo → warning en módulo Resumen
- [ ] **Alinear versiones:** SheetJS 0.20.0 en ambos · Chart.js 4.4.1 en ambos

## 🟠 FASE 3 — Evolución Dashboard Rutas (v13)
- [ ] Alertas vencidas vía Teams · Export PDF · Histórico snapshots portal

## 🟠 FASE 4 — Evolución Dashboard Cash Today (v2.8)
- [ ] Módulo Presupuesto vs Real · Alertas automáticas · Export PDF · TC histórico 2025

## 🔴 FASE 5 — Plataforma Avanzada (v2.0 · Largo Plazo)
- [ ] Admin Dashboard · Push notifications · Modo oscuro · PWA · IA predictiva

---

## 📋 BACKLOG

| Prioridad | Descripción | Archivo |
|---|---|---|
| Alta | Alinear SheetJS: Rutas 0.20.0 vs CashToday 0.18.5 | Ambos |
| Media | Alinear Chart.js: Rutas 4.4.0 vs CashToday 4.4.1 | Ambos |
| Media | Validar visitas SV con Recogidas | cash_today.html |
| Media | Variables CSS :root en index.html | index.html |
| Media | Actualizar Consolidado Regional con datos Perú completos | regional/index.html |
| Baja | Tooltip hover Tráfico · Badge último mes · Paginación móvil | cash_today.html |

---

## 🏗 ARQUITECTURA DE MÓDULOS — Regla permanente

> Todo nuevo dashboard o reporte se implementa como módulo independiente.
> El portal `analytics.html` actúa exclusivamente como Hub de navegación,
> autenticación y control de permisos. La lógica de negocio vive en cada módulo.

**Estructura de carpetas:**
```
repo/
├── analytics.html      ← Hub central (solo navegación y auth)
├── login.html          ← Autenticación unificada
├── index.html          ← Dashboard Rutas v12
├── cash_today.html     ← Dashboard Cash Today v2.7
├── regional/
│   └── index.html      ← Consolidado Regional v1.0
├── [futuro]/
│   └── index.html      ← Cada nuevo módulo en su carpeta
└── docs/
```

*PDC Analytics Center · Grupo PDC · v1.2 · Junio 2026*
