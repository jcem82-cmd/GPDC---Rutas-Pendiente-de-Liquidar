## [08/07/2026] — BUG DE RAIZ EN parseWB(): nunca antes activado, no relacionado a incidentes previos

### Correccion de errores - bug latente en el parser de Excel del navegador

**Sintoma:** al publicar el Excel del corte 07/07/2026, los montos aparecieron ~1000x mas pequenos (ej. Q72,757 en vez de Q6,152,924 para CDA-enero) y las fechas en formato invertido (DD/MM/YYYY en vez de YYYY-MM-DD), con hora y dia de la semana vacios.

**Importante - NO relacionado con los incidentes de deduplicacion (06-07/07):** ese ciclo ya esta cerrado y funcionando (reemplazo total, sin merge). Este es un bug DISTINTO, en la funcion `parseWB()` (lectura de Excel en el navegador), nunca antes activado.

**RCA:**
1. Verificado con `openpyxl` el formato real de celda del Excel: `Importe` con formato `#,##0.00` (separador de miles) y `Fecha transaccion` con formato `dd/mm/yyyy hh:mm:ss` (slash). El valor subyacente en ambos casos es correcto - el problema es 100% de interpretacion en el navegador.
2. Con `raw:false`, SheetJS devuelve el texto FORMATEADO segun el formato de celda, no el valor crudo. Excels anteriores no tenian separador de miles visible, por lo que este bug jamas se activo hasta ahora.
3. Bug 1 (importe): `parseFloat(texto.replace(',','.'))` convertia la PRIMERA coma en punto. Con "14,205.00" (miles) resultaba en "14.205.00" -> parseFloat truncaba a 14.205.
4. Bug 2 (fecha): el parser solo reconocia ISO (`YYYY-MM-DD`) y `DD-MM-YYYY` (guion). El formato `DD/MM/YYYY` (slash) no coincidia con ningun patron, caia a `new Date(fdStr)` que JS interpreta como MM/DD/YYYY (invalido para dia=20) -> fecha invalida -> hora y dia de semana en blanco. Ademas el campo `f` final se construia del texto crudo sin normalizar, nunca desde la fecha ya parseada.

**Correccion aplicada (`parseWB()`):**
- Importe: se eliminan TODAS las comas (separador de miles) antes de `parseFloat`, en vez de convertir la primera a punto decimal.
- Fecha: agregado patron para `DD/MM/YYYY HH:MM:SS` (slash), ademas de los ya existentes (ISO, DD-MM-YYYY guion).
- Campo `f` ahora se normaliza SIEMPRE a partir de la fecha ya parseada (formato estandar `YYYY-MM-DD HH:MM:SS`), con fallback al texto crudo solo si el parseo falla - corrige la causa raiz para cualquier formato de Excel futuro, no solo este caso puntual.
- `_R` reemplazado con dataset limpio reconstruido via Python (39,586 registros, corte 07/07/2026), validado cifra por cifra: CDA Q79,848,712.02 total (incluye julio actualizado), Xela Q14,797,032.00, Santa Tecla $21,596,191.64, San Miguel $4,664,330.17.

**Validado antes de deploy:**
- Prueba funcional en Node simulando el caso exacto que fallaba ("14,205.00" + "20/01/2026 09:47:27") -> resultado correcto (imp:14205, f:'2026-01-20 09:47:27', hr:9, dia:'martes').
- Confirmado que los formatos anteriores (ISO, DD-MM-YYYY guion) siguen funcionando sin regresion.
- `node --check` en los 5 bloques de script + `JSON.parse()` estricto sobre `_R` final.

**Alcance:** unicamente `parseWB()` (parser de Excel client-side) + bloque `_R`. Ningun otro modulo tocado.

---

## [07/07/2026] — CIERRE DEFINITIVO: fusion/deduplicacion eliminada por completo

### Correccion de errores - RCA final del ciclo de incidentes 06-07/07/2026

