/* ════════════════════════════════════════════════════════════════
   PDC Analytics Center — Centro de Comunicación Widget v2.0
   cc_widget.js — componente reutilizable flotante
   Uso: <script src="cc_widget.js"></script> al final de cualquier dashboard
   ════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
if(window.__PDC_CC_V2__) return;
window.__PDC_CC_V2__ = true;

/* ── Constantes Supabase ── */
var SUPA_URL = 'https://pytsrgtcjytjztwdlvux.supabase.co';
var SUPA_KEY = 'sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj';
var HDRS     = {'apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY,'Content-Type':'application/json'};

/* ── Avatar — ruta relativa al repo (assistant_avatar.png) ── */
var AVATAR_BASE = (function(){
  var scripts = document.querySelectorAll('script[src]');
  for(var i=0;i<scripts.length;i++){
    if(scripts[i].src && scripts[i].src.indexOf('cc_widget')>-1)
      return scripts[i].src.replace(/cc_widget\.js(\?.*)?$/,'');
  }
  return '';
})();
var AVATAR = AVATAR_BASE + 'assistant_avatar.png';
var AVATAR_IMG = '<img src="'+AVATAR+'" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="PDC"/>';

/* ════════════════════
   CSS
   ════════════════════ */
var css = [
'#pdc-cc-fab{position:fixed;bottom:24px;right:24px;width:58px;height:58px;border-radius:50%;',
'background:linear-gradient(135deg,#0ea5e9,#4f46e5);border:none;cursor:pointer;',
'box-shadow:0 8px 32px rgba(14,165,233,.5),0 2px 8px rgba(0,0,0,.3);',
'z-index:99990;display:flex;align-items:center;justify-content:center;',
'transition:transform .2s,box-shadow .2s;outline:none;padding:0;}',
'#pdc-cc-fab:hover{transform:scale(1.10);box-shadow:0 12px 40px rgba(14,165,233,.65);}',
'#pdc-cc-fab .pfav{width:42px;height:42px;border-radius:50%;overflow:hidden;',
'border:2px solid rgba(255,255,255,.5);pointer-events:none;background:#e0f2fe;}',
'#pdc-cc-fab .pfbadge{position:absolute;top:-3px;right:-3px;min-width:20px;height:20px;',
'border-radius:10px;background:#ef4444;color:#fff;font-size:.58rem;font-weight:800;',
'display:none;align-items:center;justify-content:center;padding:0 5px;',
'font-family:system-ui,sans-serif;pointer-events:none;}',
'#pdc-cc-fab .pfonline{position:absolute;bottom:1px;left:1px;width:13px;height:13px;',
'border-radius:50%;background:#10b981;border:2px solid #0a0f1e;box-shadow:0 0 8px #10b981;pointer-events:none;}',

'#pdc-cc-win{position:fixed;bottom:24px;right:24px;width:460px;',
'height:70vh;min-height:600px;max-height:800px;',
'background:#0d1425;border:1px solid rgba(56,189,248,.22);border-radius:18px;',
'box-shadow:0 32px 80px rgba(0,0,0,.75);',
'display:flex;flex-direction:column;z-index:99991;overflow:hidden;',
'font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:14px;color:#e2e8f0;',
'transition:height .25s cubic-bezier(.4,0,.2,1);}',
'#pdc-cc-win.pmin{height:62px!important;min-height:unset;}',
'#pdc-cc-win.pmin .pcbody{display:none;}',
'#pdc-cc-win.pmin .pchdr{border-radius:18px;}',

'.pchdr{background:linear-gradient(135deg,#001240,#002060 55%,#0d1a4a);',
'border-bottom:1px solid rgba(255,255,255,.07);padding:0 14px;height:62px;',
'display:flex;align-items:center;gap:10px;flex-shrink:0;border-radius:18px 18px 0 0;user-select:none;}',
'.pchdr-av{width:38px;height:38px;border-radius:50%;overflow:hidden;',
'border:2px solid rgba(255,255,255,.3);flex-shrink:0;background:#e0f2fe;}',
'.pchdr-info{flex:1;min-width:0;}',
'.pchdr-title{font-size:.87rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
'.pchdr-sub{font-size:.6rem;color:rgba(207,238,252,.48);}',
'.pchdr-online{width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 7px #10b981;flex-shrink:0;}',
'.pchdr-badge{background:rgba(239,68,68,.9);color:#fff;font-size:.58rem;font-weight:800;',
'padding:2px 7px;border-radius:10px;display:none;flex-shrink:0;}',
'.pctrls{display:flex;gap:5px;flex-shrink:0;}',
'.pcbtn{width:26px;height:26px;border-radius:7px;border:1px solid rgba(255,255,255,.1);',
'background:rgba(255,255,255,.06);color:rgba(255,255,255,.65);font-size:.8rem;cursor:pointer;',
'display:flex;align-items:center;justify-content:center;transition:background .15s;',
'font-family:inherit;padding:0;}',
'.pcbtn:hover{background:rgba(255,255,255,.13);color:#fff;}',
'.pcbtn.cls:hover{background:rgba(239,68,68,.2);border-color:rgba(239,68,68,.4);color:#f87171;}',

'.pcbody{display:flex;flex:1;overflow:hidden;min-height:0;}',

'.pcsb{width:168px;border-right:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;flex-shrink:0;}',
'.pcsb.hidden{display:none;}',
'.pcsb-hdr{padding:9px 12px 7px;border-bottom:1px solid rgba(255,255,255,.05);',
'display:flex;align-items:center;justify-content:space-between;}',
'.pcsb-lbl{font-size:.58rem;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.28);text-transform:uppercase;}',
'.pcsb-cnt{background:#ef4444;color:#fff;font-size:.56rem;font-weight:800;padding:1px 6px;border-radius:8px;display:none;}',
'.pcconvs{flex:1;overflow-y:auto;}',
'.pcconvs::-webkit-scrollbar{width:2px;}',
'.pcconvs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);}',
'.pcconv{padding:9px 10px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.04);',
'transition:background .15s;display:flex;align-items:center;gap:7px;position:relative;}',
'.pcconv:hover{background:rgba(255,255,255,.04);}',
'.pcconv.on{background:rgba(56,189,248,.09);border-left:2px solid #38bdf8;}',
'.pcav{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);',
'display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.68rem;color:#fff;flex-shrink:0;}',
'.pccn{flex:1;min-width:0;}',
'.pccn-nm{font-size:.72rem;font-weight:600;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
'.pccn-pv{font-size:.59rem;color:rgba(255,255,255,.27);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
'.pcdot{position:absolute;right:7px;top:9px;width:7px;height:7px;border-radius:50%;',
'background:#38bdf8;box-shadow:0 0 5px #38bdf8;}',

'.pcchat{flex:1;display:flex;flex-direction:column;min-width:0;min-height:0;}',
'.pcchat-hdr{padding:8px 13px;border-bottom:1px solid rgba(255,255,255,.06);',
'background:rgba(10,15,30,.5);flex-shrink:0;display:flex;align-items:center;gap:7px;}',
'.pcph-dot{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;}',
'.pcph-nm{font-size:.79rem;font-weight:700;color:#e2e8f0;}',
'.pcph-em{font-size:.6rem;color:rgba(255,255,255,.3);}',
'.pcnoconv{flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;}',
'.pcnoconv-ico{font-size:2rem;opacity:.18;}',
'.pcnoconv-txt{font-size:.73rem;color:rgba(255,255,255,.2);text-align:center;padding:0 14px;line-height:1.55;}',

'.pcmsgs{flex:1;overflow-y:auto;padding:12px 13px;display:flex;flex-direction:column;gap:9px;min-height:0;}',
'.pcmsgs::-webkit-scrollbar{width:3px;}',
'.pcmsgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px;}',
'.pcmsg{max-width:84%;display:flex;flex-direction:column;gap:2px;}',
'.pcmsg.u{align-self:flex-start;}',
'.pcmsg.a{align-self:flex-end;}',
'.pcmsg-bbl{padding:9px 12px;border-radius:14px;font-size:.77rem;line-height:1.5;word-break:break-word;}',
'.pcmsg.u .pcmsg-bbl{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.07);',
'color:#e2e8f0;border-radius:3px 14px 14px 14px;}',
'.pcmsg.a .pcmsg-bbl{background:linear-gradient(135deg,#1d4ed8,#4f46e5);color:#fff;border-radius:14px 3px 14px 14px;}',
'.pcmsg-meta{font-size:.56rem;color:rgba(255,255,255,.27);}',
'.pcmsg.a .pcmsg-meta{text-align:right;}',

'.pcinp-row{padding:10px 12px;border-top:1px solid rgba(255,255,255,.06);',
'background:#0d1425;display:flex;gap:8px;flex-shrink:0;}',
'.pcinp{flex:1;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.11);',
'border-radius:10px;color:#e2e8f0;font-family:"Plus Jakarta Sans",system-ui,sans-serif;',
'font-size:.78rem;padding:9px 12px;outline:none;resize:none;transition:border-color .2s;max-height:76px;}',
'.pcinp:focus{border-color:#38bdf8;}',
'.pcinp::placeholder{color:rgba(255,255,255,.22);}',
'.pcsend{background:linear-gradient(135deg,#0ea5e9,#4f46e5);border:none;border-radius:10px;',
'color:#fff;font-weight:700;padding:9px 14px;cursor:pointer;font-size:.78rem;white-space:nowrap;',
'font-family:"Plus Jakarta Sans",system-ui,sans-serif;transition:transform .15s,box-shadow .15s;}',
'.pcsend:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(14,165,233,.4);}',
'.pcsend:disabled{opacity:.45;cursor:not-allowed;transform:none;}',

'#pdc-toast{position:fixed;top:18px;right:18px;z-index:99992;',
'background:linear-gradient(135deg,#0ea5e9,#4f46e5);color:#fff;',
'padding:13px 16px;border-radius:14px;font-size:.81rem;max-width:340px;',
'box-shadow:0 8px 32px rgba(0,0,0,.5);display:none;gap:10px;align-items:center;cursor:pointer;',
'font-family:"Plus Jakarta Sans",system-ui,sans-serif;}',
'#pdc-toast.show{display:flex;animation:pdcTIn .4s cubic-bezier(.16,1,.3,1);}',
'@keyframes pdcTIn{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:none}}',
'@media(max-width:860px){#pdc-cc-win{width:calc(100vw - 40px);max-width:none;}}',
'@media(max-width:500px){.pcsb{display:none!important;}}',
/* Animaciones avatar */
'.pdc-av-img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;}',
/* 1 Flotación suave FAB */
'@keyframes pdcFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
/* 2 Glow corporativo */
'@keyframes pdcGlow{0%,100%{box-shadow:0 8px 32px rgba(14,165,233,.5),0 2px 8px rgba(0,0,0,.3)}50%{box-shadow:0 8px 40px rgba(14,165,233,.9),0 0 24px rgba(56,189,248,.5)}}',
'#pdc-cc-fab{animation:pdcFloat 3s ease-in-out infinite,pdcGlow 3s ease-in-out infinite;}',
'#pdc-cc-fab:hover{animation:none;transform:scale(1.10);}',
/* 3 Pulso nuevo mensaje */
'@keyframes pdcPulse{0%{transform:scale(1)}20%{transform:scale(1.2)}50%{transform:scale(0.95)}80%{transform:scale(1.08)}100%{transform:scale(1)}}',
'#pdc-cc-fab.pdc-pulse{animation:pdcPulse .6s ease 3!important;}',
/* 4 Saludo al abrir */
'@keyframes pdcHello{0%{opacity:0;transform:scale(.88) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}',
'.pchdr-av.hello{animation:pdcHello .4s cubic-bezier(.16,1,.3,1);}',
/* Avatar styles */
'.pchdr-av{background:transparent!important;overflow:hidden;}',
'#pdc-cc-fab .pfav{background:transparent!important;border:2px solid rgba(255,255,255,.4);overflow:hidden;}',
].join('');

/* ════════════════════
   INYECTAR CSS
   ════════════════════ */
var st = document.createElement('style');
st.textContent = css;
document.head.appendChild(st);

/* ════════════════════
   INYECTAR HTML
   ════════════════════ */
var root = document.createElement('div');
root.id = 'pdc-cc-root';
root.innerHTML =
  '<div id="pdc-toast"><div class="pf-av" style="width:28px;height:28px;border-radius:50%;overflow:hidden;flex-shrink:0;">'+AVATAR_IMG+'</div>'
  +'<div><div style="font-weight:700;margin-bottom:2px;">Nuevo mensaje</div>'
  +'<div id="pdc-toast-txt" style="opacity:.85;font-size:.75rem;"></div></div>'
  +'<span style="margin-left:auto;opacity:.4;font-size:.82rem;">✕</span></div>'

  +'<button id="pdc-cc-fab" style="display:none;" title="Centro de Comunicación PDC">'
  +'<div class="pfav">'+AVATAR_IMG+'</div>'
  +'<span class="pfbadge" id="pdc-fab-badge"></span>'
  +'<span class="pfonline"></span></button>'

  +'<div id="pdc-cc-win" style="display:none;">'
    +'<div class="pchdr">'
      +'<div class="pchdr-av">'+AVATAR_IMG+'</div>'
      +'<div class="pchdr-info">'
        +'<div class="pchdr-title">Centro de Comunicación</div>'
        +'<div class="pchdr-sub">Mensajería · Soporte · PDC Analytics Center</div>'
      +'</div>'
      +'<div class="pchdr-online"></div>'
      +'<span class="pchdr-badge" id="pdc-hdr-badge"></span>'
      +'<div class="pctrls">'
        +'<button class="pcbtn" id="pdc-btn-min" title="Minimizar">─</button>'
        +'<button class="pcbtn cls" id="pdc-btn-cls" title="Cerrar">✕</button>'
      +'</div>'
    +'</div>'
    +'<div class="pcbody">'
      +'<div class="pcsb hidden" id="pdc-sb">'
        +'<div class="pcsb-hdr">'
          +'<span class="pcsb-lbl">Usuarios</span>'
          +'<span class="pcsb-cnt" id="pdc-sb-cnt"></span>'
        +'</div>'
        +'<div class="pcconvs" id="pdc-conv-list">'
          +'<div style="padding:12px 11px;font-size:.7rem;color:rgba(255,255,255,.22);">Cargando…</div>'
        +'</div>'
      +'</div>'
      +'<div class="pcchat" id="pdc-chat-pane">'
        +'<div class="pcnoconv" id="pdc-no-conv">'
          +'<div class="pcnoconv-ico">💬</div>'
          +'<div class="pcnoconv-txt">Selecciona una conversación</div>'
        +'</div>'
      +'</div>'
    +'</div>'
  +'</div>';

document.body.appendChild(root);

/* ════════════════════
   ESTADO
   ════════════════════ */
var _user        = null;
var _isAdmin     = false;
var _activeEmail = null;
var _activeName  = null;
var _toastTimer  = null;
var _fabUnread   = 0;
var _hdrUnread   = 0;
var _isMin       = false;
var _isClosed    = true;
var _pollInt     = null;
var _sbClient    = null;

/* ════════════════════
   AUTH
   ════════════════════ */
function initAuth(){
  var raw = sessionStorage.getItem('pdc_session') || sessionStorage.getItem('pdc_user');
  if(!raw) return false;
  try{ _user = JSON.parse(raw); }catch(e){ return false; }
  if(!_user) return false;
  if(!_user.rol  && _user.role)          _user.rol    = _user.role;
  if(!_user.nombre && _user.sender_nombre) _user.nombre = _user.sender_nombre;
  if(!_user.email  && _user.sender_email)  _user.email  = _user.sender_email;
  _isAdmin = (_user.rol === 'admin');
  return true;
}

/* ════════════════════
   REST FETCH — no depende del SDK
   ════════════════════ */
function restGet(path, params){
  var qs = params ? ('?'+Object.keys(params).map(function(k){return k+'='+encodeURIComponent(params[k]);}).join('&')) : '';
  return fetch(SUPA_URL+'/rest/v1/'+path+qs, {headers:HDRS}).then(function(r){return r.json();});
}
function restPost(path, body){
  return fetch(SUPA_URL+'/rest/v1/'+path, {
    method:'POST', headers:Object.assign({},HDRS,{'Prefer':'return=minimal'}),
    body:JSON.stringify(body)
  });
}
function restPatch(path, params, body){
  var qs = '?'+Object.keys(params).map(function(k){return k+'='+encodeURIComponent(params[k]);}).join('&');
  return fetch(SUPA_URL+'/rest/v1/'+path+qs, {
    method:'PATCH', headers:Object.assign({},HDRS,{'Prefer':'return=minimal'}),
    body:JSON.stringify(body)
  });
}

/* ════════════════════
   CONTROLES
   ════════════════════ */
function ccOpen(){
  _isClosed = false; _isMin = false;
  document.getElementById('pdc-cc-win').style.display = 'flex';
  document.getElementById('pdc-cc-win').classList.remove('pmin');
  document.getElementById('pdc-cc-fab').style.display = 'none';
  /* Animación saludo al abrir */
  setTimeout(function(){
    var av = document.querySelector('.pchdr-av');
    if(av){ av.classList.remove('hello'); void av.offsetWidth; av.classList.add('hello'); }
  }, 50);
  _fabUnread = 0;
  var badge = document.getElementById('pdc-fab-badge');
  badge.textContent = ''; badge.style.display = 'none';
  if(!_isAdmin && !_activeEmail) openConv(_user.email);
}
window.ccOpen = ccOpen; /* exponer globalmente para analytics.html */

function ccMinimize(){
  _isMin = !_isMin;
  document.getElementById('pdc-cc-win').classList.toggle('pmin', _isMin);
  document.getElementById('pdc-btn-min').textContent = _isMin ? '□' : '─';
}
function ccClose(){
  _isClosed = true; _isMin = false;
  document.getElementById('pdc-cc-win').style.display = 'none';
  document.getElementById('pdc-cc-fab').style.display = 'flex';
}

/* ════════════════════
   AUDIO
   ════════════════════ */
function playAlert(){
  try{
    var ctx = new(window.AudioContext||window.webkitAudioContext)();
    [880,660,440].forEach(function(f,i){
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value=f;
      g.gain.setValueAtTime(0.2, ctx.currentTime+i*0.12);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+i*0.12+0.22);
      o.start(ctx.currentTime+i*0.12); o.stop(ctx.currentTime+i*0.12+0.22);
    });
  }catch(e){}
}

