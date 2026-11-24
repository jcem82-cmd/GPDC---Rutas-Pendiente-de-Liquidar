-- ============================================================================
-- PDC Analytics Center · Vacaciones multipaís (GT / ESV / PE)  ·  2026-11-24
-- Reemplaza los datos incrustados en vacaciones_gt.html por tablas en Supabase.
--   · Lectura : admin, y supervisor/consulta con el dashboard 'vacaciones' asignado y su país
--               (pais='regional' ve los 3). Escritura: SOLO admin (is_admin()).
--   · Bitácora inmutable (vac_historial) por trigger: quién, cuándo, antes/después.
--   · Idempotente: se puede ejecutar de nuevo sin duplicar datos ni borrar cambios hechos.
-- Reversa : drop table public.vac_historial, public.vac_dias, public.vac_horarios,
--           public.vac_reglas, public.vac_personas, public.vac_paises cascade;
--           drop function public.vac_puede_ver(text), public.vac_pais_persona(uuid), public.vac_log();
-- Ejecutar en: Supabase → SQL Editor → pegar TODO → Run.
-- ============================================================================

-- 1) TABLAS ------------------------------------------------------------------
create table if not exists public.vac_paises (
  pais        text primary key check (pais in ('GT','ESV','PE')),
  nombre      text not null,
  oper_ini    int  not null default 360  check (oper_ini between 0 and 1440),   -- minutos desde 00:00
  oper_fin    int  not null default 1440 check (oper_fin between 0 and 1440),
  sab_auto    boolean not null default false,  -- true: el sábado la ventana = turno de quien corresponde (sábados alternos)
  actualizado timestamptz not null default now()
);

create table if not exists public.vac_personas (
  id        uuid primary key default gen_random_uuid(),
  pais      text not null references public.vac_paises(pais) on update cascade,
  codigo    text not null,
  nombre    text not null,
  corto     text not null,
  color     text not null default '#00216f' check (color ~ '^#[0-9a-fA-F]{6}$'),
  oscuro    boolean not null default false,
  sab       text not null default 'todos' check (sab in ('todos','no','alterno')),
  sab_ancla date,                               -- un sábado en que SÍ labora (para sab='alterno')
  orden     int  not null default 0,
  activo    boolean not null default true,
  unique (pais, codigo)
);

