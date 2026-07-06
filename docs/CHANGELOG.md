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
