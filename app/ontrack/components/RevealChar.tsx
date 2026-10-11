"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";

// Swap this for your own still.
const DETAIL_IMAGE = "./ontrack/img1.png";

const HEADLINE =
  "A vehicle should say something before it moves. Every line, material, and finish is considered.";

const GRAY = "#57575c"; // not-yet-read
const FLASH = "#d9694f"; // the word currently crossing over
const WHITE = "#ffffff"; // already read

// The reveal only happens inside this window of scroll progress.
const PHASE_START = 0.2;
const PHASE_END = 0.45;
const BAND = 0.012;

function RevealChar({
  children,
  progress,
  index,
  total,
}: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const rawPosition = index / Math.max(total - 1, 1);
  const center =
    PHASE_START + BAND + rawPosition * (PHASE_END - PHASE_START - 2 * BAND);
  const color = useTransform(
    progress,
    [center - BAND, center, center + BAND],
    [GRAY, FLASH, WHITE]
  );
  return <motion.span style={{ color }}>{children}</motion.span>;
}

export default function Statement() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Image drifts UPWARD as you scroll down (positive -> negative).
  // Stay within +/-10% of the image height (the image is 130% of its
  // frame, so there is ~13% of frame height of headroom each side).
  const imageY = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);

  // ---- Frame movement: keeps rising until the page ends ----
  // FRAME_START: how far below its resting spot the frame begins (px).
  // FRAME_SPEED: extra upward px per 1px of page scroll. Higher = faster.
  //   0 = moves with the page normally, 0.8 = fast, 1.2 = very fast.
  const FRAME_START = 250;
  const FRAME_SPEED = 0.3;

  const { scrollY } = useScroll(); // whole-page scroll, never clamped to the section
  const sectionTop = useRef(0);
  const viewportH = useRef(0);

  useEffect(() => {
    const measure = () => {
      const el = sectionRef.current;
      if (!el) return;
      sectionTop.current = el.getBoundingClientRect().top + window.scrollY;
      viewportH.current = window.innerHeight;
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, []);

  const frameYRaw = useTransform(scrollY, (v) => {
    // px scrolled since the section's top entered the bottom of the viewport
    const delta = Math.max(v - (sectionTop.current - viewportH.current), 0);
    return FRAME_START - delta * FRAME_SPEED;
  });
  // Snappier spring so it follows scroll quickly in both directions.
  const frameY = useSpring(frameYRaw, { stiffness: 0, damping: 10, mass: 0.1 });

  const words = HEADLINE.split(/(\s+)/);
  const totalLetters = HEADLINE.replace(/\s+/g, "").length;
  let letterIndex = 0;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-x-clip bg-[#0a0a0a] py-24 text-white sm:py-32 lg:py-40"
    >
      {/* Wide container: fluid side padding + very high max width */}
      <div className="mx-auto grid w-full max-w-[2000px] grid-cols-1 items-center gap-14 px-[6vw] lg:grid-cols-[minmax(0,1fr)_minmax(280px,24vw)] lg:gap-[6vw] xl:px-[9vw]">
        {/* Text column */}
        <div>
          <h2
            className="font-serif font-light leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.5rem, 5.8vw, 7rem)" }}
          >
            {words.map((token, wi) => {
              if (/^\s+$/.test(token)) {
                return <span key={wi}>{token}</span>;
              }
              return (
                <span key={wi} className="inline-block whitespace-nowrap">
                  {Array.from(token).map((ch) => {
                    const idx = letterIndex++;
                    return (
                      <RevealChar
                        key={idx}
                        progress={scrollYProgress}
                        index={idx}
                        total={totalLetters}
                      >
                        {ch}
                      </RevealChar>
                    );
                  })}
                </span>
              );
            })}
          </h2>

          <p className="mt-10 max-w-[34rem] text-base leading-relaxed text-white/60 sm:text-lg lg:mt-16">
            Our services are shaped with intent, from exterior styling and
            interior refinement to performance upgrades, detailing and bespoke
            finishes; each detail sharpens the vehicle&apos;s character without
            overpowering it.
          </p>

           
        </div>

        {/* Image column: portrait frame, parallax moves up on scroll */}
        <motion.div
          style={{ y: frameY }}
          className="relative aspect-[3/4] w-full overflow-hidden  will-change-transform lg:justify-self-end"
        >
          <motion.img
            src={DETAIL_IMAGE}
            alt=""
            style={{ y: imageY }}
            className="absolute -inset-y-[20%] inset-x-0 h-[140%] w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}