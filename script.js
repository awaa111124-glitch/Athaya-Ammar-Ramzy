/* ==========================================
   1. NAVIGASI WEBSITE
========================================== */

const screens = document.querySelectorAll(".screen");
const replayButton = document.getElementById("replayButton");

function showScreen(id) {
  screens.forEach(screen => screen.classList.remove("active"));

  const target = document.getElementById(id);

  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (id === "reveal") {
    startCinematicHeart();
  } else {
    stopCinematicHeart();
  }
}

document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.next);
  });
});

if (replayButton) {
  replayButton.addEventListener("click", () => {
    showScreen("screen1");
  });
}


/* ==========================================
   2. MUSIK
========================================== */

const musicButton = document.getElementById("musicButton");
const loveSong = document.getElementById("loveSong");

if (musicButton && loveSong) {
  musicButton.addEventListener("click", async () => {
    if (loveSong.paused) {
      try {
        await loveSong.play();
      } catch (error) {
        console.error("Musik gagal diputar:", error);

        musicButton.textContent =
          "♫ Musik gagal diputar";
      }
    } else {
      loveSong.pause();
    }
  });

  loveSong.addEventListener("play", () => {
    musicButton.textContent = "♫ Pause our song";
  });

  loveSong.addEventListener("pause", () => {
    musicButton.textContent = "♫ Play our song";
  });

  loveSong.addEventListener("error", () => {
    console.error(
      "File audio tidak berhasil dimuat.",
      loveSong.error
    );

    musicButton.textContent = "♫ Musik gagal dimuat";
  });
}


/* ==========================================
   3. TIMER KENANGAN
========================================== */

function updateTimer() {
  const start = new Date(2025, 5, 27);
  let elapsed = Math.max(0, Date.now() - start);

  const days = Math.floor(elapsed / 86400000);
  elapsed %= 86400000;

  const hours = Math.floor(elapsed / 3600000);
  elapsed %= 3600000;

  const minutes = Math.floor(elapsed / 60000);
  elapsed %= 60000;

  const seconds = Math.floor(elapsed / 1000);

  const dayElement = document.getElementById("days");
  const hourElement = document.getElementById("hours");
  const minuteElement = document.getElementById("minutes");
  const secondElement = document.getElementById("seconds");

  if (dayElement) {
    dayElement.textContent = String(days).padStart(3, "0");
  }

  if (hourElement) {
    hourElement.textContent = String(hours).padStart(2, "0");
  }

  if (minuteElement) {
    minuteElement.textContent = String(minutes).padStart(2, "0");
  }

  if (secondElement) {
    secondElement.textContent = String(seconds).padStart(2, "0");
  }
}

updateTimer();
setInterval(updateTimer, 1000);





/* ==========================================
   4. ANIMATED LOVE HEART — BUILD & ZOOM
========================================== */

const canvas = document.getElementById("heartCanvas");
const reveal = document.getElementById("reveal");
const tunnelTitle = document.querySelector(".tunnel-title");

let ctx = canvas ? canvas.getContext("2d") : null;
let width = 0;
let height = 0;
let dpr = 1;
let raf = null;
let running = false;
let lastTime = 0;
let elapsed = 0;
let heartWords = [];

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

function resizeTunnel() {
  if (!canvas || !ctx) return;

  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  width = rect.width;
  height = rect.height;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createHeartWords();
}

function insideHeart(x, y) {
  const a = x * x + y * y - 1;

  return a * a * a - x * x * y * y * y <= 0;
}

function createHeartWords() {
  heartWords = [];

  const spacing = width < 500 ? 22 : 27;
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);

  const heartScale = Math.min(width * 0.027, height * 0.032, 15);

  const heartWidth = 32 * heartScale;
  const heartHeight = 30 * heartScale;

  const left = width / 2 - heartWidth / 2;
  const top = height / 2 - heartHeight / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing + spacing / 2;
      const y = row * spacing + spacing / 2;

      const nx = (x - width / 2) / (heartWidth / 2);
      const ny = -(y - height / 2) / (heartHeight / 2);

      if (!insideHeart(nx, ny)) continue;

      // Setiap tulisan punya titik akhir sendiri
      // sehingga susunannya mengikuti siluet hati
      const index = heartWords.length;

      heartWords.push({
        x,
        y,
        delay: index * 13,
        driftX: (Math.random() - 0.5) * width * 0.85,
        driftY: (Math.random() - 0.5) * height * 0.85,
        rotation: (Math.random() - 0.5) * 0.5,
        size: width < 500 ? 8 : 10
      });
    }
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function drawTunnel(timestamp) {
  if (!running || !ctx) return;

  if (!lastTime) lastTime = timestamp;

  const delta = Math.min(timestamp - lastTime, 32);
  lastTime = timestamp;
  elapsed += delta;

  const cx = width / 2;
  const cy = height / 2;

  ctx.fillStyle = "#070309";
  ctx.fillRect(0, 0, width, height);

  // Cahaya lembut di belakang hati
  const glow = ctx.createRadialGradient(
    cx, cy, 0,
    cx, cy, Math.min(width, height) * 0.55
  );

  glow.addColorStop(0, "rgba(180, 30, 85, 0.16)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Hati terbentuk secara bertahap
  const buildDuration = reduceMotion.matches ? 0 : 4800;

  // Setelah terbentuk, hati melakukan zoom lembut
  const progress = buildDuration === 0
    ? 1
    : Math.min(1, elapsed / buildDuration);

  const zoom = 1 + (
    reduceMotion.matches
      ? 0
      : Math.max(0, elapsed - buildDuration) * 0.000012
  );

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);
  ctx.translate(-cx, -cy);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  heartWords.forEach((word, index) => {
    const localTime = reduceMotion.matches
      ? 1
      : Math.max(0, Math.min(
          1,
          (elapsed - word.delay) / 950
        ));

    const t = easeOutCubic(localTime);

    if (localTime <= 0) return;

    const startX = cx + word.driftX;
    const startY = cy + word.driftY;

    const x = startX + (word.x - startX) * t;
    const y = startY + (word.y - startY) * t;

    ctx.save();
    ctx.translate(x, y);

    ctx.globalAlpha = 0.9 * t;
    ctx.font = `300 ${word.size}px "DM Sans", sans-serif`;

    ctx.fillStyle = "#ff8db8";
    ctx.shadowColor = "#ff347e";
    ctx.shadowBlur = 3;

    ctx.fillText("i love you", 0, 0);

    ctx.restore();
  });

  ctx.restore();

  raf = requestAnimationFrame(drawTunnel);
}

function startCinematicHeart() {
  stopCinematicHeart();

  if (!canvas || !ctx) return;

  if (tunnelTitle) {
    tunnelTitle.style.display = "none";
  }

  resizeTunnel();
  elapsed = 0;
  lastTime = 0;
  running = true;

  raf = requestAnimationFrame(drawTunnel);
}

function stopCinematicHeart() {
  running = false;

  if (raf !== null) {
    cancelAnimationFrame(raf);
    raf = null;
  }

  lastTime = 0;
}

window.addEventListener("resize", () => {
  if (reveal && reveal.classList.contains("active")) {
    resizeTunnel();
  }
});