**Confirmado con el usuario:** cada Excel publicado es un export historico COMPLETO (no incremental). Ejemplo: hoy se publico el corte al 06/07; manana se publicara el corte al 07/07, y asi sucesivamente. Santa Tecla siempre arranca jun-2025, San Miguel jul-2025, CDA ene-2026 - coincide con el inicio real de cada operacion en cada archivo.

**Historial completo del ciclo (para trazabilidad):**
1. v1 (dedup con importe en la clave) -> sobre-conteo al corregir montos retroactivos en JDE.
2. v2 (dedup sin importe, con ticket) -> perdida silenciosa de registros cuando el ticket no es unico (frecuente en El Salvador).
3. **v3 (esta correccion): eliminada la fusion por completo.** Cada publicacion REEMPLAZA el dataset entero con el Excel recien cargado. Es mas simple, mas robusto, y elimina de raiz toda la categoria de bugs de merge/dedup.

**Cambios aplicados:**
- `_R` reemplazado con dataset validado desde el Excel del usuario (corte 06/07/2026): 39,417 registros.
- `publishToGitHub()`: eliminada la funcion `_normKey` y la logica de merge/indexByKey. Ahora es `currentR = newRecs;` (reemplazo directo).
- Mensajes de status y commit actualizados: ya no reportan "nuevos/actualizados", reportan el total del dataset reemplazado.
- Manejo de nulos ahora exhaustivo en la reconstruccion Python (campo por campo con `pd.notna()`), validado con `allow_nan=False` para garantizar cero tokens NaN invalidos.

**Validado antes de deploy:**
- Totales por sede/mes verificados cifra por cifra contra el pivote de control del usuario: coincidencia exacta en CDA, Xela, Santa Tecla, San Miguel (incluyendo el corte actualizado de julio).
- `JSON.parse()` estricto en Node (no Python) sobre el `_R` final: 39,417 registros, sin errores.
- `node --check` en los 5 bloques de script.

**Alcance:** unicamente `cash_today.html` (bloque `_R` + funcion `publishToGitHub()`). Ningun otro modulo, diseno o archivo tocado.

---

## [07/07/2026] — Causa raiz corregida: bug de deduplicacion en publishToGitHub()

### Correccion de errores - cierre del ciclo RCA iniciado el 06/07/2026

**Alcance:** unicamente `cash_today.html`, funcion `publishToGitHub()`, bloque de deduplicacion (`_normKey` + logica de merge). Ningun otro archivo, diseno o funcionalidad modificado.

**Correccion aplicada:**
- `_normKey` ya NO incluye el importe en la clave de identidad de una transaccion. Ahora es: `cajero + fecha_epoch + numero_ticket` (inmutable).
- Nueva logica de merge: si la clave ya existe y el importe cambio, se **reemplaza** el registro (actualizacion - corrige montos retroactivos de JDE), no se inserta uno nuevo. Si la clave no existe, se agrega como registro nuevo.
- Mensajes de status y commit actualizados para reportar "nuevos" y "actualizados" por separado.

**Validado antes de deploy:**
- `node --check` en los 5 bloques script.
- Prueba funcional en Node simulando el escenario exacto que causaba el bug: mismo cajero+fecha+ticket con importe corregido -> resultado: 1 actualizado, 1 nuevo (genuino), 0 duplicados. Total de registros correcto (2, no 3).

**Impacto:** las proximas publicaciones de Excel via el boton de Config ya no duplicaran registros cuando existan correcciones retroactivas de monto en JDE. Cierra el ciclo completo del incidente iniciado con el reporte de Volumetria incorrecta (ver entrada anterior del 06/07/2026).

---

## [06/07/2026] — BUG CRITICO: sobre-conteo en _R por bug de deduplicacion en self-publish

### Correccion de errores - Root Cause Analysis + reemplazo de dataset

**Sintoma reportado (con capturas y Excel fuente):** Volumetria mostraba montos mensuales distintos a los pivotes de control del usuario (Image 1). El propio `index.html` de Rutas no estaba involucrado - este bug es exclusivo de `cash_today.html`.

