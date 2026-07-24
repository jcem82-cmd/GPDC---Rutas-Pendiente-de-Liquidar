# 01 — MASTER PROJECT CONTEXT
## PDC Analytics Center · Estado Técnico Completo

**Versión vigente:** v2.3 | **Última actualización:** 23/07/2026 | **Estado:** Producción ✅

---

## 1. Visión del Proyecto

**PDC Analytics Center** es la plataforma corporativa de Business Intelligence del Grupo PDC. Centraliza todos los dashboards ejecutivos financieros y operativos bajo un único punto de acceso con autenticación unificada, diseño corporativo consistente y arquitectura escalable.

**Principio rector:** una plataforma, no dashboards individuales. Todo nuevo dashboard se integra sin modificar la arquitectura existente.

**Cambio de arquitectura más importante de esta versión:** se introdujo **`js/pdc_data_bridge.js`** (PDCBridge) — módulo compartido que convierte `index.html` en la **fuente única de verdad real** (no solo declarada) para todos los KPIs de Rutas. Antes, cada tarjeta y cada dashboard país tenía sus propios números escritos a mano; ahora se calculan en tiempo de ejecución leyendo `index.html` en vivo. Ver §7.

---

## 2. Arquitectura del Sistema

```
PDC Analytics Center
│
├── login.html              ← Autenticación única (Supabase Auth) · 12 usuarios · 3 roles
├── analytics.html          ← Portal Hub · cards con KPIs EN VIVO vía PDCBridge
│
├── index.html              ← Dashboard Liquidación de Rutas (fuente única de verdad)
├── cash_today.html         ← Dashboard Cash Today · dataset propio (no conectado a PDCBridge)
├── admin.html              ← Panel administrativo · chat Supabase
│
├── regional/index.html     ← Consolidado Regional · KPIs EN VIVO vía PDCBridge (GT·SV·PE)
├── peru/index.html         ← Dashboard Perú · KPIs EN VIVO vía PDCBridge
├── elsalvador/index.html   ← Dashboard El Salvador · KPIs EN VIVO vía PDCBridge (NUEVO 10/07)
├── honduras/index.html     ← Existe en el repo pero SIN tarjeta en portal (sin datos reales)
│
├── js/
│   ├── pdc_data_bridge.js  ← Fuente única de verdad — fetch + cálculo de KPIs Rutas
│   ├── auth.js
│   └── users.js
│
└── docs/
    ├── 01_MASTER_PROJECT_CONTEXT.md  ← este archivo
    ├── 02_CHANGELOG.md               ← historial detallado de Cash Today
    ├── CHANGELOG.md                  ← historial detallado de Rutas/PDCBridge/Hub
    ├── 03_ROADMAP.md
    ├── 04_PROJECT_RULES.md
    └── 05_README.md
```

> **Honduras:** eliminado por completo de `regional/index.html` (tarjeta, tabla "Resumen por País y Canal", sección "Por País") — no hay movimiento real de rutas para ese país. `honduras/index.html` sigue existiendo como archivo pero no tiene tarjeta de acceso en el portal.

### Flujo de sesión
```
login.html  →  sessionStorage[pdc_session] (TTL 8h)
    → analytics.html (portal hub)
        → sessionStorage[pdc_user] (legacy compat)
        → index.html / cash_today.html / regional / peru / admin.html
```

---

## 3. Repositorio y Despliegue

| Recurso | Valor |
|---|---|
| Repo | `jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar` (branch: main) |
| Live Portal | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html |
| Despliegue | GitHub Pages · GitHub Actions (`.github/workflows/deploy.yml`) |
| Método | PUT directo vía GitHub REST API |
| Archivos grandes (>1MB, ej. `cash_today.html`) | Git Trees API → blob SHA → `GET /git/blobs/{sha}` con `Accept: application/vnd.github.raw` |

### ⚠️ Incidencia conocida de CI/CD — GitHub Actions
El workflow usa `concurrency: {group:"pages", cancel-in-progress:true}`. Publicaciones cercanas en el tiempo pueden cancelar un deploy a medias y dejar el siguiente en estado inconsistente (falla rápida en el paso "Deploy to GitHub Pages"). **Recuperación:** disparar `workflow_dispatch` (ejecución nueva, no "rerun") vía API. Puede requerir 2-3 intentos si el problema es de fondo (backend de GitHub), no solo de Actions.
**Recomendación pendiente (no implementada):** cambiar `cancel-in-progress` a `false`.

