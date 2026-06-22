# PDC Analytics Center — Grupo PDC

**Estado:** ✅ Producción | **Versión:** v1.4 | **Actualizado:** 21/06/2026

**Portal:** https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html

---

## Descripción

Plataforma corporativa de Business Intelligence del Grupo PDC. Centraliza dashboards ejecutivos de Liquidación de Rutas y Cash Today bajo autenticación unificada, diseño corporativo consistente y arquitectura escalable desplegada en GitHub Pages.

---

## Dashboards activos

| Dashboard | URL | Países | Módulos |
|---|---|---|---|
| 🌎 Consolidado Regional | .../regional/index.html | GT · SV · PE · HN | 4 |
| 🚚 Liquidación de Rutas | .../index.html | GT · SV · PE · HN | 7 + PDF |
| 💰 Cash Today | .../cash_today.html | GT · SV | 11 |
| 🇵🇪 Perú | .../peru/index.html | PE | 4 |
| 🇭🇳 Honduras | .../honduras/index.html | HN | 4 |

---

## Stack

- **Frontend:** HTML5 · CSS3 · JavaScript ES6+ vanilla (sin frameworks)
- **Gráficas:** Chart.js 4.4.1 (jsdelivr)
- **Excel:** SheetJS 0.20.0 (cdn.sheetjs.com)
- **Tipografía:** Inter (Google Fonts)
- **Auth:** sessionStorage · 8h TTL · 14 usuarios · 3 roles
- **Chat:** Supabase
- **Hosting:** GitHub Pages · GitHub Actions (~80s deploy)

---

## Acceso

Entrar por `login.html` con credenciales corporativas PDC.
Cada usuario ve solo los dashboards autorizados para su perfil y país.

---

## Para desarrolladores

Leer en orden antes de modificar cualquier archivo:
1. `docs/MASTER_PROJECT_CONTEXT.md`
2. `docs/PROJECT_RULES.md`
3. `docs/CHANGELOG.md`
4. `docs/ROADMAP.md`

**Regla principal:** nunca reconstruir — solo modificaciones quirúrgicas sobre el HEAD actual.

---

*Grupo PDC · Departamento Financiero · © 2026*
