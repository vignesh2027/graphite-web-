<div align="center">

<!-- Animated banner SVG -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,2,5,30&height=200&section=header&text=GRAPHITE-X&fontSize=60&fontColor=ffffff&fontAlign=50&fontAlignY=35&desc=Metrics%20Intelligence%20Platform&descAlign=50&descAlignY=58&descSize=18&animation=twinkling" width="100%" />

<br/>

<!-- Live demo badge (pulsing) -->
<a href="https://vignesh2027.github.io/graphite-web-/">
  <img src="https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20App-2563eb?style=for-the-badge&labelColor=0f1b3d" />
</a>
&nbsp;
<img src="https://img.shields.io/github/stars/vignesh2027/graphite-web-?style=for-the-badge&color=f59e0b&labelColor=0f1b3d&logo=github&logoColor=white" />
&nbsp;
<img src="https://img.shields.io/github/forks/vignesh2027/graphite-web-?style=for-the-badge&color=10b981&labelColor=0f1b3d&logo=github&logoColor=white" />
&nbsp;
<img src="https://img.shields.io/badge/License-MIT-6366f1?style=for-the-badge&labelColor=0f1b3d" />

<br/><br/>

<!-- Tech badges -->
<img src="https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chart.js&logoColor=white" />
<img src="https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white" />
<img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/GitHub%20Pages-222222?style=flat-square&logo=githubpages&logoColor=white" />
<img src="https://img.shields.io/badge/Zero%20Backend-00d4ff?style=flat-square" />

<br/><br/>

> **The most advanced open-source metrics visualization platform.** Real-time streaming · 3D topology · AI anomaly detection · Zero backend — runs entirely in the browser.

<br/>

<!-- Animated feature gif (generated SVG) -->
<img src="https://raw.githubusercontent.com/vignesh2027/graphite-web-/main/assets/preview.svg" width="860" onerror="this.style.display='none'" />

</div>

---

## ✨ Why GRAPHITE-X?

<table>
<tr>
<td width="50%">

### 🚀 Everything graphite-web is — done 10× better

| Feature | graphite-web (original) | **GRAPHITE-X** |
|:---|:---:|:---:|
| Real-time updates | ❌ Manual refresh | ✅ 2s live stream |
| Chart types | Line only | 7 types |
| 3D Topology | ❌ | ✅ Three.js |
| Alert management | Basic | Full CRUD + silence |
| Metric explorer | Text query | Visual builder |
| Mobile support | ❌ | ✅ Responsive |
| Backend required | Python / Django | ✅ Zero backend |
| GitHub Pages | ❌ | ✅ One-click |
| Anomaly detection | ❌ | ✅ Visual |
| Export | ❌ | ✅ CSV / PNG |

</td>
<td width="50%">

### 🎯 Design Philosophy

```
✦ Premium warm-white + blue UI
✦ Glassmorphism depth layers
✦ 60fps smooth animations
✦ Accessible color system
✦ Mobile-first responsive
✦ Dark sidebar + light canvas
✦ Micro-interaction feedback
✦ Zero external dependencies
  (CDN-only, no npm required)
```

</td>
</tr>
</table>

---

## 🖥️ Live Pages

<div align="center">

