# ROADMAP — PDC Analytics Center | Grupo PDC

**Estado actual: v1.0 ESTABLE** · Próxima versión objetivo: v1.1
**Última actualización:** 20/06/2026

---

## ✅ FASE 0 — Fundación de Plataforma (COMPLETADA · v1.0 · Jun 2026)

### Portal y Autenticación Unificada
- [x] `login.html` — login corporativo único · diseño split-screen · 11 usuarios · 3 roles
- [x] `analytics.html` — portal hub · tarjetas de acceso · panel de administración
- [x] Sistema de sesión unificado (`pdc_session` + `pdc_user` legacy compat)
- [x] Guard de autenticación en portal — redirect a login si sin sesión
- [x] Compatibilidad hacia atrás con dashboards legacy (`index.html`, `cash_today.html`)
- [x] Función `pdcDownload` — snapshots sin login para archivos históricos de cierre de mes
- [x] Regex validado contra Auth Bridge v2.0 real de `index.html`
- [x] Diseño corporativo PDC ejecutivo · responsive · animaciones profesionales
- [x] Deploy vía GitHub REST API al repo existente

### Dashboards Integrados (legados)
- [x] Dashboard Rutas v12 — `index.html` · 4 países · Auth Bridge v2.0
- [x] Dashboard Cash Today v2.7 — `cash_today.html` · 10 módulos · 35,089 registros

---

## 🔵 FASE 1 — Consolidación y Mejoras Portal (v1.1 · Por priorizar)

### Portal (`analytics.html`)
- [ ] **Integrar Auth Bridge** en `cash_today.html` igual al de `index.html` (actualmente sin guard)
- [ ] **Sesión expirando:** notificación proactiva 15 min antes del vencimiento de las 8h
- [ ] **Último acceso:** mostrar fecha/hora del último login en el portal
- [ ] **Breadcrumb de retorno:** botón en cada dashboard para volver al portal sin perder sesión

### Login (`login.html`)
- [ ] **Bloqueo temporal** tras 3 intentos fallidos consecutivos (30 segundos)
- [ ] **Recordar email** — checkbox para persistir el último email usado (`localStorage`)

### Descarga de Snapshots
- [ ] **Snapshot Cash Today:** implementar misma lógica `fetch` + strip para `cash_today.html`
  (actualmente muestra alerta; requiere identificar su Auth Bridge si lo tiene)
- [ ] **Nombre de archivo con fecha:** `Dashboard_Rutas_YYYY-MM-DD.html` — ya implementado en Rutas
- [ ] **Notificación en pantalla:** toast visual de descarga completada (sin `alert()`)

---

## 🟡 FASE 2 — Nuevos Dashboards (v1.2 · Roadmap)

### Arquitectura de integración de nuevos dashboards
Todo nuevo dashboard deberá:
1. Registrarse en el array `PDC_DASHBOARDS` de `analytics.html`
2. Incluir Auth Bridge compatible con `pdc_session` / `pdc_user`
3. Respetar paleta y estilos del `STYLE_GUIDE.md`
4. No modificar `login.html` ni la lógica de sesión

### Dashboards candidatos
- [ ] **Dashboard Perú (PE):** Liquidación de rutas específico para operaciones Perú
- [ ] **Dashboard Honduras (HN):** Liquidación de rutas Honduras
- [ ] **Dashboard Consolidado Regional:** KPIs multi-país en una sola vista
- [ ] **Dashboard Presupuesto vs Real:** monto recolectado vs. presupuesto mensual por sede
  - Requiere: nueva hoja `Presupuesto` en Excel de Cash Today

---

## 🟠 FASE 3 — Evolución Dashboard Rutas (v13 · En paralelo)

- [ ] Alertas automáticas de rutas vencidas vía Teams (Power Automate)
- [ ] Módulo de análisis por transportista mejorado
- [ ] Export PDF ejecutivo del mes seleccionado
- [ ] Histórico de snapshots mensual gestionado desde el portal

