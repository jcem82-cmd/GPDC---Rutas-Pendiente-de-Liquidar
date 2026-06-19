/**
 * PDC Analytics Center — users.js
 * Matriz centralizada de usuarios, roles y permisos
 * Versión: 1.0 | Junio 2026
 *
 * INSTRUCCIONES DE MANTENIMIENTO:
 * - Para agregar un usuario: añadir entrada al array PDC_USERS
 * - Para agregar un dashboard: añadir entrada al array PDC_DASHBOARDS
 * - Para modificar permisos: editar el campo 'dashboards' y 'sedes' del usuario
 * - Cambiar contraseñas antes de cada deploy a producción
 */

'use strict';

// ─────────────────────────────────────────────────────────────
// DASHBOARDS REGISTRADOS EN LA PLATAFORMA
// Para agregar un nuevo dashboard: añadir una entrada aquí.
// No se requiere modificar auth.js ni analytics.html.
// ─────────────────────────────────────────────────────────────
const PDC_DASHBOARDS = [
  {
    id:          'rutas',
    nombre:      'Liquidación de Rutas',
    descripcion: 'Monitoreo en tiempo real del estado de liquidación de rutas de despacho. Incluye KPIs financieros, análisis por transportista y seguimiento de rutas vencidas.',
    archivo:     'index.html',
    icono:       '🚚',
    paises:      ['GT', 'ESV', 'PE', 'HN'],
    activo:      true
  },
  {
    id:          'cashtoday',
    nombre:      'Cash Today',
    descripcion: 'Dashboard ejecutivo de recolección de efectivo ATM. Volumetría, costos de servicio, límites operativos y análisis de tráfico por sede.',
    archivo:     'cash_today.html',
    icono:       '💰',
    paises:      ['GT', 'ESV'],
    activo:      true
  }
  // Para agregar nuevos dashboards en el futuro, insertar aquí:
  // {
  //   id:          'nuevo_dashboard',
  //   nombre:      'Nombre del Dashboard',
  //   descripcion: 'Descripción ejecutiva.',
  //   archivo:     'nombre_archivo.html',
  //   icono:       '📊',
  //   paises:      ['GT'],
  //   activo:      true
  // }
];

// ─────────────────────────────────────────────────────────────
// SEDES POR PAÍS
// Referencia para validación de acceso por sede
// ─────────────────────────────────────────────────────────────
const PDC_SEDES = {
  GT:  ['CDA', 'XELA'],
  ESV: ['Sta.Tecla', 'Sn.Miguel'],
  PE:  ['Peru'],
  HN:  ['Honduras']
};

