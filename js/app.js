/* ============================================================
   GRAPHITE-X  —  Application Core
   Dashboard wiring, real-time updates, UI interactions
   ============================================================ */

'use strict';

/* ── Chart registry ──────────────────────────────────────── */
const charts = {};

/* ── Toast system ────────────────────────────────────────── */
const toastContainer = (() => {
  const el = document.createElement('div');
  el.className = 'toast-container';
  document.body.appendChild(el);
  return el;
})();

const toast = (msg, type = 'info', duration = 3000) => {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  t.innerHTML = `<span style="font-weight:700;font-size:15px">${icons[type] || icons.info}</span> ${msg}`;
  toastContainer.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 300); }, duration);
};

/* ── Format helpers ──────────────────────────────────────── */
const fmt = (v, dec = 1) => parseFloat(v.toFixed(dec)).toLocaleString();
const fmtLabel = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
};

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  MetricsEngine.init();
  initSparklines();
  initMainChart();
  initRequestChart();
  initDiskGauge();
  initErrorChart();
  initHeatmap();
  initNetChart();
  initHostTable();
  startLiveUpdates();
  renderAlertList();
});

/* ── Sparklines ──────────────────────────────────────────── */
function initSparklines() {
  const C = GXCharts.COLORS;
  charts.sparkCpu = GXCharts.sparkline('sparkCpu', MetricsEngine.getSeries('cpu', 30), C.cyan);
  charts.sparkMem = GXCharts.sparkline('sparkMem', MetricsEngine.getSeries('memory', 30), C.purple);
  charts.sparkReq = GXCharts.sparkline('sparkReq', MetricsEngine.getSeries('requests', 30), C.green);
  charts.sparkLat = GXCharts.sparkline('sparkLat', MetricsEngine.getSeries('latency', 30), C.amber);
  charts.sparkErr = GXCharts.sparkline('sparkErr', MetricsEngine.getSeries('errors', 30), C.red);
}

/* ── Main multi-line chart ───────────────────────────────── */
function initMainChart() {
  charts.main = GXCharts.timeseries('chartMain', [
    { label: 'CPU %',    series: MetricsEngine.getSeries('cpu', 60),     color: 'cyan',   fill: true },
    { label: 'Mem GB',   series: MetricsEngine.getSeries('memory', 60),  color: 'purple', fill: false },
    { label: 'Net MB/s', series: MetricsEngine.getSeries('netIn', 60),   color: 'green',  fill: false },
  ]);

  const legend = document.getElementById('mainLegend');
  if (legend) {
    const items = [
      { label: 'CPU', color: GXCharts.COLORS.cyan },
      { label: 'Memory', color: GXCharts.COLORS.purple },
      { label: 'Network', color: GXCharts.COLORS.green },
    ];
    legend.innerHTML = items.map(it =>
      `<div class="legend-item">
        <span class="legend-dot" style="background:${it.color}"></span>
        ${it.label}
      </div>`
    ).join('');
  }
}

/* ── Request rate bar chart ──────────────────────────────── */
function initRequestChart() {
  charts.req = GXCharts.bar('chartReq', MetricsEngine.getSeries('requests', 40), GXCharts.COLORS.green, { label: 'req/s' });
}

/* ── Disk doughnut gauge ─────────────────────────────────── */
function initDiskGauge() {
  const val = MetricsEngine.getValue('disk');
  charts.disk = GXCharts.doughnut('chartDisk', val, 100, GXCharts.COLORS.cyan);
  document.getElementById('diskPct').textContent = `${Math.round(val)}%`;
}

/* ── Error rate ──────────────────────────────────────────── */
function initErrorChart() {
  charts.err = GXCharts.timeseries('chartErr', [
    { label: 'Error %', series: MetricsEngine.getSeries('errors', 60), color: 'red', fill: true },
  ], { yAxis: { suggestedMax: 2 } });
}

/* ── Heatmap ─────────────────────────────────────────────── */
function initHeatmap() {
  charts.heat = GXCharts.heatmap('chartHeat', MetricsEngine.getHeatmap());
}

/* ── Network stacked ─────────────────────────────────────── */
function initNetChart() {
  charts.net = GXCharts.stackedArea('chartNet', [
    { label: 'Inbound',  series: MetricsEngine.getSeries('netIn', 60) },
    { label: 'Outbound', series: MetricsEngine.getSeries('netOut', 60) },
  ]);
}

/* ── Host table ──────────────────────────────────────────── */
function initHostTable() {
  renderHostTable();
}

function renderHostTable() {
  const body = document.getElementById('hostTableBody');
  if (!body) return;
  const hosts = MetricsEngine.getHosts();
  body.innerHTML = hosts.map(h => {
    const cpuColor = h.cpu > 88 ? '#ef4444' : h.cpu > 70 ? '#f59e0b' : '#10b981';
    return `<tr>
      <td style="font-family:var(--font-mono);font-size:11px">${h.name}</td>
      <td>
        <div class="host-bar">
          <div class="host-bar-bg">
            <div class="host-bar-fill" style="width:${h.cpu}%;background:${cpuColor}"></div>
          </div>
          <span style="font-size:11px;min-width:34px;text-align:right;font-variant-numeric:tabular-nums">${fmt(h.cpu)}%</span>
        </div>
      </td>
      <td style="font-size:11px;font-variant-numeric:tabular-nums">${fmt(h.mem)}%</td>
      <td><span class="status-chip ${h.status}">${h.status.toUpperCase()}</span></td>
    </tr>`;
  }).join('');
}

