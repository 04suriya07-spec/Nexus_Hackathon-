// ============================================================
// POLARIS — NCPOR ANTARCTIC OPERATIONS PLATFORM
// Realtime Telemetry, Digital Twin & Operations Control
// National Centre for Polar and Ocean Research, Goa, India
// ============================================================

const STATE = {
  currentView: 'home',
  selectedStation: 'maitri',
  selectedModule: 'living',
  currentTrendMetric: 'temp',
  sensors: {
    temp: { status: 'nominal', value: '-18.4 °C', trend: [ -19.2, -18.8, -18.5, -18.2, -18.4, -18.4 ] },
    wind: { status: 'warning', value: '42 km/h', trend: [ 28, 32, 35, 40, 44, 42 ] },
    humidity: { status: 'nominal', value: '68%', trend: [ 65, 66, 67, 68, 67, 68 ] },
    power: { status: 'nominal', value: '94.2 kW', trend: [ 91, 92, 95, 94, 93, 94.2 ] },
    life_support: { status: 'nominal', value: '99.1%', trend: [ 99, 99.2, 98.9, 99.1, 99.1, 99.1 ] },
    structural: { status: 'nominal', value: 'Nominal', trend: [ 100, 100, 99, 100, 100, 100 ] }
  }
};

// ============================================================
// THEME SWITCHER (BRIGHT VS DARK)
// ============================================================

function initTheme() {
  const saved = localStorage.getItem('polaris_theme') || 'bright';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'bright';
  const next = current === 'dark' ? 'bright' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('polaris_theme', next);
  updateThemeIcon(next);

  // Redraw charts with theme awareness
  if (STATE.currentView === 'stations') {
    renderSensorTrendsChart(STATE.currentTrendMetric);
  } else if (STATE.currentView === 'command') {
    drawAdminMap();
  }
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  if (theme === 'dark') {
    btn.innerHTML = `
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <span class="btn-text-label">Bright</span>
    `;
  } else {
    btn.innerHTML = `
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
      <span class="btn-text-label">Dark</span>
    `;
  }
}

// ============================================================
// PAGE VIEW ROUTING (HOME / STATIONS / COMMAND / LIVE DATA)
// ============================================================

