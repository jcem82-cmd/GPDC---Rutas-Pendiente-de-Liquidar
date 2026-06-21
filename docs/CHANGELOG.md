# CHANGELOG — PDC Analytics Center | Grupo PDC

---

## [v1.1] — 21/06/2026 · Fase 1 completa ✅

### `analytics.html`
| # | Cambio | Detalle |
|---|---|---|
| 1 | Regex unificado Auth Bridge | Cubre `index.html` (patrón IIFE) y `cash_today.html` (patrón comentario) en una sola expresión |
| 2 | Toast de descarga | Notificación visual esquina inferior derecha · auto-dismiss 4.5s · reemplaza `alert()` |
| 3 | Session expiry watcher | Corre cada 60s · banner amarillo + toast a 15 min del TTL · `pdcRenewSession()` extiende sin re-login |

### `cash_today.html`
| # | Cambio | Detalle |
|---|---|---|
| 4 | `?tab=` URL param | `pdcBridgeToTab('cash_today.html','config')` navega directo al módulo config |
| 5 | Nombre de usuario en header | Se popula desde `pdc_session` o `pdc_user` al cargar |

### `login.html`
| # | Cambio | Detalle |
|---|---|---|
| 6 | Bloqueo por 3 intentos | Countdown 30s visible en botón · se resetea al lograr acceso exitoso |
| 7 | Recordar email | Checkbox persiste en `localStorage` · se carga automáticamente al abrir login |

### Commits
| Commit | Descripción |
|---|---|
| `cc9d03a3` | fix(analytics): unified Auth Bridge regex |
| `4a66fa4a` | feat(analytics): toast + session expiry watcher |
| `25777a37` | fix(analytics): remove {0,50} quantifier from regex |
| `e95f1f13` | feat(cash_today): ?tab= URL param + user name in header |
| `dadd824f` | feat(login): 3-attempt lockout + remember-email |

---

## [v1.0] — 20/06/2026 · Lanzamiento inicial ✅

### Archivos creados
- `login.html` — Login corporativo split-screen · 11 usuarios · 3 roles · TTL 8h
- `analytics.html` — Portal hub · tarjetas por rol · panel admin · pdcDownload con fetch+regex

### Integración dashboards legados
- `index.html` v12 — Auth Bridge v2.0 · soporte `pdc_session` + `pdc_user` + `?pdc_token`
- `cash_today.html` v2.7 — Auth Bridge v2.0 · guard de acceso a `cashtoday`

---

*PDC Analytics Center · Grupo PDC · Departamento Financiero*