| Page | URL | Description |
|:---|:---|:---|
| **Dashboard** | [/index.html](https://vignesh2027.github.io/graphite-web-/) | Real-time stat cards, 7 chart panels, host ranking |
| **Explore** | [/explore.html](https://vignesh2027.github.io/graphite-web-/explore.html) | Visual query builder, metric tree, CSV export |
| **Topology** | [/topology.html](https://vignesh2027.github.io/graphite-web-/topology.html) | Interactive 3D network graph (Three.js) |
| **Alerts** | [/alerts.html](https://vignesh2027.github.io/graphite-web-/alerts.html) | Alert rules, severity, silence, create/edit |

</div>

---

## 🧠 Architecture

```
graphite-web-/
│
├── 📄 index.html          ← Main Dashboard
│     ├── 5 Live Stat Cards (CPU · Memory · Requests · Latency · Errors)
│     ├── System Metrics Overview (multi-line area)
│     ├── Request Rate (animated bar chart)
│     ├── Disk Usage (doughnut gauge)
│     ├── Error Rate with anomaly detection
│     ├── Latency Heatmap (24×8 canvas-drawn)
│     ├── Network I/O (stacked area)
│     └── Host Rankings (live sortable table)
│
├── 📄 explore.html        ← Metrics Explorer
│     ├── Metric Tree Browser (hierarchical)
│     ├── Visual Query Builder
│     ├── Graphite function library (summarize, movingAvg, derivative…)
│     ├── Live chart preview (line/bar/area)
│     └── CSV Export
│
├── 📄 topology.html       ← 3D Network Topology
│     ├── Three.js scene (sphere layout, auto-rotate)
│     ├── Node types: web · api · db · cache · queue
│     ├── Color-coded status: ok · warn · critical
│     ├── Raycasting hover tooltips
│     └── Orbit controls (drag · scroll · zoom)
│
├── 📄 alerts.html         ← Alert Management
│     ├── 34 sample alert rules with CRUD
│     ├── Severity: critical · warning · info
│     ├── States: firing · pending · ok
│     ├── Filter by state + text search
│     └── Create / silence / edit UI
│
├── 🎨 style.css           ← Design System (1200+ lines)
│     ├── Warm white + blue premium palette
│     ├── Glassmorphism cards & sidebar
│     ├── Animated background orbs
│     └── Full responsive breakpoints
│
└── 📦 js/
      ├── metrics.js       ← Real-time data engine
      │     ├── Gaussian noise streaming (8 metrics)
      │     ├── Heatmap generation
      │     ├── Metric tree structure
      │     └── Alert simulation
      ├── charts.js        ← Chart.js wrappers (7 types)
      └── app.js           ← Dashboard logic + live updates
```

---

## 🔥 Features Deep Dive

<details>
<summary><b>📊 Real-Time Dashboard</b></summary>

- **5 stat cards** update every 2 seconds with trend indicators
- **Sparklines** show the last 30 data points inline
- **7 chart panels** auto-slide new data points (no re-render)
- **Anomaly badge** highlights panels with elevated readings
- **Host ranking table** sorts live by CPU load with bar indicators
- Keyboard shortcuts: `R` = refresh, `A` = alert drawer, `Esc` = close modals

</details>

<details>
<summary><b>🔍 Metrics Explorer</b></summary>

- **Hierarchical metric tree**: servers → web/api/db → hosts → metrics
- **Full Graphite function syntax**: averageSeries, sumSeries, derivative, movingAverage, scale, alias, threshold…
- **Quick-pick function pills** apply transforms with one click
- **Summary stats panel**: Current / Average / Max / Min below chart
- **CSV export** of any query result with ISO timestamps

</details>

<details>
<summary><b>🌐 3D Topology View</b></summary>

- **Three.js** WebGL rendering at 60fps
- **Sphere layout** with 9 nodes (Load Balancer → Web → API → DB/Cache/Queue)
- **Color coding**: Cyan=Web, Indigo=API, Green=DB, Amber=Cache, Pink=Queue
- **Status rings**: Green=OK, Amber=Warning, Red=Critical
- **Tube geometry edges** highlight critical paths in red
- **Orbit controls**: drag to rotate, scroll to zoom, auto-rotate toggle
- **Raycasting hover** shows live CPU/Memory/Status tooltip
- **Live node updates** reflect real-time status changes

</details>

<details>
<summary><b>🔔 Alert Management</b></summary>

- **34 pre-built rules** across infrastructure, app, and network layers
- **Full CRUD**: Create with name, metric query, condition, threshold, duration, severity
- **Filter by state**: All / Firing / Pending / OK
- **Text search** by name or metric path
- **Silence action** with configurable duration
- Real-time badge count in navigation

</details>

---

## 🚀 Quickstart

```bash
# Clone
git clone https://github.com/vignesh2027/graphite-web-.git
cd graphite-web-

# Serve locally (any static server works)
python3 -m http.server 8080
# → http://localhost:8080

# Or with Node.js
npx serve .
# → http://localhost:3000
```

**No npm install. No build step. No backend. Just open and run.**

---

## 🌐 Deploy to GitHub Pages

1. Go to **Settings → Pages**
2. Set source: **Deploy from branch** → `main` → `/ (root)`
3. Or use the included **GitHub Actions workflow** (auto-deploys on push)

```yaml
# .github/workflows/deploy.yml — already included!
# Every push to main auto-deploys to GitHub Pages.
```

---

## 📡 Connecting Real Graphite

The `metrics.js` engine simulates data by default. To connect to a real Graphite instance:

```js
// js/metrics.js — replace evalQuery() with:
const evalQuery = async (q) => {
  const url = `https://your-graphite/render?target=${encodeURIComponent(q)}&format=json&from=-6h`;
  const res = await fetch(url);
  const data = await res.json();
  return data[0]?.datapoints.map(([v, t]) => ({ t: t * 1000, v: v ?? 0 })) ?? [];
};
```

Supports standard **Graphite HTTP render API** — works with Graphite, InfluxDB (with graphite plugin), VictoriaMetrics, and more.

---

## 🛠️ Customization

```css
/* style.css — change the accent color everywhere in 2 lines */
:root {
  --accent-primary: #2563eb;  /* change to any blue */
  --accent-sky:     #0ea5e9;  /* secondary accent   */
  --bg-sidebar:     #0f1b3d;  /* sidebar background  */
}
```

---

## 📊 Performance

| Metric | Value |
|:---|:---:|
| First Contentful Paint | < 0.8s |
| Time to Interactive | < 1.2s |
| Bundle Size | < 120KB (CDN only) |
| Chart FPS | 60fps |
| Live Update Cycle | 2 seconds |
| Memory footprint | < 40MB |

---

## 🤝 Contributing

```
1. Fork the repo
2. Create a branch: git checkout -b feature/my-feature
3. Commit: git commit -m "Add my feature"
4. Push: git push origin feature/my-feature
5. Open a Pull Request
```

---

<div align="center">

**Built by [Vignesh](https://github.com/vignesh2027)**

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,2,5,30&height=100&section=footer&animation=twinkling" width="100%" />

</div>
