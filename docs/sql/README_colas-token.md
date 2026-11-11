# Edge Function `colas-token` — ingreso al Sistema de Colas desde PDC Analytics

**Qué hace:** emite un pase firmado (HMAC-SHA256, 60 s, un solo uso) para que un usuario de PDC Analytics con acceso `colas`, `colas_liq` o `colas_transp` entre al Dashboard del Sistema de Colas (red corporativa) sin contraseña. El servidor de colas valida el pase con el mismo secreto (sin internet) y abre una sesión de SOLO LECTURA limitada a su área.

**Accesos (panel de usuarios):** `colas` = todas las áreas · `colas_liq` = Liquidaciones · `colas_transp` = Transportes. Solo usuarios con país GT o regional.

## Despliegue
1. Generar un secreto aleatorio (PowerShell, una sola vez) y guardarlo en dos sitios: Supabase y `C:\SistemaColas\data\sso-secret.txt` del servidor de colas.
2. Supabase → Edge Functions → **Secrets** → `COLAS_SSO_SECRET` = el secreto.
3. Supabase → Edge Functions → nueva función `colas-token` → pegar `supabase/functions/colas-token/index.ts` → Deploy (Verify JWT activado).
4. Supabase → Edge Functions → `admin-users` → pegar `index.bundle.ts` actualizado (incluye los accesos nuevos) → Deploy.
5. Servidor de colas: desplegar la versión con `lib/sso.js` y reiniciar.

## Rotación del secreto
Cambiar en los dos lados (Supabase Secrets y `data\sso-secret.txt`). Los pases en vuelo (≤ 60 s) dejan de servir; las sesiones ya abiertas en colas siguen hasta su caducidad.
