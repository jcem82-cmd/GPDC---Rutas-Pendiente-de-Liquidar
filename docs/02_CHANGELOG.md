# 02 — CHANGELOG
## PDC Analytics Center · Historial de Versiones

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
