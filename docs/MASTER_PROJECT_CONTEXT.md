# 📊 MASTER PROJECT CONTEXT — PDC Analytics Center | Grupo PDC

**Versión vigente:** v13 | **Última actualización:** 20/06/2026 | **Estado:** Producción ✅

---

## 1. Objetivo

Plataforma corporativa de Business Intelligence para Grupo PDC. Consolida dos dashboards ejecutivos (Liquidación de Rutas y Cash Today ATM) bajo un portal unificado con autenticación, control de acceso por rol y filtro de país automático. Opera en Guatemala, El Salvador, Perú y Honduras. Datos provenientes del ERP JDE vía Excel.

---

## 2. Personas y roles

| Email | Nombre | Rol | País | Dashboards |
|-------|--------|-----|------|------------|
| juancarlos.escobar@grupopdc.com | Juan Carlos Escobar | admin | regional | rutas + cashtoday |
| erwin.soto@grupopdc.com | Erwin Soto | supervisor | regional | rutas + cashtoday |
| francisco.aguilar@grupopdc.com | Francisco Aguilar | supervisor | GT | rutas + cashtoday |
| liquidaciones.cda@grupopdc.com | TEAM GT | consulta | GT | rutas + cashtoday |
| edy.lopez@grupopdc.com | Edy Lopez | consulta | GT | solo rutas |
| joaquin.palma@grupopdc.com | Joaquin Palma | consulta | ESV | rutas + cashtoday |
| liquidaciones.esv@grupopdc.com | TEAM ESV | consulta | ESV | rutas + cashtoday |
| vinicio.sanabria@grupopdc.com | Vinicio Sanabria | consulta | GT | solo rutas |
| claudio.rojas@grupopdc.com | Claudio Rojas | consulta | PE | solo rutas |
| jose.mallqui@grupopdc.com | Jose Mallqui | consulta | PE | solo rutas |
| transportes.peru@grupopdc.com | TEAM Perú | consulta | PE | solo rutas |

---

## 3. Tecnologías

HTML5 + CSS3 + JS vanilla (single-file) · Chart.js 4.4.1 · SheetJS 0.18.5 · Supabase (chat admin) · GitHub Pages (hosting) · GitHub REST API (deploy) · MS Teams + Power Automate.

---

## 4. Estructura del repositorio

```
GPDC---Rutas-Pendiente-de-Liquidar/  (branch: main)
├── login.html              # Autenticación — 11 usuarios, roles, generación pdc_session
├── analytics.html          # Portal principal — cards ejecutivas por rol/acceso
├── index.html              # Dashboard Liquidación de Rutas (single-file ~grande)
├── cash_today.html         # Dashboard Cash Today ATM (single-file ~9.3MB)
├── admin.html              # Panel admin — chat Supabase (solo rol admin)
├── hub.html                # Hub legacy (deprecado)
├── js/
│   ├── auth.js             # Funciones de sesión y autenticación
│   └── users.js            # Matriz centralizada de usuarios, roles y permisos
├── PDC_Dashboard_Config.md # Config técnica del sistema (v2.0)
├── PDC_MASTER_DOC.md       # Documento maestro legacy (pre-v13)
├── README.md
└── docs/
    ├── MASTER_PROJECT_CONTEXT.md  (este archivo)
    ├── CHANGELOG.md
    ├── ROADMAP.md
    ├── PROJECT_RULES.md
    └── README.md
```

---

## 5. Flujo de autenticación y navegación

```
login.html
  → valida credenciales contra PDC_USERS
  → guarda pdc_session en sessionStorage
  → redirige a analytics.html

analytics.html (Portal)
  → verifica pdc_session (TTL 8h)
  → muestra cards según dashboards[] del usuario
  → pdcGoToDashboard(archivo):
      index.html  → abre en misma pestaña (guarda pdc_user legacy)
      cash_today  → abre en nueva pestaña con ?pdc_token=base64(...)

index.html / cash_today.html / admin.html
  → Auth Bridge v2.0 (IIFE al inicio del body)
  → lee pdc_session → mapea a pdc_user
  → si no hay sesión → redirige a analytics.html
  → verifica acceso al dashboard → redirige si no autorizado
  → botones ⏏ Salir y ⬅ Portal en el header
  → filtro país automático (pdcAutoSetPais)
```

### Keys de sesión (sessionStorage)

| Key | Formato | Uso |
|-----|---------|-----|
| `pdc_session` | `{nombre, email, rol, pais, sedes, dashboards, acceso, ts}` | Principal — generada en login.html |
| `pdc_user` | `{nombre, email, role, pais, acceso}` | Legacy — generada por Auth Bridge para compatibilidad |
| TTL | 8 horas | Validado en analytics.html |

### Token URL (apertura en nueva pestaña)
```
?pdc_token=base64({email, nombre, rol, pais, sedes, acceso})
```
El Auth Bridge lo lee si no existe `pdc_session` ni `pdc_user` en sessionStorage.

