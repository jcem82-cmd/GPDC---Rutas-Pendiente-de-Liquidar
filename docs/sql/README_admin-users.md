# Edge Function `admin-users` — despliegue (Etapa 1, gestión de usuarios)

**Qué hace:** crear usuarios (@grupopdc.com), editar rol/país/dashboards/sedes, inactivar/reactivar y restablecer contraseña. Genera una contraseña temporal (se muestra UNA vez al admin) y obliga el cambio en el primer ingreso. No elimina usuarios. Solo responde a administradores activos (valida en la BD, no solo en el token).

**Seguridad:** la clave `service_role` solo existe como variable del servidor de Supabase (ya disponible por defecto en las Edge Functions); nunca va en el HTML.

## Pasos
1. **SQL Editor** → ejecutar `docs/sql/2026-10-30_user_audit.sql` (crea la bitácora `user_audit`, inmutable, solo lectura para admin).
2. **Edge Functions → Deploy a new function → Via Editor** → nombre exacto `admin-users` → pegar TODO el contenido de `supabase/functions/admin-users/index.bundle.ts` → Deploy.
3. Dejar activada la opción **Verify JWT** (valor por defecto).
4. Verificación rápida (sin sesión debe rechazar): la función responde `401 No autenticado.`

## Mantenimiento
- Código fuente: `core.ts` (reglas) + `index.ts` (conexión a Supabase). `index.bundle.ts` es la concatenación para pegar.
- Pruebas: `cd supabase/functions/admin-users && node --experimental-strip-types core.test.mjs` (53 pruebas con BD simulada).
- Nota: la regla "debe quedar un admin activo" es defensa en profundidad; con la regla "no auto-inactivarse" no es alcanzable por un solo admin, pero protege ante condiciones de carrera.
