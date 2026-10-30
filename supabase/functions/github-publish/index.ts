// ═══════════════════════════════════════════════════════════════
// Supabase Edge Function: github-publish
// Reemplaza el token de GitHub expuesto en cash_today.html.
// El token vive AQUÍ (secret server-side), nunca en el navegador.
//
// Cómo crearla:
// 1. Supabase Dashboard → Edge Functions → Create a new function
// 2. Nombre: github-publish
// 3. Pegue este código completo
// 4. Deploy
// 5. Settings de la función → Secrets → agregar GITHUB_TOKEN con el
//    valor del nuevo token fine-grained que generó en GitHub
// ═══════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const REPO = 'jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar'
const ALLOWED_PATHS = ['cash_today.html', 'cash_summary.json', 'cartas_salida.html', 'cartas_summary.json', 'index.html']

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN')!

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Verificar que quien llama está autenticado y es admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: corsHeaders })
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Sesión inválida' }), { status: 401, headers: corsHeaders })
    }
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('rol,activo').eq('id', user.id).single()
    if (profileError || !profile || profile.rol !== 'admin' || profile.activo === false) {
      return new Response(JSON.stringify({ error: 'Solo administradores pueden publicar' }), { status: 403, headers: corsHeaders })
    }

    // 2. Validar el request
    const body = await req.json()
    const { path, content_base64, sha, message } = body
    if (!ALLOWED_PATHS.includes(path)) {
      return new Response(JSON.stringify({ error: 'Ruta no permitida: ' + path }), { status: 400, headers: corsHeaders })
    }
    if (!content_base64 || !message) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), { status: 400, headers: corsHeaders })
    }

    // 3. Hacer el PUT a GitHub con el token secreto (nunca visible al cliente)
    const ghPayload: Record<string, unknown> = {
      message,
      content: content_base64,
      branch: 'main',
    }
    if (sha) ghPayload.sha = sha

    const ghRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ghPayload),
    })

    const ghResult = await ghRes.json()
    if (!ghRes.ok) {
      return new Response(JSON.stringify({ error: 'GitHub rechazó la publicación', detail: ghResult }), { status: ghRes.status, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true, sha: ghResult.content?.sha }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders })
  }
})
