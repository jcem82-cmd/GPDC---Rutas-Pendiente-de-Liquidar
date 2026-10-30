// Ejecutar: node --experimental-strip-types core.test.mjs   (usa una BD simulada en memoria)
import { handle, generatePassword, validateEmail } from './core.ts';
import { randomInt } from 'node:crypto';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

function world() {
  const profiles = new Map(), authUsers = new Map(), audit = []; let n = 100;
  const add = (id, email, rol, activo = true) => { profiles.set(id, { id, email, nombre: 'N ' + id, rol, pais: 'GT', dashboards: ['rutas'], sedes: [], activo }); authUsers.set(id, { email, banned: false, pw: 'x' }); };
  add('A1', 'admin@grupopdc.com', 'admin'); add('A2', 'admin2@grupopdc.com', 'admin'); add('S1', 'sup@grupopdc.com', 'supervisor'); add('C1', 'cons@grupopdc.com', 'consulta');
  const tokens = { tA1: 'A1', tA2: 'A2', tS1: 'S1', tC1: 'C1' }; const fx = { failProfile: false, failBanProfile: false };
  const deps = {
    getAuthUser: async (jwt) => tokens[jwt] ? { id: tokens[jwt], email: profiles.get(tokens[jwt]).email } : null,
    getProfileById: async (id) => profiles.get(id) ? { ...profiles.get(id) } : null,
    getProfileByEmail: async (e) => [...profiles.values()].find(p => p.email.toLowerCase() === e.toLowerCase()) ?? null,
    countActiveAdmins: async () => [...profiles.values()].filter(p => p.rol === 'admin' && p.activo !== false).length,
    createAuthUser: async (email, pw) => { const id = 'U' + (++n); authUsers.set(id, { email, banned: false, pw }); return { id }; },
    deleteAuthUser: async (id) => { authUsers.delete(id); },
    setAuthPassword: async (id, pw) => { authUsers.get(id).pw = pw; return null; },
    setAuthBan: async (id, b) => { authUsers.get(id).banned = b; return null; },
    upsertProfile: async (row) => { if (fx.failProfile) return 'boom'; profiles.set(row.id, { ...(profiles.get(row.id) || {}), ...row }); return null; },
    updateProfile: async (id, patch) => { if (fx.failBanProfile && 'activo' in patch) return 'boom'; Object.assign(profiles.get(id), patch); return null; },
    writeAudit: async (r) => { audit.push(r); },
    genPassword: () => generatePassword((k) => randomInt(k)),
  };
  return { profiles, authUsers, audit, deps, fx };
}
const call = (w, token, body, method = 'POST') => handle(method, token ? 'Bearer ' + token : null, typeof body === 'string' ? body : JSON.stringify(body), w.deps);
const NEW = { action: 'create', email: 'Nuevo.Usuario@GrupoPDC.com', nombre: 'Nuevo Usuario', rol: 'consulta', pais: 'GT', dashboards: ['rutas'], sedes: ['CDA'] };

// ── Autenticación / autorización
let w = world(), r;
ok((await call(w, null, NEW)).status === 401, 'Sin token → 401');
ok((await call(w, 'falso', NEW)).status === 401, 'Token inválido → 401');
ok((await call(w, 'tC1', NEW)).status === 403, 'Rol consulta → 403');
ok((await call(w, 'tS1', NEW)).status === 403, 'Rol supervisor → 403');
ok((await call(w, 'tA1', NEW, 'GET')).status === 405, 'GET → 405');
ok((await call(w, 'tA1', '{no json')).status === 400, 'JSON roto → 400');
ok((await call(w, 'tA1', { action: 'borrar_todo' })).status === 400, 'Acción desconocida → 400');
w.profiles.get('A2').activo = false;
ok((await call(w, 'tA2', NEW)).status === 403, 'Admin INACTIVO → 403 (se valida en BD, no en el token)');
ok(w.profiles.size === 4 && w.audit.length === 0, 'Ningún rechazo dejó cambios ni auditoría');

// ── Crear
w = world(); r = await call(w, 'tA1', NEW);
ok(r.status === 200 && r.body.ok, 'Admin crea usuario');
const pw = r.body.temp_password;
ok(/^.{14}$/.test(pw) && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw), 'Contraseña temporal de 14 caracteres con 4 clases');
const p = w.profiles.get(r.body.id);
ok(p.email === 'nuevo.usuario@grupopdc.com', 'Correo normalizado a minúsculas');
ok(p.force_password_change === true && p.activo === true && p.rol === 'consulta' && p.pais === 'GT', 'Perfil: activo + force_password_change=true + rol/país');
ok(w.authUsers.get(r.body.id).pw === pw, 'La contraseña entregada es la que quedó en Auth');
ok(w.audit.length === 1 && w.audit[0].action === 'create' && !JSON.stringify(w.audit).includes(pw), 'Auditoría registrada SIN la contraseña');
ok((await call(w, 'tA1', { ...NEW, email: 'NUEVO.usuario@grupopdc.com' })).status === 409, 'Correo duplicado (case-insensitive) → 409');
for (const bad of ['x@gmail.com', 'x@grupopdc.com.evil.com', 'x@evilgrupopdc.com', 'a b@grupopdc.com', '@grupopdc.com', 'x@GRUPOPDC.COM.ar', 123, null])
  ok((await call(w, 'tA1', { ...NEW, email: bad })).status === 400, 'Correo rechazado: ' + JSON.stringify(bad));
