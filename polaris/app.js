/* ============================================================
   POLARIS — Antarctic Operations Portal
   Application Logic — Data Engine, Simulation, Rendering
   ============================================================ */

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };
}

'use strict';

// ============================================================
// STATE
// ============================================================
const STATE = {
  currentPage: 'overview',
  satcomOnline: true,
  satcomLostAt: null,
  queuedMB: 0,
  scenario: 'normal',
  maitri: {
    health: 87,
    score: { power: 25*0.92, life: 20*0.88, comms: 15*0.78, fuel: 15*0.63, maintenance: 10*0.55, science: 5*0.89, weather: 10*0.80 },
    power: 380, powerPct: 92,
    temp: -24, windKt: 28, visKm: 8.2,
    gen1: { load: 88, fuel: 63, temp: 76, rpm: 1500, status: 'ok' },
    gen2: { load: 72, fuel: 63, temp: 74, rpm: 1498, status: 'ok' },
    o2: 20.9, co2: 0.04, hvacTemp: 21,
    water: 76, waterDaily: 340,
    latency: 620, bandwidth: 2.4, packetLoss: 1.2,
    fuel: 63, fuelEndurance: 84,
    crew: 18, alerts: 1,
    selectedSubsystem: 'power',
    twinAngle: 0,
    twinSelected: null
  },
  bharati: {
    health: 92,
    score: { power: 25*0.96, life: 20*0.94, comms: 15*0.91, fuel: 15*0.77, maintenance: 10*0.82, science: 5*1.0, weather: 10*0.90 },
    power: 420, powerPct: 96,
    temp: -18, windKt: 15, visKm: 12.4,
    gen1: { load: 92, fuel: 77, temp: 78, rpm: 1500, status: 'ok' },
    gen2: { load: 85, fuel: 77, temp: 89, rpm: 1500, vibration: 18.4, status: 'warn' },
    o2: 20.9, co2: 0.03, hvacTemp: 22,
    water: 88, waterDaily: 310,
    latency: 480, bandwidth: 3.1, packetLoss: 0.4,
    fuel: 77, fuelEndurance: 102,
    crew: 16, alerts: 0,
    selectedSubsystem: 'power',
    twinAngle: 0,
    twinSelected: null
  },
  activeAlerts: [],
  timeline: [],
  airaOpen: true,
  alertDrawerOpen: false,
  demoPanelOpen: false,
  tickCount: 0,
  chartData: {
    power: { maitri: [], bharati: [], labels: [] },
    temp: { maitri: [], bharati: [], labels: [] },
    latency: { maitri: [], bharati: [], labels: [] }
  }
};

// ============================================================
// AIRA KNOWLEDGE BASE
// ============================================================
const AIRA_KB = {
  generator: {
    q: ['generator', 'vibration', 'gen02', 'bearing'],
    a: `**Generator 02 — Bearing Wear Analysis**\n\nCurrent vibration: **18.4 mm/s** (threshold: 15 mm/s ⚠️)\n\n📊 **Evidence:**\n• Vibration has increased 22% over 48h\n• Spectral peak at 48.3 Hz → bearing outer race defect signature\n• Oil temperature elevated (+4°C vs baseline)\n• Fuel consumption up 6%\n\n🔮 **Prediction:** At current degradation rate, bearing failure probable in **68–74 hours**.\n\n✅ **Recommended Actions:**\n1. Schedule bearing replacement within 48h\n2. Reduce Gen02 load to 70% — switch to Gen01 primary\n3. Prep spare bearing kit (Inventory: Bay-C, Shelf-3)\n4. Post inspection work order INC-2024-0892`
  },
  fuel: {
    q: ['fuel', 'hsd', 'endurance', 'reserve'],
    a: `**Maitri Fuel Status Assessment**\n\nCurrent HSD reserve: **63%** (84 days endurance)\n\n📊 **Consumption trend:**\n• Baseline: 3,800L/day\n• Current: 4,020L/day (+5.8% — heating load increase)\n• Blizzard scenario peak: ~5,500L/day\n\n⚠️ **Risk Window:** If D+2 blizzard materializes (72h forecast), endurance drops to ~71 days.\n\nMV Nataraj ETA: **D+12** with 80,000L HSD\n\n✅ **Recommended Actions:**\n1. Reduce auxiliary heating by 8% (modules C/D)\n2. Pre-position 5,000L emergency reserve in Tank-2\n3. Confirm Nataraj cargo manifest for fuel priority`
  },
  health: {
    q: ['health', 'score', 'status', 'summary', 'overall'],
    a: `**Station Health Summary — ${new Date().toUTCString().slice(0,-3)} UTC**\n\n🏔️ **MAITRI — Score: 87/100**\n• Power: 92% ✅ | Life Support: 88% ✅\n• Comms: 78% ⚠️ (latency elevated)\n• Fuel: 63% ⚠️ (watch status)\n• Maintenance: 5 open WOs, 2 urgent\n\n❄️ **BHARATI — Score: 92/100**\n• Power: 96% ✅ | Life Support: 94% ✅\n• Comms: 91% ✅ | Fuel: 77% ✅\n• ⚠️ Gen02 vibration — active incident\n\n🌡️ **Mission Status:** NOMINAL with 2 open incidents`
  },
  maintenance: {
    q: ['maintenance', 'work order', 'predictive', 'mtbf', 'repair'],
    a: `**Predictive Maintenance Summary**\n\n🔴 **High Priority (Next 72h):**\n• Bharati Gen02 bearing — vibration anomaly detected\n\n🟡 **Medium Priority (Next 7d):**\n• Maitri HVAC Filter Bank-A — ΔP rising (replace at 250 Pa, now 218 Pa)\n• Maitri Water pump impeller — flow rate -8% over 2 weeks\n\n🟢 **Scheduled:**\n• Bharati CHP unit annual inspection — D+18\n• Both stations: monthly fire suppression check — D+5\n\n**5 open Maitri WOs | 2 open Bharati WOs**`
  },
  field: {
    q: ['field', 'team', 'crew', 'safety', 'personnel'],
    a: `**Field Team Status**\n\n🟡 **Snowcat SC-04 — IN FIELD (Monitoring)**\n• Team: Dr. Reddy (glaciology) + Tech Krishnan\n• Location: ~14km NW Maitri, Grid E7\n• Last check-in: 47min ago\n• Weather at location: 28kt winds, vis 6km\n• Return ETA: 15:30 UTC\n\n⚠️ **Wind Advisory:** Forecast 35kt+ gusts by 17:00 UTC. Recommend field team recall if departure delayed beyond 14:30 UTC.\n\n✅ All other crew at station — 34 personnel accounted for.`
  },
  default: {
    a: `I understand your query. Let me analyze the current telemetry from both stations.\n\n📡 **Live Data Snapshot (${new Date().toUTCString().slice(0,-3)} UTC):**\n• Maitri health: 87/100 | Bharati health: 92/100\n• Active incidents: 2 (Generator 02 vibration, Maitri fuel watch)\n• SATCOM: LIVE | Crew: 34 total\n\nFor specific analysis, ask me about:\n- Generator vibration (Bharati)\n- Fuel endurance (Maitri)\n- Field team safety\n- Predictive maintenance\n- Station health summary`
  }
};

// ============================================================
// CREW DATA
// ============================================================
const MAITRI_CREW = [
  { name: 'Dr. Suresh Mehta', role: 'Station Commander', status: 'on-duty', icon: '👨‍💼', vitals: { hr: 68, bp: '118/76', spo2: 98 } },
  { name: 'Dr. Priya Reddy', role: 'Glaciologist', status: 'field', icon: '👩‍🔬', vitals: { hr: 82, bp: '122/80', spo2: 97 } },
  { name: 'Eng. Rajan Pillai', role: 'Chief Engineer', status: 'on-duty', icon: '👨‍🔧', vitals: { hr: 72, bp: '126/82', spo2: 98 } },
  { name: 'Dr. Ananya Singh', role: 'Medical Officer', status: 'on-duty', icon: '👩‍⚕️', vitals: { hr: 65, bp: '110/70', spo2: 99 } },
  { name: 'Tech. Krishnan V', role: 'Field Technician', status: 'field', icon: '👨‍🔬', vitals: { hr: 85, bp: '128/84', spo2: 96 } },
  { name: 'Dr. Mohan Das', role: 'Atmospheric Sci', status: 'on-duty', icon: '👨‍🔬', vitals: { hr: 70, bp: '120/78', spo2: 98 } },
  { name: 'Sgt. Anil Kumar', role: 'Base Security', status: 'on-duty', icon: '👮‍♂️', vitals: { hr: 75, bp: '124/80', spo2: 98 } },
  { name: 'Tech. Lalita R', role: 'Comms Operator', status: 'on-duty', icon: '👩‍💻', vitals: { hr: 67, bp: '114/72', spo2: 98 } },
];

