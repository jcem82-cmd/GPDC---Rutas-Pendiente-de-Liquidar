# 📊 Dashboard Liquidación de Rutas — Grupo PDC

> **Si eres un nuevo chat de Claude o un desarrollador entrando a este proyecto, LEE ESTO PRIMERO.**

## 🚀 Orden de lectura obligatorio para cualquier nuevo chat

1. **`MASTER_PROJECT_CONTEXT.md`** — Contexto completo: arquitectura, estado actual, datos, credenciales, flujos.
2. **`PROJECT_RULES.md`** — Reglas NO NEGOCIABLES de diseño y desarrollo. Léelo antes de tocar código.
3. **`CHANGELOG.md`** — Qué se hizo, cuándo y por qué. Revisa las últimas 2-3 entradas para saber el estado más reciente.
4. **`ROADMAP.md`** — Qué falta / qué viene después. Útil si el usuario pide "continuar" sin especificar qué.

## ⚡ Regla de oro

**Antes de modificar `index.html`, SIEMPRE:**
```bash
curl -s "https://raw.githubusercontent.com/jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar/main/index.html" -o index.html
```
Trabaja sobre la versión EN VIVO, nunca sobre una copia vieja de un chat anterior. Los commits son acumulativos — si no partes del HEAD actual, puedes revertir fixes ya aplicados (esto ya pasó varias veces).

## 🔑 Acceso rápido

| Recurso | Valor |
|---|---|
| Live Dashboard | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/ |
| Repo | `jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar` (branch `main`) |
| Token (fragmentado) | ver `MASTER_PROJECT_CONTEXT.md` §Credenciales |
| Supabase | `https://pytsrgtcjytjztwdlvux.supabase.co` |

## 🧭 Cómo responder cuando el usuario dice "continuemos" sin más detalle

1. Revisa `CHANGELOG.md` → última versión publicada y su fecha.
2. Si trae un Excel nuevo → procesar según el flujo en `MASTER_PROJECT_CONTEXT.md` §Flujo de actualización.
3. Si no trae nada → preguntar si hay corrección pendiente, o revisar `ROADMAP.md` §Próximos pasos para sugerir.

## 📝 Después de cada sesión con cambios

Actualiza `CHANGELOG.md` con una nueva entrada de versión (este chat debe hacerlo automáticamente al cerrar cambios importantes).
