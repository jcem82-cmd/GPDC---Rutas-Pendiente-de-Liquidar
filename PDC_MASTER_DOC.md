# PDC Analytics Center — Documento Maestro
**Versión:** 1.4 | **Fecha:** 21 Junio 2026 | **Autor:** Charly / Grupo PDC

---

## 1. ARQUITECTURA DEL SISTEMA

### URLs de producción
| Dashboard | URL |
|---|---|
| Portal principal | `https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html` |
| Login | `.../login.html` |
| Liquidación de Rutas | `.../index.html` |
| Cash Today | `.../cash_today.html` |
| Consolidado Regional | `.../regional/index.html` |
| Perú | `.../peru/index.html` |
| Honduras | `.../honduras/index.html` |
| Admin | `.../admin.html` |

### Repositorio
- **GitHub:** `jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar` | Branch: `main`
- **Deploy:** GitHub Pages · GitHub Actions (~80s) · PUT vía GitHub REST API

### Stack Tecnológico
- HTML5 + JavaScript vanilla ES6+ (sin frameworks)
- Chart.js **4.4.1** (jsdelivr) | SheetJS **0.20.0** (cdn.sheetjs.com)
- Inter Google Fonts · Supabase (chat admin) · MS Teams + Power Automate

---

## 2. FLUJO DE AUTENTICACIÓN

```
login.html → [valida credenciales · bloqueo 3 intentos · remember-email]
           → guarda pdc_session (TTL 8h) → analytics.html
analytics.html → [verifica sesión · session watcher cada 60s]
              → muestra cards filtradas por rol/país/dashboards
card click → pdcNavigateToDash() → guarda pdc_user (legacy) → dashboard
dashboard  → Auth Bridge v2.0 (IIFE) → verifica pdc_session + pdc_user
           → redirige analytics.html si sesión inválida
```

### Keys de sesión
| Key | Formato | Uso |
|---|---|---|
| `pdc_session` | `{nombre, email, rol, pais, sedes, dashboards, ts}` | Principal |
| `pdc_user` | `{nombre, email, role, pais, acceso}` | Legacy dashboards |
| TTL | 8 horas | Validado en cada página + watcher |

---

## 3. USUARIOS DEL SISTEMA (14 usuarios)

| Email | Password | Nombre | Rol | País | Dashboards |
|---|---|---|---|---|---|
| juancarlos.escobar@grupopdc.com | PDC.Admin@2026 | Juan Carlos Escobar | admin | regional | rutas · cashtoday · regional · peru · honduras |
| erwin.soto@grupopdc.com | PDC.Sup.Reg@2026 | Erwin Soto | supervisor | regional | rutas · cashtoday · regional · peru · honduras |
| francisco.aguilar@grupopdc.com | PDC.Sup.GT@2026 | Francisco Aguilar | supervisor | GT | rutas · cashtoday |
| liquidaciones.cda@grupopdc.com | PDC.TeamGT@2026 | TEAM GT | consulta | GT | rutas · cashtoday |
| edy.lopez@grupopdc.com | PDC.Con.GT@2026 | Edy Lopez | consulta | GT | rutas |
| joaquin.palma@grupopdc.com | PDC.Con.ESV@2026 | Joaquin Palma | consulta | ESV | rutas · cashtoday |
| liquidaciones.esv@grupopdc.com | PDC.TeamESV@2026 | TEAM ESV | consulta | ESV | rutas · cashtoday |
| vinicio.sanabria@grupopdc.com | PDC.Con.GT2@2026 | Vinicio Sanabria | consulta | GT | rutas |
| claudio.rojas@grupopdc.com | PDC.Con.PE@2026 | Claudio Rojas | consulta | PE | rutas · peru |
| jose.mallqui@grupopdc.com | PDC.Con.PE2@2026 | Jose Mallqui | consulta | PE | rutas · peru |
| transportes.peru@grupopdc.com | PDC.TeamPE@2026 | TEAM Peru | consulta | PE | rutas · peru |
| carlos.reyes@grupopdc.com | PDC.Con.HN@2026 | Carlos Reyes | consulta | HN | rutas · honduras |
| maria.funez@grupopdc.com | PDC.Con.HN2@2026 | Maria Funez | consulta | HN | rutas · honduras |
| liquidaciones.hn@grupopdc.com | PDC.TeamHN@2026 | TEAM Honduras | consulta | HN | rutas · honduras |

---

## 4. ARCHIVOS DEL PROYECTO

| Archivo | Función | Versión | Estado |
|---|---|---|---|
| `login.html` | Auth + 14 usuarios + bloqueo + remember | v1.1 | ✅ |
| `analytics.html` | Portal hub + cards + admin + toast + watcher | v1.3 | ✅ |
| `index.html` | Dashboard Liquidación de Rutas + Export PDF | v12 | ✅ |
| `cash_today.html` | Dashboard Cash Today · 11 módulos · Presupuesto | v2.8 | ✅ |
| `regional/index.html` | Consolidado Regional · 4 países | v1.0 | ✅ |
| `peru/index.html` | Dashboard Perú · PEN · 4 módulos | v1.0 | ✅ |
| `honduras/index.html` | Dashboard Honduras · HNL · 4 módulos | v1.0 | ✅ |
| `admin.html` | Panel admin · chat Supabase | — | ✅ |
| `hub.html` | Hub legacy | — | ⚠️ Deprecado |

