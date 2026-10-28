document.addEventListener("DOMContentLoaded", () => {
  // Reveal sections as they enter the screen.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  // Small star field in the background.
  const canvas = document.getElementById("skyCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let stars = [];
  let width = 0;
  let height = 0;

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({ length: Math.min(110, Math.floor(width / 9)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.018 + 0.004
    }));
  }

  let frame = 0;
  function drawStars() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    frame++;
    stars.forEach((star) => {
      const alpha = 0.25 + (Math.sin(frame * star.speed + star.phase) + 1) * 0.32;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 225, 245, ${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }

  resizeCanvas();
  drawStars();
  window.addEventListener("resize", resizeCanvas);

  // Sparkle burst when the final button is pressed.
  const celebrateBtn = document.getElementById("celebrateBtn");
  const toast = document.getElementById("toast");
  let toastTimer;

  function makeSparkle(x, y) {
    const symbols = ["✦", "✧", "♥", "✿", "✨"];
    const sparkle = document.createElement("span");
    sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    sparkle.style.position = "fixed";
    sparkle.style.left = x + "px";
    sparkle.style.top = y + "px";
    sparkle.style.zIndex = "60";
    sparkle.style.pointerEvents = "none";
    sparkle.style.color = ["#ff9ec4", "#ffe7a4", "#c9a7ff", "#ffffff"][Math.floor(Math.random() * 4)];
    sparkle.style.fontSize = (14 + Math.random() * 24) + "px";
    sparkle.style.transition = "transform 1.3s ease-out, opacity 1.3s ease-out";
    document.body.appendChild(sparkle);
    const dx = (Math.random() - 0.5) * 260;
    const dy = (Math.random() - 0.5) * 260;
    requestAnimationFrame(() => {
      sparkle.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 260}deg) scale(.2)`;
      sparkle.style.opacity = "0";
    });
    window.setTimeout(() => sparkle.remove(), 1400);
  }

  if (celebrateBtn) {
    celebrateBtn.addEventListener("click", (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      for (let i = 0; i < 65; i++) {
        makeSparkle(centerX, centerY);
      }
      if (toast) {
        toast.classList.add("show");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
      }
    });
  }

  // Music button: browsers require a user gesture before audio can play.
  // This creates a gentle synthesized chime without needing an external music file.
  const musicBtn = document.getElementById("musicBtn");
  let audioContext = null;
  let musicOn = false;
  let musicTimer = null;
  let noteIndex = 0;
  const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];

  function playNote() {
    if (!audioContext || !musicOn) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = notes[noteIndex % notes.length];
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.55);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.58);
    noteIndex++;
  }

  if (musicBtn) {
    musicBtn.addEventListener("click", async () => {
      try {
        if (!audioContext) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) {
            if (toast) {
              toast.textContent = "Your browser does not support this music effect.";
              toast.classList.add("show");
              window.setTimeout(() => toast.classList.remove("show"), 2500);
            }
            return;
          }
          audioContext = new AudioContextClass();
        }
        if (audioContext.state === "suspended") await audioContext.resume();
        musicOn = !musicOn;
        musicBtn.innerHTML = musicOn ? "♫ <span>Music On</span>" : "♫ <span>Music</span>";
        if (musicOn) {
          playNote();
          musicTimer = window.setInterval(playNote, 480);
        } else {
          window.clearInterval(musicTimer);
        }
      } catch (error) {
        console.error("Could not start music:", error);
      }
    });
  }
});
