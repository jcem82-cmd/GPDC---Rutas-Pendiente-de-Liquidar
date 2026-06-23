# 06 — AI GOVERNANCE
## PDC Analytics Center · Protocolo de Trabajo con Claude
> **Versión:** 1.0 · **Fecha:** 22/06/2026
> Aplica en todos los chats sin excepción. Define cómo debe comportarse Claude
> al trabajar sobre este proyecto.

---

## 1. PRINCIPIOS FUNDAMENTALES

| Principio | Descripción |
|---|---|
| **Nunca reconstruir** | Solo modificaciones quirúrgicas. Nunca reescribir un archivo completo. |
| **Auditar antes de modificar** | Siempre descargar y leer el archivo en producción antes de tocarlo. |
| **Validar antes de deploy** | Verificar todos los targets, balance de llaves JS y checks clave. |
| **Documentar al cerrar** | Actualizar CHANGELOG + ROADMAP + MASTER al finalizar cada sesión con cambios. |
| **SHA fresco siempre** | Nunca usar un SHA del contexto anterior. Siempre GET antes del PUT. |

---

## 2. PROTOCOLO DE INICIO DE SESIÓN

Al comenzar cualquier chat nuevo Claude debe:

```
1. Leer 00_MASTER_REQUEST.md  →  contexto rápido y SHAs de referencia
2. Leer 01_MASTER_PROJECT_CONTEXT.md  →  arquitectura y estado técnico
3. Auditar archivos afectados en producción (GET SHA fresco)
4. Confirmar al usuario: "Contexto cargado. SHAs verificados. Listo."
5. Nunca asumir que el estado local = estado en producción
```

---

## 3. PROTOCOLO DE MODIFICACIÓN

### Antes de cada cambio

```python
# 1. Descargar archivo real de producción
GET /repos/{REPO}/contents/{path}  →  base64 decode  →  html

# 2. Verificar target exacto
assert OLD_TARGET in html, f"TARGET NOT FOUND: {label}"

# 3. Para cash_today.html (~9MB): usar blob API
GET /repos/{REPO}/git/trees/main?recursive=1  →  blob_sha
GET /repos/{REPO}/git/blobs/{blob_sha}  Accept: application/vnd.github.raw
```

### Durante el cambio

```python
# Modificación quirúrgica — UNA sola instancia
html = html.replace(OLD, NEW, 1)

# Nunca usar:
# - html = NEW_HTML_COMPLETO        ← reconstrucción prohibida
# - html.replace(OLD, NEW)          ← sin límite = riesgo de múltiples reemplazos
```

### Validación obligatoria post-cambio

```python
# 1. Verificar que el cambio fue aplicado
assert NEW_PATTERN in html

# 2. Balance de llaves JS (para cambios en <script>)
def count_braces(src):
    ob = cb = 0; in_str = None; i = 0
    while i < len(src):
        c = src[i]
        if in_str:
            if c == '\\': i += 2; continue
            if c == in_str: in_str = None
        else:
            if c in ('"',"'",'`'): in_str = c
            elif c == '{': ob += 1
            elif c == '}': cb += 1
        i += 1
    return ob, cb
ob, cb = count_braces(script_block)
assert ob == cb, f"Braces mismatch: {{ {ob} }} {cb}"

# 3. Checks clave del archivo (según tipo)
```

### Deploy

```python
# SHA fresco justo antes del PUT (no del inicio de sesión)
req = GET /repos/{REPO}/contents/{path}
sha = d['sha']

# PUT con base64 y commit message descriptivo
payload = {
    "message": "tipo(archivo): descripción concisa\n\n- detalle 1\n- detalle 2",
    "content": base64.b64encode(html.encode()).decode('ascii'),
    "sha": sha,
    "branch": "main"
}
```

---

## 4. CONVENCIÓN DE COMMIT MESSAGES

```
tipo(scope): descripción en imperativo

Tipos válidos:
  feat     → nueva funcionalidad
  fix      → corrección de bug
  perf     → mejora de rendimiento
  style    → cambio visual sin lógica
  docs     → solo documentación
  refactor → refactorización sin cambio de comportamiento
  chore    → mantenimiento, dependencias

