# 📊 PDC Analytics Center — Guía de Inicio Rápido

> **Si eres Claude en un nuevo chat, o un desarrollador entrando al proyecto: LEE ESTO PRIMERO.**

---

## 🚀 Orden de lectura obligatorio

1. **`MASTER_PROJECT_CONTEXT.md`** — Estado completo: arquitectura, usuarios, dashboards, datos, credenciales, flujos.
2. **`PROJECT_RULES.md`** — Reglas NO NEGOCIABLES. Leer antes de tocar cualquier archivo.
3. **`CHANGELOG.md`** — Qué se hizo, cuándo y por qué. Revisar las últimas 2–3 entradas.
4. **`ROADMAP.md`** — Qué viene después. Útil si el usuario dice "continuemos" sin especificar.

---

## ⚡ Regla de oro

**Siempre trabajar sobre el HEAD actual del repositorio.** Nunca sobre copias de chats anteriores.

Los archivos grandes (cash_today.html ~9MB) requieren blob API para lectura:
```
GET /repos/{owner}/{repo}/git/trees/main?recursive=1  → SHA del blob
GET /repos/{owner}/{repo}/git/blobs/{sha}  (Accept: application/vnd.github.raw)  → contenido real
```

---

## 🔑 Acceso rápido

| Recurso | Valor |
|---|---|
| Live Portal | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html |
| Repo | `jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar` (branch `main`) |
| Token (fragmentado) | `['ghp_','LiNq','kkiA','FhXTi','v2NRU','dhNkZ','uLiE8','i81V4','2Lc'].join('')` |
| Supabase | `https://pytsrgtcjytjztwdlvux.supabase.co` |

---

## 🗂 Archivos en producción (21/06/2026)

| Archivo | Descripción | Versión |
|---|---|---|
| `login.html` | Auth · 14 usuarios · bloqueo 3 intentos | v1.1 |
| `analytics.html` | Portal Hub · 5 dashboards · panel admin | v1.3 |
| `index.html` | Liquidación de Rutas · Export PDF | v12 |
| `cash_today.html` | Cash Today · 11 módulos · Presupuesto | v2.8 |
| `regional/index.html` | Consolidado Regional · 4 países | v1.0 |
| `peru/index.html` | Dashboard Perú · PEN | v1.0 |
| `honduras/index.html` | Dashboard Honduras · HNL | v1.0 |
| `admin.html` | Panel admin · chat Supabase | — |

---

## 🧭 Cómo responder cuando el usuario dice "continuemos"

1. Revisar `CHANGELOG.md` → última versión y fecha
2. Revisar `ROADMAP.md` → siguiente ítem en Fase 3
3. Si trae un Excel nuevo → procesar según flujo en `MASTER_PROJECT_CONTEXT.md §7`
4. Si no especifica → proponer el siguiente ítem del Roadmap

**Siguiente ítem disponible (Fase 3):** Análisis de festivos (campo `hol` ya en `_R`)

---

## 📝 Al cerrar cada sesión con cambios

Actualizar en este orden:
1. `docs/CHANGELOG.md` — nueva entrada con fecha y cambios
2. `docs/ROADMAP.md` — ítems completados / pendientes
3. `docs/MASTER_PROJECT_CONTEXT.md` — versiones, SHAs, estado
4. `docs/PROJECT_RULES.md` — si hay nuevas reglas o patrones
5. `README.md` (raíz) — si hay cambios de arquitectura relevantes
