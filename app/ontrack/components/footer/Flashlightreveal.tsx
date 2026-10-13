"use client"
import React, { useEffect, useRef } from 'react'

// Gradient sample points (0 = beam center, 1 = beam edge).
const STOPS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
const smoothstep = (t) => t * t * (3 - 2 * t)

/**
 * Covers an image in near-black darkness and reveals a soft, feathered
 * "flashlight" around the pointer, only while the pointer is moving.
 *
 * Props
 *  src, alt            – the image
 *  className           – extra classes for the container
 *  imgClassName        – extra classes for the <img>
 *  imgStyle            – inline style for the <img> (e.g. a scroll-zoom transform)
 *  radius              – beam radius in px (default: ~20% of container width, clamped 150–320)
 *  darkness            – overlay opacity when idle, 0–1 (default 0.93)
 *  strength            – how much darkness the beam removes at its center, 0–1 (default 0.6)
 *  idleDelay           – ms of no movement before the light fades out (default 650)
 *  followSpeed         – how tightly the beam tracks the cursor (higher = snappier)
 *  fadeInSpeed / fadeOutSpeed – fade rates (higher = faster)
 *  tint                – overlay RGB as "r, g, b" (default near-black with a cool hint)
 */
export const FlashlightReveal = ({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  imgStyle,
  radius,
  darkness = 0.93,
  strength = 0.6,
  idleDelay = 650,
  followSpeed = 11,
  fadeInSpeed = 7,
  fadeOutSpeed = 4,
  tint = '5, 5, 8',
}) => {
  const containerRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const overlay = overlayRef.current
    if (!container || !overlay) return

    // Mutable animation state lives outside React so moving the mouse never re-renders.
    const state = {
      targetX: 0,
      targetY: 0,
      x: 0,
      y: 0,
      intensity: 0,
      active: false,
      radius: 240,
      last: 0,
    }
    let raf = 0
    let idleTimer = 0
    let running = false

    const paint = () => {
      const { x, y, intensity, radius: r } = state

      // Fully idle: a flat, uniform overlay. No gradient, so nothing can linger.
      if (intensity < 0.001) {
        overlay.style.background = `rgba(${tint}, ${darkness})`
        return
      }

      // Each stop's alpha eases from "slightly lit" at the center back to the
      // exact idle darkness at the edge, so the beam has no visible border.
      const stops = STOPS.map((t) => {
        const reveal = 1 - smoothstep(t)
        const alpha = darkness * (1 - strength * intensity * reveal)
        return `rgba(${tint}, ${alpha.toFixed(4)}) ${(t * 100).toFixed(0)}%`
      }).join(', ')

      overlay.style.background = `radial-gradient(circle ${r.toFixed(1)}px at ${x.toFixed(
        1
      )}px ${y.toFixed(1)}px, ${stops})`
    }

    const tick = (now) => {
      // Frame-rate independent smoothing.
      const dt = Math.min((now - state.last) / 1000, 0.05)
      state.last = now

      const kPos = 1 - Math.exp(-followSpeed * dt)
      state.x += (state.targetX - state.x) * kPos
      state.y += (state.targetY - state.y) * kPos

      const target = state.active ? 1 : 0
      const speed = state.active ? fadeInSpeed : fadeOutSpeed
      state.intensity += (target - state.intensity) * (1 - Math.exp(-speed * dt))

      // Fully faded out: snap to exactly dark and stop the loop entirely.
      if (!state.active && state.intensity < 0.003) {
        state.intensity = 0
        paint()
        running = false
        return
      }

      paint()
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running) return
      running = true
      state.last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    const onMove = (e) => {
      // Coordinates relative to this container, not the viewport.
      const rect = container.getBoundingClientRect()
      state.targetX = e.clientX - rect.left
      state.targetY = e.clientY - rect.top
      state.radius = radius ?? Math.max(150, Math.min(rect.width * 0.2, 320))

      // When the light is off, appear under the cursor instead of gliding in from the last spot.
      if (state.intensity < 0.01) {
        state.x = state.targetX
        state.y = state.targetY
      }

      state.active = true
      clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        state.active = false
        start()
      }, idleDelay)
      start()
    }

    const onLeave = () => {
      clearTimeout(idleTimer)
      state.active = false
      start()
    }

    paint()

    container.addEventListener('pointermove', onMove, { passive: true })
    container.addEventListener('pointerdown', onMove, { passive: true })
    container.addEventListener('pointerleave', onLeave)
    container.addEventListener('pointercancel', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(idleTimer)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerdown', onMove)
      container.removeEventListener('pointerleave', onLeave)
      container.removeEventListener('pointercancel', onLeave)
    }
  }, [radius, darkness, strength, idleDelay, followSpeed, fadeInSpeed, fadeOutSpeed, tint])

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none ${className}`}
      // pan-y keeps vertical page scrolling working on touch devices.
      style={{ touchAction: 'pan-y' }}
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
  )
}