create table if not exists public.vac_horarios (
  id         uuid primary key default gen_random_uuid(),
  persona_id uuid not null references public.vac_personas(id) on delete cascade,
  desde      date not null,
  hasta      date,
  turno      int  not null check (turno between 1 and 9),
  ini        text not null check (ini ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  fin        text not null check (fin ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  check (hasta is null or hasta >= desde)
);
create index if not exists vac_horarios_persona_idx on public.vac_horarios (persona_id, desde);

-- Excepciones al patrón (lunes–sábado turno regular; domingo/feriado descanso):
--   V vacaciones (valor 1 ó 0.5; si 0.5, ini/fin = horas que sí labora) · L labora/cubre · D descanso
create table if not exists public.vac_dias (
  id          uuid primary key default gen_random_uuid(),
  persona_id  uuid not null references public.vac_personas(id) on delete cascade,
  fecha       date not null,
  tipo        text not null check (tipo in ('V','L','D')),
  valor       numeric(2,1) not null default 1 check (valor in (0.5,1)),
  ini         text check (ini is null or ini ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  fin         text check (fin is null or fin ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  actualizado timestamptz not null default now(),
  unique (persona_id, fecha)
);
create index if not exists vac_dias_fecha_idx on public.vac_dias (fecha);

create table if not exists public.vac_reglas (
  id        uuid primary key default gen_random_uuid(),
  pais      text not null references public.vac_paises(pais) on update cascade,
  fecha     date not null,
  tipo      text not null check (tipo in ('feriado','ventana','nota')),
  texto     text,
  desde_min int check (desde_min between 0 and 1440),
  hasta_min int check (hasta_min between 0 and 1440),
  unique (pais, fecha, tipo)
);

create table if not exists public.vac_historial (
  id        bigint generated always as identity primary key,
  creado    timestamptz not null default now(),
  actor_id  uuid,
  actor_email text,
  pais      text,
  tabla     text not null,
  accion    text not null,            -- INSERT | UPDATE | DELETE
  persona   text,
  fecha_ref date,
  antes     jsonb,
  despues   jsonb
);
create index if not exists vac_historial_creado_idx on public.vac_historial (creado desc);

-- 2) FUNCIONES DE ACCESO ---------------------------------------------------------
create or replace function public.vac_puede_ver(p_pais text)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.is_admin(), false)
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and coalesce(p.activo, true)
          and p.rol in ('supervisor','consulta')
          and jsonb_exists(to_jsonb(p.dashboards), 'vacaciones')
          and (lower(p.pais) = 'regional' or upper(p.pais) = upper(p_pais))
      );
$$;

create or replace function public.vac_pais_persona(p_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select pais from public.vac_personas where id = p_id;
$$;

-- 3) RLS ---------------------------------------------------------------------------
alter table public.vac_paises    enable row level security;
alter table public.vac_personas  enable row level security;
alter table public.vac_horarios  enable row level security;
alter table public.vac_dias      enable row level security;
alter table public.vac_reglas    enable row level security;
alter table public.vac_historial enable row level security;

revoke all on public.vac_paises, public.vac_personas, public.vac_horarios, public.vac_dias, public.vac_reglas, public.vac_historial from anon;
grant select, insert, update, delete on public.vac_paises, public.vac_personas, public.vac_horarios, public.vac_dias, public.vac_reglas to authenticated;
revoke all on public.vac_historial from authenticated;
grant select on public.vac_historial to authenticated;     -- sin insert/update/delete: la bitácora no se puede alterar

do $$
declare t text;
begin
  foreach t in array array['vac_paises','vac_personas','vac_horarios','vac_dias','vac_reglas'] loop
    execute format('drop policy if exists %I on public.%I', t||'_sel', t);
    execute format('drop policy if exists %I on public.%I', t||'_ins', t);
    execute format('drop policy if exists %I on public.%I', t||'_upd', t);
    execute format('drop policy if exists %I on public.%I', t||'_del', t);
  end loop;
end $$;

create policy vac_paises_sel   on public.vac_paises   for select to authenticated using (public.vac_puede_ver(pais));
create policy vac_personas_sel on public.vac_personas for select to authenticated using (public.vac_puede_ver(pais));
create policy vac_horarios_sel on public.vac_horarios for select to authenticated using (public.vac_puede_ver(public.vac_pais_persona(persona_id)));
create policy vac_dias_sel     on public.vac_dias     for select to authenticated using (public.vac_puede_ver(public.vac_pais_persona(persona_id)));
create policy vac_reglas_sel   on public.vac_reglas   for select to authenticated using (public.vac_puede_ver(pais));

create policy vac_paises_ins   on public.vac_paises   for insert to authenticated with check (public.is_admin());
create policy vac_paises_upd   on public.vac_paises   for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy vac_paises_del   on public.vac_paises   for delete to authenticated using (public.is_admin());
create policy vac_personas_ins on public.vac_personas for insert to authenticated with check (public.is_admin());
create policy vac_personas_upd on public.vac_personas for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy vac_personas_del on public.vac_personas for delete to authenticated using (public.is_admin());
create policy vac_horarios_ins on public.vac_horarios for insert to authenticated with check (public.is_admin());
create policy vac_horarios_upd on public.vac_horarios for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy vac_horarios_del on public.vac_horarios for delete to authenticated using (public.is_admin());
create policy vac_dias_ins     on public.vac_dias     for insert to authenticated with check (public.is_admin());
create policy vac_dias_upd     on public.vac_dias     for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy vac_dias_del     on public.vac_dias     for delete to authenticated using (public.is_admin());
create policy vac_reglas_ins   on public.vac_reglas   for insert to authenticated with check (public.is_admin());
create policy vac_reglas_upd   on public.vac_reglas   for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy vac_reglas_del   on public.vac_reglas   for delete to authenticated using (public.is_admin());

drop policy if exists vac_historial_sel on public.vac_historial;
create policy vac_historial_sel on public.vac_historial for select to authenticated using (public.is_admin());

-- 4) DATOS INICIALES (idempotentes; se cargan ANTES de crear la bitácora para no llenarla de ruido)
insert into public.vac_paises (pais, nombre, oper_ini, oper_fin, sab_auto) values
  ('GT',  'Guatemala',   360, 1440, false),
  ('ESV', 'El Salvador', 600, 1200, true),
  ('PE',  'Perú',        420, 1320, false)
on conflict (pais) do nothing;

