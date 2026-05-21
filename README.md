# GRAPHITE-X — Metrics Intelligence Platform

> A dramatically superior, modern reimagination of graphite-web — real-time metrics visualization with AI-powered anomaly detection, 3D topology, and a stunning glassmorphism UI.

## Features

| Feature | GRAPHITE-X | Original graphite-web |
|---|---|---|
| UI | Glassmorphism dark theme, animated | Legacy Django template |
| Real-time updates | 2-second live streaming | Manual refresh |
| 3D Topology | Three.js interactive network graph | None |
| Chart types | Line, Area, Bar, Heatmap, Gauge, Stacked | Line only |
| Alert management | Full CRUD + severity + silence | Minimal |
| Metric explorer | Visual query builder + tree browser | Text query box |
| Deployment | GitHub Pages (static) | Python/Django server |
| Mobile | Fully responsive | Not responsive |

## Pages

- **Dashboard** (`index.html`) — Live stat cards, multi-metric charts, host ranking table, heatmap
- **Explore** (`explore.html`) — Metric tree browser, visual query builder, export to CSV
- **Topology** (`topology.html`) — 3D interactive network graph with live status (Three.js)
- **Alerts** (`alerts.html`) — Alert rule management, filtering, create/silence rules

## Tech Stack

- **Charts**: Chart.js 4.4
- **3D Topology**: Three.js 0.160
- **Design**: Pure CSS glassmorphism — no frameworks
- **Data**: In-browser real-time simulation engine (`js/metrics.js`)
- **Deployment**: GitHub Pages (zero-backend static app)

## Running Locally

```bash
# Any static file server works:
python3 -m http.server 8080
# Open http://localhost:8080
```

## Architecture

```
graphite-web-/
├── index.html          # Main dashboard
├── explore.html        # Metrics explorer
├── alerts.html         # Alert management
├── topology.html       # 3D network topology
├── style.css           # Design system (glassmorphism)
└── js/
    ├── metrics.js      # Real-time data engine
    ├── charts.js       # Chart.js wrappers
    └── app.js          # Dashboard logic & live updates
```

## Live Demo

Deployed at: **https://vignesh2027.github.io/graphite-web-**
