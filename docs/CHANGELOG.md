## [22/06/2026] — Fase 4 Pilar 1: Validación de totales al cargar Excel (cash_today.html v2.12)

### cash_today.html v2.11 → v2.12 — 3 modificaciones quirúrgicas

**4.2 — Validación de totales al cargar Excel**

Al cargar un Excel en ⚙️ Config, se ejecuta automáticamente `renderValidacion(newRecs, wb)` que compara los totales del archivo fuente contra los registros efectivamente parseados.

**Qué se compara (por hoja/sede):**

| Columna | Fuente A | Fuente B | Indica |
|---|---|---|---|
| Dep. Excel | Filas con `Tipo='Depósito'` en hoja raw | — | Total bruto del Excel |
| Dep. Leídos | Registros en `newRecs` para esa sede | — | Total parseado |
| Δ Registros | Diferencia A-B | — | Filas omitidas (tipo inválido, fecha no parseable) |
| Importe Excel | Suma columna Importe en hoja raw | — | Total bruto |
| Importe Leído | Suma `r.imp` en newRecs para esa sede | — | Total parseado |
| Δ Importe | Diferencia | — | Discrepancia numérica |
| Rec. Excel / Leídas | Recogidas en hoja raw vs newRecs | — | Integridad de recogidas |

**Semáforo:**
- ✅ OK — Todo cuadra (Δ = 0 en registros, Δ < 0.1% en importes)
- ⚠️ Revisar — Diferencia menor detectada
- ❌ Discrepancia — Diferencia significativa (≥ 0.1% en importe o registros faltantes)

**Comportamiento:**
- Se muestra debajo del warning de cajeros nuevos, dentro del bloque `cfg-loaded`
- Siempre visible tras cargar Excel exitosamente (no solo cuando hay problemas)
- Cuando hay discrepancias: mensaje orientativo "Revise el Excel fuente si la diferencia es significativa"
- Orden de ejecución: `autoFilter()` → `detectNuevosCajeros()` → `renderValidacion()` → `updateConfigInfo()`

**SHAs post-deploy:**
- `cash_today.html`: `5a46d290f1c805d4fafec4d0e2293a925c82b8fb`

---

## [22/06/2026] — Fase 4 Pilar 1: Presupuesto desde _M + cajeros nuevos (cash_today.html v2.11)

### cash_today.html v2.10 → v2.11 — 5 modificaciones quirúrgicas

**4.1 — Presupuesto calculado desde Valor Contratado (_M)**

Se elimina `_PRESUPUESTO` hardcoded (24 filas de valores estimados manualmente).
Se reemplaza por `buildPresupuestoFromM()` — función que calcula el presupuesto
mensual dinámicamente desde `_M` (indicador `Valor Contratado`) para cada mes
activo en `RECS`.

Reglas de cálculo:
- **CDA (Guatemala):** AMAT I + AMAT II = Q16,000,000 consolidado (override; _M suma Q18MM pero el cupo operativo es Q16MM) + Monedera = cupo real de _M (Q75,000) → total CDA: **Q16,075,000/mes**
- **Xela (Guatemala):** PDC XELA (SDM500) + PDC XELA (Monedera) = Q3,000,000 + Q35,000 = **Q3,035,000/mes**
- **Santa Tecla (El Salvador):** PDC Comercial + PDC Comercial (Monedera) = $1,400,000 + $28,000 = **$1,428,000/mes**
- **San Miguel (El Salvador):** PDC Comercial San Miguel + Monedera = $400,000 + $8,000 = **$408,000/mes**
- Al cargar un nuevo Excel con hoja `metas`, el presupuesto se recalcula automáticamente
- `buildPresupuestoFromM()` se invoca dentro de `autoFilter()` → siempre sincronizado

**4.2 — Selector de año dinámico en módulo Presupuesto**
- Eliminado el guard `if(yrEl.options.length===0)` — ahora se repuebla con cada cambio de dataset
- Preserva la selección previa si el año sigue disponible

**4.3 — Aviso del módulo actualizado**
- Antes: "Presupuesto basado en metas planificadas 2026. Para actualizar, cargar hoja Presupuesto"
- Ahora: "Presupuesto calculado desde el Valor Contratado de cada cajero (hoja metas). CDA: AMAT I + II = Q16,000,000 consolidado + Monedera."

