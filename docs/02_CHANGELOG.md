# 02 — CHANGELOG
## PDC Analytics Center · Historial de Versiones

---

## [v1.5] — 24/06/2026 · Corrección Global de Datos + Unificación Motor de Cálculo ✅

### Resumen ejecutivo
Auditoría completa de todos los módulos del Dashboard. Se identificó que el RAW embebido tenía datos del corte 11/06/2026. Se actualizaron los 4 datasets al corte 18/06/2026 y se unificó `renderTableros()` para consumir la misma fuente que el resto de módulos.

### Archivos modificados
| Archivo | Cambio |
|---|---|
| `index.html` | RAW, KPI_HIST, EFECT, KPI_TOTALS actualizados al corte 18/06/2026 |
| `index.html` | `renderTableros()` unificado: usa `FD` en lugar de `RAW` directo |
| `index.html` | `addDR()` + `RD()` modo rango: lógica independiente Facturación (col I) / Despacho (col D) |
| `analytics.html` | Tarjeta HN eliminada → reemplazada por tarjeta ESV (El Salvador) |
| `analytics.html` | Hero KPIs actualizados: 710→146, 36→87, 4→3 países |
| `analytics.html` | Todas las tarjetas actualizadas al corte 24/06/2026 |

### Motor de cálculo — Auditoría y resultado
| Módulo | Función | Fuente | Estado |
|---|---|---|---|
| Resumen General KPIs | `RK()` | `FD` (notLiq) | ✅ Correcto |
| Header badges | `AF()` | `FD` (notLiq) | ✅ Correcto |
| Desglose por estado | `RDE()` | `FD` col J / col E | ✅ Correcto |
| Country cards | `RCC()` | `FD` | ✅ Correcto |
| Análisis por Canal | `RC()` | `FD` | ✅ Correcto |
| Análisis por Área | `RD()` + `addDR()` | `FD` col I (Fac) / col D (Desp) | ✅ Corregido |
| Transportistas | `RT()` | `FD` | ✅ Correcto |
| Mapa de rutas | `RM()` | `FD` | ✅ Correcto |
| Tableros | `renderTableros()` | `FD` (antes: `RAW` directo) | ✅ Unificado |
| Tendencias | `RTend()` | `KPI_HIST` | ✅ Correcto |
| Efectividad | `REf()` | `EFECT` | ✅ Correcto |

### Valores del corte 24/06/2026
| Indicador | Antes (11/06) | Ahora (18/06) |
|---|---|---|
| Total RAW | 680 | **620** |
| Total FD pendientes | 212 | **146** |
| En Tiempo Facturación | 169 | **53** |
| Vencidas Facturación | 43 | **93** |
| Vencidas Despacho | 39 | **87** |
| +15 Días (Rango Real) | 0 | **5** |
| Países activos | 4 | **3** (GT, SV, PE) |
| KPI_TOTALS report_date | 17/06/2026 | **24/06/2026** |

### SHAs de producción (24/06/2026)
| Archivo | SHA |
|---|---|
| `index.html` | `83aca5b30cfb` |
| `analytics.html` | (deploy tarjeta ESV — este commit) |

---

## [Dashboard Rutas — Sprint Arquitectura] — 22/06/2026

### 4 issues corregidos

| # | Issue | Causa raíz | Fix |
|---|---|---|---|
| I1 | Publicar GitHub congelado | `btn.innerHTML` con ícono → `textContent` corrupta el restore; el `disabled=false` faltaba en el timeout de error | `innerHTML` para origTxt/restore en éxito y error; `disabled=false` en todos los caminos |
| I2 | Exportar PDF sin acción | Doble `return; return;` dejaba la función colgada; el `btn.disabled=true` sin restore si el print fallaba silenciosamente | Limpiar doble return; feedback visual de impresión |
| I3 | Dashboard carga sin mostrar nada | El Auth Bridge llama `ST(urlTab)` solo si hay `?tab=` en la URL. Sin parámetro, ningún tab se activa | `else ST('resumen')` al final del `DOMContentLoaded` |
| I4 | Toggle Activo/Inactivo sin acción visual | `pdcShowToast` busca `getElementById('pdcToast')` que no existía en el HTML → retornaba sin feedback | Agregar `div#pdcToast` al HTML; guard antes de `pdcShowToast`; `userStates` releído en cada render |

## [Arquitectura Sprint Final] — 22/06/2026

### Causa raíz definitiva por issue

| Issue | Causa raíz confirmada | Fix |
|---|---|---|
| **R1 Publicar GitHub** | `decodeURIComponent(escape(atob(...)))` falla en archivos UTF-8 grandes (>500KB) — el decode corrompía caracteres multi-byte y el PUT resultante era inválido | `TextDecoder('utf-8')` sobre `Uint8Array` — correcto para cualquier tamaño |
| **R2 Exportar PDF** | `btn.disabled=true` antes de `window.open` → si el popup fallaba, el botón quedaba bloqueado y el usuario no podía reintentar | `btn.disabled=false` antes del `window.open` + mensaje instructivo |
| **CT Dashboard congelado** | `pdcAutoSetPais()` se llamaba ANTES de `initFilters()` → `onPaisChange()` corría con filtros no inicializados → crash total | Movida después de `initFilters()+autoFilter()` |
| **CT dispatchEvent loop** | `dispatchEvent(new Event('change'))` en selectores de módulo provocaba re-renders en cascada | Eliminado completamente — solo `el.value` y `el.disabled` |
| **CT Config visible supervisor/consulta** | No había código que ocultara el tab Config para no-admin | `pdcAutoSetPais` + `isAdmin block` ocultan `.ntab[onclick*='config']` |
| **CT Festivos sin datos** | Dataset `_R` histórico tiene `hol:0` en todos los registros | Muestra calendario estático oficial GT/SV; datos reales al cargar Excel |

## [Bug Fix Sprint 4] — 22/06/2026 · Fixes definitivos

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
