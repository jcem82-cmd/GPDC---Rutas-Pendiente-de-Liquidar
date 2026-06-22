# PDC ANALYTICS CENTER — MASTER CONTEXT v2.0
## Documento de continuidad para nuevo chat
**Fecha:** 22/06/2026 · **Estado:** Producción estable ✅

---

## 1. IDENTIDAD DEL PROYECTO

| Campo | Valor |
|---|---|
| **Nombre** | PDC Analytics Center |
| **Propietario** | Grupo PDC · Departamento Financiero |
| **Repositorio** | `jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar` (branch: `main`) |
| **URL producción** | `https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/` |
| **Portal** | `.../analytics.html` |
| **Login** | `.../login.html` |
| **Plataforma** | HTML5 vanilla · Chart.js 4.4.1 · SheetJS 0.20.0 · GitHub Pages |
| **Deploy** | GitHub REST API (PUT contents) · ~80s · Claude lo ejecuta directamente |

---

## 2. REGLAS PERMANENTES (NO NEGOCIABLES)

1. **NUNCA RECONSTRUIR** — solo modificaciones quirúrgicas: `assert OLD in html → html.replace(OLD, NEW, 1)`
2. **VALIDAR ANTES DE DEPLOY** — brace balance en JS modificado · assert de todos los targets
3. **DEPLOY PATTERN** — archivos <1MB: PUT directo · cash_today.html (~9MB): blob API para GET + PUT directo
4. **ARQUITECTURA MÓDULOS** — todo nuevo dashboard = carpeta propia (`pais/index.html`) · analytics.html = solo Hub
5. **LIBRERÍAS CANÓNICAS** — Chart.js `4.4.1` (jsdelivr) · SheetJS `0.20.0` (cdn.sheetjs.com) · Inter (Google Fonts)
6. **DOCUMENTAR** al finalizar: CHANGELOG.md → ROADMAP.md → MASTER_PROJECT_CONTEXT.md
7. **SEPARACIÓN Depósito/Recogida** en Cash Today — nunca mezclar `t='Depósito'` con `t='Recogida'`
8. **PRECISIÓN DECIMAL** — GTQ: `fmt(v,0)` · USD: `fmt(v,2)` · en celdas Y totales Y grand total
9. **NO usar `localStorage`/`sessionStorage` en artefactos Claude.ai** — solo en el dashboard HTML independiente

---

## 3. TOKEN GITHUB (ensamblar en runtime)

```python
TOKEN = ''.join(['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'])
```

---

## 4. ARCHIVOS EN PRODUCCIÓN — SHAs VIGENTES (22/06/2026)

| Archivo | SHA | Versión | Tamaño |
|---|---|---|---|
| `analytics.html` | `238eff0432ce0afb16feb68e13d32314bd122854` | v1.9 | 47,922 b |
| `login.html` | `4e0f9bebd3a6590e899e9dc8a7dec4b0a58a66f7` | v1.2 | 24,702 b |
| `index.html` | `804588b8474429af130f4f088b0eb308a3127dcc` | v12 | 734,696 b |
| `cash_today.html` | `5a46d290f1c805d4fafec4d0e2293a925c82b8fb` | v2.12 | 9,360,277 b |
| `regional/index.html` | `75b224bf873949ac437c61aefa78f439c57f6a9b` | v1.1 | 36,605 b |
| `peru/index.html` | `129c6845101c4d9aeb9f0e3cecd0960d56b1514b` | v1.1 | 47,814 b |
| `honduras/index.html` | `c2014b3adf9aadd526d2af768dbaad96b41505be` | v1.0 | 41,524 b |
| `admin.html` | `24880556362fbc96b1059adf78156c1157895fca` | — | 41,525 b |
| `docs/CHANGELOG.md` | `c932f3622655d7e527d379555e27953395f5ecc4` | — | — |
| `docs/ROADMAP.md` | `284274b5c2db3813ce84df0c86f26af9dda8837d` | — | — |

> ⚠️ Siempre obtener SHA fresco antes de un PUT:
> `GET /repos/jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar/contents/{path}`

---

## 5. ARQUITECTURA TÉCNICA