**4.4 — Detección de cajeros nuevos al cargar Excel**
- Nuevo div `#cfg-cajeros-warn` en módulo Config (oculto por defecto, amarillo)
- Al cargar Excel: compara cajeros de `newRecs` vs `METAS` (hoja metas cargada)
- Si hay cajeros sin metas registradas → muestra lista con nombre de cada cajero
- Mensaje orientativo: "Notifique al administrador para registrar sus metas contractuales"
- La carga continúa normalmente sin bloqueo — transparente para el usuario
- Badge de estado actualizado: "X cajero(s) nuevo(s)"
- Si no hay cajeros nuevos → warning permanece oculto

**SHAs post-deploy:**
- `cash_today.html`: `d7d1f1d7ea9b2159430352991c9943380d1b0a12`

---

## [22/06/2026] — Chat para consulta + corrección cupo AMAT (analytics.html v1.7 · cash_today.html)

### analytics.html v1.6 → v1.7 — Chat de soporte para rol consulta

**Cambio:** El panel de Soporte/Administración ahora es visible para los 3 roles.

Lógica actualizada de ternario a triple rama:
- `isAdmin` → Panel de Administración completo (8 acciones, sin cambios)
- `isSupervisor` → Panel de Supervisor · solo 💬 Chat de soporte
- `isConsulta` → Soporte · solo 💬 Chat de soporte (descripción diferenciada)

Título, subtítulo e ícono del panel se adaptan por rol en runtime:
- Consulta → `💬 Soporte · Canal de comunicación con el equipo administrador`

**Matriz de permisos vigente (definitiva):**

| Acción | Admin | Supervisor | Consulta |
|---|---|---|---|
| Ver dashboards autorizados | ✅ | ✅ | ✅ |
| Sección panel visible | ✅ | ✅ | ✅ |
| Chat de soporte | ✅ | ✅ | ✅ |
| Actualizar datos (Excel) | ✅ | ❌ | ❌ |
| Descargar snapshots | ✅ | ❌ | ❌ |
| Panel Administrativo completo | ✅ | ❌ | ❌ |

### cash_today.html — Corrección cupo AMAT consolidado

**Corrección:** Cupo AMAT I + II (Consolidado) `Q18,000,000` → `Q16,000,000`

- Afectaba 2 puntos del código: `renderSemaforo()` y `renderMetas()/buildRow()`
- El semáforo de cupo en Resumen ahora calcula el % sobre Q16MM
- El módulo Límites & KPIs ahora muestra Q16MM como cupo contratado consolidado
- Nota: `_M` individual sigue con AMAT I = Q9MM y AMAT II = Q9MM (suma técnica Q18MM), pero el cupo operativo acordado para el consolidado es Q16MM

**SHAs post-deploy:**
- `analytics.html`: `15ab0fe1e5f69abc3189398b548109877f2b8ddb`
- `cash_today.html`: `1fd03d67b85ffa4ceaf475422ac4d05a65f5b2ea`

---

## [22/06/2026] — Usuarios y Permisos: rol Supervisor (analytics.html v1.6 · login.html)

### analytics.html v1.5 → v1.6 — 1 modificación quirúrgica

**Rol Supervisor — panel propio con acceso restringido:**

- El panel de acción (sección Administración) ahora es visible para `admin` **y** `supervisor`
- La lógica es ternaria: `isAdmin ? [...acciones admin] : [...acciones supervisor]`
- **Admin:** conserva todas las acciones sin cambios (Actualizar Rutas, Actualizar Cash Today, Panel Administrativo, Descargar Rutas, Descargar Cash Today, Consolidado Regional, Dashboard Perú, Dashboard Honduras)
- **Supervisor:** accede exclusivamente a **💬 Chat de soporte** (`admin.html`) — sin descargas, sin actualización de datos, sin acceso a config
- Título, subtítulo e ícono del panel se adaptan al rol en runtime:
  - Admin → `⚙️ Panel de Administración · Acciones disponibles para Administrador`
  - Supervisor → `👤 Panel de Supervisor · Acciones disponibles para su rol`
