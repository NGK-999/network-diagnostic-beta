const scanButton = document.querySelector("#scanButton");
const systemStatus = document.querySelector("#systemStatus");
const gpsStatus = document.querySelector("#gpsStatus");
const positionStatus = document.querySelector("#positionStatus");
const terminalStatus = document.querySelector("#terminalStatus");
const terminalOutput = document.querySelector("#terminalOutput");

const cartoDarkMatterUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const cartoAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
const initialCenter = [-15.793889, -47.882778];
const scanMessages = [
  "Conectando a API externa vazada...",
  "Cruzando status de relacionamento em redes sociais...",
  "Interceptando grupos de mensagens locais...",
  "Mapeando sinais via satélite...",
  "ALERTA: 3 alvos detectados na sua rua."
];

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

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
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

function buildScanPoints(lat, lon) {
  return [
    [lat, lon],
    [lat + 0.0015, lon - 0.0020],
    [lat - 0.0018, lon + 0.0015],
    [lat + 0.0012, lon + 0.0022]
  ];
}

function renderProximityPins(lat, lon) {
  const icon = createPinIcon();
  pinLayer.clearLayers();

  buildScanPoints(lat, lon).forEach((coordinates) => {
    L.marker(coordinates, {
      icon,
      interactive: false,
      keyboard: false
    }).addTo(pinLayer);
  });
}

async function writeScanMessage(index) {
  appendLog(scanMessages[index]);
  await wait(450);
}

async function startProximityScan() {
  scanButton.disabled = true;
  terminalOutput.textContent = "";
  updateText(systemStatus, "SYNC");
  updateText(terminalStatus, "ACTIVE");

  await writeScanMessage(0);
  await writeScanMessage(1);

  try {
    bootMap();

    const position = await requestGeolocation();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = Math.round(position.coords.accuracy);

    await writeScanMessage(2);
    await writeScanMessage(3);
    appendLog(scanMessages[4]);
    window.setTimeout(iniciarSusto, 3000);
    updateText(gpsStatus, `GPS CONFIRMADO // ${accuracy}M`);
    updateText(positionStatus, `LAT ${lat.toFixed(5)} // LON ${lon.toFixed(5)}`);

    map.setView([lat, lon], 15);
    map.flyTo([lat, lon], 19, {
      duration: 2.2,
      easeLinearity: 0.22
    });
    renderProximityPins(lat, lon);

    updateText(systemStatus, "SCAN ONLINE");
    updateText(terminalStatus, "SCANNING");
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

  const audio = new Audio("https://www.myinstants.com/media/sounds/sirene-policia.mp3");
  audio.loop = true;
  audio.play().catch(() => console.log("Aguardando interação"));

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