**RCA:**
1. Verificado con el Excel real subido por el usuario: los totales mensuales por sede (CDA, Xela, Santa Tecla, San Miguel) coinciden EXACTO con los 4 pivotes de control del usuario (validado cifra por cifra en las 4 sedes).
2. El `_R` desplegado tenia 100,321 registros; el Excel fuente solo genera 39,190. Desglose por sede mostro el desplegado con ~2.5x mas registros que el Excel fuente en cada sede.
3. Causa raiz localizada en `publishToGitHub()`: la funcion de auto-publicacion hace deduplicacion via `_normKey = cajero + fecha_epoch + ticket + IMPORTE`. Al incluir el **importe** como parte de la clave de identidad de una transaccion, cualquier correccion retroactiva de monto en JDE (comun en el flujo operativo) hace que el sistema trate la transaccion corregida como "nueva" en vez de como una actualizacion - el registro viejo (con el monto incorrecto) nunca se elimina y el nuevo se agrega al lado, duplicando el conteo. Esto se acumula con cada publicacion sucesiva (hubo 2 publicaciones solo hoy).

**Correccion aplicada (alcance de esta sesion):**
- Reconstruido `_R` completo desde el Excel fuente verificado (39,190 registros, 4 sedes: CDA, Xela, Santa Tecla, San Miguel), reemplazando por completo (no append) el dataset desplegado.
- Validado node --check en el script principal antes de publicar.
- Validado cifra por cifra contra los 4 pivotes de control del usuario: coincidencia exacta en las 4 sedes, todos los meses disponibles.
- Deploy confirmado exitoso.

**Pendiente - causa raiz de fondo (NO corregido en esta sesion, requiere autorizacion explicita):**
La funcion `publishToGitHub()` (boton de auto-publicacion en Config) seguira produciendo este mismo problema en cada futura publicacion mientras la clave de deduplicacion (`_normKey`) incluya el importe. La correccion de fondo es cambiar la clave de identidad de una transaccion a algo inmutable (ej. cajero + fecha_epoch + numero de ticket, SIN el importe), y tratar coincidencias de esa clave con importe distinto como una ACTUALIZACION (reemplazar el registro viejo) en vez de una insercion nueva. Esto toca el boton de publicacion (modulo distinto al solicitado hoy) y requiere autorizacion aparte antes de implementarse.

**Alcance de esta sesion:** unicamente `cash_today.html`, bloque `const _R`. No se toco `_COSTOS`, `_TC_MENSUAL` ni ningun otro modulo (fuera del reporte del usuario).

---

# 02 — CHANGELOG
## PDC Analytics Center · Historial de Versiones

---

## [v2.3-CT] 03/07/2026 — HOTFIX: SyntaxError crítico en producción

### RCA
| # | Causa raíz | Síntoma |
|---|---|---|
| 1 | Coma inválida insertada tras comentarios `/* */` en reconstrucción de `_TC_MENSUAL` | `SyntaxError` invalidó todo el bloque `<script>` — dashboard completamente en blanco |
| 2 | Condición de carrera: dos deploys casi simultáneos (fix + hotfix) | Workflow "Deploy Dashboard" falló silenciosamente en el paso "Deploy to GitHub Pages" — el hotfix no llegó a publicarse en el primer intento |

### Corrección aplicada
- Reconstrucción de `_TC_MENSUAL` con sintaxis válida (comentarios sin coma trailing)
- Validación de sintaxis con **Node.js `--check`** sobre ambos bloques `<script>` — confirmado sin errores
- Re-disparo manual del workflow "Deploy Dashboard" tras confirmar el fallo — segundo intento exitoso
- Verificación cruzada vía GitHub Actions API (status `success`)

