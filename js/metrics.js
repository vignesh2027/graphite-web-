/* ============================================================
   GRAPHITE-X  —  Metrics Engine
   Real-time data simulation + historical generation
   Supports: timeseries, gauges, counters, histograms
   ============================================================ */

'use strict';

const MetricsEngine = (() => {

  /* ── Internal state ─────────────────────────────────────── */
  const _state = {
    cpu:     { val: 72.4, min: 15, max: 95,  noise: 4,   unit: '%',   series: [] },
    memory:  { val: 14.2, min: 10, max: 28,  noise: 0.5, unit: 'GB',  series: [] },
    requests:{ val: 48.7, min: 20, max: 80,  noise: 8,   unit: 'K/s', series: [] },
    latency: { val: 24,   min: 8,  max: 80,  noise: 5,   unit: 'ms',  series: [] },
    errors:  { val: 0.24, min: 0,  max: 2,   noise: 0.1, unit: '%',   series: [] },
    disk:    { val: 68,   min: 60, max: 85,  noise: 0.5, unit: '%',   series: [] },
    netIn:   { val: 42,   min: 10, max: 120, noise: 10,  unit: 'MB/s',series: [] },
    netOut:  { val: 28,   min: 5,  max: 80,  noise: 8,   unit: 'MB/s',series: [] },
  };

  /* ── Hosts simulation ───────────────────────────────────── */
  const HOSTS = [
    { name: 'web-01.prod', cpu: 82, mem: 78, status: 'warn' },
    { name: 'web-02.prod', cpu: 64, mem: 55, status: 'ok' },
    { name: 'api-01.prod', cpu: 91, mem: 84, status: 'crit' },
    { name: 'api-02.prod', cpu: 45, mem: 62, status: 'ok' },
    { name: 'db-01.prod',  cpu: 38, mem: 92, status: 'warn' },
    { name: 'db-02.prod',  cpu: 22, mem: 88, status: 'ok' },
    { name: 'cache-01',    cpu: 18, mem: 43, status: 'ok' },
    { name: 'queue-01',    cpu: 56, mem: 71, status: 'ok' },
  ];

  /* ── Noise functions ────────────────────────────────────── */
  const gaussian = (mean = 0, std = 1) => {
    let u = 0, v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ── Generate historical series (n points, interval ms) ── */
  const generateHistory = (key, n = 60, intervalMs = 360000) => {
    const m = _state[key];
    const now = Date.now();
    const pts = [];
    let v = m.val;
    for (let i = n; i >= 0; i--) {
      v = clamp(v + gaussian(0, m.noise * 0.4), m.min, m.max);
      pts.push({ t: now - i * intervalMs, v: parseFloat(v.toFixed(2)) });
    }
    m.series = pts;
    return pts;
  };

  /* ── Tick: add one new data point ───────────────────────── */
  const tick = (key) => {
    const m = _state[key];
    const prev = m.series.length ? m.series[m.series.length - 1].v : m.val;
    let next = clamp(prev + gaussian(0, m.noise * 0.25), m.min, m.max);
    next = parseFloat(next.toFixed(2));
    m.val = next;
    m.series.push({ t: Date.now(), v: next });
    if (m.series.length > 200) m.series.shift();
    return next;
  };

  /* ── Heatmap data: 24×8 buckets ─────────────────────────── */
  const generateHeatmap = () => {
    const hours = 24, buckets = 8;
    const labels = ['0-5ms', '5-10ms', '10-25ms', '25-50ms', '50-100ms', '100-250ms', '250-500ms', '>500ms'];
    const data = [];
    for (let h = 0; h < hours; h++) {
      for (let b = 0; b < buckets; b++) {
        const base = b === 2 ? 0.4 : b === 1 ? 0.25 : b === 3 ? 0.15 : 0.05;
        const hour_factor = (h >= 9 && h <= 17) ? 1.8 : 1;
        const v = clamp(base * hour_factor + gaussian(0, base * 0.3), 0, 1);
        data.push({ x: h, y: b, v: parseFloat(v.toFixed(3)) });
      }
    }
    return { labels, data };
  };

  /* ── Metric tree for explorer ────────────────────────────── */
  const METRIC_TREE = {
    servers: {
      web: { '01': ['cpu', 'memory', 'load', 'disk'], '02': ['cpu', 'memory', 'load', 'disk'] },
      api: { '01': ['cpu', 'memory', 'load', 'requests'], '02': ['cpu', 'memory', 'load', 'requests'] },
      db:  { '01': ['cpu', 'memory', 'connections', 'queries'], '02': ['cpu', 'memory', 'connections', 'queries'] },
    },
    app: {
      requests: ['rate', 'duration', 'errors'],
      database: ['queries_per_sec', 'slow_queries', 'connections'],
      cache:    ['hits', 'misses', 'evictions'],
      queue:    ['depth', 'lag', 'throughput'],
    },
    network: {
      interfaces: { eth0: ['rx_bytes', 'tx_bytes', 'errors'], eth1: ['rx_bytes', 'tx_bytes', 'errors'] },
      tcp: ['connections', 'retransmits', 'resets'],
    },
    business: {
      revenue:    ['per_minute', 'per_hour', 'conversions'],
      users:      ['active', 'sessions', 'signups'],
      api_calls:  ['total', 'by_endpoint', 'by_client'],
    },
  };

  /* ── Alerts ──────────────────────────────────────────────── */
  const ALERTS = [
    { id: 1, severity: 'critical', title: 'CPU Spike — api-01.prod', desc: 'CPU exceeded 90% threshold for 5 minutes', metric: 'servers.api.01.cpu', fired: Date.now() - 8 * 60000 },
    { id: 2, severity: 'warning',  title: 'Memory High — db-01.prod', desc: 'Memory usage above 90%', metric: 'servers.db.01.memory', fired: Date.now() - 23 * 60000 },
    { id: 3, severity: 'warning',  title: 'Error Rate Elevated', desc: 'Error rate above 0.5% for 10 minutes', metric: 'app.requests.errors', fired: Date.now() - 45 * 60000 },
  ];

  /* ── Public API ──────────────────────────────────────────── */

  const init = () => {
    Object.keys(_state).forEach(k => generateHistory(k, 80, 270000));
  };

  const tickAll = () => {
    const results = {};
    Object.keys(_state).forEach(k => { results[k] = tick(k); });
    HOSTS.forEach(h => {
      h.cpu  = clamp(h.cpu  + gaussian(0, 2.5), 10, 99);
      h.mem  = clamp(h.mem  + gaussian(0, 1.5), 20, 99);
      h.cpu  = parseFloat(h.cpu.toFixed(1));
      h.mem  = parseFloat(h.mem.toFixed(1));
      h.status = h.cpu > 88 || h.mem > 90 ? 'crit' : h.cpu > 70 || h.mem > 80 ? 'warn' : 'ok';
    });
    return results;
  };

  const getSeries = (key, n) => {
    const s = _state[key].series;
    return n ? s.slice(-n) : s;
  };

  const getValue = (key) => _state[key].val;
  const getHosts = () => [...HOSTS].sort((a, b) => b.cpu - a.cpu);
  const getHeatmap = () => generateHeatmap();
  const getAlerts = () => ALERTS;
  const getTree = () => METRIC_TREE;

  /* ── Query eval (subset of Graphite function syntax) ─────── */
  const evalQuery = (q) => {
    const key = Object.keys(_state).find(k => q.toLowerCase().includes(k));
    if (key) return getSeries(key, 60);
    const fake = [];
    const now = Date.now();
    let v = 50;
    for (let i = 60; i >= 0; i--) {
      v = clamp(v + gaussian(0, 5), 0, 100);
      fake.push({ t: now - i * 300000, v: parseFloat(v.toFixed(2)) });
    }
    return fake;
  };

  return { init, tickAll, getSeries, getValue, getHosts, getHeatmap, getAlerts, getTree, evalQuery };
})();