insert into public.vac_personas (pais, codigo, nombre, corto, color, oscuro, sab, sab_ancla, orden) values
('GT','yazmin','Yazmin Marroquin','Yazmin','#00216f',false,'todos',null,1),
('GT','betzy','Betzy Estrada','Betzy','#5db9a3',false,'todos',null,2),
('GT','oscar','Oscar Benavente','Oscar','#7dbfe6',true,'no',null,3),
('GT','marlon','Marlon Cuco','Marlon','#5A6480',false,'todos',null,4),
('ESV','jcortiz','Juan Carlos Ortiz','Juan Carlos','#00216f',false,'alterno','2026-11-28',1),
('ESV','dbarrera','Daniel Barrera','Daniel','#5db9a3',false,'alterno','2026-12-05',2),
('PE','jmallqui','Jose Mallqui','José','#00216f',false,'todos',null,1),
('PE','jccasas','Joel Ccasas','Joel','#5db9a3',false,'todos',null,2)
on conflict (pais, codigo) do nothing;

insert into public.vac_horarios (persona_id, desde, hasta, turno, ini, fin)
select p.id, v.desde::date, v.hasta::date, v.turno, v.ini, v.fin
from (values
('GT','yazmin','2000-01-01',null,1,'06:00','13:00'),
('GT','betzy','2000-01-01',null,2,'13:00','20:00'),
('GT','oscar','2000-01-01',null,3,'08:00','17:00'),
('GT','marlon','2000-01-01',null,4,'17:00','00:00'),
('PE','jmallqui','2000-01-01',null,1,'07:00','16:00'),
('PE','jccasas','2000-01-01',null,2,'14:00','22:00'),
('ESV','jcortiz','2026-01-01','2026-01-31',1,'10:00','18:00'),
('ESV','dbarrera','2026-01-01','2026-01-31',2,'13:00','20:00'),
('ESV','jcortiz','2026-02-01','2026-02-28',2,'13:00','20:00'),
('ESV','dbarrera','2026-02-01','2026-02-28',1,'10:00','18:00'),
('ESV','jcortiz','2026-03-01','2026-03-31',1,'10:00','18:00'),
('ESV','dbarrera','2026-03-01','2026-03-31',2,'13:00','20:00'),
('ESV','jcortiz','2026-04-01','2026-04-30',2,'13:00','20:00'),
('ESV','dbarrera','2026-04-01','2026-04-30',1,'10:00','18:00'),
('ESV','jcortiz','2026-05-01','2026-05-31',1,'10:00','18:00'),
('ESV','dbarrera','2026-05-01','2026-05-31',2,'13:00','20:00'),
('ESV','jcortiz','2026-06-01','2026-06-30',2,'13:00','20:00'),
('ESV','dbarrera','2026-06-01','2026-06-30',1,'10:00','18:00'),
('ESV','jcortiz','2026-07-01','2026-07-31',1,'10:00','18:00'),
('ESV','dbarrera','2026-07-01','2026-07-31',2,'13:00','20:00'),
('ESV','jcortiz','2026-08-01','2026-08-31',2,'13:00','20:00'),
('ESV','dbarrera','2026-08-01','2026-08-31',1,'10:00','18:00'),
('ESV','jcortiz','2026-09-01','2026-09-30',1,'10:00','18:00'),
('ESV','dbarrera','2026-09-01','2026-09-30',2,'13:00','20:00'),
('ESV','jcortiz','2026-10-01','2026-10-31',2,'13:00','20:00'),
('ESV','dbarrera','2026-10-01','2026-10-31',1,'10:00','18:00'),
('ESV','jcortiz','2026-11-01','2026-11-30',1,'10:00','18:00'),
('ESV','dbarrera','2026-11-01','2026-11-30',2,'13:00','20:00'),
('ESV','jcortiz','2026-12-01','2026-12-31',2,'13:00','20:00'),
('ESV','dbarrera','2026-12-01','2026-12-31',1,'10:00','18:00'),
('ESV','jcortiz','2027-01-01','2027-01-31',1,'10:00','18:00'),
('ESV','dbarrera','2027-01-01','2027-01-31',2,'13:00','20:00'),
('ESV','jcortiz','2027-02-01','2027-02-28',2,'13:00','20:00'),
('ESV','dbarrera','2027-02-01','2027-02-28',1,'10:00','18:00'),
('ESV','jcortiz','2027-03-01','2027-03-31',1,'10:00','18:00'),
('ESV','dbarrera','2027-03-01','2027-03-31',2,'13:00','20:00'),
('ESV','jcortiz','2027-04-01','2027-04-30',2,'13:00','20:00'),
('ESV','dbarrera','2027-04-01','2027-04-30',1,'10:00','18:00'),
('ESV','jcortiz','2027-05-01','2027-05-31',1,'10:00','18:00'),
('ESV','dbarrera','2027-05-01','2027-05-31',2,'13:00','20:00'),
('ESV','jcortiz','2027-06-01','2027-06-30',2,'13:00','20:00'),
('ESV','dbarrera','2027-06-01','2027-06-30',1,'10:00','18:00'),
('ESV','jcortiz','2027-07-01','2027-07-31',1,'10:00','18:00'),
('ESV','dbarrera','2027-07-01','2027-07-31',2,'13:00','20:00'),
('ESV','jcortiz','2027-08-01','2027-08-31',2,'13:00','20:00'),
('ESV','dbarrera','2027-08-01','2027-08-31',1,'10:00','18:00'),
('ESV','jcortiz','2027-09-01','2027-09-30',1,'10:00','18:00'),
('ESV','dbarrera','2027-09-01','2027-09-30',2,'13:00','20:00'),
('ESV','jcortiz','2027-10-01','2027-10-31',2,'13:00','20:00'),
('ESV','dbarrera','2027-10-01','2027-10-31',1,'10:00','18:00'),
('ESV','jcortiz','2027-11-01','2027-11-30',1,'10:00','18:00'),
('ESV','dbarrera','2027-11-01','2027-11-30',2,'13:00','20:00'),
('ESV','jcortiz','2027-12-01','2027-12-31',2,'13:00','20:00'),
('ESV','dbarrera','2027-12-01','2027-12-31',1,'10:00','18:00')
) as v(pais, codigo, desde, hasta, turno, ini, fin)
join public.vac_personas p on p.pais = v.pais and p.codigo = v.codigo
where not exists (select 1 from public.vac_horarios h where h.persona_id = p.id and h.desde = v.desde::date);

