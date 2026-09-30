/* ============================================================
   POLARIS — Indian Antarctic Remote Operations Portal
   National Centre for Polar & Ocean Research (NCPOR)
   Application Logic — Dual Theme Engine, View Switcher & Simulation
   ============================================================ */

// Application State
const STATE = {
  theme: localStorage.getItem('polaris_theme') || 'bright',
  currentView: 'home',
  selectedStation: 'maitri',
  currentTrendMetric: 'power',
  adminMapMode: '2d',
  animationTimer: null,
  mapAnimTime: 0,
  
  // Real-time telemetry values
  maitri: {
    temp: -12.4,
    windKt: 18,
    humidity: 78,
    power: 420,
    powerMax: 510,
    powerPct: 82,
    water: 76,
    fuel: 68,
    crew: 24,
    crewTotal: 25,
    health: 94
  },
  bharati: {
    temp: -8.6,
    windKt: 12,
    humidity: 72,
    power: 380,
    powerMax: 440,
    powerPct: 88,
    water: 79,
    fuel: 81,
    crew: 20,
    crewTotal: 24,
    health: 91
  }
};

// ============================================================
// THEME SWITCHING ENGINE (BRIGHT <-> DARK)
// ============================================================

function initTheme() {
  setTheme(STATE.theme);
}

function toggleTheme() {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'bright' : 'dark';
  setTheme(newTheme);
}

function setTheme(theme) {
  STATE.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('polaris_theme', theme);

  // Update Page 1 Theme-Specific Visual Assets
  const heroBg = document.getElementById('hero-dynamic-bg');
  if (heroBg) {
    heroBg.src = theme === 'dark' ? 'assets/hero_globe_dark.png' : 'assets/hero_globe_bright.png';
  }

  const cardCmd = document.getElementById('card-img-command');
  if (cardCmd) {
    cardCmd.src = theme === 'dark' ? 'assets/card_header_command_dark.png' : 'assets/card_header_command_bright.png';
  }

  const cardMaitri = document.getElementById('card-img-maitri');
  if (cardMaitri) {
    cardMaitri.src = theme === 'dark' ? 'assets/card_header_maitri_dark.png' : 'assets/card_header_maitri_bright.png';
  }

  const cardBharati = document.getElementById('card-img-bharati');
  if (cardBharati) {
    cardBharati.src = theme === 'dark' ? 'assets/card_header_bharati_dark.png' : 'assets/card_header_bharati_bright.png';
  }

  const mottoBg = document.getElementById('motto-bg-img');
  if (mottoBg) {
    mottoBg.src = theme === 'dark' ? 'assets/motto_bg_dark.png' : 'assets/motto_bg_bright.png';
  }

  // Station and Command page backgrounds
  const maitriThumb = document.getElementById('spc-thumb-maitri');
  if (maitriThumb) {
    maitriThumb.src = theme === 'dark' ? 'assets/station_maitri_thumb_dark.png' : 'assets/station_maitri_thumb_bright.png';
  }

  const bharatiThumb = document.getElementById('spc-thumb-bharati');
  if (bharatiThumb) {
    bharatiThumb.src = theme === 'dark' ? 'assets/station_bharati_thumb_dark.png' : 'assets/station_bharati_thumb_bright.png';
  }

  const stationBg = document.getElementById('station-main-bg');
  if (stationBg) {
    const isBharati = STATE.selectedStation === 'bharati' || (typeof window !== 'undefined' && window.location.pathname.includes('bharati'));
    if (isBharati) {
      stationBg.src = theme === 'dark' ? 'assets/station_bharati_panorama_dark.png' : 'assets/station_bharati_panorama_bright.png';
    } else {
      stationBg.src = theme === 'dark' ? 'assets/station_maitri_panorama_dark.png' : 'assets/station_maitri_panorama_bright.png';
    }
  }

  // Camera strip cards
  for (let i = 1; i <= 4; i++) {
    const camImg = document.getElementById(`cam-img-${i}`);
    if (camImg) {
      camImg.src = theme === 'dark' ? `assets/cam${i}_card_dark.png` : `assets/cam${i}_card_bright.png`;
    }
  }

  // Right-hand widget camera preview
  const widgetCam = document.getElementById('widget-cam-thumb');
  if (widgetCam) {
    widgetCam.src = theme === 'dark' ? 'assets/widget_cam_preview_dark.png' : 'assets/widget_cam_preview_bright.png';
  }

  // Redraw canvases
  renderSensorTrendsChart(STATE.currentTrendMetric);
  drawAdminMap();
}

