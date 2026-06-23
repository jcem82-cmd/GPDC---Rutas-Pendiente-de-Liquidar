# PDC Analytics Center — Grupo PDC

**Plataforma corporativa de Business Intelligence** para el Departamento Financiero.

[![Estado](https://img.shields.io/badge/Estado-Producción%20✅-2D9E2D)](https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html)
[![Versión](https://img.shields.io/badge/Versión-v2.13-002060)](https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html)

---

## 🚀 Acceso rápido

| Recurso | URL |
|---|---|
| **Portal Hub** | [analytics.html](https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/analytics.html) |
| **Login** | [login.html](https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/login.html) |
| **Rutas** | [index.html](https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/index.html) |
| **Cash Today** | [cash_today.html](https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/cash_today.html) |
| **Regional** | [regional/index.html](https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/regional/index.html) |
| **Perú** | [peru/index.html](https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/peru/index.html) |
| **Honduras** | [honduras/index.html](https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/honduras/index.html) |

---

## 📁 Documentación (`/docs`)

| Archivo | Descripción |
|---|---|
| [00_MASTER_REQUEST.md](docs/00_MASTER_REQUEST.md) | Prompt listo para nuevo chat con Claude |
| [01_MASTER_PROJECT_CONTEXT.md](docs/01_MASTER_PROJECT_CONTEXT.md) | Contexto técnico completo del proyecto |
| [02_CHANGELOG.md](docs/02_CHANGELOG.md) | Historial de todas las versiones |
| [03_ROADMAP.md](docs/03_ROADMAP.md) | Plan de evolución y fases |
| [04_PROJECT_RULES.md](docs/04_PROJECT_RULES.md) | Reglas permanentes (no negociables) |
| [05_README.md](docs/05_README.md) | Guía de inicio rápido |
| [06_AI_GOVERNANCE.md](docs/06_AI_GOVERNANCE.md) | Protocolo de trabajo con Claude |
| [07_DESIGN_SYSTEM.md](docs/07_DESIGN_SYSTEM.md) | Sistema visual corporativo |

---

## 🏗 Arquitectura

```
login.html  →  analytics.html (Hub)
                ├── index.html          Rutas GT+SV+PE+HN
                ├── cash_today.html     ATM GT+SV
                ├── regional/           Consolidado 4 países
                ├── peru/               Rutas Perú
                ├── honduras/           Rutas Honduras
                └── admin.html          Chat soporte
```

**Stack:** HTML5 · CSS3 · JS vanilla · Chart.js 4.4.1 · SheetJS 0.20.0 · GitHub Pages

---

*Grupo PDC · Departamento Financiero · 22/06/2026*
