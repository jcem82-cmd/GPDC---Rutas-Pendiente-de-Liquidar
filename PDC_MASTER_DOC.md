# PDC Analytics Center — Documento Maestro
**Versión:** 1.0 | **Fecha:** Junio 2026 | **Autor:** Charly / Grupo PDC

---

## 1. ARQUITECTURA DEL SISTEMA

### URLs
- **Portal principal:** `https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html`
- **Login:** `https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/login.html`
- **Dashboard Rutas:** `https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/index.html`
- **Dashboard Cash Today:** `https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/cash_today.html`
- **Admin:** `https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/admin.html`

### Repositorio
- **GitHub:** `jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar` | Branch: `main`

### Stack Tecnológico
- HTML5 + JavaScript vanilla (sin frameworks)
- Chart.js 4.4.1 | SheetJS 0.18.5
- Supabase (chat en admin.html)
- Hosting: GitHub Pages

---

## 2. FLUJO DE AUTENTICACIÓN

```
login.html → [valida credenciales] → guarda pdc_session → analytics.html
analytics.html → [verifica sesión] → muestra portal con cards según acceso
card click → [pdcGoToDashboard()] → guarda pdc_user (legacy) → dashboard
dashboard → [Auth Bridge IIFE] → verifica pdc_session + pdc_user → redirige si no válido
```

### Keys de sesión
| Key | Formato | Uso |
|-----|---------|-----|
| `pdc_session` | `{nombre, email, rol, pais, sedes, dashboards, acceso, ts}` | Principal |
| `pdc_user` | `{nombre, email, role, pais, acceso}` | Legacy (compatibilidad dashboards) |
| TTL | 8 horas | Validado en analytics.html |

---

## 3. USUARIOS DEL SISTEMA

| Email | Password | Nombre | Rol | País | Dashboards |
|-------|----------|--------|-----|------|------------|
| juancarlos.escobar@grupopdc.com | PDC.Admin@2026 | Juan Carlos Escobar | admin | regional | rutas + cashtoday |
| erwin.soto@grupopdc.com | PDC.Sup.Reg@2026 | Erwin Soto | supervisor | regional | rutas + cashtoday |
| francisco.aguilar@grupopdc.com | PDC.Sup.GT@2026 | Francisco Aguilar | supervisor | GT | rutas + cashtoday |
| liquidaciones.cda@grupopdc.com | PDC.TeamGT@2026 | TEAM GT | consulta | GT | rutas + cashtoday |
| edy.lopez@grupopdc.com | PDC.Con.GT@2026 | Edy Lopez | consulta | GT | solo rutas |
| joaquin.palma@grupopdc.com | PDC.Con.ESV@2026 | Joaquin Palma | consulta | ESV | rutas + cashtoday |
| liquidaciones.esv@grupopdc.com | PDC.TeamESV@2026 | TEAM ESV | consulta | ESV | rutas + cashtoday |
| vinicio.sanabria@grupopdc.com | PDC.Con.GT2@2026 | Vinicio Sanabria | consulta | GT | solo rutas |
| claudio.rojas@grupopdc.com | PDC.Con.PE@2026 | Claudio Rojas | consulta | PE | solo rutas |
| jose.mallqui@grupopdc.com | PDC.Con.PE2@2026 | Jose Mallqui | consulta | PE | solo rutas |
| transportes.peru@grupopdc.com | PDC.TeamPE@2026 | TEAM Peru | consulta | PE | solo rutas |

---

## 4. ARCHIVOS DEL PROYECTO

| Archivo | Función | Estado |
|---------|---------|--------|
| `login.html` | Login + auth + lista de usuarios | ✅ Producción |
| `analytics.html` | Portal principal con cards ejecutivas | ✅ Producción |
| `index.html` | Dashboard Liquidación de Rutas | ✅ Producción |
| `cash_today.html` | Dashboard Cash Today | ✅ Producción |
| `admin.html` | Panel admin (chat Supabase) | ✅ Producción |
| `hub.html` | Hub legacy (deprecado) | ⚠️ Legacy |
| `js/` | Scripts auxiliares (si aplica) | — |

---

## 5. FASES COMPLETADAS

### Fase 1 — Auth Core
- `login.html`: formulario + validación + generación de `pdc_session`
- Lista de 11 usuarios con roles, países y accesos

### Fase 2 — Portal
- `analytics.html`: cards ejecutivas por dashboard
- Muestra solo los dashboards a los que tiene acceso el usuario
- Sección admin visible solo para rol admin

### Fase 3 — Guard en index.html y admin.html
- **Auth Bridge v2.0** en `index.html`: IIFE al inicio del body
  - Lee `pdc_session` → mapea a `pdc_user` legacy
  - Redirige a `analytics.html` si no hay sesión
- **Botón ⬅ Portal** en index.html (visible para todos)
- **Guard en admin.html**: verifica `role === 'admin'`

### Fase 4 — Guard + Filtro País en cash_today.html
- **Auth Bridge v2.0** insertado después de `<body>`
- Verifica acceso a cashtoday (redirige si no tiene acceso)
- **Botones ⏏ Salir y ⬅ Portal** en el header
- **`pdcAutoSetPais()`**: fuerza filtro de país según sesión
  - GT/GT/CDA → Guatemala (selector bloqueado)
  - ESV → El Salvador (selector bloqueado)
  - admin/supervisor → sin restricción
- Llamada en `DOMContentLoaded` antes de `initFilters()`

### Fase 5 — Producción
- **Logo PDC real** en analytics.html (imagen base64 embebida)
- Documentación maestro generada

---

## 6. LÓGICA DE FILTRO POR PAÍS (cash_today.html)

```javascript
function pdcAutoSetPais(){
  // Lee sesión pdc_session o pdc_user
  // Si rol es admin o supervisor → no restringe
  // Si pais es 'regional' o '' → no restringe
  // Mapeo: GT/GT/CDA → 'Guatemala' | ESV → 'El Salvador' | PE → '' (sin datos)
  // Si hay valor: sel.value = valor; sel.disabled = true; onPaisChange()
}
```

---

## 7. SUPABASE (admin.html / chat)

- **URL:** `https://pytsrgtcjytjztwdlvux.supabase.co`
- **Key pública:** `sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj`

---

## 8. PENDIENTES FUTUROS (backlog)

| # | Tarea | Prioridad |
|---|-------|-----------|
| A | Filtro de sede automático en index.html (Rutas) según `sedes` en sesión | Media |
| B | Ocultar módulo Tab "💱 Tipos de Cambio" en cash_today para no-admin | Baja |
| C | Mover lista de usuarios a archivo externo (JS o JSON en repo privado) | Media |
| D | Token de GitHub: rotar periódicamente | Alta |
| E | Integrar Power Automate Flujo 3 (resumen ejecutivo semanal) | Media |
| F | Integrar Power Automate Flujo 4 (validación anomalías) con dashboard | Alta |

---

## 9. NOTAS TÉCNICAS

- **Auth Bridge**: siempre es una IIFE (función autoejecutable) al inicio del `<body>` para bloquear render antes de validar sesión
- **sessionStorage** (no localStorage): la sesión expira al cerrar el navegador
- **cash_today.html es ~9.3 MB**: contiene datos embebidos; no editar manualmente sin herramienta
- **Compatibilidad legacy**: `pdc_user` mantiene `role` (no `rol`) para compatibilidad con guards anteriores
- **GitHub Pages**: puede tardar 1-3 minutos en reflejar cambios después de commit

