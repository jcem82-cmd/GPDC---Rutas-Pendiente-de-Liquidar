# 🗺️ ROADMAP — Dashboard Liquidación de Rutas

## ✅ Completado (v11-v12)
- Login + roles (admin/usuario)
- Chat de soporte funcional para todos los roles
- Control de acceso por rol (Snapshot, Tipos de Cambio = admin-only)
- Botón Salir (todos los roles)
- Módulo Tipos de Cambio self-service (.xlsx y .xlsm)
- Fix histórico KPI_HIST vs EFECT (métricas independientes correctas)
- Power Automate → Teams (notificación de nuevos reportes)

## 🟡 Próximos pasos (corto plazo)
- [ ] **Histórico mensual automatizado**: carpeta `/snapshots/` en GitHub con un HTML por fecha de cierre + página índice de consulta.
- [ ] **Segundo flujo Power Automate**: alertas Teams automáticas cuando rutas pasan a estado "Vencidas".
- [ ] Validar consistencia mes a mes entre `KPI_HIST.vencidas` y `EFECT.mas15` con cada carga (puede haber meses donde ambas convergen — confirmar que no haya regresión).
- [ ] Supabase Realtime (reemplazar polling de 3s/1.5s) — opcional, mejora UX del chat.

## 🔵 Mediano plazo
- [ ] **IA predictiva**: proyección de rutas en riesgo de vencimiento basada en tendencia histórica (KPI_HIST).
- [ ] **Exportación PDF** ejecutiva del resumen general.
- [ ] **Migración a SharePoint** (cuando IT habilite permisos) — mover `/Reporte de Liquidaciones` desde OneDrive personal.

## 🟣 Largo plazo / evaluar
- [ ] Integración Power BI como capa de análisis complementaria.
- [ ] Integración SAP (si aplica según evolución del ERP).
- [ ] Automatización hoja `Estatus` de JDE vía Power Query (ODBC/OLE DB).

## 🧹 Deuda técnica conocida
- Sin exportación a PDF (solo snapshot HTML standalone).
- Snapshots se descargan manualmente, sin versionado automático por fecha.
- Dependencia de CDN (Chart.js, SheetJS, Supabase JS) — snapshots requieren internet para renderizar gráficas.
- Revisar si quedan otras clases `admin-visible` hardcodeadas en HTML (patrón que causó bugs repetidos — ver PROJECT_RULES.md §4).
