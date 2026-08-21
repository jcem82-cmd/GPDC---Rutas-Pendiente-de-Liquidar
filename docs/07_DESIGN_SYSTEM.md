# 07 — DESIGN SYSTEM
## PDC Analytics Center · Sistema Visual Corporativo Unificado
> **Versión:** 1.1 · **Fecha:** 21/08/2026
> Aplica a todos los dashboards de la plataforma. Fuente única de verdad visual.
> Antes de modificar colores, tipografía o componentes, consultar este documento.
>
> **Cambio v1.1:** Rebranding con identidad oficial Grupo pdc (manual de marca corporativo). Logo real desplegado en 9/10 archivos activos. Paleta `--navy`/`--sky` alineada a Pantone oficial. Tipografía de marca (Poppins) aplicada a títulos/logo — cuerpo y tablas se mantienen en Inter por legibilidad numérica ya validada en producción.

---

## 1. IDENTIDAD CORPORATIVA

### Logo Grupo pdc (oficial — actualizado 21/08/2026)
| Atributo | Valor |
|---|---|
| Formato | Logotipo real "Grupo pdc" con arco/sonrisa · PNG optimizado (~4 KB) embebido en base64 inline (mismo patrón que el resto del código — sin dependencias externas) |
| Variante estándar | Versión a color (texto navy + arco turquesa) — se usa SIEMPRE dentro de un contenedor/pill blanco, incluso en headers de fondo navy |
| Variante alterna | Versión monocromática blanca — reservada para uso futuro directo sobre fondo oscuro sin pill (no usada actualmente; ningún header actual carece de fondo blanco de soporte) |
| Contenedor | Fondo blanco · `border-radius: 6–8px` · padding variable por dashboard (`4px 12px` a `5px 14px`) · altura de imagen 24–36px según contexto |
| Posición | Header superior izquierdo · alineado verticalmente al centro |
| Cobertura | Desplegado en: `index.html`, `analytics.html`, `login.html`, `historico.html` (header vivo + reporte PDF), `regional/`, `peru/`, `elsalvador/index.html`, `cash_today.html`, `cartas_salida.html` |
| Excluido deliberadamente | `honduras/index.html` (módulo huérfano, sin datos reales, sin tarjeta en portal) · `admin.html` (widget de chat flotante, no tiene header de marca) |
| Fuente | Manual de marca corporativo Grupo PDC (activo de marca, propiedad del cliente) |
| Regla | No modificar sin autorización del propietario del proyecto |

### Títulos de sistema
| Dashboard | Título principal | Subtítulo |
|---|---|---|
| Hub Analytics | `PDC Analytics Center` | `Plataforma Corporativa de Business Intelligence` |
| Rutas | `LIQUIDACIÓN DE RUTAS` | `Dashboard Ejecutivo · Grupo PDC` |
| Cash Today | `CASH TODAY` | `Dashboard Ejecutivo · Liquidación de Rutas` |
| Regional | `CONSOLIDADO REGIONAL` | `Dashboard Ejecutivo · 4 Países` |
| Perú | `RUTAS PERÚ` | `Dashboard Ejecutivo · Liquidación de Rutas` |
| Honduras | `RUTAS HONDURAS` | `Dashboard Ejecutivo · Liquidación de Rutas` |

---

## 2. PALETA DE COLORES — VARIABLES CSS CANÓNICAS