const BHARATI_CREW = [
  { name: 'Dr. Kavitha Nair', role: 'Station Director', status: 'on-duty', icon: '👩‍💼', vitals: { hr: 70, bp: '116/74', spo2: 99 } },
  { name: 'Eng. Dev Sharma', role: 'Power Engineer', status: 'on-duty', icon: '👨‍🔧', vitals: { hr: 74, bp: '122/80', spo2: 98 } },
  { name: 'Dr. Fatima Ali', role: 'Oceanographer', status: 'on-duty', icon: '👩‍🔬', vitals: { hr: 68, bp: '112/72', spo2: 98 } },
  { name: 'Tech. Roshan P', role: 'Instrumentation', status: 'on-duty', icon: '👨‍💻', vitals: { hr: 78, bp: '126/82', spo2: 97 } },
  { name: 'Dr. Leena Bose', role: 'Biologist', status: 'off-duty', icon: '👩‍🔬', vitals: { hr: 62, bp: '108/68', spo2: 98 } },
  { name: 'Tech. Amit Raj', role: 'Mechanical Tech', status: 'on-duty', icon: '👨‍🔧', vitals: { hr: 76, bp: '130/84', spo2: 97 } },
];

// ============================================================
// TIMELINE DATA (SEED)
// ============================================================
const SEED_TIMELINE = [
  { time: '10:42', station: 'bharati', type: 'alert', title: 'Generator 02 Vibration Alert', desc: 'Vibration at 18.4 mm/s exceeds threshold of 15 mm/s. Predictive bearing wear detected.' },
  { time: '10:15', station: 'maitri', type: 'system', title: 'SATCOM Link Quality Degraded', desc: 'Latency increased to 620ms. Packet loss 1.2%. Monitoring.' },
  { time: '09:50', station: 'maitri', type: 'crew', title: 'Field Team Departure — Glacier Survey', desc: 'Dr. Reddy + Tech. Krishnan departed on SC-04. Grid E7. Return 15:30 UTC.' },
  { time: '09:30', station: 'bharati', type: 'system', title: 'Science Instrument Calibration Complete', desc: 'All 6 instruments recalibrated. SeismographBH-01 data rate increased to 100sps.' },
  { time: '08:42', station: 'maitri', type: 'alert', title: 'Fuel Endurance Watch Activated', desc: 'HSD reserve at 63% — 84 days endurance. Resupply ETA D+12. Watch status maintained.' },
  { time: '07:00', station: 'system', type: 'system', title: 'Daily System Check — Nominal', desc: 'Both stations completed automated system check. All critical systems nominal.' },
  { time: '06:30', station: 'bharati', type: 'crew', title: 'Crew Shift Change', desc: 'Night crew handover completed. 16 personnel on station. All accounted for.' },
  { time: '00:00', station: 'system', type: 'system', title: 'Mission Day 847 Begins', desc: 'POLARIS portal synchronized. Mission clock updated.' },
];

// ============================================================
// DIGITAL TWIN SUBSYSTEM ZONES
// ============================================================
const MAITRI_ZONES = [
  { id: 'MainHabitat', label: 'Main Habitat', x: 80, y: 80, w: 220, h: 140, color: '#1a3050', accent: '#00d4ff', status: 'ok', subsystem: 'life' },
  { id: 'PowerZone', label: 'Power Zone (Gen)', x: 340, y: 80, w: 160, h: 100, color: '#1a2510', accent: '#22c55e', status: 'ok', subsystem: 'power' },
  { id: 'WaterZone', label: 'Water Treatment', x: 80, y: 260, w: 130, h: 90, color: '#101a30', accent: '#3b82f6', status: 'ok', subsystem: 'hvac' },
  { id: 'CommsAntenna', label: 'Comms & SATCOM', x: 360, y: 220, w: 120, h: 80, color: '#201020', accent: '#f59e0b', status: 'warn', subsystem: 'comms' },
  { id: 'Lab01', label: 'Science Lab-01', x: 250, y: 260, w: 130, h: 80, color: '#102030', accent: '#00f5cc', status: 'ok', subsystem: 'science' },
  { id: 'HVACUnit', label: 'HVAC / Heating', x: 500, y: 80, w: 80, h: 70, color: '#201818', accent: '#ef4444', status: 'ok', subsystem: 'hvac' },
];

const BHARATI_ZONES = [
  { id: 'MainModule', label: 'Main Module (Modular)', x: 80, y: 60, w: 240, h: 160, color: '#0a1530', accent: '#00d4ff', status: 'ok', subsystem: 'life' },
  { id: 'FuelFarm', label: 'Fuel Farm (HSD)', x: 360, y: 200, w: 140, h: 90, color: '#201a08', accent: '#f59e0b', status: 'ok', subsystem: 'fuel' },
  { id: 'CHP', label: 'CHP Plant', x: 360, y: 60, w: 140, h: 100, color: '#101520', accent: '#22c55e', status: 'ok', subsystem: 'power' },
  { id: 'Generator02', label: 'Generator 02 ⚠️', x: 540, y: 60, w: 120, h: 80, color: '#2a1a08', accent: '#f97316', status: 'warn', subsystem: 'power' },
  { id: 'WaterPlant', label: 'Water Plant', x: 80, y: 260, w: 120, h: 80, color: '#101828', accent: '#3b82f6', status: 'ok', subsystem: 'life' },
  { id: 'CommsStation', label: 'SATCOM Comms', x: 230, y: 260, w: 120, h: 80, color: '#201030', accent: '#a855f7', status: 'ok', subsystem: 'comms' },
  { id: 'Lab01B', label: 'Science Lab-01', x: 380, y: 320, w: 130, h: 60, color: '#102020', accent: '#00f5cc', status: 'ok', subsystem: 'science' },
];

// ============================================================
// NAVIGATION
// ============================================================
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.getElementById(`nav-${page}`).classList.add('active');
  STATE.currentPage = page;

  if (page === 'maitri') { renderMaitriTwin(); renderInspector('maitri'); renderTelemetryGrid('maitri'); renderCrewGrid('maitri'); }
  if (page === 'bharati') { renderBharatiTwin(); renderInspector('bharati'); renderTelemetryGrid('bharati'); renderCrewGrid('bharati'); }
  if (page === 'command') { renderCommandCharts(); }
}

// ============================================================
// UTC CLOCK
// ============================================================
function updateClock() {
  const now = new Date();
  const utc = now.toUTCString().replace(/.*?(\d{2}:\d{2}:\d{2}).*/, '$1');
  const el = document.getElementById('time-display');
  if (el) el.textContent = `${utc} UTC`;
  const initTime = document.getElementById('aira-init-time');
  if (initTime && initTime.textContent === '--:--') {
    initTime.textContent = utc.slice(0, 5);
  }
}

// ============================================================
// HEALTH SCORE CALCULATION
// ============================================================
function calcHealth(st) {
  const s = st.score;
  const v = Object.values(s).reduce((a, b) => a + b, 0);
  const max = 25 + 20 + 15 + 15 + 10 + 5 + 10;
  return Math.round((v / max) * 100);
}

function drawHealthRing(canvasId, score, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, r = 48;

  ctx.clearRect(0, 0, W, H);

  // BG ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Score arc
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (Math.PI * 2 * score / 100);
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, color);
  grad.addColorStop(1, lightenColor(color));
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function lightenColor(hex) {
  if (hex === '#FF9F0A' || hex === '#f59e0b') return '#FFD60A';
  if (hex === '#64D2FF' || hex === '#00d4ff') return '#30D158';
  return '#64D2FF';
}