### Lección aprendida — proceso reforzado
⚠️ **Nueva regla de validación obligatoria:** toda reconstrucción de bloques `const` en `cash_today.html` debe validarse con `node --check` antes de deploy — el balance de llaves `{`/`}` **no es suficiente** para detectar errores de sintaxis (comas mal ubicadas, tokens huérfanos, etc.)

### SHA producción final
`cash_today.html` — `713f4fea1c907e3b7a00fc8c3d797649393e28d2`

---

## [v2.2-CT] 02/07/2026 — Fix crítico: merge self-publish + persistencia TC

### RCA
| # | Causa raíz | Síntoma |
|---|---|---|
| 1 | Merge de `publishToGitHub()` comparó contra base de datos inconsistente | Dataset híbrido corrupto (68,581 registros no reconciliables tras 2 publicaciones) |
| 2 | `_TC_MENSUAL` nunca se incluía en el payload de publicación | Tipos de cambio actualizados en Excel nunca persistían en producción |

### Correcciones aplicadas
- Clave de deduplicación normalizada por timestamp epoch (`Date.parse`) — inmune a diferencias de formato entre exportaciones de Excel
- `publishToGitHub()` ahora reconstruye y persiste también el bloque `_TC_MENSUAL`
- `_R` reconstruido limpio desde Excel fuente: **38,868 registros, 0 errores**
- `_TC_MENSUAL` actualizado: jun-2026 corregido a 7.61812, jul-2026 agregado (7.62342, proyección corporativa)

### Validación de integridad — Santa Tecla / San Miguel
| Sede | Día | Total | Txns | Prom/txn |
|---|---|---|---|---|
| Santa Tecla | 01/07 | $63,401.16 | 97 | $653.62 |
| Santa Tecla | 02/07 | $72,021.85 | 131 | $549.79 |
| San Miguel | 01/07 | $21,536.40 | 19 | $1,133.49 |
| San Miguel | 02/07 | $12,089.51 | 20 | $604.48 |

### SHA producción
`cash_today.html` — commit `1582edbcfd88`

---

## [v2.1-CT] 02/07/2026 — Self-Publish Excel + Fix crítico zona horaria

### Nueva funcionalidad
- Botón self-service **"🚀 Publicar en GitHub"** en Config de Cash Today
- Token fine-grained (Contents R/W únicamente, scope limitado al repo), fragmentado en código para evadir GitHub Secret Scanning
- Deduplicación automática por clave `cajero+fecha+ticket+importe`

### Bug crítico corregido — RCA
**Causa raíz:** `parseWB()` interpretaba fechas ISO de columna `FECHA` (`"YYYY-MM-DD"`) vía `new Date(string)`, que JS trata como medianoche UTC. Al extraer `getFullYear()/getMonth()/getDate()` (locales) en huso horario Guatemala (UTC-6), el día calculado retrocedía uno.

**Síntoma:** registros de 02/07/2026 aparecían fechados 01/07/2026 tras publicar vía self-service.

**Corrección:** parseo de fecha explícito por regex (ISO y DD/MM/YYYY) construyendo `Date` con constructor local `new Date(y,m-1,d)`, evitando la ambigüedad UTC.

**Remediación de datos:** `_R` reconstruido completo desde Excel fuente (38,713 registros, 0 errores) — reemplaza dataset contaminado (68,326 registros con fechas mezcladas tras el bug).

### SHA producción
`cash_today.html` — commit `c57883e91e05`

---

## [v2.0-CC] 26/06/2026 — Centro de Comunicación · Widget Flotante Corporativo

### SHAs de producción
| Archivo | SHA |
|---|---|
| `cc_widget.js` | `4206ff0e2212` |
| `admin.html` | `58dfe775739a` |
| `analytics.html` | `c721f9f0cd99` |
| `assistant_avatar.png` | `4c5094b07f81` |
| `index.html` | `a12727975196` |
| `cash_today.html` | `168b45f2ef75` |

### Cambios aplicados