/* ════════════════════
   TOAST
   ════════════════════ */
function showToast(text, email){
  var toast = document.getElementById('pdc-toast');
  document.getElementById('pdc-toast-txt').textContent = text;
  toast.classList.add('show');
  toast.onclick = function(){ dismissToast(); if(email) openConv(email); else if(_isClosed) ccOpen(); };
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(dismissToast, 6000);
  if(_isClosed){
    _fabUnread++;
    var fb = document.getElementById('pdc-fab-badge');
    fb.textContent = _fabUnread > 9 ? '9+' : _fabUnread;
    fb.style.display = 'flex';
    /* Pulso en FAB */
    var fab=document.getElementById('pdc-cc-fab');
    if(fab){fab.classList.remove('pdc-pulse');void fab.offsetWidth;fab.classList.add('pdc-pulse');
      setTimeout(function(){fab.classList.remove('pdc-pulse');},2000);}
  }
  _hdrUnread++;
  var hb = document.getElementById('pdc-hdr-badge');
  hb.textContent = _hdrUnread > 9 ? '9+' : _hdrUnread;
  hb.style.display = 'flex';
}
function dismissToast(){ document.getElementById('pdc-toast').classList.remove('show'); }
document.getElementById('pdc-toast').addEventListener('click', dismissToast);