```
login.html (v1.2)
    │  sessionStorage pdc_session (8h TTL) + pdc_user legacy
    ▼
analytics.html (v1.9) — Hub central
    │  PDC_USERS · PDC_DASHBOARDS · pdcGetSession()
    │  pdcNavigate() · pdcBridgeToTab() · pdcDownload() · pdcToggleUser()
    ├──► index.html              (Rutas GT+SV+PE+HN · Auth Bridge v2.0)
    ├──► cash_today.html         (ATM GT+SV · Auth Bridge v2.0)
    ├──► regional/index.html     (Consolidado 4 países · Auth Bridge v2.0)
    ├──► peru/index.html         (Rutas PE · Auth Bridge v2.0)
    ├──► honduras/index.html     (Rutas HN · Auth Bridge v2.0)
    └──► admin.html              (Chat soporte · Supabase)
```

### Auth Bridge v2.0 (patrón estándar — todos los dashboards hijos)
```javascript
(function(){
  var s=null;
  try{s=JSON.parse(sessionStorage.getItem('pdc_session'));}catch(e){}
  if(s&&s.email&&s.nombre){
    sessionStorage.setItem('pdc_user',JSON.stringify({
      nombre:s.nombre, email:s.email,
      role:s.rol, pais:s.pais||'', sedes:s.acceso||[]
    }));
  } else {
    var u=null;
    try{u=JSON.parse(sessionStorage.getItem('pdc_user'));}catch(e){}
    if(!u||!u.email){window.location.replace('../analytics.html');return;}
  }
})();
```
> ⚠️ `role` ahora lleva el rol completo: `admin | supervisor | consulta` (desde v1.2 de login)

---

## 6. USUARIOS REGISTRADOS (14 usuarios · 3 roles)

| Email | Nombre | Rol | País | Dashboards |
|---|---|---|---|---|
| juancarlos.escobar@grupopdc.com | Juan Carlos Escobar | admin | regional | rutas·cashtoday·regional·peru·honduras |
| erwin.soto@grupopdc.com | Erwin Soto | supervisor | regional | rutas·cashtoday·regional·peru·honduras |
| francisco.aguilar@grupopdc.com | Francisco Aguilar | supervisor | GT | rutas·cashtoday |
| liquidaciones.cda@grupopdc.com | TEAM GT | consulta | GT | rutas·cashtoday |
| edy.lopez@grupopdc.com | Edy Lopez | consulta | GT | rutas |
| joaquin.palma@grupopdc.com | Joaquin Palma | consulta | ESV | rutas·cashtoday |
| liquidaciones.esv@grupopdc.com | TEAM ESV | consulta | ESV | rutas·cashtoday |
| vinicio.sanabria@grupopdc.com | Vinicio Sanabria | consulta | GT | rutas |
| claudio.rojas@grupopdc.com | Claudio Rojas | consulta | PE | rutas·peru |
| jose.mallqui@grupopdc.com | Jose Mallqui | consulta | PE | rutas·peru |
| transportes.peru@grupopdc.com | TEAM Peru | consulta | PE | rutas·peru |
| carlos.reyes@grupopdc.com | Carlos Reyes | consulta | HN | rutas·honduras |
| maria.funez@grupopdc.com | Maria Funez | consulta | HN | rutas·honduras |
| liquidaciones.hn@grupopdc.com | TEAM Honduras | consulta | HN | rutas·honduras |

### Matriz de permisos (vigente)
| Acción | Admin | Supervisor | Consulta |
|---|---|---|---|
| Ver dashboards autorizados | ✅ | ✅ | ✅ |
| Panel visible (Administración/Soporte) | ✅ | ✅ | ✅ |
| Chat de soporte | ✅ | ✅ | ✅ |
| Actualizar datos (Excel) | ✅ | ❌ | ❌ |
| Descargar snapshots | ✅ | ❌ | ❌ |
| Panel Administrativo (admin.html) | ✅ | ❌ | ❌ |
| Tabla Gestión de Usuarios | ✅ | ❌ | ❌ |
| Toggle activo/inactivo usuarios | ✅ | ❌ | ❌ |

---

## 7. ESTADO DE CADA DASHBOARD

