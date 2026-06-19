/**
 * PDC Analytics Center — auth.js
 * Sistema centralizado de autenticación y control de acceso
 * Versión: 1.0 | Junio 2026
 *
 * DEPENDENCIA: Debe cargarse DESPUÉS de users.js
 *
 * USO EN DASHBOARDS:
 *   <script src="js/users.js"></script>
 *   <script src="js/auth.js"></script>
 *   <script>
 *     const _session = pdcRequireAuth('rutas');     // o 'cashtoday'
 *     // Si no hay sesión válida o no tiene permiso → redirige automáticamente
 *   </script>
 */

'use strict';

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────
const PDC_SESSION_KEY  = 'pdc_session';
const PDC_LOGIN_PAGE   = 'login.html';
const PDC_PORTAL_PAGE  = 'analytics.html';
const PDC_SESSION_TTL  = 8 * 60 * 60 * 1000; // 8 horas en ms

// ─────────────────────────────────────────────────────────────
// CREAR SESIÓN
// Construye y persiste el objeto de sesión tras login exitoso
// ─────────────────────────────────────────────────────────────
function pdcCreateSession(user) {
  const session = {
    email:      user.email,
    nombre:     user.nombre,
    rol:        user.rol,
    dashboards: user.dashboards,
    pais:       user.pais,
    sedes:      user.sedes,
    ts:         Date.now()
  };
  sessionStorage.setItem(PDC_SESSION_KEY, JSON.stringify(session));
  return session;
}

// ─────────────────────────────────────────────────────────────
// LEER SESIÓN
// Retorna el objeto de sesión si existe y es válido, null si no
// ─────────────────────────────────────────────────────────────
function pdcGetSession() {
  try {
    const raw = sessionStorage.getItem(PDC_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // Validar TTL
    if (Date.now() - session.ts > PDC_SESSION_TTL) {
      pdcDestroySession();
      return null;
    }
    return session;
  } catch (e) {
    pdcDestroySession();
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// DESTRUIR SESIÓN
// Limpia sessionStorage y redirige al login
// ─────────────────────────────────────────────────────────────
function pdcDestroySession() {
  sessionStorage.removeItem(PDC_SESSION_KEY);
}

// ─────────────────────────────────────────────────────────────
// LOGOUT
// Destruye la sesión y redirige al login
// ─────────────────────────────────────────────────────────────
function pdcLogout() {
  pdcDestroySession();
  // Resolver ruta relativa hacia login.html desde cualquier nivel
  const depth = (window.location.pathname.match(/\//g) || []).length - 1;
  const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
  window.location.href = prefix + PDC_LOGIN_PAGE;
}

// ─────────────────────────────────────────────────────────────
// GUARD PRINCIPAL — usar en todos los dashboards y el portal
//
// dashboardId: ID del dashboard a proteger (ej: 'rutas', 'cashtoday')
//              Pasar null para proteger páginas generales (portal)
//
// Flujo:
//   1. Sin sesión válida          → redirige a login.html
//   2. Sin permiso al dashboard   → redirige a analytics.html
//   3. Con sesión y permiso       → retorna objeto de sesión
// ─────────────────────────────────────────────────────────────
function pdcRequireAuth(dashboardId) {
  const session = pdcGetSession();

  if (!session) {
    window.location.href = PDC_LOGIN_PAGE;
    return null;
  }

  if (dashboardId && !session.dashboards.includes(dashboardId)) {
    window.location.href = PDC_PORTAL_PAGE;
    return null;
  }

  return session;
}

// ─────────────────────────────────────────────────────────────
// GUARD ADMIN — usar en páginas exclusivas de administrador
// ─────────────────────────────────────────────────────────────
function pdcRequireAdmin() {
  const session = pdcRequireAuth(null);
  if (!session) return null;

  if (session.rol !== 'admin') {
    window.location.href = PDC_PORTAL_PAGE;
    return null;
  }

  return session;
}

// ─────────────────────────────────────────────────────────────
// FILTRO DE SEDES — usar en Cash Today para usuarios restringidos
//
// Retorna array de sedes autorizadas para el usuario actual,
// o 'todas' si el usuario tiene acceso regional.
//
// Uso en Cash Today:
//   const sedesAuth = pdcGetSedesAutorizadas(session);
//   if (sedesAuth !== 'todas') {
//     // Aplicar filtro silencioso sobre los controles de sede
//   }
// ─────────────────────────────────────────────────────────────
function pdcGetSedesAutorizadas(session) {
  if (!session) return [];
  if (session.sedes === 'todas') return 'todas';
  return session.sedes;
}

// ─────────────────────────────────────────────────────────────
// VERIFICAR PERMISO DE ACCIÓN ESPECÍFICA
//
// Acciones disponibles:
//   'descargar'   — descargar archivos de dashboard
//   'subir'       — subir Excel de actualización
//   'actualizar'  — acceder a Tipos de Cambio / Config
//   'admin_panel' — acceso a admin.html
// ─────────────────────────────────────────────────────────────
function pdcCanDo(session, accion) {
  if (!session) return false;
  const accionesAdmin = ['descargar', 'subir', 'actualizar', 'admin_panel'];
  if (accionesAdmin.includes(accion)) {
    return session.rol === 'admin';
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// HELPER: Resolver ruta base del repositorio
// Necesario porque GitHub Pages sirve desde un subdirectorio
// ─────────────────────────────────────────────────────────────
function pdcBasePath() {
  const path = window.location.pathname;
  const repoMatch = path.match(/^(\/[^/]+\/)/);
  return repoMatch ? repoMatch[1] : '/';
}