insert into public.vac_dias (persona_id, fecha, tipo, valor, ini, fin)
select p.id, v.fecha::date, v.tipo, v.valor::numeric, v.ini, v.fin
from (values
('yazmin','2026-11-23','L',1,null::text,null::text),
('betzy','2026-11-23','L',1,null::text,null::text),
('oscar','2026-11-23','V',1,null::text,null::text),
('marlon','2026-11-23','L',1,null::text,null::text),
('yazmin','2026-11-24','L',1,null::text,null::text),
('betzy','2026-11-24','L',1,null::text,null::text),
('oscar','2026-11-24','V',1,null::text,null::text),
('marlon','2026-11-24','L',1,null::text,null::text),
('yazmin','2026-11-28','L',1,'06:00','15:00'),
('betzy','2026-11-28','V',1,null::text,null::text),
('marlon','2026-11-28','L',1,'15:00','22:00'),
('yazmin','2026-12-07','L',1,null::text,null::text),
('betzy','2026-12-07','V',1,null::text,null::text),
('oscar','2026-12-07','L',1,null::text,null::text),
('marlon','2026-12-07','L',1,null::text,null::text),
('yazmin','2026-12-23','L',1,null::text,null::text),
('betzy','2026-12-23','L',1,null::text,null::text),
('oscar','2026-12-23','V',1,null::text,null::text),
('marlon','2026-12-23','L',1,null::text,null::text),
('yazmin','2026-12-24','L',1,null::text,null::text),
('betzy','2026-12-24','V',1,null::text,null::text),
('oscar','2026-12-24','L',1,null::text,null::text),
('marlon','2026-12-24','V',1,null::text,null::text),
('yazmin','2026-12-26','L',1,'06:00','15:00'),
('betzy','2026-12-26','V',1,null::text,null::text),
('marlon','2026-12-26','L',1,'15:00','22:00'),
('yazmin','2026-12-30','L',1,null::text,null::text),
('betzy','2026-12-30','L',1,null::text,null::text),
('oscar','2026-12-30','V',1,null::text,null::text),
('marlon','2026-12-30','L',1,null::text,null::text),
('yazmin','2026-12-31','V',1,null::text,null::text),
('betzy','2026-12-31','L',1,'06:00','13:00'),
('oscar','2026-12-31','V',0.5,'08:00','12:30'),
('marlon','2026-12-31','L',1,'06:00','13:00'),
('yazmin','2027-01-02','V',1,null::text,null::text),
('betzy','2027-01-02','L',1,'06:00','15:00'),
('marlon','2027-01-02','L',1,'15:00','22:00'),
('yazmin','2027-01-04','V',1,null::text,null::text),
('betzy','2027-01-04','L',1,null::text,null::text),
('oscar','2027-01-04','L',1,'06:00','13:00'),
('marlon','2027-01-04','L',1,null::text,null::text)
) as v(codigo, fecha, tipo, valor, ini, fin)
join public.vac_personas p on p.pais = 'GT' and p.codigo = v.codigo
on conflict (persona_id, fecha) do nothing;

