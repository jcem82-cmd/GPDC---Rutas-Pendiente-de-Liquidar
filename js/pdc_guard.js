/* ═══════════════════════════════════════════════════════════════════════
   PDC Analytics Center — Guardián de sesión (v1)
   Cierra la sesión de una cuenta INACTIVA sin esperar a las 8 h de la sesión del navegador.
   • Al abrir la página, cada 60 s y al volver a la pestaña, consulta SU PROPIO perfil (RLS lo permite)
     y la validez de su sesión de Supabase.
   • Solo cierra sesión si Supabase CONFIRMA: profiles.activo === false, o la cuenta está bloqueada
     (user_banned al renovar el token). Cualquier otro caso (sin red, error, sin sesión) → no hace nada.
   • Usuarios activos: ningún efecto. Mantiene la sesión normal de 8 h.
   Uso: <script src="js/pdc_guard.js"></script> al final de cada página protegida.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.PDCGuard) return;

  var SUPA_URL = 'https://pytsrgtcjytjztwdlvux.supabase.co';
  var SUPA_KEY = 'sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj';
  var INTERVAL = 60 * 1000;
  var cs = document.currentScript;
  var jsBase = cs && cs.src ? cs.src.replace(/[^\/]*(\?.*)?$/, '') : 'js/';   /* …/js/ */
  var rootBase = jsBase.replace(/js\/$/, '');                                  /* raíz del sitio */
  var client = null, loading = null, running = false, done = false;

  function hasAppSession(){
    try{ return !!(sessionStorage.getItem('pdc_session') || sessionStorage.getItem('pdc_user')); }catch(e){ return false; }
  }
  function loadSdk(){
    if(window.supabase && window.supabase.createClient) return Promise.resolve(true);
    if(loading) return loading;
    loading = new Promise(function(resolve){
      var s = document.createElement('script'); s.src = jsBase + 'supabase.min.js';
      s.onload = function(){ resolve(!!(window.supabase && window.supabase.createClient)); };
      s.onerror = function(){ resolve(false); };
      document.head.appendChild(s);
    });
    return loading;
  }
  function getClient(){
    if(client) return client;
    /* Misma clave de almacenamiento que el resto de páginas → comparte la sesión; sin temporizadores propios */
    client = window.supabase.createClient(SUPA_URL, SUPA_KEY, { auth:{ autoRefreshToken:false, persistSession:true, detectSessionInUrl:false } });
    return client;
  }
  function isBanned(err){
    if(!err) return false;
    return err.code === 'user_banned' || /banned/i.test(String(err.message || ''));
  }
  function logout(reason){
    if(done) return; done = true;
    try{ sessionStorage.removeItem('pdc_session'); sessionStorage.removeItem('pdc_user'); }catch(e){}
    var go = function(){
      var url = rootBase + 'login.html';
      if(typeof window.PDC_GUARD_REDIRECT === 'function') window.PDC_GUARD_REDIRECT(url, reason);
      else window.location.replace(url);
    };
    try{
      var p = client && client.auth.signOut({ scope:'local' });
      if(p && p.then) p.then(go, go); else go();
    }catch(e){ go(); }
  }

  async function check(){
    if(running || done || !hasAppSession()) return;
    running = true;
    try{
      if(!(await loadSdk())) return;                      /* sin SDK → no hace nada */
      var c = getClient();
      var r = await c.auth.getSession();                  /* renueva el token si hace falta */
      if(r && r.error){ if(isBanned(r.error)) logout('banned'); return; }
      var sess = r && r.data && r.data.session;
      if(!sess || !sess.user) return;
      var p = await c.from('profiles').select('activo').eq('id', sess.user.id).maybeSingle();
      if(p && !p.error && p.data && p.data.activo === false) logout('inactive');
    }catch(e){ /* red o error inesperado: nunca cerrar sesión por duda */ }
    finally{ running = false; }
  }

  window.PDCGuard = { check: check };
  check();
  setInterval(check, INTERVAL);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) check(); });
})();
