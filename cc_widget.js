/* ════════════════════════════════════════════════════════════════
   PDC Analytics Center — Centro de Comunicación Widget v1.0
   Archivo: cc_widget.js
   Uso: <script src="cc_widget.js"></script> al final de cualquier dashboard
   
   AVATAR IA: Reemplazar el emoji 💬 en PDC_CC_AVATAR_HTML por
   la imagen corporativa definitiva cuando esté disponible.
   Ejemplo: <img src="assets/avatar_ia.png" width="36" height="36"/>
   ════════════════════════════════════════════════════════════════ */

(function() {
'use strict';

/* ── Evitar doble inicialización ── */
if(window.__PDC_CC_LOADED__) return;
window.__PDC_CC_LOADED__ = true;

/* ════════════════════
   AVATAR IA CORPORATIVO
   Reemplazar contenido cuando se disponga de imagen definitiva
   ════════════════════ */
var PDC_CC_AVATAR_HTML = '💬'; /* TODO: reemplazar por <img src="assets/avatar_ia.png"/> */

/* ════════════════════
   CSS — autocontenido, prefijo pdc-cc para no colisionar
   ════════════════════ */
var css = `
/* PDC CC Widget — no modifica estilos del host */
#pdc-cc-fab {
  position:fixed; bottom:24px; right:24px;
  width:58px; height:58px; border-radius:50%;
  background:linear-gradient(135deg,#0ea5e9,#4f46e5);
  border:none; cursor:pointer;
  box-shadow:0 8px 32px rgba(14,165,233,.5),0 2px 8px rgba(0,0,0,.3);
  z-index:99990;
  display:flex; align-items:center; justify-content:center;
  transition:transform .2s,box-shadow .2s;
  outline:none;
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
}
#pdc-cc-fab:hover {
  transform:scale(1.10);
  box-shadow:0 12px 40px rgba(14,165,233,.65),0 4px 12px rgba(0,0,0,.4);
}
#pdc-cc-fab .pdc-fab-inner {
  width:36px; height:36px; border-radius:50%;
  background:rgba(255,255,255,.15);
  border:2px solid rgba(255,255,255,.4);
  display:flex; align-items:center; justify-content:center;
  font-size:1.25rem; color:#fff; pointer-events:none;
  overflow:hidden;
}
#pdc-cc-fab .pdc-fab-badge {
  position:absolute; top:-3px; right:-3px;
  min-width:20px; height:20px; border-radius:10px;
  background:#ef4444; color:#fff;
  font-size:.6rem; font-weight:800;
  display:none; align-items:center; justify-content:center;
  padding:0 5px; pointer-events:none;
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
}
#pdc-cc-fab .pdc-fab-online {
  position:absolute; bottom:1px; left:1px;
  width:13px; height:13px; border-radius:50%;
  background:#10b981; border:2px solid transparent;
  box-shadow:0 0 8px #10b981; pointer-events:none;
}

/* ── Ventana flotante ── */
#pdc-cc-win {
  position:fixed; bottom:24px; right:24px;
  width:460px;
  height:70vh; min-height:600px; max-height:800px;
  background:#0d1425;
  border:1px solid rgba(56,189,248,.22);
  border-radius:18px;
  box-shadow:0 32px 80px rgba(0,0,0,.75),0 0 0 1px rgba(56,189,248,.08);
  display:flex; flex-direction:column;
  z-index:99991;
  overflow:hidden;
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  font-size:14px;
  color:#e2e8f0;
  transition:height .25s cubic-bezier(.4,0,.2,1);
}
#pdc-cc-win.pdc-min { height:62px !important; min-height:unset; }
#pdc-cc-win.pdc-min .pdc-cc-body { display:none; }
#pdc-cc-win.pdc-min .pdc-cc-hdr  { border-radius:18px; }

/* Header */
.pdc-cc-hdr {
  background:linear-gradient(135deg,#001240 0%,#002060 55%,#0d1a4a 100%);
  border-bottom:1px solid rgba(255,255,255,.07);
  padding:0 14px; height:62px;
  display:flex; align-items:center; gap:10px;
  flex-shrink:0; border-radius:18px 18px 0 0;
  user-select:none;
}
.pdc-cc-hdr-av {
  width:36px; height:36px; border-radius:50%;
  background:linear-gradient(135deg,#0ea5e9,#4f46e5);
  border:2px solid rgba(255,255,255,.3);
  display:flex; align-items:center; justify-content:center;
  font-size:1.1rem; flex-shrink:0; overflow:hidden;
}
.pdc-cc-hdr-info { flex:1; min-width:0; }
.pdc-cc-hdr-title {
  font-size:.87rem; font-weight:700; color:#fff;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.pdc-cc-hdr-sub {
  font-size:.6rem; color:rgba(207,238,252,.48);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.pdc-cc-hdr-online {
  width:8px; height:8px; border-radius:50%;
  background:#10b981; box-shadow:0 0 7px #10b981; flex-shrink:0;
}
.pdc-cc-hdr-badge {
  background:rgba(239,68,68,.9); color:#fff;
  font-size:.58rem; font-weight:800;
  padding:2px 7px; border-radius:10px;
  display:none; flex-shrink:0;
}
.pdc-cc-ctrls { display:flex; gap:5px; flex-shrink:0; }
.pdc-cc-cbtn {
  width:26px; height:26px; border-radius:7px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.65);
  font-size:.8rem; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:background .15s; font-family:inherit;
}
.pdc-cc-cbtn:hover { background:rgba(255,255,255,.13); color:#fff; }
.pdc-cc-cbtn.cls:hover {
  background:rgba(239,68,68,.2);
  border-color:rgba(239,68,68,.4); color:#f87171;
}

/* Body */
.pdc-cc-body {
  display:flex; flex:1; overflow:hidden; min-height:0;
}

/* Sidebar convs (solo admin) */
.pdc-cc-sb {
  width:168px; border-right:1px solid rgba(255,255,255,.06);
  display:flex; flex-direction:column; flex-shrink:0;
}
.pdc-cc-sb.hidden { display:none; }
.pdc-cc-sb-hdr {
  padding:9px 12px 7px;
  border-bottom:1px solid rgba(255,255,255,.05);
  display:flex; align-items:center; justify-content:space-between;
}
.pdc-cc-sb-lbl {
  font-size:.58rem; font-weight:700; letter-spacing:.1em;
  color:rgba(255,255,255,.28); text-transform:uppercase;
}
.pdc-cc-sb-cnt {
  background:#ef4444; color:#fff;
  font-size:.56rem; font-weight:800;
  padding:1px 6px; border-radius:8px; display:none;
}
.pdc-cc-convs { flex:1; overflow-y:auto; }
.pdc-cc-convs::-webkit-scrollbar { width:2px; }
.pdc-cc-convs::-webkit-scrollbar-thumb { background:rgba(255,255,255,.08); }
.pdc-cc-conv {
  padding:9px 10px; cursor:pointer;
  border-bottom:1px solid rgba(255,255,255,.04);
  transition:background .15s;
  display:flex; align-items:center; gap:7px; position:relative;
}
.pdc-cc-conv:hover { background:rgba(255,255,255,.04); }
.pdc-cc-conv.on { background:rgba(56,189,248,.09); border-left:2px solid #38bdf8; }
.pdc-cc-av {
  width:30px; height:30px; border-radius:50%;
  background:linear-gradient(135deg,#3b82f6,#8b5cf6);
  display:flex; align-items:center; justify-content:center;
  font-weight:800; font-size:.68rem; color:#fff; flex-shrink:0;
}
.pdc-cc-cn { flex:1; min-width:0; }
.pdc-cc-cn-nm {
  font-size:.72rem; font-weight:600; color:#e2e8f0;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.pdc-cc-cn-pv {
  font-size:.59rem; color:rgba(255,255,255,.27);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.pdc-cc-dot {
  position:absolute; right:7px; top:9px;
  width:7px; height:7px; border-radius:50%;
  background:#38bdf8; box-shadow:0 0 5px #38bdf8;
}

/* Panel chat */
.pdc-cc-chat { flex:1; display:flex; flex-direction:column; min-width:0; min-height:0; }
.pdc-cc-chat-hdr {
  padding:8px 13px;
  border-bottom:1px solid rgba(255,255,255,.06);
  background:rgba(10,15,30,.5);
  flex-shrink:0; display:flex; align-items:center; gap:7px;
}
.pdc-cc-ph-dot {
  width:7px; height:7px; border-radius:50%;
  background:#10b981; box-shadow:0 0 6px #10b981;
}
.pdc-cc-ph-nm { font-size:.79rem; font-weight:700; color:#e2e8f0; }
.pdc-cc-ph-em { font-size:.6rem; color:rgba(255,255,255,.3); }
.pdc-cc-noconv {
  flex:1; display:flex; align-items:center; justify-content:center;
  flex-direction:column; gap:8px;
}
.pdc-cc-noconv-ico { font-size:2rem; opacity:.18; }
.pdc-cc-noconv-txt {
  font-size:.73rem; color:rgba(255,255,255,.2);
  text-align:center; padding:0 14px; line-height:1.55;
}

/* Mensajes */
.pdc-cc-msgs {
  flex:1; overflow-y:auto;
  padding:12px 13px;
  display:flex; flex-direction:column; gap:9px;
  min-height:0;
}
.pdc-cc-msgs::-webkit-scrollbar { width:3px; }
.pdc-cc-msgs::-webkit-scrollbar-thumb {
  background:rgba(255,255,255,.1); border-radius:2px;
}
.pdc-cc-msg { max-width:84%; display:flex; flex-direction:column; gap:2px; }
.pdc-cc-msg.u { align-self:flex-start; }
.pdc-cc-msg.a { align-self:flex-end; }
.pdc-cc-msg-bbl {
  padding:9px 12px; border-radius:14px;
  font-size:.77rem; line-height:1.5; word-break:break-word;
}
.pdc-cc-msg.u .pdc-cc-msg-bbl {
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.07);
  color:#e2e8f0; border-radius:3px 14px 14px 14px;
}
.pdc-cc-msg.a .pdc-cc-msg-bbl {
  background:linear-gradient(135deg,#1d4ed8,#4f46e5);
  color:#fff; border-radius:14px 3px 14px 14px;
}
.pdc-cc-msg-meta { font-size:.56rem; color:rgba(255,255,255,.27); }
.pdc-cc-msg.a .pdc-cc-msg-meta { text-align:right; }

/* Input */
.pdc-cc-inp-row {
  padding:10px 12px;
  border-top:1px solid rgba(255,255,255,.06);
  background:#0d1425;
  display:flex; gap:8px; flex-shrink:0;
}
.pdc-cc-inp {
  flex:1;
  background:rgba(255,255,255,.07);
  border:1.5px solid rgba(255,255,255,.11);
  border-radius:10px; color:#e2e8f0;
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  font-size:.78rem; padding:9px 12px;
  outline:none; resize:none; transition:border-color .2s;
  max-height:76px;
}
.pdc-cc-inp:focus { border-color:#38bdf8; }
.pdc-cc-inp::placeholder { color:rgba(255,255,255,.22); }
.pdc-cc-send {
  background:linear-gradient(135deg,#0ea5e9,#4f46e5);
  border:none; border-radius:10px; color:#fff;
  font-weight:700; padding:9px 14px; cursor:pointer;
  font-size:.78rem; white-space:nowrap;
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  transition:transform .15s,box-shadow .15s;
}
.pdc-cc-send:hover {
  transform:translateY(-1px);
  box-shadow:0 6px 20px rgba(14,165,233,.4);
}
.pdc-cc-send:disabled { opacity:.45; cursor:not-allowed; transform:none; }

/* Toast */
#pdc-cc-toast {
  position:fixed; top:18px; right:18px; z-index:99992;
  background:linear-gradient(135deg,#0ea5e9,#4f46e5);
  color:#fff; padding:13px 16px; border-radius:14px;
  font-size:.81rem; max-width:340px;
  box-shadow:0 8px 32px rgba(0,0,0,.5);
  display:none; gap:10px; align-items:center; cursor:pointer;
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
}
#pdc-cc-toast.show {
  display:flex;
  animation:pdcToastIn .4s cubic-bezier(.16,1,.3,1);
}
@keyframes pdcToastIn {
  from{opacity:0;transform:translateX(50px)}
  to{opacity:1;transform:none}
}

@media(max-width:860px){
  #pdc-cc-win { width:calc(100vw - 40px); max-width:none; }
  .pdc-cc-sb  { width:130px; }
}
@media(max-width:500px){
  .pdc-cc-sb  { display:none !important; }
}
`;

/* ════════════════════
   INYECTAR CSS
   ════════════════════ */
var styleEl = document.createElement('style');
styleEl.id  = 'pdc-cc-style';
styleEl.textContent = css;
document.head.appendChild(styleEl);

/* ════════════════════
   INYECTAR HTML
   ════════════════════ */
var html = `
<!-- PDC CC Toast -->
<div id="pdc-cc-toast">
  <span style="font-size:1.2rem;flex-shrink:0;">${PDC_CC_AVATAR_HTML}</span>
  <div>
    <div style="font-weight:700;margin-bottom:2px;">Nuevo mensaje</div>
    <div id="pdc-cc-toast-txt" style="opacity:.85;font-size:.75rem;"></div>
  </div>
  <span style="margin-left:auto;opacity:.4;font-size:.82rem;">✕</span>
</div>

<!-- PDC CC FAB -->
<button id="pdc-cc-fab" title="Centro de Comunicación PDC" style="display:none;">
  <div class="pdc-fab-inner">${PDC_CC_AVATAR_HTML}</div>
  <span class="pdc-fab-badge" id="pdc-fab-badge"></span>
  <span class="pdc-fab-online"></span>
</button>

<!-- PDC CC Ventana Flotante -->
<div id="pdc-cc-win" style="display:none;">
  <div class="pdc-cc-hdr">
    <div class="pdc-cc-hdr-av">${PDC_CC_AVATAR_HTML}</div>
    <div class="pdc-cc-hdr-info">
      <div class="pdc-cc-hdr-title">Centro de Comunicación</div>
      <div class="pdc-cc-hdr-sub">Mensajería · Soporte · PDC Analytics Center</div>
    </div>
    <div class="pdc-cc-hdr-online"></div>
    <span class="pdc-cc-hdr-badge" id="pdc-hdr-badge"></span>
    <div class="pdc-cc-ctrls">
      <button class="pdc-cc-cbtn" id="pdc-btn-min" title="Minimizar">─</button>
      <button class="pdc-cc-cbtn cls" id="pdc-btn-cls" title="Cerrar">✕</button>
    </div>
  </div>
  <div class="pdc-cc-body">
    <div class="pdc-cc-sb hidden" id="pdc-cc-sb">
      <div class="pdc-cc-sb-hdr">
        <span class="pdc-cc-sb-lbl">Usuarios</span>
        <span class="pdc-cc-sb-cnt" id="pdc-sb-cnt"></span>
      </div>
      <div class="pdc-cc-convs" id="pdc-conv-list">
        <div style="padding:12px 11px;font-size:.7rem;color:rgba(255,255,255,.22);">Cargando…</div>
      </div>
    </div>
    <div class="pdc-cc-chat" id="pdc-chat-pane">
      <div class="pdc-cc-noconv" id="pdc-no-conv">
        <div class="pdc-cc-noconv-ico">💬</div>
        <div class="pdc-cc-noconv-txt">Selecciona una conversación</div>
      </div>
    </div>
  </div>
</div>
`;

var wrapper = document.createElement('div');
wrapper.id  = 'pdc-cc-root';
wrapper.innerHTML = html;
document.body.appendChild(wrapper);

/* ════════════════════
   SUPABASE
   ════════════════════ */
var SUPA_URL = 'https://pytsrgtcjytjztwdlvux.supabase.co';
var SUPA_KEY = 'sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj';

var sbClient = null;
function getSB(){
  if(sbClient) return sbClient;
  if(window.supabase && window.supabase.createClient){
    sbClient = window.supabase.createClient(SUPA_URL, SUPA_KEY);
  }
  return sbClient;
}

/* ════════════════════
   ESTADO
   ════════════════════ */
var _user       = null;
var _isAdmin    = false;
var _activeEmail= null;
var _activeName = null;
var _toastTimer = null;
var _fabUnread  = 0;
var _hdrUnread  = 0;
var _isMin      = false;
var _isClosed   = true;
var _pollInt    = null;

/* ════════════════════
   AUTH — leer sesión del dashboard host
   ════════════════════ */
function initAuth(){
  var raw = sessionStorage.getItem('pdc_session') || sessionStorage.getItem('pdc_user');
  if(!raw) return false;
  try { _user = JSON.parse(raw); } catch(e){ return false; }
  if(!_user) return false;

  /* Normalizar campos según formato de sesión */
  if(!_user.rol  && _user.role)         _user.rol   = _user.role;
  if(!_user.nombre && _user.sender_nombre) _user.nombre = _user.sender_nombre;
  if(!_user.email  && _user.sender_email)  _user.email  = _user.sender_email;

  _isAdmin = (_user.rol === 'admin');
  return true;
}

/* ════════════════════
   CONTROLES FAB / VENTANA
   ════════════════════ */
function ccOpen(){
  _isClosed = false; _isMin = false;
  document.getElementById('pdc-cc-win').style.display = 'flex';
  document.getElementById('pdc-cc-win').classList.remove('pdc-min');
  document.getElementById('pdc-cc-fab').style.display = 'none';
  _fabUnread = 0;
  var badge = document.getElementById('pdc-fab-badge');
  badge.textContent = ''; badge.style.display = 'none';
  /* Usuario no-admin: abrir su conv al primer click */
  if(!_isAdmin && !_activeEmail) openConv(_user.email);
}
function ccMinimize(){
  _isMin = !_isMin;
  document.getElementById('pdc-cc-win').classList.toggle('pdc-min', _isMin);
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
      g.gain.setValueAtTime(0.22, ctx.currentTime+i*0.12);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+i*0.12+0.22);
      o.start(ctx.currentTime+i*0.12);
      o.stop(ctx.currentTime+i*0.12+0.22);
    });
  }catch(e){}
}

