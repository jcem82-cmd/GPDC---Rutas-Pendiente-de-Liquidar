/* ═══════════════════════════════════════════════════════════════════════
   PDC Analytics Center — Módulo de Administración de Usuarios (v1)
   Componente reutilizable: window.PDCUserAdmin.mount({...})
   Toda operación de escritura pasa por la Edge Function `admin-users`
   (reglas de seguridad en el servidor; este archivo es solo interfaz).
   Lectura: tablas `profiles` y `user_audit` (protegidas por RLS).
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var ROLES = { admin:'Administrador', supervisor:'Supervisor', consulta:'Consulta' };
  var PAISES = { regional:'🌎 Regional', GT:'🇬🇹 Guatemala', ESV:'🇸🇻 El Salvador', PE:'🇵🇪 Perú' };
  var PAIS_LABELS = { regional:'🌎 Regional', GT:'🇬🇹 Guatemala', ESV:'🇸🇻 El Salvador', PE:'🇵🇪 Perú', HN:'🇭🇳 Honduras' };
  var SEDES = { GT:['CDA','XELA'], ESV:['Sta.Tecla','Sn.Miguel'], PE:['Peru'], regional:['CDA','XELA','Sta.Tecla','Sn.Miguel','Peru'] };
  var SUGERIDOS = { GT:['rutas','cashtoday','cartas_salida'], ESV:['rutas','elsalvador'], PE:['peru'],
    regional:['rutas','cashtoday','regional','peru','elsalvador','cartas_salida','historico'] };
  var ACCIONES = { create:'Crear', update:'Editar', activate:'Reactivar', deactivate:'Inactivar', reset_password:'Restablecer contraseña' };
  var EMAIL_RE = /^[a-z0-9._%+-]+@grupopdc\.com$/;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function fmtDate(v){
    if(!v) return '';
    var d = new Date(v); if(isNaN(d)) return '';
    return d.toLocaleDateString('es-GT',{day:'2-digit',month:'2-digit',year:'numeric'}) + ' ' +
           d.toLocaleTimeString('es-GT',{hour:'2-digit',minute:'2-digit'});
  }

  var CSS = '\
.ua{font-family:inherit;color:var(--text,#0F1729)}\
.ua-kpis{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}\
.ua-kpi{background:#fff;border:1px solid var(--border,#E2E8F0);border-radius:10px;padding:5px 14px;text-align:center;min-width:74px}\
.ua-kpi b{display:block;font-size:1rem;color:var(--navy,#00216f)}.ua-kpi span{font-size:.62rem;color:var(--text2,#5A6480);text-transform:uppercase;letter-spacing:.04em}\
.ua-tabs{display:flex;gap:2px;border-bottom:1px solid var(--border,#E2E8F0);padding:0 14px;overflow-x:auto;background:#fff}\
.ua-tab{padding:13px 16px;border:0;background:none;font:600 .8rem inherit;font-family:inherit;color:var(--text2,#5A6480);cursor:pointer;border-bottom:3px solid transparent;white-space:nowrap}\
.ua-tab.on{color:var(--navy,#00216f);border-color:var(--navy,#00216f)}.ua-tab:hover{color:var(--navy,#00216f)}\
.ua-body{padding:18px 22px}.ua-pane{display:none}.ua-pane.on{display:block}\
.ua-tools{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;align-items:center}\
.ua input,.ua select{font:inherit;font-size:.8rem;padding:8px 11px;border:1px solid var(--border,#E2E8F0);border-radius:8px;background:#fff;color:inherit}\
.ua input:focus,.ua select:focus{outline:2px solid var(--sky,#7dbfe6)}\
.ua-btn{padding:8px 16px;border-radius:8px;border:0;font-weight:600;font-size:.78rem;font-family:inherit;cursor:pointer;background:var(--navy,#00216f);color:#fff}\
.ua-btn:hover{background:var(--navy2,#003090)}.ua-btn:disabled{opacity:.5;cursor:not-allowed}\
.ua-btn.ghost{background:#fff;color:var(--navy,#00216f);border:1px solid var(--border,#E2E8F0)}.ua-btn.ghost:hover{background:var(--sky2,#e8f6ff)}\
.ua-btn.danger{background:var(--red2,#CC0000)}.ua-btn.sm{padding:5px 10px;font-size:.7rem}\
.ua-tw{overflow-x:auto;border:1px solid var(--border,#E2E8F0);border-radius:10px}\
.ua table{width:100%;border-collapse:collapse;font-size:.78rem}\
.ua th{background:#f4f7fb;text-align:left;padding:10px 12px;font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text2,#5A6480);white-space:nowrap}\
.ua td{padding:10px 12px;border-top:1px solid var(--border,#E2E8F0);vertical-align:middle}.ua tr.off td:not(.ua-act){opacity:.5}\
.ua-b{display:inline-block;padding:3px 10px;border-radius:10px;font-size:.7rem;font-weight:700}\
.ua-on{background:var(--green,#DCF0C6);color:var(--green2,#2D9E2D)}.ua-off{background:var(--red,#FFBDBD);color:var(--red2,#CC0000)}\
.ua-sub{color:var(--text2,#5A6480);font-size:.72rem}.ua-warn{color:var(--yellow2,#C48A00);font-weight:700;font-size:.7rem}\
.ua-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:20px}@media(max-width:860px){.ua-grid{grid-template-columns:1fr}}\
.ua-f{margin-bottom:14px}.ua-f label.t{display:block;font-weight:600;font-size:.74rem;margin-bottom:5px;color:var(--navy,#00216f)}.ua-f input,.ua-f select{width:100%}\
.ua-dg{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}\
.ua-ck{display:flex;gap:8px;align-items:center;border:1px solid var(--border,#E2E8F0);border-radius:8px;padding:7px 10px;cursor:pointer;font-size:.76rem}\
.ua-ck.sel{background:var(--sky2,#e8f6ff);border-color:var(--sky,#7dbfe6)}.ua-ck input{width:auto}\
.ua-hint{font-size:.7rem;color:var(--text2,#5A6480);margin-top:4px}.ua-err{color:var(--red2,#CC0000);font-size:.72rem;margin-top:4px;min-height:1em}\
.ua-side{background:#f8faff;border:1px solid var(--border,#E2E8F0);border-radius:10px;padding:16px;font-size:.78rem}\
.ua-mx td,.ua-mx th{text-align:center}.ua-mx td:first-child,.ua-mx th:first-child{text-align:left}.ua-yes{color:var(--green2,#2D9E2D);font-weight:700}.ua-no{color:#b6bdcc}\
.ua-modal{position:fixed;inset:0;background:rgba(0,20,64,.55);display:none;align-items:center;justify-content:center;padding:16px;z-index:10000}.ua-modal.on{display:flex}\
.ua-mb{background:#fff;border-radius:14px;box-shadow:0 12px 48px rgba(0,32,96,.16);max-width:470px;width:100%;padding:24px;max-height:90vh;overflow:auto}\
.ua-mb h2{margin:0 0 6px;font-size:1.02rem;color:var(--navy,#00216f)}\
.ua-pw{display:flex;gap:8px;margin:14px 0}.ua-pw code{flex:1;background:var(--navy-dark,#001440);color:#fff;padding:12px;border-radius:8px;font:700 1.05rem ui-monospace,Consolas,monospace;letter-spacing:.06em;text-align:center;user-select:all;word-break:break-all}\
.ua-note{background:var(--yellow,#FFF4CC);color:#7a5600;border-radius:8px;padding:9px 12px;font-size:.74rem;margin:10px 0}\
.ua-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}\
.ua-msg{padding:10px 14px;border-radius:8px;font-size:.76rem;margin-bottom:12px;background:var(--red,#FFBDBD);color:var(--red2,#CC0000)}';

  function mount(opts){
    var host = opts && opts.container;
    if(!host || !opts.client || !opts.functionUrl) return false;
    var client = opts.client, fnUrl = opts.functionUrl;
    var dashList = (opts.dashboards || []).map(function(d){ return { id:d.id, nombre:d.nombre, icono:d.icono || '📊' }; });
    var dashById = {}; dashList.forEach(function(d){ dashById[d.id] = d; });
    var selfEmail = String(opts.selfEmail || '').toLowerCase();
    var toast = typeof opts.toast === 'function' ? opts.toast : function(){};
    var doc = host.ownerDocument;
    var users = [], audit = [], filters = { q:'', rol:'', pais:'', estado:'' }, editing = null, confirmCb = null, busy = false;

    if(!doc.getElementById('ua-style')){
      var st = doc.createElement('style'); st.id = 'ua-style'; st.textContent = CSS; doc.head.appendChild(st);
    }

    host.innerHTML =
      '<div class="ua">' +
      '<div class="ua-tabs" role="tablist">' +
        '<button class="ua-tab on" data-tab="users" type="button">👥 Usuarios</button>' +
        '<button class="ua-tab" data-tab="new" type="button">➕ Nuevo usuario</button>' +
        '<button class="ua-tab" data-tab="roles" type="button">🛡️ Roles y permisos</button>' +
        '<button class="ua-tab" data-tab="audit" type="button">📜 Auditoría</button></div>' +
      '<div class="ua-body"><div class="ua-msg" data-el="msg" style="display:none"></div>' +
      '<div class="ua-pane on" data-pane="users">' +
        '<div class="ua-tools"><input data-f="q" placeholder="Buscar por nombre o correo…" style="min-width:230px" maxlength="80">' +
        '<select data-f="rol"><option value="">Todos los roles</option>' + Object.keys(ROLES).map(function(k){ return '<option value="'+k+'">'+ROLES[k]+'</option>'; }).join('') + '</select>' +
        '<select data-f="pais"><option value="">Todos los países</option>' + Object.keys(PAIS_LABELS).map(function(k){ return '<option value="'+k+'">'+esc(PAIS_LABELS[k])+'</option>'; }).join('') + '</select>' +
        '<select data-f="estado"><option value="">Todos los estados</option><option value="1">Activos</option><option value="0">Inactivos</option></select>' +
        '<span style="flex:1"></span><button class="ua-btn" data-go="new" type="button">➕ Nuevo usuario</button></div>' +
        '<div class="ua-tw"><table><thead><tr><th>Usuario</th><th>Rol</th><th>País / sedes</th><th>Dashboards</th><th>Último acceso</th><th>Estado</th><th>Acciones</th></tr></thead><tbody data-el="tb"></tbody></table></div>' +
        '<p class="ua-sub">Los usuarios nunca se eliminan: se inactivan (se conserva el historial y se bloquea su ingreso de inmediato).</p></div>' +
      '<div class="ua-pane" data-pane="new"><div class="ua-grid"><div>' +
        '<div class="ua-f"><label class="t">Nombre completo</label><input data-n="nombre" maxlength="80" placeholder="Ej. María López"><div class="ua-err" data-e="nombre"></div></div>' +
        '<div class="ua-f"><label class="t">Correo corporativo</label><input data-n="email" placeholder="usuario@grupopdc.com" maxlength="254"><div class="ua-err" data-e="email"></div><div class="ua-hint">Solo se permiten correos @grupopdc.com.</div></div>' +
        '<div class="ua-f" style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><label class="t">Rol</label><select data-n="rol">' + Object.keys(ROLES).reverse().map(function(k){ return '<option value="'+k+'">'+ROLES[k]+'</option>'; }).join('') + '</select></div>' +
        '<div><label class="t">País</label><select data-n="pais">' + Object.keys(PAISES).map(function(k){ return '<option value="'+k+'">'+esc(PAISES[k])+'</option>'; }).join('') + '</select></div></div>' +
        '<div class="ua-f"><label class="t">Sedes</label><div class="ua-dg" data-el="nsedes"></div></div>' +
        '<div class="ua-f"><label class="t">Dashboards autorizados</label><div class="ua-dg" data-el="ndash"></div><div class="ua-hint">Se sugieren según el rol y el país; puede ajustarlos.</div></div>' +
        '<button class="ua-btn" data-act="create" type="button">Crear usuario y generar contraseña</button></div>' +
        '<div class="ua-side"><b style="color:var(--navy,#00216f)">¿Qué ocurre al crear?</b><ol style="padding-left:18px;margin:8px 0 0"><li style="margin:6px 0">El sistema crea la cuenta y genera una <b>contraseña temporal</b>.</li><li style="margin:6px 0">Se muestra <b>una sola vez</b> con botón para copiar; usted la envía por un canal privado.</li><li style="margin:6px 0">En su primer ingreso el usuario <b>debe cambiarla</b>.</li><li style="margin:6px 0">Queda registrado en Auditoría (sin la contraseña).</li></ol></div></div></div>' +
      '<div class="ua-pane" data-pane="roles"><p class="ua-sub" style="margin-top:0">Referencia de los tres roles. Vista informativa: los permisos reales se aplican en la base de datos y en el servidor.</p><div class="ua-tw"><table class="ua-mx"><thead><tr><th>Capacidad</th><th>Administrador</th><th>Supervisor</th><th>Consulta</th></tr></thead><tbody>' +
        [['Ver dashboards autorizados',1,1,1],['Chat de soporte: enviar consultas',1,1,1],['Chat de soporte: ver y responder todas las conversaciones',1,0,0],['Gestionar usuarios (crear, editar, inactivar, restablecer clave)',1,0,0],['Ver auditoría de cambios',1,0,0],['Publicar datos de Rutas (self-service)',1,0,0]].map(function(r){
          return '<tr><td>'+r[0]+'</td>'+[r[1],r[2],r[3]].map(function(v){ return v?'<td class="ua-yes">✔</td>':'<td class="ua-no">—</td>'; }).join('')+'</tr>'; }).join('') +
        '<tr><td>Dashboards sugeridos al crear</td><td>Todos</td><td>Los de su país</td><td>Solo los asignados</td></tr></tbody></table></div></div>' +
      '<div class="ua-pane" data-pane="audit"><div class="ua-tw"><table><thead><tr><th>Fecha</th><th>Administrador</th><th>Acción</th><th>Usuario afectado</th><th>Detalle</th></tr></thead><tbody data-el="au"></tbody></table></div><p class="ua-sub">Bitácora inmutable: nadie puede editarla o borrarla desde la aplicación.</p></div>' +
      '</div>' +
      '<div class="ua-modal" data-modal="pw"><div class="ua-mb" role="dialog" aria-modal="true"><h2 data-el="pwt"></h2><div class="ua-sub" data-el="pws"></div><div class="ua-pw"><code data-el="pwv"></code><button class="ua-btn" data-act="copy" type="button">Copiar</button></div><div class="ua-note">⚠️ Esta contraseña se muestra <b>una sola vez</b>. Cópiela ahora y envíela por un canal privado. El usuario deberá cambiarla en su primer ingreso.</div><div class="ua-actions"><button class="ua-btn" data-act="closepw" type="button">Ya la copié, cerrar</button></div></div></div>' +
      '<div class="ua-modal" data-modal="ed"><div class="ua-mb" role="dialog" aria-modal="true"><h2>Editar usuario</h2><div class="ua-sub" data-el="eds"></div><br>' +
        '<div class="ua-f"><label class="t">Rol</label><select data-e2="rol">' + Object.keys(ROLES).map(function(k){ return '<option value="'+k+'">'+ROLES[k]+'</option>'; }).join('') + '</select></div>' +
        '<div class="ua-f"><label class="t">País</label><select data-e2="pais">' + Object.keys(PAISES).map(function(k){ return '<option value="'+k+'">'+esc(PAISES[k])+'</option>'; }).join('') + '</select></div>' +
        '<div class="ua-f"><label class="t">Sedes</label><div class="ua-dg" data-el="esedes"></div></div>' +
        '<div class="ua-f"><label class="t">Dashboards</label><div class="ua-dg" data-el="edash"></div></div><div class="ua-err" data-el="eder"></div>' +
        '<div class="ua-actions"><button class="ua-btn ghost" data-act="closeed" type="button">Cancelar</button><button class="ua-btn" data-act="saveed" type="button">Guardar cambios</button></div></div></div>' +
      '<div class="ua-modal" data-modal="cf"><div class="ua-mb" role="dialog" aria-modal="true"><h2 data-el="cft"></h2><div class="ua-sub" data-el="cfs" style="margin:6px 0"></div><div class="ua-actions"><button class="ua-btn ghost" data-act="closecf" type="button">Cancelar</button><button class="ua-btn" data-act="okcf" type="button">Confirmar</button></div></div></div>' +
      '</div>';

    function $(sel){ return host.querySelector(sel); }
    function el(n){ return host.querySelector('[data-el="'+n+'"]'); }
    function showMsg(t){ var m = el('msg'); m.textContent = t || ''; m.style.display = t ? '' : 'none'; }
    function openM(n){ host.querySelector('[data-modal="'+n+'"]').classList.add('on'); }
    function closeM(n){ host.querySelector('[data-modal="'+n+'"]').classList.remove('on'); if(n==='pw'){ el('pwv').textContent=''; } }

    function checks(box, name, items, selected){
      el(box).innerHTML = items.map(function(it){
        return '<label class="ua-ck'+(selected.indexOf(it.id)>-1?' sel':'')+'"><input type="checkbox" data-c="'+name+'" value="'+esc(it.id)+'"'+(selected.indexOf(it.id)>-1?' checked':'')+'>'+esc(it.label)+'</label>'; }).join('');
    }
    function checked(name, root){ return Array.prototype.map.call((root||host).querySelectorAll('[data-c="'+name+'"]:checked'), function(i){ return i.value; }); }
    function dashItems(){ return dashList.map(function(d){ return { id:d.id, label:d.icono+' '+d.nombre }; }); }
    function sedeItems(p){ return (SEDES[p]||[]).map(function(s){ return { id:s, label:s }; }); }

    function suggest(){
      var p = $('[data-n="pais"]').value, r = $('[data-n="rol"]').value;
      checks('nsedes','sd', sedeItems(p), SEDES[p]||[]);
      checks('ndash','dd', dashItems(), r==='admin' ? dashList.map(function(d){return d.id;}) : (SUGERIDOS[p]||[]).filter(function(id){ return dashById[id]; }));
    }

    function renderUsers(){
      var q = filters.q.toLowerCase();
      var list = users.filter(function(u){
        return (!q || ((u.nombre||'')+' '+(u.email||'')).toLowerCase().indexOf(q)>-1) && (!filters.rol || u.rol===filters.rol) &&
          (!filters.pais || u.pais===filters.pais) && (!filters.estado || String(u.activo!==false?1:0)===filters.estado);
      });
      var act = users.filter(function(u){ return u.activo!==false; }).length;
      el('kT').textContent = users.length; el('kA').textContent = act; el('kI').textContent = users.length-act;
      el('kP').textContent = users.filter(function(u){ return u.force_password_change===true; }).length;
      el('tb').innerHTML = list.length ? list.map(function(u){
        var on = u.activo!==false, me = String(u.email||'').toLowerCase()===selfEmail;
        var chips = (u.dashboards||[]).map(function(id){ var d = dashById[id]; return '<span class="dash-chip">'+esc(d?d.icono+' '+d.nombre:id)+'</span>'; }).join('');
        var last = u.ultimo_acceso ? esc(fmtDate(u.ultimo_acceso)) : '<span class="ua-sub">Sin registro</span>';
        return '<tr class="'+(on?'':'off')+'"><td><b>'+esc(u.nombre)+'</b>'+(me?' <span class="ua-sub">(usted)</span>':'')+'<div class="ua-sub">'+esc(u.email)+'</div></td>' +
          '<td><span class="role-badge role-'+esc(u.rol)+'">'+esc(ROLES[u.rol]||u.rol)+'</span></td>' +
          '<td style="white-space:nowrap">'+esc(PAIS_LABELS[u.pais]||u.pais)+'<div class="ua-sub">'+esc((u.sedes||[]).join(', ')||'—')+'</div></td><td>'+chips+'</td>' +
          '<td class="ua-sub">'+last+(u.force_password_change?'<div class="ua-warn">Debe cambiar clave</div>':'')+'</td>' +
          '<td><span class="ua-b '+(on?'ua-on':'ua-off')+'">'+(on?'Activo':'Inactivo')+'</span></td>' +
          '<td class="ua-act" style="white-space:nowrap"><button class="ua-btn ghost sm" data-act="edit" data-id="'+esc(u.id)+'" type="button">Editar</button> ' +
          '<button class="ua-btn ghost sm" data-act="reset" data-id="'+esc(u.id)+'" type="button">Restablecer clave</button> ' +
          (me ? '' : '<button class="ua-btn '+(on?'danger':'ghost')+' sm" data-act="toggle" data-id="'+esc(u.id)+'" type="button">'+(on?'Inactivar':'Reactivar')+'</button>')+'</td></tr>';
      }).join('') : '<tr><td colspan="7" class="ua-sub" style="text-align:center;padding:24px">Sin resultados</td></tr>';
      if(opts.onCount) opts.onCount(users.length);
    }
    function renderAudit(){
      el('au').innerHTML = audit.length ? audit.map(function(a){
        var d = a.detail || {}, det = '';
        if(a.action==='update' && d.after){ det = Object.keys(d.after).map(function(k){ return k+': '+JSON.stringify(d.before&&d.before[k])+' → '+JSON.stringify(d.after[k]); }).join(' · '); }
        else if(a.action==='create'){ det = [ROLES[d.rol]||d.rol, d.pais].filter(Boolean).join(' · '); }
        return '<tr><td class="ua-sub">'+esc(fmtDate(a.created_at))+'</td><td>'+esc(a.actor_email)+'</td><td><b>'+esc(ACCIONES[a.action]||a.action)+'</b></td><td class="ua-sub">'+esc(a.target_email)+'</td><td class="ua-sub">'+esc(det)+'</td></tr>'; }).join('')
        : '<tr><td colspan="5" class="ua-sub" style="text-align:center;padding:24px">Sin registros</td></tr>';
    }

    async function loadUsers(){
      var r = await client.from('profiles').select('*').order('nombre');
      if(r.error){ showMsg('No se pudieron cargar los usuarios.'); return; }
      users = r.data || []; showMsg(''); renderUsers();
    }
    async function loadAudit(){
      var r = await client.from('user_audit').select('*').order('created_at',{ascending:false}).limit(100);
      if(r.error){ audit = []; showMsg('La bitácora no está disponible todavía (¿se creó la tabla user_audit?).'); }
      else { audit = r.data || []; showMsg(''); }
      renderAudit();
    }
    async function call(body){
      var s = await client.auth.getSession();
      var tok = s && s.data && s.data.session && s.data.session.access_token;
      if(!tok) return { ok:false, error:'Su sesión expiró. Vuelva a iniciar sesión.' };
      try{
        var res = await fetch(fnUrl, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+tok }, body: JSON.stringify(body) });
        var j = await res.json().catch(function(){ return null; });
        if(res.ok && j && j.ok) return j;
        return { ok:false, error:(j && j.error) || 'Error inesperado ('+res.status+').' };
      }catch(e){ return { ok:false, error:'No se pudo conectar con el servidor.' }; }
    }
    async function run(body, after){
      if(busy) return; busy = true;
      var r = await call(body); busy = false;
      if(!r.ok){ showMsg(r.error); toast('⚠️','No se pudo completar', r.error, 3500); return null; }
      showMsg(''); await loadUsers(); if(after) after(r); return r;
    }
    function showPassword(title, sub, pw){
      el('pwt').textContent = title; el('pws').textContent = sub; el('pwv').textContent = pw;
      host.querySelector('[data-act="copy"]').textContent = 'Copiar'; openM('pw');
    }
    function byId(id){ for(var i=0;i<users.length;i++) if(String(users[i].id)===String(id)) return users[i]; return null; }
    function go(t){
      Array.prototype.forEach.call(host.querySelectorAll('.ua-tab'), function(b){ b.classList.toggle('on', b.getAttribute('data-tab')===t); });
      Array.prototype.forEach.call(host.querySelectorAll('.ua-pane'), function(p){ p.classList.toggle('on', p.getAttribute('data-pane')===t); });
      if(t==='audit') loadAudit(); if(t==='users') loadUsers();
    }

    /* ── Eventos (delegación; sin onclick inline → compatible con CSP) ── */
    host.addEventListener('click', async function(ev){
      var t = ev.target.closest('[data-tab],[data-go],[data-act]'); if(!t || !host.contains(t)) return;
      if(t.hasAttribute('data-tab')) return go(t.getAttribute('data-tab'));
      if(t.hasAttribute('data-go')) return go(t.getAttribute('data-go'));
      var a = t.getAttribute('data-act'), u = byId(t.getAttribute('data-id'));
      if(a==='copy'){
        var pw = el('pwv').textContent;
        try{ await navigator.clipboard.writeText(pw); t.textContent='¡Copiada!'; }
        catch(e){ var r = doc.createRange(); r.selectNodeContents(el('pwv')); var sel = doc.defaultView.getSelection(); sel.removeAllRanges(); sel.addRange(r); t.textContent='Selecciónela y use Ctrl+C'; }
      }
      else if(a==='closepw') closeM('pw');
      else if(a==='closeed'){ closeM('ed'); editing = null; }
      else if(a==='closecf'){ closeM('cf'); confirmCb = null; }
      else if(a==='okcf'){ var cb = confirmCb; closeM('cf'); confirmCb = null; if(cb) cb(); }
      else if(a==='create'){
        var nombre = $('[data-n="nombre"]').value.trim(), email = $('[data-n="email"]').value.trim().toLowerCase();
        var eN = nombre.length<2 ? 'Ingrese un nombre (2 a 80 caracteres).' : '';
        var dup = users.some(function(x){ return String(x.email||'').toLowerCase()===email; });
        var eE = !EMAIL_RE.test(email) ? 'Debe ser un correo @grupopdc.com válido.' : (dup ? 'Ya existe un usuario con ese correo.' : '');
        $('[data-e="nombre"]').textContent = eN; $('[data-e="email"]').textContent = eE; if(eN||eE) return;
        var body = { action:'create', nombre:nombre, email:email, rol:$('[data-n="rol"]').value, pais:$('[data-n="pais"]').value, sedes:checked('sd'), dashboards:checked('dd') };
        t.disabled = true;
        var r2 = await run(body, function(res){
          $('[data-n="nombre"]').value=''; $('[data-n="email"]').value=''; suggest(); go('users');
          showPassword('Usuario creado', nombre+' · '+res.email, res.temp_password);
        });
        t.disabled = false;
      }
      else if(a==='edit' && u){
        editing = u; el('eds').textContent = u.nombre+' · '+u.email;
        host.querySelector('[data-e2="rol"]').value = u.rol;
        var pSel = host.querySelector('[data-e2="pais"]');
        Array.prototype.forEach.call(pSel.querySelectorAll('[data-legacy]'), function(o){ o.remove(); });
        if(!PAISES[u.pais]){ pSel.insertAdjacentHTML('afterbegin','<option value="'+esc(u.pais)+'" data-legacy="1">'+esc(PAIS_LABELS[u.pais]||u.pais)+' (actual)</option>'); }
        pSel.value = u.pais;
        var sedeSet = (u.sedes||[]); checks('esedes','es', sedeItems('regional'), sedeSet);
        checks('edash','ed', dashItems(), u.dashboards||[]);
        el('eder').textContent = (u.email||'').toLowerCase()===selfEmail ? 'Es su propia cuenta: no puede quitarse el rol de administrador.' : '';
        openM('ed');
      }
      else if(a==='saveed' && editing){
        var u2 = editing, patch = { action:'update', id:u2.id };
        var rol = host.querySelector('[data-e2="rol"]').value, pais = host.querySelector('[data-e2="pais"]').value;
        var dsh = checked('ed'), sds = checked('es');
        function same(x,y){ return JSON.stringify((x||[]).slice().sort())===JSON.stringify((y||[]).slice().sort()); }
        if(rol!==u2.rol) patch.rol = rol;
        if(pais!==u2.pais) patch.pais = pais;
        if(!same(dsh,u2.dashboards)) patch.dashboards = dsh;
        if(!same(sds,u2.sedes)) patch.sedes = sds;
        if(Object.keys(patch).length===2){ el('eder').textContent = 'No hay cambios para guardar.'; return; }
        t.disabled = true; var ok = await run(patch, function(){ toast('✅','Usuario actualizado', u2.email, 2500); }); t.disabled = false;
        if(ok){ closeM('ed'); editing = null; }
        else { el('eder').textContent = el('msg').textContent; }
      }
      else if(a==='toggle' && u){
        var on = u.activo!==false;
        el('cft').textContent = on ? 'Inactivar usuario' : 'Reactivar usuario';
        el('cfs').textContent = on ? u.email+' no podrá ingresar de inmediato. Podrá reactivarlo cuando lo necesite; su historial se conserva.' : u.email+' podrá volver a ingresar con su contraseña actual.';
        confirmCb = function(){ run({ action:'set_active', id:u.id, activo:!on }, function(){ toast(on?'🔴':'🟢', on?'Usuario inactivado':'Usuario reactivado', u.email, 2500); }); };
        openM('cf');
      }
      else if(a==='reset' && u){
        el('cft').textContent = 'Restablecer contraseña';
        el('cfs').textContent = 'Se generará una nueva contraseña temporal para '+u.email+'. La actual dejará de funcionar y deberá cambiarla al ingresar.';
        confirmCb = function(){ run({ action:'reset_password', id:u.id }, function(res){ showPassword('Contraseña restablecida', u.nombre+' · '+u.email, res.temp_password); }); };
        openM('cf');
      }
    });
    host.addEventListener('input', function(ev){
      var f = ev.target.getAttribute && ev.target.getAttribute('data-f');
      if(f){ filters[f] = ev.target.value; renderUsers(); }
    });
    host.addEventListener('change', function(ev){
      var tg = ev.target;
      if(tg.getAttribute('data-f')){ filters[tg.getAttribute('data-f')] = tg.value; renderUsers(); }
      else if(tg.getAttribute('data-n')==='pais' || tg.getAttribute('data-n')==='rol') suggest();
      else if(tg.type==='checkbox' && tg.parentNode) tg.parentNode.classList.toggle('sel', tg.checked);
    });
    doc.addEventListener('keydown', function(ev){ if(ev.key==='Escape'){ ['ed','cf'].forEach(closeM); } });

    /* KPIs en el encabezado del panel (provistos por la página anfitriona) */
    if(opts.kpiHost){
      opts.kpiHost.innerHTML = '<div class="ua-kpis"><div class="ua-kpi"><b data-el="kT">0</b><span>Usuarios</span></div><div class="ua-kpi"><b data-el="kA">0</b><span>Activos</span></div><div class="ua-kpi"><b data-el="kI">0</b><span>Inactivos</span></div><div class="ua-kpi"><b data-el="kP">0</b><span>Cambio pend.</span></div></div>';
      var _el = el; el = function(n){ return _el(n) || opts.kpiHost.querySelector('[data-el="'+n+'"]'); };
    } else {
      host.querySelector('.ua').insertAdjacentHTML('afterbegin','<div class="ua-kpis" style="padding:12px 22px 0"><div class="ua-kpi"><b data-el="kT">0</b><span>Usuarios</span></div><div class="ua-kpi"><b data-el="kA">0</b><span>Activos</span></div><div class="ua-kpi"><b data-el="kI">0</b><span>Inactivos</span></div><div class="ua-kpi"><b data-el="kP">0</b><span>Cambio pend.</span></div></div>');
    }

    suggest(); loadUsers();
    return true;
  }

  window.PDCUserAdmin = { mount: mount };
})();