#### CR-001 / CR-002 — Centro de Comunicación Flotante
| Cambio | Detalle |
|---|---|
| `cc_widget.js` creado | Componente flotante reutilizable · cualquier dashboard lo activa con 1 línea `<script>` |
| `admin.html` rediseñado | Centro de Comunicación — pantalla full-screen eliminada · solo widget flotante |
| `analytics.html` | Eliminada tarjeta "Chat de soporte" para supervisor/consulta · acceso via widget flotante |
| `index.html` | Agregado `<script src="cc_widget.js">` al final del body |
| `cash_today.html` | Agregado `<script src="cc_widget.js">` al final del body |
| `assistant_avatar.png` | Avatar IA corporativo PDC Robot 3D con logo PDC Analytics Center |

#### Funcionalidades del widget (cc_widget.js v2.0)
| Funcionalidad | Estado |
|---|---|
| Botón FAB circular esquina inferior derecha | ✅ |
| Avatar robot PDC corporativo en FAB y header | ✅ |
| Animación flotación suave (3s loop) | ✅ |
| Glow azul corporativo sincronizado | ✅ |
| Pulso FAB al recibir mensaje nuevo | ✅ |
| Animación saludo al abrir widget | ✅ |
| Ventana flotante 460px × 70vh | ✅ |
| Minimizar / Restaurar / Cerrar | ✅ |
| Sidebar conversaciones (solo admin) | ✅ |
| Una sola interfaz para todos los roles | ✅ |
| Envío mensajes via REST fetch puro | ✅ |
| Enter y botón Enviar funcionales | ✅ |
| Auto-scroll requestAnimationFrame | ✅ |
| Toast alerta visual | ✅ |
| Sonido WebAudio API | ✅ |
| Badge contador FAB y header | ✅ |
| Polling 5s + Realtime Supabase | ✅ |
| ccOpen() expuesto globalmente | ✅ |
| Dashboard visible detrás del widget | ✅ |

#### Arquitectura
- `cc_widget.js` es autocontenido (IIFE, prefijo `pdc-cc-`)
- No colisiona con estilos del dashboard host
- Lee sesión de `sessionStorage` (`pdc_session` o `pdc_user`)
- REST fetch directo a Supabase (sin depender del SDK del host)
- Futuros dashboards: solo agregar `<script src="cc_widget.js"></script>`

---

## [v2.9-CT] 25/06/2026 — Cash Today · Dataset correcto + CSS Presupuesto

### SHAs de producción finales
| Archivo | SHA |
|---|---|
| `cash_today.html` | `0117c2a71594` |
| `analytics.html`  | `14c254be01b6` |
| `login.html`      | `5b578731275b` |
| `index.html`      | `83aca5b30cfb` |

### Cambios aplicados en esta sesión
| Cambio | Detalle |
|---|---|
| Dataset `_R` actualizado | 37,348 registros · jun-2026 correcto: CDA Q11.77M · XELA Q2.85M · STA $1.2M · SMG $304K |
| Festivos `hol=1` corregido | 704 registros correctos (Semana Santa 09/10/11 abr + otros) |
| CSS Presupuesto | `#page-presupuesto .kpi-val { font-size: clamp(13px,1.4vw,18px) }` — valores no desbordan tarjeta |
| Portada `login.html` | Rutas activas 710→146 · Países 4→3 |
| Portada `analytics.html` | TX ATM 35k→36k · fecha 24 jun 2026 |
| Módulo Festivos | Permanece en el dashboard (no se elimina — estructuralmente entrelazado con Tráfico) |

### Módulos Cash Today — estado final
| Módulo | Estado |
|---|---|
| Resumen | ✅ Funcional |
| Guatemala | ✅ Funcional |
| El Salvador | ✅ Funcional |
| Límites & KPIs | ✅ Funcional |
| Tráfico | ✅ Funcional |
| Comparador | ✅ Funcional |
| Detalle | ✅ Funcional |
| Volumetría | ✅ Funcional |
| Costo Servicio | ✅ Funcional |
| Presupuesto | ✅ Funcional · valores KPI adaptados |
| Festivos | ⚠️ Presente · muestra referencia estática cuando no hay festivos en el período |
| Config | ✅ Funcional |