/* ════════════════════
   TOAST
   ════════════════════ */
function showToast(text, email){
  var toast = document.getElementById('pdc-cc-toast');
  document.getElementById('pdc-cc-toast-txt').textContent = text;
  toast.classList.add('show');
  toast.onclick = function(){
    dismissToast();
    if(email) openConv(email);
    else if(_isClosed) ccOpen();
  };
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(dismissToast, 6000);

  if(_isClosed){
    _fabUnread++;
    var fb = document.getElementById('pdc-fab-badge');
    fb.textContent = _fabUnread > 9 ? '9+' : _fabUnread;
    fb.style.display = 'flex';
  }
  _hdrUnread++;
  var hb = document.getElementById('pdc-hdr-badge');
  hb.textContent = _hdrUnread > 9 ? '9+' : _hdrUnread;
  hb.style.display = 'flex';
}
function dismissToast(){
  document.getElementById('pdc-cc-toast').classList.remove('show');
}

/* ════════════════════
   CARGAR CONVERSACIONES (solo admin ve la lista)
   ════════════════════ */
async function loadConversations(){
  var sb = getSB(); if(!sb) return;
  var res = await sb.from('chat_messages')
    .select('sender_email,sender_nombre,sender_role,message,created_at,is_read')
    .order('created_at',{ascending:false});
  if(!res.data) return;
  var data = res.data;

  if(_isAdmin){
    var map = {};
    data.forEach(function(m){
      if(m.sender_role === 'admin') return;
      if(!map[m.sender_email]){
        map[m.sender_email] = {nombre:m.sender_nombre, lastMsg:m.message, lastTime:m.created_at, unread:0};
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
      var ini = c.nombre.split(' ').map(function(n){return n[0]||'';}).join('').substring(0,2).toUpperCase();
      return '<div class="pdc-cc-conv'+(_activeEmail===email?' on':'')+'" data-email="'+email+'">'
        +'<div class="pdc-cc-av">'+ini+'</div>'
        +'<div class="pdc-cc-cn">'
        +'<div class="pdc-cc-cn-nm">'+c.nombre+'</div>'
        +'<div class="pdc-cc-cn-pv">'+c.lastMsg.replace(/^\[To:[^\]]+\]\s*/,'').substring(0,28)+'</div>'
        +'</div>'
        +(c.unread>0?'<div class="pdc-cc-dot"></div>':'')
        +'</div>';
    }).join('');

    /* Eventos click en conv items */
    convList.querySelectorAll('.pdc-cc-conv').forEach(function(el){
      el.addEventListener('click', function(){
        openConv(el.getAttribute('data-email'));
      });
    });

    var cnt = document.getElementById('pdc-sb-cnt');
    cnt.textContent = total; cnt.style.display = total>0?'flex':'none';

  } else {
    /* Usuario: si hay conv activa, recargar mensajes */
    if(_activeEmail) await loadMessages(_activeEmail);
  }
}

