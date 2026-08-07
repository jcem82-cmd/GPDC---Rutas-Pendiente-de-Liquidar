# 04 — PROJECT RULES
## PDC Analytics Center · Reglas Permanentes (NO NEGOCIABLES)
**PDC Analytics Center · Grupo PDC · v1.5 · 05/08/2026**

---

## REGLA 1 — NUNCA RECONSTRUIR ⛔

La regla más importante del proyecto.

❌ **Prohibido:** reescribir el archivo completo, reconstruir módulos enteros, alterar la estructura base.

✅ **Correcto:** modificaciones quirúrgicas, siempre verificando el target:
```python
assert OLD_TARGET in html, f"Target not found"
html = html.replace(OLD_TARGET, NEW_TARGET, 1)
```

---

## REGLA 2 — VALIDACIÓN OBLIGATORIA ANTES DE DEPLOY

1. **Brace balance JS:** strip strings/templates con `re.sub`, luego `count({) == count(})`
2. **Canvas IDs:** cada `mkChart('id')` debe existir como `id="id"` en HTML
3. **No duplicar funciones:** `content.count("function X(") == 1`
4. **Library versions:** verificar que Chart.js 4.4.1 + SheetJS 0.20.0 no cambien
5. **Assert target:** `assert OLD in content` antes de cada replace

---

## REGLA 3 — ARQUITECTURA DE MÓDULOS

- Todo nuevo dashboard = carpeta propia (`nombre/index.html`)
- `analytics.html` = solo Hub (auth + navegación) — nunca lógica de datos
- Auth Bridge v2.0 = IIFE al inicio del body en cada dashboard
- `?tab=` URL param = patrón estándar para deep-linking
- `pdcNavigateToDash(archivo)` = función de navegación desde analytics

---

## REGLA 4 — LIBRERÍAS CANÓNICAS

| Librería | Versión | CDN |
|---|---|---|
| Chart.js | **4.4.1** | `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js` |
| SheetJS | **0.20.0** | `https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js` |
| Inter (Google Fonts) | — | `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800` |

Sin frameworks (React, Vue, Angular). JS vanilla únicamente.

---

## REGLA 5 — DEPLOY PATTERN

```
Archivos < 1MB  → Python urllib PUT directo
Archivos > 1MB  → blob API para GET + Python urllib para PUT
                   (nunca curl: "arg list too long")

Patrón GET SHA:
  GET /repos/{owner}/{repo}/git/trees/main?recursive=1
  → item['sha'] por path

Patrón PUT:
  PUT /repos/{owner}/{repo}/contents/{path}
  body: {message, content (base64), sha}
```

GitHub cancela runs intermedios con commits rápidos — el último gana. Comportamiento normal.

---

## REGLA 6 — SEPARACIÓN DEPÓSITO / RECOGIDA (Cash Today)

```javascript
fData   = RECS.filter(r => r.t === 'Depósito' && dateFn(r) && dimFn(r))
recData = RECS.filter(r => r.t === 'Recogida' && dateFn(r) && dimFn(r))
```

| Tipo | Módulos |
|---|---|
| Depósito | Resumen · GT · SV · Tráfico · Comparador · Detalle · Volumetría (monto/txn/piezas) |
| Recogida | Metas (capacidad/cupo) · Volumetría (visitas) |

---

## REGLA 7 — PRECISIÓN DECIMAL UNIFORME (Cash Today)

| Moneda | Función | Aplica en |
|---|---|---|
| GTQ | `fmt(v, 0)` | Celdas · subtotales · totales · grand total |
| USD | `fmt(v, 2)` | Celdas · subtotales · totales · grand total |

❌ Nunca `fmt(v)` sin decimales explícitos en contextos USD.

---

## REGLA 8 — CONVERSIÓN USD CON TC MENSUAL (Cash Today)

```javascript
const usd = r => {
  if(r.div !== 'GTQ') return r.imp;
  const tc = (r.ym && _TC_MENSUAL[r.ym]) ? _TC_MENSUAL[r.ym] : tcGTQ;
  return r.imp / tc;
};
```

`_TC_MENSUAL` cubre Jun 2025 → Jun 2026 (13 meses). Fallback: `tcGTQ = 7.61815`.

---

## REGLA 9 — CAMPO `hr` DESDE FECHA TRANSACCIÓN (Cash Today)

- `hr` (hora) y `dia` = de `Fecha transacción` (columna con hora real)
- `ym`, `yr`, `mo`, `dy` = de `FECHA` (columna de fecha de operación)
- **Nunca usar `FECHA` para calcular hora** — siempre es medianoche

---

## REGLA 10 — TRÁFICO: SVG PURO (Cash Today)

