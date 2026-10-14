"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

// Gradient sample points (0 = beam center, 1 = beam edge).
const STOPS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

const smoothstep = (t: number): number => t * t * (3 - 2 * t);

type FlashlightRevealProps = {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  imgStyle?: CSSProperties;
  radius?: number;
  darkness?: number;
  strength?: number;
  idleDelay?: number;
  followSpeed?: number;
  fadeInSpeed?: number;
  fadeOutSpeed?: number;
  tint?: string;
};

export const FlashlightReveal = ({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  imgStyle,
  radius,
  darkness = 0.93,
  strength = 0.6,
  idleDelay = 650,
  followSpeed = 11,
  fadeInSpeed = 7,
  fadeOutSpeed = 4,
  tint = "5, 5, 8",
}: FlashlightRevealProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;

    if (!container || !overlay) return;

    const state = {
      targetX: 0,
      targetY: 0,
      x: 0,
      y: 0,
      intensity: 0,
      active: false,
      radius: 240,
      last: 0,
    };

    let raf = 0;
    let idleTimer: number | undefined;
    let running = false;

    const paint = () => {
      const { x, y, intensity, radius: r } = state;

      if (intensity < 0.001) {
        overlay.style.background = `rgba(${tint}, ${darkness})`;
        return;
      }

      const stops = STOPS.map((t) => {
        const reveal = 1 - smoothstep(t);
        const alpha = darkness * (1 - strength * intensity * reveal);

        return `rgba(${tint}, ${alpha.toFixed(4)}) ${(t * 100).toFixed(0)}%`;
      }).join(", ");

      overlay.style.background = `radial-gradient(circle ${r.toFixed(
        1
      )}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${stops})`;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - state.last) / 1000, 0.05);
      state.last = now;

      const kPos = 1 - Math.exp(-followSpeed * dt);

      state.x += (state.targetX - state.x) * kPos;
      state.y += (state.targetY - state.y) * kPos;

      const target = state.active ? 1 : 0;
      const speed = state.active ? fadeInSpeed : fadeOutSpeed;

      state.intensity +=
        (target - state.intensity) * (1 - Math.exp(-speed * dt));

      if (!state.active && state.intensity < 0.003) {
        state.intensity = 0;
        paint();
        running = false;
        return;
      }

      paint();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;

      running = true;
      state.last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();

      state.targetX = e.clientX - rect.left;
      state.targetY = e.clientY - rect.top;
      state.radius =
        radius ?? Math.max(150, Math.min(rect.width * 0.2, 320));

      if (state.intensity < 0.01) {
        state.x = state.targetX;
        state.y = state.targetY;
      }

      state.active = true;

      if (idleTimer !== undefined) {
        window.clearTimeout(idleTimer);
      }

      idleTimer = window.setTimeout(() => {
        state.active = false;
        start();
      }, idleDelay);

      start();
    };

    const onLeave = () => {
      if (idleTimer !== undefined) {
        window.clearTimeout(idleTimer);
        idleTimer = undefined;
      }

      state.active = false;
      start();
    };

    paint();

    container.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("pointerdown", onMove, { passive: true });
    container.addEventListener("pointerleave", onLeave);
    container.addEventListener("pointercancel", onLeave);

    return () => {
      cancelAnimationFrame(raf);

      if (idleTimer !== undefined) {
        window.clearTimeout(idleTimer);
      }

      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerdown", onMove);
      container.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("pointercancel", onLeave);
    };
  }, [
    radius,
    darkness,
    strength,
    idleDelay,
    followSpeed,
    fadeInSpeed,
    fadeOutSpeed,
    tint,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`block w-full ${imgClassName}`}
        style={imgStyle}
      />

      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: `rgba(${tint}, ${darkness})` }}
      />
    </div>
  );
};

export default FlashlightReveal;