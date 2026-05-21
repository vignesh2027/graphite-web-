/* ============================================================
   GRAPHITE-X  —  Application Core
   Dashboard wiring, real-time updates, UI interactions
   ============================================================ */

'use strict';

/* ── Chart registry ──────────────────────────────────────── */
const charts = {};

/* ── Session / Auth ──────────────────────────────────────── */
const getUser = () => {
  try {
    const raw = sessionStorage.getItem('gx_user');
    return raw ? JSON.parse(raw) : { name: 'Admin', email: 'admin@graphite-x.com', role: 'Administrator' };
  } catch { return { name: 'Admin', email: 'admin@graphite-x.com', role: 'Administrator' }; }
};

const initUserUI = () => {
  const user = getUser();
  const initial = (user.name || user.email || 'A')[0].toUpperCase();

  const sidebar = document.getElementById('sidebarAvatar');
  const sName   = document.getElementById('sidebarName');
  const sRole   = document.getElementById('sidebarRole');
  const topbar  = document.getElementById('topbarAvatar');
  const mName   = document.getElementById('menuUserName');
  const mEmail  = document.getElementById('menuUserEmail');

  if (sidebar)  sidebar.textContent  = initial;
  if (sName)    sName.textContent    = user.name || user.email.split('@')[0];
  if (sRole)    sRole.textContent    = user.role || 'Administrator';
  if (topbar)   topbar.textContent   = initial;
  if (mName)    mName.textContent    = user.name || user.email.split('@')[0];
  if (mEmail)   mEmail.textContent   = user.email || '';
};

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
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = '0.3s';
    setTimeout(() => t.remove(), 300);
  }, duration);
};

/* ── Format helpers ──────────────────────────────────────── */
const fmt = (v, dec = 1) => parseFloat(v.toFixed(dec)).toLocaleString();
const fmtLabel = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
};

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initUserUI();
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
  initClock();
});

/* ── Live clock ──────────────────────────────────────────── */
function initClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;
  const update = () => {
    const d = new Date();
    clockEl.textContent = d.toLocaleTimeString();
  };
  update();
  setInterval(update, 1000);
}

/* ── Sparklines ──────────────────────────────────────────── */
function initSparklines() {
  const C = GXCharts.COLORS;
  charts.sparkCpu = GXCharts.sparkline('sparkCpu', MetricsEngine.getSeries('cpu', 30), C.blue || '#2563eb');
  charts.sparkMem = GXCharts.sparkline('sparkMem', MetricsEngine.getSeries('memory', 30), C.purple);
  charts.sparkReq = GXCharts.sparkline('sparkReq', MetricsEngine.getSeries('requests', 30), C.green);
  charts.sparkLat = GXCharts.sparkline('sparkLat', MetricsEngine.getSeries('latency', 30), C.amber);
  charts.sparkErr = GXCharts.sparkline('sparkErr', MetricsEngine.getSeries('errors', 30), C.red);
}

/* ── Main multi-line chart ───────────────────────────────── */
function initMainChart() {
  charts.main = GXCharts.timeseries('chartMain', [
    { label: 'CPU %',    series: MetricsEngine.getSeries('cpu', 60),     color: 'blue',   fill: true },
    { label: 'Mem GB',   series: MetricsEngine.getSeries('memory', 60),  color: 'purple', fill: false },
    { label: 'Net MB/s', series: MetricsEngine.getSeries('netIn', 60),   color: 'green',  fill: false },
  ]);
  buildLegend('mainLegend', [
    { label: 'CPU',     color: GXCharts.COLORS.blue || '#2563eb' },
    { label: 'Memory',  color: GXCharts.COLORS.purple },
    { label: 'Network', color: GXCharts.COLORS.green },
  ]);
}

function buildLegend(id, items) {
  const legend = document.getElementById(id);
  if (!legend) return;
  legend.innerHTML = items.map(it =>
    `<div class="legend-item">
      <span class="legend-dot" style="background:${it.color}"></span>
      ${it.label}
    </div>`
  ).join('');
}