```css
:root {
  /* ── Marca PDC (oficial — manual de marca corporativo, 21/08/2026) ── */
  --navy:       #00216f;   /* Azul corporativo primario · Pantone 2747 C */
  --navy2:      #003090;   /* Azul medio — hover, acentos (derivado, sin cambio) */
  --navy-dark:  #001440;   /* Azul oscuro — hero gradients (derivado, sin cambio) */
  --sky:        #7dbfe6;   /* Celeste — fondos, chips, hover · Pantone 637 C */
  --sky2:       #e8f6ff;   /* Azul muy claro — hover states (derivado, sin cambio) */
  /* Hex anteriores (pre-21/08/2026, deprecados): --navy:#002060 · --sky:#CFEEFC */

  /* ── Neutros ── */
  --white:      #FFFFFF;
  --bg:         #F0F4F8;   /* Fondo general de página */
  --card:       #FFFFFF;   /* Fondo de tarjetas */
  --text:       #0F1729;   /* Texto principal */
  --text2:      #5A6480;   /* Texto secundario, labels */
  --border:     #E2E8F0;   /* Bordes de contenedores */
  --silver:     #DBDBDB;   /* Bordes suaves, separadores */

  /* ── Semáforo KPI ── */
  --green:      #DCF0C6;   /* Fondo OK */
  --green2:     #2D9E2D;   /* Texto/ícono OK */
  --yellow:     #FFF4CC;   /* Fondo alerta ≥85% */
  --yellow2:    #C48A00;   /* Texto/ícono alerta */
  --red:        #FFBDBD;   /* Fondo crítico ≥100% */
  --red2:       #CC0000;   /* Texto/ícono crítico */

  /* ── Layout ── */
  --radius:     12px;
  --shadow:     0 2px 16px rgba(0, 32, 96, 0.07);
  --shadow-md:  0 6px 28px rgba(0, 32, 96, 0.13);
  --shadow-lg:  0 12px 48px rgba(0, 32, 96, 0.16);
}
```

---

## 3. PALETAS POR PAÍS

Usar consistentemente en Chart.js, SVG y elementos visuales por país.

| País | Color primario | Color secundario | Uso |
|---|---|---|---|
| Guatemala (GTQ) | `#002060` | `#00B8D9` | Línea sólida / punteada |
| El Salvador (USD) | `#E6501E` | `#FFAB00` | Línea sólida / punteada |
| Perú (PEN) | `#8B1A1A` | `#E8A020` | Línea sólida / punteada |
| Honduras (HNL) | `#003F8A` | `#009E60` | Línea sólida / punteada |
| Regional / Consolidado | `#5B2D8E` | `#A78BFA` | Multi-país / totales |

### Accent bars en cards del Hub
```css
.accent-rutas     { background: linear-gradient(90deg, #002060, #00B8D9); }
.accent-cashtoday { background: linear-gradient(90deg, #E6501E, #FFAB00); }
.accent-regional  { background: linear-gradient(90deg, #002060, #5B2D8E, #E6501E); }
.accent-peru      { background: linear-gradient(90deg, #8B1A1A, #E8A020); }
.accent-honduras  { background: linear-gradient(90deg, #003F8A, #009E60); }
```

---

## 4. TIPOGRAFÍA

### Fuente canónica
**Marca oficial (manual corporativo):** Museo Sans Rounded — tipografía comercial de pago (Adobe Fonts/Monotype), no disponible en Google Fonts.

