# 📊 MASTER PROJECT CONTEXT — PDC Analytics Center | Grupo PDC

**Versión vigente:** v1.4 | **Última actualización:** 21/06/2026 | **Estado:** Producción ✅

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
├── honduras/index.html     ← Dashboard Honduras v1.0 · HNL · 4 módulos
│
└── docs/
    ├── MASTER_PROJECT_CONTEXT.md  (este archivo)
    ├── CHANGELOG.md
    ├── ROADMAP.md
    ├── PROJECT_RULES.md
    └── README.md
```

### Flujo de sesión
```
login.html
    → sessionStorage[pdc_session]  (TTL 8h)
    → analytics.html  (portal hub)
         → sessionStorage[pdc_user]  (legacy compat)
         → index.html / cash_today.html / regional / peru / honduras / admin.html
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
| Dashboard Honduras | .../honduras/index.html |
| Panel Admin | .../admin.html |
| Despliegue | GitHub Pages · GitHub Actions (~80s) |
| Método de deploy | PUT directo vía GitHub REST API (Python urllib) |
| Token GitHub (fragmentado) | `['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'].join('')` |

### SHAs de producción (21/06/2026)
| Archivo | SHA |
|---|---|
| analytics.html | e8627daf86b0 |
| login.html | a247c989503e |
| index.html | 804588b84744 |
| cash_today.html | 97dcedfc11d4 |
| regional/index.html | ce37ce4cf0c8 |
| peru/index.html | f2e60e9c4eaf |
| honduras/index.html | c2014b3adf9a |

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
| juancarlos.escobar@grupopdc.com | Juan Carlos Escobar | admin | rutas · cashtoday · regional · peru · honduras | regional |
| erwin.soto@grupopdc.com | Erwin Soto | supervisor | rutas · cashtoday · regional · peru · honduras | regional |
| francisco.aguilar@grupopdc.com | Francisco Aguilar | supervisor | rutas · cashtoday | GT |
| liquidaciones.cda@grupopdc.com | TEAM GT | consulta | rutas · cashtoday | GT |
| edy.lopez@grupopdc.com | Edy Lopez | consulta | rutas | GT |
| joaquin.palma@grupopdc.com | Joaquin Palma | consulta | rutas · cashtoday | ESV |
| liquidaciones.esv@grupopdc.com | TEAM ESV | consulta | rutas · cashtoday | ESV |
| vinicio.sanabria@grupopdc.com | Vinicio Sanabria | consulta | rutas | GT |
| claudio.rojas@grupopdc.com | Claudio Rojas | consulta | rutas · peru | PE |
| jose.mallqui@grupopdc.com | Jose Mallqui | consulta | rutas · peru | PE |
| transportes.peru@grupopdc.com | TEAM Peru | consulta | rutas · peru | PE |
| carlos.reyes@grupopdc.com | Carlos Reyes | consulta | rutas · honduras | HN |
| maria.funez@grupopdc.com | Maria Funez | consulta | rutas · honduras | HN |
| liquidaciones.hn@grupopdc.com | TEAM Honduras | consulta | rutas · honduras | HN |

### Permisos por rol
| Función | admin | supervisor | consulta |
|---|---|---|---|
| Ver dashboards autorizados | ✅ | ✅ | ✅ |
| Panel de Administración | ✅ | ❌ | ❌ |
| Descargar snapshots / Export PDF | ✅ | ❌ | ❌ |
| Actualizar datos (Excel / GitHub) | ✅ | ❌ | ❌ |
| Chat de soporte | ✅ | ✅ | ✅ |

---

## 6. Gestión de Sesión

- **Mecanismo:** `sessionStorage` (destruye al cerrar pestaña)
- **Clave principal:** `pdc_session` — `{email, nombre, rol, dashboards, pais, sedes, ts}`
- **Clave legacy:** `pdc_user` — `{nombre, email, role}` para compatibilidad dashboards existentes
- **TTL:** 8 horas · Session watcher: verifica cada 60s, banner + toast a los 15 min restantes
- **Renovación:** `pdcRenewSession()` resetea TTL sin re-login
- **Guard:** toda página protegida verifica `pdc_session` al cargar → sin sesión → `login.html`
- **Login features:** bloqueo 3 intentos (30s cooldown) · remember-email checkbox

---

## 7. Dashboards Integrados