/* ════════════════════
   CARGAR CONVERSACIONES — REST puro
   ════════════════════ */
function loadConversations(){
  if(!_isAdmin){
    if(_activeEmail) loadMessages(_activeEmail);
    return;
  }
  restGet('chat_messages', {
    select: 'sender_email,sender_nombre,sender_role,message,created_at,is_read',
    order:  'created_at.desc',
    limit:  '200'
  }).then(function(data){
    if(!Array.isArray(data)) return;
    var map = {};
    data.forEach(function(m){
      if(m.sender_role === 'admin') return;
      if(!map[m.sender_email]){
        map[m.sender_email] = {nombre:m.sender_nombre||m.sender_email, lastMsg:m.message, unread:0};
      }
      if(!m.is_read) map[m.sender_email].unread++;
    });
    var emails = Object.keys(map);
    var convList = document.getElementById('pdc-conv-list');
    if(!emails.length){
      convList.innerHTML = '<div style="padding:12px 11px;font-size:.7rem;color:rgba(255,255,255,.22);">Sin mensajes aún</div>';
      return;
    }
    var total = 0;
    convList.innerHTML = emails.map(function(email){
      var c = map[email];
      total += c.unread;
      var ini = (c.nombre||'?').split(' ').map(function(n){return n[0]||'';}).join('').substring(0,2).toUpperCase();
      return '<div class="pcconv'+(_activeEmail===email?' on':'')+'" data-email="'+email+'">'
        +'<div class="pcav">'+ini+'</div>'
        +'<div class="pccn">'
        +'<div class="pccn-nm">'+c.nombre+'</div>'
        +'<div class="pccn-pv">'+c.lastMsg.replace(/^\[To:[^\]]+\]\s*/,'').substring(0,25)+'</div>'
        +'</div>'
        +(c.unread>0?'<div class="pcdot"></div>':'')
        +'</div>';
    }).join('');
    convList.querySelectorAll('.pcconv').forEach(function(el){
      el.addEventListener('click', function(){ openConv(el.getAttribute('data-email')); });
    });
    var cnt = document.getElementById('pdc-sb-cnt');
    cnt.textContent = total; cnt.style.display = total>0?'flex':'none';
  }).catch(function(e){ console.warn('pdc-cc loadConv:', e); });
}