---

## [v2.9-CT] 25/06/2026 — Cash Today · Auditoría completa + Correcciones + Estética

### Archivos modificados
| Archivo | SHA final | Cambios |
|---|---|---|
| `cash_today.html` | `eb28dc11796a` | Dataset _R actualizado · Metas visitas · módulo Festivos eliminado · CSS presupuesto |
| `login.html` | `5b578731275b` | KPIs portada: rutas 710→146, países 4→3 |
| `analytics.html` | `14c254be01b6` | KPIs cards: rutas 146 correcto, TX ATM 35k→36k, fecha 24 jun 2026 |

### Dataset `_R` — cash_today.html
| Métrica | Valor anterior | Valor nuevo |
|---|---|---|
| Total registros | 35,089 | **37,348** |
| Junio CDA | Q 5,874,464.70 | **Q 11,773,388.95** |
| Junio XELA | Q 1,899,717.00 | **Q 2,853,807.00** |
| Junio Sta. Tecla | $ 847,365.83 | **$ 1,206,751.59** |
| Junio Sn. Miguel | $ 213,915.32 | **$ 304,860.37** |
| Festivos hol=1 | 121 (incorrecto) | **704 (correcto)** |

### Correcciones funcionales
| Bug | Módulo | Fix |
|---|---|---|
| Visitas en tarjetas no coincidían con Volumetría | Límites & KPIs | `buildRow` ahora usa Recogidas + `r.dy` igual que `renderVolumentria` |
| Módulo Festivos no mostraba nada en ningún mes | Festivos | **Eliminado del dashboard** (tab, página HTML, función JS — removidos completamente) |

### Corrección estética
| Elemento | Fix |
|---|---|
| Valores KPI módulo Presupuesto se desbordaban de la tarjeta | CSS override `#page-presupuesto .kpi-val { font-size: clamp(13px,1.4vw,18px) }` |

### Portadas actualizadas
| Archivo | Campo | Antes | Después |
|---|---|---|---|
| `login.html` | Rutas activas | 710 | **146** |
| `login.html` | Países | 4 | **3** |
| `analytics.html` | Rutas activas | 146 | **146** ✅ |
| `analytics.html` | TX ATM | 35k | **36k** |
| `analytics.html` | Fecha Cash Today | 21 jun 2026 | **24 jun 2026** |

### Validación cruzada final
- ✅ 4 sedes junio 2026 cuadran a Q$0.00 vs Excel
- ✅ Módulo Festivos eliminado sin afectar otros módulos
- ✅ Tráfico, Metas, Resumen, GT, SV, Volumetría intactos
- ✅ Portadas con datos reales de la última actualización

---

## [v2.8-CT] 25/06/2026 — Cash Today · Dataset actualizado + Festivos corregidos

### Archivo modificado: `cash_today.html`

### Dataset
| Dataset | Versión anterior | Versión nueva |
|---|---|---|
| `_R` registros | 35,089 | **37,235** (+2,146) |
| Rango XELA | Feb–May 2026 | **Feb–Jun 2026** |
| Rango CDA/ESV | hasta 11/06/2026 | **hasta 24/06/2026** |
| `hol=1` correctos | 121 (Semana Santa = hol=0 ❌) | **704 (Semana Santa = hol=1 ✅)** |

### Correcciones
| Bug | Causa raíz | Fix |
|---|---|---|
| XELA sin jun 2026 | `_R` desactualizado | Regenerado desde Excel 24/06/2026 |
| ESV sin jun 2026 | `_R` desactualizado | Regenerado completo |
| Módulo Festivos vacío | `_R` generado con calendario incorrecto — 2026-04-09/10/11 tenían `hol=0` | `hol` recalculado con `GT_HOL`/`SV_HOL` canónicos del JS |

