'use client'

import React, { useEffect, useRef, useState } from 'react'

/*
  Requires Tailwind CSS v3+ (arbitrary values are used).
  Replace `img` with your own image URLs (e.g. img: '/cars/gt3.jpg').
  w / h are design sizes in px (they scale down on small screens).
  top is the card's resting height as a fraction of the viewport (0 = top, 1 = bottom).
*/
interface CardData {
  title: string
  text: string
  tag: string
  w: number
  h: number
  top: number
  img: string
}

const CARDS: CardData[] = [
  { title: 'Apex GT-R', text: '720 hp twin-turbo V8. Built to hold the racing line through every corner.', tag: 'Qualifying', w: 560, h: 380, top: 0.3, img: '/ontrack/horizontal1.png' },
  { title: 'Pit Crew', text: 'Four tyres in 2.1 seconds. Every second in the pit lane costs a position.', tag: 'Pit lane', w: 260, h: 190, top: 0.16, img: '/ontrack/trackcar1.jpg' },
  { title: 'Turn 7 Hairpin', text: 'Brake at the 50m board, rotate the car, and get on the throttle early.', tag: 'Circuit', w: 380, h: 270, top: 0.5, img: '/ontrack/horizontal3.png' },
  { title: 'Night Session', text: 'Floodlit laps under 1:32. Cooler air means more grip and more power.', tag: 'Endurance', w: 620, h: 400, top: 0.2, img: '/ontrack/horizontal4.png' },
  { title: 'Slick Compound', text: 'Soft tyres reach peak grip in two laps and fade after twelve.', tag: 'Tyres', w: 240, h: 170, top: 0.56, img: '/ontrack/trackcar2.jpg' },
  { title: 'Grid Start', text: 'Twenty engines, one red light, and 200 metres to the first braking zone.', tag: 'Race day', w: 400, h: 290, top: 0.28, img: '/ontrack/trackcar3.jpg' },
  { title: 'Chequered Flag', text: 'Lap 58 of 58. Cross the line first and the podium is yours.', tag: 'Finish', w: 540, h: 360, top: 0.36, img: '/ontrack/car.webp' },
]

const GAPS: number[] = [340, 220, 420, 260, 380, 300] // wide, uneven space between cards
const ANCHOR = 0.5 // card reaches its resting height when its left edge hits 50% of the screen
const SLOPE = 1.1 // steepness of the diagonal entry

// Track drawn on a 1000 x 600 grid, then scaled to the real screen size
// (two gentle, smooth curves across the full width)
const TRACK = { x0: 0, y0: 380, c1x: 220, c1y: 380, c2x: 300, c2y: 250, x1: 500, y1: 290, s2x: 800, s2y: 400, x2: 1000, y2: 300 }

const buildTrack = (w: number, h: number) => {
  const sx = w / 1000
  const sy = h / 600
  const t = TRACK
  // "S" reflects the previous control point around the joint (500, 290)
  const rx = 2 * t.x1 - t.c2x
  const ry = 2 * t.y1 - t.c2y
  return (
    `M${t.x0 * sx} ${t.y0 * sy} ` +
    `C${t.c1x * sx} ${t.c1y * sy}, ${t.c2x * sx} ${t.c2y * sy}, ${t.x1 * sx} ${t.y1 * sy} ` +
    `C${rx * sx} ${ry * sy}, ${t.s2x * sx} ${t.s2y * sy}, ${t.x2 * sx} ${t.y2 * sy}`
  )
}

