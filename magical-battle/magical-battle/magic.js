// ══════════════════════════════════════
//   MAGICAL BATTLE — Magic JS Engine
// ══════════════════════════════════════

const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

let W, H, particles = [], sparkles = [];

const COLORS = ['#ff6eb4', '#9b59d0', '#3ec9f0', '#f5c842', '#ffffff', '#ffb8e0', '#d4a0ff'];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

// ── Floating star particles ──
class Particle {
  constructor() { this.reset(true); }
  reset(init = false) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : H + 10;
    this.r = Math.random() * 1.8 + 0.3;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.speed = Math.random() * 0.4 + 0.1;
    this.opacity = Math.random() * 0.7 + 0.1;
    this.twinkle = Math.random() * Math.PI * 2;
    this.twinkleSpeed = Math.random() * 0.03 + 0.01;
    this.drift = (Math.random() - 0.5) * 0.3;
  }
  update() {
    this.y -= this.speed;
    this.x += this.drift;
    this.twinkle += this.twinkleSpeed;
    if (this.y < -10) this.reset();
  }
  draw() {
    const alpha = this.opacity * (0.6 + 0.4 * Math.sin(this.twinkle));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.r * 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Sparkle bursts ──
class Sparkle {
  constructor(x, y, color) {
    this.x = x; this.y = y;
    this.color = color || COLORS[Math.floor(Math.random() * COLORS.length)];
    this.life = 1;
    this.decay = Math.random() * 0.03 + 0.015;
    this.size = Math.random() * 3 + 1;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 0.5) * 3;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.size *= 0.97;
  }
  draw() {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    // draw 4-pointed star
    const s = this.size;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - s);
    ctx.lineTo(this.x + s * 0.3, this.y - s * 0.3);
    ctx.lineTo(this.x + s, this.y);
    ctx.lineTo(this.x + s * 0.3, this.y + s * 0.3);
    ctx.lineTo(this.x, this.y + s);
    ctx.lineTo(this.x - s * 0.3, this.y + s * 0.3);
    ctx.lineTo(this.x - s, this.y);
    ctx.lineTo(this.x - s * 0.3, this.y - s * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function init() {
  resize();
  particles = Array.from({ length: 140 }, () => new Particle());
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  sparkles = sparkles.filter(s => s.life > 0);
  sparkles.forEach(s => { s.update(); s.draw(); });
  requestAnimationFrame(loop);
}

// Mouse sparkle burst
document.addEventListener('mousemove', (e) => {
  if (Math.random() > 0.85) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    for (let i = 0; i < 2; i++) sparkles.push(new Sparkle(e.clientX, e.clientY, color));
  }
});

document.addEventListener('click', (e) => {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  for (let i = 0; i < 12; i++) sparkles.push(new Sparkle(e.clientX, e.clientY, color));
});

window.addEventListener('resize', () => { resize(); });

// ── Scroll reveal ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.stat, .char-card, .ability-card, .section-title, .section-text').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Add reveal CSS dynamically
const style = document.createElement('style');
style.textContent = `
  .reveal { opacity: 0; transform: translateY(28px); transition: opacity .7s ease, transform .7s ease; }
  .reveal.revealed { opacity: 1; transform: none; }
  .char-card.reveal { transition-delay: calc(var(--i, 0) * 0.1s); }
`;
document.head.appendChild(style);

document.querySelectorAll('.char-card').forEach((el, i) => el.style.setProperty('--i', i));

init();
loop();