ok((await call(w, 'tA1', { ...NEW, email: 'a@grupopdc.com', rol: 'superadmin' })).status === 400, 'Rol fuera de catálogo → 400');
ok((await call(w, 'tA1', { ...NEW, email: 'a@grupopdc.com', pais: 'HN' })).status === 400, 'Honduras (HN) rechazado → 400');
ok((await call(w, 'tA1', { ...NEW, email: 'a@grupopdc.com', dashboards: ['rutas', 'hack'] })).status === 400, 'Dashboard fuera de catálogo → 400');
ok((await call(w, 'tA1', { ...NEW, email: 'a@grupopdc.com', sedes: ['XX'] })).status === 400, 'Sede fuera de catálogo → 400');
ok((await call(w, 'tA1', { ...NEW, email: 'a@grupopdc.com', nombre: 'A' })).status === 400, 'Nombre demasiado corto → 400');
r = await call(w, 'tA1', { ...NEW, email: 'xss@grupopdc.com', nombre: '<img src=x onerror=alert(1)>Pepe' });
ok(r.status === 200 && !/[<>]/.test(w.profiles.get(r.body.id).nombre), 'Nombre sin < > (defensa XSS en origen)');
w.fx.failProfile = true; const nAuth = w.authUsers.size;
r = await call(w, 'tA1', { ...NEW, email: 'rollback@grupopdc.com' });
ok(r.status === 500 && w.authUsers.size === nAuth, 'Si falla el perfil, se revierte la cuenta de Auth (sin huérfanos)');
w.fx.failProfile = false;

// ── Update
w = world();
r = await call(w, 'tA1', { action: 'update', id: 'C1', rol: 'supervisor', pais: 'regional', dashboards: ['rutas', 'regional'] });
ok(r.status === 200 && w.profiles.get('C1').rol === 'supervisor' && w.profiles.get('C1').pais === 'regional', 'Admin cambia rol y país');
ok(w.audit.at(-1).detail.before.rol === 'consulta' && w.audit.at(-1).detail.after.rol === 'supervisor', 'Auditoría guarda antes/después');
ok((await call(w, 'tA1', { action: 'update', id: 'C1' })).status === 400, 'Update sin cambios → 400');
ok((await call(w, 'tA1', { action: 'update', id: 'NOEXISTE', rol: 'consulta' })).status === 404, 'Usuario inexistente → 404');
ok((await call(w, 'tA1', { action: 'update', id: 'A1', rol: 'consulta' })).status === 409, 'No puede quitarse su propio rol admin');
ok((await call(w, 'tA1', { action: 'update', id: 'A2', rol: 'consulta' })).status === 200, 'Puede degradar a OTRO admin si queda otro activo');
ok((await call(w, 'tA1', { action: 'update', id: 'C1', activo: false, email: 'x@x.com', force_password_change: false })).status === 400, 'Campos no editables (activo/email/force) ignorados → "sin cambios" 400');
w.profiles.get('A1').rol = 'admin'; w.profiles.get('A2').rol = 'consulta';
ok(w.profiles.get('C1').email === 'cons@grupopdc.com' && w.profiles.get('C1').activo === true, 'update no pudo cambiar email ni activo');

// ── set_active
w = world();
r = await call(w, 'tA1', { action: 'set_active', id: 'C1', activo: false });
ok(r.status === 200 && w.profiles.get('C1').activo === false && w.authUsers.get('C1').banned === true, 'Inactivar: perfil activo=false + cuenta Auth bloqueada');
r = await call(w, 'tA1', { action: 'set_active', id: 'C1', activo: true });
ok(r.status === 200 && w.profiles.get('C1').activo === true && w.authUsers.get('C1').banned === false, 'Reactivar: desbloquea Auth');
ok((await call(w, 'tA1', { action: 'set_active', id: 'A1', activo: false })).status === 409, 'No puede inactivarse a sí mismo');
ok((await call(w, 'tA1', { action: 'set_active', id: 'A2', activo: false })).status === 200, 'Puede inactivar a otro admin si queda uno activo');
ok((await call(w, 'tA1', { action: 'set_active', id: 'A1', activo: false })).status === 409, 'Último admin activo protegido');
w.fx.failBanProfile = true; w.profiles.get('S1').activo = true;
r = await call(w, 'tA1', { action: 'set_active', id: 'S1', activo: false });
ok(r.status === 500 && w.authUsers.get('S1').banned === false, 'Si falla el perfil al inactivar, se revierte el bloqueo de Auth');
ok((await call(w, 'tA1', { action: 'set_active', id: 'S1', activo: 'no' })).status === 400, 'activo no booleano → 400');
ok((await call(w, 'tA1', { action: 'delete', id: 'S1' })).status === 400, 'No existe acción de borrado (solo inactivar)');

// ── reset_password
w = world(); const old = w.authUsers.get('C1').pw; w.profiles.get('C1').force_password_change = false;
r = await call(w, 'tA1', { action: 'reset_password', id: 'C1' });
ok(r.status === 200 && r.body.temp_password !== old && w.authUsers.get('C1').pw === r.body.temp_password && w.profiles.get('C1').force_password_change === true, 'Reset: nueva temporal + obliga cambio');
ok(!JSON.stringify(w.audit).includes(r.body.temp_password), 'Reset auditado sin contraseña');
ok((await call(w, 'tC1', { action: 'reset_password', id: 'A1' })).status === 403, 'Un consulta no puede resetear la clave de un admin');

// ── Generador
const set = new Set(Array.from({ length: 2000 }, () => generatePassword((k) => randomInt(k))));
ok(set.size === 2000, 'Generador: 2000 contraseñas sin repetidos');
ok(![...set].some(x => /[0OIl1]/.test(x)), 'Generador: sin caracteres ambiguos (0 O I l 1)');
ok(validateEmail(' Admin@GRUPOPDC.com ') === 'admin@grupopdc.com', 'validateEmail recorta y normaliza');

console.log(fails ? `\nRESULTADO: ${fails} FALLAS` : '\nRESULTADO: TODO OK'); process.exit(fails ? 1 : 0);