**Decisión técnica (21/08/2026):** se aplica **Poppins** (Google Fonts, gratuita) como sustituto de marca — geometría redondeada visualmente cercana a Museo Sans Rounded, pesos 600/700/800 disponibles. Uso **exclusivo en títulos y elementos de marca** (H1 de módulo, `.hero-title`, `.header-title`, `.hdr-title`, `.hdr-name`, `.left-headline`). **Inter se mantiene como fuente de cuerpo y tablas** — decisión deliberada para no arriesgar la legibilidad numérica ya validada en producción (REGLA #16/#19 de precisión de datos).

```html
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap&font-display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap&font-display=swap" rel="stylesheet"/>
```

```css
/* Aplicar SOLO a selectores de título/marca — nunca a body, tablas o KPIs */
.hero-title, .header-title, .hdr-title, .hdr-name, .left-headline {
  font-family: 'Poppins', system-ui, sans-serif;
}
```

```css
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

### Escala tipográfica
| Elemento | Tamaño | Peso | Color |
|---|---|---|---|
| Título H1 / módulo | `1.4–1.75rem` | `800` | `var(--navy)` |
| Título H2 / sección | `1.0–1.1rem` | `700` | `var(--navy)` |
| Label / H3 | `0.9rem` | `600` | `var(--text)` |
| Cuerpo / párrafo | `0.875rem` | `400` | `var(--text)` |
| Secundario / caption | `0.72–0.8rem` | `400–500` | `var(--text2)` |
| KPI valor grande | `1.5–2.2rem` | `700–800` | `var(--navy)` |
| KPI label | `0.67–0.75rem` | `500` | `var(--text2)` |
| Chip / badge | `0.68–0.73rem` | `600` | según contexto |

---

## 5. COMPONENTES — PATRONES CSS

### Header sticky
```css
.header {
  background: var(--navy);
  position: sticky; top: 0; z-index: 200;
  box-shadow: 0 2px 16px rgba(0,0,0,.25);
}
.header-inner {
  max-width: 1320px; margin: 0 auto;
  padding: 0 32px; height: 60px;
  display: flex; align-items: center; gap: 16px;
}
```

### Tarjeta / Card
```css
.card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  padding: 20px 24px;
}
```

### KPI Card con semáforo
```css
.kpi         { background: var(--card); border-radius: 10px; border: 1px solid var(--border); padding: 14px 18px; }
.kpi.g       { background: var(--green);  border-left: 4px solid var(--green2); }
.kpi.y       { background: var(--yellow); border-left: 4px solid var(--yellow2); }
.kpi.r       { background: var(--red);    border-left: 4px solid var(--red2); }
.kpi-val     { font-size: 1.4rem; font-weight: 700; color: var(--navy); }
.kpi-lbl     { font-size: 0.72rem; color: var(--text2); margin-top: 4px; }
```

### Tabla ejecutiva
```css
table        { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
th           { background: var(--navy); color: var(--white); padding: 8px 12px; text-align: left; font-weight: 600; }
td           { padding: 7px 12px; border-bottom: 1px solid var(--border); }
tr:hover td  { background: var(--sky); }

/* Fila consolidado / total — NUNCA texto blanco */
tr.consolidado td { background: #DCE8FE; color: var(--navy); font-weight: 600; }
```

### Botón primario
```css
.btn-primary {
  background: var(--navy); color: var(--white);
  border: none; border-radius: 8px; padding: 9px 20px;
  font-size: 0.82rem; font-weight: 700; font-family: inherit;
  cursor: pointer; transition: background .15s, box-shadow .15s;
}
.btn-primary:hover,
.btn-primary:focus-visible { background: var(--navy2); box-shadow: 0 4px 14px rgba(0,32,96,.25); }
```

### Badge de estado
```css
.badge          { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: .68rem; font-weight: 600; }
.badge-active   { background: var(--green);  color: var(--green2); }
.badge-warn     { background: var(--yellow); color: var(--yellow2); }
.badge-critical { background: var(--red);    color: var(--red2); }
.badge-navy     { background: var(--sky);    color: var(--navy); }
```

### Nav tabs (módulos dentro de dashboard)
```css
.ntab       { padding: 7px 14px; border-radius: 7px; cursor: pointer; font-size: .82rem; font-weight: 500; color: var(--text2); transition: background .15s; }
.ntab:hover { background: var(--sky); color: var(--navy); }
.ntab.on    { background: var(--navy); color: var(--white); font-weight: 600; }
```

### Country chip
```css
.country-chip {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--sky); color: var(--navy);
  border-radius: 20px; padding: 2px 9px;
  font-size: .68rem; font-weight: 600;
}
```

---

## 6. ACCESIBILIDAD — REQUISITOS MÍNIMOS (WCAG 2.1 AA)

```css
/* Focus visible — obligatorio en todos los dashboards */
:focus-visible { outline: 2px solid var(--sky); outline-offset: 2px; }
button:focus:not(:focus-visible),
a:focus:not(:focus-visible) { outline: none; }

/* Skip link */
.skip-link { position: absolute; left: -9999px; top: 8px; z-index: 9999; }
.skip-link:focus { left: 16px; }
```

**Reglas HTML obligatorias:**
- `<header role="banner">` · `<main role="main">` · `<nav role="navigation">` · `<footer role="contentinfo">`
- `type="button"` en todos los `<button>` que no sean submit
- `aria-label` descriptivo en botones sin texto visible
- `aria-hidden="true"` en elementos decorativos (íconos, accent bars)

---

## 7. RESPONSIVE — BREAKPOINTS

```css
@media (max-width: 1024px) { /* Ocultar nav secundaria, KPIs hero */ }
@media (max-width: 768px)  { /* Grid 1 columna, padding reducido, session-info oculto */ }
@media (max-width: 480px)  { /* Admin grid 1 col, chips reducidos */ }
@media print               { /* Ocultar nav/footer/admin, sin shadows, break-inside:avoid */ }
```

**Mobile:** `min-height: 100dvh` (dynamic viewport height para iOS Safari).

---

## 8. ANIMACIONES

```css
/* Entrada de cards — solo una vez al cargar */
@keyframes cardIn {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dash-card { animation: cardIn .4s ease both; }

/* will-change solo en interacción — evitar layer explosion */
.dash-card:hover { will-change: transform; }

/* Dot pulsante para estados live */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: .6; transform: scale(.85); }
}
```

---

## 9. REGLAS DE ORO

1. **Fila CONSOLIDADO:** siempre `background: #DCE8FE` + `color: var(--navy)` — **nunca texto blanco**
2. **Módulo Tráfico (Cash Today):** SVG puro — no migrar a Chart.js (Chart.js falla en `display:none`)
3. **Precisión decimal:** GTQ = `fmt(v, 0)` · USD = `fmt(v, 2)` · en celdas Y subtotales Y totales Y grand total
4. **TC mensual:** siempre `usd(r)` — nunca dividir directamente por `tcGTQ`
5. **No usar `localStorage`/`sessionStorage`** dentro de artefactos Claude.ai
6. **No modificar** logo, paleta `:root` ni estructura de header sin autorización (rebranding 21/08/2026 autorizado explícitamente por el propietario del proyecto)