### 7.1 analytics.html v1.9 — Hub Central
- PDC_DASHBOARDS: 5 dashboards registrados (rutas, cashtoday, regional, peru, honduras)
- Panel por rol: admin (8 acciones) · supervisor (chat) · consulta (chat)
- Tabla gestión usuarios: nombre · correo · rol · país · dashboards · último acceso · toggle activo/inactivo
- `pdcToggleUser()`: persiste en `localStorage['pdc_user_states']` · desactiva sesión si es el usuario activo
- Último acceso en hero: chip con fecha/hora desde `localStorage['pdc_access_log']`
- Hero KPIs globales para usuarios `pais=regional`

### 7.2 login.html v1.2
- 14 usuarios · bloqueo 3 intentos · lockout 30s · recordar email
- Panel sesión activa: si ya hay `pdc_session` válida → muestra quién está logueado (no redirige silenciosamente)
- Bienvenida visual: botón verde + nombre al autenticar (900ms antes del redirect)
- `pdc_user` legacy: lleva `role` completo (admin/supervisor/consulta) + pais + sedes
- `pdc_access_log` en localStorage: timestamp de cada login por email
- Bloqueo de usuarios inactivos: `pdc_user_states[email] === false` → error sin consumir intentos

### 7.3 index.html v12 — Rutas Pendientes (GT+SV+PE+HN)
- RAW: 680 rutas pendientes · 4 países · monedas GTQ/USD/PEN/HNL
- Perú: 74 rutas reales (PEN) · datos verificados contra RAW
- Auth Bridge v2.0 · Export PDF ejecutivo (admin, tab Resumen)
- KPI_HIST + EFECT: histórico 54 meses · FX_DEF para conversión

### 7.4 cash_today.html v2.12 — ATM GT+SV
- 35,089 transacciones Jun 2025 → Jun 2026 · 4 sedes · 9 cajeros
- 12 módulos: Resumen · GT · SV · Límites&KPIs · Tráfico · Comparador · Detalle · Volumetría · Costo Servicio · Presupuesto · Config + Análisis Festivos (en Tráfico)
- **Presupuesto:** calculado dinámicamente desde `_M` (Valor Contratado) · AMAT consolidado Q16,000,000 + Monedera Q75,000 · `buildPresupuestoFromM()` en `autoFilter()`
- **Validación al cargar Excel:** tabla semáforo (✅/⚠️/❌) por hoja · compara raw vs parseado en registros, importe y recogidas
- **Cajeros nuevos:** warning amarillo en Config con lista de cajeros sin metas en `_M`
- **Export PDF:** botón en header · admin-only · tab Resumen · `exportarPDF_CT()`
- **TC:** `_TC_MENSUAL` cubre Ene 2024 → Jun 2026 (25 meses) · hoja `TC` del Excel actualiza en runtime
- `validTabs`: 11 módulos incluyendo `presupuesto`

### 7.5 regional/index.html v1.1 — Consolidado 4 Países
- 4 tabs: Resumen · Rutas · Cash Today · Por País
- Datos: GT (482 pend · 22 venc) · SV (124 pend · 5 venc) · PE (74 pend · 12 venc) · HN (proyectado)
- Honduras marcado como "Proyectado" en todos los puntos (badge · KPI · tabla · cards)
- Cash Today: datos reales Ene-Jun 2026 GT+SV
- Auth Bridge v2.0 · fechas actualizadas 22 Jun 2026

### 7.6 peru/index.html v1.1 — Rutas Perú
- **74 rutas REALES** desde RAW de index.html (campo `Pais='Perú'`)
- KPIs reales: 74 pendientes · 12 vencidas · 83.8% efectividad · S/1,492,234 · S/240,339 vencido
- RUTAS_DETALLE: 74 rutas reales (Nro. Despacho, Transportista, Zona, Días, Monto)
- Zonas reales: LIMA:41 · LA LIBERTAD:6 · CAJAMARCA:4 · LAMBAYEQUE:4 · AREQUIPA:3 · Otras:16
- Transportistas reales: COMPAÑIA DISTRIBUIDORA, TRANSPORTES ITATI CARGO EIRL, FRICH GROUP, etc.
- Dataset D: May-Jun 2026 reales · meses anteriores referenciales (sin data histórica PE aún)