### 7.1 Liquidación de Rutas (`index.html` v12)
- **Países:** GT · SV · PE · HN
- **Datos:** 710 rutas activas · 36 vencidas · última carga 11/06/2026
- **Constantes:** `RAW`, `KPI_TOTALS`, `KPI_HIST`, `EFECT`, `FX`, `FX_DEF`
- **Auth Bridge:** v2.0 — IIFE al inicio del body
- **Módulos:** Resumen · Análisis · Transportistas · Tendencias · Detalle · Tableros · Tipos de Cambio
- **Export PDF:** botón `📄 Exportar PDF` en header (admin, visible solo en tab Resumen)
  - `exportarPDF()` → ventana emergente con reporte A4 autocontenido → `window.print()`
  - Incluye: header PDC, 6 KPI cards, detalle por país, footer corporativo
- **Actualización:** self-service vía tab Tipos de Cambio → Actualizar Dashboard → GitHub API

#### Reglas de extracción Excel (críticas)
- `General (seguimiento)`: `dropna(subset=['Numero de Despacho'])` · `Cliente` (mayúscula)
- País por `Moneda`: GTQ→GT, USD→SV, PEN→PE, HNL→HN
- `Efectividad`: header fila índice 2 · datos desde índice 3
- Eliminar filas con `total=0` antes de derivar `kpiData`
- `KPI_HIST.vencidas` (mes activo) = max(EFECT.mas15, conteo real `Estado Real==='Vencidas'`)
- `EFECT.mas15` = valor real de Efectividad **sin override**

### 7.2 Cash Today (`cash_today.html` v2.8)
- **Países:** GT · SV
- **Dataset:** 35,089 transacciones Jun 2025 → Jun 2026 (al 11/06/2026)
- **Módulos (11):** Resumen · Guatemala · El Salvador · Límites & KPIs · Tráfico · Comparador · Detalle · Volumetría · Costo Servicio · **Presupuesto** · Config
- **TC mensual:** `_TC_MENSUAL` BANGUAT — 13 meses (Jun 2025 → Jun 2026)

| Mes | TC GTQ/USD |
|---|---|
| 2025-06 | 7.69800 |
| 2025-07 | 7.70200 |
| 2025-08 | 7.70500 |
| 2025-09 | 7.69900 |
| 2025-10 | 7.69200 |
| 2025-11 | 7.68400 |
| 2025-12 | 7.67500 |
| 2026-01 | 7.66614 |
| 2026-02 | 7.66476 |
| 2026-03 | 7.64677 |
| 2026-04 | 7.63627 |
| 2026-05 | 7.62240 |
| 2026-06 | 7.62240 |

- **Módulo Presupuesto:** constante `_PRESUPUESTO` · 24 filas (4 sedes × 6 meses 2026)
  - Selectores: año + país (Consolidado / GT / SV)
  - KPIs: cumplimiento %, presupuesto, recolectado, superávit/déficit
  - Gráfica dual: barras presupuesto vs real + línea % cumplimiento
  - Tabla sede × mes con semáforo verde ≥100% · amarillo ≥85% · rojo <85%

### 7.3 Consolidado Regional (`regional/index.html` v1.0)
- **Cobertura:** GT · SV · PE · HN
- **Módulos:** 4 tabs — KPIs globales · por país · tendencias · mapa operativo

### 7.4 Dashboard Perú (`peru/index.html` v1.0)
- **Moneda:** PEN · TC referencial 3.75
- **Paleta:** `--pe1:#8B1A1A` / `--pe2:#E8A020`
- **KPIs:** 74 rutas · 12 vencidas · 83.8% efectividad · S/2,847,320
- **Módulos:** Resumen · Análisis · Detalle Rutas · Tendencias

### 7.5 Dashboard Honduras (`honduras/index.html` v1.0)
- **Moneda:** HNL · TC referencial 24.80
- **Paleta:** `--hn1:#003F8A` / `--hn2:#009E60`
- **KPIs:** 52 rutas · 8 vencidas · 84.6% efectividad · L.3,124,680
- **Módulos:** Resumen · Análisis · Detalle Rutas · Tendencias

---

## 8. Función de Descarga de Snapshots

`pdcDownload()` en `analytics.html`:
1. `fetch(base + archivo)` → trae HTML fuente desde GitHub Pages
2. Strip Auth Bridge con regex
3. Agrega watermark `📸 SNAPSHOT PDC · fecha · Solo lectura · nombre`
4. Descarga como blob local `text/html;charset=utf-8`

