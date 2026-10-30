// PDC Analytics Center · Edge Function `admin-users`
// Gestión de usuarios (crear, editar, inactivar, restablecer contraseña) — SOLO administradores activos.
// La clave service_role vive únicamente aquí (variable de entorno del servidor); jamás llega al navegador.
// Despliegue: Supabase → Edge Functions → admin-users (ver docs/sql/README_admin-users.md).
// Lógica de negocio y reglas de seguridad: ./core.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { handle, generatePassword } from './core.ts';
import type { Deps, Profile } from './core.ts';

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