### SHAs de producción (10/07/2026) ← ACTUALES
| Archivo | SHA |
|---|---|
| `index.html` | `2ff9029be8d9` |
| `analytics.html` | `6162f13a9992` |
| `login.html` | `0096f0b23f43` |
| `admin.html` | `58dfe775739a` |
| `regional/index.html` | `ec0156003e5a` |
| `peru/index.html` | `70588d72c6ba` |
| `elsalvador/index.html` | `b1a954c1a430` **← NUEVO** |
| `honduras/index.html` | `c2014b3adf9a` |
| `cash_today.html` | `700951b6b79d` |
| `js/pdc_data_bridge.js` | `174ac5c4cb3d` |
| `js/auth.js` | `451f86c4c443` |
| `js/users.js` | `2f35ca816e6b` |
| `cash_summary.json` | `dbd36921d44a` |

### Sesión 10/07/2026
- **Restricción de acceso por país** implementada en `index.html` y `cash_today.html`: usuarios con `pais` asignado en `PDC_USERS` (GT/ESV/PE) ahora ven únicamente su país en los filtros de Rutas y Volumetría — antes veían todos los países pese a tener el campo `pais` en su perfil.
- **Fix de sesión en caché:** el Auth Bridge de `index.html` no aplicaba la restricción si el usuario ya tenía una sesión abierta antes del fix (sessionStorage persistente). Corregido con auto-reparación: si `pdc_user` existe pero le falta `pais`, se completa desde `pdc_session` sin exigir reinicio de sesión.
- **`elsalvador/index.html` (nuevo):** dashboard dedicado para El Salvador, replicando el patrón de `peru/index.html` (mismo esquema de tabs, KPIs, zonas). Antes, la tarjeta "El Salvador" del Hub apuntaba al mismo `index.html` genérico — ahora tiene su propio archivo, conectado a PDCBridge desde el inicio. `analytics.html` actualizado para apuntar ahí.
- `login.html`: estadísticas de landing (rutas/países/usuarios) conectadas vía PDCBridge + `PDC_USERS.length`. Mención a Honduras eliminada de la descripción del módulo Rutas.
- Eliminados 3 usuarios sin operación real: Carlos Reyes, Maria Funez, TEAM Honduras (`pais:'HN'`) de `PDC_USERS` en `login.html` y `analytics.html`.
- **`hub.html` eliminado del repositorio** — prototipo de Hub anterior a `analytics.html`, huérfano (sin enlaces activos, base de usuarios propia desactualizada).
- `analytics.html`: descripción de "Consolidado Regional" corregida (ya no menciona Honduras).

### Sesión 20/07/2026
- **Multi-select de país (mejora funcional):** el filtro de país ahora permite seleccionar más de uno (ej. GT+ESV) en `index.html`, `cash_today.html` (filtro principal) y `cartas_salida.html`. **Regla de gate confirmada por Charly:** habilitado ÚNICAMENTE para usuarios SIN país asignado en sesión (admin/regionales) — usuarios con `pais` (GT/ESV/PE) conservan sin cambios la restricción de acceso del 09/07/2026.
- **Patrón de implementación (reutilizable para futuros filtros de país):** el `<select>` original se oculta vía `style.display='none'` pero permanece en el DOM — cero impacto en rutas de código legacy. Se inyecta un dropdown con checkboxes (`window._PDC_PAIS_MULTI` en `index.html`, `window._PDC_CT_PAIS_MULTI` en `cash_today.html`) con etiqueta dinámica. `cash_today.html` centraliza la comparación en dos helpers nuevos: `pdcPaisOk(sel,p)` (evalúa string legacy o array multi) y `pdcGetPais()`.
- `cartas_salida.html`: el widget tiene un gate adicional `paises.length>1` — hoy el dataset solo contiene GT, por lo que se activará automáticamente en cuanto se cargue el Excel multi-país (ESV/PE), sin requerir otro deploy.
- Fuera de alcance (decisión documentada, no pendiente): `vol-chart-pais` en Cash Today (su opción "Ambos países" ya cubre GT+ESV) y los selectores de módulo `cst-pais`/`pres-pais` (Costos/Presupuesto) — son selectores de módulo, no el filtro principal.
- Validado: `node --check` en los 11 bloques de script de los 3 archivos + prueba funcional en Node (12/12 aserciones, modo legacy y multi).
- **Extensión misma sesión:** multi-select en filtros Canal, Responsable y Rango de `index.html` — a diferencia del anterior, SIN gate de rol/país (aplica a todos los usuarios). Función genérica reutilizable `pdcInitMultiFilter()` — única fuente de verdad para los 3 filtros, deduplica opciones repetidas del `<select>` origen solo en la vista.

