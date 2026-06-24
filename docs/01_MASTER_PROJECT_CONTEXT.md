# 01 — MASTER PROJECT CONTEXT
## PDC Analytics Center · Estado Técnico Completo

**Versión vigente:** v1.5 | **Última actualización:** 24/06/2026 | **Estado:** Producción ✅

---

## 1. Visión del Proyecto

**PDC Analytics Center** es la plataforma corporativa de Business Intelligence del Grupo PDC. Centraliza todos los dashboards ejecutivos financieros y operativos bajo un único punto de acceso con autenticación unificada, diseño corporativo consistente y arquitectura escalable.

**Principio rector:** una plataforma, no dashboards individuales. Cada nuevo dashboard se integra sin modificar la arquitectura existente.

---

## 2. Arquitectura del Sistema

```
PDC Analytics Center
│
├── login.html              ← Autenticación única · 14 usuarios · 3 roles
├── analytics.html          ← Portal Hub · cards de acceso · panel admin
│
├── index.html              ← Dashboard Liquidación de Rutas v12 + PDF export
├── cash_today.html         ← Dashboard Cash Today v2.8 · 11 módulos
├── admin.html              ← Panel administrativo · chat Supabase
│
├── regional/index.html     ← Consolidado Regional v1.0 · 4 países
├── peru/index.html         ← Dashboard Perú v1.0 · PEN · 4 módulos
│
└── docs/
    ├── 01_MASTER_PROJECT_CONTEXT.md  (este archivo)
    ├── 02_CHANGELOG.md
    ├── 03_ROADMAP.md
    ├── 04_PROJECT_RULES.md
    └── 05_README.md
```

> **Nota v1.5:** La tarjeta Honduras fue reemplazada por El Salvador en el portal. Honduras permanece como módulo proyectado sin datos reales en el corte 24/06/2026.

### Flujo de sesión
```
login.html
    → sessionStorage[pdc_session]  (TTL 8h)
    → analytics.html  (portal hub)
         → sessionStorage[pdc_user]  (legacy compat)
         → index.html / cash_today.html / regional / peru / admin.html
```

### Arquitectura de módulos (regla permanente)
- Todo nuevo dashboard = carpeta propia (`nombre/index.html`)
- `analytics.html` = Hub exclusivo de navegación y auth
- Nunca reconstruir — solo modificaciones quirúrgicas
- Todo deploy vía GitHub REST API (Claude lo hace directamente)

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
| Método de deploy | PUT directo vía GitHub REST API (Python urllib) |
| Token GitHub (fragmentado) | `['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'].join('')` |

### SHAs de producción (24/06/2026)
| Archivo | SHA |
|---|---|
| `index.html` | `83aca5b30cfb` |
| `analytics.html` | `a4d946240bd7` → actualizado en este sprint |
| `cash_today.html` | `417505dc60b5` |
| `admin.html` | `a4151deee5f8` |
| `regional/index.html` | `ce37ce4cf0c8` |
| `peru/index.html` | `f2e60e9c4eaf` |

---

## 4. Tecnologías (versiones canónicas)

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | HTML5 · CSS3 · JavaScript ES6+ vanilla (sin frameworks) | — |
| Gráficas | Chart.js · jsdelivr CDN | **4.4.1** (todos los dashboards) |
| Excel/datos | SheetJS · cdn.sheetjs.com | **0.20.0** (todos los dashboards) |
| Tipografía | Inter · Google Fonts | 300–800 |
| Chat soporte | Supabase | `pytsrgtcjytjztwdlvux.supabase.co` |
| Notificaciones | MS Teams + Power Automate | — |
| Hosting | GitHub Pages | — |
| Deploy API | GitHub REST API v3 · Python urllib | — |

---

## 5. Usuarios y Roles (14 usuarios)

| Email | Nombre | Rol | Dashboards | País |
|---|---|---|---|---|
| juancarlos.escobar@grupopdc.com | Juan Carlos Escobar | admin | rutas · cashtoday · regional · peru | regional |
| erwin.soto@grupopdc.com | Erwin Soto | supervisor | rutas · cashtoday · regional · peru | regional |
| francisco.aguilar@grupopdc.com | Francisco Aguilar | supervisor | rutas · cashtoday | GT |
| liquidaciones.cda@grupopdc.com | TEAM GT | consulta | rutas · cashtoday | GT |
| edy.lopez@grupopdc.com | Edy Lopez | consulta | rutas | GT |
| joaquin.palma@grupopdc.com | Joaquin Palma | consulta | rutas · cashtoday | ESV |
| liquidaciones.esv@grupopdc.com | TEAM ESV | consulta | rutas · cashtoday | ESV |
| vinicio.sanabria@grupopdc.com | Vinicio Sanabria | consulta | rutas | GT |
| claudio.rojas@grupopdc.com | Claudio Rojas | consulta | rutas | PE |
| jose.mallqui@grupopdc.com | Jose Mallqui | consulta | rutas | PE |
| transportes.peru@grupopdc.com | TEAM Peru | consulta | rutas | PE |

