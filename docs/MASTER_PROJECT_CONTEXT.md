# 📊 MASTER PROJECT CONTEXT — PDC Analytics Center | Grupo PDC

**Versión vigente:** v1.0 | **Última actualización:** 20/06/2026 | **Estado:** Producción ✅

---

## 1. Visión del Proyecto

**PDC Analytics Center** es la plataforma corporativa de Business Intelligence del Grupo PDC. Centraliza todos los dashboards ejecutivos financieros y operativos bajo un único punto de acceso con autenticación unificada, diseño corporativo consistente y arquitectura escalable.

**Principio rector:** una plataforma, no dashboards individuales. Cada nuevo dashboard se integra sin modificar la arquitectura existente.

---

## 2. Arquitectura del Sistema

```
PDC Analytics Center
│
├── login.html          ← Autenticación única · 11 usuarios · roles
├── analytics.html      ← Portal Hub · tarjetas de acceso · panel admin
│
├── index.html          ← Dashboard Liquidación de Rutas (legacy integrado)
├── cash_today.html     ← Dashboard Cash Today (legacy integrado)
├── admin.html          ← Panel administrativo · chat Supabase
│
└── docs/
    ├── MASTER_PROJECT_CONTEXT.md  (este archivo)
    ├── CHANGELOG.md
    ├── ROADMAP.md
    ├── PROJECT_RULES.md
    └── STYLE_GUIDE.md
```

### Flujo de sesión
```
login.html
    → sessionStorage[pdc_session]  (TTL 8h)
    → analytics.html  (portal hub)
         → sessionStorage[pdc_user]  (legacy compat)
         → index.html / cash_today.html / admin.html
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
| Panel Admin | .../admin.html |
| Despliegue | GitHub Pages · GitHub Actions (~80s) |
| Método de deploy | PUT directo vía GitHub REST API (token embebido fragmentado) |
| Token GitHub (fragmentado) | `['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'].join('')` |

---

## 4. Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML5 · CSS3 · JavaScript ES6+ vanilla (sin frameworks) |
| Gráficas | Chart.js 4.4.0 (Rutas) · Chart.js 4.4.1 (Cash Today) |
| Excel/datos | SheetJS 0.20.0 (Rutas) · SheetJS 0.18.5 (Cash Today) |
| Chat soporte | Supabase (`pytsrgtcjytjztwdlvux.supabase.co`) |
| Notificaciones | MS Teams + Power Automate |
| Hosting | GitHub Pages |
| Deploy API | GitHub REST API v3 |

---

## 5. Usuarios y Roles

| Email | Nombre | Rol | Dashboards | País |
|---|---|---|---|---|
| juancarlos.escobar@grupopdc.com | Juan Carlos Escobar | admin | rutas · cashtoday | regional |
| erwin.soto@grupopdc.com | Erwin Soto | supervisor | rutas · cashtoday | regional |
| francisco.aguilar@grupopdc.com | Francisco Aguilar | supervisor | rutas · cashtoday | GT |
| liquidaciones.cda@grupopdc.com | TEAM GT | consulta | rutas · cashtoday | GT |
| edy.lopez@grupopdc.com | Edy Lopez | consulta | rutas | GT |
| joaquin.palma@grupopdc.com | Joaquin Palma | consulta | rutas · cashtoday | ESV |
| liquidaciones.esv@grupopdc.com | TEAM ESV | consulta | rutas · cashtoday | ESV |
| vinicio.sanabria@grupopdc.com | Vinicio Sanabria | consulta | rutas | GT |
| claudio.rojas@grupopdc.com | Claudio Rojas | consulta | rutas | PE |
| jose.mallqui@grupopdc.com | Jose Mallqui | consulta | rutas | PE |
| transportes.peru@grupopdc.com | TEAM Peru | consulta | rutas | PE |

### Permisos por rol
| Función | admin | supervisor | consulta |
|---|---|---|---|
| Ver dashboards autorizados | ✅ | ✅ | ✅ |
| Panel de Administración | ✅ | ❌ | ❌ |
| Descargar snapshots | ✅ | ❌ | ❌ |
| Actualizar datos (Excel) | ✅ | ❌ | ❌ |
| Chat de soporte | ✅ | ✅ | ✅ |

---

## 6. Gestión de Sesión

- **Mecanismo:** `sessionStorage` (destruye al cerrar pestaña)
- **Clave principal:** `pdc_session` — objeto JSON `{email, nombre, rol, dashboards, pais, sedes, ts}`
- **Clave legacy:** `pdc_user` — objeto JSON `{nombre, email, role}` para compatibilidad con dashboards existentes
- **TTL:** 8 horas desde último login
- **Guard:** toda página protegida verifica `pdc_session` al cargar; sin sesión válida → redirige a `login.html`

---

## 7. Dashboards Integrados

### 7.1 Liquidación de Rutas (`index.html`)
- **Origen de datos:** ERP JDE vía Excel (`Rutas_no_Liquidadas_DD_MM_YYYY.xlsx`)
- **Países:** GT · SV · PE · HN
- **Estado datos:** 710 rutas activas · 36 vencidas · última carga 11/06/2026
- **Constantes clave:** `RAW`, `KPI_TOTALS`, `KPI_HIST`, `EFECT`, `FX`, `FX_DEF`
- **Auth Bridge:** `v2.0` — IIFE con comentario `/* PDC Analytics Center — Auth Bridge v2.0 */`
- **Actualización:** self-service vía tab "Tipos de Cambio" → "Actualizar Dashboard" → GitHub API

#### Reglas de extracción Excel (críticas)
- `General (seguimiento)`: `dropna(subset=['Numero de Despacho'])`; usar `Cliente` (mayúscula)
- País por `Moneda`: GTQ→GT, USD→SV, PEN→PE, HNL→HN
- `Efectividad`: header en fila índice 2, datos desde índice 3
- Eliminar filas con `total=0` (meses futuros) antes de derivar `kpiData`
- `KPI_HIST.vencidas` (mes activo) = max(EFECT.mas15, conteo real `Estado Real==='Vencidas'`)
- `EFECT.mas15` = valor real de Efectividad, **sin override**

### 7.2 Cash Today (`cash_today.html`)
- **Origen de datos:** Excel hojas CDA · XELA · ESV-STA TECLA · ESV-SN MIGUEL · Costo · TC
- **Países:** GT · SV
- **Dataset:** 35,089 transacciones Jun 2025 → Jun 2026 (al 11/06/2026)
- **Módulos:** Resumen · Guatemala · El Salvador · Límites & KPIs · Tráfico · Comparador · Detalle · Volumetría · Costo Servicio · Config (10 módulos)
- **TC mensual:** `_TC_MENSUAL` BANGUAT Ene-Jun 2026; fallback `tcGTQ = 7.61815`

---

## 8. Función de Descarga de Snapshots

La función `pdcDownload()` en `analytics.html` permite al Administrador descargar snapshots del dashboard para archivos históricos de cierre de mes.

**Mecanismo (v1.0 estable):**
1. `fetch(base + archivo, {cache:'no-store'})` → trae el HTML fuente real desde el mismo origin de GitHub Pages (sin CORS, misma URL base)
2. Strip del Auth Bridge con regex: `/<script>\s*\(function\(\)\s*\{[\s\S]*?Auth Bridge[\s\S]*?\}\)\(\);\s*<\/script>/`
3. Agrega watermark sticky `📸 SNAPSHOT PDC · fecha · Solo lectura · nombre`
4. Descarga como blob local (`text/html;charset=utf-8`)

**Resultado:** el archivo `.html` descargado abre directamente en el navegador sin requerir login, con todos los datos y gráficas del dashboard intactos.

---

## 9. Chat de Soporte (Supabase)

- Proyecto: `https://pytsrgtcjytjztwdlvux.supabase.co`
- Tabla: `chat_messages` — `id (uuid)`, `sender_email`, `sender_nombre`, `sender_role`, `message`, `is_read`, `created_at`
- Polling 3s (background) / 1.5s (chat abierto)
- ⚠️ `id` es UUID — usar `created_at` para detectar mensajes nuevos
- Supabase key (publishable): `sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj`

