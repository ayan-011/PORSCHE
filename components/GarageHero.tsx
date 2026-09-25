"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// three.js/R3F need the DOM, and we don't want it in the server bundle —
// load it client-side only, and only once GarageHero itself mounts.
const CarScene = dynamic(() => import("./CarScene"), { ssr: false });

// Exact door coordinates sampled from the source artwork (1671 x 941)
// so the shutter panel and the zoom target line up pixel-perfectly
// no matter the viewport size (the scene div preserves this aspect ratio).
const IMG_W = 1671;
const IMG_H = 941;
const DOOR = { x0: 418, y0: 199, x1: 1257, y1: 722 };

const doorStyle = {
  left: `${(DOOR.x0 / IMG_W) * 100}%`,
  top: `${(DOOR.y0 / IMG_H) * 100}%`,
  width: `${((DOOR.x1 - DOOR.x0) / IMG_W) * 100}%`,
  height: `${((DOOR.y1 - DOOR.y0) / IMG_H) * 100}%`,
};

const centerX = ((DOOR.x0 + DOOR.x1) / 2 / IMG_W) * 100;
const centerY = ((DOOR.y0 + DOOR.y1) / 2 / IMG_H) * 100;
const aspect = IMG_W / IMG_H;

export default function GarageHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const doorRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  // driven straight by GSAP each scroll tick; read per-frame inside the
  // R3F loop (via CarModel's useFrame) so the orbit never triggers a
  // React re-render.
  const orbitProgressRef = useRef(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro reveal for the CARS wordmark / hint text
      gsap.fromTo(
        introRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.3 }
      );

      // Whole sequence lives on one 0->1 progress axis, scrubbed to
      // scroll. Every stage below is a fraction of that axis:
      //   0.00 – 0.04   intro copy / scroll cue fade out
      //   0.03 – 0.24   shutter rolls up and out of the opening
      //   0.20 – 0.44   2D plate "pushes in" toward the dark opening
      //   0.34 – 0.47   3D scene crossfades in over the tail of the push-in
      //   0.47 – 0.93   camera orbits the car: side -> front -> side
      //   0.95 – 1.00   pinned section releases into normal scrolling
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=650%",
          scrub: 1,
          pin: stickyRef.current,
          anticipatePin: 1,
        },
      });

      tl.to(introRef.current, { opacity: 0, y: -20, duration: 0.04 }, 0)
        .to(cueRef.current, { opacity: 0, duration: 0.04 }, 0)
        // the shutter rolls up and out of the opening
        .to(
          doorRef.current,
          { yPercent: -104, duration: 0.21, ease: "power2.inOut" },
          0.03
        )
        // subtle top-down shade races down as the door retracts, selling depth
        .fromTo(
          shadeRef.current,
          { yPercent: -100, opacity: 0.9 },
          { yPercent: 0, opacity: 0, duration: 0.21, ease: "power2.inOut" },
          0.03
        )
        // 2D plate pushes toward the dark opening
        .to(
          sceneRef.current,
          { scale: 4.5, duration: 0.24, ease: "power1.inOut" },
          0.2
        )
        .to(vignetteRef.current, { opacity: 1, duration: 0.18 }, 0.22)
        .to(headerRef.current, { opacity: 0, duration: 0.12 }, 0.22)
        // crossfade to the 3D scene right as the darkness fills the frame
        .to(
          canvasWrapRef.current,
          { opacity: 1, duration: 0.13, ease: "power1.in" },
          0.34
        )
        // camera sweeps around the car: left side -> front -> right side
        .to(
          orbitProgressRef,
          { current: 1, duration: 0.46, ease: "power1.inOut" },
          0.47
        )
        // release the pin into normal scrolling
        .to(stickyRef.current, { opacity: 0, duration: 0.05 }, 0.95);

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[750vh] bg-garage-ink">
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-garage-ink"
      >
        {/* transparent header, fades out as we push into the garage */}
        <div
          ref={headerRef}
          className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 md:px-12 md:py-2 "
        >
          <span className="font-display text-xl tracking-widest2 text-black">
            CARS
          </span>
          <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-black md:flex">
            <a href="#collection" className="transition hover:text-black/60">
              Collection
            </a>
            <a href="#atelier" className="transition hover:text-black/60">
              Atelier
            </a>
            <a href="#access" className="transition hover:text-black/60">
              Access
            </a>
          </nav>
          <a
            href="#access"
            className="rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.2em] text-black transition hover:border-black/60 hover:text-black/60"
          >
            Request Entry
          </a>
        </div>

        {/* the scaling "camera" — scene keeps the source image's aspect
            ratio and always covers the viewport, like background-size:cover,
            so the door + zoom target stay pixel-aligned at any width */}
        <div
          ref={sceneRef}
          className="absolute left-1/2 top-1/2"
          style={{
            width: `max(100vw, calc(100vh * ${aspect}))`,
            height: `max(100vh, calc(100vw / ${aspect}))`,
            transform: "translate(-50%, -50%)",
            transformOrigin: `${centerX}% ${centerY}%`,
            willChange: "transform",
          }}
        >
          {/* base plate: wall + open doorway with the dark interior & headlights baked in */}
          <img
            src="/wall-open.jpg"
            alt="CARS private garage"
            className="absolute inset-0 h-full w-full select-none object-cover"
            draggable={false}
          />

          {/* the shutter itself, perfectly masked to the opening, rolling up on scroll */}
          <div
            className="absolute overflow-hidden"
            style={doorStyle}
          >
            <div ref={doorRef} className="absolute inset-0">
              <img
                src="/door.jpg"
                alt=""
                className="h-full w-full select-none object-cover"
                draggable={false}
              />
              <div
                ref={shadeRef}
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/10 to-transparent"
              />
            </div>
          </div>
        </div>

        {/* 3D car, crossfaded in once the darkness fills the frame — this
            mounts immediately (off-screen, opacity 0) so the model has the
            whole shutter-opening scroll range to finish downloading before
            it needs to be visible */}
        <div
          ref={canvasWrapRef}
          className="absolute inset-0 z-10 opacity-0"
        >
          <CarScene orbitProgressRef={orbitProgressRef} />
        </div>

        {/* cinematic vignette that deepens as we push into the dark */}
        <div
          ref={vignetteRef}
          className="pointer-events-none absolute inset-0 z-20 opacity-0 "
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        <div className="noise-overlay pointer-events-none absolute inset-0 z-20 opacity-[0.04] " />

        {/* intro copy */}
        {/* <div
          ref={introRef}
          className="pointer-events-none absolute inset-x-0 bottom-28 z-30 flex flex-col items-center px-6 text-center opacity-0"
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.4em] text-garage-cream/70">
            A private collection
          </p>
          <h1 className="font-display text-4xl leading-none text-garage-cream md:text-6xl">
            SOME DOORS <span className="text-garage-red">DON&apos;T OPEN</span>{" "}
            FOR EVERYONE
          </h1>
        </div> */}

        {/* scroll cue */}
        {/* <div
          ref={cueRef}
          className="absolute inset-x-0 bottom-8 z-30 flex flex-col items-center gap-2 text-garage-cream/70"
        >
          <span className="text-[10px] uppercase tracking-[0.35em]">
            Scroll to open
          </span>
          <span className="flicker h-8 w-px bg-garage-cream/50" />
        </div> */}
      </div>
    </section>
  );
}