// ============================================================
// ANTARCTICA MAP RENDERING
// ============================================================
function drawAntarcticaMap() {
  const canvas = document.getElementById('antarctica-canvas');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || 1100;
  canvas.height = 380;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Background
  const bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7);
  bgGrad.addColorStop(0, '#071830');
  bgGrad.addColorStop(1, '#040d1a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    const r = Math.random() * 1.2;
    const op = 0.2 + Math.random() * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${op})`;
    ctx.fill();
  }

  // Aurora Australis effect
  for (let i = 0; i < 5; i++) {
    const auroraGrad = ctx.createLinearGradient(0, H*0.1 + i*15, W, H*0.3 + i*15);
    auroraGrad.addColorStop(0, 'transparent');
    auroraGrad.addColorStop(0.3, `rgba(0,${200+i*10},${100+i*20},0.04)`);
    auroraGrad.addColorStop(0.7, `rgba(${i*20},255,${180+i*10},0.05)`);
    auroraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auroraGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // Antarctica continent silhouette (simplified polygon)
  ctx.beginPath();
  const pts = [
    [0.25*W, 0.80*H], [0.20*W, 0.65*H], [0.18*W, 0.48*H],
    [0.22*W, 0.38*H], [0.28*W, 0.32*H], [0.35*W, 0.30*H],
    [0.38*W, 0.25*H], [0.42*W, 0.22*H], [0.50*W, 0.20*H],
    [0.58*W, 0.22*H], [0.63*W, 0.28*H], [0.68*W, 0.30*H],
    [0.74*W, 0.32*H], [0.78*W, 0.38*H], [0.80*W, 0.48*H],
    [0.79*W, 0.58*H], [0.82*W, 0.65*H], [0.78*W, 0.78*H],
    [0.65*W, 0.85*H], [0.55*W, 0.90*H], [0.50*W, 0.92*H],
    [0.45*W, 0.90*H], [0.38*W, 0.86*H], [0.30*W, 0.84*H],
  ];
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts) ctx.lineTo(p[0], p[1]);
  ctx.closePath();
  const landGrad = ctx.createLinearGradient(W*0.25, H*0.2, W*0.80, H*0.9);
  landGrad.addColorStop(0, 'rgba(200,220,255,0.12)');
  landGrad.addColorStop(1, 'rgba(140,180,255,0.07)');
  ctx.fillStyle = landGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(180,220,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Ice shelf shimmer
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(W*0.5, H*0.56, 180 + i*30, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(0,212,255,${0.04 - i*0.005})`;
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  // South Pole marker
  ctx.beginPath();
  ctx.arc(W*0.50, H*0.56, 6, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '9px Inter, sans-serif';
  ctx.fillText('South Pole', W*0.50+10, H*0.56+4);

  // SATCOM arc between stations
  const maitriX = W * 0.37;
  const maitriY = H * 0.42;
  const bharatiX = W * 0.62;
  const bharatiY = H * 0.55;

  if (STATE.satcomOnline) {
    // Draw arc
    ctx.beginPath();
    ctx.moveTo(maitriX, maitriY);
    ctx.bezierCurveTo(maitriX + 60, maitriY - 60, bharatiX - 60, bharatiY - 60, bharatiX, bharatiY);
    ctx.strokeStyle = 'rgba(0,212,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated dot along arc
    const t = (Date.now() / 2000) % 1;
    const ax = cubicBezier(maitriX, maitriX+60, bharatiX-60, bharatiX, t);
    const ay = cubicBezier(maitriY, maitriY-60, bharatiY-60, bharatiY, t);
    ctx.beginPath();
    ctx.arc(ax, ay, 4, 0, Math.PI*2);
    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Satellite position (geosynchronous orbit arc representation)
  const satX = W * 0.50;
  const satY = H * 0.08;
  ctx.beginPath();
  ctx.arc(satX, satY, 8, 0, Math.PI*2);
  ctx.fillStyle = STATE.satcomOnline ? '#00d4ff' : '#ef4444';
  ctx.shadowColor = STATE.satcomOnline ? '#00d4ff' : '#ef4444';
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Satellite lines to stations
  if (STATE.satcomOnline) {
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(0,212,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(satX, satY);
    ctx.lineTo(maitriX, maitriY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(satX, satY);
    ctx.lineTo(bharatiX, bharatiY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Labels
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText('GSAT-17', satX + 12, satY + 4);

  // Grid lines (latitude)
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(W*0.5, H*0.56, 60 + i*65, 0, Math.PI*2);
    ctx.stroke();
  }
}

function cubicBezier(p0, p1, p2, p3, t) {
  return Math.pow(1-t,3)*p0 + 3*Math.pow(1-t,2)*t*p1 + 3*(1-t)*t*t*p2 + Math.pow(t,3)*p3;
}

// ============================================================
// DIGITAL TWIN RENDERING
// ============================================================
let maitriTwinAnimFrame = null;
let bharatiTwinAnimFrame = null;

function renderMaitriTwin() {
  const canvas = document.getElementById('maitri-twin-canvas');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || 600;
  canvas.height = 380;
  drawStationTwin(canvas, MAITRI_ZONES, STATE.maitri.twinAngle, STATE.maitri.twinSelected, '#f59e0b');
}

function renderBharatiTwin() {
  const canvas = document.getElementById('bharati-twin-canvas');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || 600;
  canvas.height = 380;
  drawStationTwin(canvas, BHARATI_ZONES, STATE.bharati.twinAngle, STATE.bharati.twinSelected, '#00d4ff');
}

function drawStationTwin(canvas, zones, angle, selectedId, accentColor) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // Background - dark polar scene
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#040d1a');
  bgGrad.addColorStop(0.6, '#071224');
  bgGrad.addColorStop(1, '#0a1830');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Aurora background
  const auroraGrad = ctx.createLinearGradient(0, 0, W, H*0.4);
  auroraGrad.addColorStop(0, 'rgba(0,212,255,0.03)');
  auroraGrad.addColorStop(1, 'rgba(0,245,204,0.02)');
  ctx.fillStyle = auroraGrad;
  ctx.fillRect(0, 0, W, H * 0.4);

  // Snowy ground
  const groundGrad = ctx.createLinearGradient(0, H*0.72, 0, H);
  groundGrad.addColorStop(0, 'rgba(180,210,255,0.08)');
  groundGrad.addColorStop(1, 'rgba(140,180,255,0.04)');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, H * 0.72, W, H * 0.28);

  // Grid / reference lines
  ctx.strokeStyle = 'rgba(0,212,255,0.06)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 8]);
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 44);
    ctx.lineTo(W, i * 44);
    ctx.stroke();
  }
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 50, 0);
    ctx.lineTo(i * 50, H);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Scale zones for canvas size
  const scaleX = W / 700;
  const scaleY = H / 420;

  zones.forEach(zone => {
    const x = zone.x * scaleX;
    const y = zone.y * scaleY;
    const w = zone.w * scaleX;
    const h = zone.h * scaleY;
    const isSelected = zone.id === selectedId;

    // 3D isometric offset
    const depth = 16;
    const ox = 8; // offset x for 3D side
    const oy = 10; // offset y for 3D top

    // Shadow
    ctx.shadowColor = zone.accent;
    ctx.shadowBlur = isSelected ? 20 : (zone.status === 'warn' ? 12 : 6);

    // Top face (lighter)
    ctx.beginPath();
    ctx.moveTo(x, y - oy);
    ctx.lineTo(x + w, y - oy);
    ctx.lineTo(x + w + ox, y);
    ctx.lineTo(x + ox, y);
    ctx.closePath();
    const topGrad = ctx.createLinearGradient(x, y - oy, x + w, y);
    topGrad.addColorStop(0, lightenHex(zone.accent, 0.15));
    topGrad.addColorStop(1, lightenHex(zone.accent, 0.08));
    ctx.fillStyle = isSelected ? lightenHex(accentColor, 0.3) : topGrad;
    ctx.fill();
    ctx.strokeStyle = isSelected ? accentColor : zone.accent;
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.stroke();

    // Front face (main)
    const faceGrad = ctx.createLinearGradient(x, y, x, y + h);
    faceGrad.addColorStop(0, zone.color);
    faceGrad.addColorStop(1, darkenHex(zone.color));
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = faceGrad;
    ctx.fill();
    ctx.strokeStyle = isSelected ? accentColor : `${zone.accent}88`;
    ctx.lineWidth = isSelected ? 2.5 : 1;
    ctx.stroke();

    // Right face (darker)
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w + ox, y - oy/2);
    ctx.lineTo(x + w + ox, y + h - oy/2);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fillStyle = darkenHex(zone.color, 0.5);
    ctx.fill();
    ctx.strokeStyle = `${zone.accent}44`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Accent glow border (selected or warning)
    if (isSelected || zone.status === 'warn' || zone.status === 'critical') {
      ctx.strokeStyle = isSelected ? accentColor :
        (zone.status === 'critical' ? '#ef4444' : '#f59e0b');
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.shadowColor = isSelected ? accentColor : '#f59e0b';
      ctx.shadowBlur = 16;
      ctx.strokeRect(x, y, w, h);
      ctx.shadowBlur = 0;
    }

    // Warning/Critical indicator dot
    if (zone.status === 'warn' || zone.status === 'critical') {
      const dotColor = zone.status === 'critical' ? '#ef4444' : '#f59e0b';
      const pulse = Math.abs(Math.sin(Date.now() / 600)) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x + w - 12, y + 12, 5, 0, Math.PI*2);
      ctx.fillStyle = dotColor;
      ctx.globalAlpha = 0.5 + pulse * 0.5;
      ctx.shadowColor = dotColor;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Zone label
    ctx.fillStyle = isSelected ? '#fff' : `${zone.accent}cc`;
    ctx.font = `bold ${Math.max(9, Math.round(11 * scaleX))}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Multi-line label
    const labelY = y + h * 0.5;
    const words = zone.label.split(' ');
    if (words.length <= 2) {
      ctx.fillText(zone.label, x + w/2, labelY);
    } else {
      const mid = Math.ceil(words.length / 2);
      ctx.fillText(words.slice(0, mid).join(' '), x + w/2, labelY - 8);
      ctx.fillText(words.slice(mid).join(' '), x + w/2, labelY + 8);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Telemetry billboard on selected
    if (isSelected) {
      drawTelemetryBillboard(ctx, zone, x, y, w);
    }
  });

  // Connecting path lines between zones
  ctx.strokeStyle = 'rgba(0,212,255,0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 6]);
  for (let i = 0; i < zones.length - 1; i++) {
    const a = zones[i], b = zones[i+1];
    ctx.beginPath();
    ctx.moveTo((a.x + a.w/2) * scaleX, (a.y + a.h/2) * scaleY);
    ctx.lineTo((b.x + b.w/2) * scaleX, (b.y + b.h/2) * scaleY);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Compass
  drawCompass(ctx, W - 50, H - 50, 30, angle);
}

function drawTelemetryBillboard(ctx, zone, x, y, w) {
  const bx = x + w + 15;
  const by = y - 10;
  const bw = 130;
  const bh = 60;

  ctx.fillStyle = 'rgba(4,13,26,0.92)';
  ctx.strokeStyle = zone.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 6);
  ctx.fill();
  ctx.stroke();

  // Arrow connector
  ctx.beginPath();
  ctx.moveTo(x + w, y + 15);
  ctx.lineTo(bx, by + bh/2);
  ctx.strokeStyle = `${zone.accent}66`;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = zone.accent;
  ctx.font = 'bold 9px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`▶ ${zone.label.split(' ')[0]}`, bx + 6, by + 16);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '8px Inter, sans-serif';
  ctx.fillText('Click to inspect', bx + 6, by + 30);
  ctx.fillStyle = zone.status === 'warn' ? '#f59e0b' : '#22c55e';
  ctx.fillText(`Status: ${zone.status.toUpperCase()}`, bx + 6, by + 46);
}

function drawCompass(ctx, cx, cy, r, angle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(0,212,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(4,13,26,0.7)';
  ctx.fill();

  // N arrow
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(0, -r + 4);
  ctx.lineTo(5, 0);
  ctx.lineTo(-5, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.moveTo(0, r - 4);
  ctx.lineTo(5, 0);
  ctx.lineTo(-5, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
  ctx.fillStyle = 'rgba(0,212,255,0.6)';
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('N', cx, cy - r - 6);
}

function lightenHex(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function darkenHex(hex, factor = 0.3) {
  if (!hex.startsWith('#')) return hex;
  const r = Math.round(parseInt(hex.slice(1,3),16) * factor);
  const g = Math.round(parseInt(hex.slice(3,5),16) * factor);
  const b = Math.round(parseInt(hex.slice(5,7),16) * factor);
  return `rgb(${r},${g},${b})`;
}

// ============================================================
// TWIN CLICK HANDLER
// ============================================================
function handleTwinClick(event, station) {
  const canvas = event.target;
  const rect = canvas.getBoundingClientRect();
  const mx = event.clientX - rect.left;
  const my = event.clientY - rect.top;
  const scaleX = canvas.width / 700;
  const scaleY = canvas.height / 420;

  const zones = station === 'maitri' ? MAITRI_ZONES : BHARATI_ZONES;
  let clicked = null;

  for (const zone of zones) {
    const x = zone.x * scaleX, y = zone.y * scaleY;
    const w = zone.w * scaleX, h = zone.h * scaleY;
    if (mx >= x && mx <= x+w && my >= y && my <= y+h) {
      clicked = zone;
      break;
    }
  }

  if (clicked) {
    STATE[station].twinSelected = clicked.id;
    const infoEl = document.getElementById(`${station}-subsystem-info`);
    if (infoEl) {
      infoEl.innerHTML = `<span style="color:${clicked.accent};font-weight:700">▶ ${clicked.label}</span> &nbsp;—&nbsp; <span style="color:var(--text-300)">Status: <strong style="color:${clicked.status === 'warn' ? 'var(--yellow)' : clicked.status === 'critical' ? 'var(--red)' : 'var(--green)'}">${clicked.status.toUpperCase()}</strong></span>`;
    }

    // Switch inspector tab
    selectSubsystemByName(station, clicked.subsystem);

    if (station === 'maitri') renderMaitriTwin();
    else renderBharatiTwin();
  }
}

function selectSubsystemByName(station, subsystem) {
  const tabs = document.querySelectorAll(`#${station}-inspector .it-tab`);
  tabs.forEach(t => {
    t.classList.remove('active');
    if (t.onclick && t.onclick.toString().includes(`'${subsystem}'`)) {
      t.classList.add('active');
    }
  });
  selectSubsystem(station, subsystem, null);
}