---

## 10.5 Pendiente documentado — NO implementado (fuera de alcance del rebranding 21/08/2026)

**`cartas_salida.html` usa un sistema de color propio, distinto al resto de la plataforma:** `--navy:#0f2340`, `--blue:#2563eb`, `--red:#dc2626`, `--green:#16a34a`, etc. — no comparte `--navy`/`--sky` con el resto del ecosistema (que ahora usa `#00216f`/`#7dbfe6`). Solo se le aplicó el logo oficial en esta sesión; su paleta y tipografía quedaron intactas por disciplina de alcance (no fue autorizado tocar su sistema de color). **Recomendación:** evaluar en una sesión dedicada si conviene migrar `cartas_salida.html` al esquema `--navy`/`--sky` estándar, dado que rompe la consistencia visual "una plataforma, no dashboards individuales" documentada en la Visión del Proyecto.

---

## 10. FUNCIÓN DE FORMATO NUMÉRICO CANÓNICA

```javascript
// Usar en todos los dashboards — nunca fmt(v) sin decimales explícitos en USD
const fmt = (n, d = 0) =>
  isFinite(n)
    ? n.toLocaleString('es-GT', { minimumFractionDigits: d, maximumFractionDigits: d })
    : '—';

// Ejemplos:
fmt(1234567)      // → "1,234,567"      (GTQ, 0 decimales)
fmt(1234.56, 2)   // → "1,234.56"       (USD, 2 decimales)
fmt(NaN)          // → "—"              (fallback seguro)
```

---

*PDC Analytics Center · 07_DESIGN_SYSTEM · v1.1 · 21 Ago 2026*