**Tokens de publicación (actualizado 20/07/2026):** `cash_today.html` migrado a Supabase Edge Function `github-publish` — ya NO tiene token embebido. **`index.html` (Rutas) SIGUE teniendo el token fine-grained fragmentado embebido en texto plano** (`_tR1`/`_t`) — pendiente de la misma migración, autorizado para próxima sesión. No asumir que el token de `index.html` es seguro de dejar así por más tiempo del necesario.

---

## 4. Tecnologías (versiones canónicas)

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | HTML5 · CSS3 · JavaScript ES6+ vanilla | — |
| Gráficas | Chart.js · jsdelivr CDN | 4.4.1 |
| Excel/datos | SheetJS · cdn.sheetjs.com | 0.20.0 |
| Tipografía | Inter · Google Fonts | 300–800 |
| Chat soporte | Supabase | `pytsrgtcjytjztwdlvux.supabase.co` |
| Hosting | GitHub Pages | — |

---

## 5. Usuarios y Roles

**Arquitectura de autenticación (actualizada 20/07/2026):** migrada de `PDC_USERS` local (arreglo con contraseñas en texto plano, expuesto públicamente vía GitHub Pages) a **Supabase Auth + tabla `profiles`** con Row Level Security. 12 usuarios activos (3 removidos previamente por falta de operación real: Carlos Reyes, Maria Funez, TEAM Honduras).

- `login.html` valida contra `supabase.auth.signInWithPassword()`; ya no contiene ningún arreglo de usuarios ni contraseñas.
- `analytics.html` (panel de administración) lee/actualiza usuarios desde la tabla `profiles` vía cliente Supabase — ya no tiene copia local de usuarios. **La antigua Regla de sincronización dual `login.html`/`analytics.html` queda obsolecida**: ahora ambos archivos leen de la misma fuente (Supabase), no hay nada que sincronizar manualmente.
- Primer login post-migración: pantalla obligatoria de cambio de contraseña (`profiles.force_password_change`).
- `pdcToggleUser()` (activar/desactivar usuario) persiste en `profiles.activo` — efecto inmediato en cualquier dispositivo, ya no depende de `localStorage` del admin.
- Función `public.is_admin()` (SECURITY DEFINER en Supabase) evita recursión RLS en las políticas de admin.
- `js/supabase.min.js`: librería `@supabase/supabase-js` v2.110.7 vendorizada localmente en el repo (no CDN externo) — decisión tomada tras una caída confirmada de jsDelivr que rompió el login en producción durante la validación de esta migración.

**Pendiente — CRÍTICO:** `index.html` (dashboard Rutas) tiene el **mismo problema** que tenía `cash_today.html`: un token GitHub fine-grained embebido en texto plano (variables `_tR1` y `_t`, líneas ~3388/3416) para su propio botón de auto-publicación — mismo patrón, misma exposición pública vía GitHub Pages. Hallazgo del 20/07/2026, **NO resuelto** — autorizado por Charly para próxima sesión. Aplicar la misma corrección ya construida hoy: eliminar el token, agregar `index.html` a la allowlist de rutas de la Edge Function `github-publish` (ya existe y funciona), y actualizar el flujo de publicación de `index.html` para llamarla en vez de hacer PUT directo.

---

## 6. Estado de Datos — Rutas (corte 30/06/2026, `index.html`)

| Indicador | Valor |
|---|---|
| Total RAW | 491 registros |
| Pendientes (activas) | 491 |
| Vencidas Facturación | 30 (6.1%) |
| Vencidas Despacho | 12 (2.4%) |
| +15 días vencidas | 1 |
| Valor total (USD equiv.) | $4.93M |