// ============================================================
// TWIN ROTATION
// ============================================================
function rotateTwin(station, dir) {
  const delta = dir === 'left' ? -0.2 : 0.2;
  STATE[station].twinAngle += delta;
  if (station === 'maitri') renderMaitriTwin();
  else renderBharatiTwin();
}

function resetTwinView(station) {
  STATE[station].twinAngle = 0;
  STATE[station].twinSelected = null;
  if (station === 'maitri') { renderMaitriTwin(); document.getElementById('maitri-subsystem-info').innerHTML = '<span class="no-selection">Click a zone to inspect subsystem</span>'; }
  else { renderBharatiTwin(); document.getElementById('bharati-subsystem-info').innerHTML = '<span class="no-selection">Click a zone to inspect subsystem — Try Generator 02</span>'; }
}

// ============================================================
// INSPECTOR CONTENT
// ============================================================
function selectSubsystem(station, subsystem, tabEl) {
  STATE[station].selectedSubsystem = subsystem;
  if (tabEl) {
    document.querySelectorAll(`#${station}-inspector .it-tab`).forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
  }
  renderInspector(station);
}

function renderInspector(station) {
  const el = document.getElementById(`${station}-inspector-content`);
  if (!el) return;
  const sub = STATE[station].selectedSubsystem;
  const st = STATE[station];
  let html = '';

  if (sub === 'power') {
    html = `
      <div class="insp-section">
        <div class="insp-section-title">Generator Status</div>
        <div class="insp-metric ok"><span class="insp-label">Generator 01</span><span class="insp-val green-text">${st.gen1.load}% load</span></div>
        <div class="insp-metric ok"><span class="insp-label">Gen01 Fuel Flow</span><span class="insp-val">${(st.gen1.load * 1.8).toFixed(1)} L/h</span></div>
        <div class="insp-metric ok"><span class="insp-label">Gen01 Temp</span><span class="insp-val">${st.gen1.temp}°C</span></div>
        <div class="insp-metric ok"><span class="insp-label">Gen01 RPM</span><span class="insp-val">${st.gen1.rpm}</span></div>
        ${station === 'bharati' ? `
        <div class="insp-metric warn"><span class="insp-label">Generator 02 ⚠️</span><span class="insp-val yellow-text">${st.gen2.load}% load</span></div>
        <div class="insp-metric warn"><span class="insp-label">Gen02 Vibration</span><span class="insp-val yellow-text">${(st.gen2.vibration || 18.4).toFixed(1)} mm/s</span></div>
        <div class="insp-metric warn"><span class="insp-label">Gen02 Temp</span><span class="insp-val yellow-text">${st.gen2.temp}°C</span></div>
        <div class="insp-metric ok"><span class="insp-label">Gen02 RPM</span><span class="insp-val">${st.gen2.rpm}</span></div>
        ` : ''}
      </div>
      <div class="insp-section">
        <div class="insp-section-title">Power Summary</div>
        <div class="insp-metric ok"><span class="insp-label">Total Load</span><span class="insp-val">${st.power} kW</span></div>
        <div class="insp-metric ok"><span class="insp-label">Capacity</span><span class="insp-val">${Math.round(st.power / (st.powerPct/100))} kW</span></div>
        <div class="insp-metric ok"><span class="insp-label">Reserve</span><span class="insp-val green-text">${100 - st.powerPct}%</span></div>
      </div>
      ${station === 'bharati' ? `
      <div class="predictive-alert">
        <div class="pa-title">⚠️ PREDICTIVE ALERT</div>
        <div class="pa-desc">Gen02 bearing wear signature detected. Vibration at 18.4 mm/s (threshold 15). Estimated MTBF: 68–74h. Schedule maintenance immediately.</div>
        <button class="btn-primary sm" style="margin-top:8px;width:100%" onclick="triggerAira('generator')">Ask AIRA for Analysis</button>
      </div>` : ''}
    `;
  } else if (sub === 'life') {
    html = `
      <div class="insp-section">
        <div class="insp-section-title">Atmospheric Control</div>
        <div class="insp-metric ok"><span class="insp-label">Oxygen (O₂)</span><span class="insp-val green-text">${st.o2}%</span></div>
        <div class="insp-metric ok"><span class="insp-label">Carbon Dioxide</span><span class="insp-val">${st.co2}%</span></div>
        <div class="insp-metric ok"><span class="insp-label">Cabin Temp</span><span class="insp-val">${st.hvacTemp}°C</span></div>
        <div class="insp-metric ok"><span class="insp-label">Humidity</span><span class="insp-val">45%</span></div>
        <div class="insp-metric ok"><span class="insp-label">Air Pressure</span><span class="insp-val">101.3 kPa</span></div>
      </div>
      <div class="insp-section">
        <div class="insp-section-title">Water System</div>
        <div class="insp-metric ok"><span class="insp-label">Water Reserve</span><span class="insp-val">${st.water}%</span></div>
        <div class="insp-metric ok"><span class="insp-label">Daily Consumption</span><span class="insp-val">${st.waterDaily} L/day</span></div>
        <div class="insp-metric ok"><span class="insp-label">Treatment Status</span><span class="insp-val green-text">NOMINAL</span></div>
      </div>
    `;
  } else if (sub === 'comms') {
    html = `
      <div class="insp-section">
        <div class="insp-section-title">SATCOM Link</div>
        <div class="insp-metric ${st.latency > 600 ? 'warn' : 'ok'}"><span class="insp-label">Latency</span><span class="insp-val ${st.latency > 600 ? 'yellow-text' : ''}">${st.latency} ms</span></div>
        <div class="insp-metric ok"><span class="insp-label">Bandwidth</span><span class="insp-val">${st.bandwidth} Mbps</span></div>
        <div class="insp-metric ${st.packetLoss > 1 ? 'warn' : 'ok'}"><span class="insp-label">Packet Loss</span><span class="insp-val">${st.packetLoss}%</span></div>
        <div class="insp-metric ok"><span class="insp-label">Uptime</span><span class="insp-val green-text">99.2%</span></div>
        <div class="insp-metric ok"><span class="insp-label">Satellite</span><span class="insp-val">GSAT-17</span></div>
      </div>
      <div class="insp-section">
        <div class="insp-section-title">Ground Links</div>
        <div class="insp-metric ok"><span class="insp-label">NCAOR Goa</span><span class="insp-val green-text">ACTIVE</span></div>
        <div class="insp-metric ok"><span class="insp-label">ISRO Backup</span><span class="insp-val">STANDBY</span></div>
        <div class="insp-metric ok"><span class="insp-label">Station-to-Station</span><span class="insp-val green-text">LIVE</span></div>
      </div>
    `;
  } else if (sub === 'hvac' || sub === 'fuel') {
    if (sub === 'hvac') {
      html = `
        <div class="insp-section">
          <div class="insp-section-title">HVAC System</div>
          <div class="insp-metric ok"><span class="insp-label">Heating Load</span><span class="insp-val">68 kW</span></div>
          <div class="insp-metric ok"><span class="insp-label">Cabin Temp</span><span class="insp-val">${st.hvacTemp}°C</span></div>
          <div class="insp-metric ok"><span class="insp-label">Outdoor Temp</span><span class="insp-val">${st.temp}°C</span></div>
          <div class="insp-metric ok"><span class="insp-label">Filter ΔP</span><span class="insp-val">218 Pa</span></div>
          <div class="insp-metric ok"><span class="insp-label">Ventilation</span><span class="insp-val green-text">NOMINAL</span></div>
        </div>
      `;
    } else {
      html = `
        <div class="insp-section">
          <div class="insp-section-title">Fuel Farm — Bharati</div>
          <div class="insp-metric ok"><span class="insp-label">HSD Reserve</span><span class="insp-val">${st.fuel}%</span></div>
          <div class="insp-metric ok"><span class="insp-label">Endurance</span><span class="insp-val">${st.fuelEndurance} days</span></div>
          <div class="insp-metric ok"><span class="insp-label">Daily Consumption</span><span class="insp-val">3,650 L/day</span></div>
          <div class="insp-metric ok"><span class="insp-label">Tank 1</span><span class="insp-val green-text">80%</span></div>
          <div class="insp-metric ok"><span class="insp-label">Tank 2</span><span class="insp-val green-text">74%</span></div>
          <div class="insp-metric ok"><span class="insp-label">Resupply ETA</span><span class="insp-val">D+8</span></div>
        </div>
      `;
    }
  } else if (sub === 'science') {
    html = `
      <div class="insp-section">
        <div class="insp-section-title">Science Instruments</div>
        ${station === 'maitri' ? `
        <div class="insp-metric ok"><span class="insp-label">Magnetometer</span><span class="insp-val green-text">ONLINE</span></div>
        <div class="insp-metric ok"><span class="insp-label">Radiosonde System</span><span class="insp-val green-text">ONLINE</span></div>
        <div class="insp-metric ok"><span class="insp-label">Ozone Sensor</span><span class="insp-val green-text">ONLINE</span></div>
        <div class="insp-metric ok"><span class="insp-label">Ice Core Drill</span><span class="insp-val green-text">ONLINE</span></div>
        <div class="insp-metric warn"><span class="insp-label">Seismograph</span><span class="insp-val yellow-text">CALIBRATING</span></div>
        ` : `
        <div class="insp-metric ok"><span class="insp-label">SeismographBH-01</span><span class="insp-val green-text">ONLINE (100sps)</span></div>
        <div class="insp-metric ok"><span class="insp-label">Ocean Buoy Array</span><span class="insp-val green-text">ONLINE</span></div>
        <div class="insp-metric ok"><span class="insp-label">Ice Thickness Radar</span><span class="insp-val green-text">ONLINE</span></div>
        <div class="insp-metric ok"><span class="insp-label">Meteorological Stn</span><span class="insp-val green-text">ONLINE</span></div>
        <div class="insp-metric ok"><span class="insp-label">UV/Ozone Monitor</span><span class="insp-val green-text">ONLINE</span></div>
        <div class="insp-metric ok"><span class="insp-label">Aurora Camera</span><span class="insp-val green-text">ONLINE</span></div>
        `}
      </div>
      <div class="insp-section">
        <div class="insp-section-title">Data Uplink</div>
        <div class="insp-metric ok"><span class="insp-label">Data Generated</span><span class="insp-val">${station === 'maitri' ? '1.2' : '2.4'} GB/day</span></div>
        <div class="insp-metric ok"><span class="insp-label">Uplink to NCAOR</span><span class="insp-val green-text">SYNC ACTIVE</span></div>
      </div>
    `;
  }

  el.innerHTML = html;
}

