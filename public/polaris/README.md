# 🧊 POLARIS — Indian Antarctic Remote Operations Portal

> **Hackathon Build** | India's unified remote operations web portal for Maitri & Bharati Antarctic Research Stations

---

## 🚀 Quick Start

Simply open **`polaris/index.html`** in any modern browser.

```
S:\Nexus_Hackthon\polaris\index.html
```

No build step. No server needed. Pure HTML + CSS + JS.

---

## 🗺️ Four-Page Architecture

| Page | Route | Description |
|------|-------|-------------|
| **Overview** | `/overview` | National view — Antarctica map, both stations, fleet, weather, event timeline |
| **Command Control** | `/command` | Cross-station comparison grid, incidents, telemetry charts |
| **Maitri** | `/maitri` | Station digital twin, inspector panel, telemetry, crew |
| **Bharati** | `/bharati` | Station digital twin, inspector panel, telemetry, crew |

---

## 🎬 Demo Mode — 2-Minute Judge Flow

Press **Ctrl+D** or click **🎬 Demo** button (top right):

1. **Overview** → Show both stations on animated Antarctic map with live SATCOM arc
2. **Command Control** → Cross-station health comparison
3. **🎬 Generator Degradation** → Bharati Gen02 vibration alert, digital twin highlights zone
4. **Ask AIRA** → Evidence-based AI explanation with bearing wear analysis
5. **🎬 Blizzard Risk** → Wind 52kt, field team recall recommendation
6. **🎬 SATCOM Outage** → Red banner, SATCOM LOST, local autonomous mode activates
7. **Restore SATCOM** → Watch queued telemetry sync counter
8. **Command Control** → Incidents resolving, health scores recovering

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+D` | Toggle Demo Mode Panel |
| `Ctrl+A` | Toggle AIRA Panel |
| `Alt+1` | Overview page |
| `Alt+2` | Command Control page |
| `Alt+3` | Maitri page |
| `Alt+4` | Bharati page |
| `Escape` | Close panels |

---

## 🤖 AIRA — AI Assistant Queries

Type in the AIRA panel (bottom left) or use quick prompts:

- *"Why is Generator 02 vibrating?"* → Full bearing wear analysis
- *"Station health summary"* → Both stations overview
- *"Field team safety status?"* → Current field operations
- *"Predictive maintenance alerts"* → Maintenance priority list
- *"Fuel endurance situation"* → Maitri fuel risk assessment

---

## 📡 Live Simulation Features

- **Telemetry updates every 2 seconds** — realistic sensor jitter
- **Antarctica canvas** — animated SATCOM satellite arc with moving data packet
- **Station Health Rings** — animated donut gauges (weighted scoring)
- **Digital Twins** — 2.5D isometric station layout with clickable zones
- **Alert Engine** — rules-based alerting (not random animations)
- **Event Timeline** — live-updating mission log

---

## 🏗️ Station Health Score (per spec)

| Domain | Weight | Inputs |
|--------|--------|--------|
| Power | 25% | Generator health, load, anomalies |
| Life Support | 20% | Water, heating/HVAC |
| Communications | 15% | Link, latency, packet loss |
| Fuel/Resources | 15% | Endurance, consumption rate |
| Weather/Field Risk | 10% | Wind, visibility, exposure |
| Maintenance | 10% | Open work orders, degradation |
| Science | 5% | Instrument uptime |

---

## 🏔️ Station Data

### Maitri Research Station
- **Location:** 70°45'S, 11°44'E — Queen Maud Land
- **Established:** 1989
- **Crew:** 18 personnel
- **Current Health:** 87/100

### ❄️ Bharati Research Station  
- **Location:** 69°24'S, 76°11'E — Larsemann Hills
- **Established:** 2012
- **Crew:** 16 personnel
- **Current Health:** 92/100

---

## 📁 File Structure

```
polaris/
├── index.html   — Full portal markup (4 pages, all panels)
├── style.css    — Design system (~44KB) — dark Antarctic theme
└── app.js       — Application engine (~71KB) — telemetry, canvas, AIRA
```

---

## ✅ Acceptance Criteria Status

- [x] All four routes work
- [x] Maitri and Bharati visually and operationally distinct
- [x] 6+ live telemetry categories updating
- [x] 5+ alert rules active (vibration, fuel, wind, temp, comms)
- [x] Predictive maintenance demo (Gen02 bearing wear with MTBF estimate)
- [x] AIRA explains live state using telemetry data
- [x] SATCOM outage + autonomous mode + resync working
- [x] Responsive design (desktop/tablet/mobile)
- [x] No console-breaking errors
- [x] Digital twin with clickable subsystem zones
- [x] Station health score engine
- [x] Event timeline with filtering
- [x] Demo mode with predefined scenarios

---

*Built for NCAOR Nexus Hackathon — POLARIS v1.0*
