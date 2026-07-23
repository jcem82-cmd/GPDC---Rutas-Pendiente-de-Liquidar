/* ═══════════════════════════════════════════════════════════════
   PDC DATA BRIDGE v1.0
   Fuente única de verdad para KPIs del Hub (analytics.html)
   Lee index.html en vivo (RAW / KPI_TOTALS / FX_DEF) y calcula
   los KPIs por país en tiempo de ejecución. Cero datos duplicados.

   Uso:
     PDCBridge.load().then(function(data){
       var reg = PDCBridge.kpis(data, null);          // consolidado
       var esv = PDCBridge.kpis(data, 'El Salvador');  // por país
     });
   ═══════════════════════════════════════════════════════════════ */
var PDCBridge = (function () {

  /* MASTER_FILE se resuelve así:
     1) Si la página define `var PDC_MASTER_PATH` ANTES de este script, se usa esa ruta
        (necesario para archivos en subcarpetas, ej. regional/index.html -> '../index.html').
     2) Si no, cae a 'index.html' (correcto solo para archivos en la raíz del repo, ej. analytics.html).
     BUG CORREGIDO: antes se usaba 'index.html' fijo, lo que en subcarpetas apuntaba
     al propio archivo (self-fetch) en vez de al maestro real. */
  var MASTER_FILE = (typeof PDC_MASTER_PATH !== 'undefined' && PDC_MASTER_PATH) ? PDC_MASTER_PATH : 'index.html';
  var cache = null;

  /* Extrae un bloque `const NOMBRE = {...};` o `[...]` del HTML fuente */
  function parseBlock(html, name, opener, closer) {
    var re = new RegExp(
      'const ' + name + ' = (\\' + opener + '[\\s\\S]*?\\' + closer + ');'
    );
    var m = html.match(re);
    return m ? m[1] : null;
  }

  /* FX_DEF no es JSON válido (usa expresiones tipo 1/7.63627),
     por lo que se evalúa como literal JS de forma controlada
     (fuente propia y confiable: index.html del mismo repo). */
  function parseFxDef(html) {
    var raw = parseBlock(html, 'FX_DEF', '{', '}');
    if (!raw) return { GTQ: 1, USD: 1, PEN: 1 };
    try {
      return Function('"use strict"; return (' + raw + ');')();
    } catch (e) {
      console.error('PDCBridge: error parseando FX_DEF', e);
      return { GTQ: 1, USD: 1, PEN: 1 };
    }
  }

  function load(force) {
    if (cache && !force) return Promise.resolve(cache);
    return fetch(MASTER_FILE + '?_=' + Date.now())
      .then(function (r) {
        if (!r.ok) throw new Error('No se pudo leer ' + MASTER_FILE + ' (HTTP ' + r.status + ')');
        return r.text();
      })
      .then(function (html) {
        var rawBlock = parseBlock(html, 'RAW', '[', ']');
        var kpiBlock = parseBlock(html, 'KPI_TOTALS', '{', '}');
        /* HOTFIX 23/07/2026: KPI_HIST (Total Rutas / Vencidas por cierre mensual,
           publicado automáticamente desde la hoja Efectividad del Excel) — campo
           aditivo, no afecta a los consumidores existentes de PDCBridge.load(). */
        var histBlock = parseBlock(html, 'KPI_HIST', '[', ']');
        var RAW = rawBlock ? JSON.parse(rawBlock) : [];
        var KPI_TOTALS = kpiBlock ? JSON.parse(kpiBlock) : {};
        var KPI_HIST = histBlock ? JSON.parse(histBlock) : [];
        var FX_DEF = parseFxDef(html);
        cache = { RAW: RAW, KPI_TOTALS: KPI_TOTALS, KPI_HIST: KPI_HIST, FX_DEF: FX_DEF, loadedAt: Date.now() };
        return cache;
      });
  }

  /* Regla de negocio única (misma que index.html):
     Ruta activa/pendiente = no liquidada en Facturación NI en Despacho */
  function notLiq(d) {
    return d['Estado (Facturación)'] !== 'Liquidada' && d['Estado Real'] !== 'Liquidada';
  }

  /* KPIs por país (o consolidado si pais es null/undefined) */
  function kpis(data, pais) {
    var RAW = data.RAW || [];
    var FX = data.FX_DEF || { GTQ: 1, USD: 1, PEN: 1 };

    var rows = RAW.filter(function (r) {
      return (!pais || r['Pais'] === pais) && notLiq(r);
    });

    var vencidas = rows.filter(function (r) {
      return r['Estado (Facturación)'] === 'Vencidas';
    }).length;

    var alDia = rows.filter(function (r) {
      return r['Rango Real'] === '0 Tiempo' || r['Rango Real'] === '01 a 03';
    }).length;

    var montoUSD = rows.reduce(function (acc, r) {
      var mon = r['Moneda'] || 'GTQ';
      return acc + (r['Valor Asignado'] || 0) * (FX[mon] || 1);
    }, 0);

    var paisesSet = {};
    RAW.filter(notLiq).forEach(function (r) { paisesSet[r['Pais']] = 1; });

    return {
      activas: rows.length,
      vencidas: vencidas,
      efectividad: rows.length ? Math.round((alDia / rows.length) * 1000) / 10 : 0,
      montoUSD: Math.round(montoUSD),
      paises: Object.keys(paisesSet).length,
      reportDate: (data.KPI_TOTALS && data.KPI_TOTALS.report_date) || null
    };
  }

  function fmtMoney(v) {
    if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return '$' + Math.round(v / 1000) + 'k';
    return '$' + Math.round(v);
  }

  return { load: load, kpis: kpis, fmtMoney: fmtMoney, notLiq: notLiq };
})();