El módulo Tráfico usa SVG puro (no Chart.js). Canvas falla en contenedores `display:none`.
**No cambiar este patrón nunca.**

---

## REGLA 11 — CONTROL DE ACCESO POR ROL

| Elemento | admin | supervisor | consulta |
|---|---|---|---|
| Ver dashboards autorizados | ✅ | ✅ | ✅ |
| Panel Admin (analytics.html) | ✅ | ❌ | ❌ |
| Snapshot / Export PDF | ✅ | ❌ | ❌ |
| Tab Tipos de Cambio (Rutas) | ✅ | ❌ | ❌ |
| Chat de soporte | ✅ | ✅ | ✅ |

`admin-visible` se agrega por JS según `data.role`. **Nunca hardcodear en HTML estático.**

---

## REGLA 12 — SESIÓN Y LOGIN

- `pdc_session` (primary) → `{email, nombre, rol, dashboards, pais, sedes, ts}`
- `pdc_user` (legacy) → `{nombre, email, role}` — `role` no `rol` (compatibilidad)
- TTL: 8 horas · session watcher: verifica 60s · banner + toast a 15 min restantes
- Login: bloqueo 3 intentos (30s) · remember-email
- `pdcRenewSession()` resetea TTL sin re-login

---

## REGLA 13 — ESTRUCTURA DASHBOARDS PAÍS

Patrón estándar (Perú y Honduras como referencia):
- Auth Bridge v2.0: lee `pdc_session` → `pdc_user` → redirect `../analytics.html`
- Header: logo · botón `← Portal` · título · badge (bandera+moneda) · nombre usuario
- Nav: 4 tabs · `goPage()` · `renderCharts(page)` lazy
- Módulos: resumen · analisis · detalle · tendencias
- Charts: `BASE_OPTS` compartido · `mkChart()` con `destroy()` previo
- Detalle: filtros select + `renderDetalle()` + `filtrarDetalle()` + `resetFiltros()`
- Init: `?tab=` URL param · nombre usuario desde `pdc_session`

---

## REGLA 14 — DISEÑO CORPORATIVO

No modificar sin autorización:
- Logo PDC (Base64, `height:52px`)
- Paleta CSS `:root`
- Estructura de header y navegación
- Fila CONSOLIDADO: `background:#DCE8FE` + `color:var(--navy)` — nunca texto blanco

---

## REGLA 15 — DOCUMENTACIÓN

Al finalizar cada sesión de desarrollo:
1. Actualizar `docs/CHANGELOG.md` — nueva entrada con fecha, archivos y cambios
2. Actualizar `docs/ROADMAP.md` — marcar ítems completados, añadir pendientes
3. Actualizar `docs/MASTER_PROJECT_CONTEXT.md` — versiones, estado, SHAs

---

## REGLA 16 — CHAT DE SOPORTE (Supabase)

- `chat_messages.id` es UUID — nunca comparar con `>`. Usar `created_at` para mensajes nuevos
- `#chatBox` NO debe tener `style="display:none"` inline — control de visibilidad solo vía clase `.open`
- Admin responde con `sender_email = email_usuario_destino`, `sender_role='admin'`, prefijo `[To:email]`
- Usuario lee con `WHERE sender_email = currentUser.email`
- Polling: 3s background · 1.5s con chat abierto

---

## REGLA 17 — EXPORT PDF (index.html Rutas)

- `exportarPDF()` → ventana emergente con HTML autocontenido → `window.print()`
- Visible solo en tab Resumen (clase `.pdf-btn.visible` via `ST()` hook)
- Sin dependencias externas — `window.print()` nativo
- `@page{size:A4;margin:12mm 14mm}` forzado
- Botón `admin-visible` — solo admin lo ve

## REGLA #14 — VALIDACIÓN DE SINTAXIS JS CON NODE (agregada 03/07/2026)

Tras incidente de producción (dashboard en blanco por SyntaxError no detectado por conteo de llaves):

**Obligatorio antes de cualquier deploy que modifique bloques `const` (`_R`, `_TC_MENSUAL`, `_COSTOS`, `_M`):**

```bash
node --check script_extraido.js
```

El balance de llaves `{`/`}` NO detecta: comas mal ubicadas, tokens huérfanos, comentarios seguidos de coma, ni otros errores de sintaxis que invalidan el bloque `<script>` completo.

**Protocolo:**
1. Extraer todos los `<script>...</script>` del HTML final
2. Ejecutar `node --check` sobre cada uno
3. Solo desplegar si no hay errores
4. Espaciar deploys consecutivos (evitar condición de carrera en workflow de GitHub Pages)

---

## REGLA 14 — `node --check` OBLIGATORIO ANTES DE CADA DEPLOY

