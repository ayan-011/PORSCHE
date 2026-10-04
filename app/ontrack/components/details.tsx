"use client"
 
import { useEffect, useRef, useState } from "react";

type Race = {
  id: string;
  round: string;
  title: string;
  series: string;
  dates: string;
  image: string;
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/420`;

const races: Race[] = [
  { id: "barcelona", round: "Race 4", title: "Circuit de Barcelona-Catalunya", series: "Porsche Sprint Challenge Southern Europe", dates: "27-28.02.2026", image: img("porsche-barcelona") },
  { id: "imola", round: "Race 1", title: "WEC Imola", series: "Porsche Sixt Carrera Cup Deutschland", dates: "17-19.04.2026", image: img("porsche-imola") },
  { id: "red-bull-ring", round: "Race 2", title: "DTM Red Bull Ring", series: "Porsche Sixt Carrera Cup Deutschland", dates: "24-26.04.2026", image: img("porsche-redbullring") },
  { id: "spa", round: "Race 3", title: "GT Open Spa-Francorchamps", series: "Porsche Sixt Carrera Cup Deutschland", dates: "15-17.05.2026", image: img("porsche-spa") },
  { id: "zandvoort-dtm", round: "Race 4", title: "DTM Zandvoort", series: "Porsche Sixt Carrera Cup Deutschland", dates: "22-24.05.2026", image: img("porsche-zandvoort-dtm") },
  { id: "lausitzring", round: "Race 5", title: "DTM Lausitzring", series: "Porsche Sixt Carrera Cup Deutschland", dates: "19-21.06.2026", image: img("porsche-lausitzring") },
  { id: "nurburgring", round: "Race 7", title: "DTM Nurburgring", series: "Porsche Sixt Carrera Cup Deutschland", dates: "14-16.08.2026", image: img("porsche-nurburgring") },
  { id: "zandvoort-supercup", round: "Race 6", title: "Circuit Zandvoort", series: "Porsche Mobil 1 Supercup - Last edition", dates: "21-23.08.2026", image: img("porsche-zandvoort-supercup") },
];

const PREVIEW_W = 288;
const PREVIEW_H = 200;

export default function Details() {
  const [active, setActive] = useState<number | null>(null);

  const mainRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 }); // cursor position in viewport coords
  const current = useRef({ x: 0, y: 0 }); // where the preview is (eased)
  const visible = useRef(false);
  const raf = useRef<number>();

  // Ease the preview toward the cursor so it trails slightly.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = reduce ? 1 : 0.15;

    const tick = () => {
      const c = current.current;
      const t = target.current;
      c.x += (t.x - c.x) * ease;
      c.y += (t.y - c.y) * ease;
      // Convert viewport coords to coords inside <main>, recomputed every frame
      // so the preview stays correct while the page scrolls.
      const rect = mainRef.current?.getBoundingClientRect();
      if (previewRef.current && rect) {
        previewRef.current.style.transform = `translate3d(${
          c.x - rect.left - PREVIEW_W / 2
        }px, ${c.y - rect.top - PREVIEW_H / 2}px, 0)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const handleMove = (e: React.MouseEvent) => {
    target.current = { x: e.clientX, y: e.clientY };
    // First move after entering: snap so it doesn't fly in from the old spot.
    if (!visible.current) {
      current.current = { ...target.current };
      visible.current = true;
    }
  };

  const handleLeave = () => {
    visible.current = false;
    setActive(null);
  };

  return (
    <main
      ref={mainRef}
      className="relative min-h-screen select-none overflow-hidden bg-black py-6 text-white"
    >
      <h1 className="sr-only">Porsche racing calendar 2026</h1>

      <ul
        className="mx-auto max-w-[1800px]"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {races.map((race, i) => (
          <li
            key={race.id}
            className={`px-6 transition-opacity duration-300 md:px-16 ${
              active !== null && active !== i ? "opacity-40" : "opacity-100"
            }`}
          >
            <a
            //   href={`#${race.id}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="group flex items-end justify-between gap-6 border-b border-white/30 py-7 outline-none focus-visible:bg-white/5 md:py-8"
            >
              <div className="transition-transform duration-500 ease-out group-hover:translate-x-3 motion-reduce:transform-none">
                <h2 className="font-display text-3xl uppercase leading-none tracking-wide md:text-4xl">
                  {race.round} - {race.title}
                </h2>
                <p className="mt-1 text-sm">{race.series}</p>
              </div>
              <time className="shrink-0 pb-0.5 text-sm">{race.dates}</time>
            </a>
          </li>
        ))}
      </ul>

      {/* Cursor-following preview. All images are mounted (so they're preloaded)
          and cross-fade by opacity depending on the hovered row. */}
      <div
        ref={previewRef}
        aria-hidden="true"
        style={{ width: PREVIEW_W, height: PREVIEW_H }}
        className="pointer-events-none absolute left-0 top-0 z-50 hidden will-change-transform [@media(hover:hover)]:block"
      >
        <div
          className={`relative h-full w-full overflow-hidden rounded-sm shadow-2xl shadow-black/60 transition-[opacity,transform] duration-300 ease-out ${
            active !== null ? "scale-100 opacity-100" : "scale-95 opacity-0"
          } motion-reduce:transform-none`}
        >
          {races.map((race, i) => (
            <img
              key={race.id}
              src={race.image}
              alt=""
              draggable={false}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out ${
                active === i ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}