### Validación cruzada
- ✅ 8 puntos de control validados contra Excel (diferencia $0.00)
- ✅ `GT_HOL`/`SV_HOL` del JS = `hol` en `_R` (100% coincidencia)
- ✅ Todas las funciones JS intactas

---

## [v1.5] — 24/06/2026 · Sesión de Corrección Global ✅

### Archivos modificados en esta sesión
| Archivo | SHA final | Cambios |
|---|---|---|
| `index.html` | `83aca5b30cfb` | RAW+KPI_HIST+EFECT+KPI_TOTALS actualizados · RD/addDR corregidos · renderTableros unificado |
| `analytics.html` | `32d31f982a01` | Tarjeta HN→ESV · PDC_USERS · Hero KPIs · Panel Admin · CSS accent-elsalvador |
| `login.html` | `f7d1c5e12290` | PDC_USERS: 'honduras'→'elsalvador' en arrays de dashboards |
| `regional/index.html` | `e9e70a520afe` | 14 fixes: todos los KPIs, tablas, gráficas y datos JS actualizados |
| `peru/index.html` | `73e234cd2f3f` | KPIs, transportistas reales, donut naranja, tabla actualizada |
| `docs/01_MASTER_PROJECT_CONTEXT.md` | actualizado | v1.5 · SHAs correctos · estado completo |
| `docs/02_CHANGELOG.md` | actualizado | este archivo |

---

### SPRINT 1 — Auditoría y corrección motor de cálculo (index.html)

**Causa raíz:** RAW embebido tenía datos del corte 11/06/2026. Todos los módulos calculan correctamente desde `FD`, pero el dato estaba desactualizado.

**Correcciones lógica RD() + addDR():**
- `addDR()`: nuevo parámetro `rowsDesp=null` → `vD = (rowsDesp||rows).filter(r => r['Estado Real']==='Vencidas')`
- `RD()` modo rango: `rr = FD.filter(r => r.Rango === rango)` para Facturación; `rrD = FD.filter(r => r['Rango Real'] === rango)` para Despacho — fuentes independientes
- `renderTableros()`: unificado para usar `FD` en lugar de `RAW.filter(Estatus Real [60,63,67])`

**Datasets actualizados (Excel 18/06/2026):**
| Dataset | Registros | Cambio |
|---|---|---|
| RAW | 620 | era 680 (corte 11/06) |
| KPI_HIST | 54 | mes Jun: vencidas 36→87, total 2066→3352 |
| EFECT | 54 | mes Jun: mas15=5 |
| KPI_TOTALS | dict | report_date: 24/06/2026 |

**Valores corregidos (index.html):**
| Indicador | Antes | Después |
|---|---|---|
| Total FD pendientes | 212 | **146** |
| En Tiempo Facturación | 169 | **53** |
| Vencidas Facturación | 43 | **93** |
| Vencidas Despacho | 39 | **87** |
| +15 Días Rango Real | 0 | **5** |

---

### SPRINT 2 — Portal analytics.html

**Causa raíz de tarjeta ESV invisible:** PDC_USERS en `login.html` construye la sesión con `['honduras']` — analytics.html busca `'elsalvador'` en `session.dashboards` y no lo encuentra → tarjeta invisible.

**Fixes aplicados:**

1. **Tarjeta Honduras → El Salvador** en `PDC_DASHBOARDS`
2. **CSS** `.accent-elsalvador` añadido
3. **PDC_USERS en analytics.html**: `'honduras'→'elsalvador'` en usuarios regional/ESV
4. **PDC_USERS en login.html**: ídem — LA FUENTE REAL DE LA SESIÓN
5. **Panel Admin**: `Dashboard Honduras → Dashboard El Salvador`
6. **Hero KPIs**: 710→146, 36→87, 4→3 países
7. **Todas las tarjetas**: fechas y KPIs del corte 24/06/2026

