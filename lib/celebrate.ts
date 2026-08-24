'use client';

// Confetti burst + a synthesized "pop" sound (Web Audio API), used whenever
// something in the Week View gets checked off. No external assets or
// packages — the sound is generated on the fly and the confetti is drawn to
// a throwaway canvas overlay that removes itself when the animation ends.

let audioCtx: AudioContext | null = null;

function playPop() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // audio blocked or unavailable — fail silently, never break the UI
  }
}

const CONFETTI_COLORS = ['#7A1F2B', '#B08D57', '#C9A24B', '#211815', '#F7F3EC'];

function burstConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const pieces = Array.from({ length: 60 }).map(() => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 140,
    y: canvas.height * 0.35 + (Math.random() - 0.5) * 40,
    vx: (Math.random() - 0.5) * 8,
    vy: -Math.random() * 8 - 4,
    size: 4 + Math.random() * 4,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * Math.PI,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
  }));

  const gravity = 0.28;
  let frame = 0;
  const maxFrames = 70;

  function tick() {
    if (!ctx) return;
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    if (frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(tick);
}

export function celebrate() {
  if (typeof window === 'undefined') return;
  playPop();
  burstConfetti();
}
