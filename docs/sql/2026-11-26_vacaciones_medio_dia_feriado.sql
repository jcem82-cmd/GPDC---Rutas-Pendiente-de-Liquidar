-- Parche 2026-11-26 · Vacaciones del Equipo (aplica a TODAS las personas y países)
-- Regla: si una persona toma ½ día de vacaciones en un día feriado, el otro medio día
-- es feriado y NO labora. Se eliminan las horas de trabajo (ini/fin) de esos registros.
-- Feriado = fecha con regla 'feriado' en su país, o 24 y 31/12 en Guatemala (feriado desde el mediodía).
-- Idempotente; los cambios quedan en la bitácora.
update public.vac_dias d
   set ini = null, fin = null, actualizado = now()
  from public.vac_personas p
 where p.id = d.persona_id
   and d.tipo = 'V' and d.valor = 0.5
   and (d.ini is not null or d.fin is not null)
   and (
        exists (select 1 from public.vac_reglas r
                 where r.pais = p.pais and r.tipo = 'feriado' and r.fecha = d.fecha)
     or (p.pais = 'GT' and to_char(d.fecha, 'MM-DD') in ('12-24', '12-31'))
   );

-- Verificación: medios días de vacaciones en feriado (ini/fin deben quedar vacíos)
select p.pais, p.nombre, d.fecha, d.valor, d.ini, d.fin
  from public.vac_dias d
  join public.vac_personas p on p.id = d.persona_id
 where d.tipo = 'V' and d.valor = 0.5
   and (exists (select 1 from public.vac_reglas r
                 where r.pais = p.pais and r.tipo = 'feriado' and r.fecha = d.fecha)
     or (p.pais = 'GT' and to_char(d.fecha, 'MM-DD') in ('12-24', '12-31')))
 order by p.pais, d.fecha, p.nombre;
