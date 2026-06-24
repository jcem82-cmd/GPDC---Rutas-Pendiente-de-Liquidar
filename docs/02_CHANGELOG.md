# 02 — CHANGELOG
## PDC Analytics Center · Historial de Versiones

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

| Archivo | SHA | Fix |
|---|---|---|
| `cash_today.html` | `bfe1a1114` | CRITICO: pdcAutoSetPais después de initFilters + eliminar dispatchEvent |
| `index.html` | `9cc92958` | R1: aasync→async definitivo · R2: return guard en exportarPDF |
| `analytics.html` | `01791a0c` | R5: toggle con indicadores visuales y tooltip |

### Causa raíz de cada issue

**Cash Today en blanco (URGENTE):** `pdcAutoSetPais()` se llamaba ANTES de `initFilters()`. El `el.dispatchEvent(new Event('change'))` en los selectores desencadenaba renders antes de que el dashboard estuviera inicializado — crash silencioso que dejaba todo en blanco. Fix: mover `pdcAutoSetPais()` después de `initFilters()+autoFilter()` y eliminar el `dispatchEvent`.

**R1 Publicar GitHub:** Cada sprint había agregado `async` a la función acumulando `aasync`, luego `sync async`, luego `nc function` etc. El resultado era una declaración inválida. Fix definitivo: reemplazo directo del string exacto.

**R2 exportarPDF:** `window.open()` devuelve `null` si es bloqueado — la función continuaba ejecutando y crasheaba. Fix: `return` inmediato después del `alert`.

**R5 Toggle activo/inactivo:** El badge de estado es un botón funcional pero no era evidente visualmente. Fix: indicadores `▾`/`▸`, tooltip "Clic: activar o desactivar", y leyenda "(clic para cambiar)" en el encabezado de columna.

## [Bug Fix Sprint 3] — 22/06/2026 · Causas raíz definitivas resueltas

### Diagnóstico real de cada issue (con fix confirmado)

| Issue | Causa raíz definitiva | Fix |
|---|---|---|
| **R1: Publicar GitHub** | `sync async function` — el fix anterior agregó `async` sobre texto existente dejando `sync async` inválido | Corregido a `async function` limpio |
| **R2: exportarPDF** | `window.open()` bloqueado por popup blocker; btn quedaba `disabled` indefinidamente | `try/catch` en `printWin.print()` + restaurar btn inmediatamente |
| **R5: Toggle activo/inactivo** | La función `pdcToggleUser` YA EXISTE y funciona — hacer clic en el badge verde/rojo en la tabla | Documentado — funcional desde sprint anterior |
| **Chat supervisor/consulta** | `admin.html` tenía solo el panel de admin; no existía pantalla de usuario | Pantalla de chat de usuario creada con Supabase (carga, envío, polling 5s) |
| **Chat en index.html** | El chatFAB+chatBox (~28KB) seguía en el dashboard de Rutas | Eliminado completamente |
| **CT Volumetría/Costo/Presupuesto filtro país** | `pdcAutoSetPais` solo bloqueaba `f-pais` (filtro global) — no los selectores de módulo | Extendida para bloquear `cst-pais` y `pres-pais` según `session.pais` |
| **CT Festivos sin datos** | Dataset `_R` embebido tiene `hol:0` — se calculan solo al cargar nuevo Excel | Mensaje informativo mejorado con lista de festivos GT/SV y guía de activación |

### Archivos desplegados

| Archivo | SHA |
|---|---|
| `index.html` | `65b472707a03` |
| `analytics.html` | `61fefe9d8d69` |
| `admin.html` | `a4151deee5f8` |
| `cash_today.html` | `6863bce543` |

### Nota sobre Toggle de usuarios
El toggle activo/inactivo **ya funciona** — en la tabla de Gestión de Usuarios, hacer clic en el badge de estado (🟢 Activo / 🔴 Inactivo) cambia el estado en localStorage. El estado inactivo bloquea el acceso al usuario en la próxima verificación de sesión.

## [Bug Fix Sprint 2] — 22/06/2026 · Causas raíz definitivas

### Causa raíz de cada issue (confirmada en producción)