- `navAdmin` (botón "Administración" en la nav) se muestra para ambos roles

### login.html — 1 corrección menor

- Contador de usuarios en panel izquierdo: `11` → `14` (refleja el total real de usuarios registrados)

**Matriz de permisos post-cambio:**

| Acción | Admin | Supervisor | Consulta |
|---|---|---|---|
| Ver dashboards autorizados | ✅ | ✅ | ✅ |
| Chat de soporte | ✅ | ✅ | ❌ |
| Actualizar datos (Excel) | ✅ | ❌ | ❌ |
| Descargar snapshots | ✅ | ❌ | ❌ |
| Panel Administrativo | ✅ | ❌ | ❌ |
| Sección Administración visible | ✅ | ✅ | ❌ |

**SHAs post-deploy:**
- `analytics.html`: `9f8ac21a2bb481116603cced6c261aaf22aff3c6`
- `login.html`: `48271ca93606dc14c2a5fc865ca3bfe5a17995e5`

---

## [22/06/2026] — TC histórico 2024 + procesamiento hoja TC (cash_today.html v2.10)

### cash_today.html — 2 modificaciones quirúrgicas

**D. TC histórico 2024 (ítem D del Roadmap Fase 3):**

**Diagnóstico previo al cambio:**
- `_TC_MENSUAL` cubría Jun 2025 → Jun 2026 (13 meses)
- Dataset `_R` arranca en 2025-06 — no hay registros de 2024 actualmente
- Si se cargara un Excel con data de 2024, esos meses usarían fallback `tcGTQ = 7.61815` en lugar de TC preciso
- Implementación es preventiva: deja el sistema listo para data histórica de 2024

**Cambios aplicados:**

1. **`_TC_MENSUAL` expandido: Ene 2024 → Jun 2026 (25 meses)**
   - Añadidos 12 meses de 2024 con TCs BANGUAT (promedios mensuales)
   - Valores: 2024-01: 7.797 · 2024-06: 7.771 · 2024-12: 7.728
   - Tendencia coherente: GTQ se aprecia sostenidamente (7.797 → 7.622)
   - Cobertura completa para cualquier Excel histórico de 2024 o posterior
   - `updateConfigInfo()` muestra la tabla completa dinámicamente (sin cambios)

2. **Procesamiento de hoja `TC` desde Excel (runtime)**
   - Si el Excel cargado incluye una pestaña `TC`, sus valores se incorporan a `_TC_MENSUAL` en runtime
   - Formato aceptado columna A: `YYYY-MM` o `MM/YYYY` (normalización automática)
   - Formato columna B: valor numérico del TC GTQ/USD
   - Permite extender la tabla de TCs sin necesidad de nuevo deploy
   - Error handling silencioso vía `console.warn` — no interrumpe la carga del Excel

**SHAs post-deploy:**
- `cash_today.html`: `3c04e8a84010e5a7c9a5e0d73dccd5d94d13ff91`

---

## [22/06/2026] — Export PDF ejecutivo + fix validTabs (cash_today.html v2.9)

### cash_today.html — 6 modificaciones quirúrgicas

**C. Export PDF ejecutivo (ítem C del Roadmap Fase 3):**

1. **CSS `@media print` + `.btn-pdf`** (en `<style>`):
   - `.btn-pdf`: oculto por defecto (`display:none`), visible con clase `.visible` para admin en tab Resumen
   - `@media print`: oculta header/nav/filtros/botones · layout A4 · `@page{size:A4 portrait;margin:10mm 12mm}`
   - Solo `#page-resumen` visible al imprimir

2. **Botón `📄 PDF` en `hdr-right`** (antes del botón Salir):
   - `id="btn-pdf-ct"` · `onclick="exportarPDF_CT()"`
   - Oculto por CSS por defecto; visible solo si `_pdfAdminOk=true` y tab activo = `resumen`

3. **`goPage()` actualizado** — hook de visibilidad:
   - Al cambiar de tab: muestra botón si `p==='resumen' && _pdfAdminOk`, oculta en cualquier otro tab

