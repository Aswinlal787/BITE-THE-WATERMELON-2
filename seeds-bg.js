/**
 * A quiet field of watermelon seeds drifting slowly upward in the
 * background. Purely decorative (aria-hidden canvas), respects
 * prefers-reduced-motion, and scales its seed count to viewport size.
 */
(function () {
  const canvas = document.getElementById("seedCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let seeds = [];
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function seedCountForSize() {
    const area = width * height;
    return Math.max(18, Math.min(60, Math.round(area / 26000)));
  }

  function makeSeed(randomY) {
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : height + Math.random() * 100,
      size: 6 + Math.random() * 7,
      speed: 0.15 + Math.random() * 0.35,
      sway: 0.4 + Math.random() * 0.8,
      swayOffset: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      opacity: 0.12 + Math.random() * 0.22
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = seedCountForSize();
    if (seeds.length < target) {
      while (seeds.length < target) seeds.push(makeSeed(true));
    } else {
      seeds = seeds.slice(0, target);
    }
  }

  function drawSeed(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.globalAlpha = s.opacity;
    ctx.fillStyle = "#2b1608";
    ctx.beginPath();
    ctx.ellipse(0, 0, s.size * 0.42, s.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function tick(time) {
    ctx.clearRect(0, 0, width, height);
    for (const s of seeds) {
      s.y -= s.speed;
      s.x += Math.sin(time / 1600 + s.swayOffset) * s.sway * 0.05;
      s.rotation += s.rotationSpeed;
      if (s.y < -20) Object.assign(s, makeSeed(false));
      if (s.x < -20) s.x = width + 20;
      if (s.x > width + 20) s.x = -20;
      drawSeed(s);
    }
    requestAnimationFrame(tick);
  }

  function drawStatic() {
    // Reduced-motion: draw one calm static frame, no animation loop.
    ctx.clearRect(0, 0, width, height);
    for (const s of seeds) drawSeed(s);
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) drawStatic();
  });

  resize();
  if (reduceMotion) {
    drawStatic();
  } else {
    requestAnimationFrame(tick);
  }
})();