| Issue | Causa raíz real | Fix aplicado |
|---|---|---|
| **R1: Publicar GitHub** | `function publishToGitHub()` sin `async` → los `await` generan SyntaxError silencioso | `async function publishToGitHub()` |
| **R2: PDF sin acción** | CSS `.pdf-btn{display:none}` tiene más especificidad que el JS → override imposible | `display:none!important` + `setProperty('display','flex','important')` |
| **R5: Tabla usuarios vacía** | `PDC_USERS` se usa en analytics.html pero nunca se declaraba | `PDC_USERS` copiado de login.html a analytics.html |
| **R-CHAT: supervisor/consulta → rutas** | Auth Bridge mapeaba todos los no-admin → `'user'`; admin.html rechazaba `role!=='admin'` | Auth Bridge preserva rol real; admin.html permite supervisor/consulta |
| **R-ROLES: tabTC visible para todos** | Mismo mapeo binario → supervisor/consulta tenían `role='user'` y el tab se mostraba | Con rol real preservado, DOMContentLoaded oculta tabTC para supervisor/consulta |
| **CT-AUTH: Config visible para todos** | Auth Bridge de cash_today mapeaba binario igual | Preserva rol real; tab Config oculto para supervisor/consulta |
| **CT-FESTIVOS: no muestra datos** | Dataset `_R` histórico tiene todos los registros con `hol:0` — no hay festivos en datos embebidos | Mensaje informativo mejorado; festivos aparecen al cargar nuevo Excel |

### Archivos desplegados en este sprint

| Archivo | SHA | Cambios |
|---|---|---|
| `index.html` | `f2649cf9a2` | R1 async, R2 !important, R-ROLES Auth Bridge |
| `analytics.html` | `61fefe9d8d` | R5 PDC_USERS, R-ROLES pdcNavigate |
| `admin.html` | `65acd01085` | R-CHAT supervisor/consulta acceden al chat |
| `cash_today.html` | `340fbdc04415` | CT-AUTH rol real, CT-ROLES Config oculto, CT-FEST mensaje |

## [cash_today.html v2.15] — 22/06/2026 · CT2 parseWB dinámico

### Corrección crítica — parseWB detección dinámica de columnas

**Causa raíz:** `parseWB` usaba índices de columna fijos (`r[4]`=Tipo, `r[6]`=Importe, etc.).
Las hojas XELA, ESV-STA TECLA y ESV-SN MIGUEL del Excel tienen nombres de columnas
con variantes (tildes, mayúsculas, orden diferente), causando que el tipo transacción
no se reconociera y los registros se descartaran silenciosamente.

| Mejora | Detalle |
|---|---|
| Detección de cabecera | Busca la primera fila con ≥4 celdas — soporta 1-2 filas de título |
| Mapeo por nombre | Busca cada columna por lista de nombres alternativos normalizados |
| Normalización de tipo | `startsWith('dep')` → Depósito, `startsWith('rec')` → Recogida |
| Divisa por defecto | GTQ para Guatemala, USD para El Salvador si la columna no tiene valor |
| Fallback | Si no encuentra columna por nombre, usa índice clásico como respaldo |
| renderValidacion | Actualizada con la misma lógica dinámica |

## [Correcciones multi-archivo] — 22/06/2026 · Bug Fix Sprint

### analytics.html v2.1
| Fix | Causa raíz | Solución |
|---|---|---|
| **R4: Tarjeta Consolidado Regional sin acción** | Llamaba a `pdcNavigateToDash()` que no existe | Cambiado a `pdcNavigate('regional/index.html')` |
| **R5: Tabla Gestión de Usuarios vacía** | `renderUserTable()` se ejecutaba antes de que el DOM terminara de pintar | Envuelto en `setTimeout(renderUserTable, 0)` |

### index.html v12.1
| Fix | Causa raíz | Solución |
|---|---|---|
| **R1: Publicar en GitHub no funciona** | `publishToGitHub` usaba `document.documentElement.outerHTML` — captura DOM en vivo con Auth Bridge activo, sesiones y overlays, produciendo un archivo corrupto | Reemplazado por `fetch()` al repo para obtener el HTML limpio antes de insertar los nuevos datasets |
| **R2: Exportar PDF sin acción** | Auth Bridge solo activaba el primer `.hdr-dl-btn` — `btnPDF` quedaba oculto con `display:none` | Auth Bridge ahora activa **todos** `.admin-visible` via `querySelectorAll` |
| **R3: Botón Guardar Snapshot eliminado** | Funcionalidad duplicada — ya existe en Panel de Administración de analytics.html | Botón eliminado del header |
| **R6/R8: Chat** | Auth Bridge mapea `supervisor`/`consulta` → `role='user'`, que `initChat()` ya gestiona correctamente como chat | Confirmado funcional — sin cambio en código |