### 7.7 honduras/index.html v1.0 — Rutas Honduras
- Datos PROYECTADOS (operación en plan de expansión · no tiene rutas reales aún)
- Estructura: 4 tabs · HNL · 22 rutas demo · paleta hn1/hn2
- Auth Bridge v2.0

---

## 8. CREDENCIALES Y RECURSOS

| Recurso | Valor |
|---|---|
| GitHub Token (fragmentado) | `['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'].join('')` |
| Supabase URL | `https://pytsrgtcjytjztwdlvux.supabase.co` |
| Supabase Key (publishable) | `sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj` |
| Chart.js CDN | `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js` |
| SheetJS CDN | `https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js` |

### Patrón de deploy (< 1MB)
```python
import urllib.request, json, base64
content = open('archivo.html', 'rb').read()
payload = json.dumps({
    "message": "descripción del cambio",
    "content": base64.b64encode(content).decode('ascii'),
    "sha": "SHA_ACTUAL_DEL_ARCHIVO",
    "branch": "main"
}).encode('utf-8')
req = urllib.request.Request(
    'https://api.github.com/repos/jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar/contents/archivo.html',
    data=payload,
    headers={'Authorization': f'token {TOKEN}', 'Content-Type': 'application/json',
             'Accept': 'application/vnd.github.v3+json'},
    method='PUT'
)
```

### Patrón de deploy (> 1MB — cash_today.html ~9MB)
```python
# 1. GET blob SHA via tree API
GET /repos/.../git/trees/main?recursive=1  → buscar item['sha'] para el path

# 2. Download via blob API
GET /repos/.../git/blobs/{blob_sha}  Accept: application/vnd.github.raw

# 3. PUT normal con el SHA del contents API (no el blob SHA)
GET /repos/.../contents/cash_today.html  → d['sha']  → usar en PUT
```

---

## 9. DISEÑO CORPORATIVO

```css
:root {
  --navy:#002060;  --navy2:#003090;  --sky:#CFEEFC;   --white:#fff;
  --bg:#F0F4F8;    --card:#fff;      --text:#0F1729;  --text2:#5A6480;
  --border:#E2E8F0; --radius:12px;
  --green:#DCF0C6; --green2:#2D9E2D;
  --yellow:#FFF4CC; --yellow2:#C48A00;
  --red:#FFBDBD;   --red2:#CC0000;
  --shadow:0 2px 16px rgba(0,32,96,.08);
}
```

| País | Color 1 | Color 2 |
|---|---|---|
| Guatemala | `#002060` | `#00B8D9` |
| El Salvador | `#E6501E` | `#FFAB00` |
| Perú | `#8B1A1A` | `#E8A020` |
| Honduras | `#003F8A` | `#009E60` |
| Regional | `#5B2D8E` | `#A78BFA` |

- Logo PDC: Base64 embebido · height:52px · fondo blanco redondeado
- Fila CONSOLIDADO: `background:#DCE8FE` + `color:var(--navy)` — NUNCA texto blanco
- Tráfico Cash Today: SVG puro (no Chart.js) — no migrar

---

## 10. CASHTODAY — REGLAS DE NEGOCIO CRÍTICAS

- `fData = RECS.filter(r => r.t==='Depósito' && dateFn(r) && dimFn(r))` — siempre
- `usd(r)`: si GTQ → divide por `_TC_MENSUAL[r.ym]` o fallback `tcGTQ=7.61815`
- AMAT consolidado: `PDC AMATITLÁN I + PDC AMATITLÁN II SDM500` → cupo **Q16,000,000**
- Presupuesto mensual por sede desde `buildPresupuestoFromM()`:
  - CDA: Q16,000,000 (AMAT I+II) + Q75,000 (Monedera) = **Q16,075,000**
  - Xela: Q3,000,000 + Q35,000 = **Q3,035,000**
  - Santa Tecla: $1,400,000 + $28,000 = **$1,428,000**
  - San Miguel: $400,000 + $8,000 = **$408,000**
- Visitas: Billetes = días únicos de Recogidas · Monedera = count eventos
- Visitas AMAT contratadas: **12/mes** (una visita recoge ambos cajeros)

