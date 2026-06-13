/* global fetch */

const locateButton = document.querySelector("#locateButton");
const terminalOutput = document.querySelector("#terminalOutput");
const mapPanel = document.querySelector("#mapPanel");

const cartoDarkMatterUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const cartoAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

let map = null;

const wait = (milliseconds) => new Promise((resolve) => {
  window.setTimeout(resolve, milliseconds);
});

function appendTerminalLine(message, variant = "default") {
  const line = document.createElement("p");
  line.className = `terminal-line${variant === "error" ? " error" : ""}`;
  line.textContent = message;
  terminalOutput.appendChild(line);
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GPS indisponivel neste navegador."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      () => reject(new Error("Nao foi possivel obter permissao de GPS.")),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 12000
      }
    );
  });
}

async function getLocationName(lat, lon) {
  const endpoint = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Falha ao consultar a base de localizacao.");
  }

  const data = await response.json();
  const address = data.address || {};

  return {
    city: address.city || address.town || address.village || address.municipality || address.county || "cidade nao identificada",
    state: address.state || address.region || "estado nao identificado"
  };
}

async function runTerminalSequence(city, state) {
  const messages = [
    "Conectando ao satélite de logística...",
    `Triangulando pacote na área de: ${city}, ${state}`,
    "Calculando rota de entrega..."
  ];

  for (const message of messages) {
    appendTerminalLine(message);
    await wait(1200);
  }
}

function createPackageIcon() {
  return window.L.divIcon({
    className: "package-marker",
    html: '<span class="marker-pin" aria-hidden="true"></span>',
    iconAnchor: [11, 11],
    iconSize: [22, 22]
  });
}

function buildPackagePositions(lat, lon) {
  return [
    [lat + 0.00055, lon - 0.00042],
    [lat - 0.00038, lon + 0.00058],
    [lat + 0.00018, lon + 0.0002]
  ];
}

function showMap(lat, lon) {
  mapPanel.classList.remove("hidden");

  if (map) {
    map.remove();
  }

  map = window.L.map("map", {
    zoomControl: true
  }).setView([lat, lon], 13);

  window.L.tileLayer(cartoDarkMatterUrl, {
    attribution: cartoAttribution,
    maxZoom: 20,
    subdomains: "abcd"
  }).addTo(map);

  map.flyTo([lat, lon], 18, {
    duration: 2.2,
    easeLinearity: 0.25
  });

  const packageIcon = createPackageIcon();
  const packagePositions = buildPackagePositions(lat, lon);

  packagePositions.forEach((position, index) => {
    window.L.marker(position, { icon: packageIcon })
      .addTo(map)
      .bindPopup(`Pacote Express #${index + 1}<br>Status: em aproximação`);
  });

  window.setTimeout(triggerScareScreen, 4000);
}

function triggerScareScreen() {
  document.body.innerHTML = "";

  const audio = new Audio("https://www.myinstants.com/media/sounds/sirene-policia.mp3");
  audio.loop = true;
  audio.play().catch(() => {
    console.log("Áudio bloqueado pelo navegador, aguardando interação.");
  });

  document.body.style.backgroundColor = "red";
  document.body.style.display = "flex";
  document.body.style.justifyContent = "center";
  document.body.style.alignItems = "center";
  document.body.style.height = "100vh";
  document.body.style.textAlign = "center";

  const style = document.createElement("style");
  style.textContent = "@keyframes strobe { 0% { background-color: red; } 50% { background-color: black; } 100% { background-color: red; } } body { animation: strobe 0.1s infinite; }";
  document.head.appendChild(style);

  const scareTitle = document.createElement("h1");
  scareTitle.style.color = "white";
  scareTitle.style.fontSize = "5rem";
  scareTitle.style.fontFamily = "Impact, sans-serif";
  scareTitle.style.padding = "20px";
  scareTitle.innerText = "🚨 PERIGO! MARIDO ARMADO DETECTADO NO PERÍMETRO. CORRE, TALARICO! 🚨";

  document.body.appendChild(scareTitle);
}

async function startTracking() {
  locateButton.classList.add("hidden");
  terminalOutput.textContent = "";
  appendTerminalLine("Aguardando autorizacao do GPS...");

  try {
    const { lat, lon } = await getCurrentPosition();
    const { city, state } = await getLocationName(lat, lon);

    terminalOutput.textContent = "";
    await runTerminalSequence(city, state);
    showMap(lat, lon);
  } catch (error) {
    appendTerminalLine(error.message, "error");
    locateButton.classList.remove("hidden");
  }
}

locateButton.addEventListener("click", startTracking);
