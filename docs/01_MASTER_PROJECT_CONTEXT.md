# 01 — MASTER PROJECT CONTEXT
## PDC Analytics Center · Estado Técnico Completo

**Versión vigente:** v2.0 | **Última actualización:** 07/07/2026 | **Estado:** Producción ✅

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
├── login.html              ← Autenticación única · 14 usuarios · 3 roles
├── analytics.html          ← Portal Hub · cards con KPIs EN VIVO vía PDCBridge
│
├── index.html              ← Dashboard Liquidación de Rutas (fuente única de verdad)
├── cash_today.html         ← Dashboard Cash Today · dataset propio (no conectado a PDCBridge)
├── admin.html              ← Panel administrativo · chat Supabase
│
├── regional/index.html     ← Consolidado Regional · KPIs EN VIVO vía PDCBridge (GT·SV·PE)
├── peru/index.html         ← Dashboard Perú · KPIs EN VIVO vía PDCBridge
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

### SHAs de producción (09/07/2026) ← ACTUALES
| Archivo | SHA |
|---|---|
| `index.html` | `2a6b15bdf358` |
| `analytics.html` | `9e674d60ecc2` |
| `login.html` | `0096f0b23f43` |
| `admin.html` | `58dfe775739a` |
| `regional/index.html` | `ec0156003e5a` |
| `peru/index.html` | `70588d72c6ba` |
| `honduras/index.html` | `c2014b3adf9a` |
| `cash_today.html` | `aaa129e02a65` |
| `js/pdc_data_bridge.js` | `174ac5c4cb3d` |
| `js/auth.js` | `451f86c4c443` |
| `js/users.js` | `2f35ca816e6b` |
| `cash_summary.json` | `dbd36921d44a` |

### Sesión 09/07/2026 — cierre de barrido de consistencia
- `login.html`: estadísticas de landing (rutas/países/usuarios) conectadas vía PDCBridge + `PDC_USERS.length`. Mención a Honduras eliminada de la descripción del módulo Rutas.
- Eliminados 3 usuarios sin operación real: Carlos Reyes, Maria Funez, TEAM Honduras (`pais:'HN'`) de `PDC_USERS` en `login.html` y `analytics.html`.
- **`hub.html` eliminado del repositorio** — prototipo de Hub anterior a `analytics.html`, huérfano (sin enlaces activos, base de usuarios propia desactualizada).
- `analytics.html`: descripción de "Consolidado Regional" corregida (ya no menciona Honduras).

**Tokens:** ambos ecosistemas (Rutas `index.html` self-publish y Cash Today `cash_today.html` self-publish) usan tokens fine-grained fragmentados embebidos en cada archivo, con permiso `Contents: Read/Write` restringido a este repo. **Ambos han sido rotados al menos una vez en esta versión** por revocación de GitHub (Secret Scanning) o por incidentes de datos. No asumir que un token documentado en una sesión anterior sigue vigente — verificar contra la API (`GET /user` o `/repos/.../contents`) antes de usarlo; si devuelve `401 Bad credentials`, pedir uno nuevo a Charly (ver protocolo en §8).

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

Sin cambios en esta versión respecto a la lista de 14 usuarios documentada previamente. `PDC_USERS` sigue definido en **dos archivos**: `login.html` (construye la sesión) y `analytics.html` (referencia) — **siempre actualizar ambos** al modificar usuarios o dashboards.

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
| **Vencidas (oficial/hub/cards)** | `Estado (Facturación) === 'Vencidas'` |
| **Vencidas Despacho** | `Estado Real === 'Vencidas'` — métrica independiente, NO intercambiable |
| **PDC_USERS dual** | Siempre actualizar `login.html` Y `analytics.html` |
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
| **v2.0** | **07/07/2026** | **PDCBridge (fuente única de verdad Rutas) · Honduras eliminado de Regional · Cash Today: publicación por reemplazo total (fin del ciclo de bugs de deduplicación) · rotación de tokens** |
| v1.8 | 03/07/2026 | Regla de validación `node --check` obligatoria tras incidente de SyntaxError |
| v1.5 | 25/06/2026 | Auditoría completa · datasets 18/06 · tarjeta HN→ESV |
| v1.0 | 20/06/2026 | Lanzamiento inicial |

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
6. **PDC_USERS en login.html Y analytics.html** — siempre ambos
7. **Cash Today: publicación = reemplazo total.** No reintroducir lógica de merge/deduplicación.

---
*PDC Analytics Center · Grupo PDC · Departamento Financiero · v2.0 · 07/07/2026*
