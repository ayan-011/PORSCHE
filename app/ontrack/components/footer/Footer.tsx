"use client";

import { useEffect, useRef, useState } from "react"; 
import { FlashlightReveal } from "./Flashlightreveal";

export const Footer = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(1.5);

  useEffect(() => {
    const MAX_SCALE = 1.5;
    let frame: number | undefined;

    const update = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();

      if (rect.height === 0) return;

      const vh = window.innerHeight;
      const progress = Math.min(
        Math.max((vh - rect.top) / rect.height, 0),
        1
      );

      setScale(MAX_SCALE - (MAX_SCALE - 1) * progress);
    };

    const onScroll = () => {
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }

      frame = requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="w-full">
      <FlashlightReveal
        src="/sidefinal.png"
        imgClassName="object-cover will-change-transform"
        imgStyle={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      />
    </div>
  );
};

export default Footer;