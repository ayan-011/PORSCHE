/**
 * Liquid glass lens over an image — React + TypeScript + Tailwind
 *
 * - A square lens (1/4 of the image width) follows the cursor with a smooth, liquid lag
 * - It can never leave the image
 * - Inside, the same image is magnified and refracted (wobbly liquid distortion),
 *   split into R/G/B layers for a rainbow chromatic edge, with glassy highlights
 *
 * Install: nothing extra (React + Tailwind v3.2+ only)
 *
 * Usage:
 *   import LiquidGlassLens from './LiquidGlassLens';
 *   <LiquidGlassLens />
 */
"use client"
import { useEffect, useId, useRef } from 'react';
import type { CSSProperties } from 'react';

// ⬇️ TYPE YOUR IMAGE URL HERE
// - Local file: put it in your `public/` folder (e.g. public/img/1.jpg) and use '/img/1.jpg'
// - Remote file: use a full URL, e.g. 'https://example.com/photo.jpg'
const IMAGE_URL = '/modified.jpg';

// ---- Tweakables ----
const SIZE_RATIO = 0.25; // lens width = 25% of image width (lens is always square)
const ZOOM = 1.4;        // magnification inside the lens
const SPLIT = 0.035;     // rainbow / chromatic split strength (0 = none)
const FOLLOW = 0.16;     // 0-1, how quickly the lens catches up with the cursor (lower = more liquid)
const PAD = 12;          // px the distorted content is oversized by, so displaced edges never show

const RAINBOW =
  '#ff5f6d, #ffc371, #f9f871, #5ff281, #4fd1ff, #7b6cff, #d16bff, #ff5f6d';

type Props = {
  imageUrl?: string;
  alt?: string;
};

export default function LiquidGlassLens({ imageUrl = IMAGE_URL, alt = '' }: Props) {
  const uid = useId().replace(/:/g, '');
  const wrapRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Everything that changes per-frame lives in a ref, so moving the lens never re-renders React
  const s = useRef({ w: 0, h: 0, size: 0, x: 0, y: 0, tx: 0, ty: 0, placed: false });

  useEffect(() => {
    const wrap = wrapRef.current;
    const lens = lensRef.current;
    if (!wrap || !lens) return;

    const state = s.current;
    const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

    // Position the lens + re-map the magnified image inside it
    const draw = () => {
      const { w, h, size, x, y } = state;
      if (!size) return;
      lens.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
      lens.style.setProperty('--a', `${(x / w) * 360 + (y / h) * 120}deg`);
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const z = ZOOM + (i - 1) * SPLIT; // red smallest, blue largest
        el.style.backgroundSize = `${w * z}px ${h * z}px`;
        el.style.backgroundPosition = `${size / 2 + PAD - x * z}px ${size / 2 + PAD - y * z}px`;
      });
    };

    // Measure the image, size the lens, keep it inside the bounds
    const layout = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      const size = Math.min(w * SIZE_RATIO, h);
      state.w = w;
      state.h = h;
      state.size = size;
      lens.style.width = `${size}px`;
      lens.style.height = `${size}px`;
      if (!state.placed) {
        state.x = state.tx = w / 2;
        state.y = state.ty = h / 2;
        state.placed = true;
        lens.style.opacity = '1';
      }
      const half = size / 2;
      state.tx = state.x = clamp(state.x, half, w - half);
      state.ty = state.y = clamp(state.y, half, h - half);
      draw();
    };

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const half = state.size / 2;
      state.tx = clamp(e.clientX - rect.left, half, state.w - half);
      state.ty = clamp(e.clientY - rect.top, half, state.h - half);
    };

    let raf = 0;
    const tick = () => {
      const dx = state.tx - state.x;
      const dy = state.ty - state.y;
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        state.x += dx * FOLLOW;
        state.y += dy * FOLLOW;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    layout();
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerdown', onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerdown', onMove);
    };
  }, []);

  const ringStyle: CSSProperties = {
    background: `conic-gradient(from var(--a, 0deg), ${RAINBOW})`,
    WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
  };

  const channelMatrix = [
    '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', // red only
    '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', // green only
    '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', // blue only
  ];

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto w-full max-w-4xl cursor-none select-none overflow-hidden rounded-"
    >
      {/* SVG filters: liquid wobble + per-channel isolation for the rainbow split */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <filter id={`${uid}-liquid`} colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves={2}
              seed={3}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={18}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          {channelMatrix.map((values, i) => (
            <filter key={i} id={`${uid}-ch${i}`} colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values={values} />
            </filter>
          ))}
        </defs>
      </svg>

      <img src={imageUrl} alt={alt} draggable={false} className="block h-auto w-full" />

      {/* The lens */}
      <div
        ref={lensRef}
        className="pointer-events-none absolute left-0 top-0  rounded-full opacity-0 will-change-transform"
        style={{
          boxShadow:
            '0 20px 40px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.35), inset 0 3px 14px rgba(255,255,255,.5), inset 0 -12px 26px rgba(120,160,255,.3)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
          {/* Refracted, magnified copy of the image (R/G/B layers screened together) */}
          <div
            className="absolute bg-black"
            style={{ inset: -PAD, filter: `url(#${uid}-liquid)` }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                ref={(el) => {
                  layerRefs.current[i] = el;
                }}
                className="absolute inset-0 bg-no-repeat mix-blend-screen"
                style={{ backgroundImage: `url(${imageUrl})`, filter: `url(#${uid}-ch${i})` }}
              />
            ))}
          </div>

          {/* Liquid rainbow tint that slowly shifts as the lens moves */}
          <div
            className="absolute inset-0 opacity-50 mix-blend-overlay"
            style={{ background: `conic-gradient(from var(--a, 0deg), ${RAINBOW})` }}
          />
          <div
            className="absolute inset-0 opacity-25 mix-blend-color-dodge"
            style={{
              background: `linear-gradient(135deg, #ff5f6d 0%, #ffc371 25%, #5ff281 50%, #4fd1ff 75%, #d16bff 100%)`,
            }}
          />

          {/* Glass highlights */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 80% at 25% 0%, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 45%), radial-gradient(90% 60% at 80% 100%, rgba(255,255,255,.25) 0%, rgba(255,255,255,0) 50%)',
            }}
          />
        </div>

        {/* Rainbow rim */}
        <div className="absolute inset-0 rounded-[inherit] p-[2px] opacity-80" style={ringStyle} />
      </div>
    </div>
  );
}