/* ════════════════════
   ABRIR CONVERSACIÓN
   ════════════════════ */
function openConv(email){
  if(!_isAdmin) email = _user.email;
  var nombre = email;
  if(_isAdmin){
    var el = document.querySelector('.pcconv[data-email="'+email+'"] .pccn-nm');
    if(el) nombre = el.textContent;
  } else {
    nombre = _user.nombre || _user.email;
  }
  _activeEmail = email;
  _activeName  = nombre;

  /* Marcar leídos admin */
  if(_isAdmin){
    restPatch('chat_messages',
      {'sender_email':'eq.'+email,'sender_role':'eq.user','is_read':'eq.false'},
      {is_read:true}
    ).then(function(){ loadConversations(); }).catch(function(){});
  }

  /* Resetear badge header */
  _hdrUnread = 0;
  document.getElementById('pdc-hdr-badge').style.display = 'none';

  var displayName = _isAdmin ? nombre : 'Administración PDC';
  var displaySub  = _isAdmin ? email  : 'Soporte · PDC Analytics Center';
  var placeholder = _isAdmin ? 'Responder a '+nombre+'…' : 'Escribe tu mensaje…';

  var pane = document.getElementById('pdc-chat-pane');
  pane.innerHTML =
    '<div class="pcchat-hdr">'
    +'<div class="pcph-dot"></div>'
    +'<div><div class="pcph-nm">'+displayName+'</div>'
    +'<div class="pcph-em">'+displaySub+'</div></div>'
    +'</div>'
    +'<div class="pcmsgs" id="pdc-msg-area"></div>'
    +'<div class="pcinp-row">'
    +'<textarea class="pcinp" id="pdc-inp" placeholder="'+placeholder+'" rows="1"></textarea>'
    +'<button class="pcsend" id="pdc-send-btn">Enviar ↑</button>'
    +'</div>';

  /* Eventos — adjuntados directamente al elemento recién creado */
  var inp = document.getElementById('pdc-inp');
  var btn = document.getElementById('pdc-send-btn');
  if(inp) inp.addEventListener('keydown', function(e){
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMsg(); }
  });
  if(btn) btn.addEventListener('click', function(){ sendMsg(); });

  loadMessages(email);
}

