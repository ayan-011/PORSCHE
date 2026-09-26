"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Swap this for your own still — a moody, wide shot works best since it
// gets cropped tight at the small size and reframed as it grows.
const HERO_IMAGE = "/ontrack/trackstart.jpg";

export default function Start() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Progress runs from the moment the section's top edge enters the
  // bottom of the viewport to the moment it reaches the top — i.e. the
  // whole animation plays out within one viewport height of scrolling,
  // starting the instant the section comes into view.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });

  const width = useTransform(scrollYProgress, [0, 0.7], ["80vw", "100vw"]);
  const height = useTransform(scrollYProgress, [0, 0.7], ["88vh", "100vh"]);

  const titleScale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const taglineOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 1]);
  const taglineY = useTransform(scrollYProgress, [0.5, 1], [14, 0]);

  // Parallax: the frame itself lifts up a little as it grows...
  const containerY = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);
  // ...while the image inside drifts down, the opposite direction. The
  // image is sized to 130% of the frame and centered with -15% inset,
  // so a ±10% drift never uncovers an edge.
  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={sectionRef} className="relative h-screen w-full bg-black">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <motion.div
          style={{ width, height, y: containerY }}
          className="relative overflow-hidden"
        >
          <motion.img
            src={HERO_IMAGE}
            alt="OnTrack"
            style={{ y: imageY }}
            className="absolute -inset-y-[15%] inset-x-0 h-[130%] w-full object-cover"
          />

          {/* Cinematic gradient: near-solid black up top for the title, clearing toward the middle */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
          {/* Vignette along the bottom edge so the frame doesn't float */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute inset-0 flex flex-col gap-4 p-6">
            <motion.h1
              style={{ scale: titleScale }}
              className="font-formula mt-7 bg-gradient-to-b from-white to-transparent bg-clip-text text-transparent text-3xl font-extrabold tracking-tight sm:text-6xl md:text-8xl"
            >
              <span className="">01.</span> ON TRACK
            </motion.h1>
          </div>
        </motion.div>
      </div>
    </section>
  );
}