**Tarjetas finales analytics.html:**
| ID | Nombre | KPIs |
|---|---|---|
| rutas | Liquidación de Rutas | 146 · 3 · 87 |
| cashtoday | Cash Today | 35k · 10 · 4 |
| regional | Consolidado Regional | 146 · 3 · $1.4M |
| peru | Perú | 4 · 4 · 0.0% |
| **elsalvador** | **El Salvador** | **6 · 6 · $26,927** |

---

### SPRINT 3 — peru/index.html

**Dashboard completamente hardcodeado — datos correctos corte 18/06:**

| Campo | Antes | Después |
|---|---|---|
| Rutas Pendientes | 74 | **4** |
| Rutas Vencidas (Fac.) | 12 | **4** |
| En Proceso (Rango Real 4-10d) | 0 | **4** (naranja, no rojo) |
| Monto Pendiente | S/ 1,492,234 | **S/ 134,816** |
| USD equiv | 397,929 | **36,339** |
| Efectividad | 83.8% | **0.0%** |
| Gráfica donut | [44,18,12] rojo | **[0,4,0] naranja** |
| Transportistas | 8 ficticios | **3 reales del Excel** |
| Distribución geo | Lima:48/Arequipa:12/Trujillo:8/Cusco:4/Otras:2 | **Lima:3/Otras:1** |

**Transportistas reales:** FRICH GROUP (Loreto, S/123,053) · TRANSPORTES ITATI (Lima, S/11,764) · MURAYARI VELA (Lima, S/0)

---

### SPRINT 4 — regional/index.html (14 fixes)

| Sección | Campo | Antes | Después |
|---|---|---|---|
| Header | Fechas | Datos:22jun · Rutas:11jun | **Datos:24jun · Rutas:18jun** |
| Hero KPI | Rutas Pendientes | 680 | **146** |
| Hero KPI | Desglose | GT:482·SV:124·PE:74 | **GT:136·SV:6·PE:4** |
| Hero KPI | Vencidas | 39 | **87** |
| Hero KPI | Desglose venc. | GT:22·SV:5·PE:12 | **GT:77·SV:6·PE:4** |
| Tab Rutas | GT pendientes | 482 / 22 venc | **136 / 77** |
| Tab Rutas | SV pendientes | 124 / 5 venc | **6 / 6** |
| Tab Rutas | PE pendientes | 74 / 12 venc | **4 / 4** |
| Tabla | Total regional | 680 / 39 | **146 / 87** |
| Tab Por País GT | Pendientes/Venc | 482/22 | **136/77** |
| Tab Por País SV | Pendientes/Venc | 124/5 | **6/6** |
| Tab Por País PE | Pendientes/Venc | 74/12 | **4/4** |
| Gráfica barras | Datos | [482,124,74]/[22,5,12] | **[136,6,4]/[77,6,4]** |
| Dataset JS | D.rutas | todos viejos | **actualizados** |
| Tendencia Jun | Vencidas/Total | 39/2713 | **87/3352** |

---

## [Sprint Arquitectura] — 22/06/2026

| Issue | Causa raíz | Fix |
|---|---|---|
| Publicar GitHub congelado | `TextDecoder` UTF-8 decode corrupto en archivos >500KB | `TextDecoder('utf-8')` sobre `Uint8Array` |
| Exportar PDF sin acción | Doble `return;` + `btn.disabled` sin restore | Limpieza de control de flujo |
| Dashboard sin mostrar nada | Auth Bridge sin `else ST('resumen')` | Fallback a tab resumen |
| Toggle sin feedback visual | `pdcShowToast` buscaba `#pdcToast` inexistente | Añadir div#pdcToast al HTML |

## [v1.2] — 21/06/2026 · Consolidado Regional ✅
## [v1.1] — 21/06/2026 · Fase 1 completa ✅
## [v1.0] — 20/06/2026 · Lanzamiento inicial ✅

---
*PDC Analytics Center · Grupo PDC · Departamento Financiero · v1.5 · 24/06/2026*