### Desglose por país (validado, fuente: PDCBridge en vivo)
| País | Activas | Vencidas Fact. | Vencidas Desp. | Monto USD |
|---|---|---|---|---|
| Guatemala | 273 | 4 (1.5%) | 3 (1.1%) | $3.31M |
| El Salvador | 66 | 3 (4.5%) | 2 (3.0%) | $763.7K |
| Perú | 152 | 23 (15.1%) | 7 (4.6%) | $851.7K |
| Honduras | — | — | — | Sin datos reales — eliminado del portal |

---

## 7. Motor de Cálculo — Fuente Única de Verdad (ACTUALIZADO v2.0)

### 7.1 Regla de negocio (sin cambios, validada exhaustivamente esta versión)
```javascript
notLiq = d => d['Estado (Facturación)'] !== 'Liquidada' && d['Estado Real'] !== 'Liquidada'
Vencidas (oficial) = d['Estado (Facturación)'] === 'Vencidas'   // coincide con panel de carga Excel
Vencidas Despacho  = d['Estado Real'] === 'Vencidas'            // metrica independiente, NO intercambiable
```

### 7.2 PDCBridge — arquitectura nueva (`js/pdc_data_bridge.js`)
Módulo compartido, reutilizable, que en tiempo de ejecución:
1. Hace `fetch()` de `index.html` (ruta resuelta vía variable `PDC_MASTER_PATH`, definida ANTES del `<script src="js/pdc_data_bridge.js">` en cada página — `'index.html'` en la raíz, `'../index.html'` en subcarpetas).
2. Extrae `RAW`, `KPI_TOTALS`, `FX_DEF` del HTML fuente (`FX_DEF` no es JSON válido — contiene expresiones tipo `1/7.63627` — se evalúa como literal JS controlado, no con `JSON.parse`).
3. Calcula KPIs por país con `PDCBridge.kpis(data, pais)`.

**Consumido por:**
- `analytics.html` — tarjetas `rutas`, `elsalvador`, `peru`, `regional` + hero KPIs regionales.
- `regional/index.html` — headline, tarjetas GT/SV/PE, tabla "Resumen por País y Canal" (desglose por `Canal2`), pestaña "Por País".
- `peru/index.html` — Resumen completo (7 KPIs), zonas, top transportistas, tabla Detalle, con refresco del punto actual en las series históricas de 6 meses (el histórico previo se conserva, no se recalcula — no hay fuente para reconstruirlo).

**⚠️ Bug ya corregido (no repetir):** la primera versión de `pdc_data_bridge.js` usaba `fetch('index.html')` con ruta fija — funcionaba en la raíz pero causaba auto-fetch (self-fetch) en subcarpetas. Corregido con `PDC_MASTER_PATH`.

### 7.3 Pendiente — no conectado aún a PDCBridge
- **Cash Today** (tarjeta del Hub + Efectivo YTD en Regional): dataset independiente (~11-20MB), no se integra por costo de performance de descargarlo en cada visita al Hub. Recomendación pendiente: generar un `cash_summary.json` liviano al publicar.
- **`peru/index.html` y `regional/index.html` como dashboards completos** (más allá de los KPIs ya conectados): estos SÍ están conectados para sus KPIs principales, PERO la tabla "Resumen por País y Canal" de Regional y algunos gráficos de tendencia histórica de Perú aún usan datos parcialmente estáticos donde no hay fuente histórica disponible.

---

## 8. Cash Today — Arquitectura de Publicación (REESCRITO v2.0 — cambio crítico)

### 8.1 Naturaleza de los datos
**Cada Excel publicado es un export histórico COMPLETO, no incremental.** Confirmado con el propietario: cada corte diario re-exporta todo el histórico desde el inicio real de cada operación (Santa Tecla desde jun-2025, San Miguel desde jul-2025, CDA desde ene-2026).

### 8.2 `publishToGitHub()` — lógica actual (reescrita 07/07/2026)
```javascript
currentR = newRecs;  // reemplazo directo y completo — SIN fusión, SIN deduplicación
```

**Historial de por qué se llegó a esto (no volver a intentar "merge inteligente"):**
| Versión | Clave de identidad | Resultado |
|---|---|---|
| v1 (original) | cajero+fecha+ticket+**importe** | Corrección retroactiva de monto en JDE → registro viejo nunca se elimina → **sobre-conteo** |
| v2 | cajero+fecha+ticket (sin importe) | Ticket no es único de forma confiable (muchos en blanco, sobre todo El Salvador) → transacciones distintas colisionan → **pérdida silenciosa de datos** |
| **v3 (actual)** | — sin clave — | **Reemplazo total del dataset en cada publicación.** Elimina la categoría entera de bug. |