/* ════════════════════
   ABRIR CONVERSACIÓN
   ════════════════════ */
async function openConv(email){
  if(!_isAdmin) email = _user.email;

  var nombre = email;
  if(_isAdmin){
    var el = document.querySelector('.pdc-cc-conv[data-email="'+email+'"] .pdc-cc-cn-nm');
    if(el) nombre = el.textContent;
  } else {
    nombre = _user.nombre || _user.email;
  }

  _activeEmail  = email;
  _activeName   = nombre;

  /* Marcar leídos */
  if(_isAdmin){
    var sb = getSB();
    if(sb) await sb.from('chat_messages')
      .update({is_read:true})
      .eq('sender_email', email)
      .eq('sender_role','user')
      .eq('is_read', false);
    loadConversations();
  }

  /* Resetear badge header */
  _hdrUnread = 0;
  var hb = document.getElementById('pdc-hdr-badge');
  hb.style.display = 'none';

  /* Inyectar panel */
  var pane = document.getElementById('pdc-chat-pane');
  var displayName = _isAdmin ? nombre : 'Administración PDC';
  var displaySub  = _isAdmin ? email  : 'Soporte · PDC Analytics Center';
  var placeholder = _isAdmin ? 'Responder a '+nombre+'…' : 'Escribe tu mensaje…';

  pane.innerHTML =
    '<div class="pdc-cc-chat-hdr">'
    +'<div class="pdc-cc-ph-dot"></div>'
    +'<div><div class="pdc-cc-ph-nm">'+displayName+'</div>'
    +'<div class="pdc-cc-ph-em">'+displaySub+'</div></div>'
    +'</div>'
    +'<div class="pdc-cc-msgs" id="pdc-msg-area"></div>'
    +'<div class="pdc-cc-inp-row">'
    +'<textarea class="pdc-cc-inp" id="pdc-inp" placeholder="'+placeholder+'" rows="1"></textarea>'
    +'<button class="pdc-cc-send" id="pdc-send-btn">Enviar ↑</button>'
    +'</div>';

  document.getElementById('pdc-inp').addEventListener('keydown', function(e){
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMsg(); }
  });
  document.getElementById('pdc-send-btn').addEventListener('click', sendMsg);

  await loadMessages(email);
}