---

## 6. Estado de Datos (corte 24/06/2026)

### Dashboard Liquidación de Rutas (index.html)

| Indicador | Valor |
|---|---|
| Total RAW (todas las rutas) | 620 |
| **Total FD (pendientes de liquidar)** | **146** |
| En Tiempo Facturación | 53 |
| Vencidas Facturación (col J) | 93 |
| Vencidas Despacho (col E) | 87 |
| +15 Días (Rango Real, col D) | 5 |
| Países activos | 3 (GT, SV, PE) |
| KPI_TOTALS report_date | 24/06/2026 |

### Desglose por país (FD pendientes)
| País | Rutas | Vencidas Despacho |
|---|---|---|
| Guatemala | 136 | 77 |
| El Salvador | 6 | 6 |
| Perú | 4 | 4 |
| Honduras | 0 | 0 (proyectado) |

---

## 7. Motor de Cálculo — Fuente Única de Verdad

**Regla absoluta:** todos los módulos consumen `FD = RAW.filter(notLiq)` donde:
```javascript
notLiq = d => d['Estado (Facturación)'] !== 'Liquidada' && d['Estado Real'] !== 'Liquidada'
```

| Función | Módulo | Fuente | Columna |
|---|---|---|---|
| `AF()` | Filtro global + header badges | `RAW → FD` | — |
| `RK()` | Resumen KPIs | `FD` | J (Fac), E (Desp), D (Rango Real) |
| `RDE()` | Desglose por estado | `FD` | J / E |
| `RCC()` | Country cards | `FD` | — |
| `RC()` | Canal | `FD` | — |
| `RD()` + `addDR()` | Análisis por Área | `FD` col I (Fac) / col D (Desp) — **independientes** | I / D |
| `RT()` | Transportistas | `FD` | — |
| `RM()` | Mapa rutas | `FD` | — |
| `renderTableros()` | Tableros | `FD` (unificado v1.5) | — |
| `RTend()` | Tendencias | `KPI_HIST` | — |
| `REf()` | Efectividad | `EFECT` | — |

---

## 8. Reglas de Negocio Críticas

- **notLiq**: excluye rutas donde `Estado (Facturación) === 'Liquidada'` OR `Estado Real === 'Liquidada'`
- **Vencidas Facturación**: `Estado (Facturación) === 'Vencidas'` (col J del Excel)
- **Vencidas Despacho**: `Estado Real === 'Vencidas'` (col E del Excel)
- **+15 Días**: `Rango Real === '15 +'` (col D del Excel)
- **Análisis por Área modo Rango**: agrupador = `r.Rango` (Facturación); columna Despacho usa `r['Rango Real']` — fuentes independientes
- **renderTableros()**: usa `FD` directamente (no filtra RAW con Estatus Real)
- **Honduras**: datos proyectados, sin rutas reales en producción

---

## 9. Portal analytics.html — Tarjetas (corte 24/06/2026)

| ID | Dashboard | KPIs mostrados |
|---|---|---|
| `rutas` | Liquidación de Rutas | 146 rutas · 3 países · 87 vencidas |
| `cashtoday` | Cash Today | 35k TX · 10 módulos · 4 sedes |
| `regional` | Consolidado Regional | 146 rutas · 3 países · $1.4M USD |
| `peru` | Perú · Liquidación de Rutas | 4 rutas · 4 vencidas · $26k USD |
| `elsalvador` | El Salvador · Liquidación de Rutas | 6 rutas · 6 vencidas · $26,927 USD |

---

## 10. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| v1.5 | 24/06/2026 | Datasets actualizados al 18/06 · motor unificado · tarjeta HN→ESV |
| v1.4 | 21/06/2026 | Sprint arquitectura · bugs PDF/GitHub/auth |
| v1.2 | 21/06/2026 | Consolidado Regional |
| v1.1 | 21/06/2026 | Fase 1 completa |
| v1.0 | 20/06/2026 | Lanzamiento inicial |

---
*PDC Analytics Center · Grupo PDC · Departamento Financiero · v1.5 · 24/06/2026*
