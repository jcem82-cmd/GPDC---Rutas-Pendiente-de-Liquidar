# 01 — MASTER PROJECT CONTEXT
## PDC Analytics Center · Estado Técnico Completo

**Versión vigente:** v1.7 | **Última actualización:** 26/06/2026 | **Estado:** Producción ✅

---

## 1. Visión del Proyecto

**PDC Analytics Center** es la plataforma corporativa de Business Intelligence del Grupo PDC. Centraliza todos los dashboards ejecutivos financieros y operativos bajo un único punto de acceso con autenticación unificada, diseño corporativo consistente y arquitectura escalable.

**Principio rector:** una plataforma, no dashboards individuales. Todo nuevo dashboard se integra sin modificar la arquitectura existente.

---

## 2. Arquitectura del Sistema

```
PDC Analytics Center
│
├── login.html              ← Autenticación única · 14 usuarios · 3 roles
├── analytics.html          ← Portal Hub · cards de acceso · panel admin
│
├── index.html              ← Dashboard Liquidación de Rutas v12
├── cash_today.html         ← Dashboard Cash Today v2.9 · 10 módulos (Festivos eliminado)
├── admin.html              ← Panel administrativo · chat Supabase
│
├── regional/index.html     ← Consolidado Regional v1.1 · 3 países activos
├── peru/index.html         ← Dashboard Perú v1.1 · PEN
│
└── docs/
    ├── 01_MASTER_PROJECT_CONTEXT.md  ← este archivo
    ├── 02_CHANGELOG.md
    ├── 03_ROADMAP.md
    ├── 04_PROJECT_RULES.md
    └── 05_README.md
```

> **Nota v1.6:** Módulo Festivos eliminado de Cash Today. Portadas actualizadas con datos reales (146 rutas, 3 países, 36k TX ATM).
> Honduras permanece como proyectado sin datos reales en corte 25/06/2026.

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
| Login | .../login.html |
| Dashboard Rutas | .../index.html |
| Dashboard Cash Today | .../cash_today.html |
| Consolidado Regional | .../regional/index.html |
| Dashboard Perú | .../peru/index.html |
| Panel Admin | .../admin.html |
| Despliegue | GitHub Pages · GitHub Actions (~80s) |
| Método | PUT directo vía GitHub REST API (Python urllib) |
| Token (fragmentado) | `''.join(['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'])` |

### SHAs de producción (25/06/2026) ← ACTUALES
| Archivo | SHA |
|---|---|
| `index.html` | `a12727975196` |
| `analytics.html` | `c721f9f0cd99` |
| `login.html` | `5b578731275b` |
| `admin.html` | `a4151deee5f8` |
| `regional/index.html` | `e9e70a520afe` |
| `peru/index.html` | `73e234cd2f3f` |
| `cash_today.html` | `168b45f2ef75` |
| `docs/01_MASTER_PROJECT_CONTEXT.md` | `7532cc2275e1` (→ actualizado ahora) |
| `docs/02_CHANGELOG.md` | `25f29d6ca864` (→ actualizado ahora) |

---

## 4. Tecnologías (versiones canónicas)

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | HTML5 · CSS3 · JavaScript ES6+ vanilla | — |
| Gráficas | Chart.js · jsdelivr CDN | **4.4.1** |
| Excel/datos | SheetJS · cdn.sheetjs.com | **0.20.0** |
| Tipografía | Inter · Google Fonts | 300–800 |
| Chat soporte | Supabase | `pytsrgtcjytjztwdlvux.supabase.co` |
| Hosting | GitHub Pages | — |
| Deploy | GitHub REST API v3 · Python urllib | — |

---

## 5. Usuarios y Roles (14 usuarios)

| Email | Nombre | Rol | Dashboards | País |
|---|---|---|---|---|
| juancarlos.escobar@grupopdc.com | Juan Carlos Escobar | admin | rutas · cashtoday · regional · peru · **elsalvador** | regional |
| erwin.soto@grupopdc.com | Erwin Soto | supervisor | rutas · cashtoday · regional · peru · **elsalvador** | regional |
| francisco.aguilar@grupopdc.com | Francisco Aguilar | supervisor | rutas · cashtoday | GT |
| liquidaciones.cda@grupopdc.com | TEAM GT | consulta | rutas · cashtoday | GT |
| edy.lopez@grupopdc.com | Edy Lopez | consulta | rutas | GT |
| joaquin.palma@grupopdc.com | Joaquin Palma | consulta | rutas · cashtoday · **elsalvador** | ESV |
| liquidaciones.esv@grupopdc.com | TEAM ESV | consulta | rutas · cashtoday · **elsalvador** | ESV |
| vinicio.sanabria@grupopdc.com | Vinicio Sanabria | consulta | rutas | GT |
| claudio.rojas@grupopdc.com | Claudio Rojas | consulta | rutas · peru | PE |
| jose.mallqui@grupopdc.com | Jose Mallqui | consulta | rutas · peru | PE |
| transportes.peru@grupopdc.com | TEAM Peru | consulta | rutas · peru | PE |
| carlos.reyes@grupopdc.com | Carlos Reyes | consulta | rutas | HN |
| maria.funez@grupopdc.com | Maria Funez | consulta | rutas | HN |
| liquidaciones.hn@grupopdc.com | TEAM Honduras | consulta | rutas | HN |