/* ════════════════════
   CARGAR MENSAJES
   ════════════════════ */
async function loadMessages(email){
  var sb = getSB(); if(!sb) return;
  var res = await sb.from('chat_messages')
    .select('*')
    .eq('sender_email', email)
    .order('created_at',{ascending:true});

  if(res.error){ console.error('pdc-cc:', res.error); return; }
  var data = res.data;
  var area = document.getElementById('pdc-msg-area');
  if(!area) return;

  if(!data || !data.length){
    area.innerHTML = '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.2);font-size:.75rem;padding:20px;text-align:center;">Sin mensajes aún.<br>¡Escribe el primero!</div>';
    return;
  }

  area.innerHTML = data.map(function(m){
    var isA = m.sender_role === 'admin';
    var text = isA ? m.message.replace(/^\[To:[^\]]+\]\s*/,'') : m.message;
    text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    var t = new Date(m.created_at).toLocaleString('es-GT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
    var who = isA
      ? (_isAdmin ? 'Tú (Admin)' : 'Administración PDC')
      : m.sender_nombre;
    return '<div class="pdc-cc-msg '+(isA?'a':'u')+'">'
      +'<div class="pdc-cc-msg-bbl">'+text+'</div>'
      +'<div class="pdc-cc-msg-meta">'+who+' · '+t+'</div>'
      +'</div>';
  }).join('');

  requestAnimationFrame(function(){
    area.scrollTop = area.scrollHeight;
  });
}