El conteo de llaves (REGLA 2.1) **no es suficiente**: no detecta errores de sintaxis reales.

Patrón obligatorio: extraer todos los bloques `<script>` no vacíos y sin `src=` con regex Python → escribir cada uno a `.js` → `node --check` sobre **todos**, no solo los modificados.

Aplica igualmente a bloques JSON embebidos: validar con `json.loads()` estricto tras cada modificación.

---

## REGLA 15 — TODO `const` EMBEBIDO QUE ALIMENTE LÓGICA DE NEGOCIO DEBE PERSISTIRSE

**Origen (05/08/2026):** `dlHTML()` regrababa `_M` (metas), pero el flujo de publicación self-service vía Edge Function solo persistía `_R`, `_TC_MENSUAL` y `_COSTOS`. Las metas embebidas quedaron congeladas y divergieron silenciosamente del Excel durante meses (`excv` 1.0 vs 0.35; cupo AMATITLÁN 9MM vs 8MM).

Mientras `metas` solo alimentaba semáforos el impacto era cosmético. Al construirse encima un **motor de facturación**, la misma divergencia producía cobros errados (×2.86 en el excedente de PDC Comercial).

### Reglas derivadas

1. **Persistir siempre.** Bloques persistidos hoy: `_R`, `_M`, `_IMP`, `_TC_MENSUAL`, `_COSTOS`. Todo bloque nuevo que alimente cálculo se suma a la lista.
2. **No persistir lo que se puede calcular.** `_FACTURACION_MENSUAL` **no** se persiste: se computa en runtime desde `RECS` + `METAS`. Una sola fuente de verdad, cero riesgo de divergencia.
3. **Un fix de persistencia NO repara los datos ya embebidos.** Solo evita divergencias futuras. Al corregir la persistencia de un bloque, hay que **regrabar el bloque en el mismo despliegue**, o el síntoma sobrevive y el usuario reporta el bug como no resuelto.
4. **Paridad `dlHTML()` ↔ publicación.** Ambos flujos deben persistir exactamente el mismo conjunto de bloques. Cualquier asimetría es un bug latente.

---

## REGLA 16 — SUBTOTALES LIGADOS, NUNCA RECALCULADOS EN LA VISTA

Si un subtotal ya existe en la estructura de datos, la vista **lo consume**; no lo recalcula iterando un subconjunto.

**Origen (05/08/2026):** el desglose de Tesorería iteraba solo `esv.piezas` y mostraba $162.8910, mientras el resumen mostraba $170.1927. El cálculo era correcto; la vista construía su propio subtotal a partir de un subconjunto incompleto.

Regla: `Subtotal tesorería` → `esv.resumen.tesoreria.valor`. Un descuadre entre desglose y resumen es estructuralmente imposible cuando ambos leen el mismo campo.

---

## REGLA #19 — TABLEROS: canal_totals SIEMPRE DESDE LA MISMA HOJA/CRITERIO QUE EL NUMERADOR (agregada 07/08/2026)

En cualquier cálculo de % pendiente/total por canal, país, o categoría en `index.html` (módulo Tableros u otro futuro), el denominador ("total del período") debe calcularse desde la MISMA hoja fuente y el MISMO criterio de negocio que ya usa el numerador — nunca desde una hoja auxiliar distinta del Excel (ej. "Total Rutas (Gral)"), aunque en apariencia represente el mismo concepto. Dos hojas del mismo Excel pueden desincronizarse en su universo de filas sin previo aviso, produciendo porcentajes >100%. Ver `01_MASTER_PROJECT_CONTEXT.md` §9 (REGLA #19) y §18 para el caso documentado (GT Distribuidores: 155%).

## REGLA #20 — KPI_HIST ES ACUMULATIVO, NUNCA SE RECONSTRUYE (agregada 07/08/2026)

El histórico de "Tendencias KPI" (`KPI_HIST`, gráfica "Tendencia de Cierre Mensual") NUNCA se recalcula completo desde ninguna hoja del Excel en cada publicación. Se parte del arreglo YA embebido en la página (memoria del navegador al momento del self-publish) y solo se actualiza o agrega la entrada del mes vigente, con cálculo en vivo (`Estado Real==='Vencidas'`). Un mes queda congelado permanentemente (`closed:true`) únicamente cuando el nombre del archivo subido contiene "Cierre" — a partir de ahí, ningún archivo posterior (salvo otro "Cierre" para ese mismo mes) puede sobreescribirlo. La tabla "Tendencia de Rutas / Cierre Mensual" de la hoja "KPI" del Excel es un paleativo de referencia de Charly — NUNCA la fuente de datos del dashboard; sirve solo para validar que el cálculo propio coincida. Ver `01_MASTER_PROJECT_CONTEXT.md` §19.