export const HorizontalScroll: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const fillRef = useRef<SVGPathElement>(null)
  // same initial value on server and client, so there is no hydration mismatch
  const [size, setSize] = useState({ w: 1000, h: 600 })

  useEffect(() => {
    const wrap = wrapRef.current
    const fill = fillRef.current
    if (!wrap || !fill) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let vw = 0
    let vh = 0
    let travel = 1
    let xs: number[] = []
    let target = 0
    let current = 0
    let raf = 0

    const readScroll = () => {
      const top = wrap.getBoundingClientRect().top
      target = Math.min(1, Math.max(0, -top / travel))
    }

    const measure = () => {
      vw = window.innerWidth
      vh = window.innerHeight
      setSize({ w: vw, h: vh })
      const scale = Math.min(1, Math.max(0.55, vw / 1000))
      let x = 0
      xs = []
      const sizes = CARDS.map((c, i) => {
        xs.push(x)
        x += c.w * scale + (GAPS[i] ?? 300) * scale
        return { w: c.w * scale, h: c.h * scale }
      })
      travel = vw * 0.85 + xs[xs.length - 1]
      wrap.style.height = `${vh + travel}px`
      cardRefs.current.forEach((el, i) => {
        if (!el) return
        el.style.width = `${sizes[i].w}px`
        const media = el.querySelector<HTMLElement>('[data-media]')
        if (media) media.style.height = `${sizes[i].h}px`
      })
      readScroll()
    }

    const render = () => {
      current += (target - current) * (reduce ? 1 : 0.075) // smoothing
      if (Math.abs(target - current) < 0.00005) current = target
      const scrollX = current * travel
      const anchor = vw * ANCHOR

      cardRefs.current.forEach((el, i) => {
        if (!el) return
        const screenX = vw * 1.05 + xs[i] - scrollX
        const rest = CARDS[i].top * vh
        const diag = Math.max(0, screenX - anchor) * SLOPE // diagonal only until the card reaches its height
        const tilt = Math.min(diag * 0.004, 4)
        el.style.transform = `translate3d(${screenX}px, ${rest + diag}px, 0) rotate(${-tilt * 0.6}deg)`
      })

      // red fill grows from the left along the track
      fill.style.strokeDashoffset = String(1 - current)
      fill.style.opacity = current < 0.002 ? '0' : '1'

      raf = requestAnimationFrame(render)
    }

    measure()
    window.addEventListener('scroll', readScroll, { passive: true })
    window.addEventListener('resize', measure)
    raf = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', readScroll)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const trackPath = buildTrack(size.w, size.h)

  return (
    <div ref={wrapRef} className="relative   font-sans text-[#f2f2ee]">
      <div className="sticky top-0 h-screen overflow-hidden  ">
        {/* Track in the background, behind the cards */}
        <svg
          className="absolute inset-0 z-0 h-full w-full"
          viewBox={`0 0 ${size.w} ${size.h}`}
          aria-hidden="true"
        >
          <path d={trackPath} fill="none" stroke="#3b3e44" strokeWidth={14} strokeLinecap="butt" />
          <path
            ref={fillRef}
            d={trackPath}
            pathLength={1}
            fill="none"
            stroke="#e10600"
            strokeWidth={14}
            strokeLinecap="butt"
            strokeDasharray="1 1"
            strokeDashoffset={1}
            opacity={0}
            style={{ filter: 'drop-shadow(0 0 10px rgba(225,6,0,.7))' }}
          />
        </svg>

        {/* Title, top-left */}
        <div className="absolute left-5 top-6 z-10 max-w-4xl sm:left-10 sm:top-9">
          <h1 className="font-formula m-0 text-[clamp(48px,9vw,140px)] font-black uppercase leading-[0.9] tracking-tight">
            Apex Motorsport
          </h1>
          <p className="mt-4 text-base leading-normal text-[#9a9da3]">
            2026 season. Scroll down to start your lap.
          </p>
        </div>

        {/* Cards */}
        {CARDS.map((c, i) => (
          <article
            key={c.title}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="absolute left-0 top-0 z-10 will-change-transform"
          >
            <div
              data-media
              className="relative w-full overflow-hidden rounded bg-[#1a1b1e] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]"
            >
              {c.img ? (
                <img src={c.img} alt={c.title} className="block h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#2a2c31_0_22px,#212327_22px_44px)]">
                  <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0_46%,rgba(225,6,0,0.9)_46%_49%,transparent_49%)]" />
                  <div className="absolute inset-x-0 bottom-0 h-3.5 bg-[repeating-linear-gradient(90deg,#e10600_0_24px,#f2f2ee_24px_48px)]" />
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-sm bg-[#e10600] px-2 py-0.5 text-xs font-medium text-white">
                {c.tag}
              </span>
            </div>
            <div className="px-0.5 pt-3.5">
              <h2 className="mb-1.5 text-[22px] font-bold uppercase tracking-wide sm:text-[28px]">{c.title}</h2>
              <p className="max-w-[360px] text-sm leading-normal text-[#a9acb2]">{c.text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default HorizontalScroll