---

## 5. FASES COMPLETADAS

### Fase 0 — Fundación (v1.0)
- Auth unificada, portal hub, Auth Bridge v2.0, toast system, session watcher

### Fase 1 — Consolidado Regional (v1.1–v1.2)
- `regional/index.html`, semáforo cupo Cash Today, ?tab= URL param, bloqueo login, remember-email

### Fase 2 — Expansión Regional + Cash Today (v1.3–v1.4)
- Librerías unificadas (Chart.js 4.4.1 + SheetJS 0.20.0 en todos los archivos)
- `peru/index.html` v1.0 — PEN · paleta pe1/pe2 · 3 usuarios PE
- `honduras/index.html` v1.0 — HNL · paleta hn1/hn2 · 3 usuarios HN
- Módulo Presupuesto vs Real en `cash_today.html` — `_PRESUPUESTO` 24 filas · gráfica dual · tabla semáforo
- Export PDF ejecutivo en `index.html` — ventana A4 · `window.print()` · solo admin/tab Resumen
- TC histórico 2025 — `_TC_MENSUAL` Jun 2025→Jun 2026 (13 meses · 10,507 registros corregidos)

---

## 6. MÓDULO PRESUPUESTO VS REAL (cash_today.html)

```javascript
const _PRESUPUESTO = [
  // Estructura: {s: sede, p: país, div: moneda, ym: 'YYYY-MM', budget: monto}
  // 4 sedes × 6 meses 2026 = 24 filas
  // GT: CDA + Xela (GTQ) | SV: Santa Tecla + San Miguel (USD)
];
// Cálculo real: sobre RECS existente en tiempo real (sin duplicar datos)
// Semáforo: verde ≥100% · amarillo ≥85% · rojo <85%
```

---

## 7. EXPORT PDF EJECUTIVO (index.html)

```javascript
function exportarPDF() {
  // 1. Captura kgrid (6 KPIs) + de-card Despacho + de-card Facturación
  // 2. Abre ventana emergente con HTML autocontenido
  // 3. setTimeout 800ms → window.print()
  // Sin dependencias externas · @page{size:A4;margin:12mm 14mm}
}
// Visible solo en tab Resumen · solo admin · clase .pdf-btn.visible
```

---

## 8. TC MENSUAL (cash_today.html)

```javascript
const _TC_MENSUAL = {
  "2025-06": 7.69800, "2025-07": 7.70200, "2025-08": 7.70500,
  "2025-09": 7.69900, "2025-10": 7.69200, "2025-11": 7.68400, "2025-12": 7.67500,
  "2026-01": 7.66614, "2026-02": 7.66476, "2026-03": 7.64677,
  "2026-04": 7.63627, "2026-05": 7.62240, "2026-06": 7.62240
};
// Fuente: BANGUAT (promedios mensuales GTQ/USD)
// 13 meses: Jun 2025 → Jun 2026
// Fallback: tcGTQ = 7.61815
```

---

## 9. SUPABASE (admin.html / chat)

- **URL:** `https://pytsrgtcjytjztwdlvux.supabase.co`
- **Key pública:** `sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj`
- `chat_messages.id` es UUID — usar `created_at` para detectar nuevos mensajes

---

## 10. PENDIENTES (Fase 3+)

| # | Tarea | Prioridad |
|---|---|---|
| A | Análisis de festivos (campo `hol` ya en `_R`) | Alta |
| B | Alertas automáticas en Resumen cuando sede >85% cupo | Media |
| C | Export PDF Cash Today (replicar patrón Rutas) | Media |
| D | Módulo Presupuesto conectado a hoja Excel | Media |
| E | TC histórico 2024 si se carga data anterior a Jun 2025 | Baja |
| F | Token GitHub: rotar periódicamente | Alta |
| G | Integrar Power Automate Flujo 3 (resumen semanal) | Media |

---

## 11. NOTAS TÉCNICAS

- **Auth Bridge:** IIFE al inicio del `<body>` — bloquea render antes de validar sesión
- **sessionStorage** (no localStorage): sesión expira al cerrar el navegador / pestaña
- **cash_today.html es ~9.3 MB:** usar blob API para leer · Python urllib para escribir
- **GitHub Pages:** ~80s en reflejar cambios · cancela runs intermedios (normal)
- **Compatibilidad legacy:** `pdc_user` usa `role` (no `rol`) para guards anteriores
- **Canvas Chart.js:** no inicializar en contenedores `display:none` (módulo Tráfico usa SVG puro)