/* ════════════════════
   CARGAR MENSAJES — REST puro
   ════════════════════ */
function loadMessages(email){
  restGet('chat_messages', {
    sender_email: 'eq.'+email,
    order: 'created_at.asc',
    limit: '200'
  }).then(function(data){
    if(!Array.isArray(data)) return;
    var area = document.getElementById('pdc-msg-area');
    if(!area) return;

    if(!data.length){
      area.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;flex:1;padding:20px;'
        +'color:rgba(255,255,255,.2);font-size:.75rem;text-align:center;">Sin mensajes aún.<br>¡Escribe el primero!</div>';
      return;
    }

    area.innerHTML = data.map(function(m){
      var isA = m.sender_role === 'admin';
      var text = isA ? m.message.replace(/^\[To:[^\]]+\]\s*/,'') : m.message;
      text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
      var t = new Date(m.created_at).toLocaleString('es-GT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
      var who = isA ? (_isAdmin ? 'Tú (Admin)' : 'Administración PDC') : (m.sender_nombre||'Usuario');
      return '<div class="pcmsg '+(isA?'a':'u')+'">'
        +'<div class="pcmsg-bbl">'+text+'</div>'
        +'<div class="pcmsg-meta">'+who+' · '+t+'</div>'
        +'</div>';
    }).join('');

    requestAnimationFrame(function(){ area.scrollTop = area.scrollHeight; });
  }).catch(function(e){ console.warn('pdc-cc loadMsgs:', e); });
}