4. **`exportarPDF_CT()`** — nueva función:
   - Lee DOM en vivo: `#kpi-res`, `#tbl-res-sede`, `#sem-cupo`, `#sem-alertas`, `#hdr-rango`
   - Abre ventana emergente con HTML autocontenido (Inter + CSS inline + datos actuales del filtro)
   - Contenido: header PDC navy · watermark · KPIs globales · semáforos (si activos) · tabla por sede · footer
   - `window.print()` automático al cargar → `window.close()` post-impresión
   - Sin dependencias externas (solo Google Fonts)

5. **`_pdfAdminOk`** — variable global de control:
   - Inicializada en `false`; se activa en el init de usuario si `rol==='admin'` o `role==='admin'`

6. **Fix `validTabs`** (bug secundario detectado en auditoría):
   - `'presupuesto'` no estaba en el array — el módulo Presupuesto (añadido en Fase 2) no era navegable vía `?tab=presupuesto`
   - Corregido: `validTabs` ahora incluye los 11 módulos completos

**SHAs post-deploy:**
- `cash_today.html`: `b679719c12515e659894ca6a4042bb60aff22d3c`

---

## [22/06/2026] — Integración Cash Today en PDC Analytics Center (analytics.html v1.5)

### analytics.html — 2 correcciones quirúrgicas (integración Cash Today v2.8)

**Diagnóstico previo al cambio:**
- Cash Today ya tenía entrada en `PDC_DASHBOARDS`, accent CSS, nav card y admin panel
- Auth Bridge v2.0 confirmado presente en `cash_today.html` (dentro del `<body>`)
- `pdcNavigate()` ya seteaba `pdc_user` para compatibilidad con `cash_today.html`
- Dos inconsistencias menores identificadas y corregidas

**Correcciones aplicadas:**

1. **KPIs de Cash Today actualizados a v2.8:**
   - `{ val:'2', lbl:'Países' }` → `{ val:'10', lbl:'Módulos' }` (refleja los 10 módulos de v2.8 incluyendo Presupuesto)
   - `actualizacion: '11 jun 2026'` → `'21 jun 2026'` (fecha real de última actualización)
   - Antes los KPIs no reflejaban el estado real del dashboard v2.8

2. **Timestamp en filename de snapshot Cash Today (consistencia con Rutas):**
   - `'Dashboard_CashToday.html'` → `'Dashboard_CashToday_'+new Date().toISOString().slice(0,10)+'.html'`
   - Rutas ya tenía timestamp; Cash Today tenía nombre fijo — inconsistencia corregida
   - Ejemplo resultado: `Dashboard_CashToday_2026-06-22.html`

**Arquitectura verificada (sin cambios requeridos):**
- `pdcNavigate('cash_today.html')` → setea `pdc_user` → Auth Bridge v2.0 en CT lo recibe ✅
- `pdcBridgeToTab('cash_today.html','config')` → acceso directo a módulo Config ✅
- `pdcDownload('cash_today.html',...)` → fetch + strip Auth Bridge + watermark ✅
- Accent CSS `.accent-cashtoday` → `linear-gradient(90deg,#E6501E,#FFAB00)` ✅
- `paises: { GT, ESV }` → chips de país correctos ✅

**SHAs post-deploy:**
- `analytics.html`: `991d127c8f8a7e7890406654e2828622d8425680`

---

# CHANGELOG — PDC Analytics Center | Grupo PDC

## [21/06/2026] — TC Histórico 2025 (cash_today.html)

### cash_today.html — 1 cambio quirúrgico
- **`_TC_MENSUAL` expandido:** Jun 2025 → Jun 2026 (13 meses completos)
  - Antes: solo Ene–Jun 2026 (6 meses) · 7 meses usaban TC fallback 7.61815
  - Ahora: cobertura completa del dataset desde el primer registro

| Mes | TC GTQ/USD (BANGUAT) |
|---|---|
| 2025-06 | 7.69800 |
| 2025-07 | 7.70200 |
| 2025-08 | 7.70500 |
| 2025-09 | 7.69900 |
| 2025-10 | 7.69200 |
| 2025-11 | 7.68400 |
| 2025-12 | 7.67500 |
| 2026-01 | 7.66614 (sin cambio) |
| … | … |

