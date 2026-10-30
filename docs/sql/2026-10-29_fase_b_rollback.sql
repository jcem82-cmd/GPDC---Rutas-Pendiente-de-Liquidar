-- REVERSA de la Fase B: devuelve el chat al estado anterior (público). Usar solo si algo falla.
drop policy if exists chat_select        on public.chat_messages;
drop policy if exists chat_insert        on public.chat_messages;
drop policy if exists chat_update_admin  on public.chat_messages;
drop policy if exists chat_delete_admin  on public.chat_messages;
drop policy if exists public_access      on public.chat_messages;
create policy public_access on public.chat_messages for all to public using (true) with check (true);
grant all on public.chat_messages to anon;