// ============================================================
// TELEMETRY GRID
// ============================================================
function renderTelemetryGrid(station) {
  const el = document.getElementById(`${station}-telemetry-grid`);
  if (!el) return;
  const st = STATE[station];

  const metrics = station === 'maitri' ? [
    { label: 'Power Load', value: st.power, unit: 'kW', status: 'ok', color: '#22c55e' },
    { label: 'Outdoor Temp', value: st.temp, unit: '°C', status: 'ok', color: '#00d4ff' },
    { label: 'Wind Speed', value: st.windKt, unit: 'kt', status: st.windKt > 35 ? 'warn' : 'ok', color: '#3b82f6' },
    { label: 'SATCOM Latency', value: st.latency, unit: 'ms', status: st.latency > 600 ? 'warn' : 'ok', color: '#f59e0b' },
    { label: 'O₂ Level', value: st.o2, unit: '%', status: 'ok', color: '#00f5cc' },
    { label: 'Water Reserve', value: st.water, unit: '%', status: st.water < 50 ? 'warn' : 'ok', color: '#3b82f6' },
    { label: 'HSD Fuel', value: st.fuel, unit: '%', status: st.fuel < 30 ? 'critical' : st.fuel < 50 ? 'warn' : 'ok', color: '#f97316' },
    { label: 'Cabin Temp', value: st.hvacTemp, unit: '°C', status: 'ok', color: '#a855f7' },
    { label: 'Gen01 Load', value: st.gen1.load, unit: '%', status: 'ok', color: '#22c55e' },
    { label: 'Gen01 Temp', value: st.gen1.temp, unit: '°C', status: st.gen1.temp > 85 ? 'warn' : 'ok', color: '#f59e0b' },
    { label: 'Visibility', value: st.visKm, unit: 'km', status: st.visKm < 2 ? 'warn' : 'ok', color: '#60a5fa' },
    { label: 'CO₂ Level', value: (st.co2 * 10000).toFixed(0), unit: 'ppm', status: 'ok', color: '#84cc16' },
  ] : [
    { label: 'Power Load', value: st.power, unit: 'kW', status: 'ok', color: '#22c55e' },
    { label: 'Outdoor Temp', value: st.temp, unit: '°C', status: 'ok', color: '#00d4ff' },
    { label: 'Wind Speed', value: st.windKt, unit: 'kt', status: 'ok', color: '#3b82f6' },
    { label: 'SATCOM Latency', value: st.latency, unit: 'ms', status: 'ok', color: '#a855f7' },
    { label: 'Gen02 Vibration', value: (st.gen2.vibration || 18.4).toFixed(1), unit: 'mm/s', status: 'warn', color: '#f59e0b' },
    { label: 'Gen02 Temp', value: st.gen2.temp, unit: '°C', status: st.gen2.temp > 90 ? 'critical' : 'warn', color: '#f97316' },
    { label: 'O₂ Level', value: st.o2, unit: '%', status: 'ok', color: '#00f5cc' },
    { label: 'HSD Fuel', value: st.fuel, unit: '%', status: 'ok', color: '#22c55e' },
    { label: 'Water Reserve', value: st.water, unit: '%', status: 'ok', color: '#3b82f6' },
    { label: 'Cabin Temp', value: st.hvacTemp, unit: '°C', status: 'ok', color: '#a855f7' },
    { label: 'Visibility', value: st.visKm, unit: 'km', status: 'ok', color: '#60a5fa' },
    { label: 'Bandwidth', value: st.bandwidth, unit: 'Mbps', status: 'ok', color: '#84cc16' },
  ];

  el.innerHTML = metrics.map(m => `
    <div class="telemetry-card ${m.status}">
      <div class="tc-label">${m.label}</div>
      <div class="tc-value" style="color:${m.color}">${m.value}</div>
      <div class="tc-unit">${m.unit}</div>
      <svg class="tc-sparkline" viewBox="0 0 100 30">
        <polyline points="${generateSparkline(m.value)}" fill="none" stroke="${m.color}" stroke-width="1.5" opacity="0.7"/>
      </svg>
      <div class="tc-status ${m.status}">${m.status === 'ok' ? '● NOMINAL' : m.status === 'warn' ? '▲ WARNING' : '■ CRITICAL'}</div>
    </div>
  `).join('');
}