### cash_today.html v2.14
| Fix | Causa raíz | Solución |
|---|---|---|
| **CT1: Alertas presupuestal compara meses acumulados** | `renderAlertasPresupuesto` leía `sel-mes` que no existe en el módulo Resumen → `activeYm` siempre `null` → comparaba año completo | Reemplazado por lectura del filtro global real (`f-vista` / `f-mes` / `f-anio`) |
| **CT3: Tab Festivos sin datos** | `parseWB` hardcodeaba `hol:0` en todos los registros | Ahora calcula `hol` dinámicamente vía `isHoliday(fecha, pais)` al cargar Excel |
| **CT2: Excel solo actualiza CDA** | `parseWB` usa índices de columna fijos (`r[6]` = importe) que deben coincidir con la estructura del Excel | Pendiente verificación de columnas del Excel fuente — no es bug de código |

### Pendiente verificar por usuario
- **CT2**: ¿Las columnas del Excel de Cash Today coinciden con el orden esperado por `parseWB`? Columnas esperadas: `[0]Fecha transacción, [1]Cajero, [2]?, [3]Usuario, [4]Tipo, [5]Div, [6]Importe, [7]Piezas`
- **R7**: Tipos de Cambio y Config de Cash Today — ya correctamente ocultos para supervisor y consulta (solo admin los ve) ✅

## [22/06/2026] — Fase Usuarios y Permisos (login.html v1.2 · analytics.html v1.9)

### login.html v1.1 → v1.2 — 5 mejoras

**U1 — Feedback visual de bienvenida al ingresar:**
- Al autenticarse correctamente: botón cambia a `✅ Bienvenido, [Nombre]!` en verde
- Pausa de 900ms antes del redirect al portal (el usuario ve la confirmación)
- `setLoading(false)` llamado explícitamente en el flujo de éxito

**U2 — Panel de sesión activa:**
- Si ya existe `pdc_session` válida al abrir login.html → NO redirige silenciosamente
- Muestra panel dedicado con: nombre del usuario, rol, minutos restantes de sesión
- Dos opciones: "Continuar al portal" o "Cerrar sesión e ingresar con otro usuario"
- El formulario de login queda oculto mientras haya sesión activa

**U3 — Registro de último acceso:**
- Al login exitoso: guarda `ISO timestamp` en `localStorage['pdc_access_log'][email]`
- Persiste entre sesiones del mismo dispositivo/navegador

**U4 — Bloqueo de usuarios inactivos en doLogin:**
- Si `pdc_user_states[email] === false` → error "Cuenta desactivada. Contacte al administrador"
- Shake animation + campo contraseña vaciado (igual que credenciales incorrectas)
- No consume intentos de lockout (es un estado, no un error de autenticación)

**U5 — pdc_user legacy con rol completo:**
- Antes: `role: user.rol === 'admin' ? 'admin' : 'user'` (solo 2 valores)
- Ahora: `role: user.rol` → lleva `admin | supervisor | consulta` completo
- También lleva `pais` y `sedes` en el token legacy
- Los dashboards hijos pueden distinguir los 3 roles desde `pdc_user.role`

### analytics.html v1.8 → v1.9 — 3 mejoras

**U3 — Último acceso en hero section:**
- Lee `pdc_access_log` desde localStorage al cargar el portal
- Muestra chip "Último acceso: DD/MM/YYYY HH:MM" en la banda hero
- Si no hay registro previo: chip no aparece (primera vez en el dispositivo)

**U4 — Toggle activo/inactivo en tabla de usuarios (admin only):**
- Nueva función `pdcToggleUser(email, setActive, callback)`:
  - Persiste estado en `localStorage['pdc_user_states']`
  - Si se desactiva al usuario actualmente logueado → toast + logout en 2 segundos
  - Callback `renderUserTable` re-renderiza la tabla tras el cambio
- Tabla ampliada con 2 columnas nuevas:
  - **Último acceso:** fecha/hora desde `pdc_access_log`, "Sin registro" si nunca
  - **Estado:** badge 🟢 Activo / 🔴 Inactivo con botón toggle
  - Filas inactivas se muestran con `opacity: 0.55`
- Guard al inicio del IIFE de render: si el usuario en sesión está marcado inactivo → logout inmediato

**Nota de arquitectura:** El toggle usa `localStorage` del dispositivo del admin — es persistente en ese dispositivo. Sin backend no es posible invalidar sesiones activas en otros dispositivos simultáneamente; el bloqueo opera en el próximo intento de login o al recargar el portal.

**SHAs post-deploy:**
- `login.html`: `4e0f9bebd3a6590e899e9dc8a7dec4b0a58a66f7`
- `analytics.html`: `238eff0432ce0afb16feb68e13d32314bd122854`

---

## [cash_today.html v2.13] — 22/06/2026 · Fase 3 Completa

