// PDC Analytics Center · admin-users · ARCHIVO ÚNICO PARA PEGAR EN EL EDITOR DE SUPABASE
// Generado automáticamente = core.ts + index.ts. No editar a mano: editar core.ts/index.ts y regenerar.
// PDC Analytics Center · Edge Function admin-users · lógica de negocio (sin dependencias de Deno)
// Todas las reglas de seguridad viven AQUÍ (única fuente de verdad) y se prueban con tests/admin-users.test.mjs.
// Solo sintaxis TypeScript "borrable" (sin enums) para poder probarse con node --experimental-strip-types.

export const ROLES = ['admin', 'supervisor', 'consulta'];
export const PAISES = ['regional', 'GT', 'ESV', 'PE'];            // Honduras excluido por decisión del negocio
export const DASHBOARDS = ['rutas', 'cashtoday', 'regional', 'peru', 'elsalvador', 'cartas_salida', 'historico'];
export const SEDES = ['CDA', 'XELA', 'Sta.Tecla', 'Sn.Miguel', 'Peru'];
export const EMAIL_DOMAIN = '@grupopdc.com';

export type Profile = {
  id: string; email: string; nombre?: string; rol: string; pais?: string;
  sedes?: string[]; dashboards?: string[]; activo?: boolean;
};

export interface Deps {
  getAuthUser(jwt: string): Promise<{ id: string; email: string } | null>;
  getProfileById(id: string): Promise<Profile | null>;
  getProfileByEmail(email: string): Promise<Profile | null>;
  countActiveAdmins(): Promise<number>;
  createAuthUser(email: string, password: string): Promise<{ id?: string; error?: string }>;
  deleteAuthUser(id: string): Promise<void>;
  setAuthPassword(id: string, password: string): Promise<string | null>;
  setAuthBan(id: string, banned: boolean): Promise<string | null>;
  upsertProfile(row: Record<string, unknown>): Promise<string | null>;
  updateProfile(id: string, patch: Record<string, unknown>): Promise<string | null>;
  writeAudit(row: Record<string, unknown>): Promise<void>;
  genPassword(): string;
}

export type Result = { status: number; body: Record<string, unknown> };
const fail = (status: number, error: string): Result => ({ status, body: { ok: false, error } });
const ok = (extra: Record<string, unknown> = {}): Result => ({ status: 200, body: { ok: true, ...extra } });

