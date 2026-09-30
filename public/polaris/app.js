/*

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
