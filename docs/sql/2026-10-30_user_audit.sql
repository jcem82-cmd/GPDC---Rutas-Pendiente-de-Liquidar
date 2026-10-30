-- ============================================================
-- Etapa 1 · Gestión de usuarios — tabla de auditoría (inmutable)
-- Solo la Edge Function `admin-users` (service_role) escribe; solo los admin leen.
-- Idempotente. Reversa: drop table public.user_audit;
-- ============================================================
create table if not exists public.user_audit (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  actor_id     uuid,
  actor_email  text,
  action       text not null,          -- create | update | activate | deactivate | reset_password
  target_id    uuid,
  target_email text,
  detail       jsonb not null default '{}'::jsonb
);
create index if not exists user_audit_created_idx on public.user_audit (created_at desc);

alter table public.user_audit enable row level security;
drop policy if exists user_audit_select_admin on public.user_audit;
create policy user_audit_select_admin on public.user_audit
  for select to authenticated using (public.is_admin());

revoke all on public.user_audit from anon, authenticated;
grant select on public.user_audit to authenticated;   -- sin insert/update/delete: nadie desde el navegador puede alterar la bitácora