/* ── Request rate bar chart ──────────────────────────────── */
function initRequestChart() {
  charts.req = GXCharts.bar('chartReq', MetricsEngine.getSeries('requests', 40), GXCharts.COLORS.green, { label: 'req/s' });
}

/* ── Disk doughnut gauge ─────────────────────────────────── */
function initDiskGauge() {
  const val = MetricsEngine.getValue('disk');
  charts.disk = GXCharts.doughnut('chartDisk', val, 100, GXCharts.COLORS.blue || '#2563eb');
  const el = document.getElementById('diskPct');
  if (el) el.textContent = `${Math.round(val)}%`;
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
function initHostTable() { renderHostTable(); }

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
          <span style="font-size:11px;min-width:36px;text-align:right;font-variant-numeric:tabular-nums">${fmt(h.cpu)}%</span>
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
      <div class="alert-item-meta" style="margin-top:4px;font-family:var(--font-mono);color:var(--accent-primary);font-size:10px">${a.metric}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
        <div class="alert-item-meta">${mins}m ago</div>
        <button onclick="silenceFromDrawer(${a.id})" style="font-size:10px;font-weight:600;padding:2px 8px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;cursor:pointer;color:#475569">Silence</button>
      </div>
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

    setStatVal('cpuVal', vals.cpu, '%');
    setStatVal('memVal', vals.memory, 'GB');
    setStatVal('reqVal', vals.requests, 'K/s');
    setStatVal('latVal', Math.round(vals.latency), 'ms');
    setStatVal('errVal', vals.errors, '%');

    updateSparkline(charts.sparkCpu, MetricsEngine.getSeries('cpu', 30));
    updateSparkline(charts.sparkMem, MetricsEngine.getSeries('memory', 30));
    updateSparkline(charts.sparkReq, MetricsEngine.getSeries('requests', 30));
    updateSparkline(charts.sparkLat, MetricsEngine.getSeries('latency', 30));
    updateSparkline(charts.sparkErr, MetricsEngine.getSeries('errors', 30));

    GXCharts.appendMulti(charts.main, [vals.cpu, vals.memory, vals.netIn], label);
    GXCharts.appendPoint(charts.req, 'requests', vals.requests, label);
    GXCharts.appendPoint(charts.err, 'errors', vals.errors, label);
    GXCharts.appendMulti(charts.net, [vals.netIn, vals.netOut], label);

    if (_tickCount % 5 === 0) updateDiskGauge(MetricsEngine.getValue('disk'));
    if (_tickCount % 3 === 0) renderHostTable();
    if (_tickCount % 45 === 0 && MetricsEngine.getValue('cpu') > 88) {
      toast(`CPU spike: ${fmt(MetricsEngine.getValue('cpu'))}%`, 'error');
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
  const color = pct > 0.85 ? GXCharts.COLORS.red : pct > 0.70 ? GXCharts.COLORS.amber : (GXCharts.COLORS.blue || '#2563eb');
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
    if (charts.heat) charts.heat.redraw?.();
  }, 350);
}

function setRange(r) {
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  toast(`Time range: ${r}`, 'info', 1500);
}

function refreshAll() {
  MetricsEngine.init();
  if (charts.main) { charts.main.destroy(); charts.main = null; }
  if (charts.req)  { charts.req.destroy();  charts.req  = null; }
  if (charts.err)  { charts.err.destroy();  charts.err  = null; }
  if (charts.net)  { charts.net.destroy();  charts.net  = null; }
  initMainChart();
  initRequestChart();
  initErrorChart();
  initNetChart();
  initHeatmap();
  renderHostTable();
  toast('Dashboard refreshed', 'success', 1800);
}

function saveDashboard() {
  const layout = { panels: ['main','req','disk','err','heat','net','top'], savedAt: new Date().toISOString() };
  localStorage.setItem('gx_dashboard', JSON.stringify(layout));
  toast('Dashboard saved ✓', 'success', 2000);
}

function togglePanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  const isExpanded = panel.classList.contains('span-3');
  document.querySelectorAll('.chart-card').forEach(c => {
    c.classList.remove('span-3');
    c.style.display = '';
  });
  if (!isExpanded) {
    panel.classList.add('span-3');
    document.querySelectorAll('.chart-card').forEach(c => {
      if (c.id !== id) c.style.display = 'none';
    });
  }
  setTimeout(() => Object.values(charts).forEach(c => { if (c && c.resize) c.resize(); }), 100);
}

function openAddPanel() {
  document.getElementById('addPanelModal').classList.add('open');
}
function closeAddPanel() {
  document.getElementById('addPanelModal').classList.remove('open');
}

let selectedPanelType = 'line';
function addPanel(type) {
  selectedPanelType = type;
  document.querySelectorAll('.panel-type').forEach(p => {
    p.style.borderColor = '';
    p.style.color = '';
    p.style.background = '';
  });
  if (event && event.currentTarget) {
    event.currentTarget.style.borderColor = '#2563eb';
    event.currentTarget.style.color = '#2563eb';
    event.currentTarget.style.background = 'rgba(37,99,235,0.06)';
  }
}

function confirmAddPanel() {
  const title = document.getElementById('panelTitle').value || 'New Panel';
  closeAddPanel();
  toast(`Panel "${title}" added`, 'success');
  document.getElementById('panelQuery').value = '';
  document.getElementById('panelTitle').value = '';
}

/* ── Alert drawer ────────────────────────────────────────── */
let alertDrawerOpen = false;

function toggleAlertDrawer() {
  alertDrawerOpen = !alertDrawerOpen;
  const drawer = document.getElementById('alertDrawer');
  if (drawer) drawer.classList.toggle('open', alertDrawerOpen);
}

function closeAlertDrawer() {
  alertDrawerOpen = false;
  const drawer = document.getElementById('alertDrawer');
  if (drawer) drawer.classList.remove('open');
}

function silenceFromDrawer(id) {
  toast('Alert silenced for 1 hour', 'info');
}

/* ── User menu ───────────────────────────────────────────── */
let userMenuOpen = false;

function toggleUserMenu() {
  userMenuOpen = !userMenuOpen;
  const menu = document.getElementById('userMenu');
  if (menu) menu.style.display = userMenuOpen ? 'block' : 'none';
}

function handleSignOut() {
  sessionStorage.removeItem('gx_user');
  toast('Signed out successfully', 'success', 1500);
  setTimeout(() => { window.location.href = 'login.html'; }, 1600);
}

/* ── Load dashboard preset ───────────────────────────────── */
function loadDashboard(name) {
  toast(`Loading "${name}" dashboard…`, 'info', 2000);
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
}

/* ── Keyboard shortcuts ──────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAddPanel();
    closeAlertDrawer();
    userMenuOpen = false;
    const menu = document.getElementById('userMenu');
    if (menu) menu.style.display = 'none';
  }
  if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (e.key === 'r' && !e.ctrlKey && !e.metaKey) refreshAll();
  if (e.key === 'a' && !e.ctrlKey && !e.metaKey) toggleAlertDrawer();
  if (e.key === 's' && !e.ctrlKey && !e.metaKey) saveDashboard();
});

/* Close menus on outside click */
document.addEventListener('click', e => {
  const wrap = e.target.closest('.user-menu-wrap');
  if (!wrap && userMenuOpen) {
    userMenuOpen = false;
    const menu = document.getElementById('userMenu');
    if (menu) menu.style.display = 'none';
  }
});

/* ── Sidebar search ──────────────────────────────────────── */
const sidebarSearch = document.getElementById('sidebarSearch');
if (sidebarSearch) {
  sidebarSearch.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.nav-item').forEach(item => {
      item.style.display = !q || item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}