### 8.3 Estado de datos (corte 06/07/2026)
| Sede | Registros | Total GTQ/USD (ene-jul 2026) |
|---|---|---|
| CDA | — | Q79,320,976.47 |
| Xela | — | Q14,728,587.00 |
| Santa Tecla | — | $21,562,942.95 (incluye histórico desde jun-2025) |
| San Miguel | — | $4,651,735.48 (incluye histórico desde jul-2025) |
| **Total `_R`** | **39,417 registros** | — |

### 8.4 Lección operativa clave
Toda reconstrucción de `_R` vía Python (flujo alterno: usuario sube Excel a este chat) debe:
1. Usar `pd.notna()` en **cada campo**, no solo en el importe — un campo de texto vacío (`Nombre usuario`) serializado sin chequeo produce `NaN` literal (inválido en JSON estricto, aunque Python lo acepta silenciosamente vía `allow_nan=True`).
2. Validar con `json.dump(..., allow_nan=False)` para forzar un error si algo se escapa.
3. Validar el resultado final con `JSON.parse()` en **Node**, no solo con `json.loads()` de Python — Python es permisivo con `NaN`/`Infinity`, el navegador no.

---

## 9. Reglas de Negocio Críticas (Rutas)

| Regla | Detalle |
|---|---|
| **notLiq** | Excluye Estado(Fac)=Liquidada OR Estado Real=Liquidada |
| **Vencidas (oficial/hub/cards/Detalle)** | `Estado (Facturación) === 'Vencidas'` (o `Estado Real`, según módulo — ver fila siguiente) |
| **Vencidas Despacho** | `Estado Real === 'Vencidas'` — métrica independiente, NO intercambiable |
| **Vencidas ≥15 días (antigüedad real)** | `Rango Real` ∈ {'15 +'} → `EFECT.mas15` (hoja "Efectividad" del Excel) — **NO es lo mismo que "Vencidas" de negocio**. Ver incidente 23/07/2026 (§12): un panel titulado "≥15 días" mostró por error el conteo de negocio (Estado Real) durante varias sesiones — confundir estos dos criterios fue la causa raíz de múltiples reportes de Charly. `KPI_HIST.vencidas` = antigüedad (mas15); `KPI_HIST.vencidas_real` = negocio (Estado Real, solo mes vigente; histórico usa mas15 como mejor aproximación) |
| **KPI_TOTALS.mes_actual_pais** | `{mes, Guatemala:{total,vencidas}, "El Salvador":{...}, "Perú":{...}}` — Total Rutas = `Total Rutas (Gral)` sheet (= `totalByMon`, NO la hoja "Total Rutas" a secas, que es una ventana móvil distinta); Vencidas = `Estado Real` por país. Solo mes vigente — histórico por país no existe en el Excel, requiere carga manual (ver §12) |
| **Parseo de filas sin Moneda** | Antes se descartaban silenciosamente (perdían Pendientes/Vencidas reales) — corregido 23/07/2026: solo se descarta si falta `Numero de Despacho`. Sin Moneda → `Pais:'Otro'`, pero cuenta en totales generales |
| **Usuarios vía Supabase** | `login.html`/`analytics.html` leen `profiles` en Supabase — ya no hay arreglo dual que sincronizar (obsoleto desde 20/07/2026). **`profiles.ultimo_acceso`** (columna agregada 23/07/2026): login exitoso la actualiza (no bloqueante); Gestión de Usuarios la lee — antes leía `localStorage`, que solo reflejaba el navegador de quien viera el panel |
| **Honduras** | Sin datos reales — eliminado de Regional; `honduras/index.html` existe pero sin tarjeta |
| **PDC_MASTER_PATH** | Obligatorio definir antes de incluir `js/pdc_data_bridge.js` en cualquier archivo fuera de la raíz |

---

## 10. Validación Obligatoria antes de cualquier deploy

1. Modificar el bloque necesario (quirúrgico, nunca reconstruir)
2. Extraer todos los `<script>...</script>` del HTML final
3. Ejecutar `node --check` sobre cada uno
4. Si el bloque contiene datos (`_R`, `RAW`, etc.), validar también con `JSON.parse()` estricto en Node
5. Obtener SHA fresco inmediatamente antes de cada PUT
6. Evitar deploys consecutivos muy próximos (riesgo de condición de carrera en Pages — ver §3). Si falla, usar `workflow_dispatch`, no "rerun".