Ejemplos:
  feat(cash_today): tab Festivos + renderFestivos scope (v2.13)
  fix(analytics): role=article en cards dinámicas
  perf(analytics): font-display=swap + will-change + CSP (v2.0)
  docs(changelog): cash_today v2.13 — Fase 3 completa
```

---

## 5. PROTOCOLO DE CIERRE DE SESIÓN

Al finalizar cualquier sesión con cambios, Claude debe actualizar **en este orden**:

```
1. docs/02_CHANGELOG.md        ← entrada con fecha, versión y detalle de cambios
2. docs/03_ROADMAP.md          ← marcar ítems completados / actualizar pendientes
3. docs/01_MASTER_PROJECT_CONTEXT.md  ← SHA nuevo, versión, estado actualizado
4. docs/00_MASTER_REQUEST.md   ← SHA nuevo en tabla de archivos
```

Commit para documentación:
```
docs(cierre): actualizar CHANGELOG + ROADMAP + MASTER · sesión DD/MM/YYYY
```

---

## 6. MANEJO DE ARCHIVOS GRANDES (cash_today.html ~9MB)

```python
# GitHub contents API trunca archivos > 1MB
# Siempre usar la ruta blob para descargar:

# Step 1: obtener blob SHA
GET /repos/{REPO}/git/trees/main?recursive=1
blob_sha = next(i['sha'] for i in tree['tree'] if i['path'] == 'cash_today.html')

# Step 2: descargar contenido completo
GET /repos/{REPO}/git/blobs/{blob_sha}
Headers: Accept: application/vnd.github.raw

# Step 3: para el PUT, usar el SHA del contents API (no del blob)
GET /repos/{REPO}/contents/cash_today.html  →  d['sha']  →  usar en PUT
```

---

## 7. REGLAS DE BRACE VALIDATION

El conteo simple `str.count('{')` produce falsos positivos por:
- CSS variables dentro de template strings: `background:var(--navy)`
- Objetos inline en strings HTML: `style="color:{color}"`
- Regex quantifiers: `{0,50}`

**Siempre usar el contador robusto** que ignora string literals (ver §3).

Los tags `</body>` y `</html>` del HTML externo aportan llaves adicionales.
Contar solo el bloque `<script>` puro, sin los tags de apertura/cierre.

---

## 8. REGLAS DE SEGURIDAD

- El token GitHub se ensambla en runtime — nunca hardcodeado completo en logs o respuestas
- Supabase key es publishable (diseñada para frontend) — no es un secreto crítico
- Los dashboards usan `sessionStorage` — las sesiones mueren al cerrar pestaña
- La CSP en `analytics.html` restringe recursos a dominios conocidos PDC
- `robots: noindex, nofollow` — plataforma interna, no indexable

---

## 9. LO QUE CLAUDE NUNCA DEBE HACER

| Prohibido | Por qué |
|---|---|
| Reconstruir un archivo HTML completo | Riesgo de pérdida de datos y funcionalidad |
| Usar SHA del contexto anterior en un PUT | El archivo puede haber cambiado entre sesiones |
| Ignorar el balance de llaves JS | Rompe el dashboard silenciosamente |
| Actualizar solo el código y no los docs | Genera deuda de documentación |
| Asumir que el target existe sin verificarlo | `assert OLD in html` es obligatorio |
| Mezclar `t='Depósito'` y `t='Recogida'` en Cash Today | Rompe todas las métricas |
| Usar `document.documentElement.outerHTML` para snapshots | Captura el portal, no el dashboard |
| Hacer deploy sin validación previa | Un error en producción afecta a 14 usuarios |

---

## 10. TECNOLOGÍAS Y VERSIONES CANÓNICAS

| Librería | Versión | CDN |
|---|---|---|
| Chart.js | `4.4.1` | `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js` |
| SheetJS | `0.20.0` | `https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js` |
| Inter font | — | `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap` |

**Stack inmutable:** HTML5 vanilla · CSS3 · JS ES6+ · sin frameworks · sin build tools.
GitHub Pages como plataforma de deploy — sin servidor, sin base de datos (excepto Supabase para chat).

---

*PDC Analytics Center · 06_AI_GOVERNANCE · v1.0 · 22 Jun 2026*
