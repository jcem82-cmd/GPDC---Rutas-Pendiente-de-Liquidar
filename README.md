# Dashboard Liquidación de Rutas — v9

**Publicado:** 3 de junio de 2026  
**Status:** ✅ Live en GitHub Pages  
**URL:** https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/

---

## 📊 Descripción Ejecutiva

Dashboard web **100% estático** para monitoreo en tiempo real de la **liquidación de rutas de reparto** en CODISA. Integra visualización ejecutiva, análisis operativo y exportación de datos sin dependencia de backend.

**Caso de uso:** Gerencia operativa, jefes de liquidación y dirección financiera requieren visibilidad inmediata del estado de rutas pendientes, diferencias de depósito y KPIs operativos.

---

## 🎯 Funcionalidades Principales

### 1️⃣ Análisis Dual de Liquidación
- **Tab 1 — Resumen Ejecutivo**
  - KPI críticos: rutas pendientes, monto total, diferencia acumulada, tasa de liquidación
  - Semáforo de estado (rojo/amarillo/verde) por estado de ruta
  - Distribución visual por tipo de ruta (Normal, Express, Banco, Transporte X)
  
- **Tab 2 — Detalle por Ruta**
  - Tabla interactiva con filtros por estado, tipo, fecha
  - Columnas: ID ruta, piloto, monto asignado, depositado, diferencia, estado, fecha
  - Cálculo automático de variancia y tendencias

### 2️⃣ Filtrado y Segmentación
- **Filtros dinámicos:**
  - Estado de liquidación (Pendiente, Parcial, Liquidado)
  - Tipo de ruta (Normal, Express, Banco, Transporte X)
  - Rango de fechas
  - Toggle de exclusión por piloto específico
  
- **Reset:** botón para limpiar filtros en un clic

### 3️⃣ Visualizaciones Ejecutivas
- **Gráficos interactivos** (Chart.js v4.4.0):
  - Tendencia de liquidación (línea temporal)
  - Distribución por estado (gráfico de pastel)
  - Diferencias por tipo de ruta (barras)
  - Análisis de completitud de depósitos (porcentaje)
  
- **Responsive:** compatible con desktop, tablet y mobile

### 4️⃣ Exportación de Datos
- **Export a Excel** (XLSX):
  - Datos filtrados o completos según selección
  - Preserva formato ejecutivo
  - Usa SheetJS (xlsx v0.20.0) — sin servidor requerido

### 5️⃣ Diseño Corporativo
- **Paleta CODISA:**
  - Navy corporativo (#002060) como primario
  - Sky blue (#CFEEFC) como secundario
  - Codificación semáforo: verde (#48a010), amarillo (#e0ac00), rojo (#d03030)
  
- **Tipografía:** Plus Jakarta Sans (Google Fonts)
- **Shadow & Spacing:** diseño moderno, legible en cualquier luminosidad

---

## 🔧 Stack Técnico

| Componente | Tecnología | Versión |
|---|---|---|
| **Frontend** | HTML5 + CSS3 + JavaScript vanilla | ES6+ |
| **Gráficos** | Chart.js | 4.4.0 |
| **Exportación** | SheetJS (XLSX) | 0.20.0 |
| **Tipografía** | Google Fonts: Plus Jakarta Sans | - |
| **Hosting** | GitHub Pages (estático) | - |
| **Navegadores** | Chrome, Firefox, Safari, Edge | últimas 2 versiones |

**Dependencias externas (vía CDN):**
- `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`
- `https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js`
- `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans`

---

## 📈 KPIs Monitoreados

| KPI | Fórmula | Objetivo |
|---|---|---|
| **Rutas Pendientes** | COUNT(estado="Pendiente") | ≤ 5 EOD |
| **Monto Pendiente** | SUM(depositado < asignado) | $0 EOD |
| **Diferencia Total** | SUM(asignado - depositado) | < 1% variancia |
| **Tasa Liquidación** | (liquidadas / total) × 100 | ≥ 98% diario |
| **Días Vencidos** | COUNT(fecha < hoy - 3 días) | 0 |

---

## 📝 Estructura de Datos

El dashboard consume datos **sin transformación de backend**. Estructura esperada:

```json
{
  "rutas": [
    {
      "id_ruta": "R20260531001",
      "piloto": "Carlos M.",
      "tipo": "Normal",
      "monto_asignado": 2500.00,
      "monto_depositado": 2500.00,
      "diferencia": 0.00,
      "estado": "Liquidado",
      "fecha": "2026-05-31",
      "excluir": false
    }
  ]
}
```

---

## 🚀 Cómo Usar

### Para Usuarios
1. Acceder a: **https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/**
2. Seleccionar **estado**, **tipo de ruta**, **rango de fechas** en barra de filtros
3. Revisar KPIs ejecutivos en la parte superior
4. Hacer clic en **"Exportar a Excel"** para bajar datos filtrados
5. Usar botón **"Limpiar Filtros"** para reiniciar vista

### Para Desarrolladores
1. Clonar repo: `git clone https://github.com/jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar.git`
2. Editar `index.html` localmente
3. Hacer push a `main` branch
4. GitHub Pages despliega automáticamente en ~2 min
5. Ver cambios en https://jcem82-cmd.github.io/GPDC---Rutas-Pendiente-de-Liquidar/

---

## 🔄 Ciclo de Actualización

| Actividad | Frecuencia | Responsable |
|---|---|---|
| Ingesta datos liquidación | Diaria (EOD) | Equipo Créditos |
| Validación diferencias | Diaria | Jefe Liquidaciones |
| Actualización dashboard | Bajo demanda | Charly (2 min) |
| Revisión de variaciones | Semanal | Dirección Financiera |

---

## ⚠️ Limitaciones Conocidas

1. **Datos estáticos:** requiere ingesta manual o API para automatizar
2. **Sin persistencia:** datos se cargan en sesión (no hay BD)
3. **Navegadores:** requiere soporte ES6 (IE no compatible)
4. **HTTPS recomendado:** aunque GitHub Pages lo proporciona

---

## 🔐 Seguridad

- ✅ **Datos públicos:** dashboard contiene solo información operativa (sin PII)
- ✅ **HTTPS:** GitHub Pages fuerza HTTPS
- ✅ **Sin autenticación:** acceso público (considerar restringir si es sensible)
- ⚠️ **RECOMENDACIÓN:** si incluye datos confidenciales, usar repo privado + authentication

---

## 📦 Próximas Iteraciones

**Roadmap:**
- [ ] Integración API en vivo (Power BI / Azure Functions)
- [ ] Automatización de ingesta desde Excel TablaDatos (OneDrive)
- [ ] Detección automática de anomalías en diferencias
- [ ] Alertas por Slack/Email (rutas vencidas)
- [ ] Dashboard mobile optimizado
- [ ] Historial de cambios y auditoría

---

## 👤 Autor & Soporte

**Creado por:** Charly | Liquidaciones CODISA  
**Repo:** https://github.com/jcem82-cmd/GPDC---Rutas-Pendiente-de-Liquidar  
**Contacto:** Disponible para actualizaciones y optimizaciones

---

**Última actualización:** 3 de junio de 2026  
**Versión:** 9.0  
**Estado de compilación:** ✅ Activo