---

## 11. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| **v2.3** | **23/07/2026** | **Perú/ESV/Regional: histórico real, KPI_HIST expuesto en PDCBridge (vencidas vs vencidas_real), mes_actual_pais por país, fix fila sin Moneda, fix filtro Vencida, Último Acceso vía Supabase — ver §12** |
| v2.1 | 20/07/2026 | Multi-select de país (gate por rol) + multi-select en Canal/Responsable/Rango (todos los usuarios) — index.html, cash_today.html, cartas_salida.html |
| v2.0 | 07/07/2026 | PDCBridge (fuente única de verdad Rutas) · Honduras eliminado de Regional · Cash Today: publicación por reemplazo total (fin del ciclo de bugs de deduplicación) · rotación de tokens |
| v1.8 | 03/07/2026 | Regla de validación `node --check` obligatoria tras incidente de SyntaxError |
| v1.5 | 25/06/2026 | Auditoría completa · datasets 18/06 · tarjeta HN→ESV |
| v1.0 | 20/06/2026 | Lanzamiento inicial |

---

## 12. Sesión 23/07/2026 — Corrección integral Perú/ESV/Regional + Usuarios (v2.3)

### 12.1 Resumen ejecutivo
Sesión larga de corrección iterativa disparada por reportes reales de Charly tras publicar Excel. Los hallazgos se fueron descubriendo en cascada — cada fix reveló el siguiente problema. Detalle completo en `docs/02_CHANGELOG.md` (14 entradas del 23/07/2026); aquí solo el resumen arquitectónico permanente.

### 12.2 Etiquetas de período dinámicas (Perú, El Salvador, Regional)
Encabezados/período/tabla "Resumen Histórico" eran texto **100% estático** ("Junio 2026" fijo, nunca vinculado a datos). Se agregaron helpers `pdcMesInfo()`/`pdcReplaceTxt()` (duplicados en cada archivo, no en PDCBridge — arquitectura de módulos independientes) que recalculan el mes/año en runtime desde `KPI_TOTALS.report_month`, sin tocar HTML/CSS.

### 12.3 Historial mensual — de sobrescritura a acumulación real
Antes: el último mes se sobrescribía cada publish, perdiendo el mes anterior. Ahora: si `MESES[último] !== mesVigente` → `push()` (nueva posición); si es el mismo mes → update in-place. Aplicado en `peru/index.html`, `elsalvador/index.html`, `regional/index.html`.

### 12.4 KPI_HIST expuesto en PDCBridge (campo aditivo)
`js/pdc_data_bridge.js` ahora extrae también `KPI_HIST` de `index.html` (antes solo `RAW`/`KPI_TOTALS`/`FX_DEF`). Fuente: hoja "Efectividad" del Excel → array histórico desde 2022 con `{mes, vencidas, vencidas_real, total, pct}`.
- `vencidas` = antigüedad real (`EFECT.mas15`, columna "Rutas ≥15 días")
- `vencidas_real` = Estado Real='Vencidas' (regla de negocio), solo mes vigente; histórico usa `mas15` como aproximación
- **Regional/index.html** consume `KPI_HIST.vencidas` (antigüedad) para el panel "Tendencia Rutas Vencidas (≥15 días)"
- **index.html** (gráfica interna `cTend`, "Total Rutas vs Vencidas al Cierre") consume `KPI_HIST.vencidas_real` (negocio)
- **Nunca usar el mismo campo para ambos propósitos** — fue la causa de dos incidentes seguidos en esta sesión (ver CHANGELOG).

### 12.5 `KPI_TOTALS.mes_actual_pais` — Total Rutas/Vencidas por país (solo mes vigente)
Agregado a `index.html`. Fuente correcta (confirmada por Charly tras un primer intento fallido): `Total Rutas (Gral)` sheet (= `totalByMon`, la misma que ya alimentaba `total_by_moneda`) — **NO** la hoja "Total Rutas" a secas (ventana móvil de ~5 semanas, sin relación con la tabla dinámica real del Excel). Vencidas por país: `routes.filter(Pais=X && Estado Real==='Vencidas')`.
Consumido por `peru/index.html`/`elsalvador/index.html` para refrescar el mes vigente de sus históricos (con fallback al backlog pendiente en vivo si el campo no existe — Excel/versión anterior).