---

## 6. Control de acceso por rol

| Función | admin | supervisor | consulta |
|---------|-------|-----------|---------|
| Ver dashboards autorizados | ✅ | ✅ | ✅ |
| Botón ⏏ Salir | ✅ | ✅ | ✅ |
| Botón ⬅ Portal | ✅ | ✅ | ✅ |
| 💱 Tipos de Cambio (tab) | ✅ | ❌ | ❌ |
| ⬇ Guardar Snapshot | ✅ | ❌ | ❌ |
| Panel admin.html | ✅ | ❌ | ❌ |
| Publicar en GitHub | ✅ | ❌ | ❌ |

### Filtro de país automático (index.html y cash_today.html)

| País usuario | Comportamiento |
|-------------|----------------|
| `regional` (admin/supervisor) | Ve todos los países, sin restricción |
| `GT` / `GT/CDA` | Forzado a Guatemala, selector deshabilitado |
| `ESV` | Forzado a El Salvador, selector deshabilitado |
| `PE` | Sin datos en Cash Today; solo Rutas |

---

## 7. Constantes de datos en index.html

- `RAW` — array de rutas pendientes (de `General (seguimiento)`)
- `KPI_TOTALS` — `{report_date, report_month, total_by_moneda, canal_totals}`
- `KPI_HIST` — `[{mes,vencidas,total,pct}]` → gráfica "Total Rutas vs Vencidas"
- `EFECT` — `[{mes,total,mas15,pct}]` → gráfica "Rutas ≥15 días"
- `FX` / `FX_DEF` — tipos de cambio (GTQ, PEN; USD=1:1 El Salvador)

**Importante:** `vencidas` y `mas15` son métricas independientes (no intercambiables).

---

## 8. Flujo de actualización diaria (self-service)

1. Admin entra a **💱 Tipos de Cambio → 📂 Actualizar Dashboard**
2. Sube `Rutas_no_Liquidadas_DD_MM_YYYY.xlsx` o `.xlsm`
3. `processWorkbook()` (SheetJS en navegador) regenera `RAW`, `KPI_TOTALS`, `KPI_HIST`, `EFECT`
4. Clic en **🚀 Publicar en GitHub** → PUT directo vía GitHub API
5. GitHub Pages despliega en ~80s

**Reglas de extracción críticas:**
- `General (seguimiento)`: `dropna(subset=['Numero de Despacho'])`; usar `Cliente` (mayúscula)
- País por moneda: GTQ→GT, USD→SV, PEN→PE, HNL→HN
- `Efectividad`: header en fila índice 2, datos desde índice 3
- Eliminar filas finales con `total=0` antes de derivar `kpiData`
- `KPI_HIST.vencidas` (mes activo) = max(EFECT.mas15, conteo real `Estado Real==='Vencidas'`)
- `EFECT.mas15` = valor real de Efectividad, sin override

---

## 9. Chat de soporte (Supabase)

- **Proyecto:** `https://pytsrgtcjytjztwdlvux.supabase.co`
- **Tabla:** `chat_messages` — `id (uuid)`, `sender_email`, `sender_nombre`, `sender_role`, `message`, `is_read`, `created_at`
- **Acceso:** Solo desde `admin.html` (rol admin)
- **Polling:** 3s background / 1.5s con chat abierto
- ⚠️ Usar `created_at` para detectar mensajes nuevos, nunca comparar UUID con `>`
- ⚠️ `#chatBox`: visibilidad 100% vía clase `.open` (CSS). No agregar `style="display:none"` inline

---

## 10. Credenciales y recursos

| Recurso | Valor |
|---------|-------|
| Portal principal | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html |
| Login | .../login.html |
| Dashboard Rutas | .../index.html |
| Dashboard Cash Today | .../cash_today.html |
| Admin Panel | .../admin.html |
| Repo | `jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar` (main) |
| Supabase URL | `https://pytsrgtcjytjztwdlvux.supabase.co` |
| Supabase key | `sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj` |
| MS Teams | "C & C \| Liquidaciones" — canales: Dashboard KPIs, Reportes Mensuales, Alertas Vencidas |

---

## 11. Integraciones externas

- **Power Automate Flujo 1:** OneDrive (`/Reporte de Liquidaciones`) → notificación Teams "Dashboard KPIs"
- **Power Automate Flujo 2:** Alertas rutas vencidas (en implementación)
- **Supabase:** Chat interno admin ↔ usuarios

---

## 12. Estado del sistema (20/06/2026)

- **v13** — PDC Analytics Center completo con 5 fases implementadas
- Todas las fases de auth, portal, guards y filtros están en producción
- Último dato cargado: 11/06/2026 (710 rutas, 36 vencidas)

---

## 13. Próximos pasos

Ver `ROADMAP.md`.

## 14. Historial de cambios

Ver `CHANGELOG.md`.