> ⚠️ **CRÍTICO:** PDC_USERS está definido en **DOS archivos**: `login.html` (construye la sesión) y `analytics.html` (referencia). Siempre actualizar **ambos** al modificar usuarios o dashboards.

---

## 6. Estado de Datos (corte 25/06/2026)

### Dashboard Liquidación de Rutas (index.html)

| Indicador | Valor |
|---|---|
| Total RAW | 620 registros |
| **Total FD (pendientes)** | **146** |
| En Tiempo Facturación (col J) | 53 |
| Vencidas Facturación (col J) | 93 |
| Vencidas Despacho (col E) | 87 |
| +15 Días Rango Real (col D) | 5 |
| KPI_TOTALS.report_date | 25/06/2026 |
| KPI_TOTALS.total_by_moneda | GTQ:2009 · USD:1002 · PEN:327 |

### Desglose por país (FD pendientes corte 18/06)
| País | Rutas | Vencidas Despacho |
|---|---|---|
| Guatemala | 136 | 77 |
| El Salvador | 6 | 6 |
| Perú | 4 | 4 |
| Honduras | 0 | 0 (proyectado) |

---

## 7. Motor de Cálculo — Fuente Única de Verdad

**Regla absoluta:** `FD = RAW.filter(notLiq)` donde:
```javascript
notLiq = d => d['Estado (Facturación)'] !== 'Liquidada' && d['Estado Real'] !== 'Liquidada'
```

| Función | Módulo | Fuente | Columna |
|---|---|---|---|
| `AF()` | Filtro global + header | `RAW → FD` | — |
| `RK()` | Resumen KPIs | `FD` | J (Fac), E (Desp), D (Rango Real) |
| `RDE()` | Desglose por estado | `FD` | J / E |
| `RCC()` | Country cards | `FD` | — |
| `RC()` | Canal | `FD` | — |
| `RD()` + `addDR()` | Análisis Área | `FD` col I (Fac) / col D (Desp) **independientes** |
| `RT()` | Transportistas | `FD` | — |
| `RM()` | Mapa | `FD` | — |
| `renderTableros()` | Tableros | `FD` (unificado v1.5) | — |
| `RTend()` | Tendencias | `KPI_HIST` | — |
| `REf()` | Efectividad | `EFECT` | — |

---

## 8. Reglas de Negocio Críticas

| Regla | Detalle |
|---|---|
| **notLiq** | Excluye Estado(Fac)=Liquidada OR Estado Real=Liquidada |
| **Vencidas Facturación** | `Estado (Facturación) === 'Vencidas'` (col J) |
| **Vencidas Despacho** | `Estado Real === 'Vencidas'` (col E) |
| **+15 Días** | `Rango Real === '15 +'` (col D) |
| **Análisis Área modo Rango** | Facturación usa `r.Rango` (col I); Despacho usa `r['Rango Real']` (col D) — fuentes independientes |
| **renderTableros()** | Usa `FD` (no filtra RAW directo) |
| **PDC_USERS dual** | Siempre actualizar login.html Y analytics.html |
| **Honduras** | Proyectado — sin datos reales, sin tarjeta en portal |

---

## 9. Portal analytics.html — Estado (25/06/2026)

### Tarjetas "Mis Dashboards"
| ID | Nombre | KPIs | Archivo destino |
|---|---|---|---|
| `rutas` | Liquidación de Rutas | 146 rutas · 3 países · 87 vencidas | `index.html` |
| `cashtoday` | Cash Today | 35k TX · 10 módulos · 4 sedes | `cash_today.html` |
| `regional` | Consolidado Regional | 146 rutas · 3 países · $1.4M | `regional/index.html` |
| `peru` | Perú · Liquidación de Rutas | 4 rutas · 4 vencidas | `peru/index.html` |
| `elsalvador` | El Salvador · Liquidación de Rutas | 6 rutas · 6 vencidas · $26,927 | `index.html` |

