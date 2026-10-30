-- ============================================================
-- FASE A · profiles — impedir escalación de privilegios (OWASP A01)
-- Un usuario no-admin solo puede cambiar force_password_change,
-- ultimo_acceso y last_login de SU propia fila. Todo lo demás
-- (rol, pais, sedes, dashboards, activo, email, nombre, id)
-- queda reservado a admin (is_admin()), SQL Editor o service_role.
-- ============================================================

create or replace function public.profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SQL Editor / service_role / Edge Function: no hay usuario JWT -> permitido
  if auth.uid() is null then
    return new;
  end if;

  -- Administradores: permitido
  if public.is_admin() then
    return new;
  end if;

  -- Usuario normal: toda columna distinta de las 3 permitidas debe quedar intacta
  if (to_jsonb(new) - array['force_password_change','ultimo_acceso','last_login'])
     is distinct from
     (to_jsonb(old) - array['force_password_change','ultimo_acceso','last_login'])
  then
    raise exception 'No autorizado: solo un administrador puede modificar este campo'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_trg on public.profiles;
create trigger profiles_guard_trg
  before update on public.profiles
  for each row execute function public.profiles_guard();

-- Defensa en profundidad: la app nunca escribe en profiles como anónimo,
-- ni inserta/borra perfiles desde el navegador (eso lo hará la Edge Function).
revoke insert, update, delete on public.profiles from anon;
revoke insert, delete on public.profiles from authenticated;
