"use client"
import React, { useEffect, useRef, useState } from 'react'
import { FlashlightReveal } from './FlashlightReveal'

export const Footer = () => {
  const ref = useRef(null)
  const [scale, setScale] = useState(1.5)

  useEffect(() => {
    const MAX_SCALE = 1.5 // starting (zoomed) size
    let frame

    const update = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight

      // 0 when the footer's top just touches the bottom of the screen,
      // 1 when it has scrolled fully into view
      const progress = Math.min(Math.max((vh - rect.top) / rect.height, 0), 1)

      setScale(MAX_SCALE - (MAX_SCALE - 1) * progress)
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div ref={ref} className='w-full'>
      {/* The zoom is applied to the image only; the dark overlay stays unscaled,
          so cursor coordinates always match the light position. */}
      <FlashlightReveal
        src="sidefinal.png"
        imgClassName='object-cover will-change-transform'
        imgStyle={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
      />
    </div>
  )
}