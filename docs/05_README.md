# 05 — README
## PDC Analytics Center · Guía de Inicio Rápido

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
| Token (fragmentado) | ver `01_MASTER_PROJECT_CONTEXT.md` §Tokens — el listado aquí quedó obsoleto |
| Supabase | `https://pytsrgtcjytjztwdlvux.supabase.co` |

---

## 🗂 Archivos en producción (08/08/2026)

| Archivo | Descripción | Versión |
|---|---|---|
| `login.html` | Auth · 14 usuarios · bloqueo 3 intentos | v1.1 |
| `analytics.html` | Portal Hub · 5 dashboards · panel admin | v1.3 |
| `index.html` | Liquidación de Rutas · Tableros + Tendencias KPI (Comparador BASE/A) | v2.10 |
| `cash_today.html` | Cash Today · 12 módulos · Presupuesto + **Facturación Mensual** | v2.9 |
| `regional/index.html` | Consolidado Regional · 4 países | v1.0 |
| `peru/index.html` | Dashboard Perú · PEN | v1.0 |
| `elsalvador/index.html` | Dashboard El Salvador · USD | v1.0 |
| `cartas_salida.html` | Cartas de Salida · GT+ESV+PE | v1.2 |
| `admin.html` | Panel admin · chat Supabase | — |

---

## 🧭 Cómo responder cuando el usuario dice "continuemos"

1. Revisar `CHANGELOG.md` → última versión y fecha
2. Revisar `ROADMAP.md` → siguiente ítem disponible
3. Si trae un Excel nuevo → procesar según flujo en `MASTER_PROJECT_CONTEXT.md §7`
4. Si no especifica → proponer el siguiente ítem del Roadmap

**Siguiente ítem disponible:** ver `03_ROADMAP.md` → pendientes derivados de la sesión 07–08/08/2026 (Tableros §18, Tendencias KPI §19, Comparador §20)

---

---

## ⚠️ Al tocar `cash_today.html` — Facturación Mensual

El módulo **calcula** la facturación del proveedor; no lee ninguna pestaña de facturación del Excel. Antes de modificarlo:

1. Leer `01_MASTER_PROJECT_CONTEXT.md §16` completo — reglas de negocio, asimetría ESV/GT y composición de Tesorería.
2. Leer `04_PROJECT_RULES.md` REGLAS 14, 15 y 16.
3. Tras cualquier cambio, **reejecutar las cifras de control de julio 2026** (`§16.7`) antes de desplegar. TOTAL ESV a pagar debe dar exactamente **$347.6939** y GT neto **Q130.8717**.

Dos cosas que parecen bugs y **no lo son**:

- El cargo de transporte de PDC Comercial aparece en Recolección **y** en Tesorería. Son servicios distintos (transporte vs. conteo), confirmado por Charly. No "corregir".
- Las visitas adicionales de las Monederas ESV están anuladas. Es la condición comercial vigente, con interruptor en la barra del módulo.

---

## 📝 Al cerrar cada sesión con cambios

Actualizar en este orden:
1. `docs/CHANGELOG.md` — nueva entrada con fecha y cambios
2. `docs/ROADMAP.md` — ítems completados / pendientes
3. `docs/MASTER_PROJECT_CONTEXT.md` — versiones, SHAs, estado
4. `docs/PROJECT_RULES.md` — si hay nuevas reglas o patrones
5. `README.md` (raíz) — si hay cambios de arquitectura relevantes

---

## 📁 Estructura de documentación

```
docs/
├── 00_MASTER_REQUEST.md          ← Prompt listo para nuevo chat
├── 01_MASTER_PROJECT_CONTEXT.md  ← Contexto técnico completo
├── 02_CHANGELOG.md               ← Historial de versiones
├── 03_ROADMAP.md                 ← Plan de evolución
├── 04_PROJECT_RULES.md           ← Reglas permanentes
├── 05_README.md                  ← Este archivo
├── 06_AI_GOVERNANCE.md           ← Protocolo de trabajo con Claude
└── 07_DESIGN_SYSTEM.md           ← Sistema visual corporativo
```

## 🔗 URLs de producción

| Recurso | URL |
|---|---|
| Portal Hub | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html |
| Login | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/login.html |
| Rutas | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/index.html |
| Cash Today | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/cash_today.html |
| Regional | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/regional/index.html |
| Perú | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/peru/index.html |
| Honduras | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/honduras/index.html |

---

*PDC Analytics Center · 05_README · v2.1 · 08 Ago 2026*
