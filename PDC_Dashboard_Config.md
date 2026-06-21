# PDC Analytics Center — Configuración y Estado del Sistema
**Versión:** 2.0 | **Actualizado:** Junio 2026 | **Mantenido por:** Finanzas Corporativas

---

## 🏗️ Arquitectura General

```
URL Base: https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/
Repo:     github.com/jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar (branch: main)
Stack:    HTML5 + JS Vanilla | Chart.js 4.4.1 | SheetJS 0.18.5 | Inter font
Auth:     sessionStorage (pdc_session) | TTL: 8 horas
```

### Flujo de navegación
```
login.html → analytics.html (Portal) → index.html (Rutas)
                                      → cash_today.html (Cash Today)
                                      → admin.html (solo admin)
```

---

## 📁 Archivos del Sistema

| Archivo | Descripción | Auth Guard | Filtro País |
|---------|-------------|-----------|-------------|
| `login.html` | Autenticación de usuarios | — | — |
| `analytics.html` | Portal principal con cards ejecutivas | ✅ | — |
| `index.html` | Dashboard Liquidación de Rutas | ✅ Auth Bridge v2.0 | ✅ |
| `cash_today.html` | Dashboard Cash Today ATM | ✅ Auth Bridge v2.0 | ✅ |
| `admin.html` | Panel administrador + chat Supabase | ✅ Solo admin | — |
| `js/auth.js` | Funciones de autenticación y sesión | — | — |
| `js/users.js` | Matriz de usuarios, roles y permisos | — | — |
| `hub.html` | Hub legacy (deprecado) | — | — |

---

## 🔐 Sistema de Autenticación

### Sesión (`pdc_session` en sessionStorage)
```json
{
  "email":      "usuario@grupopdc.com",
  "nombre":     "Nombre Usuario",
  "rol":        "admin | supervisor | consulta",
  "dashboards": ["rutas", "cashtoday"],
  "pais":       "regional | GT | ESV | PE",
  "sedes":      ["CDA", "XELA"] | "todas",
  "ts":         1234567890000
}
```

### Token URL (para apertura en nueva pestaña)
```
?pdc_token=base64({email, nombre, rol, pais, sedes, acceso})
```
El Auth Bridge de cada dashboard lee este token si no existe sesión activa en sessionStorage.

### Auth Bridge v2.0 (en index.html y cash_today.html)
1. Lee `pdc_session` → si existe, mapea a `pdc_user` legacy
2. Si no, lee `pdc_user` → si existe, continúa
3. Si ninguno existe → redirige a `analytics.html`
4. Verifica que el dashboard esté en `acceso[]` del usuario
5. Si no tiene acceso → redirige a `analytics.html`

---

## 👥 Matriz de Usuarios

| Email | Rol | País | Dashboards | Sedes |
|-------|-----|------|-----------|-------|
| juancarlos.escobar@grupopdc.com | admin | regional | rutas, cashtoday | todas |
| erwin.soto@grupopdc.com | supervisor | regional | rutas, cashtoday | todas |
| francisco.aguilar@grupopdc.com | supervisor | GT | rutas, cashtoday | CDA |
| liquidaciones.cda@grupopdc.com | consulta | GT | rutas, cashtoday | CDA, XELA |
| edy.lopez@grupopdc.com | consulta | GT | rutas | CDA |
| joaquin.palma@grupopdc.com | consulta | ESV | rutas, cashtoday | Sta.Tecla, Sn.Miguel |
| liquidaciones.esv@grupopdc.com | consulta | ESV | rutas, cashtoday | Sta.Tecla, Sn.Miguel |
| vinicio.sanabria@grupopdc.com | consulta | GT | rutas | CDA |
| claudio.rojas@grupopdc.com | consulta | PE | rutas | Peru |
| jose.mallqui@grupopdc.com | consulta | PE | rutas | Peru |
| transportes.peru@grupopdc.com | consulta | PE | rutas | Peru |

### Roles
| Rol | Permisos |
|-----|---------|
| `admin` | Acceso total: descarga, subida, actualización, admin panel, tipos de cambio |
| `supervisor` | Acceso a dashboards autorizados, sin descarga/subida |
| `consulta` | Solo visualización de dashboards autorizados |

---

## 🗺️ Filtro Automático por País

### Lógica en `cash_today.html` y `index.html`
```
admin / supervisor / pais='regional' → Ve todos los países (sin restricción)
pais='GT' o 'GT/CDA'               → Forzado a Guatemala, selector bloqueado
pais='ESV'                          → Forzado a El Salvador, selector bloqueado
pais='PE'                           → Sin datos en Cash Today (solo Rutas)
```

### Mapa de países
```javascript
{ 'GT': 'Guatemala', 'GT/CDA': 'Guatemala', 'ESV': 'El Salvador', 'PE': '' }
```

---

## 📊 Dashboards Registrados

### 1. Liquidación de Rutas (`index.html`)
- **KPIs:** Rutas pendientes, monto liquidado, diferencia, % cobertura
- **Filtros:** País, sede, transportista, rango de fechas
- **Funciones admin:** Snapshot, descarga, tipos de cambio
- **Países:** GT, ESV, PE, HN

### 2. Cash Today (`cash_today.html`)
- **KPIs:** Recolección efectivo ATM, volumetría, costos servicio, límites operativos
- **Filtros:** País, sede, cajero(s), tipo cajero, vista temporal
- **Países:** GT, ESV

---

## 🔄 Fases de Implementación

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | `users.js` + `auth.js` + `login.html` | ✅ Completa |
| 2 | `analytics.html` — Portal con cards ejecutivas | ✅ Completa |
| 3 | Auth Bridge + botones Salir/Portal en `index.html` y `admin.html` | ✅ Completa |
| 4 | Auth Bridge + filtro país + botones Salir/Portal en `cash_today.html` | ✅ Completa |
| 5 | Token URL enriquecido + documentación actualizada | ✅ Completa |

---

## ⚙️ Integraciones Externas

### Supabase (chat admin)
- **URL:** `https://pytsrgtcjytjztwdlvux.supabase.co`
- **Uso:** Canal de mensajería en `admin.html`
- **Acceso:** Solo rol `admin`

### GitHub Pages
- **Deploy:** Automático al hacer push a `main`
- **Latencia:** 1-3 minutos post-commit
- **Cache:** Forzar recarga con Ctrl+Shift+R si no carga el cambio

---

## 🛠️ Mantenimiento

### Agregar un usuario
1. Editar `js/users.js` → array `PDC_USERS`
2. Editar `analytics.html` → array local de usuarios (línea ~177)
3. Commit y push a `main`

### Agregar un dashboard
1. Editar `js/users.js` → array `PDC_DASHBOARDS`
2. Agregar Auth Bridge al nuevo archivo HTML
3. Agregar card en `analytics.html`
4. Actualizar permisos de usuarios que deben tener acceso

### Cambiar contraseñas
- Editar campo `pass` en `PDC_USERS` (en `js/users.js` y en `analytics.html`)
- Las contraseñas están en texto plano — arquitectura sin backend

---

## 📝 Notas Técnicas

- **sessionStorage vs localStorage:** Se usa `sessionStorage` por seguridad (se limpia al cerrar pestaña)
- **Sin backend:** Toda la lógica de auth es client-side; no apta para datos altamente sensibles
- **Archivos grandes:** `cash_today.html` (~9.3MB) y `index.html` tienen datos embebidos como base64
- **Compatibilidad:** Chrome 90+, Edge 90+, Firefox 88+. No soportado en IE.