- **10,507 registros** de Jun–Dic 2025 ahora usan TC preciso mensual en todas las conversiones USD
- La tabla de Config (⚙️) muestra automáticamente los 13 meses

---

## [21/06/2026] — Export PDF Ejecutivo (index.html · Rutas)

### index.html — 5 cambios quirúrgicos
- **`@media print` CSS** — layout A4, oculta nav/header/filtros, preserva kgrid + de-grid
- **`exportarPDF()`** — abre ventana con reporte HTML limpio y llama `window.print()`
  - Header ejecutivo PDC con logo, título, fecha de corte y usuario
  - Sección KPIs globales (kgrid, 6 tarjetas con semáforo)
  - Sección detalle por país (de-card Despacho + Facturación)
  - Footer corporativo con fecha de datos
  - CSS self-contained (Inter, colores corporativos, bordes print-safe)
- **Botón `📄 Exportar PDF`** — header, `admin-visible`, clase `.pdf-btn`
- **`ST()` hook** — muestra/oculta botón PDF según tab activo (solo visible en Resumen)
- **Init visibility** — botón visible en carga inicial (resumen es tab por defecto)

### Arquitectura
- Sin dependencias externas de PDF — usa `window.print()` nativo
- Compatible con todos los navegadores modernos
- El usuario elige "Guardar como PDF" en el diálogo de impresión del navegador
- Estilo A4 forzado vía `@page{size:A4;margin:12mm 14mm}`

---

## [21/06/2026] — Módulo Presupuesto vs Real (Cash Today v2.8)

### cash_today.html — Cambios quirúrgicos (5 modificaciones)
- **Nav tab:** `🎯 Presupuesto` agregado entre Costo Servicio y Config
- **`renderPage()`:** case `'presupuesto'` → `renderPresupuesto()`
- **`_PRESUPUESTO`:** constante embebida con 24 filas (4 sedes × 6 meses 2026)
  - GT (GTQ): CDA + Xela · SV (USD): Santa Tecla + San Miguel
- **`renderPresupuesto()`:** función completa
  - Selectores año + país (Consolidado / GT / SV)
  - 4 KPI cards: Cumplimiento % (semáforo) · Presupuesto · Recolectado · Superávit/Déficit
  - Gráfica barras agrupadas + línea cumplimiento % (eje dual)
  - Tabla sede × mes con semáforo (verde ≥100% · amarillo ≥85% · rojo <85%)
  - Fila total con fondo navy suave
- **`page-presupuesto`:** HTML completo con toolbar, kpi-grid, canvas, tabla + nota de actualización
- **CSS:** `.pres-total`, `td.g/y/r`, `td.total-cell`

### Arquitectura
- Datos de presupuesto como constante `_PRESUPUESTO` (editable inline o via futura hoja Excel)
- Cálculo de real en tiempo real sobre `RECS` existente (sin duplicar datos)
- Presupuesto filtrable por año y país — listo para expansión multi-año

---

## [21/06/2026] — Sesión de desarrollo (continuación)

### Nuevos módulos
- **honduras/index.html v1.0** — Dashboard Liquidación de Rutas Honduras
  - 4 módulos: Resumen · Análisis · Detalle Rutas · Tendencias
  - Paleta corporativa Honduras: `--hn1:#003F8A` / `--hn2:#009E60`
  - KPIs: 52 rutas, 8 vencidas, 84.6% efectividad, L. 3,124,680 pendiente (≈ USD 125,996)
  - Moneda: HNL (Lempira) · TC referencial 24.80 HNL/USD
  - Dataset: 22 rutas detalle + 6 meses histórico Ene–Jun 2026
  - Distribución geográfica: Tegucigalpa · San Pedro Sula · La Ceiba · Choluteca
  - Auth Bridge v2.0 · `?tab=` URL param · nombre usuario en header

### Modificaciones
- **analytics.html** — Registro dashboard `honduras` + `accent-honduras` CSS + acción admin
- **login.html** — 3 usuarios HN creados: `carlos.reyes`, `maria.funez`, `liquidaciones.hn`
  - Admin y Supervisor: acceso `honduras` habilitado

---

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
