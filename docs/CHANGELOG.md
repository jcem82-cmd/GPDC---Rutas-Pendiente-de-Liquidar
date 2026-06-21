# CHANGELOG — PDC Analytics Center | Grupo PDC

---

## [v1.0] · 20/06/2026 — PDC Analytics Center · LANZAMIENTO ✅

### Alcance
Primera versión de la plataforma corporativa unificada de Business Intelligence. Implementa el portal de acceso centralizado con autenticación única para todos los dashboards del Grupo PDC.

### Nuevos archivos

| Archivo | Descripción |
|---|---|
| `login.html` | Login corporativo único — diseño split-screen, 11 usuarios, 3 roles |
| `analytics.html` | Portal Hub — tarjetas de dashboards, panel de administración, navegación |

### Funcionalidades implementadas

#### `login.html`
- Diseño split-screen: panel izquierdo branding PDC + panel derecho formulario
- Grid pattern y orbs de glow sobre fondo `--navy` con degradado
- Estadísticas del sistema visibles antes de ingresar (710 rutas · 4 países · 11 usuarios)
- Vista previa de módulos disponibles (Rutas · Cash Today)
- Validación de campos en tiempo real con mensajes de error específicos
- Toggle mostrar/ocultar contraseña
- Spinner de carga con estado "Verificando..." (600ms simulado para UX)
- Animación `shake` en formulario cuando las credenciales son incorrectas
- Auto-redirect si ya existe sesión válida (`pdc_session`) al cargar la página
- Escribe `pdc_session` y `pdc_user` (legacy compat) en `sessionStorage`
- Diseño responsive — panel izquierdo se oculta en mobile ≤900px

#### `analytics.html`
- Loading overlay azul PDC que se disuelve al confirmar sesión válida
- Header sticky con logo PDC, nav pills (Mis Dashboards · Administración), avatar con iniciales, botón Salir
- Hero banner con saludo dinámico por hora del día, fecha en español, chips de estado con animación pulse
- KPIs globales en hero (solo para usuarios `pais: regional`)
- Cards de dashboards con accent bar por color corporativo (Rutas: azul degradado · Cash Today: naranja/amarillo)
- Cada card incluye: ícono, nombre, categoría, descripción, badge "Activo", países filtrados por perfil del usuario, KPI mini-row (3 métricas), botón "Acceder →"
- Animación de entrada escalonada por card (`cardIn` con `animation-delay`)
- Panel de Administración visible solo para `rol: admin` con 5 acciones: Actualizar Rutas · Actualizar Cash Today · Panel Administrativo · Descargar Rutas · Descargar Cash Today
- Footer con estado del sistema ("Sistema operativo" con dot pulsante) y versión

#### Función `pdcDownload` — Snapshots sin login
- Usa `fetch(base + archivo, {cache:'no-store'})` al mismo origin de GitHub Pages
- Strip del Auth Bridge v2.0 con regex validado contra `index.html` real del repositorio:
  `/<script>\s*\(function\(\)\s*\{[\s\S]*?Auth Bridge[\s\S]*?\}\)\(\);\s*<\/script>/`
- Agrega watermark sticky amarillo: `📸 SNAPSHOT PDC · fecha · Solo lectura · nombre`
- Descarga como `Blob` local (`text/html;charset=utf-8`) — sin dependencias de red al abrir
- El archivo descargado abre directamente sin requerir autenticación
- Estado del botón: Descargando → ✅ Descargado (3s) → restaura estado original
- Diseñado para archivos históricos de cierre de mes

#### Sistema de sesión unificado
- Clave `pdc_session`: objeto `{email, nombre, rol, dashboards, pais, sedes, ts}` · TTL 8h
- Clave `pdc_user`: legacy compat para dashboards existentes · `{nombre, email, role}`
- Guard en `analytics.html`: sin sesión válida → redirect a `login.html`
- `pdcNavigate()`: escribe `pdc_user` antes de navegar a dashboard legacy
- `pdcBridgeToTab()`: navega a dashboard legacy + activa tab específico vía `?tab=`

### Arquitectura de acceso por rol
| Función | admin | supervisor | consulta |
|---|---|---|---|
| Portal y dashboards autorizados | ✅ | ✅ | ✅ |
| Panel de administración | ✅ | ❌ | ❌ |
| Descargar snapshots | ✅ | ❌ | ❌ |
| Actualizar datos | ✅ | ❌ | ❌ |

### Deploy
- Ambos archivos subidos vía GitHub REST API PUT al repo `jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar` (branch: main)
- GitHub Pages activo en: `https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/`

---

## Historial previo por proyecto

### Dashboard Rutas — v12 · 12/06/2026
- Auth Bridge v2.0 integrado en `index.html`
- 710 rutas activas · 36 vencidas · última carga 11/06/2026
- Ver contexto detallado en `MASTER_PROJECT_CONTEXT.md §7.1`

### Dashboard Cash Today — v2.7 · Junio 2026
- 10 módulos funcionales · 35,089 transacciones Jun 2025 → Jun 2026
- TC mensual BANGUAT · Volumetría · Costo Servicio multi-país
- Ver contexto detallado en `MASTER_PROJECT_CONTEXT.md §7.2`

---
*Actualizar este archivo al finalizar cada sesión de desarrollo*
