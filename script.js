const scanButton = document.querySelector("#scanButton");
const systemStatus = document.querySelector("#systemStatus");
const gpsStatus = document.querySelector("#gpsStatus");
const positionStatus = document.querySelector("#positionStatus");
const terminalStatus = document.querySelector("#terminalStatus");
const terminalOutput = document.querySelector("#terminalOutput");

const cartoDarkMatterUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const cartoAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
const initialCenter = [-15.793889, -47.882778];
const delay = (ms) => new Promise((res) => window.setTimeout(res, ms));
const sireneAudio = new Audio("nuclear-alarm-siren.mp3");

sireneAudio.loop = true;

let map;
let pinLayer;

function updateText(element, value) {
  element.textContent = value;
}

function appendLog(message, variant = "") {
  const line = document.createElement("p");
  line.className = variant ? `log-line ${variant}` : "log-line";
  line.textContent = message;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function requestGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização indisponível neste navegador."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    });
  });
}

function createPinIcon() {
  return L.divIcon({
    className: "proximity-pin",
    html: '<span class="pin-dot" aria-hidden="true"></span>',
    iconAnchor: [9, 9],
    iconSize: [18, 18]
  });
}

function bootMap() {
  if (!window.L) {
    throw new Error("Leaflet não carregado.");
  }

  if (map) {
    return;
  }

  map = L.map("map", {
    attributionControl: false,
    preferCanvas: true,
    zoomControl: false
  }).setView(initialCenter, 4);

  L.tileLayer(cartoDarkMatterUrl, {
    attribution: cartoAttribution,
    maxZoom: 20,
    subdomains: "abcd"
  }).addTo(map);

  pinLayer = L.layerGroup().addTo(map);
}

async function executeTrackingSequence(baseLat, baseLon) {
  const icon = createPinIcon();
  pinLayer.clearLayers();

  const targets = [
    [baseLat + 0.0050, baseLon - 0.0040],
    [baseLat - 0.0045, baseLon + 0.0050],
    [baseLat - 0.0035, baseLon - 0.0045],
    [baseLat, baseLon]
  ];
  const messages = [
    "Interceptando dados no setor Norte...",
    "Analisando tráfego de rede a Leste...",
    "Varrendo área residencial Sul...",
    "ALERTA CRÍTICO: 3 " + "C-A-S-A-D-A-S" + " DETECTADAS NA SUA RUA."
  ];

  for (let index = 0; index < targets.length; index += 1) {
    const [lat, lon] = targets[index];

    map.panTo([lat, lon], { animate: true, duration: 1.5 });
    await delay(1500);
    appendLog(messages[index]);

    L.marker([lat, lon], {
      icon,
      interactive: false,
      keyboard: false
    }).addTo(pinLayer);

    L.circle([lat, lon], {
      color: "#ff007f",
      fillColor: "#ff007f",
      fillOpacity: 0.15,
      opacity: 0.15,
      radius: 200
    }).addTo(pinLayer);

    await delay(2000);
  }

  await delay(2500);
  iniciarSusto();
}

async function startProximityScan() {
  sireneAudio.muted = true;
  sireneAudio.play().then(() => {
    sireneAudio.pause();
    sireneAudio.muted = false;
    sireneAudio.currentTime = 0;
  }).catch((e) => console.log("Unlock pendente:", e));

  scanButton.disabled = true;
  terminalOutput.textContent = "";
  updateText(systemStatus, "SYNC");
  updateText(terminalStatus, "ACTIVE");

  try {
    bootMap();

    const position = await requestGeolocation();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = Math.round(position.coords.accuracy);

    updateText(gpsStatus, `GPS CONFIRMADO // ${accuracy}M`);
    updateText(positionStatus, `LAT ${lat.toFixed(5)} // LON ${lon.toFixed(5)}`);
    updateText(systemStatus, "SCAN ONLINE");
    updateText(terminalStatus, "SCANNING");

    map.setView([lat, lon], 15);
    await executeTrackingSequence(lat, lon);
  } catch (error) {
    updateText(systemStatus, "FAULT");
    updateText(terminalStatus, "ERROR");
    appendLog(`Falha na varredura // ${error.message}`, "error");
    scanButton.disabled = false;
  }
}

bootMap();
scanButton.addEventListener("click", startProximityScan);

function iniciarSusto() {
  document.body.innerHTML = "";

  sireneAudio.play().catch((e) => console.log("Falha no áudio", e));

  document.body.style.backgroundColor = "red";
  document.body.style.display = "flex";
  document.body.style.justifyContent = "center";
  document.body.style.alignItems = "center";
  document.body.style.height = "100vh";
  document.body.style.margin = "0";
  document.body.style.textAlign = "center";

  const style = document.createElement("style");
  style.innerHTML = "@keyframes strobe { 0% { background-color: #8b0000; } 50% { background-color: #000000; } 100% { background-color: #ff0000; } } body { animation: strobe 0.15s infinite; }";
  document.head.appendChild(style);

  const p1 = "🚨 PERIGO! RADAR DE ";
  const p2 = "CASADAS DETECTADO. ";
  const p3 = "CORRE, TALARICO! 🚨";

  const h1 = document.createElement("h1");
  h1.innerText = p1 + p2 + p3;
  h1.style.color = "white";
  h1.style.fontSize = "clamp(2rem, 6vw, 5rem)";
  h1.style.fontFamily = "Impact, sans-serif";

  document.body.appendChild(h1);
}
