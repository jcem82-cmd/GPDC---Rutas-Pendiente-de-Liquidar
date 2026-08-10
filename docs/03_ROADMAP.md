# 03 — ROADMAP
## PDC Analytics Center · Plan de Evolución

**Estado actual: v2.11 ESTABLE (Rutas) / v2.16 ESTABLE (Cash Today)** · Próxima versión objetivo: definir
**Última actualización:** 10/08/2026 (sesión Histórico de Rutas + espejo Cloudflare)

---

---

## ✅ FASE 12 — Histórico de Rutas (COMPLETADA · v2.11 · 10/08/2026)

- [x] Nueva funcionalidad solicitada por Charly: consultar el estado de las rutas en fechas pasadas sin afectar el dashboard en vivo
- [x] Arquitectura: reutiliza el historial de commits de GitHub ya existente (sin duplicar almacenamiento), lee snapshots vía `raw.githubusercontent.com`
- [x] `historico_index.json` como manifiesto — decisión deliberada de evitar la API de commits de GitHub desde el navegador (límite 60/hora sin auth, riesgo real con varios usuarios en la misma IP)
- [x] Réplica exacta de fórmulas del "Resumen General" (`RK()`/`RCC()`/`RC()`), incluyendo el filtro `notLiq()` — verificado cifra por cifra contra el dashboard en vivo
- [x] Filtros combinables: País, Estado (Facturación), Estado Real (Despacho)
- [x] Exportar a PDF: KPIs + tarjetas por país + gráficas (imagen) + detalle completo según filtros activos
- [x] Tarjeta nueva en el Hub (`analytics.html`), acceso controlado vía `profiles.dashboards` en Supabase

---

## 🔜 PENDIENTE — Sesión de arquitectura (próxima semana, autorizada por Charly)

- [ ] Ramas `main` / `develop` / `feature-*` (código de plataforma; publicaciones diarias de Excel siguen escribiendo directo a `main`)
- [ ] Respaldo automático programado del repositorio (posible destino: Supabase Storage)
- [ ] Versionado semántico formal (`v1.0`, `v1.1`, `v2.0`) vía git tags, vinculado a CHANGELOG
- [ ] Cloudflare Access sobre el espejo `pdc-analytics.jcem82.workers.dev` (autenticación previa) antes de considerarlo apto para compartir ampliamente
- [ ] Dominio propio para el espejo de Cloudflare
- [ ] **Editor de permisos de dashboards en el panel de administración** (`analytics.html`) — hoy solo se pueden ver los `dashboards` asignados por usuario, no editarlos; requiere entrar directo a Supabase Table Editor. Recomendación surgida durante el lanzamiento de Histórico de Rutas (10/08/2026)
- [ ] Automatizar la regeneración de `historico_index.json` en cada publicación de Excel (integrarlo en `publishToGitHub()` de `index.html` — requiere autorización explícita por tocar archivo sensible)

---

## ✅ FASE 11 — Comparativo Mensual y Anual de Rutas (COMPLETADA · v2.10 · 07/08/2026)

- [x] Nueva funcionalidad solicitada por Charly: incremento/decremento MoM y YoY de rutas, por país y total
- [x] Ubicado dentro de Tendencias KPI (sin pestaña nueva), fuente tabla "Total Rutas" de hoja "KPI"
- [x] Mockup presentado y aprobado por Charly antes de implementar (mostrar mes cerrado y mes en curso lado a lado)
- [x] 4 tarjetas por bloque (GT/SV/PE/Total) con flechas y variación MoM/YoY + grafico de barras comparativo
- [x] Reutiliza el sistema de diseño existente — sin colores ni componentes nuevos fuera de paleta

---

## ✅ FASE 10 — Tendencias KPI: acumulación incremental (COMPLETADA · v2.9 · 07/08/2026)

- [x] RCA: KPI_HIST se reconstruía desde cero en cada publicación, perdiendo la cifra real de Vencidas de negocio apenas un mes dejaba de ser vigente
- [x] Rediseño: acumulación incremental (nunca se reconstruye) + congelamiento permanente solo con archivo nombrado "Cierre"
- [x] Backfill único del histórico 2022–07/2026 (55 meses) usando la tabla de la hoja KPI como referencia de validación puntual
- [x] Confirmado por Charly: la tabla de la hoja KPI es un paleativo, no la fuente — el dashboard calcula por su cuenta
- [x] Incidente de sobrescritura accidental durante la sesión, detectado y corregido en el momento — documentado con transparencia en §19.5

---

## ✅ FASE 9 — Tableros: corrección % >100% (COMPLETADA · v2.8 · 07/08/2026)

