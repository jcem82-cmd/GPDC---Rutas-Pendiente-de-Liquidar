// ═══════════════════════════════════════════════════════════════
// Supabase Edge Function: colas-token
// Emite el "pase" de ingreso al Dashboard del Sistema de Colas (red corporativa).
//  · Solo para usuarios autenticados, activos y con acceso colas / colas_liq / colas_transp.
//  · Pase: base64url(JSON).base64url(HMAC-SHA256) · vigencia 60 s · un solo uso (jti).
//  · El secreto COLAS_SSO_SECRET vive solo aquí (Supabase Secrets) y en config.json del servidor de colas.
//
// Despliegue: Supabase → Edge Functions → Deploy a new function → nombre exacto `colas-token`
//   → pegar este archivo → Deploy (dejar Verify JWT activado).
//   Secrets → agregar COLAS_SSO_SECRET (mínimo 32 caracteres, aleatorio).
// ═══════════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const SB_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SECRETO = Deno.env.get('COLAS_SSO_SECRET') ?? '';
const sb = createClient(SB_URL, SB_SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

const CORS = {
  'Access-Control-Allow-Origin': '*',   // autorización por JWT (sin cookies); el pase solo sirve en la red corporativa
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const VIGENCIA_S = 60;
const PAISES_COLAS = ['regional', 'GT'];   // el sistema de colas actual es solo Guatemala

const b64u = (b: ArrayBuffer | Uint8Array) => {
  const u = b instanceof Uint8Array ? b : new Uint8Array(b);
  let s = ''; u.forEach((x) => (s += String.fromCharCode(x)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const txt = (s: string) => new TextEncoder().encode(s);

/** Alcance a partir de los accesos del perfil. */
export function areaDe(dashboards: string[]): 'todas' | 'general' | 'transportes' | null {
  const d = Array.isArray(dashboards) ? dashboards : [];
  if (d.includes('colas')) return 'todas';
  const liq = d.includes('colas_liq'), tr = d.includes('colas_transp');
  if (liq && tr) return 'todas';
  if (liq) return 'general';
  if (tr) return 'transportes';
  return null;
}

async function firmar(cuerpo: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', txt(SECRETO), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', k, txt(cuerpo)));
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { ok: false, error: 'Método no permitido.' });
  if (SECRETO.length < 32) return json(500, { ok: false, error: 'Ingreso a Colas no configurado (falta COLAS_SSO_SECRET).' });

  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) return json(401, { ok: false, error: 'No autenticado.' });
  const { data: au, error: eAu } = await sb.auth.getUser(jwt);
  if (eAu || !au.user) return json(401, { ok: false, error: 'Sesión inválida.' });

  const { data: p } = await sb.from('profiles').select('email,nombre,pais,dashboards,activo').eq('id', au.user.id).maybeSingle();
  if (!p || p.activo === false) return json(403, { ok: false, error: 'Usuario inactivo.' });
  const area = areaDe(p.dashboards);
  if (!area) return json(403, { ok: false, error: 'Sin acceso al Sistema de Colas.' });
  if (!PAISES_COLAS.includes(String(p.pais))) return json(403, { ok: false, error: 'El Sistema de Colas disponible corresponde a Guatemala.' });

  const ahora = Math.floor(Date.now() / 1000);
  const cuerpo = b64u(txt(JSON.stringify({
    v: 1, sub: String(p.email).toLowerCase(), nom: String(p.nombre ?? p.email), area,
    iat: ahora, exp: ahora + VIGENCIA_S, jti: crypto.randomUUID().replace(/-/g, ''),
  })));
  const pase = cuerpo + '.' + await firmar(cuerpo);

  return json(200, { ok: true, pase, area, expira_en: VIGENCIA_S });
});
