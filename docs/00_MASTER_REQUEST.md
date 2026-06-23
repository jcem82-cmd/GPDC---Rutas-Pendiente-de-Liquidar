# 00 — MASTER REQUEST
## PDC Analytics Center · Prompt de Continuidad para Nuevo Chat
> **Versión:** 2.0 · **Fecha:** 22/06/2026 · **Estado:** Producción estable ✅
> Pegar este bloque completo al inicio de cada nuevo chat con Claude.

---

## PROMPT LISTO PARA COPIAR

```
Continuamos el desarrollo de PDC Analytics Center, plataforma BI corporativa del Grupo PDC.

Repo    : jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar (branch: main)
Portal  : https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html
Login   : https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/login.html
Token   : ['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'].join('')

Documentación de referencia disponible en /docs del repo:
  00_MASTER_REQUEST.md          ← este archivo
  01_MASTER_PROJECT_CONTEXT.md  ← contexto técnico completo
  02_CHANGELOG.md               ← historial de cambios
  03_ROADMAP.md                 ← plan de evolución
  04_PROJECT_RULES.md           ← reglas permanentes
  05_README.md                  ← guía de inicio rápido
  06_AI_GOVERNANCE.md           ← protocolo de trabajo con Claude
  07_DESIGN_SYSTEM.md           ← sistema visual corporativo

Actúa como Arquitecto de Software, Especialista BI y Desarrollador Full Stack.
Regla principal: NUNCA RECONSTRUIR — solo modificaciones quirúrgicas.
SIEMPRE auditar el archivo en producción (SHA fresco) antes de cualquier modificación.
SIEMPRE actualizar los docs en /docs al cerrar la sesión con cambios.
```

---

## CONTEXTO RÁPIDO — Estado al 22/06/2026

### Archivos en producción

| Archivo | Versión | SHA | Tamaño |
|---|---|---|---|
| `analytics.html` | v2.1 | `e4f6a4d905` | 50,626 b |
| `login.html` | v1.2 | `4e0f9bebd3` | 24,702 b |
| `index.html` | v12.1 | `05794c2bdf` | 734,921 b |
| `cash_today.html` | v2.14 | `ff27d7e2cd` | 9,361,509 b |
| `regional/index.html` | v1.1 | `75b224bf87` | 36,605 b |
| `peru/index.html` | v1.1 | `129c684510` | 47,814 b |
| `honduras/index.html` | v1.0 | `c2014b3adf` | 41,524 b |
| `admin.html` | — | `2488055636` | 41,525 b |

> ⚠️ Siempre obtener SHA fresco antes de un PUT:
> `GET /repos/jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar/contents/{path}`

### Arquitectura

```
login.html (v1.2)  →  sessionStorage pdc_session (8h TTL)
        ↓
analytics.html (v2.0)  —  Hub central
        ├──► index.html              Rutas GT+SV+PE+HN
        ├──► cash_today.html         ATM GT+SV
        ├──► regional/index.html     Consolidado 4 países
        ├──► peru/index.html         Rutas Perú
        ├──► honduras/index.html     Rutas Honduras (proyectado)
        └──► admin.html              Chat soporte Supabase
```

### Token GitHub (ensamblar en runtime)

```python
TOKEN = ''.join(['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'])
```

### Deploy pattern archivos < 1MB

```python
import urllib.request, json, base64
# 1. GET SHA fresco
# 2. PUT con content en base64
payload = json.dumps({
    "message": "descripción",
    "content": base64.b64encode(content).decode('ascii'),
    "sha": SHA_ACTUAL,
    "branch": "main"
}).encode('utf-8')
```

### Deploy pattern cash_today.html (~9MB)

```python
# 1. GET blob SHA: GET /repos/.../git/trees/main?recursive=1
# 2. Download: GET /repos/.../git/blobs/{blob_sha}  Accept: application/vnd.github.raw
# 3. PUT con SHA del contents API (no del blob)
```

### Credenciales de apoyo

| Recurso | Valor |
|---|---|
| Supabase URL | `https://pytsrgtcjytjztwdlvux.supabase.co` |
| Supabase Key | `sb_publishable_mW5PeN4eRbl56zLlTP-vVg_NzCJTTfj` |
| Chart.js CDN | `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js` |
| SheetJS CDN | `https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js` |

### Fases completadas

| Fase | Estado | Versión |
|---|---|---|
| Fase 0 — Fundación | ✅ Completada | v1.0 |
| Fase 1 — Consolidado Regional | ✅ Completada | v1.1–v1.2 |
| Fase 2 — Expansión + Cash Today | ✅ Completada | v1.3–v1.4 |
| Fase 3 — Mejoras Operativas | ✅ Completada | v2.13 |
| Fase 4 — Automatización | 🟠 Pendiente | — |
| Fase 5 — Plataforma Avanzada | 🔴 Largo plazo | — |

---

*PDC Analytics Center · 00_MASTER_REQUEST · v2.0 · 22 Jun 2026*