function generateSparkline(center) {
  const points = [];
  for (let i = 0; i < 20; i++) {
    const x = i * 5.5;
    const noise = (Math.random() - 0.5) * 8;
    const y = 15 + noise;
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

// ============================================================
// CREW GRID
// ============================================================
function renderCrewGrid(station) {
  const el = document.getElementById(`${station}-crew-grid`);
  if (!el) return;
  const crew = station === 'maitri' ? MAITRI_CREW : BHARATI_CREW;

  el.innerHTML = crew.map(c => `
    <div class="crew-card">
      <div class="crew-avatar" style="background:${statusToColor(c.status)}20;border-color:${statusToColor(c.status)}40">
        ${c.icon}
      </div>
      <div class="crew-info">
        <div class="crew-name">${c.name}</div>
        <div class="crew-role">${c.role}</div>
        <div class="crew-status ${c.status}">
          <span style="color:${statusToColor(c.status)}">●</span>
          ${c.status === 'on-duty' ? 'ON DUTY' : c.status === 'field' ? 'IN FIELD' : c.status === 'off-duty' ? 'OFF DUTY' : 'MEDICAL'}
        </div>
      </div>
      <div class="crew-vitals">
        <div class="cv-item">HR: ${c.vitals.hr}bpm</div>
        <div class="cv-item">SpO₂: ${c.vitals.spo2}%</div>
        <div class="cv-item">${c.vitals.bp}</div>
      </div>
    </div>
  `).join('');
}

function statusToColor(status) {
  return { 'on-duty': '#22c55e', 'field': '#f59e0b', 'off-duty': '#6b7280', 'medical': '#ef4444' }[status] || '#6b7280';
}

// ============================================================
// EVENT TIMELINE
// ============================================================
function renderTimeline(filter = 'all') {
  const el = document.getElementById('event-timeline');
  if (!el) return;

  let events = [...STATE.timeline, ...SEED_TIMELINE];
  if (filter !== 'all') events = events.filter(e => e.type === filter);

  el.innerHTML = events.slice(0, 15).map(ev => `
    <div class="timeline-event ev-${ev.type}">
      <div class="te-header">
        <span class="te-time">${ev.time}</span>
        <span class="te-station ${ev.station}">${ev.station.toUpperCase()}</span>
        <span class="te-title">${ev.title}</span>
      </div>
      <div class="te-desc">${ev.desc}</div>
    </div>
  `).join('');
}

function filterTimeline(filter, btn) {
  document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTimeline(filter);
}

// ============================================================
// TELEMETRY CHARTS (Canvas-based)
// ============================================================
function renderCommandCharts() {
  renderLineChart('chart-power', STATE.chartData.power, 'kW', '#30D158', '#0A84FF');
  renderLineChart('chart-temp', STATE.chartData.temp, '°C', '#FF9F0A', '#64D2FF');
  renderLineChart('chart-latency', STATE.chartData.latency, 'ms', '#BF5AF2', '#64D2FF');
}

function renderLineChart(canvasId, data, unit, color1, color2) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !data.maitri.length) return;
  canvas.width = canvas.offsetWidth || 400;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = 140;
  canvas.height = H;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = H * i / 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  const drawLine = (values, color) => {
    if (!values.length) return;
    const min = Math.min(...values) * 0.9;
    const max = Math.max(...values) * 1.1;
    const range = max - min || 1;
    const step = W / (values.length - 1);

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `${color}30`);
    grad.addColorStop(1, `${color}00`);

    ctx.beginPath();
    values.forEach((v, i) => {
      const x = i * step;
      const y = H - ((v - min) / range) * (H - 20) - 10;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    const lastX = (values.length - 1) * step;
    ctx.lineTo(lastX, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = i * step;
      const y = H - ((v - min) / range) * (H - 20) - 10;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Last point dot
    const lx = (values.length - 1) * step;
    const lv = values[values.length - 1];
    const ly = H - ((lv - min) / range) * (H - 20) - 10;
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  drawLine(data.maitri, color1);
  drawLine(data.bharati, color2);

  // Legend
  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = color1; ctx.fillText('▬ Maitri', 8, 14);
  ctx.fillStyle = color2; ctx.fillText('▬ Bharati', 60, 14);
}

// ============================================================
// TELEMETRY SIMULATION
// ============================================================
function simulateTelemetry() {
  STATE.tickCount++;
  const t = STATE.tickCount;

  const jitter = (v, amp) => v + (Math.random() - 0.5) * amp;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // Maitri
  STATE.maitri.power = Math.round(jitter(380, 12));
  STATE.maitri.powerPct = Math.round(jitter(92, 3));
  STATE.maitri.temp = parseFloat(jitter(-24, 1.5).toFixed(1));
  STATE.maitri.windKt = clamp(Math.round(jitter(28, 4)), 5, 80);
  STATE.maitri.visKm = parseFloat(clamp(jitter(8.2, 0.8), 0.5, 20).toFixed(1));
  STATE.maitri.latency = Math.round(jitter(620, 40));
  STATE.maitri.gen1.load = clamp(Math.round(jitter(88, 3)), 50, 100);
  STATE.maitri.gen1.temp = Math.round(jitter(76, 2));
  STATE.maitri.water = clamp(Math.round(jitter(76, 1)), 10, 100);
  STATE.maitri.co2 = parseFloat(jitter(0.04, 0.005).toFixed(3));

  // Bharati
  STATE.bharati.power = Math.round(jitter(420, 10));
  STATE.bharati.powerPct = Math.round(jitter(96, 2));
  STATE.bharati.temp = parseFloat(jitter(-18, 1.2).toFixed(1));
  STATE.bharati.windKt = clamp(Math.round(jitter(15, 3)), 3, 60);
  STATE.bharati.visKm = parseFloat(clamp(jitter(12.4, 0.6), 1, 20).toFixed(1));
  STATE.bharati.latency = Math.round(jitter(480, 30));
  STATE.bharati.gen1.load = clamp(Math.round(jitter(92, 3)), 60, 100);
  STATE.bharati.gen2.vibration = parseFloat(jitter(18.4, 0.6).toFixed(1));
  STATE.bharati.gen2.temp = Math.round(jitter(89, 2));
  STATE.bharati.water = clamp(Math.round(jitter(88, 1)), 10, 100);

  // Update chart data
  const now = new Date().toUTCString().slice(17, 22);
  ['power', 'temp', 'latency'].forEach(key => {
    let mv, bv;
    if (key === 'power') { mv = STATE.maitri.power; bv = STATE.bharati.power; }
    else if (key === 'temp') { mv = STATE.maitri.temp; bv = STATE.bharati.temp; }
    else { mv = STATE.maitri.latency; bv = STATE.bharati.latency; }

    STATE.chartData[key].maitri.push(mv);
    STATE.chartData[key].bharati.push(bv);
    STATE.chartData[key].labels.push(now);
    if (STATE.chartData[key].maitri.length > 40) {
      STATE.chartData[key].maitri.shift();
      STATE.chartData[key].bharati.shift();
      STATE.chartData[key].labels.shift();
    }
  });

  // SATCOM offline mode
  if (!STATE.satcomOnline) {
    const elapsed = (Date.now() - STATE.satcomLostAt) / 1000;
    STATE.queuedMB = parseFloat((elapsed * 0.85).toFixed(1));
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = Math.floor(elapsed % 60).toString().padStart(2, '0');
    const el = document.getElementById('last-sync');
    if (el) el.textContent = `${mins}:${secs}`;
    const qel = document.getElementById('queued-mb');
    if (qel) qel.textContent = STATE.queuedMB;
  }

  updateDOMStats();
  updateAlertsState();

  if (STATE.currentPage === 'overview') {
    drawAntarcticaMap();
    drawHealthRing('maitri-health-canvas', STATE.maitri.health, '#FF9F0A');
    drawHealthRing('bharati-health-canvas', STATE.bharati.health, '#64D2FF');
  }
  if (STATE.currentPage === 'maitri') { renderMaitriTwin(); if (t % 5 === 0) renderTelemetryGrid('maitri'); }
  if (STATE.currentPage === 'bharati') { renderBharatiTwin(); if (t % 5 === 0) renderTelemetryGrid('bharati'); }
  if (STATE.currentPage === 'command' && t % 8 === 0) renderCommandCharts();
}

function updateDOMStats() {
  const st = STATE;
  setText('maitri-health-score', st.maitri.health);
  setText('bharati-health-score', st.bharati.health);
  setText('maitri-score-mini', st.maitri.health);
  setText('bharati-score-mini', st.bharati.health);
  setText('maitri-crew', st.maitri.crew);
  setText('bharati-crew', st.bharati.crew);
  setText('maitri-temp', `${st.maitri.temp}°C`);
  setText('bharati-temp', `${st.bharati.temp}°C`);
  setText('maitri-power', `${st.maitri.powerPct}%`);
  setText('bharati-power', `${st.bharati.powerPct}%`);
  setText('maitri-alerts', st.maitri.alerts);
  setText('bharati-alerts', st.bharati.alerts);
  setText('total-crew', st.maitri.crew + st.bharati.crew);
  setText('active-alerts-count', st.activeAlerts.length);
  setText('ov-maitri-wind', `↗ ${st.maitri.windKt} kt`);
  setText('ov-bharati-wind', `↖ ${st.bharati.windKt} kt`);
  setText('ov-maitri-vis', `Vis: ${st.maitri.visKm} km`);
  setText('ov-bharati-vis', `Vis: ${st.bharati.visKm} km`);
  setText('maitri-health-display', st.maitri.health);
  setText('bharati-health-display', st.bharati.health);
  setText('maitri-crew-display', st.maitri.crew);
  setText('bharati-crew-display', st.bharati.crew);
  setText('maitri-alerts-display', st.maitri.alerts);
  setText('bharati-alerts-display', st.bharati.alerts);

  // Update last update times
  const now = new Date().toUTCString().slice(17,22);
  setText('maitri-last-update', `Last updated: ${now} UTC`);
  setText('bharati-last-update', `Last updated: ${now} UTC`);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ============================================================
// ALERTS ENGINE
// ============================================================
function updateAlertsState() {
  STATE.activeAlerts = [];

  if (STATE.bharati.gen2.vibration > 15) {
    STATE.activeAlerts.push({ id: 'bharati-gen2-vib', station: 'BHARATI', severity: 'WARN', title: 'Gen02 Vibration', desc: `${STATE.bharati.gen2.vibration.toFixed(1)} mm/s — threshold 15 mm/s` });
    STATE.bharati.alerts = 1;
  } else {
    STATE.bharati.alerts = 0;
  }

  if (STATE.maitri.fuel < 50) {
    STATE.activeAlerts.push({ id: 'maitri-fuel', station: 'MAITRI', severity: 'WATCH', title: 'Fuel Low', desc: `HSD at ${STATE.maitri.fuel}%` });
    STATE.maitri.alerts = (STATE.maitri.alerts || 0) + 1;
  }

  if (STATE.maitri.windKt > 40) {
    STATE.activeAlerts.push({ id: 'maitri-wind', station: 'MAITRI', severity: 'WARN', title: 'High Wind', desc: `${STATE.maitri.windKt}kt — field ops suspended` });
  }

  if (STATE.bharati.gen2.temp > 95) {
    STATE.activeAlerts.push({ id: 'bharati-gen2-temp', station: 'BHARATI', severity: 'CRITICAL', title: 'Gen02 Overtemp', desc: `${STATE.bharati.gen2.temp}°C — immediate action required` });
  }

  const count = STATE.activeAlerts.length;
  setText('alert-fab-count', count);
  setText('alert-count-drawer', count);

  const fab = document.getElementById('alert-fab');
  if (fab) {
    fab.classList.toggle('has-alerts', count > 0);
  }

  // Update alert drawer
  const drawerContent = document.getElementById('alert-drawer-content');
  if (drawerContent) {
    if (count === 0) {
      drawerContent.innerHTML = '<div style="text-align:center;color:var(--text-400);padding:32px;font-size:0.8rem;">No active alerts — all systems nominal</div>';
    } else {
      drawerContent.innerHTML = STATE.activeAlerts.map(a => `
        <div class="alert-item ${a.severity === 'CRITICAL' ? 'red-border' : a.severity === 'WARN' ? 'yellow-border' : 'orange-border'}">
          <div class="ic-header" style="margin-bottom:6px">
            <span class="ic-severity ${a.severity === 'CRITICAL' ? 'red-badge' : a.severity === 'WARN' ? 'yellow-badge' : 'orange-badge'}">${a.severity}</span>
            <span class="ic-title" style="font-size:0.78rem">${a.station}</span>
          </div>
          <div style="font-size:0.78rem;font-weight:600;margin-bottom:4px">${a.title}</div>
          <div style="font-size:0.72rem;color:var(--text-300)">${a.desc}</div>
        </div>
      `).join('');
    }
  }
}

// ============================================================
// AIRA ASSISTANT
// ============================================================
function toggleAira() {
  const body = document.getElementById('aira-body');
  const icon = document.getElementById('aira-toggle-icon');
  STATE.airaOpen = !STATE.airaOpen;
  body.classList.toggle('collapsed', !STATE.airaOpen);
  icon.classList.toggle('collapsed', !STATE.airaOpen);
}

function sendAiraMessage() {
  const input = document.getElementById('aira-input');
  if (!input || !input.value.trim()) return;
  const query = input.value.trim();
  input.value = '';
  addAiraMessage('user', query);
  airaThink(query);
}

function quickAira(q) { addAiraMessage('user', q); airaThink(q); }

function addAiraMessage(role, text) {
  const msgs = document.getElementById('aira-messages');
  if (!msgs) return;
  const now = new Date().toUTCString().slice(17,22);
  const div = document.createElement('div');
  div.className = `aira-msg ${role}`;
  div.innerHTML = `<span class="msg-time">${now}</span><span>${text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</span>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function airaThink(query) {
  const msgs = document.getElementById('aira-messages');
  const thinking = document.createElement('div');
  thinking.className = 'aira-msg aira';
  thinking.innerHTML = '<div class="aira-thinking"><span></span><span></span><span></span></div>';
  msgs.appendChild(thinking);
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(() => {
    msgs.removeChild(thinking);
    const response = getAiraResponse(query);
    addAiraMessage('aira', response);
  }, 1200 + Math.random() * 800);
}

function getAiraResponse(query) {
  const q = query.toLowerCase();
  for (const [key, kb] of Object.entries(AIRA_KB)) {
    if (kb.q && kb.q.some(kw => q.includes(kw))) {
      return kb.a;
    }
  }
  return AIRA_KB.default.a;
}

function triggerAira(topic) {
  if (!STATE.airaOpen) { STATE.airaOpen = true; document.getElementById('aira-body').classList.remove('collapsed'); document.getElementById('aira-toggle-icon').classList.remove('collapsed'); }
  const prompts = {
    generator: 'Why is Generator 02 showing a vibration warning?',
    fuel: 'What is the fuel endurance situation at Maitri?',
    blizzard: 'How should we respond to the incoming blizzard risk?',
    satcom: 'What is the SATCOM outage impact assessment?',
    weather: 'What are the current weather risks for field operations?'
  };
  const q = prompts[topic] || `Analyze current ${topic} situation`;
  addAiraMessage('user', q);
  airaThink(q);
}

// ============================================================
// DEMO SCENARIOS
// ============================================================
function demoScenario(scenario) {
  STATE.scenario = scenario;

  if (scenario === 'normal') {
    STATE.maitri.health = 87;
    STATE.bharati.health = 92;
    STATE.bharati.gen2.vibration = 18.4;
    STATE.bharati.gen2.temp = 89;
    STATE.maitri.windKt = 28;
    STATE.maitri.visKm = 8.2;
    addTimelineEvent('system', 'SYSTEM', 'Demo Reset', 'Operations returned to normal baseline.');
    addAiraMessage('aira', '✅ Scenario reset. All systems returned to nominal baseline. Monitoring active.');

  } else if (scenario === 'generator') {
    STATE.bharati.gen2.vibration = 24.6;
    STATE.bharati.gen2.temp = 96;
    STATE.bharati.gen2.status = 'critical';
    STATE.bharati.health = 74;
    addTimelineEvent('alert', 'BHARATI', '🚨 Generator 02 Critical', 'Vibration surged to 24.6 mm/s. Overtemp: 96°C. Immediate intervention required.');
    navigate('bharati');
    selectSubsystem('bharati', 'power', document.querySelector('#bharati-inspector .it-tab'));
    triggerAira('generator');

  } else if (scenario === 'blizzard') {
    STATE.maitri.windKt = 52;
    STATE.maitri.visKm = 0.8;
    STATE.maitri.temp = -31;
    STATE.maitri.health = 79;
    addTimelineEvent('alert', 'MAITRI', '🌨️ Blizzard Warning', 'Winds 52kt, visibility 0.8km. Field team recall recommended. All outdoor operations suspended.');
    addAiraMessage('aira', '🌨️ **BLIZZARD RISK — MAITRI**\n\nCurrent: 52kt winds, 0.8km visibility, -31°C\n\n⚠️ **IMMEDIATE ACTIONS:**\n1. Recall Snowcat SC-04 team — ETA 45min\n2. Suspend all outdoor operations\n3. Secure antenna array\n4. Activate emergency heating Mode-2\n5. Notify NCAOR Control of weather hold\n\nForecast: Storm peak in 3h, duration 8-12h. Fuel consumption will spike +40%.');

  } else if (scenario === 'satcom') {
    triggerSatcomOutage();

  } else if (scenario === 'critical') {
    STATE.bharati.gen2.vibration = 31.2;
    STATE.bharati.gen2.temp = 102;
    STATE.maitri.windKt = 58;
    STATE.maitri.fuel = 38;
    STATE.maitri.health = 62;
    STATE.bharati.health = 68;
    addTimelineEvent('alert', 'BOTH', '🚨 Multi-System Critical', 'Bharati Gen02 critical. Maitri blizzard + fuel low. Escalate to NCAOR.');
    addAiraMessage('aira', '🚨 **MULTI-SYSTEM CRITICAL STATE**\n\n**BHARATI:** Gen02 bearing failure imminent (31.2mm/s, 102°C). Load-shed immediately.\n\n**MAITRI:** Blizzard + low fuel (38%). Endurance critical at storm consumption rate.\n\n**RECOMMENDED ESCALATION:**\n1. Alert NCAOR Emergency Coordination Cell\n2. Prepare helicopter evacuation standby (weather permitting)\n3. Both stations enter Conservation Mode\n4. Expedite MV Nataraj resupply schedule');

  } else if (scenario === 'recover') {
    STATE.bharati.gen2.vibration = 12.1;
    STATE.bharati.gen2.temp = 78;
    STATE.maitri.windKt = 22;
    STATE.maitri.visKm = 10.5;
    STATE.maitri.fuel = 67;
    STATE.maitri.health = 89;
    STATE.bharati.health = 94;
    if (!STATE.satcomOnline) restoreSatcom();
    addTimelineEvent('system', 'BOTH', '✅ Recovery Complete', 'All systems returning to nominal. Gen02 bearing replaced. Storm cleared. SATCOM restored.');
    addAiraMessage('aira', '✅ **RECOVERY SEQUENCE COMPLETE**\n\nAll incidents resolved:\n• Gen02 bearing replaced — vibration 12.1 mm/s ✅\n• Storm cleared — winds 22kt, vis 10.5km ✅\n• Fuel resupply received — 67% ✅\n• SATCOM fully synchronized ✅\n\nStation health: Maitri 89 | Bharati 94\nMission Status: NOMINAL');
  }
}

function demoThenNavigate(scenario, page) {
  demoScenario(scenario);
  setTimeout(() => navigate(page), 500);
}

// ============================================================
// SATCOM SIMULATION
// ============================================================
function triggerSatcomOutage() {
  STATE.satcomOnline = false;
  STATE.satcomLostAt = Date.now();
  STATE.queuedMB = 0;

  document.getElementById('satcom-banner').classList.remove('hidden');
  document.getElementById('satcom-widget').classList.add('offline');
  setText('satcom-status-text', 'SATCOM LOST');

  document.getElementById('mission-pill').classList.remove('green');
  document.getElementById('mission-pill').classList.add('degraded');
  setText('mission-text', 'AUTONOMOUS MODE');

  document.body.style.setProperty('--banner-h', '36px');
  document.querySelector('.main-content').style.marginTop = 'calc(var(--nav-h) + 36px)';

  addTimelineEvent('alert', 'SYSTEM', '📡 SATCOM LOST', 'Link to GSAT-17 severed. Local Autonomous Mode activated. All data queuing locally.');
  addAiraMessage('aira', '📡 **SATCOM LOST — LOCAL AUTONOMOUS MODE ACTIVATED**\n\n🔴 Cloud AI: UNAVAILABLE (falling back to local rules)\n✅ Local monitoring: RUNNING\n✅ Local alerting: RUNNING\n⏳ Telemetry queuing at ~0.85 MB/s\n\nBoth stations continue operating independently per local protocols. Last remote sync captured. Will auto-resync on connectivity restore.');
}

function restoreSatcom() {
  if (STATE.satcomOnline) return;
  const queued = STATE.queuedMB;

  STATE.satcomOnline = true;
  STATE.satcomLostAt = null;

  document.getElementById('satcom-banner').classList.add('hidden');
  document.getElementById('satcom-widget').classList.remove('offline');
  setText('satcom-status-text', 'SATCOM LIVE');

  document.getElementById('mission-pill').classList.remove('degraded');
  document.getElementById('mission-pill').classList.add('');
  setText('mission-text', 'MISSION ACTIVE');

  document.querySelector('.main-content').style.marginTop = '';

  addTimelineEvent('system', 'SYSTEM', '✅ SATCOM Restored', `Link re-established. Syncing ${queued.toFixed(1)} MB queued telemetry. Conflict resolution by timestamp+ID.`);
  addAiraMessage('aira', `✅ **SATCOM RESTORED**\n\nSynchronizing ${queued.toFixed(1)} MB queued telemetry...\n\n• Events replayed by timestamp + event ID\n• No conflicts detected\n• Cloud AI: RESTORED\n\nAll systems back online. Mission status: NOMINAL.`);
}

// ============================================================
// TIMELINE EVENT PUSH
// ============================================================
function addTimelineEvent(type, station, title, desc) {
  const now = new Date().toUTCString().slice(17,22);
  STATE.timeline.unshift({ time: now, station: station.toLowerCase(), type, title, desc });
  if (STATE.currentPage === 'overview') renderTimeline();
}

// ============================================================
// INCIDENT MANAGEMENT
// ============================================================
function acknowledgeIncident(id, btn) {
  const card = document.getElementById(id);
  if (card && btn) {
    btn.textContent = '✓ Acknowledged';
    btn.disabled = true;
    btn.style.opacity = '0.6';
  }
  addAiraMessage('aira', `✅ Incident **${id.replace('incident-', '').replace('-', ' ').toUpperCase()}** acknowledged. Monitoring active.`);
}

function resolveIncident(id) {
  const card = document.getElementById(id);
  if (card) {
    card.classList.add('resolved');
    card.style.animation = 'fadeOut 0.5s ease forwards';
    setTimeout(() => { if (card.parentElement) card.parentElement.removeChild(card); }, 500);
    const countEl = document.getElementById('cmd-incidents');
    if (countEl) countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
  }
  addTimelineEvent('system', 'SYSTEM', `✅ Incident Resolved`, `${id.replace('incident-','')} incident marked resolved.`);
}

function clearResolvedIncidents() {
  document.querySelectorAll('.incident-card.resolved').forEach(c => c.remove());
}

// ============================================================
// ALERT DRAWER
// ============================================================
function toggleAlertDrawer() {
  const drawer = document.getElementById('alert-drawer');
  STATE.alertDrawerOpen = !STATE.alertDrawerOpen;
  drawer.classList.toggle('open', STATE.alertDrawerOpen);
  drawer.classList.toggle('hidden', false);
}

// ============================================================
// DEMO PANEL
// ============================================================
function toggleDemoPanel() {
  const panel = document.getElementById('demo-panel');
  STATE.demoPanelOpen = !STATE.demoPanelOpen;
  panel.classList.toggle('hidden', !STATE.demoPanelOpen);
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'd') { e.preventDefault(); toggleDemoPanel(); }
  if (e.ctrlKey && e.key === 'a') { e.preventDefault(); toggleAira(); }
  if (e.key === 'Escape') {
    if (STATE.alertDrawerOpen) toggleAlertDrawer();
    if (STATE.demoPanelOpen) toggleDemoPanel();
  }
  if (e.altKey) {
    const keys = { '1': 'overview', '2': 'command', '3': 'maitri', '4': 'bharati' };
    if (keys[e.key]) { e.preventDefault(); navigate(keys[e.key]); }
  }
});

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
  // Render initial timeline
  renderTimeline();

  // Draw overview rings
  drawHealthRing('maitri-health-canvas', 87, '#f59e0b');
  drawHealthRing('bharati-health-canvas', 92, '#00d4ff');

  // Initial map draw
  drawAntarcticaMap();

  // Seed chart data
  for (let i = 0; i < 30; i++) {
    const t = i / 29;
    STATE.chartData.power.maitri.push(360 + Math.sin(t * 6) * 25 + (Math.random() - 0.5) * 15);
    STATE.chartData.power.bharati.push(400 + Math.sin(t * 5 + 1) * 20 + (Math.random() - 0.5) * 12);
    STATE.chartData.temp.maitri.push(-24 + Math.sin(t * 4) * 2 + (Math.random() - 0.5));
    STATE.chartData.temp.bharati.push(-18 + Math.sin(t * 3.5) * 1.5 + (Math.random() - 0.5));
    STATE.chartData.latency.maitri.push(620 + Math.sin(t * 8) * 50 + (Math.random() - 0.5) * 30);
    STATE.chartData.latency.bharati.push(480 + Math.sin(t * 7) * 40 + (Math.random() - 0.5) * 20);
    STATE.chartData.power.labels.push(`${i}m`);
  }

  // Start simulation loops
  setInterval(simulateTelemetry, 2000);
  setInterval(updateClock, 1000);
  setInterval(drawAntarcticaMap, 100); // animated satellite

  // Auto-seed some timeline events
  updateAlertsState();
  renderTimeline();

  // Init inspector for maitri
  renderInspector('maitri');
  renderInspector('bharati');

  // Animate health display on load
  let score = 0;
  const targetM = 87, targetB = 92;
  const ring = setInterval(() => {
    score += 2;
    if (score >= Math.max(targetM, targetB)) { clearInterval(ring); }
    const sm = Math.min(score, targetM);
    const sb = Math.min(score, targetB);
    drawHealthRing('maitri-health-canvas', sm, '#f59e0b');
    drawHealthRing('bharati-health-canvas', sb, '#00d4ff');
  }, 20);

  console.log('%c🧊 POLARIS v1.0 — Antarctic Operations Portal', 'color:#00d4ff;font-weight:bold;font-size:14px');
  console.log('%cPress Ctrl+D for Demo Mode | Ctrl+A to toggle AIRA | Alt+1-4 for pages', 'color:#666;font-size:11px');
}

// Boot
window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
  drawAntarcticaMap();
  if (STATE.currentPage === 'maitri') renderMaitriTwin();
  if (STATE.currentPage === 'bharati') renderBharatiTwin();
  if (STATE.currentPage === 'command') renderCommandCharts();
});
