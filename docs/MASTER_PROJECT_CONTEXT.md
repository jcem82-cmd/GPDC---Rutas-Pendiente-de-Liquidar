# 📊 MASTER PROJECT CONTEXT — Dashboard Liquidación de Rutas | Grupo PDC

**Versión vigente:** v12 | **Última actualización:** 12/06/2026 | **Estado:** Producción ✅

---

## 1. Objetivo

Dashboard Ejecutivo para Liquidación de Rutas (financiero/operativo/gerencial), monitoreo en tiempo real del estado de liquidación de rutas de despacho en Guatemala, El Salvador, Perú y Honduras. Centraliza datos del ERP JDE (vía Excel), genera KPIs ejecutivos, interfaz web autoactualizable.

## 2. Personas y roles

| Nombre | Rol |
|---|---|
| Juan Carlos Escobar | Admin |
| Erwin Soto | Usuario |
| Edy Lopez | Usuario |
| Francisco Aguilar | Usuario |
| Cuenta equipo | liquidaciones.cda@grupopdc.com |

## 3. Tecnologías
HTML5 + CSS3 + JS vanilla (single-file) · Chart.js 4.4.0 · SheetJS (XLSX.js 0.20.0) · Supabase (chat) · GitHub Pages + Actions (~80s deploy) · GitHub REST API · MS Teams + Power Automate.

## 4. Estructura del repo

```
GPDC---Rutas-Pendiente-de-Liquidar/  (branch: main)
├── index.html      # Dashboard principal (single-file)
├── login.html      # Autenticación, 6 usuarios, roles
├── admin.html      # Panel admin (chat)
└── docs/
    ├── README.md
    ├── MASTER_PROJECT_CONTEXT.md  (este archivo)
    ├── PROJECT_RULES.md
    ├── CHANGELOG.md
    └── ROADMAP.md
```

## 5. Constantes de datos en index.html

- `RAW` — array de rutas pendientes (de `General (seguimiento)`).
- `KPI_TOTALS` — `{report_date, report_month, total_by_moneda, canal_totals}`.
- `KPI_HIST` — `[{mes,vencidas,total,pct}]` → gráfica "Total Rutas vs Vencidas" (Tendencias KPI).
- `EFECT` — `[{mes,total,mas15,pct}]` → gráfica "Rutas ≥15 días" (Tendencias KPI, 2da gráfica).
- `FX` / `FX_DEF` — tipos de cambio (GTQ, PEN; USD=El Salvador fijo 1:1).

**Importante:** `vencidas` y `mas15` son métricas **independientes** (no intercambiables). Ver `PROJECT_RULES.md §2`.

## 6. Flujo de actualización diaria (canal preferente: self-service)

1. Usuario admin entra a **💱 Tipos de Cambio → 📂 Actualizar Dashboard**.
2. Sube `Rutas_no_Liquidadas_DD_MM_YYYY.xlsx` o `.xlsm`.
3. `processWorkbook()` (en navegador, SheetJS) regenera `RAW`, `KPI_TOTALS`, `KPI_HIST`, `EFECT`.
4. Clic en **🚀 Publicar en GitHub** → PUT directo vía GitHub API (token embebido fragmentado).
5. GitHub Actions despliega (~80s).

**Flujo alterno (este chat):** usuario sube el Excel al chat → Claude repite el mismo proceso vía `bash_tool` + GitHub API.

### Reglas de extracción (críticas)
- `General (seguimiento)`: `dropna(subset=['Numero de Despacho'])`; usar `Cliente` (mayúscula).
- País por `Moneda`: GTQ→GT, USD→SV, PEN→PE, HNL→HN.
- `Efectividad`: header en fila índice 2 (`header=None`/`{header:1,cellDates:true}`), datos desde índice 3.
- Eliminar filas finales con `total=0` (meses futuros plantilla) antes de derivar `kpiData`.
- `KPI_HIST.vencidas` (mes activo) = max(EFECT.mas15, conteo real `Estado Real==='Vencidas'`).
- `EFECT.mas15` = valor real de Efectividad, **sin override**.

## 7. Control de acceso por rol — ver `PROJECT_RULES.md §4` (tabla completa)

Resumen: **Admin** ve todo (incluye Snapshot y Tipos de Cambio). **Usuario regular** ve Resumen/Análisis/Transportistas/Tendencias/Detalle/Tableros + Chat + Salir, pero NO Snapshot ni Tipos de Cambio.

## 8. Chat de soporte (Supabase)

- Proyecto: `https://pytsrgtcjytjztwdlvux.supabase.co`
- Tabla: `chat_messages` — `id (uuid)`, `sender_email`, `sender_nombre`, `sender_role ('user'|'admin')`, `message`, `is_read`, `created_at`.
- Usuario → admin: insert con `sender_role='user'`.
- Admin → usuario: insert con `sender_email=<email_usuario>`, `sender_role='admin'`, `message='[To:'+email+'] '+texto`.
- Ambos consultan `WHERE sender_email = <email_del_usuario>` (trae conversación completa).
- Polling 3s (background) / 1.5s (chat abierto). Sin Realtime configurado.
- ⚠️ `id` es UUID — usar `created_at` para detectar mensajes nuevos, nunca comparar `id` con `>`.
- `#chatBox`: visibilidad 100% vía clase `.open` (CSS). Nunca agregar `style="display:none"` inline al contenedor.

## 9. Credenciales / Recursos

| Recurso | Valor |
|---|---|
| Live Dashboard | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/ |
| Login | .../login.html |
| Admin Panel | .../admin.html |
| Repo | `jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar` (main) |
| Token GitHub (fragmentado) | `['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'].join('')` |
| Supabase URL | `https://pytsrgtcjytjztwdlvux.supabase.co` |
| Supabase key (publishable) | `sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj` |
| MS Teams | "C & C \| Liquidaciones" — canales: Dashboard KPIs, Reportes Mensuales, Alertas Vencidas |

## 10. Integraciones
- Power Automate: OneDrive (`/Reporte de Liquidaciones`) → notificación a Teams canal "Dashboard KPIs".

## 11. Estado de datos (última carga: 11/06/2026)
- Total Rutas pendientes: 710 | Vencidas (Estado Real): ~36-44 según corte | Mes activo KPI_HIST 2026-06: vencidas=36, total=2066 | EFECT 2026-06 mas15=0.

## 12. Próximos pasos
Ver `ROADMAP.md`.

## 13. Historial de cambios
Ver `CHANGELOG.md`.