/** Contraseña temporal: 14 caracteres, CSPRNG, sin símbolos ambiguos, con mayúscula, minúscula, número y símbolo. */
export function generatePassword(rand: (n: number) => number): string {
  const U = 'ABCDEFGHJKLMNPQRSTUVWXYZ', L = 'abcdefghijkmnopqrstuvwxyz', D = '23456789', S = '#$%&*+-=?@';
  const all = U + L + D + S;
  const pick = (set: string) => set[rand(set.length)];
  const chars = [pick(U), pick(L), pick(D), pick(S)];
  while (chars.length < 14) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) { const j = rand(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join('');
}

const isStr = (v: unknown): v is string => typeof v === 'string';
const subset = (arr: unknown, allowed: string[]): string[] | null =>
  Array.isArray(arr) && arr.every((x) => isStr(x) && allowed.includes(x)) ? Array.from(new Set(arr as string[])) : null;

export function validateEmail(v: unknown): string | null {
  if (!isStr(v)) return null;
  const e = v.trim().toLowerCase();
  if (e.length > 254 || !/^[a-z0-9._%+-]+@grupopdc\.com$/.test(e)) return null;
  return e;
}
function validateNombre(v: unknown): string | null {
  if (!isStr(v)) return null;
  const n = v.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim();
  return n.length >= 2 && n.length <= 80 ? n : null;
}

/** Valida y normaliza los campos editables de un perfil. Devuelve error o patch limpio. */
function parseFields(b: Record<string, unknown>, required: boolean): { err?: string; patch?: Record<string, unknown> } {
  const patch: Record<string, unknown> = {};
  if (b.nombre !== undefined || required) { const n = validateNombre(b.nombre); if (!n) return { err: 'Nombre inválido (2 a 80 caracteres).' }; patch.nombre = n; }
  if (b.rol !== undefined || required) { if (!isStr(b.rol) || !ROLES.includes(b.rol)) return { err: 'Rol inválido.' }; patch.rol = b.rol; }
  if (b.pais !== undefined || required) { if (!isStr(b.pais) || !PAISES.includes(b.pais)) return { err: 'País inválido.' }; patch.pais = b.pais; }
  if (b.dashboards !== undefined || required) { const d = subset(b.dashboards, DASHBOARDS); if (!d) return { err: 'Lista de dashboards inválida.' }; patch.dashboards = d; }
  if (b.sedes !== undefined || required) { const s = subset(b.sedes ?? [], SEDES); if (!s) return { err: 'Lista de sedes inválida.' }; patch.sedes = s; }
  return { patch };
}

export async function handle(
  method: string, authHeader: string | null, rawBody: string, deps: Deps,
): Promise<Result> {
  if (method !== 'POST') return fail(405, 'Método no permitido.');

  // 1) Autenticación: JWT válido verificado contra Supabase Auth
  const m = /^Bearer\s+(.+)$/i.exec(authHeader || '');
  if (!m) return fail(401, 'No autenticado.');
  const caller = await deps.getAuthUser(m[1]).catch(() => null);
  if (!caller) return fail(401, 'Sesión inválida o expirada.');

  // 2) Autorización: el llamador debe ser admin ACTIVO según la base de datos (no según el token)
  const me = await deps.getProfileById(caller.id);
  if (!me || me.rol !== 'admin' || me.activo === false) return fail(403, 'Acceso restringido a administradores.');

  let b: Record<string, unknown>;
  try { b = JSON.parse(rawBody || '{}'); if (!b || typeof b !== 'object' || Array.isArray(b)) throw 0; }
  catch { return fail(400, 'Solicitud inválida.'); }

  const audit = (action: string, target: { id?: string; email?: string }, detail: Record<string, unknown> = {}) =>
    deps.writeAudit({ actor_id: me.id, actor_email: me.email, action, target_id: target.id ?? null, target_email: target.email ?? null, detail });

  switch (b.action) {
    /* ───────── Crear usuario ───────── */
    case 'create': {
      const email = validateEmail(b.email);
      if (!email) return fail(400, 'El correo debe ser corporativo (' + EMAIL_DOMAIN + ').');
      const f = parseFields(b, true); if (f.err) return fail(400, f.err);
      if (await deps.getProfileByEmail(email)) return fail(409, 'Ya existe un usuario con ese correo.');
      const password = deps.genPassword();
      const created = await deps.createAuthUser(email, password);
      if (!created.id) return fail(created.error && /already|registered|exists/i.test(created.error) ? 409 : 500,
        created.error && /already|registered|exists/i.test(created.error) ? 'Ya existe un usuario con ese correo.' : 'No se pudo crear la cuenta.');
      const perr = await deps.upsertProfile({ id: created.id, email, ...f.patch, activo: true, force_password_change: true });
      if (perr) { await deps.deleteAuthUser(created.id); return fail(500, 'No se pudo crear el perfil; la operación fue revertida.'); }
      await audit('create', { id: created.id, email }, { rol: f.patch!.rol, pais: f.patch!.pais, dashboards: f.patch!.dashboards, sedes: f.patch!.sedes });
      return ok({ id: created.id, email, temp_password: password });
    }

    /* ───────── Editar rol / país / dashboards / sedes / nombre ───────── */
    case 'update': {
      if (!isStr(b.id)) return fail(400, 'Falta el usuario.');
      const t = await deps.getProfileById(b.id); if (!t) return fail(404, 'Usuario no encontrado.');
      const f = parseFields(b, false); if (f.err) return fail(400, f.err);
      if (!Object.keys(f.patch!).length) return fail(400, 'No hay cambios.');
      if (f.patch!.rol && f.patch!.rol !== 'admin' && t.rol === 'admin') {
        if (t.id === me.id) return fail(409, 'No puede quitarse a sí mismo el rol de administrador.');
        if (t.activo !== false && (await deps.countActiveAdmins()) <= 1) return fail(409, 'Debe existir al menos un administrador activo.');
      }
      const err = await deps.updateProfile(t.id, f.patch!); if (err) return fail(500, 'No se pudo actualizar el usuario.');
      const before: Record<string, unknown> = {}, after: Record<string, unknown> = {};
      for (const k of Object.keys(f.patch!)) { before[k] = (t as Record<string, unknown>)[k]; after[k] = f.patch![k]; }
      await audit('update', { id: t.id, email: t.email }, { before, after });
      return ok();
    }

    /* ───────── Activar / inactivar (nunca se elimina) ───────── */
    case 'set_active': {
      if (!isStr(b.id) || typeof b.activo !== 'boolean') return fail(400, 'Solicitud inválida.');
      const t = await deps.getProfileById(b.id); if (!t) return fail(404, 'Usuario no encontrado.');
      if (!b.activo) {
        if (t.id === me.id) return fail(409, 'No puede inactivar su propia cuenta.');
        if (t.rol === 'admin' && t.activo !== false && (await deps.countActiveAdmins()) <= 1) return fail(409, 'Debe existir al menos un administrador activo.');
      }
      const e1 = await deps.setAuthBan(t.id, !b.activo); if (e1) return fail(500, 'No se pudo cambiar el acceso de la cuenta.');
      const e2 = await deps.updateProfile(t.id, { activo: b.activo });
      if (e2) { await deps.setAuthBan(t.id, b.activo as boolean); return fail(500, 'No se pudo actualizar el estado; operación revertida.'); }
      await audit(b.activo ? 'activate' : 'deactivate', { id: t.id, email: t.email });
      return ok();
    }

    /* ───────── Restablecer contraseña (genera temporal + obliga cambio) ───────── */
    case 'reset_password': {
      if (!isStr(b.id)) return fail(400, 'Falta el usuario.');
      const t = await deps.getProfileById(b.id); if (!t) return fail(404, 'Usuario no encontrado.');
      const password = deps.genPassword();
      const e1 = await deps.setAuthPassword(t.id, password); if (e1) return fail(500, 'No se pudo restablecer la contraseña.');
      const e2 = await deps.updateProfile(t.id, { force_password_change: true });
      if (e2) return fail(500, 'Contraseña cambiada pero no se pudo exigir el cambio en el primer ingreso; repita la operación.');
      await audit('reset_password', { id: t.id, email: t.email });
      return ok({ id: t.id, email: t.email, temp_password: password });
    }

    default: return fail(400, 'Acción no reconocida.');
  }
}

// Gestión de usuarios (crear, editar, inactivar, restablecer contraseña) — SOLO administradores activos.
// La clave service_role vive únicamente aquí (variable de entorno del servidor); jamás llega al navegador.
// Despliegue: Supabase → Edge Functions → admin-users (ver docs/sql/README_admin-users.md).
// Lógica de negocio y reglas de seguridad: ./core.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const URL_ = Deno.env.get('SUPABASE_URL')!;
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(URL_, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

const CORS = {
  'Access-Control-Allow-Origin': '*',   // la autorización es por JWT (no cookies); la función valida rol admin en BD
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const rand = (n: number): number => {           // entero uniforme en [0,n) sin sesgo de módulo
  const max = Math.floor(0x100000000 / n) * n; const b = new Uint32Array(1);
  do { crypto.getRandomValues(b); } while (b[0] >= max);
  return b[0] % n;
};
const COLS = 'id,email,nombre,rol,pais,sedes,dashboards,activo';

const deps: Deps = {
  async getAuthUser(jwt) { const { data, error } = await sb.auth.getUser(jwt); return error || !data.user ? null : { id: data.user.id, email: data.user.email ?? '' }; },
  async getProfileById(id) { const { data } = await sb.from('profiles').select(COLS).eq('id', id).maybeSingle(); return (data as Profile) ?? null; },
  async getProfileByEmail(email) { const { data } = await sb.from('profiles').select(COLS).ilike('email', email).maybeSingle(); return (data as Profile) ?? null; },
  async countActiveAdmins() { const { count } = await sb.from('profiles').select('id', { count: 'exact', head: true }).eq('rol', 'admin').neq('activo', false); return count ?? 0; },
  async createAuthUser(email, password) { const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true }); return error || !data.user ? { error: error?.message ?? 'error' } : { id: data.user.id }; },
  async deleteAuthUser(id) { await sb.auth.admin.deleteUser(id); },
  async setAuthPassword(id, password) { const { error } = await sb.auth.admin.updateUserById(id, { password }); return error ? error.message : null; },
  async setAuthBan(id, banned) { const { error } = await sb.auth.admin.updateUserById(id, { ban_duration: banned ? '876000h' : 'none' }); return error ? error.message : null; },
  async upsertProfile(row) { const { error } = await sb.from('profiles').upsert(row, { onConflict: 'id' }); return error ? error.message : null; },
  async updateProfile(id, patch) { const { error } = await sb.from('profiles').update(patch).eq('id', id); return error ? error.message : null; },
  async writeAudit(row) { await sb.from('user_audit').insert(row); },
  genPassword: () => generatePassword(rand),
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const r = await handle(req.method, req.headers.get('Authorization'), await req.text(), deps);
  return new Response(JSON.stringify(r.body), { status: r.status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
});