### 12.6 Parseo de Excel — fila con Moneda vacía ya no se pierde
`processWorkbook()` descartaba filas sin `Moneda` aunque tuvieran `Numero de Despacho` válido — causaba desfases de -1 en Pendientes/Vencidas (caso real: despacho 30302). Corregido: solo se descarta si falta `Numero de Despacho`. Sin Moneda → `Pais:'Otro'`, cuenta en agregados generales pero no en desgloses por país.

### 12.7 Histórico real Perú/ESV (Ene-Jun 2026)
`D.rutasTotal`/`D.rutasVencidas`/`D.efectividad`/`D.montoPEN` de ambos dashboards reemplazados con datos reales provistos por Charly (antes: placeholders idénticos y ficticios en ambos países). Efectividad histórica se **calcula**, no se carga: `(Total-Vencidas)/Total*100` — Charly confirmó que no requiere dato externo. Julio en adelante se autoactualiza vía `mes_actual_pais`.
**Pendiente:** histórico de Efectividad/Monto para Guatemala — no existe dashboard país dedicado para GT donde insertarlo.

### 12.8 Detalle de Rutas — filtro "Vencida" corregido
`bucket()` (en `peru/index.html`/`elsalvador/index.html`) clasificaba "Vencida" por `Rango Real` (antigüedad) en vez de `Estado (Facturación)`/`Estado Real` (criterio oficial) — el filtro podía mostrar 0 resultados aun con vencidas reales. Corregido para usar el mismo criterio que el resto de la plataforma.

### 12.9 Usuarios — Último Acceso real (Supabase)
`profiles.ultimo_acceso` (columna nueva, migración ejecutada por Charly vía SQL Editor). `login.html` la actualiza tras login exitoso (no bloqueante, sin `await`, con `.then(null,fn)`). `analytics.html` la lee en vez de `localStorage['pdc_access_log']` (que solo reflejaba el navegador de quien viera el panel — nunca el de otros usuarios).

---

## 13. Consolidación de Documentación (08/07/2026)

Existían **dos sets paralelos de documentación** (`docs/00-07_*.md` numerado y `docs/*.md` sin numerar) creados por sesiones distintas que no sabían de la existencia del otro. Diagnóstico y resolución:

| Par | Resultado |
|---|---|
| `MASTER_PROJECT_CONTEXT.md` vs `01_...md` | Mismo alcance (duplicado) → sin numerar marcado obsoleto |
| `CHANGELOG.md` vs `02_...md` | **Contenido único en ambos** → fusionados en `02_CHANGELOG.md` (40 entradas, cronológico) → sin numerar marcado obsoleto |
| `ROADMAP.md` vs `03_...md` | Idénticos (0 diferencias) → sin numerar marcado obsoleto |
| `PROJECT_RULES.md` vs `04_...md` | Numerado es superset (tiene Regla #14 adicional) → sin numerar marcado obsoleto |
| `README.md` vs `05_...md` | Numerado es superset (tiene mapa de docs adicional) → sin numerar marcado obsoleto |

**A partir de ahora, el set numerado (`docs/00-07_*.md`) es el único vigente.** Los archivos sin numerar se conservan solo por trazabilidad de Git, con una nota de obsolescencia en cada uno.

---

## 14. Instrucciones para nuevo chat

1. **Pegar este documento** al inicio del chat
2. **Tokens:** NO asumir que un token de una sesión anterior sigue vigente — han rotado varias veces por revocación de GitHub. Verificar contra la API antes de usar; si da 401, pedir uno nuevo.
3. **NUNCA reconstruir código** — solo modificaciones quirúrgicas. Documentación (este archivo, CHANGELOG) sí se reescribe completa cuando hay cambios de arquitectura.
4. **Siempre leer el archivo de producción fresco** antes de editar (SHA + contenido)
5. **`node --check` + `JSON.parse()` estricto** antes de cualquier deploy con datos
6. **Usuarios en Supabase (tabla `profiles`), no en código** — `login.html`/`analytics.html` ya no tienen arreglos de usuarios que sincronizar
7. **Cash Today: publicación = reemplazo total.** No reintroducir lógica de merge/deduplicación.

---
*PDC Analytics Center · Grupo PDC · Departamento Financiero · v2.3 · 23/07/2026*
