"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// const HERO_IMAGE = "/ontrack/trackstart.jpg";

type Props = {
  title: string;
  image: string;
}

export default function Start({title, image}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: rawProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });

  // Smooth out raw wheel/trackpad jumps into continuous motion.
  const scrollYProgress = useSpring( rawProgress, {
    stiffness: 300,
    damping: 40,
    mass: 0.5,
    
  });

  // Animate scale, not width/height — same visual "grow" effect,
  // but transform-only so it's GPU-composited instead of reflowed.
  const scaleX = useTransform(scrollYProgress, [0, 0.7], [0.8, 1]);
  const scaleY = useTransform(scrollYProgress, [0, 0.7], [0.88, 1]);

  const titleScale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const taglineOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 1]);
  const taglineY = useTransform(scrollYProgress, [0.5, 1], [14, 0]);

  const containerY = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);
  // Wider range now that it isn't being masked by width/height thrash.
  const imageY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={sectionRef} className="relative h-screen w-full">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <motion.div
          style={{
            scaleX,
            scaleY,
            y: containerY,
            willChange: "transform",
          }}
          className="relative h-screen w-screen overflow-hidden origin-center"
        >
          <motion.img
            src={image}
            alt={title}
            style={{ y: imageY, willChange: "transform" }}
            className="absolute -inset-y-[20%] inset-x-0 h-[140%] w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute inset-0 flex flex-col gap-4 p-6">
            <motion.h1
              style={{ scale: titleScale, willChange: "transform" }}
              className="font-formula  mt-7 bg-gradient-to-b from-white to-transparent bg-clip-text text-transparent text-3xl font-extrabold tracking-tight sm:text-6xl md:text-8xl"
            >
              {title}
            </motion.h1>
          </div>
        </motion.div>
      </div>
    </section>
  );
}