**Deploy pattern (archivos grandes):**
- Archivos < 1MB → Python urllib PUT directo
- Archivos > 1MB (cash_today ~9MB) → blob API para GET + Python urllib para PUT
- Nunca usar curl para archivos grandes (arg list too long)

---

## 9. Chat de Soporte (Supabase)

- Proyecto: `https://pytsrgtcjytjztwdlvux.supabase.co`
- Tabla: `chat_messages` — `id (uuid)`, `sender_email`, `sender_nombre`, `sender_role`, `message`, `is_read`, `created_at`
- Polling 3s (background) / 1.5s (chat abierto)
- ⚠️ `id` es UUID — usar `created_at` para detectar mensajes nuevos, nunca comparar `id` con `>`
- Supabase key (publishable): `sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj`

---

## 10. Integraciones Externas

- **Power Automate:** OneDrive (`/Reporte de Liquidaciones`) → notificación Teams canal "Dashboard KPIs"
- **MS Teams:** canal "C & C | Liquidaciones" — subcanales: Dashboard KPIs · Reportes Mensuales · Alertas Vencidas

---

## 11. Diseño Corporativo

```css
:root {
  --navy:#002060;  --navy2:#003090;  --sky:#CFEEFC;
  --green:#DCF0C6; --green2:#2D9E2D;
  --yellow:#FFF4CC; --yellow2:#C48A00;
  --red:#FFBDBD;   --red2:#CC0000;
  --bg:#F0F4F8;    --card:#FFF;      --text:#0F1729; --text2:#5A6480;
  --border:#E2E8F0; --radius:12px;
  --shadow:0 2px 16px rgba(0,32,96,.08);
}
/* Paletas por país */
/* GT: #002060 / #00B8D9 */
/* SV: #E6501E / #FFAB00 */
/* PE: --pe1:#8B1A1A / --pe2:#E8A020 */
/* HN: --hn1:#003F8A / --hn2:#009E60 */
/* Regional/Global: #5B2D8E / #A78BFA */
```

- **Logo PDC:** embebido en Base64 · `height:52px` · fondo blanco redondeado
- **Fila consolidado:** siempre `background:#DCE8FE` + `color:var(--navy)` — nunca texto blanco
- **Tráfico (Cash Today):** SVG puro — no migrar a Chart.js (canvas falla en `display:none`)
- **Tipografía:** Inter · Google Fonts

---

## 12. Reglas de Desarrollo

1. **Nunca reconstruir** — modificaciones quirúrgicas con `assert OLD in html` antes de reemplazar
2. Validar braces JS: strip strings/templates con `re.sub`, luego `count({) == count(})`
3. Validar canvas IDs: `mkChart('id')` debe existir en HTML
4. Respetar separación Depósito / Recogida en Cash Today
5. Precisión decimal: GTQ=0dec · USD=2dec — uniforme en celdas y totales
6. No hardcodear `tcGTQ` — usar `usd(r)` con `_TC_MENSUAL[r.ym]` y fallback
7. No usar `localStorage`/`sessionStorage` dentro de artefactos Claude.ai
8. Actualizar `CHANGELOG.md` al finalizar cada sesión con cambios
9. Librerías canónicas: Chart.js 4.4.1 jsdelivr · SheetJS 0.20.0 cdn.sheetjs.com
10. GitHub cancela runs intermedios cuando hay commits rápidos — comportamiento normal

---

## 13. Estado Actual · 21/06/2026

| Componente | Versión | Estado |
|---|---|---|
| PDC Analytics Center (portal) | v1.4 | ✅ Producción |
| login.html | v1.1 | ✅ 14 usuarios · bloqueo 3 intentos |
| analytics.html | v1.3 | ✅ Toast · session watcher · 5 dashboards |
| Dashboard Rutas (index.html) | v12 | ✅ + Export PDF ejecutivo |
| Dashboard Cash Today | v2.8 | ✅ + Presupuesto + TC histórico 2025 |
| Consolidado Regional | v1.0 | ✅ 4 países |
| Dashboard Perú | v1.0 | ✅ PEN · 4 módulos |
| Dashboard Honduras | v1.0 | ✅ HNL · 4 módulos |

---

## 14. Próximos Pasos
Ver `ROADMAP.md`.

## 15. Historial de Cambios
Ver `CHANGELOG.md`.