/* ════════════════════
   ENVIAR MENSAJE
   ════════════════════ */
async function sendMsg(){
  var sb = getSB(); if(!sb || !_activeEmail) return;
  var inp = document.getElementById('pdc-inp');
  var btn = document.getElementById('pdc-send-btn');
  if(!inp) return;
  var text = inp.value.trim();
  if(!text) return;
  inp.value = ''; if(btn) btn.disabled = true;

  var payload = _isAdmin
    ? { sender_email:_activeEmail, sender_nombre:_user.nombre,
        sender_role:'admin', message:'[To:'+_activeEmail+'] '+text, is_read:true }
    : { sender_email:_user.email, sender_nombre:_user.nombre||_user.email,
        sender_role:'user', message:text, is_read:false };

  var res = await sb.from('chat_messages').insert(payload);
  if(res.error) console.error('pdc-cc send:', res.error);
  if(btn) btn.disabled = false;
  await loadMessages(_activeEmail);
}

/* ════════════════════
   REALTIME
   ════════════════════ */
function initRealtime(){
  var sb = getSB(); if(!sb) return;
  sb.channel('pdc-cc-rt-'+Date.now())
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages'},
      async function(payload){
        var m = payload.new;
        if(_isAdmin){
          if(m.sender_role !== 'admin'){
            playAlert();
            showToast(m.sender_nombre+': '+m.message.substring(0,55)+'…', m.sender_email);
            loadConversations();
            if(_activeEmail === m.sender_email) await loadMessages(_activeEmail);
          } else if(_activeEmail && m.sender_email === _activeEmail){
            await loadMessages(_activeEmail);
          }
        } else {
          if(m.sender_role === 'admin' && m.sender_email === _user.email){
            playAlert();
            showToast('Administración PDC: '+m.message.replace(/^\[To:[^\]]+\]\s*/,'').substring(0,55)+'…', null);
            if(_activeEmail) await loadMessages(_activeEmail);
          }
        }
      }
    ).subscribe();
}

