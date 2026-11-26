-- Parche 2026-11-26 · Vacaciones del Equipo
-- Medio día de vacaciones de Oscar Benavente (T3 08–17) el 24 y 31/12/2026:
-- el resto de la jornada es feriado, por lo que NO labora. Se eliminan las horas
-- de trabajo (ini/fin) de esos registros. Idempotente; queda en la bitácora.
update public.vac_dias d
   set ini = null, fin = null, actualizado = now()
  from public.vac_personas p
 where p.id = d.persona_id
   and p.pais = 'GT'
   and p.nombre = 'Oscar Benavente'
   and d.tipo = 'V' and d.valor = 0.5
   and d.fecha in ('2026-12-24', '2026-12-31')
   and (d.ini is not null or d.fin is not null);

select p.nombre, d.fecha, d.tipo, d.valor, d.ini, d.fin
  from public.vac_dias d join public.vac_personas p on p.id = d.persona_id
 where p.pais = 'GT' and p.nombre = 'Oscar Benavente' and d.fecha in ('2026-12-24', '2026-12-31');
