"use client";

import confetti from "canvas-confetti";

export function smallBurst(x: number, y: number) {
  confetti({
    particleCount: 28,
    spread: 55,
    startVelocity: 28,
    gravity: 1.1,
    ticks: 120,
    scalar: 0.85,
    origin: { x, y },
    colors: ["#0EA5FF", "#3DBDFF", "#86E0FF", "#F4F4F5"],
    disableForReducedMotion: true,
  });
}

export function bigCelebration() {
  const duration = 1400;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 70,
      startVelocity: 55,
      origin: { x: 0, y: 0.85 },
      colors: ["#0EA5FF", "#3DBDFF", "#86E0FF"],
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 70,
      startVelocity: 55,
      origin: { x: 1, y: 0.85 },
      colors: ["#0EA5FF", "#3DBDFF", "#86E0FF"],
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  confetti({
    particleCount: 90,
    spread: 110,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.4 },
    colors: ["#0EA5FF", "#3DBDFF", "#86E0FF", "#FFFFFF"],
    disableForReducedMotion: true,
  });
}