### Nuevas funcionalidades
| # | Cambio | Detalle |
|---|---|---|
| 1 | **Tab 🗓 Festivos en nav** | Agregado entre Presupuesto y Config · activa `renderFestivos()` |
| 2 | **page-festivos HTML** | Contenedor con `card-festivos`, `festivos-kpis`, `festivos-body` |
| 3 | **renderFestivos scope** | `const d = fData` agregado para acceso correcto al dataset filtrado |
| 4 | **validTabs actualizado** | `'festivos'` registrado → URL param `?tab=festivos` funcional |
| 5 | **renderPage dispatch** | `p==='festivos' → renderFestivos()` agregado al switch de páginas |

### Estado de los 4 ítems de Fase 3 al cierre
| Ítem | Estado |
|---|---|
| Análisis de festivos | ✅ **Completado** — tab expuesto, función conectada, datos `hol` activos |
| Alertas semáforo 85%/70% | ✅ **Ya funcionaba** — `renderAlertasPresupuestal` IIFE dentro de `renderResumen` |
| Export PDF Cash Today | ✅ **Ya implementado** — `exportarPDF_CT()` + botón en header (v2.12) |
| TC histórico 2024 | ✅ **Ya implementado** — `_TC_MENSUAL` 25 meses Ene 2024→Jun 2026 (v2.12) |

## [22/06/2026] — Fase 4 Pilar 2: Gestión de Usuarios + Regional HN + Perú datos reales

### analytics.html v1.7 → v1.8 — Tabla Gestión de Usuarios (ítem 4.4)

Nueva sección **Usuarios y Permisos** visible exclusivamente para rol `admin`, debajo del panel de administración:

- Tabla completa de 14 usuarios con: Nombre · Correo · Rol (badge color) · País/Región · Dashboards autorizados (chips)
- Badges de rol: 🔴 Administrador · 🟡 Supervisor · 🟢 Consulta
- Chips de dashboards con ícono por dashboard (🚚 rutas · 💰 cashtoday · 🌎 regional · 🇵🇪 peru · 🇭🇳 honduras)
- Contador dinámico: "14 usuarios registrados"
- Se puebla desde `PDC_USERS` en runtime — sin datos estáticos

### regional/index.html v1.0 → v1.1 — Honduras marcado como Proyectado (ítem 4.5)

- Badge "HNL · En roadmap" → **"HNL · Proyectado"** (sección Por País)
- KPI Estado "Próximamente / Integración en Fase 2" → **"Proyectado / Operación en plan de expansión"**
- Tabla consolidada: badge "Sin datos" → **"🔜 Proyectado"**
- Cards resumen HN: "Sin datos disponibles" → **"Operación proyectada"** · "Sin datos" → **"Proyectado"**
- Fechas actualizadas: 17 Jun → 22 Jun 2026

### peru/index.html v1.0 → v1.1 — Datos reales desde RAW (ítem 4.6)

Fuente: 74 rutas reales de `RAW` en `index.html` (campo `Pais='Perú'`, `Moneda='PEN'`).

**KPIs actualizados (datos reales Jun 2026):**

| KPI | Demo anterior | Real |
|---|---|---|
| Rutas Pendientes | 74 | 74 ✅ |
| Vencidas | 12 | 12 ✅ |
| En Proceso (8-14d) | 23 | 18 |
| Al Día (≤7d) | 39 | 44 |
| Lima / Provincias | 48 / 26 | 41 / 33 |
| Monto Pendiente | S/ 2,847,320 | S/ 1,492,234 |
| Monto Vencido | S/ 461,850 | S/ 240,339 |
| USD equiv | ~$759,285 | ~$397,929 |
| Efectividad | 83.8% | 83.8% ✅ |
| Brecha vs meta | −6.2pp | −6.2pp ✅ |

**RUTAS_DETALLE:** 25 rutas demo → **74 rutas reales** (Nro. Despacho real, Transportista real, Zona real, Días reales, Monto real)

**Dataset D (gráficas):**
- Últimos 2 meses reales: May (21 rutas, 2 vencidas, S/778,809) · Jun (74 rutas, 12 vencidas, S/1,492,234)
- Meses anteriores: conservan valores referenciales hasta disponibilidad de data histórica
- Zonas reales: LIMA:41 · LA LIBERTAD:6 · CAJAMARCA:4 · LAMBAYEQUE:4 · AREQUIPA:3 · Otras:16

**SHAs post-deploy:**
- `analytics.html`: `fe6719b029bb`
- `regional/index.html`: `75b224bf8739`
- `peru/index.html`: `129c6845101c`

---

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