// ─────────────────────────────────────────────────────────────
// MATRIZ DE USUARIOS
//
// Campos:
//   email      — identificador único (login)
//   pass       — contraseña (texto plano, consistente con arquitectura actual)
//   nombre     — nombre para mostrar en la UI
//   rol        — 'admin' | 'supervisor' | 'consulta'
//   dashboards — array de IDs de dashboards con acceso
//   pais       — 'regional' | 'GT' | 'ESV' | 'PE' | 'HN'
//   sedes      — array de sedes autorizadas ('todas' para acceso completo)
//
// Roles:
//   admin      — acceso total: descarga, subida, actualización, admin panel
//   supervisor — acceso a dashboards autorizados, sin descarga/subida/actualización
//   consulta   — solo visualización de dashboards autorizados
// ─────────────────────────────────────────────────────────────
const PDC_USERS = [
  {
    email:      'juancarlos.escobar@grupopdc.com',
    pass:       'PDC.Admin@2026',
    nombre:     'Juan Carlos Escobar',
    rol:        'admin',
    dashboards: ['rutas', 'cashtoday'],
    pais:       'regional',
    sedes:      'todas'
  },
  {
    email:      'erwin.soto@grupopdc.com',
    pass:       'PDC.Sup.Reg@2026',
    nombre:     'Erwin Soto',
    rol:        'supervisor',
    dashboards: ['rutas', 'cashtoday'],
    pais:       'regional',
    sedes:      'todas'
  },
  {
    email:      'francisco.aguilar@grupopdc.com',
    pass:       'PDC.Sup.GT@2026',
    nombre:     'Francisco Aguilar',
    rol:        'supervisor',
    dashboards: ['rutas', 'cashtoday'],
    pais:       'GT',
    sedes:      ['CDA']
  },
  {
    email:      'liquidaciones.cda@grupopdc.com',
    pass:       'PDC.TeamGT@2026',
    nombre:     'TEAM GT',
    rol:        'consulta',
    dashboards: ['rutas', 'cashtoday'],
    pais:       'GT',
    sedes:      ['CDA', 'XELA']
  },
  {
    email:      'edy.lopez@grupopdc.com',
    pass:       'PDC.Con.GT@2026',
    nombre:     'Edy Lopez',
    rol:        'consulta',
    dashboards: ['rutas'],
    pais:       'GT',
    sedes:      ['CDA']
  },
  {
    email:      'joaquin.palma@grupopdc.com',
    pass:       'PDC.Con.ESV@2026',
    nombre:     'Joaquin Palma',
    rol:        'consulta',
    dashboards: ['rutas', 'cashtoday'],
    pais:       'ESV',
    sedes:      ['Sta.Tecla', 'Sn.Miguel']
  },
  {
    email:      'liquidaciones.esv@grupopdc.com',
    pass:       'PDC.TeamESV@2026',
    nombre:     'TEAM ESV',
    rol:        'consulta',
    dashboards: ['rutas', 'cashtoday'],
    pais:       'ESV',
    sedes:      ['Sta.Tecla', 'Sn.Miguel']
  },
  {
    email:      'vinicio.sanabria@grupopdc.com',
    pass:       'PDC.Con.GT2@2026',
    nombre:     'Vinicio Sanabria',
    rol:        'consulta',
    dashboards: ['rutas'],
    pais:       'GT',
    sedes:      ['CDA']
  },
  {
    email:      'claudio.rojas@grupopdc.com',
    pass:       'PDC.Con.PE@2026',
    nombre:     'Claudio Rojas',
    rol:        'consulta',
    dashboards: ['rutas'],
    pais:       'PE',
    sedes:      ['Peru']
  },
  {
    email:      'jose.mallqui@grupopdc.com',
    pass:       'PDC.Con.PE2@2026',
    nombre:     'Jose Mallqui',
    rol:        'consulta',
    dashboards: ['rutas'],
    pais:       'PE',
    sedes:      ['Peru']
  },
  {
    email:      'transportes.peru@grupopdc.com',
    pass:       'PDC.TeamPE@2026',
    nombre:     'TEAM Perú',
    rol:        'consulta',
    dashboards: ['rutas'],
    pais:       'PE',
    sedes:      ['Peru']
  }
];

// ─────────────────────────────────────────────────────────────
// FUNCIÓN DE AUTENTICACIÓN
// Retorna el objeto de usuario si las credenciales son válidas,
// null en caso contrario.
// ─────────────────────────────────────────────────────────────
function pdcAuthenticate(email, pass) {
  if (!email || !pass) return null;
  const user = PDC_USERS.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase()
      && u.pass === pass
  );
  return user || null;
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN: Obtener dashboards disponibles para un usuario
// Retorna array de objetos dashboard con los metadatos completos
// ─────────────────────────────────────────────────────────────
function pdcGetUserDashboards(user) {
  if (!user) return [];
  return PDC_DASHBOARDS.filter(
    d => d.activo && user.dashboards.includes(d.id)
  );
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN: Verificar si el usuario tiene acceso a un dashboard
// ─────────────────────────────────────────────────────────────
function pdcCanAccess(user, dashboardId) {
  if (!user || !dashboardId) return false;
  return user.dashboards.includes(dashboardId);
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN: Verificar si el usuario tiene acceso de admin
// ─────────────────────────────────────────────────────────────
function pdcIsAdmin(user) {
  return user && user.rol === 'admin';
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN: Verificar si el usuario tiene acceso regional
// (puede ver todos los países)
// ─────────────────────────────────────────────────────────────
function pdcIsRegional(user) {
  return user && user.pais === 'regional';
}