/* ════════════════════
   ENVIAR MENSAJE — REST puro (sin SDK)
   ════════════════════ */
function sendMsg(){
  if(!_activeEmail) return;
  var inp = document.getElementById('pdc-inp');
  var btn = document.getElementById('pdc-send-btn');
  if(!inp) return;
  var text = inp.value.trim();
  if(!text) return;
  inp.value = '';
  if(btn){ btn.disabled = true; }

  var body = _isAdmin
    ? {sender_email:_activeEmail, sender_nombre:_user.nombre||'Admin',
       sender_role:'admin', message:'[To:'+_activeEmail+'] '+text, is_read:true}
    : {sender_email:_user.email,  sender_nombre:_user.nombre||_user.email,
       sender_role:'user',  message:text, is_read:false};

  restPost('chat_messages', body)
    .then(function(){
      if(btn) btn.disabled = false;
      loadMessages(_activeEmail);
    })
    .catch(function(e){
      console.warn('pdc-cc sendMsg:', e);
      if(btn) btn.disabled = false;
    });
}

/* ════════════════════
   REALTIME — Supabase SDK si disponible
   ════════════════════ */
function initRealtime(){
  try{
    var createClient = (window.supabase && window.supabase.createClient) ||
                       (window.Supabase && window.Supabase.createClient);
    if(!createClient) return;
    if(!_sbClient) _sbClient = createClient(SUPA_URL, SUPA_KEY);
    _sbClient.channel('pdc-cc-rt-'+Date.now())
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages'},
        function(payload){
          var m = payload.new;
          if(_isAdmin){
            if(m.sender_role !== 'admin'){
              playAlert();
              showToast((m.sender_nombre||'Usuario')+': '+m.message.substring(0,55)+'…', m.sender_email);
              loadConversations();
              if(_activeEmail === m.sender_email) loadMessages(_activeEmail);
            } else if(_activeEmail && m.sender_email === _activeEmail){
              loadMessages(_activeEmail);
            }
          } else {
            if(m.sender_role==='admin' && m.sender_email===_user.email){
              playAlert();
              showToast('Administración PDC: '+m.message.replace(/^\[To:[^\]]+\]\s*/,'').substring(0,55)+'…', null);
              if(_activeEmail) loadMessages(_activeEmail);
            }
          }
        }
      ).subscribe();
  }catch(e){ console.warn('pdc-cc realtime:', e); }
}