/* ── Alerts panel ────────────────────────────────────────── */
function renderAlertList() {
  const list = document.getElementById('alertList');
  if (!list) return;
  const alerts = MetricsEngine.getAlerts();
  list.innerHTML = alerts.map(a => {
    const mins = Math.round((Date.now() - a.fired) / 60000);
    return `<div class="alert-item ${a.severity}">
      <div class="alert-item-title">${a.title}</div>
      <div class="alert-item-meta">${a.desc}</div>
      <div class="alert-item-meta" style="margin-top:4px;font-family:var(--font-mono);color:var(--accent-cyan)">${a.metric}</div>
      <div class="alert-item-meta" style="margin-top:6px">${mins}m ago</div>
    </div>`;
  }).join('');
}

/* ── Live update loop ────────────────────────────────────── */
let _liveInterval = null;
let _tickCount = 0;

function startLiveUpdates() {
  _liveInterval = setInterval(() => {
    const vals = MetricsEngine.tickAll();
    const label = fmtLabel();
    _tickCount++;

    /* stat card values */
    setStatVal('cpuVal', vals.cpu, '%');
    setStatVal('memVal', vals.memory, 'GB');
    setStatVal('reqVal', vals.requests, 'K/s');
    setStatVal('latVal', Math.round(vals.latency), 'ms');
    setStatVal('errVal', vals.errors, '%');

    /* sparklines */
    const cpuS = MetricsEngine.getSeries('cpu', 30);
    const memS = MetricsEngine.getSeries('memory', 30);
    const reqS = MetricsEngine.getSeries('requests', 30);
    const latS = MetricsEngine.getSeries('latency', 30);
    const errS = MetricsEngine.getSeries('errors', 30);

    updateSparkline(charts.sparkCpu, cpuS);
    updateSparkline(charts.sparkMem, memS);
    updateSparkline(charts.sparkReq, reqS);
    updateSparkline(charts.sparkLat, latS);
    updateSparkline(charts.sparkErr, errS);

    /* main chart — slide window */
    GXCharts.appendMulti(charts.main,
      [vals.cpu, vals.memory, vals.netIn], label);

    /* request bar */
    GXCharts.appendPoint(charts.req, 'requests', vals.requests, label);

    /* error chart */
    GXCharts.appendPoint(charts.err, 'errors', vals.errors, label);

    /* net chart */
    GXCharts.appendMulti(charts.net, [vals.netIn, vals.netOut], label);

    /* disk gauge (slower) */
    if (_tickCount % 5 === 0) {
      const diskVal = MetricsEngine.getValue('disk');
      updateDiskGauge(diskVal);
    }

    /* host table (medium) */
    if (_tickCount % 3 === 0) {
      renderHostTable();
    }

    /* random anomaly toast */
    if (_tickCount % 45 === 0) {
      const v = MetricsEngine.getValue('cpu');
      if (v > 88) toast(`CPU spike detected: ${fmt(v)}%`, 'error');
    }
  }, 2000);
}

function setStatVal(id, val, unit) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `${fmt(val)}<span class="stat-unit">${unit}</span>`;
}

function updateSparkline(chart, series) {
  if (!chart) return;
  chart.data.labels = series.map(() => '');
  chart.data.datasets[0].data = series.map(p => p.v);
  chart.update('none');
}

function updateDiskGauge(val) {
  if (!charts.disk) return;
  const pct = val / 100;
  const color = pct > 0.85 ? GXCharts.COLORS.red : pct > 0.70 ? GXCharts.COLORS.amber : GXCharts.COLORS.cyan;
  charts.disk.data.datasets[0].data = [pct, 1 - pct];
  charts.disk.data.datasets[0].backgroundColor[0] = color;
  charts.disk.update('none');
  const el = document.getElementById('diskPct');
  if (el) el.textContent = `${Math.round(val)}%`;
}

/* ── UI interactions ─────────────────────────────────────── */

function toggleSidebar() {
  document.body.classList.toggle('sidebar-collapsed');
  setTimeout(() => {
    Object.values(charts).forEach(c => { if (c && c.resize) c.resize(); });
  }, 350);
}

function setRange(r) {
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  toast(`Time range set to ${r}`, 'info', 1500);
}

function refreshAll() {
  MetricsEngine.init();
  initMainChart();
  initRequestChart();
  initErrorChart();
  initNetChart();
  initHeatmap();
  renderHostTable();
  toast('Dashboard refreshed', 'success', 1500);
}

function saveDashboard() {
  toast('Dashboard saved', 'success', 2000);
}

function togglePanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.classList.toggle('span-3');
  panel.classList.toggle('span-2');
  setTimeout(() => {
    Object.values(charts).forEach(c => { if (c && c.resize) c.resize(); });
  }, 100);
}

function openAddPanel() {
  document.getElementById('addPanelModal').classList.add('open');
}

function closeAddPanel() {
  document.getElementById('addPanelModal').classList.remove('open');
}

function addPanel(type) {
  document.querySelectorAll('.panel-type').forEach(p => p.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  event.currentTarget.style.borderColor = 'var(--accent-cyan)';
}

function confirmAddPanel() {
  const title = document.getElementById('panelTitle').value || 'New Panel';
  closeAddPanel();
  toast(`Panel "${title}" added`, 'success');
}

function closeAlertDrawer() {
  document.getElementById('alertDrawer').classList.remove('open');
}

function loadDashboard(name) {
  toast(`Loading ${name} dashboard…`, 'info', 1500);
}

/* ── Keyboard shortcuts ──────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAddPanel();
    closeAlertDrawer();
  }
  if (e.key === 'r' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    refreshAll();
  }
  if (e.key === 'a' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    document.getElementById('alertDrawer').classList.toggle('open');
  }
});

/* ── Sidebar search ──────────────────────────────────────── */
const sidebarSearch = document.getElementById('sidebarSearch');
if (sidebarSearch) {
  sidebarSearch.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.nav-item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}
