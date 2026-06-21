# 🗺️ ROADMAP — PDC Analytics Center

---

## ✅ Completado

### v11-v12 — Dashboard Liquidación de Rutas
- [x] Login + roles (admin / supervisor / consulta)
- [x] Chat de soporte funcional para todos los roles (Supabase polling)
- [x] Control de acceso por rol (Snapshot, Tipos de Cambio = admin-only)
- [x] Botón ⏏ Salir (todos los roles)
- [x] Módulo Tipos de Cambio self-service (.xlsx y .xlsm)
- [x] Fix histórico KPI_HIST vs EFECT (métricas independientes)
- [x] Power Automate → Teams (notificación nuevos reportes)

### v13 — PDC Analytics Center (Junio 2026)
- [x] **Fase 1:** `users.js` + `auth.js` + `login.html` con 11 usuarios
- [x] **Fase 2:** Portal `analytics.html` con cards ejecutivas por rol/acceso
- [x] **Fase 3:** Auth Bridge v2.0 + botón ⬅ Portal en `index.html` y guard en `admin.html`
- [x] **Fase 4:** Auth Bridge v2.0 + filtro país automático + botones Salir/Portal en `cash_today.html`
- [x] **Fase 5:** Token URL enriquecido (pais/sedes/acceso) + documentación completa (MASTER, CHANGELOG, ROADMAP, PDC_Dashboard_Config)

---

## 🟡 Próximos pasos (corto plazo)

- [ ] **Prueba de acceso por usuario:** Verificar flujo completo con cada uno de los 11 usuarios (login → portal → dashboard → filtro país)
- [ ] **Histórico mensual automatizado:** Carpeta `/snapshots/` en GitHub con un HTML por fecha de cierre + página índice de consulta
- [ ] **Power Automate Flujo 2:** Alertas Teams automáticas cuando rutas pasan a estado "Vencidas"
- [ ] **Validación consistencia mensual:** Confirmar que `KPI_HIST.vencidas` y `EFECT.mas15` no generen regresión con cada carga
- [ ] **Botón ⬅ Portal en admin.html:** Agregar acceso directo al portal desde el panel admin

---

## 🔵 Mediano plazo

- [ ] **IA predictiva:** Proyección de rutas en riesgo de vencimiento basada en KPI_HIST
- [ ] **Exportación PDF ejecutiva** del resumen general
- [ ] **Supabase Realtime** (reemplazar polling 3s/1.5s) — mejora UX del chat
- [ ] **Migración a SharePoint** (cuando IT habilite permisos) — mover `/Reporte de Liquidaciones`
- [ ] **Nuevo dashboard PE:** Cash Today Perú (actualmente sin datos en cash_today.html)

---

## 🟣 Largo plazo / evaluar

- [ ] Integración Power BI como capa de análisis complementaria
- [ ] Integración SAP (si aplica según evolución del ERP)
- [ ] Automatización hoja `Estatus` de JDE vía Power Query (ODBC/OLE DB)
- [ ] Backend real (Node.js / Supabase Functions) para eliminar credenciales client-side
- [ ] Autenticación SSO con Microsoft 365 (Azure AD)

---

## 🧹 Deuda técnica conocida

- Credenciales en texto plano client-side (arquitectura sin backend — intencional por ahora)
- Sin exportación a PDF (solo snapshot HTML standalone)
- Snapshots se descargan manualmente, sin versionado automático por fecha
- Dependencia de CDN (Chart.js, SheetJS, Supabase JS) — snapshots requieren internet para gráficas
- `cash_today.html` con datos embebidos (~9.3MB) — actualización manual del archivo
- `hub.html` legacy deprecado — pendiente de eliminar cuando se confirme que nadie lo usa
- Revisar si quedan otras clases `admin-visible` hardcodeadas en HTML (patrón que causó bugs repetidos)
- Token GitHub embebido fragmentado en `index.html` (riesgo de exposición al rotar el token)