/* ════════════════════
   POLLING — fallback + principal
   ════════════════════ */
function startPolling(){
  clearInterval(_pollInt);
  _pollInt = setInterval(function(){
    if(!_isClosed && !_isMin) loadConversations();
  }, 5000);
}

/* ════════════════════
   BOOT
   ════════════════════ */
function boot(){
  if(!initAuth()) return; /* sin sesión: no mostrar widget */

  /* Mostrar FAB */
  document.getElementById('pdc-cc-fab').style.display = 'flex';

  /* Sidebar solo admin */
  if(_isAdmin) document.getElementById('pdc-sb').classList.remove('hidden');

  /* Eventos controles */
  document.getElementById('pdc-cc-fab').addEventListener('click', ccOpen);
  document.getElementById('pdc-btn-min').addEventListener('click', ccMinimize);
  document.getElementById('pdc-btn-cls').addEventListener('click', ccClose);

  /* Carga inicial */
  loadConversations();
  startPolling();

  /* Intentar Realtime */
  initRealtime();
  /* Reintentar si SDK no estaba listo */
  if(!_sbClient){
    var tries = 0;
    var t = setInterval(function(){
      if(++tries > 20){ clearInterval(t); return; }
      initRealtime();
      if(_sbClient) clearInterval(t);
    }, 500);
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