---

## 11. ROADMAP — ESTADO AL 22/06/2026

### ✅ COMPLETADO EN ESTA SESIÓN

**Fase 3 — Mejoras Operativas (todo completado)**
- ✅ Análisis de festivos (ya estaba implementado)
- ✅ Alertas semáforo en Resumen (ya estaba implementado)
- ✅ Export PDF Cash Today (v2.9)
- ✅ TC histórico 2024 — `_TC_MENSUAL` 25 meses Ene2024→Jun2026 (v2.10)

**Fase 4 — Pilar 1: Calidad de datos Cash Today (completado)**
- ✅ Presupuesto desde Valor Contratado `_M` · `buildPresupuestoFromM()` (v2.11)
- ✅ Validación de totales al cargar Excel · tabla semáforo (v2.12)
- ✅ Detección cajeros nuevos · warning amarillo en Config (v2.11)

**Fase 4 — Pilar 2: Madurez de plataforma (parcial)**
- ✅ Tabla Gestión de Usuarios en analytics.html (v1.8)
- ✅ Regional HN marcado como Proyectado (v1.1)
- ✅ Perú v1.1: 74 rutas reales desde RAW (v1.1)
- ⏳ Honduras v1.1: pendiente data real (operación proyectada)
- ⏳ Consolidado Regional v1.2: conectar datos reales en tiempo real

**Fase Usuarios y Permisos (completado)**
- ✅ U1 Bienvenida visual al login
- ✅ U2 Panel sesión activa en login
- ✅ U3 Registro y display último acceso
- ✅ U4 Toggle activo/inactivo · bloqueo en login + portal
- ✅ U5 pdc_user legacy con rol completo

**Correcciones puntuales**
- ✅ Integración Cash Today en PDC Analytics Center (analytics.html v1.5)
- ✅ Chat de soporte para rol consulta (analytics.html v1.7)
- ✅ Cupo AMAT consolidado 18MM → 16MM (cash_today.html)
- ✅ fix `validTabs` presupuesto (cash_today.html v2.9)

### 🔵 PENDIENTE — PRÓXIMO SPRINT

**Fase 4 — Pilar 2 (restante)**
- [ ] Consolidado Regional v1.2 — conectar datos dinámicos con index.html
- [ ] Honduras v1.1 — cuando haya datos reales de rutas

**Fase 4 — Pilar 3 (nuevo)**
- [ ] Script Python standalone — actualizar HTML sin Claude
- [ ] Alertas vía Teams — rutas vencidas por umbral
- [ ] Módulo Presupuesto actualizable desde hoja Excel fuente

**Fase 5 — Plataforma Avanzada (largo plazo)**
- [ ] Admin Dashboard — métricas de uso
- [ ] Modo oscuro — toggle persistido
- [ ] PWA — installable en móvil
- [ ] IA predictiva — flujo de efectivo

---

## 12. SUPABASE — CHAT DE SOPORTE

| Campo | Valor |
|---|---|
| Proyecto | `pytsrgtcjytjztwdlvux.supabase.co` |
| Tabla | `chat_messages` |
| Campos | `id(uuid)` · `sender_email` · `sender_nombre` · `sender_role` · `message` · `is_read` · `created_at` |
| Polling | 3s background · 1.5s chat abierto |
| Nota | `id` es UUID — usar `created_at` para detectar nuevos mensajes |

---

## 13. PROMPT PARA NUEVO CHAT

```
Continuamos el desarrollo de PDC Analytics Center, plataforma BI corporativa del Grupo PDC.

Repo: jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar (branch: main)
Portal: https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html
Token: ['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'].join('')

Adjunto el documento PDC_MASTER_DOC.md con el estado completo del proyecto al 22/06/2026.

Actúa como Arquitecto de Software, Especialista BI y Desarrollador Full Stack.
Regla principal: NUNCA RECONSTRUIR — solo modificaciones quirúrgicas.
Siempre auditar el archivo en producción antes de cualquier modificación.
```

---

*PDC Analytics Center · Master Context v2.0 · 22 Jun 2026 · Generado al cierre de sesión*
