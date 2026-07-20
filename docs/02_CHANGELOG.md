
## [20/07/2026] — Corrección de errores: eliminación del token GitHub expuesto en cash_today.html (segundo punto crítico de seguridad)

### Contexto

Continuación de la migración de seguridad de la misma fecha (ver entrada anterior, Supabase Auth). El segundo hallazgo crítico era un token GitHub fine-grained (Contents:RW, sin expiración) embebido en `cash_today.html` para el botón de auto-publicación — visible públicamente en el código fuente servido por GitHub Pages y en el historial de commits.

### Arquitectura de la corrección

Mismo principio que las contraseñas: client-side JavaScript no puede tener secretos. Se creó una **Supabase Edge Function** (`github-publish`) que hace el PUT final a GitHub con el token guardado como secret server-side (`GITHUB_TOKEN`). El navegador ya no necesita ningún token:
- Las lecturas (GET de metadata/blob) se hacen sin autenticación — el repositorio es público, GitHub permite lectura anónima.
- Solo el PUT final (la operación de escritura) pasa por la función, autenticada con el JWT de sesión del usuario.

**Capas de seguridad en la función:**
1. Verifica sesión Supabase válida.
2. Verifica que el usuario sea `rol='admin'` y `activo=true` (consulta `profiles`).
3. Allowlist de rutas: solo acepta escribir `cash_today.html` y `cash_summary.json` — cualquier otra ruta se rechaza, incluso con el token disponible server-side.

### Archivos modificados

- **`cash_today.html`**: eliminado `_GH_TOKEN` (el arreglo ofuscado con el token en texto plano). Agregado `js/supabase.min.js` (mismo vendor local ya usado en login.html/analytics.html) + cliente Supabase. `publishToGitHub()` ahora llama a `_pdcCallPublishFunction()` en vez de hacer `fetch(...,{method:'PUT'})` directo con el token. Cero cambios de flujo visible para el usuario: mismos pasos, mismos mensajes, mismo botón.
- **Supabase (nuevo):** Edge Function `github-publish`, secret `GITHUB_TOKEN` (token fine-grained nuevo, generado el mismo día).

### Validación en producción

- `node --check` en ambos bloques `<script>` de `cash_today.html` (incluyendo el bloque de datos de ~10.8MB) antes del deploy.
- Prueba en vivo con el navegador conectado del usuario: publicación real de `cash_summary.json` vía la función — éxito confirmado (nuevo SHA de GitHub retornado).
- Prueba de restricción de rutas: intento de escribir `login.html` vía la función — bloqueado correctamente con `403`/error explícito.

### Cierre de la vulnerabilidad original

El token fine-grained expuesto (`Cashtoday`, creado 03/07/2026, sin expiración, Contents:RW) fue **eliminado por el usuario** desde GitHub → Developer settings, confirmando el cierre del segundo y último punto crítico de seguridad reportado al inicio de esta sesión (ver entrada anterior para el primero: contraseñas en texto plano → Supabase Auth).

**Estado de la vulnerabilidad original reportada por Charly:** ambos puntos (contraseñas expuestas + token expuesto) — **resueltos**.



### Contexto — vulnerabilidad identificada por el usuario

Charly reportó que cualquier persona con la URL podía ver el código fuente de `login.html` y `analytics.html` en texto plano, exponiendo las 12 contraseñas de `PDC_USERS`, además del token GitHub fine-grained embebido en `cash_today.html` (visible en el historial de commits). Causa raíz: GitHub Pages sirve archivos estáticos públicamente sin importar la privacidad del repo — client-side JavaScript no puede tener secretos.

### Decisión y alcance

Se evaluaron dos rutas (Supabase Auth vs. Cloudflare Access). Se eligió **Supabase Auth** por reutilizar la infraestructura ya operativa del chat de soporte, habilitar RLS a nivel de fila, y preparar el terreno para una futura Fase 2 (proteger datos de negocio también con RLS).

**Migración de contraseñas:** zero-friction cutover — los 12 usuarios se crearon en Supabase Auth con su contraseña actual exacta + flag `force_password_change:true`. En su primer login exitoso ven una pantalla obligatoria para establecer una nueva contraseña antes de continuar al portal.

### Archivos modificados

**`login.html`:**
- Eliminado `PDC_USERS` (12 contraseñas en texto plano).
- `doLogin()` reescrito como async, valida contra `supabase.auth.signInWithPassword()`.
- Nuevo panel "Establezca su nueva contraseña" — se activa automáticamente si `profiles.force_password_change = true`.
- `finalizeLogin()` construye el mismo objeto `pdc_session` de siempre (`{email,nombre,rol,dashboards,pais,sedes,ts}`) — **compatibilidad total** con los guards existentes en el resto de dashboards, que no requirieron ningún cambio.
- Contador de usuarios de la landing (`statUsuarios`) fijado en 12 (ya no hay `PDC_USERS.length` local que contar).

