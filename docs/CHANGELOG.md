# CHANGELOG — PDC Analytics Center | Grupo PDC

---

## [v1.2] — 21/06/2026 · Dashboard Consolidado Regional ✅

### Archivos creados
| Archivo | Descripción |
|---|---|
| `regional/index.html` | Dashboard Consolidado Regional v1.0 — nuevo módulo independiente |

### `regional/index.html` — funcionalidades
| # | Feature | Detalle |
|---|---|---|
| 1 | Auth Bridge v2.0 | Guard de sesión · redirect a `../analytics.html` si sin sesión |
| 2 | 4 tabs de navegación | Resumen Regional · Rutas · Cash Today · Por País |
| 3 | KPIs globales | 680 rutas · 39 vencidas · USD 1.77M Jun · USD 21.7M YTD |
| 4 | Gráficas Chart.js | Rutas por país (barra H) · YTD donut · Tendencia línea · Vencidas barra dual · Mensual CT · Donut CT |
| 5 | Tabla por país y canal | Detalle pendientes y vencidas con semáforo |
| 6 | Tabla mensual Cash Today | Ene–Jun 2026 GT vs SV en USD |
| 7 | Ficha por país | KPIs individuales GT · SV · PE · HN |
| 8 | ?tab= URL param | Navegación directa por URL |
| 9 | Nombre usuario en header | Desde pdc_session o pdc_user |
| 10 | Diseño corporativo PDC | Paleta unificada · Inter · responsive · animaciones |

### `analytics.html`
| # | Cambio | Detalle |
|---|---|---|
| 11 | PDC_DASHBOARDS regional | Registrado con acceso admin + supervisor regional |
| 12 | Admin panel button | Botón "Consolidado Regional" en panel de administración |

### `login.html`
| # | Cambio | Detalle |
|---|---|---|
| 13 | dashboards[] regional | Admin y supervisores regionales tienen acceso a 'regional' |

### Commits
| Commit | Descripción |
|---|---|
| `459c5fa4` | feat(regional): Dashboard Consolidado Regional v1.0 |
| `861a2741` | feat(analytics): register Consolidado Regional |
| `4fd6ce80` | feat(login): add 'regional' to admin+supervisor users |

### Decisión arquitectónica registrada
Todo nuevo dashboard se implementa como módulo independiente en su propia carpeta.
`analytics.html` actúa exclusivamente como Hub de navegación y control de permisos.

---

## [v1.1] — 21/06/2026 · Fase 1 completa ✅

### `analytics.html`
- Regex unificado Auth Bridge · Toast de descarga · Session expiry watcher

### `cash_today.html`
- ?tab= URL param · Nombre usuario en header

### `login.html`
- Bloqueo 3 intentos (30s) · Remember-email checkbox

---

## [v1.0] — 20/06/2026 · Lanzamiento inicial ✅
- `login.html` · `analytics.html` · Auth Bridge index.html + cash_today.html

---
*PDC Analytics Center · Grupo PDC · Departamento Financiero*