### Hero KPIs (header portal)
| KPI | Valor |
|---|---|
| Rutas activas | 146 |
| Vencidas | 87 |
| Países | 3 |
| Tx ATM | 35k |

### Panel Administración (admin)
- Actualizar Rutas, Actualizar Cash Today, Panel Administrativo
- Descargar Rutas, Descargar Cash Today
- Consolidado Regional, Dashboard Perú, **Dashboard El Salvador**

---

## 10. Dashboard Perú (peru/index.html) — Estado 25/06/2026

| KPI | Valor |
|---|---|
| Rutas Pendientes | 4 |
| Rutas Vencidas (Fac.) | 4 |
| En Proceso (4-10d) Rango Real | 4 (100%) |
| Al Día | 0 |
| Monto Pendiente | S/ 134,816 ≈ USD 36,339 |
| Efectividad | 0.0% · Brecha: -90pp |
| Lima Metro | 3 · Otras: 1 |

**Transportistas reales:**
| Transportista | Zona | Rutas | Monto |
|---|---|---|---|
| FRICH GROUP TRADEA S.A.C. | Loreto | 1 | S/ 123,053 |
| TRANSPORTES ITATI CARGO EIRL | Lima | 2 | S/ 11,764 |
| JUAN MANUEL MURAYARI VELA | Lima | 1 | S/ 0 |

---

## 11. Dashboard Regional (regional/index.html) — Estado 25/06/2026

| KPI Global | Valor |
|---|---|
| Rutas Pendientes Regional | 146 (GT:136 · SV:6 · PE:4) |
| Rutas Vencidas Regional | 87 (GT:77 · SV:6 · PE:4) |
| Efectivo Recolectado Jun | USD 1,770,938 (GT:949,926 · SV:821,012) |
| Efectivo YTD 2026 | USD 21,678,140 (GT:10.48M · SV:11.20M) |

---

## 12. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| v1.5 | 25/06/2026 | Auditoría completa · datasets 18/06 · motor unificado · tarjeta HN→ESV · peru/regional actualizados |
| v1.4 | 21/06/2026 | Sprint arquitectura · bugs PDF/GitHub/auth |
| v1.2 | 21/06/2026 | Consolidado Regional |
| v1.1 | 21/06/2026 | Fase 1 completa |
| v1.0 | 20/06/2026 | Lanzamiento inicial |

---

## Centro de Comunicación — Widget Flotante (v2.0 · 26/06/2026)

### Arquitectura
- **`cc_widget.js`** — componente reutilizable autocontenido (IIFE)
- **`assistant_avatar.png`** — avatar IA corporativo PDC Robot 3D
- Se activa en cualquier dashboard con: `<script src="cc_widget.js"></script>`
- Activo en: `index.html`, `cash_today.html`

### SHAs producción
| Archivo | SHA |
|---|---|
| `cc_widget.js` | `4206ff0e2212` |
| `admin.html` | `58dfe775739a` |
| `analytics.html` | `c721f9f0cd99` |
| `assistant_avatar.png` | `4c5094b07f81` |
| `index.html` | `a12727975196` |
| `cash_today.html` | `168b45f2ef75` |

### Funcionalidades activas
- Botón FAB circular con avatar robot PDC y animaciones CSS (flotación, glow, pulso, saludo)
- Ventana flotante 460px × 70vh · Minimizar / Restaurar / Cerrar
- Una sola interfaz para todos los roles (admin, supervisor, consulta)
- REST fetch directo a Supabase (no depende del SDK del host)
- Polling 5s + Realtime Supabase · Sonido WebAudio · Toast · Badges

### Reglas clave
- **cc_widget.js** nunca modifica el dashboard host — usa `position:fixed` + prefijo `pdc-cc-`
- Sesión leída de `sessionStorage` (`pdc_session` o `pdc_user`)
- `ccOpen()` expuesto globalmente — llamable desde cualquier botón del dashboard
- Futuros dashboards: solo 1 línea `<script src="cc_widget.js"></script>`


## 13. Instrucciones para nuevo chat

1. **Pegar este documento** al inicio del chat
2. **Token GitHub:** `''.join(['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'])`
3. **Supabase:** `https://pytsrgtcjytjztwdlvux.supabase.co` · key: `sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj`
4. **NUNCA reconstruir** — solo modificaciones quirúrgicas
5. **Siempre leer el archivo de producción** antes de editar
6. **SHA fresco** antes de cada PUT
7. **PDC_USERS en login.html Y analytics.html** — siempre ambos

---
*PDC Analytics Center · Grupo PDC · Departamento Financiero · v1.5 · 25/06/2026*
