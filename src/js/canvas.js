export function initFlowField() {
  const canvas = document.getElementById('worldCanvas');
  if (!canvas) return;
  const section = canvas.parentElement;
  if (!section) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = section.offsetWidth;
    canvas.height = section.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const N = 200;
  const particles = Array.from({ length: N }, () => ({
    x:      Math.random() * canvas.width,
    y:      Math.random() * canvas.height,
    age:    Math.random() * 200,
    maxAge: 140 + Math.random() * 120,
    rust:   Math.random() < 0.1,
    speed:  0.5 + Math.random() * 0.6,
    size:   Math.random() * 1.1 + 0.2
  }));

  let t = 0;

  function flowAngle(x, y, t) {
    const s = 0.0025;
    return (
      Math.sin(x * s + t * 0.25) * Math.cos(y * s * 0.7 + t * 0.18) * Math.PI * 2 +
      Math.cos(x * s * 0.5 - y * s + t * 0.12) * Math.PI
    );
  }

  function draw() {
    ctx.fillStyle = 'rgba(7,7,13,0.12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    t += 0.006;

    particles.forEach(p => {
      p.age++;
      if (p.age > p.maxAge || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
        p.age = 0;
        p.maxAge = 140 + Math.random() * 120;
        return;
      }

      const life  = p.age / p.maxAge;
      const alpha = life < 0.15 ? life / 0.15 : life > 0.75 ? (1 - life) / 0.25 : 1;
      const angle = flowAngle(p.x, p.y, t);

      const px = p.x;
      const py = p.y;
      p.x += Math.cos(angle) * p.speed;
      p.y += Math.sin(angle) * p.speed;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = p.rust
        ? `rgba(168,75,42,${alpha * 0.45})`
        : `rgba(232,228,220,${alpha * 0.12})`;
      ctx.lineWidth = p.size;
      ctx.stroke();
    });

    requestAnimationFrame(draw);
  }

  const flowObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) draw();
  }, { threshold: 0.01 });
  flowObs.observe(section);
}