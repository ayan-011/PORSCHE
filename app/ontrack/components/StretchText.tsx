
"use client"


/**
 * Scroll demo (based on Codrops / Bureau DAM) — React + TypeScript + Tailwind
 *
 * Install:
 *   npm i gsap lenis
 *
 * Usage:
 *   import InfiniteLoopScroll from './InfiniteLoopScroll';
 *   <InfiniteLoopScroll />
 *
 * Tailwind note: uses arbitrary values (e.g. min-[53em]:) so Tailwind v3.2+ is required.
 */
"use client"
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ⬇️ TYPE YOUR IMAGE URL HERE
// - Local file: put it in your `public/` folder (e.g. public/img/1.jpg) and use '/img/1.jpg'
// - Remote file: use a full URL, e.g. 'https://example.com/photo.jpg'
const IMAGE_URL = '/ontrack/trackcar3.jpg';

type Props = {
  imageUrl?: string; // optional override: <InfiniteLoopScroll imageUrl="/other.jpg" />
};

// const LOGO_PATH =
//   'M56.3 232.3 56.3 193.8C56.3 177.4 54.7 174.1 48.5 165.9 35.4 148.8 17.6 133 8.5 120.8.7 110.3.1 103.7.1 85.6L.1 45.2C.1 14.9 13.5.5 41 .5 68.8.5 79.1 15.3 79.1 45.2L79.1 94.5 56.9 94.5 56.9 48.5C56.9 35 53.5 25.8 40.7 25.8 29.8 25.8 24.1 32.4 24.1 45.2L24.1 85.3C24.1 96.8 25.1 100.1 29.8 106.3 41 121.8 59.1 137.6 68.8 150.4 77.2 161.6 80 169.8 80 193.5L80 232.3C80 260.9 68.8 277 40.4 277 12.3 277 .1 261.5.1 232.3L.1 174.7 22.9 174.7 22.9 228.7C22.9 243.1 26.9 252.3 40.1 252.3 51.6 252.3 56.3 245.1 56.3 232.3ZM176.5 277 101.5 277 101.5.5 127.1.5 127.1 251.8 176.5 251.8 176.5 277ZM290 277 264.5 277 258.4 230.6 217.1 230.6 211 277 186.2 277 224.1.5 254.1.5 290 277ZM218.1 207.1 253.4 207.1C247.7 159.7 241.6 114 236.3 65.3 230.5 114 224.5 159.7 218.1 207.1ZM399.6 277 374 277 326.3 75.1C326.6 117.1 326.6 155.7 326.6 197.7L326.6 277 304.5 277 304.5.5 335 .5 377.4 203.1C377 165.1 377 129.2 377 91.2L377 .5 399.6.5 399.6 277ZM471.5 277 446.3 277 446.3 26.3 415.3 26.3 415.3.5 502.4.5 502.4 26.3 471.5 26.3 471.5 277Z';

export default function StrechText({ imageUrl = IMAGE_URL }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Page-level setup: Typekit font, base font-size (14px so rem-based Tailwind classes match the original), body colors
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://use.typekit.net/bvo6szq.css';
    document.head.appendChild(link);

    const root = document.documentElement;
    const prevFontSize = root.style.fontSize;
    const prevBg = document.body.style.backgroundColor;
    const prevMargin = document.body.style.margin;
    root.style.fontSize = '14px';
    document.body.style.backgroundColor = '#000';
    document.body.style.margin = '0';

    return () => {
      document.head.removeChild(link);
      root.style.fontSize = prevFontSize;
      document.body.style.backgroundColor = prevBg;
      document.body.style.margin = prevMargin;
    };
  }, []);

  // Wait for the image before starting
  useEffect(() => {
    const img = new Image();
    const done = () => setLoading(false);
    img.onload = done;
    img.onerror = done;
    img.src = imageUrl;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  // Smooth scrolling + scroll animations, set up once the image has loaded
  useEffect(() => {
    if (loading || !gridRef.current) return;

    const lenis = new Lenis();
    lenis.on('scroll', () => ScrollTrigger.update());

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const ctx = gsap.context(() => {
      const [firstItem, imageItem] = Array.from(gridRef.current!.children) as HTMLElement[];

      // First slideH folds away as you scroll past it
      gsap.set(firstItem, { transformOrigin: '50% 100%' });
      gsap.to(firstItem, {
        ease: 'none',
        startAt: { scaleY: 1 },
        scaleY: 0,
        scrollTrigger: {
          trigger: firstItem,
          start: 'center center',
          end: 'bottom top',
          scrub: true,
          fastScrollEnd: true,
        },
      });

      // Image slide grows in from the top edge
      gsap.set(imageItem, { transformOrigin: '50% 0%' });
      gsap.to(imageItem, {
        ease: 'none',
        startAt: { scale: 0 },
        scale: 1,
        scrollTrigger: {
          trigger: imageItem,
          start: 'top bottom',
          end: 'center center',
          scrub: true,
        },
      });
    }, gridRef);

    const refresh = () => {
      ScrollTrigger.clearScrollMemory();
      window.history.scrollRestoration = 'manual';
      ScrollTrigger.refresh(true);
    };
    refresh();
    window.addEventListener('resize', refresh);

    return () => {
      window.removeEventListener('resize', refresh);
      cancelAnimationFrame(rafId);
      ctx.revert();
      lenis.destroy();
    };
  }, [loading]);

  return (
    <main
      className="min-h-screen bg- uppercase text-white antialiased"
      style={{
        fontFamily:
          'tenon, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Page loader */}
      <style>{`@keyframes loaderAnim { to { opacity: 1; transform: scale3d(0.5, 0.5, 1); } }`}</style>
      {loading && (
        <>
          <div className="fixed inset-0 z-[1000] bg-black" />
          <div className="fixed left-1/2 top-1/2 z-[1000] -ml-[30px] -mt-[30px] h-[60px] w-[60px] rounded-full bg-[#aaa] opacity-40 [animation:loaderAnim_0.7s_linear_infinite_alternate_forwards]" />
        </>
      )}
 
      <div ref={gridRef} className="flex flex-col  gap-[5vh]">
        {/* Slide 1: logo + credits */}
        <div className="grid h-screen place-items-center gap-9">
          <div className="grid h-fit bg-red-  place-items-center  grid-rows-[1fr_auto]  ">
            <div
              className="pt-32 px-4 min-[53em]:pt-12"
            
            >
              <p className='text-white text-[45vw] -mt-60 font-sixcap select-none'>PORSCHE</p>
            </div>
          </div>
            <p className=" m-0 mb- text-center text-base font-light tracking-[0.25em] [word-spacing:0.75em] min-[53em]:text-[1.4vw]">
              A scrolling demo based on Bureau DAM
            </p>
        </div>

        {/* Slide 2: image */}
        <div className="grid h-screen place-items-center">
          <div
            className="aspect-[1.5] h-[70vh] bg-cover bg-[50%_50%]"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        </div>
      </div>
    </main>
  );
}