---

## 10. Integraciones Externas

- **Power Automate:** OneDrive (`/Reporte de Liquidaciones`) → notificación Teams canal "Dashboard KPIs"
- **MS Teams:** canal "C & C | Liquidaciones" — subcanalles: Dashboard KPIs · Reportes Mensuales · Alertas Vencidas

---

## 11. Diseño Corporativo (ver `STYLE_GUIDE.md`)

- **Paleta:** `--navy:#002060` · `--navy2:#003090` · `--sky:#CFEEFC` · semáforo verde/amarillo/rojo
- **Tipografía:** Inter (Google Fonts) · pesos 300–800
- **Fila consolidado:** siempre `background:#DCE8FE` + `color:var(--navy)` — nunca texto blanco
- **Logo PDC:** embebido en Base64 · `height:52px` · fondo blanco redondeado
- **Chart.js:** GT = azules `#002060`/`#00B8D9` · SV = cálidos `#E6501E`/`#FFAB00`
- **Tráfico (Cash Today):** SVG puro — no migrar a Chart.js (canvas falla en `display:none`)

---

## 12. Reglas de Desarrollo (ver `PROJECT_RULES.md`)

1. **Nunca reconstruir** — solo modificaciones quirúrgicas con verificación de target
2. Validar sintaxis JS después de cada cambio (`ob == cb` braces)
3. Respetar separación Depósito / Recogida en Cash Today
4. Precisión decimal: GTQ=0dec · USD=2dec — uniforme en celdas y totales
5. No hardcodear `tcGTQ` — usar `usd(r)` con TC mensual
6. No usar `localStorage`/`sessionStorage` dentro de artefactos Claude.ai
7. Actualizar `CHANGELOG.md` al finalizar cada sesión con cambios

---

## 13. Estado Actual · 20/06/2026

| Componente | Versión | Estado |
|---|---|---|
| PDC Analytics Center (portal) | v1.0 | ✅ Producción |
| login.html | v1.0 | ✅ Producción |
| analytics.html | v1.0 | ✅ Producción |
| Dashboard Rutas (index.html) | v12 | ✅ Producción |
| Dashboard Cash Today | v2.7 | ✅ Producción |
| Función descarga snapshots | v1.0 | ✅ Validada |

---

## 14. Próximos Pasos
Ver `ROADMAP.md`.

## 15. Historial de Cambios
Ver `CHANGELOG.md`.
