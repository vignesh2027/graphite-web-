/* ============================================================
   GRAPHITE-X  —  Charts System
   Thin wrappers around Chart.js with GRAPHITE-X styling
   ============================================================ */

'use strict';

const GXCharts = (() => {

  /* ── Global Chart.js defaults ────────────────────────────── */
  Chart.defaults.color = 'rgba(255,255,255,0.45)';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family = "'SF Pro Display', -apple-system, 'Segoe UI', system-ui, sans-serif";
  Chart.defaults.font.size = 11;

  const COLORS = {
    cyan:   '#00d4ff',
    purple: '#7c3aed',
    green:  '#10b981',
    amber:  '#f59e0b',
    red:    '#ef4444',
    pink:   '#ec4899',
  };

  const gradient = (ctx, color, alpha_top = 0.25, alpha_bot = 0) => {
    const g = ctx.createLinearGradient(0, 0, 0, 240);
    g.addColorStop(0, color.replace(')', `, ${alpha_top})`).replace('rgb', 'rgba'));
    g.addColorStop(1, color.replace(')', `, ${alpha_bot})`).replace('rgb', 'rgba'));
    return g;
  };

  const hexGrad = (ctx, hex, alpha_top = 0.3, alpha_bot = 0) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const gr = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const g = ctx.createLinearGradient(0, 0, 0, 260);
    g.addColorStop(0, `rgba(${r},${gr},${b},${alpha_top})`);
    g.addColorStop(1, `rgba(${r},${gr},${b},${alpha_bot})`);
    return g;
  };

  const timeLabels = (series) => series.map(p => {
    const d = new Date(p.t);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  });

  const tooltipStyle = {
    backgroundColor: 'rgba(13,14,26,0.97)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    padding: 10,
    cornerRadius: 8,
    displayColors: true,
    boxWidth: 8,
    boxHeight: 8,
    boxPadding: 4,
    titleFont: { weight: '600', size: 12 },
    bodyFont: { size: 12 },
  };

  const scaleStyle = {
    grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
    ticks: { maxTicksLimit: 6, color: 'rgba(255,255,255,0.35)', padding: 8 },
    border: { display: false },
  };

  /* ── Sparkline ───────────────────────────────────────────── */
  const sparkline = (canvasId, series, color = COLORS.cyan) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const vals = series.map(p => p.v);
    const c = ctx.getContext('2d');
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: vals.map(() => ''),
        datasets: [{
          data: vals,
          borderColor: color,
          borderWidth: 1.5,
          fill: true,
          backgroundColor: hexGrad(c, color.replace('#','') === color ? color : color, 0.2, 0),
          tension: 0.4,
          pointRadius: 0,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false },
        },
      }
    });
  };

  /* ── Multi-line time series ──────────────────────────────── */
  const timeseries = (canvasId, datasets, opts = {}) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const c = ctx.getContext('2d');

    const chartDatasets = datasets.map(ds => {
      const col = COLORS[ds.color] || ds.color || COLORS.cyan;
      const hexStr = col.startsWith('#') ? col.slice(1) : 'ffffff';
      const r = parseInt(hexStr.slice(0,2), 16);
      const gr = parseInt(hexStr.slice(2,4), 16);
      const b = parseInt(hexStr.slice(4,6), 16);
      const grad = ctx.getContext('2d').createLinearGradient(0, 0, 0, 240);
      grad.addColorStop(0, `rgba(${r},${gr},${b},0.25)`);
      grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
      return {
        label: ds.label,
        data: ds.series.map(p => p.v),
        borderColor: col,
        backgroundColor: ds.fill !== false ? grad : 'transparent',
        fill: ds.fill !== false,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: col,
      };
    });

    const labels = timeLabels(datasets[0].series);

    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: chartDatasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        animation: { duration: 300 },
        plugins: {
          legend: { display: false },
          tooltip: { ...tooltipStyle },
        },
        scales: {
          x: { ...scaleStyle, ticks: { ...scaleStyle.ticks, maxTicksLimit: 8 } },
          y: { ...scaleStyle, ...opts.yAxis },
        },
      }
    });
  };

  /* ── Area chart ──────────────────────────────────────────── */
  const area = (canvasId, series, color = COLORS.green, opts = {}) => {
    return timeseries(canvasId, [{ label: opts.label || 'Value', series, color: Object.keys(COLORS).find(k => COLORS[k] === color) || 'green', fill: true }], opts);
  };

  /* ── Doughnut / gauge ────────────────────────────────────── */
  const doughnut = (canvasId, value, max = 100, color = COLORS.cyan) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const pct = Math.min(value / max, 1);
    const remaining = 1 - pct;

    const trackColor = 'rgba(255,255,255,0.05)';
    const accent = pct > 0.85 ? COLORS.red : pct > 0.70 ? COLORS.amber : color;

    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [pct, remaining],
          backgroundColor: [accent, trackColor],
          borderWidth: 0,
          hoverBackgroundColor: [accent, trackColor],
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '78%',
        rotation: -90, circumference: 180,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      }
    });
  };

  /* ── Bar chart ───────────────────────────────────────────── */
  const bar = (canvasId, series, color = COLORS.cyan, opts = {}) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const c = ctx.getContext('2d');
    const hexStr = color.startsWith('#') ? color.slice(1) : '00d4ff';
    const r2 = parseInt(hexStr.slice(0,2),16), g2 = parseInt(hexStr.slice(2,4),16), b2 = parseInt(hexStr.slice(4,6),16);
    const grad = c.createLinearGradient(0, 0, 0, 220);
    grad.addColorStop(0, `rgba(${r2},${g2},${b2},0.85)`);
    grad.addColorStop(1, `rgba(${r2},${g2},${b2},0.2)`);

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: timeLabels(series),
        datasets: [{ label: opts.label || 'Value', data: series.map(p => p.v), backgroundColor: grad, borderRadius: 3, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: { legend: { display: false }, tooltip: { ...tooltipStyle } },
        scales: {
          x: { ...scaleStyle, ticks: { ...scaleStyle.ticks, maxTicksLimit: 8 } },
          y: { ...scaleStyle, ...opts.yAxis },
        },
      }
    });
  };

  /* ── Stacked area (network I/O) ──────────────────────────── */
  const stackedArea = (canvasId, datasets) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const chartDatasets = datasets.map((ds, i) => {
      const col = [COLORS.cyan, COLORS.purple, COLORS.green][i] || COLORS.cyan;
      const hexStr = col.slice(1);
      const r2 = parseInt(hexStr.slice(0,2),16), g2 = parseInt(hexStr.slice(2,4),16), b2 = parseInt(hexStr.slice(4,6),16);
      const grad = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
      grad.addColorStop(0, `rgba(${r2},${g2},${b2},0.3)`);
      grad.addColorStop(1, `rgba(${r2},${g2},${b2},0.02)`);
      return {
        label: ds.label, data: ds.series.map(p => p.v),
        borderColor: col, backgroundColor: grad,
        fill: true, borderWidth: 2, tension: 0.4, pointRadius: 0, pointHoverRadius: 4,
      };
    });

    return new Chart(ctx, {
      type: 'line',
      data: { labels: timeLabels(datasets[0].series), datasets: chartDatasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        animation: { duration: 300 },
        plugins: { legend: { display: false }, tooltip: { ...tooltipStyle } },
        scales: {
          x: { ...scaleStyle, ticks: { ...scaleStyle.ticks, maxTicksLimit: 8 } },
          y: { ...scaleStyle, stacked: false },
        },
      }
    });
  };

  /* ── Heatmap (canvas-drawn, not Chart.js) ────────────────── */
  const heatmap = (canvasId, heatData) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const { labels, data } = heatData;
    const hours = 24, buckets = labels.length;

    const drawHeatmap = () => {
      const W = canvas.parentElement.clientWidth - 2;
      const H = Math.min(220, canvas.parentElement.clientHeight - 2);
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      const labelW = 70, padTop = 24, padBot = 20;
      const cellW = (W - labelW) / hours;
      const cellH = (H - padTop - padBot) / buckets;

      ctx.clearRect(0, 0, W, H);

      const getColor = (v) => {
        const r = Math.round(v * 239 + (1 - v) * 0);
        const g = Math.round(v * 68  + (1 - v) * 212);
        const b = Math.round(v * 68  + (1 - v) * 255);
        return `rgba(${r},${g},${b},${0.2 + v * 0.75})`;
      };

      data.forEach(({ x, y, v }) => {
        ctx.fillStyle = getColor(v);
        ctx.fillRect(
          labelW + x * cellW + 1,
          padTop + y * cellH + 1,
          cellW - 2,
          cellH - 2
        );
        const radius = 3;
        ctx.beginPath();
        ctx.roundRect?.(labelW + x * cellW + 1, padTop + y * cellH + 1, cellW - 2, cellH - 2, radius);
        ctx.fill();
      });

      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'right';
      labels.forEach((lbl, i) => {
        ctx.fillText(lbl, labelW - 6, padTop + i * cellH + cellH / 2 + 4);
      });

      ctx.textAlign = 'center';
      for (let h = 0; h < hours; h += 3) {
        ctx.fillText(`${h}:00`, labelW + h * cellW + cellW / 2, H - 4);
      }
    };

    drawHeatmap();
    window.addEventListener('resize', drawHeatmap);
    return { redraw: drawHeatmap };
  };

  /* ── Update a line chart's last dataset point ─────────────── */
  const appendPoint = (chart, key, newVal, newLabel) => {
    if (!chart) return;
    chart.data.labels.push(newLabel);
    chart.data.labels.shift();
    chart.data.datasets.forEach(ds => {
      ds.data.push(newVal);
      ds.data.shift();
    });
    chart.update('none');
  };

  const appendMulti = (chart, newVals, newLabel) => {
    if (!chart) return;
    chart.data.labels.push(newLabel);
    chart.data.labels.shift();
    chart.data.datasets.forEach((ds, i) => {
      ds.data.push(newVals[i]);
      ds.data.shift();
    });
    chart.update('none');
  };

  return {
    sparkline, timeseries, area, doughnut, bar, stackedArea, heatmap,
    appendPoint, appendMulti,
    COLORS,
  };
})();