/* ════════════════════
   POLLING fallback
   ════════════════════ */
function startPolling(){
  if(_pollInt) clearInterval(_pollInt);
  _pollInt = setInterval(function(){
    if(!_isClosed) loadConversations();
  }, 5000);
}

/* ════════════════════
   INIT — esperar DOM + Supabase
   ════════════════════ */
function boot(){
  if(!initAuth()){
    /* Sin sesión: no mostrar widget */
    return;
  }

  /* Mostrar FAB */
  document.getElementById('pdc-cc-fab').style.display = 'flex';

  /* Mostrar sidebar solo para admin */
  if(_isAdmin){
    document.getElementById('pdc-cc-sb').classList.remove('hidden');
  }

  /* Eventos controles */
  document.getElementById('pdc-cc-fab').addEventListener('click', ccOpen);
  document.getElementById('pdc-btn-min').addEventListener('click', ccMinimize);
  document.getElementById('pdc-btn-cls').addEventListener('click', ccClose);
  document.getElementById('pdc-cc-toast').addEventListener('click', dismissToast);

  /* Cargar datos iniciales */
  loadConversations();
  startPolling();

  /* Intentar Realtime si Supabase disponible */
  if(getSB()) initRealtime();
  else {
    /* Esperar a que Supabase cargue (CDN async) */
    var t = setInterval(function(){
      if(getSB()){ clearInterval(t); initRealtime(); }
    }, 300);
  }
}

/* Iniciar cuando el DOM esté listo */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})(); /* fin IIFE */