insert into public.vac_reglas (pais, fecha, tipo, texto, desde_min, hasta_min) values
('GT','2026-12-25','feriado','Navidad',null::int,null::int),
('GT','2027-01-01','feriado','Año Nuevo',null::int,null::int),
('GT','2026-11-28','ventana',null::text,360,1320),
('GT','2026-12-26','ventana',null::text,360,1320),
('GT','2027-01-02','ventana',null::text,360,1320),
('GT','2026-12-24','ventana',null::text,360,780),
('GT','2026-12-31','ventana',null::text,360,780),
('GT','2026-11-28','nota','Sábado con cierre a las 22:00. Atención posterior (Marlon) se computa como hora extra.',null::int,null::int),
('GT','2026-12-26','nota','Sábado con cierre a las 22:00. Atención posterior (Marlon) se computa como hora extra.',null::int,null::int),
('GT','2027-01-02','nota','Sábado con cierre a las 22:00. Atención posterior (Marlon) se computa como hora extra.',null::int,null::int),
('GT','2026-12-24','nota','Operación de 06:00 a 13:00. Cualquier atención adicional se computa como hora extra.',null::int,null::int),
('GT','2026-12-31','nota','Operación de 06:00 a 13:00 con Betzy y Marlon. Tiempo adicional se computa como hora extra.',null::int,null::int),
('GT','2027-01-04','nota','Oscar cubre la apertura (06:00–13:00) por las vacaciones de Yazmin. Betzy 13:00–20:00 y Marlon 17:00–00:00.',null::int,null::int),
('ESV','2026-12-25','feriado','Navidad',null::int,null::int),
('PE','2026-12-25','feriado','Navidad',null::int,null::int),
('ESV','2027-01-01','feriado','Año Nuevo',null::int,null::int),
('PE','2027-01-01','feriado','Año Nuevo',null::int,null::int),
('PE','2026-12-08','feriado','Inmaculada Concepción',null::int,null::int)
on conflict (pais, fecha, tipo) do nothing;

-- 5) BITÁCORA AUTOMÁTICA (se crea al final, después de los datos iniciales) ---------
create or replace function public.vac_log()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_row jsonb; v_pais text; v_pers text; v_fecha date;
  v_old jsonb := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end;
  v_new jsonb := case when tg_op in ('UPDATE','INSERT') then to_jsonb(new) end;
begin
  v_row := coalesce(v_new, v_old);
  if tg_table_name = 'vac_dias' then
    select pais, nombre into v_pais, v_pers from public.vac_personas where id = (v_row->>'persona_id')::uuid;
    v_fecha := (v_row->>'fecha')::date;
  elsif tg_table_name = 'vac_horarios' then
    select pais, nombre into v_pais, v_pers from public.vac_personas where id = (v_row->>'persona_id')::uuid;
    v_fecha := (v_row->>'desde')::date;
  elsif tg_table_name = 'vac_personas' then
    v_pais := v_row->>'pais'; v_pers := v_row->>'nombre';
  elsif tg_table_name = 'vac_reglas' then
    v_pais := v_row->>'pais'; v_fecha := (v_row->>'fecha')::date;
  else
    v_pais := v_row->>'pais';
  end if;
  insert into public.vac_historial (actor_id, actor_email, pais, tabla, accion, persona, fecha_ref, antes, despues)
  values (auth.uid(), coalesce(auth.jwt()->>'email', 'sistema'), v_pais, tg_table_name, tg_op, v_pers, v_fecha, v_old, v_new);
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['vac_paises','vac_personas','vac_horarios','vac_dias','vac_reglas'] loop
    execute format('drop trigger if exists %I on public.%I', t||'_log', t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.vac_log()', t||'_log', t);
  end loop;
end $$;

-- 6) VERIFICACIÓN (debe devolver: GT 4 personas, ESV 2, PE 2; GT con 12.5 días de vacaciones)
select p.pais, count(distinct p.id) as personas,
       coalesce(sum(case when d.tipo='V' then d.valor end),0) as dias_vacaciones
from public.vac_personas p left join public.vac_dias d on d.persona_id = p.id
group by p.pais order by p.pais;
