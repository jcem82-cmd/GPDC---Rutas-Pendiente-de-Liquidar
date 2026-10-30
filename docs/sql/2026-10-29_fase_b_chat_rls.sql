-- ============================================================
-- FASE B · chat_messages — cerrar el acceso público (OWASP A01)
-- Antes: policy "public_access" = ALL / true / rol público (cualquiera con la
--        clave pública leía, escribía y borraba todo el chat).
-- Ahora: solo usuarios autenticados, cada uno con su propia conversación.
-- ============================================================

-- 1) Eliminar la política abierta y las nuevas si existieran (idempotente)
drop policy if exists public_access      on public.chat_messages;
drop policy if exists chat_select        on public.chat_messages;
drop policy if exists chat_insert        on public.chat_messages;
drop policy if exists chat_update_admin  on public.chat_messages;
drop policy if exists chat_delete_admin  on public.chat_messages;

-- 2) Lectura: el admin ve todo; cada usuario ve solo su conversación
--    (mensajes suyos y respuestas del admin dirigidas a su correo)
create policy chat_select on public.chat_messages
  for select to authenticated
  using (
    public.is_admin()
    or lower(sender_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- 3) Escritura: admin sin restricción de remitente; usuario solo como "user"
--    y con su propio correo. Mensaje de 1 a 2000 caracteres.
create policy chat_insert on public.chat_messages
  for insert to authenticated
  with check (
    char_length(message) between 1 and 2000
    and (
      public.is_admin()
      or (
        sender_role = 'user'
        and lower(sender_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
    )
  );

-- 4) Marcar como leído y borrar: solo admin
create policy chat_update_admin on public.chat_messages
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy chat_delete_admin on public.chat_messages
  for delete to authenticated
  using (public.is_admin());

-- 5) Sin acceso anónimo; los autenticados conservan sus permisos (filtrados por RLS)
revoke all on public.chat_messages from anon;
grant select, insert, update, delete on public.chat_messages to authenticated;
