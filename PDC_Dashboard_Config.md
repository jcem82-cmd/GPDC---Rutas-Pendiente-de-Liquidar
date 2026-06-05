# 📊 PDC Dashboard — Configuración del Sistema
**Versión:** v10 | **Fecha:** Junio 2026 | **Mantenido por:** Claude + Juan Carlos Escobar

---

## 🔗 URLs del Sistema

| Recurso | URL |
|---|---|
| 🔐 Login | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/login.html |
| 📊 Dashboard | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/ |
| 👑 Panel Admin | https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/admin.html |
| 📁 Repositorio | https://github.com/jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar |

---

## 👥 Directorio de Usuarios

| Nombre | Correo | Contraseña | Rol |
|---|---|---|---|
| Juan Carlos Escobar | juancarlos.escobar@grupopdc.com | [ver directorio privado] | 👑 Admin |
| Erwin Soto | erwin.soto@grupopdc.com | [ver directorio privado] | Usuario |
| TEAM | liquidaciones.cda@grupopdc.com | [ver directorio privado] | Usuario |
| Edy Lopez | edy.lopez@grupopdc.com | [ver directorio privado] | Usuario |
| Francisco Aguilar | francisco.aguilar@grupopdc.com | [ver directorio privado] | Usuario |
| Invitado | invitado.pdc@grupopdc.com | [ver directorio privado] | Usuario |

---

## 🗄️ Infraestructura

### GitHub
- **Repo:** jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar
- **Branch:** main
- **Deploy:** GitHub Actions (automático en cada push)
- **Token:** [GITHUB_TOKEN — ver en GitHub Settings]

### Supabase (Chat en tiempo real)
- **URL:** https://pytsrgtcjytjztwdlvux.supabase.co
- **API Key:** [SUPABASE_KEY — ver en Supabase Settings → API]
- **Tabla:** chat_messages
- **Estructura:** id, created_at, sender_email, sender_nombre, sender_role, message, is_read

### Microsoft Teams
- **Equipo:** C & C | Liquidaciones
- **Canales:** Dashboard KPIs, Reportes Mensuales, Alertas Vencidas

### Power Automate
- **Flujo:** Reporte Excel subido - Notificar Dashboard
- **Trigger:** Cuando se crea un archivo en OneDrive /Reporte de Liquidaciones
- **Acción:** Publicar mensaje en Teams → Dashboard KPIs

---

## 📁 Estructura de Archivos en GitHub

```
/
├── index.html      # Dashboard principal
├── login.html      # Página de acceso seguro
├── admin.html      # Panel administrador con chat
└── README.md       # Documentación del proyecto
```

---

## 📊 Estructura del Excel (Fuente de datos)

### Hojas utilizadas:
| Hoja | Uso |
|---|---|
| **General (seguimiento)** | Fuente principal de datos RAW para el dashboard |
| **Dashboard** | KPIs de cierre mensual (total rutas, liquidadas, vencidas) |
| **Efectividad** | Serie histórica mensual para gráficas de tendencia |

### Campos clave de General (seguimiento):
- `Numero de Despacho` — ID de la ruta
- `Estado Real` — Vencidas / En Tiempo / Liquidada
- `Estado (Facturación)` — Estado por facturación
- `Rango Real` — 15 + / 11 a 15 / 04 a 10 / 01 a 03 / 0 Tiempo
- `Moneda` — GTQ / USD / PEN / HNL
- `Cliente` — Nombre correcto del cliente (usar columna Cliente, no cliente)
- `Responsable` — Responsable de la liquidación
- `Valor Asignado` — Valor de la ruta

### Países por moneda:
- GTQ → Guatemala
- USD → El Salvador
- PEN → Perú
- HNL → Honduras

---

## 🔄 Proceso de Actualización Diaria

### Mensaje estándar para Claude:
```
Actualización diaria DD/MM/YYYY — adjunto Excel de rutas, publicar en GitHub
```

### Lo que Claude hace automáticamente:
1. Lee hoja **General (seguimiento)** → construye RAW
2. Lee hoja **Dashboard** → extrae KPIs de cierre
3. Lee hoja **Efectividad** → actualiza serie histórica
4. Reemplaza datos en index.html (sin tocar diseño)
5. Push a GitHub via API
6. Confirma deploy exitoso (~80 segundos)

---

## 🛠️ Lógica de datos crítica

### KPI_TOTALS (estructura exacta):
```json
{
  "report_date": "DD/MM/YYYY",
  "report_month": "YYYY-MM",
  "total_by_moneda": {"GTQ": N, "USD": N, "PEN": N},
  "canal_totals": {
    "GTQ": {"190040 DETALLE": {"all": N, "pend": N}, ...},
    "USD": {...},
    "PEN": {...}
  }
}
```

### RAW (campos clave):
- `cliente` → viene de columna `Cliente` (con C mayúscula) del Excel
- `Pais` → derivado de `Moneda` (GTQ=Guatemala, USD=El Salvador, etc.)
- `Estado (Facturación)` → mismo valor que `Estado Real`

### Reemplazo en HTML:
- Solo se reemplazan: `const RAW`, `const KPI_TOTALS`, `const KPI_HIST`, `const EFECT`
- Nunca se toca el diseño, CSS, ni lógica JS del dashboard
- Fecha del header: `id="hdr-fecha"`

---

## 📱 Chat en tiempo real

### Funcionamiento:
- **Polling cada 3 segundos** (no depende de Supabase Realtime)
- Usuario envía mensaje → guardado en Supabase con `sender_role: 'user'`
- Admin responde → guardado con `sender_role: 'admin'`, `sender_email: email_del_usuario`
- Usuario detecta respuesta → poll `WHERE sender_email = mi_email AND sender_role = 'admin'`
- Alerta visual + sonido para ambos lados

### Panel Admin:
- URL: /admin.html
- Solo accesible con `role: 'admin'`
- Ve todas las conversaciones en sidebar
- Responde en tiempo real

---

## 🚀 Para actualizar directorio de usuarios:
Subir archivo `Directorio.xlsx` con columnas:
- Columna B: Correo Electrónico
- Columna C: Nombre
Claude actualiza login.html automáticamente y publica en GitHub.

---

## ⚠️ Notas importantes:
1. El token de GitHub expira — si falla el push, generar nuevo en GitHub Settings → Developer settings → Personal access tokens
2. Las contraseñas están en el frontend (HTML) — no compartir el código fuente públicamente
3. Supabase plan gratuito: 50,000 filas máximo en chat_messages
4. GitHub Actions despliega en ~80 segundos después del push
