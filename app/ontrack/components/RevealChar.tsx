"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

// Swap this for your own still.
const DETAIL_IMAGE = "./ontrack/img1.png";

const HEADLINE =
  "A vehicle should say something before it moves. Every line, material, and finish is considered.";

const GRAY = "#57575c"; // not-yet-read
const FLASH = "#d9694f"; // the word currently crossing over
const WHITE = "#ffffff"; // already read

/**
 * One letter of the headline. `index`/`total` place it along the
 * paragraph; `progress` is the section's scroll progress (0 → 1).
 * The color goes gray → flash → white across a narrow band of progress
 * centered on this letter's position, so at any given scroll position
 * only the handful of letters at the current "reading edge" show the
 * flash color — everything before is white, everything after is gray.
 */
// The reveal only happens inside this window of scroll progress: nothing
// moves before PHASE_START, and every letter is fully white by
// PHASE_END. Tune these two numbers to change when the effect starts
// and finishes — everything else derives from them.
const PHASE_START = 0.20;
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
  const rawPosition = index / Math.max(total - 1, 1); // 0..1 along the sentence
  // Map that 0..1 position onto [PHASE_START, PHASE_END], leaving BAND
  // of headroom at each end so the first letter's window starts exactly
  // at PHASE_START and the last letter's window ends exactly at
  // PHASE_END — that's what guarantees pure gray before PHASE_START and
  // pure white (no leftover red) after PHASE_END.
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
  const sectionRef = useRef<HTMLDivElement>(null);

  // Narrow window: the reveal plays out while the section's top edge
  // crosses from 85% down the viewport to 15% down it, so it happens
  // early and finishes while the text is still comfortably on screen —
  // independent of exactly how tall the section ends up being.
  const { scrollYProgress: textProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Full pass for the image, so the drift is slower and lasts the
  // whole time the section is in view.
  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(sectionProgress, [0, 1], ["-8%", "8%"]);

  const words = HEADLINE.split(/(\s+)/); // keeps whitespace tokens for wrapping
  const totalLetters = HEADLINE.replace(/\s+/g, "").length;
  let letterIndex = 0;

  return (
    <section ref={sectionRef} className="relative w-full py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:px-12">
        <div>
          <h2 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
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
                        progress={textProgress}
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

          <p className="mt-8 max-w-md text-sm text-white/50 sm:text-base">
            Our services are shaped with intent, from exterior styling and
            interior refinement to performance upgrades, detailing and
            bespoke finishes; each detail sharpens the vehicle&apos;s
            character without overpowering it.
          </p>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden l lg:aspect-[5/6]">
          <motion.img
            src={DETAIL_IMAGE}
            alt=""
            style={{ y: imageY }}
            className="absolute -inset-y-[15%] inset-x-0 h-[130%] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}