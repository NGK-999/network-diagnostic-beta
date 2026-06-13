(() => {
  const matrixCanvas = document.querySelector("#matrixCanvas");
  const terminalScreen = document.querySelector("#terminalScreen");
  const mapScreen = document.querySelector("#mapScreen");
  const dangerScreen = document.querySelector("#dangerScreen");
  const startButton = document.querySelector("#startButton");
  const terminalOutput = document.querySelector("#terminalOutput");
  const mapReadout = document.querySelector("#mapReadout");

  const alertAudioUrl = "https://www.myinstants.com/media/sounds/sirene-policia.mp3";
  const cartoDarkMatterUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const terminalLines = [
    "Iniciando bypass de firewall local...",
    "Injetando payload em portas abertas...",
    "Acessando banco de dados de cartórios...",
    "Descriptografando mensagens do WhatsApp...",
    "Sucesso. Calibrando sistema de GPS..."
  ];
  const matrixGlyphs = ["0", "1", "0xA1", "0xFF", "0xC3", "0x7E", "0xB4", "0xD9", "0x00"];
  const fallbackCenter = {
    latitude: -22.9951,
    longitude: -47.5071
  };

  let audioContext = null;
  let matrixAnimationId = 0;
  let teardownMatrixRain = () => {};
  let tacticalMap = null;

  const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

  function initializeAudioEngine() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    audioContext = new AudioContextConstructor();
  }

  function playKeyBeep() {
    if (!audioContext) {
      return;
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startTime = audioContext.currentTime;
    const endTime = startTime + 0.025;

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(740 + Math.random() * 360, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.045, startTime + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime);
  }

  function initializeMatrixRain() {
    const context = matrixCanvas.getContext("2d");
    const drops = [];
    const frameInterval = 50;
    const tailLength = 18;
    let fontSize = 18;
    let columnCount = 0;
    let isRunning = true;
    let lastFrameTime = 0;

    function resetDrop(index) {
      drops[index] = {
        head: Math.floor(Math.random() * -70),
        speed: 0.72 + Math.random() * 0.95
      };
    }

    function resizeCanvas() {
      const pixelRatio = window.devicePixelRatio || 1;

      matrixCanvas.width = Math.floor(window.innerWidth * pixelRatio);
      matrixCanvas.height = Math.floor(window.innerHeight * pixelRatio);
      matrixCanvas.style.width = `${window.innerWidth}px`;
      matrixCanvas.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      fontSize = window.innerWidth < 720 ? 14 : 18;
      columnCount = Math.ceil(window.innerWidth / fontSize);
      drops.length = columnCount;

      for (let index = 0; index < columnCount; index += 1) {
        resetDrop(index);
      }
    }

    function drawGlyph(glyph, x, y, tailIndex) {
      if (tailIndex === 0) {
        context.fillStyle = "#f4fff7";
        context.shadowColor = "#ffffff";
        context.shadowBlur = 18;
      } else {
        const alpha = Math.max(0.08, 1 - tailIndex / tailLength);
        const green = Math.max(46, 255 - tailIndex * 12);

        context.fillStyle = `rgba(0, ${green}, 78, ${alpha})`;
        context.shadowColor = "rgba(0, 255, 102, 0.72)";
        context.shadowBlur = Math.max(0, 12 - tailIndex);
      }

      context.fillText(glyph, x, y);
      context.shadowBlur = 0;
    }

    function renderMatrixFrame() {
      context.fillStyle = "rgba(0, 0, 0, 0.22)";
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);
      context.font = `${fontSize}px "Share Tech Mono", "Courier New", monospace`;

      drops.forEach((drop, columnIndex) => {
        const x = columnIndex * fontSize;

        for (let tailIndex = 0; tailIndex < tailLength; tailIndex += 1) {
          const y = (drop.head - tailIndex) * fontSize;

          if (y < -fontSize || y > window.innerHeight + fontSize) {
            continue;
          }

          const glyph = matrixGlyphs[Math.floor(Math.random() * matrixGlyphs.length)];
          drawGlyph(glyph, x, y, tailIndex);
        }

        drop.head += drop.speed;

        if ((drop.head - tailLength) * fontSize > window.innerHeight && Math.random() > 0.945) {
          resetDrop(columnIndex);
        }
      });
    }

    function drawMatrixFrame(timestamp) {
      if (!isRunning) {
        return;
      }

      if (timestamp - lastFrameTime >= frameInterval) {
        renderMatrixFrame();
        lastFrameTime = timestamp - ((timestamp - lastFrameTime) % frameInterval);
      }

      matrixAnimationId = requestAnimationFrame(drawMatrixFrame);
    }

    function teardown() {
      if (!isRunning) {
        return;
      }

      isRunning = false;
      cancelAnimationFrame(matrixAnimationId);
      window.removeEventListener("resize", resizeCanvas);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      drops.length = 0;
      matrixCanvas.style.display = "none";
    }

    resizeCanvas();
    drawMatrixFrame();
    window.addEventListener("resize", resizeCanvas);
    return teardown;
  }

  async function runTerminalSequence() {
    startButton.classList.add("hidden");
    terminalOutput.textContent = "";

    for (const text of terminalLines) {
      await typeTerminalLine(text);
      await wait(310);
    }
  }

  async function typeTerminalLine(text) {
    const line = document.createElement("p");

    line.className = "terminal-line terminal-cursor";
    terminalOutput.appendChild(line);

    for (const character of text) {
      line.textContent += character;
      playKeyBeep();
      await wait(24 + Math.random() * 32);
    }

    line.classList.remove("terminal-cursor");
  }

  function getFallbackCoordinates() {
    return {
      latitude: fallbackCenter.latitude + Math.random() * 0.08 - 0.04,
      longitude: fallbackCenter.longitude + Math.random() * 0.08 - 0.04,
      source: "SIMULADO"
    };
  }

  function requestCurrentPosition() {
    if (!navigator.geolocation) {
      return Promise.resolve(getFallbackCoordinates());
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: "GPS REAL"
          });
        },
        () => {
          resolve(getFallbackCoordinates());
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 6500
        }
      );
    });
  }

  function updateMapReadout(coordinates) {
    mapReadout.textContent = `LAT ${coordinates.latitude.toFixed(5)} // LNG ${coordinates.longitude.toFixed(5)} // ${coordinates.source}`;
  }

  function createTargetIcon() {
    return window.L.divIcon({
      className: "target-marker",
      html: `
        <div class="locked-target" aria-hidden="true">
          <span class="pulse-ring"></span>
          <span class="pulse-ring"></span>
          <span class="pulse-ring"></span>
          <span class="target-core"></span>
        </div>
      `,
      iconAnchor: [22, 22],
      iconSize: [44, 44]
    });
  }

  async function addFakeTargets(coordinates) {
    const targetOffsets = [
      { latitude: 0.0027, longitude: -0.0025 },
      { latitude: -0.0022, longitude: 0.0031 },
      { latitude: 0.0035, longitude: 0.0019 }
    ];

    for (const offset of targetOffsets) {
      await wait(880);

      const targetPosition = [
        coordinates.latitude + offset.latitude,
        coordinates.longitude + offset.longitude
      ];

      window.L.marker(targetPosition, {
        icon: createTargetIcon(),
        riseOnHover: true
      })
        .addTo(tacticalMap)
        .bindPopup("Alvo Casado Detectado")
        .openPopup();
    }
  }

  async function showTrackingMap(coordinates) {
    teardownMatrixRain();
    terminalScreen.classList.add("hidden");
    mapScreen.classList.remove("hidden");
    mapScreen.classList.remove("threat-escalating", "threat-critical");
    updateMapReadout(coordinates);

    if (!window.L) {
      await wait(4000);
      triggerCriticalAlert();
      return;
    }

    tacticalMap = window.L.map("map", {
      attributionControl: false,
      boxZoom: false,
      doubleClickZoom: false,
      dragging: false,
      keyboard: false,
      scrollWheelZoom: false,
      tap: false,
      touchZoom: false,
      zoomControl: false
    }).setView([coordinates.latitude, coordinates.longitude], 15);

    window.L.tileLayer(cartoDarkMatterUrl, {
      maxZoom: 19,
      subdomains: "abcd"
    }).addTo(tacticalMap);

    window.L.circle([coordinates.latitude, coordinates.longitude], {
      color: "#00ff66",
      fillColor: "#00ff66",
      fillOpacity: 0.08,
      radius: 210,
      weight: 1
    }).addTo(tacticalMap);

    await wait(700);
    tacticalMap.flyTo([coordinates.latitude, coordinates.longitude], 17, {
      duration: 1.8,
      easeLinearity: 0.14
    });
    await wait(2100);
    await addFakeTargets(coordinates);
    await runThreatCountdown();
    triggerCriticalAlert();
  }

  async function runThreatCountdown() {
    mapReadout.textContent = "ALVOS TRAVADOS // PADRAO CARDIACO ELEVANDO...";
    await wait(1600);
    mapScreen.classList.add("threat-escalating");
    mapReadout.textContent = "ALVOS TRAVADOS // PULSO HOSTIL ACELERANDO...";
    await wait(1400);
    mapScreen.classList.add("threat-critical");
    mapReadout.textContent = "ALERTA DE PROXIMIDADE // IMPACTO IMINENTE...";
    await wait(1000);
  }

  function triggerCriticalAlert() {
    teardownMatrixRain();
    mapScreen.classList.add("hidden");
    dangerScreen.classList.remove("hidden");
    document.body.classList.add("danger-active");

    if (tacticalMap) {
      tacticalMap.remove();
      tacticalMap = null;
    }

    const alertAudio = new Audio(alertAudioUrl);
    alertAudio.loop = true;
    alertAudio.volume = 1;
    alertAudio.play().catch(() => {
      console.warn("O navegador bloqueou a reprodução automática do áudio.");
    });
  }

  async function startInvasionFlow() {
    initializeAudioEngine();
    await runTerminalSequence();
    const coordinates = await requestCurrentPosition();
    await showTrackingMap(coordinates);
  }

  teardownMatrixRain = initializeMatrixRain();
  startButton.addEventListener("click", startInvasionFlow, { once: true });
})();