// ============================================================
// PAGE VIEW ROUTING (HOME / STATIONS / COMMAND)
// ============================================================

function switchView(viewName, station = null) {
  STATE.currentView = viewName;

  // Update navbar active states
  ['home', 'stations', 'command'].forEach(v => {
    const navBtn = document.getElementById(`nav-btn-${v}`);
    if (navBtn) {
      navBtn.classList.toggle('active', v === viewName);
    }
    const viewSection = document.getElementById(`view-${v}`);
    if (viewSection) {
      viewSection.classList.toggle('active', v === viewName);
    }
  });

  // If specific station passed
  if (station) {
    selectStation(station);
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Trigger relevant canvas redraws after view becomes visible
  setTimeout(() => {
    if (viewName === 'stations') {
      renderSensorTrendsChart(STATE.currentTrendMetric);
    } else if (viewName === 'command') {
      drawAdminMap();
    }
  }, 50);
}

// ============================================================
// STATION SWITCHER (MAITRI VS BHARATI)
// ============================================================

function selectStation(station) {
  STATE.selectedStation = station;

  const maitriBtn = document.getElementById('spc-maitri');
  const bharatiBtn = document.getElementById('spc-bharati');
  if (maitriBtn) maitriBtn.classList.toggle('active', station === 'maitri');
  if (bharatiBtn) bharatiBtn.classList.toggle('active', station === 'bharati');

  const titleEl = document.getElementById('ops-station-name-heading');
  const coordsEl = document.getElementById('ops-station-coords-label');
  const stationBg = document.getElementById('station-main-bg');

  if (station === 'maitri') {
    if (titleEl) titleEl.textContent = 'Maitri Research Station';
    if (coordsEl) coordsEl.textContent = "70°45'S, 11°44'E • EAST ANTARCTICA";
    if (stationBg) {
      stationBg.src = STATE.theme === 'dark' ? 'assets/station_maitri_panorama_dark.png' : 'assets/station_maitri_panorama_bright.png';
    }
  } else {
    if (titleEl) titleEl.textContent = 'Bharati Research Station';
    if (coordsEl) coordsEl.textContent = "69°24'S, 76°11'E • LARSEMANN HILLS • EAST ANTARCTICA";
    if (stationBg) {
      stationBg.src = STATE.theme === 'dark' ? 'assets/station_bharati_panorama_dark.png' : 'assets/station_bharati_panorama_bright.png';
    }
  }
}

// ============================================================
// SENSOR TRENDS 24H CANVAS CHART
// ============================================================

const TREND_DATA = {
  power: [410, 415, 412, 420, 422, 418, 425, 420, 415, 422, 420, 418],
  temp: [-14, -13.5, -13, -12.4, -12.0, -11.8, -12.2, -12.4, -12.8, -13.2, -13.6, -14],
  wind: [14, 15, 17, 18, 20, 22, 19, 18, 17, 16, 17, 18],
  fuel: [105, 104.8, 104.5, 104.2, 103.9, 103.5, 103.1, 102.8, 102.5, 102.2, 102.0, 102.0]
};

function switchSensorTrend(metric, btn) {
  STATE.currentTrendMetric = metric;
  document.querySelectorAll('.st-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderSensorTrendsChart(metric);
}

function renderSensorTrendsChart(metric = 'power') {
  const canvas = document.getElementById('sensor-trend-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth || 260;
  const H = canvas.height = canvas.offsetHeight || 48;

  ctx.clearRect(0, 0, W, H);

  const values = TREND_DATA[metric] || TREND_DATA.power;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  const minVal = Math.min(...values) * 0.95;
  const maxVal = Math.max(...values) * 1.05;
  const range = maxVal - minVal || 1;
  const stepX = (W - 20) / (values.length - 1);

  // Subtle grid lines
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11, 46, 89, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const y = H * (i / 4);
    ctx.beginPath();
    ctx.moveTo(10, y);
    ctx.lineTo(W - 10, y);
    ctx.stroke();
  }

  // Curve gradient fill
  const strokeColor = metric === 'fuel' ? '#ff7a00' : isDark ? '#00d4ff' : '#0077e6';
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, isDark ? 'rgba(0, 212, 255, 0.35)' : 'rgba(0, 119, 230, 0.25)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.beginPath();
  values.forEach((v, i) => {
    const x = 10 + i * stepX;
    const y = H - 15 - ((v - minVal) / range) * (H - 30);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(10 + (values.length - 1) * stepX, H);
  ctx.lineTo(10, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw smooth line
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = 10 + i * stepX;
    const y = H - 15 - ((v - minVal) / range) * (H - 30);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // End point pulse dot
  const lastX = 10 + (values.length - 1) * stepX;
  const lastY = H - 15 - ((values[values.length - 1] - minVal) / range) * (H - 30);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
  ctx.fillStyle = strokeColor;
  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ============================================================
// CONTINENTAL ANTARCTICA MAP (COMMAND CONTROL VIEW)
// ============================================================

function setAdminMapMode(mode, btn) {
  STATE.adminMapMode = mode;
  document.querySelectorAll('.map-view-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  drawAdminMap();
}

function drawAdminMap() {
  const canvas = document.getElementById('admin-canvas-map');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth || 500;
  const H = canvas.height = canvas.offsetHeight || 380;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  ctx.clearRect(0, 0, W, H);

  // Background tint
  ctx.fillStyle = isDark ? '#061528' : '#0d2847';
  ctx.fillRect(0, 0, W, H);

  // Latitude circles
  ctx.strokeStyle = isDark ? 'rgba(0, 212, 255, 0.08)' : 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.54, i * 40, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Antarctica Continent Outline (Simplified Stylized Polar Contour)
  ctx.beginPath();
  const pts = [
    [0.26 * W, 0.78 * H], [0.18 * W, 0.62 * H], [0.20 * W, 0.44 * H],
    [0.28 * W, 0.35 * H], [0.38 * W, 0.28 * H], [0.46 * W, 0.22 * H],
    [0.55 * W, 0.24 * H], [0.65 * W, 0.28 * H], [0.74 * W, 0.36 * H],
    [0.82 * W, 0.48 * H], [0.80 * W, 0.64 * H], [0.72 * W, 0.78 * H],
    [0.58 * W, 0.86 * H], [0.44 * W, 0.88 * H], [0.34 * W, 0.85 * H]
  ];
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();

  // Ice shelf fill
  const iceGrad = ctx.createRadialGradient(W*0.5, H*0.5, 20, W*0.5, H*0.5, W*0.4);
  if (isDark) {
    iceGrad.addColorStop(0, 'rgba(100, 180, 255, 0.25)');
    iceGrad.addColorStop(1, 'rgba(20, 80, 150, 0.12)');
  } else {
    iceGrad.addColorStop(0, 'rgba(180, 220, 255, 0.35)');
    iceGrad.addColorStop(1, 'rgba(60, 130, 210, 0.18)');
  }
  ctx.fillStyle = iceGrad;
  ctx.fill();

  ctx.strokeStyle = isDark ? 'rgba(0, 212, 255, 0.5)' : 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Stations Positions
  const maitriX = W * 0.38;
  const maitriY = H * 0.42;
  const bharatiX = W * 0.68;
  const bharatiY = H * 0.52;
  const satX = W * 0.52;
  const satY = H * 0.18;

  // Pulsing Satellite & Data Arcs
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
  ctx.lineWidth = 1.5;

  // Arc Sat -> Maitri
  ctx.beginPath();
  ctx.moveTo(satX, satY);
  ctx.quadraticCurveTo(W * 0.42, H * 0.28, maitriX, maitriY);
  ctx.stroke();

  // Arc Sat -> Bharati
  ctx.beginPath();
  ctx.moveTo(satX, satY);
  ctx.quadraticCurveTo(W * 0.62, H * 0.32, bharatiX, bharatiY);
  ctx.stroke();
  ctx.setLineDash([]);

  // GSAT-17 Satellite Icon
  ctx.beginPath();
  ctx.arc(satX, satY, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#00d4ff';
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = '10px Plus Jakarta Sans, sans-serif';
  ctx.fillText('GSAT-17 (ISRO)', satX + 10, satY + 4);

  // Maitri Beacon (Orange)
  ctx.beginPath();
  ctx.arc(maitriX, maitriY, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#ff7a00';
  ctx.shadowColor = '#ff7a00';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.fillText('Maitri', maitriX - 16, maitriY + 20);

  // Bharati Beacon (Cyan)
  ctx.beginPath();
  ctx.arc(bharatiX, bharatiY, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#00d4ff';
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.fillText('Bharati', bharatiX - 18, bharatiY + 20);

  // Central Title
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.6)';
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.letterSpacing = '0.1em';
  ctx.fillText('A N T A R C T I C A', W * 0.40, H * 0.62);
}

// ============================================================
// HOTSPOT MODAL / DIAGNOSTIC INSPECTOR
// ============================================================

function openHotspotInfo(title, description) {
  alert(`[NCPOR Subsystem Diagnostic]\n\n📍 ${title}\n${description}\n\nStatus: Online & Streaming (2s refresh)`);
}

// ============================================================
// ADMIN RIGHT TABS SWITCHER
// ============================================================

function switchAdminRightTab(tab, btn) {
  document.querySelectorAll('.admin-tab-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const content = document.getElementById('admin-right-content');
  if (!content) return;

  if (tab === 'alerts') {
    content.innerHTML = `
      <div class="alert-row-item">
        <span class="alert-badge-tag high">HIGH</span>
        <div class="alert-text-body">
          <span class="atb-title">Wind speed high at Bharati</span>
          <span class="atb-sub">14:18 • 42 km/h (Threshold 40 km/h)</span>
        </div>
      </div>
      <div class="alert-row-item">
        <span class="alert-badge-tag medium">MEDIUM</span>
        <div class="alert-text-body">
          <span class="atb-title">Generator 2 bearing check</span>
          <span class="atb-sub">11:05 • Maitri Research Station</span>
        </div>
      </div>
      <div class="alert-row-item">
        <span class="alert-badge-tag info">INFO</span>
        <div class="alert-text-body">
          <span class="atb-title">Sea ice shift telemetry</span>
          <span class="atb-sub">09:26 • Near Bharati (AI Analysis)</span>
        </div>
      </div>
    `;
  } else if (tab === 'insights') {
    content.innerHTML = `
      <div class="alert-row-item">
        <span class="alert-badge-tag info">AI INSIGHT</span>
        <div class="alert-text-body">
          <span class="atb-title">Weather window optimal</span>
          <span class="atb-sub">Next 48h suitable for field helicopter survey</span>
        </div>
      </div>
      <div class="alert-row-item">
        <span class="alert-badge-tag info">AI INSIGHT</span>
        <div class="alert-text-body">
          <span class="atb-title">Sea ice drift pattern shift</span>
          <span class="atb-sub">Model predicts 12% faster drift near bay</span>
        </div>
      </div>
      <div class="alert-row-item">
        <span class="alert-badge-tag info">AI INSIGHT</span>
        <div class="alert-text-body">
          <span class="atb-title">Thermal efficiency peak</span>
          <span class="atb-sub">Living module heat recovery operating at 91%</span>
        </div>
      </div>
    `;
  } else {
    content.innerHTML = `
      <div class="alert-row-item" style="border-left: 3px solid var(--accent-green)">
        <div class="alert-text-body">
          <span class="atb-title">Emergency Response Team</span>
          <span class="atb-sub">All station safety squads on Standby Tier 1</span>
        </div>
      </div>
      <div class="alert-row-item" style="border-left: 3px solid var(--accent-green)">
        <div class="alert-text-body">
          <span class="atb-title">Medical Bay Readiness</span>
          <span class="atb-sub">Oxygen &amp; Hyperbaric systems nominal</span>
        </div>
      </div>
    `;
  }
}

// ============================================================
// PROTOTYPE MODAL ENGINE & OPERATIONAL TAB HANDLERS
// ============================================================

function showPrototypeModal(title, htmlBody) {
  let modal = document.getElementById('global-prototype-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'global-prototype-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
      z-index: 10000; display: flex; align-items: center; justify-content: center;
      padding: 20px; box-sizing: border-box;
    `;
    modal.onclick = (e) => { if (e.target === modal) closePrototypeModal(); };
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:var(--bg-card); border:1px solid var(--border-medium); border-radius:12px; width:100%; max-width:620px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 20px 40px rgba(0,0,0,0.3); overflow:hidden;" onclick="event.stopPropagation()">
      <div style="padding:16px 22px; border-bottom:1px solid var(--border-light); display:flex; justify-content:space-between; align-items:center; background:var(--bg-card-subtle);">
        <h3 style="margin:0; font-size:16px; color:var(--text-primary); font-weight:800;">${title}</h3>
        <button onclick="closePrototypeModal()" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-muted);">&times;</button>
      </div>
      <div style="padding:22px; overflow-y:auto; font-size:13.5px; color:var(--text-secondary); line-height:1.6;">
        ${htmlBody}
      </div>
      <div style="padding:12px 22px; border-top:1px solid var(--border-light); display:flex; justify-content:flex-end; gap:10px; background:var(--bg-card-subtle);">
        <button onclick="closePrototypeModal()" style="background:var(--accent-blue); color:#fff; border:none; padding:8px 18px; border-radius:6px; font-weight:700; font-size:12.5px; cursor:pointer;">Acknowledge &bull; Close</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

function closePrototypeModal() {
  const modal = document.getElementById('global-prototype-modal');
  if (modal) modal.style.display = 'none';
}

function openHotspotInfo(title, description) {
  showPrototypeModal(`📍 ${title} &bull; Subsystem Telemetry`, `
    <div style="background:var(--bg-secondary); border-left:3px solid var(--accent-blue); padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:14px;">
      <strong style="color:var(--text-primary); display:block; font-size:14px; margin-bottom:4px;">${title}</strong>
      <span>${description}</span>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:12.5px; margin-bottom:12px;">
      <div style="background:var(--bg-card-subtle); border:1px solid var(--border-light); padding:10px; border-radius:6px;">
        <span style="color:var(--text-muted); display:block;">Telemetry Uplink</span>
        <strong style="color:var(--accent-green);">&#x25CF; Online (100 Hz Stream)</strong>
      </div>
      <div style="background:var(--bg-card-subtle); border:1px solid var(--border-light); padding:10px; border-radius:6px;">
        <span style="color:var(--text-muted); display:block;">Health Rating</span>
        <strong style="color:var(--accent-blue);">99.4% Nominal</strong>
      </div>
    </div>
    <p style="font-size:12px; color:var(--text-muted); margin:0;">Automated telemetry calibrated under Ministry of Earth Sciences (MoES) protocol standards.</p>
  `);
}

function setOpsTab(tabName, btn) {
  document.querySelectorAll('.ops-left-sidebar .sidebar-nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (tabName === 'overview') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tabName === 'cameras') {
    const el = document.querySelector('.live-camera-strip-card');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else if (tabName === 'machines') {
    showPrototypeModal('⚙️ Machine Health & Power Diagnostics', `
      <p>Real-time telemetry from station mechanical plants and diesel-electric microgrid:</p>
      <div style="display:flex; flex-direction:column; gap:10px; margin:14px 0;">
        <div style="background:var(--bg-secondary); padding:10px 14px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>DG Unit #1:</strong> 210 kW Load &bull; 82°C Jacket Water</span>
          <span style="color:var(--accent-green); font-weight:700;">NORMAL</span>
        </div>
        <div style="background:var(--bg-secondary); padding:10px 14px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>DG Unit #2:</strong> 210 kW Load &bull; Vibration 3.4 mm/s</span>
          <span style="color:var(--accent-orange); font-weight:700;">CAUTION &lt; 3.5</span>
        </div>
        <div style="background:var(--bg-secondary); padding:10px 14px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>Pipeline Trace Heating:</strong> Circuit #2 active (+4.2°C)</span>
          <span style="color:var(--accent-green); font-weight:700;">HEATING</span>
        </div>
        <div style="background:var(--bg-secondary); padding:10px 14px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>Battery Bank (48V / 2400 Ah):</strong> Float Charge 54.2V</span>
          <span style="color:var(--accent-green); font-weight:700;">98.4%</span>
        </div>
      </div>
    `);
  } else if (tabName === 'environment') {
    window.location.href = 'livedata.html';
  } else if (tabName === 'research') {
    showPrototypeModal('🔬 Research Ops & Active Scientific Experiments', `
      <p>National Polar Data Repository active observatories streaming live datasets:</p>
      <ul style="padding-left:18px; line-height:1.8;">
        <li><strong>Geomagnetic Observatory:</strong> 3-axis fluxgate magnetometer (IIG Mumbai) &bull; Streaming 1-sec variometer records</li>
        <li><strong>Atmospheric &amp; Ozone Soundings:</strong> Dobson spectrophotometer &amp; ozonesonde balloon sorties nominal</li>
        <li><strong>Meteorological Radiation:</strong> Net radiometer, pyranometer, and boundary layer sonic anemometer</li>
        <li><strong>Seismology:</strong> Broadband 3-component digital seismometer (NGRI Hyderabad)</li>
      </ul>
      <a href="resources.html" style="color:var(--accent-blue); font-weight:700; text-decoration:none;">Download Calibrated Callsets in Resources &rarr;</a>
    `);
  } else if (tabName === 'supplies') {
    showPrototypeModal('📦 Supplies, Consumables & Logistics Projection', `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
        <div style="background:var(--bg-secondary); padding:12px; border-radius:8px;">
          <span style="font-size:11px; text-transform:uppercase; color:var(--text-muted);">Fuel Endurance</span>
          <h4 style="margin:4px 0; font-size:18px; color:var(--accent-blue);">58 Days Reserve</h4>
          <span style="font-size:12px;">Pre-conditioned Jet A-1</span>
        </div>
        <div style="background:var(--bg-secondary); padding:12px; border-radius:8px;">
          <span style="font-size:11px; text-transform:uppercase; color:var(--text-muted);">Potable Water Stock</span>
          <h4 style="margin:4px 0; font-size:18px; color:var(--accent-green);">38.0 m³ Available</h4>
          <span style="font-size:12px;">Daily burn: 1.8 m³/day</span>
        </div>
      </div>
      <p style="font-size:13px;">Next resupply scheduled via Antarctic chartered icebreaker <em>MV Vasiliy Golovnin</em> during 45th Indian Antarctic Expedition.</p>
    `);
  } else if (tabName === 'crew') {
    showPrototypeModal('👥 Winter-Over Expedition Crew Roster', `
      <p>Personnel stationed on continent for 365-day polar isolation mission:</p>
      <div style="display:flex; flex-direction:column; gap:8px; margin:14px 0;">
        <div style="display:flex; justify-content:space-between; padding:8px 12px; background:var(--bg-secondary); border-radius:6px;">
          <span><strong>Dr. Arvind Saxena</strong> &bull; Station Commander &amp; Glaciologist</span>
          <span style="color:var(--accent-green); font-weight:700;">FIT</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 12px; background:var(--bg-secondary); border-radius:6px;">
          <span><strong>Dr. Priya Nambiar</strong> &bull; Expedition Medical Officer (AIIMS)</span>
          <span style="color:var(--accent-green); font-weight:700;">FIT</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 12px; background:var(--bg-secondary); border-radius:6px;">
          <span><strong>Er. Rajesh Verma</strong> &bull; Chief Mechanical &amp; Power Engineer</span>
          <span style="color:var(--accent-green); font-weight:700;">FIT</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 12px; background:var(--bg-secondary); border-radius:6px;">
          <span><strong>Suresh Kumar</strong> &bull; SATCOM &amp; Telemetry Specialist (ISRO)</span>
          <span style="color:var(--accent-green); font-weight:700;">FIT</span>
        </div>
      </div>
      <span style="font-size:12px; color:var(--text-muted);">Total: 24 active personnel &bull; 0 in sick bay &bull; Quarantine protocol active.</span>
    `);
  } else if (tabName === 'reports') {
    downloadStationSITREP();
  }
}

function setAdminTab(tabName, btn) {
  document.querySelectorAll('.admin-layout-grid .ops-left-sidebar .sidebar-nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (tabName === 'stations') {
    showPrototypeModal('🛰️ Polar Stations Operations', `
      <p>Select station to inspect real-time digital twin:</p>
      <div style="display:flex; gap:12px; margin-top:14px;">
        <button onclick="window.location.href='maitri.html'" style="flex:1; padding:14px; background:#ff7a00; color:#fff; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Open Maitri (Oasis) &rarr;</button>
        <button onclick="window.location.href='bharati.html'" style="flex:1; padding:14px; background:#0077e6; color:#fff; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Open Bharati (Coast) &rarr;</button>
      </div>
    `);
  } else if (tabName === 'comms') {
    showPrototypeModal('📡 ISRO / GSAT Satellite Comms Telemetry', `
      <div style="background:var(--bg-secondary); padding:14px; border-radius:8px; font-family:'JetBrains Mono'; font-size:12.5px; line-height:1.6;">
        <div>UPLINK CARRIER: GSAT-17 C-band 4.8 GHz</div>
        <div>DOWNLINK CARRIER: 3.6 GHz Nominal</div>
        <div>BIT ERROR RATE: &lt; 1.2 x 10^-9</div>
        <div>LATENCY (ROUND TRIP): 620 ms</div>
        <div>AUTOMATED TRACKING SERVO: Locked (Az: 142.4°, El: 31.8°)</div>
      </div>
    `);
  } else if (tabName === 'alerts') {
    switchAdminRightTab('alerts');
  } else if (tabName === 'supplies') {
    setOpsTab('supplies');
  } else if (tabName === 'crew') {
    setOpsTab('crew');
  } else if (tabName === 'machines') {
    setOpsTab('machines');
  } else if (tabName === 'research') {
    setOpsTab('research');
  }
}

function downloadStationSITREP() {
  const content = `================================================================================
NATIONAL CENTRE FOR POLAR & OCEAN RESEARCH (NCPOR)
MINISTRY OF EARTH SCIENCES, GOVERNMENT OF INDIA
DAILY ANTARCTIC OPERATIONS SITUATION REPORT (SITREP)
================================================================================
Date/Time UTC : ${new Date().toISOString()}
Reporting Post : Antarctic Remote Operations Center (Goa)

1. STATION STATUS SUMMARY:
--------------------------------------------------------------------------------
- Maitri Research Station (70°45'S, 11°44'E)  : ONLINE - All Subsystems Nominal
- Bharati Research Station (69°24'S, 76°11'E) : ONLINE - All Subsystems Nominal

2. METEOROLOGICAL TELEMETRY:
--------------------------------------------------------------------------------
- Maitri  : Temp -12.4°C | Wind 18.0 kt SE | Pressure 984.2 hPa
- Bharati : Temp -8.6°C  | Wind 12.0 kt SE | Pressure 988.4 hPa

3. MICROGRID & ENERGY INVENTORY:
--------------------------------------------------------------------------------
- Maitri Primary Load   : 420 kW / 510 kW (82% base load)
- Bharati Cogeneration  : 380 kW / 440 kW (88% base load)
- Total HSD Fuel Stock  : 242 kl combined (68 days operational autonomy)

4. EXPEDITION PERSONNEL:
--------------------------------------------------------------------------------
- Total Crew Stationed  : 44 Personnel (24 Maitri, 20 Bharati)
- Medical Readiness     : 100% Fit, Nil Inpatients

5. SATELLITE COMMS LINK:
--------------------------------------------------------------------------------
- Carrier Status        : ISRO GSAT-17 Transponder Synchronized (12.4 Mbps / 20.0 Mbps)

Authorized Signature:
Mission Operations Controller, NCPOR
================================================================================
`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NCPOR_ANTARCTIC_SITREP_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ============================================================
// REALTIME CLOCK & PERIODIC TELEMETRY UPDATES
// ============================================================

function updateClock() {
  const clockEl = document.getElementById('realtime-clock');
  if (!clockEl) return;
  const now = new Date();
  
  // Format IST time
  const options = { 
    timeZone: 'Asia/Kolkata', 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: false 
  };
  const str = now.toLocaleString('en-IN', options).replace(/,/g, '');
  clockEl.textContent = `${str} IST`;
}

// Window resize handler
window.addEventListener('resize', () => {
  if (STATE.currentView === 'stations') {
    renderSensorTrendsChart(STATE.currentTrendMetric);
  } else if (STATE.currentView === 'command') {
    drawAdminMap();
  }
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateClock();
  setInterval(updateClock, 1000);
  initClerkAuth();
  checkAuthRoutingOnLoad();
  
  // Initial canvas draw
  setTimeout(() => {
    drawAdminMap();
    renderSensorTrendsChart(STATE.currentTrendMetric);
  }, 100);
});

// Check if user arrived via redirect with view/station params
function checkAuthRoutingOnLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetView = urlParams.get('view');
  const targetStation = urlParams.get('station');
  const isAuthParam = urlParams.get('auth');

  if (isAuthParam) {
    if (!sessionStorage.getItem('polaris_auth_user') && !localStorage.getItem('polaris_auth_user')) {
      const mockAuth = {
        fullName: 'Expeditions Officer',
        role: 'Verified Expedition Personnel',
        authenticatedAt: new Date().toISOString()
      };
      try {
        sessionStorage.setItem('polaris_auth_user', JSON.stringify(mockAuth));
        localStorage.setItem('polaris_auth_user', JSON.stringify(mockAuth));
      } catch (e) {}
    }
  }

  updateAuthUI();

  if (targetView && targetView !== 'home') {
    setTimeout(() => {
      switchView(targetView, targetStation);
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {}
    }, 150);
  }
}

// ============================================================
// CLERK AUTHENTICATION INTEGRATION & PORTAL SIGN-IN HANDLER
// ============================================================

function getAuthenticatedUser() {
  const sessionUser = sessionStorage.getItem('polaris_auth_user');
  if (sessionUser) {
    try { return JSON.parse(sessionUser); } catch (e) {}
  }
  const localUser = localStorage.getItem('polaris_auth_user');
  if (localUser) {
    try { return JSON.parse(localUser); } catch (e) {}
  }
  if (typeof Clerk !== 'undefined' && Clerk.user) {
    return {
      fullName: Clerk.user.fullName || Clerk.user.firstName || 'Expedition Officer',
      email: Clerk.user.primaryEmailAddress ? Clerk.user.primaryEmailAddress.emailAddress : '',
      role: 'Clerk Verified User',
      id: Clerk.user.id
    };
  }
  return null;
}

function updateAuthUI() {
  const user = getAuthenticatedUser();
  const btnCommand = document.getElementById('btn-signin-command');
  const btnMaitri = document.getElementById('btn-signin-maitri');
  const btnBharati = document.getElementById('btn-signin-bharati');
  const statusIndicator = document.querySelector('.system-status-indicator');

  if (user) {
    if (btnCommand) btnCommand.innerHTML = 'Enter Command &rarr;';
    if (btnMaitri) btnMaitri.innerHTML = 'Access Maitri &rarr;';
    if (btnBharati) btnBharati.innerHTML = 'Access Bharati &rarr;';

    const shortName = (user.fullName || user.role || 'Officer').split(' ')[0];
    if (statusIndicator) {
      statusIndicator.innerHTML = `
        <span class="pulse-dot-green"></span>
        <span>Auth: <strong style="color:var(--accent-green);cursor:pointer;" onclick="signOutUser()" title="Click to Sign Out">${shortName} &times;</strong></span>
      `;
    }
  } else {
    if (btnCommand) btnCommand.innerHTML = 'Sign In &rarr;';
    if (btnMaitri) btnMaitri.innerHTML = 'Sign In &rarr;';
    if (btnBharati) btnBharati.innerHTML = 'Sign In &rarr;';

    if (statusIndicator) {
      statusIndicator.innerHTML = `
        <span class="pulse-dot-green"></span>
        <span>System Online</span>
      `;
    }
  }
}

function handlePortalSignIn(targetView, station = null) {
  const user = getAuthenticatedUser();

  if (user) {
    // Already authenticated: directly switch to the requested view
    switchView(targetView, station);
  } else {
    // Not authenticated: save redirect state and navigate directly to signin.html
    const redirectInfo = { view: targetView, station: station };
    try {
      sessionStorage.setItem('polaris_auth_redirect', JSON.stringify(redirectInfo));
      localStorage.setItem('polaris_auth_redirect', JSON.stringify(redirectInfo));
    } catch (e) {}

    let dest = 'signin.html?view=' + encodeURIComponent(targetView);
    if (station) {
      dest += '&station=' + encodeURIComponent(station);
    }
    window.location.href = dest;
  }
}

function signOutUser() {
  if (confirm('Sign out from Antarctic Operations Portal?')) {
    try {
      sessionStorage.removeItem('polaris_auth_user');
      localStorage.removeItem('polaris_auth_user');
      sessionStorage.removeItem('polaris_auth_redirect');
      localStorage.removeItem('polaris_auth_redirect');
    } catch (e) {}

    if (typeof Clerk !== 'undefined' && typeof Clerk.signOut === 'function') {
      try { Clerk.signOut(); } catch (e) {}
    }
    updateAuthUI();
    switchView('home');
  }
}

async function initClerkAuth() {
  const clerkKey = 'pk_test_Y2xvc2UtZXdlLTk5NzIuY2xlcmsuYWNjb3VudHMuZGV2JA';
  updateAuthUI();

  // If Clerk SDK was loaded and we're not on file protocol, initialize Clerk
  try {
    if (typeof Clerk !== 'undefined' && window.location.protocol !== 'file:') {
      await Clerk.load({
        publishableKey: clerkKey
      });

      if (Clerk.user) {
        const uData = {
          fullName: Clerk.user.fullName || Clerk.user.firstName || 'Authorized Expedition Personnel',
          email: Clerk.user.primaryEmailAddress ? Clerk.user.primaryEmailAddress.emailAddress : '',
          role: 'Clerk Verified User',
          id: Clerk.user.id
        };
        sessionStorage.setItem('polaris_auth_user', JSON.stringify(uData));
        localStorage.setItem('polaris_auth_user', JSON.stringify(uData));
        updateAuthUI();
      }
    }
  } catch (err) {
    console.warn('Clerk SDK background notice:', err);
  }
}


