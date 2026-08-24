import { useEffect, useRef } from 'react'

const FADE_DURATION = 0.5 // seconds

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const tick = () => {
      const { currentTime, duration } = video

      if (duration && !Number.isNaN(duration)) {
        let opacity = 1

        if (currentTime < FADE_DURATION) {
          // fade in
          opacity = currentTime / FADE_DURATION
        } else if (currentTime > duration - FADE_DURATION) {
          // fade out
          opacity = Math.max(0, (duration - currentTime) / FADE_DURATION)
        }

        video.style.opacity = String(Math.min(1, Math.max(0, opacity)))
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    const handleEnded = () => {
      video.style.opacity = '0'
      window.setTimeout(() => {
        video.currentTime = 0
        video.play().catch(() => {
          /* autoplay may be blocked until user interaction */
        })
      }, 100)
    }

    video.addEventListener('ended', handleEnded)
    rafRef.current = requestAnimationFrame(tick)
    video.play().catch(() => {
      /* autoplay may be blocked until user interaction */
    })

    return () => {
      video.removeEventListener('ended', handleEnded)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      className="absolute z-0"
      style={{ top: '300px', right: 0, bottom: 0, left: 0 }}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        style={{ opacity: 0 }}
        src="/hero-video.mp4"
        muted
        playsInline
        autoPlay
        preload="auto"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
    </div>
  )
}