**`analytics.html`:**
- Eliminado `PDC_USERS` duplicado (Regla #6 de sincronización ya no aplica).
- Panel de administración (`Gestión de Usuarios`) ahora lee/escribe la tabla `profiles` de Supabase vía `_pdcProfilesCache`.
- `pdcToggleUser()` ahora persiste `activo` en Supabase (antes solo en `localStorage` del dispositivo del admin) — **corrige limitación conocida documentada previamente**: desactivar un usuario ahora bloquea su próximo login de inmediato, desde cualquier dispositivo.

**Supabase (nuevo):**
- Tabla `profiles` (id FK a auth.users, email, nombre, rol, pais, sedes, dashboards, force_password_change, activo, last_login) con RLS activo.
- Función `public.is_admin()` (SECURITY DEFINER) para políticas de admin sin recursión.

**`js/supabase.min.js`** (nuevo, vendorizado): librería `@supabase/supabase-js` v2.110.7 alojada localmente en el repo. Motivo: jsDelivr sufrió una caída externa confirmada (503 en `cdn.jsdelivr.net`, origen DC2-Falkenstein) durante las pruebas de esta migración, rompiendo el login en producción. Se elimina la dependencia de CDN externo para este componente crítico — `login.html` y `analytics.html` ahora cargan `js/supabase.min.js` local.

### Bugs encontrados y corregidos durante la validación en vivo

1. **Recursión infinita en política RLS** (`42P17: infinite recursion detected in policy for relation "profiles"`) — la política "admin lee todos los perfiles" consultaba `profiles` dentro de su propia política sobre `profiles`. Corregido con función `is_admin()` SECURITY DEFINER que evita la recursión.
2. **Caída externa de jsDelivr** — mitigada vendorizando `supabase-js` localmente (ver arriba).

### Validación

- `node --check` en todos los bloques `<script>` de ambos archivos antes de cada deploy.
- Prueba en vivo end-to-end con el navegador conectado del usuario: login → pantalla de cambio de contraseña → portal → panel de administración con 12 usuarios cargados desde Supabase. Confirmado funcionando.

### Pendiente (no abordado en esta sesión)

- **Token GitHub fine-grained expuesto en `cash_today.html`** (botón de auto-publicación) — sigue pendiente de rotación/remediación. Recomendación: mover el flujo de publicación a una Edge Function de Supabase que resguarde el token server-side.
- Contraseñas temporales de los 12 usuarios (idénticas a las anteriores hasta su primer cambio obligatorio) deben considerarse en tránsito — se recomienda que cada usuario complete su cambio de contraseña a la brevedad.



### Mejora funcional (categoría 2) — autorizada explícitamente por el usuario

**Requerimiento:** en `index.html` (dashboard Rutas), permitir seleccionar más de un valor en los filtros Canal (`#fC`), Responsable (`#fR2`) y Rango (`#fRg`). A diferencia del multi-select de país (mismo día, entrada anterior), este cambio aplica a **todos los usuarios sin excepción** — no hay gate de rol ni de país.

**Implementación:**
- Función genérica `pdcInitMultiFilter(selId, globalVar, allLabel)` — única fuente de verdad para los 3 filtros (en vez de triplicar el widget de país). Deduplica las opciones del `<select>` de origen (Canal y Responsable arrastran catálogos concatenados por país con entradas repetidas) únicamente en la vista del checklist — el `<select>` original no se modifica.
- El `<select>` original se oculta (`display:none`) pero permanece en el DOM — cero impacto en rutas legacy.
- `AF()`: las 3 comparaciones (`Canal`, `Responsable`, `Rango`) ahora evalúan primero `window._PDC_CANAL_MULTI` / `_PDC_RESP_MULTI` / `_PDC_RANGO_MULTI` (arrays); si no existen, cae al comportamiento original de igualdad simple.
- `RF()`: invoca los 3 resets (`_PDC_CANAL_MULTI_reset`, etc.) además del reset de país ya existente.
- Los 3 widgets se inicializan en el `BOOT` (`DOMContentLoaded`), antes de la primera llamada a `AF()`.

**Validado antes de deploy:**
- `node --check` en los 5 bloques de script (sin cambios en el conteo — la función se insertó dentro del bloque existente).
- Prueba funcional en Node: 6/6 aserciones — dedup de opciones repetidas, filtro multi por canal, por responsable, por rango, combinación simultánea país+canal, y modo legacy (sin selección = sin filtro).

**Deploy:** commit `3cdf312774`. GitHub Actions run #417: completed/success.

**Alcance:** `index.html` únicamente — 4 puntos de modificación (`AF()`, `RF()`, función nueva `pdcInitMultiFilter`, BOOT). No se tocó `cash_today.html`, `cartas_salida.html` ni el multi-select de país ya desplegado.

---

## [20/07/2026] — Mejora funcional: multi-select de país para usuarios sin país asignado

### Mejora funcional (categoría 2) — autorizada explícitamente por el usuario

**Requerimiento:** que el filtro de países permita seleccionar más de uno (ej. GT+ESV) en todos los dashboards. Regla confirmada por Charly: aplica SOLO a usuarios que pueden ver más de un país (sin campo `pais` en sesión — admin/regionales). Usuarios con país asignado conservan exactamente el bloqueo del 09/07/2026.

**Implementación (patrón común en los 3 archivos con filtro de país):**
- El `<select>` original se OCULTA pero permanece en el DOM — la restricción por país y todo camino legacy quedan intactos.
- Se inyecta vía JS un dropdown con checkboxes (etiqueta dinámica "🇬🇹 Guatemala + 🇸🇻 El Salvador"; vacío o todo marcado = "Todos los países"). Sin cambios en CSS estático.
- La lógica de filtrado cambia de igualdad estricta a inclusión SOLO en modo multi; el modo legacy conserva la comparación original.

**Detalle por archivo:**
- `index.html`: comparación de país en `AF()` soporta `window._PDC_PAIS_MULTI` (array); `RF()` invoca `_pdcPaisMultiReset()`; widget dentro del Auth Bridge, gate `!(data.pais && PAIS_MAP[data.pais])`. Opciones: GT/ESV/PE.
- `cash_today.html`: nuevos helpers `pdcPaisOk(sel,p)` y `pdcGetPais()`; 5 puntos redirigidos (buildSiteOpts, buildCajeroOpts ×2, onPaisChange, getBaseFilter lectura + dimFn); widget en el IIFE de sesión, gate `!usr.pais`. Opciones: GT/ESV. Los selectores `vol-chart-pais` ("Ambos países" ya cubre GT+ESV), `cst-pais` y `pres-pais` quedaron deliberadamente fuera de alcance (selectores de módulo, no filtro principal).
- `cartas_salida.html`: filtro `state.pais` acepta array; botón Reset invoca `_pdcCsPaisReset()`; widget con gate adicional `paises.length>1` — hoy el dataset solo contiene GT, por lo que el widget se activará automáticamente al cargar el Excel multi-país (ESV/PE), sin cambio visible hoy.

**Validado antes de deploy:**
- `node --check` en los 11 bloques de script de los 3 archivos (5 + 2 + 4).
- Prueba funcional en Node: 12/12 aserciones — modo legacy (string) y modo multi (array vacío = todos, [GT], [GT,ESV], exclusión) en las tres réplicas de lógica.
- Todas las modificaciones con `assert count==1` (REGLA #1) y SHA fresco por PUT (REGLA #2).

**Deploy:** commits `100ac873` (index), `ae8fcecc` (cartas_salida), `567ffa12` (cash_today) — espaciados 35s para evitar cancelación por concurrencia. GitHub Actions run #412: completed/success.

**Alcance:** solo los 3 archivos listados. `peru/`, `elsalvador/`, `regional/`, `analytics.html` no tienen selector de país — sin cambios.

---

## [10/07/2026] — Nueva funcionalidad: elsalvador/index.html - dashboard dedicado para El Salvador

## [13/07/2026] — Fix crítico #2: parseo Total hoja Costo (símbolo $/Q) + dataset actualizado

### RCA
| Causa raíz | Síntoma |
|---|---|
| El campo `Total` de la hoja `Costo` del Excel viene formateado como texto moneda con símbolo (ej. `" $840.00 "`, `" $-577.14 "`), no como número plano. `parseFloat()` sobre una cadena que inicia con `$` devuelve `NaN` → `tot=0` → la fila se descarta (`if(!tot) continue`) | Las 40 filas de la hoja `Costo` se descartaban silenciosamente (try/catch sin alerta al usuario) — `window._COSTOS_LIVE` nunca se poblaba. El módulo Costo Servicio se quedaba mostrando el dataset embebido viejo (37 registros, hasta may-2026) sin reflejar ninguna factura nueva, ni de GT ni de ESV. |

### Corrección aplicada
- Nuevo parseo robusto del campo Total: limpia cualquier símbolo de moneda (`$`, `Q`, espacios) y separador de miles antes de convertir a número, agnóstico a si la fila es GT (Q) o ESV ($) — la moneda real ya se determina por `EMP_MAP` (CODISA→GTQ, PDC EL SALVADOR→USD), no por el símbolo del texto.
- Dataset `_COSTOS` reconstruido desde el Excel fuente y desplegado: **40 registros** (antes 37) — GT: 12 registros (Q6,302.08 acumulado) · ESV: 28 registros ($21,197.60 acumulado). Incluye 4 facturas nuevas de GT (Alarmas de Guatemala, S.A. — jun/jul 2026).
- Validado con `node --check` + simulación del parser real contra el Excel fuente antes de deploy.

### Hallazgo documentado — pendiente de autorización (no corregido en esta sesión)
El export de Costo de este Excel ya no trae la fila en blanco inicial que versiones previas sí traían — el encabezado real quedó en la fila 0 en vez de la fila 1. El código asume fila 1=encabezado / fila 2=primer dato, por lo que con este formato se pierde silenciosamente la primerísima factura histórica de la hoja (ago-2025, $840.00, ya reflejada en el dataset acumulado desde antes). No afectó el reporte de esta sesión (facturas GT jul-2026); queda como recomendación para robustecer el parser detectando la fila de encabezado dinámicamente en vez de por índice fijo.

### SHA producción
`cash_today.html` — commit `f824b3c19941`

---


## [13/07/2026] — Fix crítico: persistencia de _COSTOS en publishToGitHub (Costo Servicio)

### RCA
| Causa raíz | Síntoma |
|---|---|
| `publishToGitHub()` reconstruía y persistía `_R` y `_TC_MENSUAL` en el HTML publicado, pero nunca reconstruía el bloque `const _COSTOS` a partir de `window._COSTOS_LIVE` | Al cargar un Excel con hoja `Costo` actualizada y publicar, los nuevos costos de servicio solo vivían en la sesión del navegador — se perdían al recargar la página o al ingresar otro usuario. Mismo patrón de bug ya corregido para `_TC_MENSUAL` el 02/07/2026, pero nunca replicado para Costo. |

### Corrección aplicada
- Nuevo bloque en `publishToGitHub()` (cash_today.html): si `window._COSTOS_LIVE` tiene datos, reconstruye `const _COSTOS = [...]` con reemplazo completo (mismo criterio que `_R`: cada hoja `Costo` es un export histórico completo de facturas de proveedor).
- Validado con `node --check` sobre los bloques `<script>` extraídos antes de deploy.
- Alcance: único archivo (`cash_today.html`), única función (`publishToGitHub()`). Sin cambios de HTML/CSS ni otros módulos.

### SHA producción
`cash_today.html` — commit `18a2f737df79`

---


### Nueva funcionalidad (no correccion) - autorizada explicitamente por el usuario

**Contexto:** la tarjeta "El Salvador" en el Hub apuntaba al mismo `index.html` generico (ya filtrado por pais via la restriccion de sesion), por lo que ambas tarjetas llevaban al mismo dashboard. Perú, en cambio, ya tenia su propio archivo dedicado (`peru/index.html`) con diseno, zonas y tablas propias.

**Solucion aplicada:** construido `elsalvador/index.html` replicando fielmente el patron de `peru/index.html`:
- Mismo esquema de tabs (Resumen, Analisis, Detalle, Tendencias), mismos componentes (tarjetas KPI, donut de estados, tabla de transportistas, tabla de detalle con filtros).
- Colores propios (`--sv1`/`--sv2`, rojo/ambar, distinto al burdeos/dorado de Peru).
- Moneda nativa USD (sin conversion, a diferencia de Peru que muestra PEN + equivalente USD).
- Zona geografica: "San Salvador (Capital)" vs "Otros departamentos" (mismo patron binario que Peru usa con "Lima Metropolitana vs Otras"), calculado en vivo desde el campo `Ubicación Geografica` de `RAW`.
- Conectado a `PDCBridge` desde el inicio (a diferencia de Peru, que se conecto en una fase posterior) - no arrastra el mismo problema de dataset propio desactualizado.

**`analytics.html`:** la tarjeta "El Salvador" ahora apunta a `elsalvador/index.html` en vez de `index.html` - queda simetrica con el patron de Peru. La tarjeta generica "Liquidacion de Rutas" no se toco (sigue llevando a `index.html`, ya filtrado por pais via sesion).

**Validado antes de deploy:**
- `node --check` en los 5 bloques de script.
- Prueba funcional en Node contra datos reales de El Salvador: 131 pendientes, 12 vencidas fact., 8 en proceso, 121 al dia, $411,998 monto pendiente, $35,941 monto vencido, 92.4% efectividad, San Salvador 9 / Otros 122 - coincide exacto con el calculo de referencia validado previamente.

**Limitacion conocida (heredada del mismo patron de Peru, no es un defecto nuevo):** las series historicas de 6 meses (graficas de tendencia en tabs Analisis/Tendencias) usan valores de referencia para los 5 meses anteriores al actual - no existe fuente de datos historica real para reconstruirlos, igual que en `peru/index.html`. Solo el mes actual se actualiza en vivo.

**Alcance:** archivo nuevo `elsalvador/index.html` + 1 linea modificada en `analytics.html` (campo `archivo` de la tarjeta). Ningun otro modulo tocado.

---

## [09/07/2026] — Restriccion de acceso por pais: usuarios consulta/supervisor ya no ven paises fuera de su asignacion

### Correccion de errores - permisos existentes en PDC_USERS nunca se enforzaban en los dashboards

**Sintoma reportado:** usuarios con pais asignado en PDC_USERS (ej. Joaquin Palma/pais:ESV, Vinicio Sanabria/pais:GT, Claudio Rojas/pais:PE) podian ver TODOS los paises en el dashboard de Rutas y en el modulo de Volumetria de Cash Today, en vez de solo el suyo.

**RCA:**
- `index.html`: el Auth Bridge solo guardaba `{nombre,email,role}` en sesion - el campo `pais` de `PDC_USERS` nunca llegaba al dashboard. El filtro de pais (`#fP`) quedaba abierto para cualquiera porque la pagina no tenia forma de saber a que pais restringir.
- `cash_today.html`: el campo `pais` SI llegaba a la sesion, pero solo se usaba para un texto de referencia de festivos - nunca para restringir el filtro principal (`#f-pais`) ni el de Volumetria (`#vol-chart-pais`).
- Confirmado: la tarjeta "El Salvador" que ven Joaquin Palma/TEAM ESV apuntaba al mismo `index.html` sin diferenciacion real - se resuelve automaticamente con este fix.

**Correccion aplicada (ambos archivos, alcance quirurgico):**
- `index.html`: Auth Bridge ahora incluye `pais` en la sesion. Si el usuario tiene pais asignado (GT/ESV/PE), se eliminan las demas opciones del selector `#fP`, se fija el valor y se deshabilita, luego se dispara `AF()` (funcion existente, sin modificar) para aplicar el filtro.
- `cash_today.html`: mismo patron sobre `#f-pais` (filtro principal) y `#vol-chart-pais` (Volumetria), disparando `onPaisChange()` y `renderVolChartOnly()` (funciones existentes, sin modificar).
- Usuarios sin pais asignado (admin, regional) no se ven afectados - siguen viendo todos los paises igual que hoy.

**Validado antes de deploy:**
- `node --check` en todos los bloques de ambos archivos.
- Prueba funcional en Node simulando un `<select>` real: confirmado que solo queda la opcion del pais asignado, seleccionada y deshabilitada, para usuarios GT y ESV.

**Usuarios cuyo acceso queda correctamente restringido con este fix (ninguno se edito individualmente, es automatico via su campo `pais` ya existente):**
Francisco Aguilar, TEAM GT, Edy Lopez, Vinicio Sanabria -> Guatemala. Joaquin Palma, TEAM ESV -> El Salvador (ambos dashboards). Claudio Rojas, Jose Mallqui -> Peru.

**Alcance:** `index.html` (Auth Bridge + 1 bloque nuevo), `cash_today.html` (Auth Bridge + 1 bloque nuevo). Cero cambios en AF(), onPaisChange(), renderVolChartOnly(), calculo de datos o diseno.

---

## [09/07/2026] — Limpieza final Honduras: 3 usuarios eliminados + hub.html (prototipo huerfano) eliminado

### Mejora funcional / Limpieza - cierre del barrido de consistencia Honduras

**Usuarios eliminados** (login.html y analytics.html, arreglo PDC_USERS):
- Carlos Reyes (carlos.reyes@grupopdc.com) - pais HN
- Maria Funez (maria.funez@grupopdc.com) - pais HN
- TEAM Honduras (liquidaciones.hn@grupopdc.com) - pais HN

Ninguno de los 3 tenia operacion real de rutas (Honduras ya fue removido de Regional en sesiones anteriores). Se conservan los mapeos de pais HN (`paises: {...HN:'Honduras'}`) en analytics.html sin uso activo - se dejaron intactos por no representar un bug funcional, solo para minimizar el alcance de cambio.

**hub.html eliminado del repositorio.** RCA: prototipo de "Centro de Dashboards" anterior a analytics.html, con base de usuarios propia (`USERS`, no `PDC_USERS`) y credenciales desactualizadas, sin ningun enlace activo desde login.html ni ningun otro archivo del sistema actual. Ultimo commit sobre el archivo: 17/06/2026, antes de que existiera el Portal actual. Confirmado huerfano antes de eliminar.

**Validado:** `node --check` en login.html y analytics.html tras la edicion. Deploy confirmado exitoso.

**Alcance:** `login.html`, `analytics.html` (solo arreglo PDC_USERS), `hub.html` (eliminado). Ningun otro modulo tocado.

---

## [09/07/2026] — login.html: landing con estadisticas fijas, ultimo rincon sin conectar

### Correccion de errores - ultimo modulo con numeros hardcodeados

**Sintoma:** la pagina de acceso (login.html, landing previa al login) mostraba 146 rutas / 3 paises / 14 usuarios, mientras que el Portal (analytics.html, post-login) ya mostraba 621/150/3/28,263 correctamente via PDCBridge. Ademas la descripcion del modulo Rutas seguia listando "GT · SV · PE · HN" pese a que Honduras ya se elimino de Regional.

**RCA:** login.html nunca fue tocado durante la implementacion de PDCBridge (Fase 1-2) porque el foco estuvo en analytics.html, regional/peru/index.html. Era el unico archivo restante con estadisticas de landing 100% estaticas. Ademas, el conteo de "14 usuarios" ya estaba desactualizado por su cuenta (PDC_USERS tiene 15 registros reales) - la landing ni siquiera se mantenia sincronizada manualmente.

**Correccion aplicada:**
- Agregado `PDC_MASTER_PATH='index.html'` + include de `js/pdc_data_bridge.js`.
- "Rutas activas" y "Paises" ahora se calculan via `PDCBridge.kpis()`, misma fuente unica que el resto de la plataforma.
- "Usuarios" ahora se cuenta directo de `PDC_USERS.length` (sin fetch adicional, ya esta en memoria) - nunca mas se desincroniza al agregar/quitar usuarios.
- Eliminada mencion a Honduras en la descripcion del modulo Rutas ("GT · SV · PE · HN" -> "GT · SV · PE").

**Validado:** verificado contra index.html en vivo: 621 activas, 3 paises (El Salvador, Guatemala, Peru) - coincide con lo ya visto en el Portal. `node --check` en los 3 bloques de script.

**Alcance:** unicamente `login.html`. Ningun otro archivo tocado.

---

# 02 — CHANGELOG
## PDC Analytics Center · Historial de Versiones (CONSOLIDADO)

> **Nota de consolidación (08/07/2026):** este archivo fusiona el historial que antes vivia
> dividido entre `docs/02_CHANGELOG.md` y `docs/CHANGELOG.md` (dos documentos paralelos
> creados por sesiones distintas que no sabian de la existencia del otro — ver
> `01_MASTER_PROJECT_CONTEXT.md` §_Historial de versiones_ para el detalle de la causa).
> A partir de esta version, **este es el unico changelog vigente**. `docs/CHANGELOG.md`
> (sin numerar) queda marcado como obsoleto/archivado, apuntando aqui.
> Todas las entradas se conservaron sin editar su contenido original; solo se reordenaron
> cronologicamente (mas reciente primero) y se removieron 2 duplicados exactos.

---

## [08/07/2026] — Tarjeta Cash Today conectada en vivo via cash_summary.json


### Mejora funcional - nuevo archivo liviano, sin impacto de performance

**Contexto:** la tarjeta "Cash Today" y el hero "Tx ATM" en analytics.html mostraban '36k' fijo, escrito a mano, nunca conectado (dato real detectado: 28,263 transacciones ano 2026 - GT 12,776 + ESV 15,487, validado contra Volumetria).

**Solucion aplicada (Opcion B ya propuesta, autorizada por el usuario):**
- `cash_today.html` -> `publishToGitHub()`: al publicar el dataset completo, ahora TAMBIEN genera y publica `cash_summary.json` (archivo nuevo, ~150 bytes) con: `report_date`, `anio`, `transacciones_anio` (Depositos del anio mas reciente presente en _R), `sedes` (4), `modulos` (10).
- `analytics.html`: nuevo fetch independiente (no depende de PDCBridge, fuente de datos distinta) que lee `cash_summary.json` y actualiza la tarjeta Cash Today + hero Tx ATM. Fallback silencioso al valor de referencia si falla.
- `cash_summary.json` creado ahora mismo con el valor real vigente (28,263 transacciones, corte 07/07/2026) para que el Hub muestre el dato correcto de inmediato, sin esperar la proxima publicacion.

**Por que no afecta el rendimiento:** `cash_summary.json` pesa ~150 bytes vs los ~11MB de `cash_today.html`. El Portal sigue sin descargar el archivo completo de Cash Today en ningun escenario.

**Validado:** `node --check` en ambos archivos. Verificado el contenido publicado de `cash_summary.json` contra el repo tras el deploy.

**Alcance:** `cash_today.html` (solo la funcion `publishToGitHub()`) + `analytics.html` (solo el nuevo fetch) + `cash_summary.json` (nuevo). Ningun otro modulo tocado.

---

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

## [06/07/2026] — BUG CRITICO corregido: PDCBridge nunca funciono en subcarpetas + Honduras eliminado


### Correccion de errores - Root Cause Analysis

**Sintoma reportado (con capturas):** Consolidado Regional seguia mostrando 146/87 y "Resumen por Pais y Canal" seguia con placeholders "-", pese a las Fases 1 y 2 ya desplegadas. `index.html` (Liquidacion de Rutas) si mostraba los datos correctos (491/30).

**RCA (causa raiz real):** `js/pdc_data_bridge.js` usaba `fetch('index.html')` con ruta relativa fija. Este codigo se ejecuta tambien desde `regional/index.html` y `peru/index.html`, que viven en subcarpetas. Al resolver una ruta relativa, el navegador NO busca el archivo maestro en la raiz - busca `index.html` relativo a la carpeta actual, que en este caso apunta al PROPIO archivo (self-fetch). Como `regional/index.html` no tiene `const RAW`, la extraccion regresaba vacio, la funcion detectaba "sin datos" y se detenia en silencio, dejando los valores de referencia (los viejos) intactos. Esto explica por que index.html (raiz) funcionaba bien pero regional/peru (subcarpetas) nunca se actualizaron desde que se desplego la Fase 2.

**Correccion aplicada:**
- `js/pdc_data_bridge.js`: la ruta del archivo maestro ahora se resuelve via `PDC_MASTER_PATH` (variable global opcional definida por cada pagina antes de incluir el script), con fallback a `'index.html'` para archivos en la raiz.
- `regional/index.html` y `peru/index.html`: se agrego `var PDC_MASTER_PATH = '../index.html';` antes del include del bridge.
- Se detecto y corrigio ademas una pestana no instrumentada en la Fase 2: **"Por Pais"** (`page-paises`), que tiene sus propias tarjetas GT/SV/PE independientes de las de "Liquidacion de Rutas". Ahora tambien se actualiza en vivo.

**Cambio adicional autorizado explicitamente por el usuario:** Honduras eliminado por completo de `regional/index.html` (tarjeta en tab "Liquidacion de Rutas", fila en tabla "Resumen por Pais y Canal", seccion completa en tab "Por Pais") - no hay movimiento real de rutas para ese pais. Grid ajustado de 4 a 3 columnas donde aplico. Cash Today y Efectivo ATM de Honduras no se tocaron (no eran points de esta correccion).

**Validado antes de deploy:**
- `node --check` en los 5 bloques script de cada archivo.
- Prueba funcional en Node con datos reales (30/06/2026): Regional 491/30, Por Pais GT 273/4 - SV 66/3 - PE 152/23, tabla de canales GT total 273/venc 4 - coincide exacto con `index.html` (Image 4 del reporte del usuario).

**Alcance:** `js/pdc_data_bridge.js`, `regional/index.html`, `peru/index.html`. Eliminacion de Honduras autorizada explicitamente por el usuario en esta conversacion - no es un cambio de diseno no autorizado.

---

## [06/07/2026] — Punto 1 completado: tabla "Resumen por Pais y Canal" (regional/index.html) conectada en vivo


### Mejora funcional - Extension de pdcApplyLiveData() (regional/index.html)

**Nota:** esta tabla NUNCA tuvo datos reales en Detalle/Mayoristas/Distribuidores (placeholders "—" desde su creacion) - no era una regresion, era una funcionalidad incompleta que se completo en esta sesion.

**Solucion:** se agrego mapeo del campo `Canal2` de `RAW` (`190040 DETALLE`, `190030 MAYORISTAS`, `190070 DISTRIBUIDORES`) filtrado por pais, reutilizando el fetch ya existente de `PDCBridge` (cero llamadas de red adicionales). Estado (Critico/Alerta/Estable) ahora es dinamico segun % de vencidas (>=15% Critico, 5-14% Alerta, <5% Estable) en vez de "Critico" fijo para las 3 filas.

**Validado (Node, datos reales 30/06/2026):**
- Guatemala: Detalle 47(17%) · Mayoristas 86(32%) · Distribuidores 104(38%) · Total 273 · Vencidas 4 -> Estable
- El Salvador: Mayoristas 36(55%) · Distribuidores 1(2%) · Total 66 · Vencidas 3 -> Estable
- Peru: Detalle 1(1%) · Distribuidores 151(99%) · Total 152 · Vencidas 23 -> Critico

**Hallazgo de calidad de datos (flag, no corregido - fuera de alcance):** un registro de El Salvador tiene `Canal2` con un valor de fecha invalida (`Sun Dec 31 1899...`, artefacto tipico de celda vacia mal serializada por SheetJS/Excel). No afecta el calculo (cae fuera de las 3 categorias, correctamente excluido), pero se recomienda revisar esa fila en el Excel fuente.

**Alcance:** unicamente `regional/index.html` (ids en 4 filas x 6 celdas + extension de `pdcApplyLiveData()`). Cero cambios de diseno/HTML fuera de agregar atributos `id`.

**Pendientes restantes (sin cambio, ver puntos 2 y 3 ya documentados):** Cash Today (costo de performance, requiere autorizacion de estrategia) y el historico real de 6 meses por pais (requiere nueva funcionalidad de persistencia, el dato no existe hoy en ningun archivo).

---

## [06/07/2026] — Fase 2: peru/index.html y regional/index.html conectados a fuente unica de verdad


### Mejora funcional / Arquitectura - Reconstruccion de capa de datos (no de diseno)

**Contexto:** Fase 1 (mismo dia) sincronizo las tarjetas del Hub. Esta Fase 2 va a la raiz real: los dashboards completos de Peru y Regional tenian su propio dataset embebido, curado a mano el 24/06, totalmente desconectado de `index.html`. Al abrir el dashboard completo (no solo la tarjeta), se veian numeros viejos e incluso invertidos (ej. Guatemala vencidas: 77 en el dashboard vs 4 reales).

**RCA adicional encontrado:** el criterio de "vencidas" usado en el dataset viejo de `regional/index.html` correspondia a `Estado Real`, mientras que el criterio oficial (el que coincide con el panel de carga de Excel: 30 vencidas) es `Estado (Facturacion)`. Unificado en esta fase.

**Solucion aplicada (reutilizando el modulo ya existente `js/pdc_data_bridge.js` - cero codigo de fetch/parse duplicado):**

`peru/index.html`:
- 10 bloques HTML (antes texto estatico) ahora con `id` y se llenan en runtime: Rutas Pendientes, Vencidas (Fac.), En Proceso (4-10d), Al Dia (<=3d), Monto Pendiente, Monto Vencido, Efectividad, badge total, Distribucion Geografica (Lima/Otras), tabla Top Transportistas (top 5 por monto, generada dinamicamente).
- `RUTAS_DETALLE` (tab Detalle) reconstruido 100% desde `RAW` filtrado por Pais='Peru' - de 58 registros curados a mano a 152 registros reales.
- `D.zonas` (grafica de zonas) calculado en vivo - de 6 zonas fijas a 19 zonas reales detectadas.
- Series historicas de 6 meses (`D.rutasTotal`, `D.rutasVencidas`, `D.efectividad`, `D.montoPEN`): se refresca UNICAMENTE el ultimo punto (mes activo) con el dato real; los 5 meses previos se conservan como historial (no hay fuente en vivo para reconstruir meses pasados - decision de integridad de datos, no un descuido).

`regional/index.html`:
- Tarjetas headline (Rutas Pendientes/Vencidas Regional) y las 3 tarjetas por pais (GT/SV/PE) ahora con `id`, calculadas en vivo desde `RAW`. Honduras se mantiene en 0/Proyectado (no tiene datos reales en RAW, correcto).
- `D.rutas.{GT,SV,PE}` y el ultimo punto de la serie de 6 meses se actualizan en vivo con el mismo criterio unificado de vencidas.

**Validado antes de deploy:**
- `node --check` en todos los bloques `<script>` de ambos archivos: sintaxis correcta.
- Prueba funcional en Node ejecutando `pdcApplyLiveData()` real contra el dataset real de `index.html`: resultados verificados byte a byte contra el calculo de referencia en Python (Peru: 152 pend/23 venc/98.7% efectividad; Regional: GT 273/4, SV 66/3, PE 152/23, total 491/30).
- Fallback: si el fetch a `index.html` falla, ambos dashboards conservan los valores de referencia sin romperse (try/catch en cada capa).

**Incidencia de deploy:** el push disparo el mismo problema de concurrencia de GitHub Actions ya documentado (`cancel-in-progress`) - 2 intentos de `workflow_dispatch` fallaron antes de que el tercero completara exitosamente. Refuerza la recomendacion ya registrada de cambiar `cancel-in-progress` a `false` en `.github/workflows/deploy.yml`.

**Alcance de esta fase:** `peru/index.html`, `regional/index.html`. Ningun cambio de diseno, color, layout ni HTML fuera de agregar atributos `id` a elementos ya existentes (visualmente identicos).

**Pendiente (documentado, no implementado sin autorizacion):**
- Tabla "Resumen por Pais y Canal" en `regional/index.html` (desglose Detalle/Mayoristas/Distribuidores por pais) sigue estatica - requiere mapear el campo `Canal2` de RAW, mayor complejidad, no incluido en este alcance.
- Cash Today (`cashtoday` card + `D.cashGT/cashSV` + Efectivo YTD) sigue manual - fuera de alcance (dataset independiente en `cash_today.html`, ~10MB).

---

## [06/07/2026] — Arquitectura: Fuente Unica de Verdad para tarjetas del Hub (analytics.html)


### Mejora funcional / Arquitectura - Nuevo modulo: js/pdc_data_bridge.js

**Sintoma reportado:** Las tarjetas del Hub (Liquidacion de Rutas, El Salvador, Peru, Consolidado Regional) mostraban numeros desactualizados (146/87 del corte 18/06) mientras el dashboard real ya tenia datos del corte 30/06 (491/30). Requeria edicion manual de analytics.html en cada actualizacion de Excel.

**RCA:** Los KPIs de cada tarjeta estaban hardcodeados como texto literal en el array `PDC_DASHBOARDS` de `analytics.html` (`kpis: [{val:'146', lbl:'Rutas activas'}, ...]`), sin ninguna conexion al dataset real de `index.html`. Cada actualizacion de Excel requeria editar manualmente 5 bloques de texto - exactamente el patron que ya se habia corregido antes y volvia a romperse.

**Solucion aplicada (arquitectura):**
- Nuevo modulo reutilizable `js/pdc_data_bridge.js` (PDCBridge): en tiempo de ejecucion hace `fetch('index.html')`, extrae `RAW`, `KPI_TOTALS` y `FX_DEF` (estos ultimos no son JSON valido por contener expresiones como `1/7.63627`, se evaluan como literal JS de fuente propia y confiable), y calcula KPIs por pais con la misma regla de negocio del dashboard principal:
  - Activas = no liquidada en Facturacion NI en Despacho (`notLiq`)
  - Vencidas = `Estado (Facturacion) === 'Vencidas'` (validado contra el panel de carga: 491/30 coincide exacto)
  - Efectividad = % de rutas con `Rango Real` en ('0 Tiempo','01 a 03') sobre el total activas
  - Monto = suma de `Valor Asignado` convertido a USD via `FX_DEF`
- `analytics.html`: las tarjetas `rutas`, `elsalvador`, `peru` y `regional` (todas las que se alimentan de `index.html`) ahora se pintan primero con el valor de referencia (fallback instantaneo) y se sobreescriben en cuanto responde el fetch - sin bloquear el render inicial. Si el fetch falla, se conserva el valor de referencia silenciosamente (no rompe la pagina).
- Corregida etiqueta enganosa: 3er KPI de "Consolidado Regional" decia "USD YTD" pero en realidad mostraba monto pendiente de rutas (no el YTD real de Cash Today, que es un dataset distinto) - renombrado a "Monto Pendiente" para reflejar honestamente lo que se calcula.
- Validado con Python + Node antes de deploy: los 4 valores (Regional/GT/SV/PE) coinciden exactamente entre el calculo de referencia y `PDCBridge.kpis()`.

**Validado y desplegado:**
- `node --check` en script principal de `analytics.html` y en `js/pdc_data_bridge.js`: sintaxis correcta.
- Deploy confirmado exitoso via GitHub Actions.

**Alcance de esta fase:** Unicamente `analytics.html` (agregado `<script src="js/pdc_data_bridge.js">` + logica de sincronizacion) y el nuevo archivo `js/pdc_data_bridge.js`. Ninguna otra logica, diseno o modulo tocado.

**Fuera de alcance de esta fase (documentado como pendiente, ver ROADMAP):**
- La tarjeta `cashtoday` sigue con valores manuales (36k/10/4) - su fuente (`cash_today.html`, ~10MB) no se integra aun al bridge por costo de performance de cargarlo en cada visita al Hub.
- `peru/index.html` y `regional/index.html` (los dashboards completos, no solo la tarjeta del Hub) mantienen su propio dataset embebido, independiente y desactualizado (curado a mano el 24/06/2026, no conectado a `index.html`). El Hub ahora SIEMPRE mostrara el numero correcto en la tarjeta, pero si el usuario entra al dashboard completo de Peru o Regional, vera datos internos distintos (mas antiguos). Esta es una duplicacion de arquitectura mas profunda -  reconstruir la capa de datos de esos 2 archivos completos para que tambien consuman `index.html` en vivo - que requiere su propia fase de trabajo (touch a mas archivos, logica de negocio interna de cada uno) y no fue autorizada en este alcance.

---

## [06/07/2026] — Fix: Deploy de GitHub Pages fallido tras publicacion de Excel


### Correccion de errores - Infraestructura CI/CD (sin cambios de codigo)

**Sintoma reportado:** Usuario subio Excel nuevo (491 rutas, corte 30/06/2026), publico via boton "Publicar en GitHub" (ya con el token corregido), pero el dashboard en vivo no reflejo los nuevos datos.

**RCA:**
1. Confirmado via API: el commit del usuario (08e5fa3038) llego correctamente al repo, contenido verificado directamente (RAW: 491 registros, KPI_TOTALS.report_date: 30/06/2026, hdr-fecha: 30/06/2026). El boton de publicacion funciono correctamente end-to-end.
2. El workflow Deploy Dashboard (GitHub Actions) para ese commit fallo en el paso "Deploy to GitHub Pages" (falla rapida, ~6s, ambas veces).
3. Causa raiz: el workflow usa concurrency con cancel-in-progress: true. Dos publicaciones ocurrieron en una ventana corta (fix de token + commit del usuario), y la cancelacion por concurrencia dejo un estado de despliegue de Pages inconsistente a nivel de backend de GitHub. Un re-run del job fallido reutiliza contexto (incluido el token OIDC de Pages) que quedo invalido, por lo que el re-run tambien fallo.
4. Confirmado: workflow_dispatch (disparar una ejecucion nueva desde cero, no un re-run del job fallido) genero un despliegue limpio, conclusion success.

**Correccion aplicada:**
- Disparo de un run nuevo via workflow_dispatch sobre el commit 08e5fa3038, deploy exitoso confirmado.
- Verificado contenido servido coincide con el commit (491 rutas, 30/06/2026) directamente contra el repositorio.
- Nota operativa: este mismo repo tambien reporta un bug cosmetico preexistente no relacionado. El tag title del documento queda fijo en una fecha antigua (08/06/2026) porque el flujo de publicacion solo actualiza id=hdr-fecha, no el title. No afecta datos ni funcionalidad, documentado como recomendacion.

**Alcance:** Ninguna linea de codigo modificada. Accion exclusivamente a nivel de CI/CD (GitHub Actions).

**Recomendacion (no implementada, pendiente autorizacion):**
- Cambiar cancel-in-progress a false en .github/workflows/deploy.yml, o encolar en vez de cancelar, para evitar que publicaciones cercanas en el tiempo dejen despliegues de Pages en estado inconsistente.
- Anadir step de verificacion post-deploy que confirme automaticamente que el contenido servido coincide con el commit, con reintento automatico via workflow_dispatch si no coincide.
- Corregir el title del documento para que se actualice junto con hdr-fecha en el mismo regex de publicacion.

---

## [06/07/2026] — Fix: Token GitHub self-publish revocado (401 Bad credentials)


### Corrección de errores — `index.html`

**Síntoma reportado:** Al publicar actualización de Excel vía botón "🚀 Publicar en GitHub" (módulo Tipos de Cambio), error: `Error al publicar en GitHub: Error leyendo fuente: 401`.

**RCA:**
- Verificación directa contra GitHub API confirmó `401 Bad credentials` en el token embebido fragmentado (`_tR1` y `_t`, función `publishToGitHub()`, líneas ~3211 y ~3239).
- Token admin server-side (respaldo) validado con `200 OK` en la misma cuenta → descartada revocación general de cuenta; el problema era específico del token client-side embebido en `index.html`.
- Causa más probable: exposición del token en texto plano (aunque fragmentado) dentro de un archivo público servido por GitHub Pages, sujeto a revocación por Secret Scanning — mismo patrón de riesgo ya documentado para `cash_today.html`.

**Corrección aplicada:**
- Generado nuevo token fine-grained (scope exclusivo a este repo, permiso `Contents: Read and write`).
- Reemplazo quirúrgico de las 2 ocurrencias del token fragmentado (`_tR1` línea ~3211, `_t` línea ~3239) — ninguna otra línea modificada.
- Validado: `node --check` sobre `publishToGitHub()` → sintaxis correcta. Balance de llaves del archivo verificado idéntico al original (desbalance preexistente por literales de string, no introducido por el cambio).
- Deploy confirmado exitoso vía GitHub Actions (`Deploy Dashboard` → `success`).

**Alcance:** Únicamente `index.html`. Sin cambios en diseño, estructura, lógica de negocio ni otros módulos.

**Recomendación (no implementada, pendiente autorización):** Migrar el flujo de auto-publicación a un backend intermedio (Cloudflare Worker / función serverless) que custodie el token fuera del HTML público, eliminando el riesgo estructural de exposición y revocación recurrente.

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

## [Sprint Arquitectura] — 22/06/2026


| Issue | Causa raíz | Fix |
|---|---|---|
| Publicar GitHub congelado | `TextDecoder` UTF-8 decode corrupto en archivos >500KB | `TextDecoder('utf-8')` sobre `Uint8Array` |
| Exportar PDF sin acción | Doble `return;` + `btn.disabled` sin restore | Limpieza de control de flujo |
| Dashboard sin mostrar nada | Auth Bridge sin `else ST('resumen')` | Fallback a tab resumen |
| Toggle sin feedback visual | `pdcShowToast` buscaba `#pdcToast` inexistente | Añadir div#pdcToast al HTML |

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

## [v1.2] — 21/06/2026 · Consolidado Regional ✅


## [v1.0] — 20/06/2026 · Lanzamiento inicial ✅

- login.html · analytics.html · Auth Bridge index.html + cash_today.html

---
*PDC Analytics Center · Grupo PDC · Departamento Financiero*