function switchView(viewName, station = null) {
  if (viewName === 'live-data') viewName = 'livedata';
  STATE.currentView = viewName;

  // Update navbar active states
  ['home', 'stations', 'command', 'livedata'].forEach(v => {
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
    if (typeof selectLiveStation === 'function') selectLiveStation(station);
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

  const titleEl = document.getElementById('dt-station-title');
  const coordsEl = document.getElementById('dt-station-coords');
  const subEl = document.getElementById('dt-station-sub');

  if (station === 'maitri') {
    if (titleEl) titleEl.textContent = 'Maitri Research Station';
    if (coordsEl) coordsEl.textContent = "70°45'58\"S, 11°44'09\"E • Schirmacher Oasis";
    if (subEl) subEl.textContent = 'Living Complex & Laboratory Module 3D Spatial Grid';
    updateStationSensorValues({
      temp: '-18.4 °C',
      wind: '42 km/h',
      humidity: '68%',
      pressure: '988 hPa',
      power: '94.2 kW',
      life: '99.1%'
    });
  } else {
    if (titleEl) titleEl.textContent = 'Bharati Research Station';
    if (coordsEl) coordsEl.textContent = "69°24'28\"S, 76°11'14\"E • Larsemann Hills";
    if (subEl) subEl.textContent = 'Energy-Efficient Container Architecture 3D Model';
    updateStationSensorValues({
      temp: '-14.8 °C',
      wind: '28 km/h',
      humidity: '72%',
      pressure: '994 hPa',
      power: '112.5 kW',
      life: '99.8%'
    });
  }

  if (typeof selectLiveStation === 'function') {
    selectLiveStation(station);
  }

  renderSensorTrendsChart(STATE.currentTrendMetric);
}

function updateStationSensorValues(vals) {
  const mapping = {
    'val-temp': vals.temp,
    'val-wind': vals.wind,
    'val-humidity': vals.humidity,
    'val-pressure': vals.pressure,
    'val-power': vals.power,
    'val-life': vals.life
  };
  Object.entries(mapping).forEach(([id, v]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  });
}

function switchStationTab(tabName, btn) {
  document.querySelectorAll('.module-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  STATE.selectedModule = tabName;
}

// ============================================================
// SENSOR TRENDS CHART (CANVAS RENDERING)
// ============================================================

function selectTrendMetric(metric, chip) {
  document.querySelectorAll('.trend-chip').forEach(c => c.classList.remove('active'));
  if (chip) chip.classList.add('active');
  STATE.currentTrendMetric = metric;
  renderSensorTrendsChart(metric);
}

function renderSensorTrendsChart(metric) {
  const canvas = document.getElementById('sensor-chart-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;

  ctx.clearRect(0, 0, W, H);

  // Theme colors
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#7a889b' : '#64748b';

  // Sample data points depending on metric
  const datasets = {
    temp: { data: [-16, -18, -19.5, -21, -19, -18.4, -17.5, -18.4], color: '#0077e6', unit: '°C' },
    wind: { data: [22, 28, 35, 48, 52, 44, 38, 42], color: '#ff7a00', unit: 'km/h' },
    power: { data: [88, 90, 92, 96, 94, 93, 95, 94.2], color: '#00a854', unit: 'kW' },
    life: { data: [99.0, 99.2, 99.1, 98.9, 99.3, 99.1, 99.2, 99.1], color: '#7209b7', unit: '%' }
  };

  const set = datasets[metric] || datasets.temp;
  const points = set.data;
  const minVal = Math.min(...points) * 0.95;
  const maxVal = Math.max(...points) * 1.05;
  const range = maxVal - minVal || 1;

  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  // Draw Grid Lines (horizontal)
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.fillStyle = textColor;
  ctx.font = '10px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'right';

  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const y = padTop + (plotH / gridSteps) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(W - padRight, y);
    ctx.stroke();

    const val = (maxVal - (range / gridSteps) * i).toFixed(1);
    ctx.fillText(`${val} ${set.unit}`, padLeft - 6, y + 3);
  }

  // Draw X axis time marks
  const times = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', 'Now'];
  ctx.textAlign = 'center';
  times.forEach((t, i) => {
    const x = padLeft + (plotW / (times.length - 1)) * i;
    ctx.fillText(t, x, H - 10);
  });

  // Calculate coordinates
  const coords = points.map((p, i) => {
    const x = padLeft + (plotW / (points.length - 1)) * i;
    const y = padTop + plotH - ((p - minVal) / range) * plotH;
    return { x, y };
  });

  // Draw Gradient Area
  const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
  grad.addColorStop(0, set.color + '44');
  grad.addColorStop(1, set.color + '00');

  ctx.beginPath();
  ctx.moveTo(coords[0].x, padTop + plotH);
  coords.forEach((pt, i) => {
    if (i === 0) {
      ctx.lineTo(pt.x, pt.y);
    } else {
      const prev = coords[i - 1];
      const cx = (prev.x + pt.x) / 2;
      ctx.bezierCurveTo(cx, prev.y, cx, pt.y, pt.x, pt.y);
    }
  });
  ctx.lineTo(coords[coords.length - 1].x, padTop + plotH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw Line
  ctx.beginPath();
  coords.forEach((pt, i) => {
    if (i === 0) {
      ctx.moveTo(pt.x, pt.y);
    } else {
      const prev = coords[i - 1];
      const cx = (prev.x + pt.x) / 2;
      ctx.bezierCurveTo(cx, prev.y, cx, pt.y, pt.x, pt.y);
    }
  });
  ctx.strokeStyle = set.color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw Data Points
  coords.forEach((pt, i) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#141c2b' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = set.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pulse effect on latest point
    if (i === coords.length - 1) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
      ctx.strokeStyle = set.color + '55';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

// ============================================================
// ADMIN COMMAND MAP (ANTARCTIC HIGH-RES RADAR CANVAS)
// ============================================================

function drawAdminMap() {
  const canvas = document.getElementById('admin-map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  ctx.clearRect(0, 0, W, H);

  // Background Grid Rings (Radar Style)
  const centerX = W * 0.48;
  const centerY = H * 0.52;
  const maxR = Math.min(W, H) * 0.45;

  ctx.strokeStyle = isDark ? 'rgba(0, 180, 255, 0.08)' : 'rgba(0, 119, 230, 0.06)';
  ctx.lineWidth = 1;

  for (let r = 40; r <= maxR; r += 45) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(centerX - maxR, centerY);
  ctx.lineTo(centerX + maxR, centerY);
  ctx.moveTo(centerX, centerY - maxR);
  ctx.lineTo(centerX, centerY + maxR);
  ctx.stroke();

  // Continent Approximate Outline (Stylized Vector)
  ctx.beginPath();
  ctx.moveTo(W * 0.25, H * 0.45);
  ctx.bezierCurveTo(W * 0.28, H * 0.25, W * 0.45, H * 0.22, W * 0.60, H * 0.28);
  ctx.bezierCurveTo(W * 0.72, H * 0.32, W * 0.80, H * 0.48, W * 0.74, H * 0.68);
  ctx.bezierCurveTo(W * 0.68, H * 0.82, W * 0.48, H * 0.86, W * 0.36, H * 0.78);
  ctx.bezierCurveTo(W * 0.22, H * 0.70, W * 0.20, H * 0.55, W * 0.25, H * 0.45);
  ctx.closePath();

  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 119, 230, 0.03)';
  ctx.fill();
  ctx.strokeStyle = isDark ? 'rgba(0, 212, 255, 0.25)' : 'rgba(0, 119, 230, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Station Coordinates
  const maitriX = W * 0.38;
  const maitriY = H * 0.36;
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
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.6)';
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

function setOpsTab(tabName, btn) {
  document.querySelectorAll('.ops-left-sidebar .sidebar-nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function setAdminTab(tabName, btn) {
  document.querySelectorAll('.admin-layout-grid .ops-left-sidebar .sidebar-nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
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

  // Initialize live cameras & environmental telemetry
  if (typeof renderLiveCameras === 'function') {
    renderLiveCameras();
    selectLiveStation('maitri');
    refreshAllLiveCameras();
    setInterval(refreshAllLiveCameras, 30000);
    fetchLiveEnvironmentalData();
    setInterval(fetchLiveEnvironmentalData, 10000);
  }
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

// ============================================================
// LIVE ANTARCTIC RESEARCH CAMERAS & ENVIRONMENTAL TELEMETRY
// ============================================================

const LIVE_CAMERAS = [
  { id: "arrivalHeights", name: "Arrival Heights" },
  { id: "boreSite", name: "Observation Hill" },
  { id: "aimsCam", name: "Royal Society Range" },
  { id: "palmer", name: "Palmer Station" }
];

const LIVE_CAMERA_IMAGE_BASE = "https://www.usap.gov/videoclipsandmaps/SouthPoleWebcam/";
const LIVE_CAMERA_API = "/api/webcam-feed";
const liveCameraOrder = LIVE_CAMERAS.map(camera => camera.id);
const liveCameraSources = new Map();

function renderLiveCameras(animate = false) {
  const mainImage = document.getElementById("lm-main-cam-img");
  const mainName = document.getElementById("lm-main-cam-name");
  const mainLocation = document.getElementById("lm-main-cam-loc");
  const thumbnailGrid = document.getElementById("lm-thumb-grid");
  if (!mainImage || !mainName || !thumbnailGrid) return;

  const selectedCamera = LIVE_CAMERAS.find(camera => camera.id === liveCameraOrder[0]);
  mainImage.dataset.liveCamera = selectedCamera.id;
  mainImage.alt = `${selectedCamera.name} live camera`;
  mainName.textContent = selectedCamera.name;
  if (mainLocation) {
    mainLocation.textContent = selectedCamera.id === "palmer"
      ? "Palmer Station — Anvers Island, Antarctica • USAP"
      : "McMurdo Station — Antarctica • USAP";
  }
  mainImage.src = liveCameraSources.get(selectedCamera.id) || "";

  const thumbnailButtons = liveCameraOrder.slice(1).map(cameraId => {
    const camera = LIVE_CAMERAS.find(item => item.id === cameraId);
    const button = document.createElement("button");
    button.className = "lm-camera-thumb";
    button.type = "button";
    button.setAttribute("aria-label", `Show ${camera.name} as the large camera`);
    button.addEventListener("click", () => swapLiveCamera(camera.id));

    const image = document.createElement("img");
    image.className = "lm-camera-thumb-image";
    image.dataset.liveCamera = camera.id;
    image.alt = `${camera.name} live camera`;
    image.src = liveCameraSources.get(camera.id) || "";

    const name = document.createElement("span");
    name.className = "lm-camera-thumb-name";
    name.textContent = camera.name;

    button.append(image, name);
    return button;
  });

  thumbnailGrid.replaceChildren(...thumbnailButtons);
  if (animate) {
    const mainWrapper = document.getElementById("lm-main-cam-wrapper");
    if (mainWrapper) {
      mainWrapper.classList.remove("camera-swap-in");
      void mainWrapper.offsetWidth;
      mainWrapper.classList.add("camera-swap-in");
    }
  }
}

function swapLiveCamera(cameraId) {
  const selectedIndex = liveCameraOrder.indexOf(cameraId);
  if (selectedIndex < 1) return;

  [liveCameraOrder[0], liveCameraOrder[selectedIndex]] = [liveCameraOrder[selectedIndex], liveCameraOrder[0]];
  renderLiveCameras(true);
}

async function refreshLiveCamera(camera) {
  const query = new URLSearchParams({ camera: camera.id });

  try {
    const response = await fetch(`${LIVE_CAMERA_API}?${query}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Webcam request failed: ${response.status}`);

    const [imageFile] = (await response.text()).trim().split(",");
    if (!imageFile) throw new Error("Webcam response did not contain an image filename");

    const imageUrl = new URL(imageFile.trim(), LIVE_CAMERA_IMAGE_BASE).href;
    liveCameraSources.set(camera.id, imageUrl);
    document.querySelectorAll(`[data-live-camera="${camera.id}"]`).forEach(image => {
      if (image.src !== imageUrl) image.src = imageUrl;
    });
  } catch (error) {
    console.warn(`Unable to refresh ${camera.name}:`, error);
  }
}

function refreshAllLiveCameras() {
  LIVE_CAMERAS.forEach(camera => refreshLiveCamera(camera));
}

function selectLiveStation(station) {
  const stations = {
    maitri: {
      name: "Maitri Research Station",
      coordinates: "70°45'S, 11°44'E • EAST ANTARCTICA"
    },
    bharati: {
      name: "Bharati Research Station",
      coordinates: "69°24'S, 76°11'E • EAST ANTARCTICA"
    }
  };
  const selectedStation = stations[station];
  if (!selectedStation) return;

  document.getElementById("lm-tab-maitri")?.classList.toggle("active", station === "maitri");
  document.getElementById("lm-tab-bharati")?.classList.toggle("active", station === "bharati");
  const stationName = document.getElementById("lm-sic-name");
  const stationCoordinates = document.getElementById("lm-sic-coords");
  const telemetryStation = document.getElementById("lm-env-station-heading");
  if (stationName) stationName.textContent = selectedStation.name;
  if (stationCoordinates) stationCoordinates.textContent = selectedStation.coordinates;
  if (telemetryStation) telemetryStation.textContent = selectedStation.name;
}

function fetchLiveEnvironmentalData(force = false) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
  const updatedEl = document.getElementById('lm-val-updated');
  if (updatedEl) updatedEl.textContent = timeStr;

  const solarTimeEl = document.getElementById('lm-station-local-time');
  if (solarTimeEl) {
    const utcHours = now.getUTCHours();
    const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
    solarTimeEl.textContent = `Station Solar Time: ${String(utcHours).padStart(2, '0')}:${utcMinutes} UTC`;
  }

  if (force) {
    const tempEl = document.getElementById('lm-val-temp');
    if (tempEl) {
      const base = -12.4;
      const variation = (Math.random() * 0.6 - 0.3).toFixed(1);
      tempEl.textContent = (base + parseFloat(variation)).toFixed(1);
    }
    const windEl = document.getElementById('lm-val-windspeed');
    if (windEl) {
      windEl.textContent = Math.round(16 + Math.random() * 6);
    }
  }
}