- [x] RCA: numerador y denominador del % "pend/total canal" venían de dos hojas distintas del Excel ("General (seguimiento)" vs "Total Rutas (Gral)") que podían desincronizarse
- [x] Prueba decisiva descartó el criterio de negocio como causa — confirmado problema de origen de datos (GT Distribuidores: 49 vs 76 filas reales)
- [x] Salvaguarda permanente: canal_totals.pend/all recalculado desde la misma hoja/criterio que el numerador (REGLA #19) — el % ya no puede superar 100% matemáticamente
- [x] Evaluada migración GLT/Tradicional/Mayoristas a columna Territorio — descartada, Canal 3 ya es equivalente
- [x] Evaluado rediseño visual del módulo — ya alineado con 07_DESIGN_SYSTEM.md, Charly confirmó dejar tal como está

---

## ✅ FASE 8 — Facturación Mensual (COMPLETADA · v2.16 · 05/08/2026)

- [x] Módulo **Facturación Mensual** en `cash_today.html`, ubicado después de Presupuesto
- [x] Motor `buildFacturacionFromRecs()` — calcula desde `RECS` + `METAS`, **sin depender de la pestaña `Facturación`** del Excel
- [x] Modelo 100% parametrizado desde la hoja `metas` (cupos, excedente variable, costo de visita, cupo mensual de piezas, millar por moneda, impuestos)
- [x] ESV factura sobre **recogidas**; GT sobre **depósitos**; AMATITLÁN I + II consolidados
- [x] IVA GT 12% con neto visible · IVA e IVA retenido ESV
- [x] Interruptor de visitas adicionales de Monederas ESV
- [x] Mes en curso incluido y marcado `PARCIAL` (costo proyectado al cierre)
- [x] Histórico automático desde julio 2026 · gráfica de tendencia (≥2 meses)
- [x] **FIX RCA:** persistencia de `_M` e `_IMP` en la publicación self-service
- [x] Regrabado de `_M` e `_IMP` desde el Excel vigente (el fix de persistencia no repara datos ya embebidos)
- [x] Desglose de Tesorería con las 4 filas del modelo del proveedor · subtotal ligado a `resumen.tesoreria.valor`
- [x] Gráfica de tendencia en valores netos sin IVA · totales explícitos por país · nota al pie eliminada
- [x] Reglas permanentes 14, 15 y 16 incorporadas a `04_PROJECT_RULES.md`

---

## 🔜 PENDIENTES DERIVADOS DE LA SESIÓN 05/08/2026

### Prioridad media

- [ ] **`Monedera - XELA` se activará sola.** El grupo ya está declarado en `_FAC_GT_GRUPOS` con su meta (`PDC XELA (Monedera)`, cupo Q35,000), pero no tiene transacciones. Aparecerá automáticamente en el módulo cuando el cajero empiece a operar — **no requiere cambio de código**.
- [ ] **Visitas adicionales de Guatemala no se facturan.** La hoja `metas` sí tiene el costo (Q290 normal / Q440 día festivo) para los cajeros GT, pero el modelo del proveedor no las cobra hoy. Si eso cambia, el parámetro ya está disponible (`cvn` / `cvf`) y el módulo `Festivos` podría alimentar la distinción normal vs. festivo.

### Prioridad baja — deuda técnica documentada

- [ ] **Criterio de conteo de visitas.** Hoy se cuenta el **número de transacciones de recogida**. En julio 2026 coincide exactamente con los días únicos con recogida (27 y 9), por lo que ambos criterios son indistinguibles con los datos actuales. Si algún mes registra dos recogidas el mismo día, los criterios divergirán — confirmar con el proveedor cuál aplica.
- [ ] **`tcVal` en el bloque `_TC_MENSUAL`** (~línea 2784) sigue usando el patrón antiguo `.replace(',','.')`. Riesgo vigente si cambia el formato de la celda de tipo de cambio. `_facNum()` ya resuelve este patrón y podría reutilizarse.

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

## ✅ Sesión 31/07/2026 — Cartas de Salida: parseo, trazabilidad y sincronización del Hub

- [x] Fix matching de motivo insensible a mayúsculas/acentos (60 registros GT que se excluían silenciosamente)
- [x] **Fix crítico de parseo:** `_csFindCol()` leía la columna equivocada por colisión de substring (`MOTIVO` capturaba `MOTIVO ABREVIADO`) — el detalle narrativo del capturista nunca se había cargado al dataset
- [x] Columna "Detalle" en tabla Cliente No Pagó (texto completo de MOTIVO; `----` si no hay detalle)
- [x] `cartas_summary.json` + sincronización en vivo de la tarjeta del Hub — elimina el desfase permanente de KPIs/fecha en `analytics.html`

**Nota de deuda técnica resuelta:** las 3 tarjetas principales del Portal (Rutas, Cash Today, Cartas de Salida) quedan ahora sincronizadas en vivo. Ninguna depende ya de valores escritos a mano.

---

## ✅ Sesión 29/07/2026 — Cartas de Salida: seguridad + correcciones + nueva funcionalidad

- [x] Migración de self-publish de `cartas_salida.html` a Edge Function `github-publish` (token embebido eliminado — confirma y cierra el pendiente de la sesión 23/07 sobre este mismo archivo)
- [x] Fix bug de zona horaria en derivación `anio`/`mes` (cartas del día 1 de cualquier mes)
- [x] Fix mislabeling de país — detección ahora por nombre de archivo, no por nombre de hoja
- [x] Soporte multi-archivo (1 a 3, no limitante) en carga de Excel
- [x] Sección dedicada "Motivo: Cliente No Pagó" (KPI + tendencia mensual + tabla de detalle)

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

*PDC Analytics Center · v2.15 · 31 Jul 2026*