---

## 🟠 FASE 4 — Evolución Dashboard Cash Today (v2.8 · En paralelo)

- [ ] **Módulo Presupuesto vs Real:** monto recolectado vs. presupuesto mensual por sede
- [ ] **Alertas automáticas:** semáforo cuando sede supera 85% cupo o baja de 70% presupuesto
- [ ] **Export PDF ejecutivo:** reporte del mes seleccionado desde módulo Resumen
- [ ] **TC histórico 2025:** ampliar `_TC_MENSUAL` para meses anteriores a Ene 2026
- [ ] **Análisis de festivos:** impacto de días festivos en recolección (campo `hol` disponible)

---

## 🔴 FASE 5 — Plataforma Avanzada (v2.0 · Largo Plazo)

- [ ] **Admin Dashboard:** gestión de usuarios desde el portal (alta/baja/modificación de accesos)
- [ ] **Notificaciones push:** alertas proactivas vía Teams cuando KPIs superan umbrales
- [ ] **Modo oscuro:** toggle en portal con persistencia en `localStorage`
- [ ] **API Gateway:** abstracción de fuentes de datos (ERP, SAP, bancos)
- [ ] **IA predictiva:** flujo de efectivo, alertas de vencimientos anticipadas
- [ ] **Aplicación nativa:** Progressive Web App (PWA) instalable en móvil

---

## 📋 BACKLOG — Correcciones y Deuda Técnica

| Prioridad | Descripción | Archivo | Origen |
|---|---|---|---|
| Alta | Integrar Auth Bridge en `cash_today.html` | cash_today.html | Fase 1 |
| Alta | Alinear versión SheetJS: Rutas 0.20.0 vs Cash Today 0.18.5 | Ambos | Style Guide |
| Media | Alinear versión Chart.js: Rutas 4.4.0 vs Cash Today 4.4.1 | Ambos | Style Guide |
| Media | Validar visitas SV (STA TECLA, SAN MIGUEL) con Recogidas | cash_today.html | v2.7 |
| Media | Documentar variables CSS `:root` en `index.html` (actualmente sin sistema de variables) | index.html | Style Guide |
| Baja | Tooltip hover en gráfica Tráfico | cash_today.html | v2.7 |
| Baja | Badge "último mes cargado" en Resumen Cash Today | cash_today.html | v2.7 |
| Baja | Paginación Detalle más visible en móvil | cash_today.html | v2.7 |

---

## 🗓 PROCESO DE ACTUALIZACIÓN DE DATOS

### Dashboard Rutas
**Frecuencia:** diaria / al cierre de mes

1. Ingresar al portal → Acceder a Rutas → tab "Tipos de Cambio" → "Actualizar Dashboard"
2. Subir `Rutas_no_Liquidadas_DD_MM_YYYY.xlsx`
3. `processWorkbook()` regenera constantes JS en el navegador
4. Clic "Publicar en GitHub" → PUT vía GitHub API → deploy ~80s

**Flujo alterno (Claude):** subir Excel al chat → Claude procesa vía `bash_tool` + GitHub API

### Dashboard Cash Today
**Frecuencia:** mensual (al cierre de mes operativo)

1. Exportar Excel desde sistema Cash Today
2. Nuevo chat en Claude → pegar `MASTER_PROJECT_CONTEXT.md`
3. Subir `cash_today.html` + Excel nuevo
4. Claude aplica modificación quirúrgica y sube vía GitHub API

### Snapshots de Cierre de Mes
1. Ingresar al portal como Administrador
2. Panel de Administración → "Descargar Rutas"
3. El archivo `.html` se descarga sin autenticación y se guarda localmente
4. Nombrar: `Dashboard_Rutas_YYYY-MM.html` para el archivo histórico

---

*PDC Analytics Center · Grupo PDC · Departamento Financiero · v1.0 · Junio 2026*
