import React, { useEffect, useRef } from 'react'

export interface GurukulParticleFieldProps {
  className?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  baseAlpha: number
  twinklePhase: number
  twinkleSpeed: number
  rgb: string
  hasGlow: boolean
}

export const GurukulParticleField: React.FC<GurukulParticleFieldProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number | null = null
    let isMounted = true
    let isVisible = true
    let isTabActive = !document.hidden
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = container.clientWidth || 800
    let height = container.clientHeight || 600
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    let particles: Particle[] = []

    // GuruKul AI Native Palette tokens
    const COLOR_OFFWHITE = '234, 251, 255' // #EAFBFF (~70%)
    const COLOR_CYAN = '24, 203, 232'     // #18CBE8 (~18%)
    const COLOR_ICY = '133, 223, 242'     // #85DFF2 (~7%)
    const COLOR_SLATE = '87, 117, 128'    // #577580 (~5%)

    const initParticles = (w: number, h: number) => {
      width = w
      height = h

      // Visual density calibrated from CSS dimensions
      let count = 80
      if (w < 640) {
        count = Math.floor(Math.max(25, Math.min(45, (w * h) / 18000)))
      } else if (w < 1024) {
        count = Math.floor(Math.max(45, Math.min(75, (w * h) / 14000)))
      } else {
        count = Math.floor(Math.max(65, Math.min(110, (w * h) / 11000)))
      }

      particles = []
      for (let i = 0; i < count; i++) {
        // Color distribution
        const randColor = Math.random()
        let rgb = COLOR_OFFWHITE
        let hasGlow = false

        if (randColor < 0.70) {
          rgb = COLOR_OFFWHITE
          hasGlow = Math.random() < 0.05
        } else if (randColor < 0.88) {
          rgb = COLOR_CYAN
          hasGlow = Math.random() < 0.15
        } else if (randColor < 0.95) {
          rgb = COLOR_ICY
        } else {
          rgb = COLOR_SLATE
        }

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height, // Pre-distribute vertically
          vx: (Math.random() - 0.5) * 0.15,
          vy: -(0.25 + Math.random() * 0.55), // Subtle upward-moving
          w: 0.7 + Math.random() * 0.6,       // 0.7 - 1.3px
          h: 1.4 + Math.random() * 1.8,       // 1.4 - 3.2px delicate vertical streak
          baseAlpha: 0.18 + Math.random() * 0.45,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.015 + Math.random() * 0.03,
          rgb,
          hasGlow,
        })
      }
    }

    const handleResize = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = w
      height = h

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.resetTransform?.()
      ctx.scale(dpr, dpr)

      initParticles(width, height)

      if (isReducedMotion) {
        drawStaticFrame()
      }
    }

    // Set initial size
    handleResize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight)

    const drawStaticFrame = () => {
      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        ctx.fillStyle = `rgba(${p.rgb}, ${p.baseAlpha * 0.5})`
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(p.x, p.y, p.w, p.h, p.w / 2)
        } else {
          ctx.rect(p.x, p.y, p.w, p.h)
        }
        ctx.fill()
      }
    }

    const render = (time: number) => {
      if (!isMounted) return

      if (!isVisible || !isTabActive || isReducedMotion) {
        animationFrameId = null
        return
      }

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Upward motion with gentle horizontal sway
        p.y += p.vy
        p.x += Math.sin(time * 0.0012 + p.twinklePhase) * 0.12

        // Smooth vertical fade to eliminate popping at top & bottom
        let edgeAlpha = 1.0
        if (p.y > height - 90) {
          edgeAlpha = Math.max(0, (height - p.y) / 90)
        } else if (p.y < 120) {
          edgeAlpha = Math.max(0, p.y / 120)
        }

        const twinkle = 0.82 + 0.18 * Math.sin(time * p.twinkleSpeed + p.twinklePhase)
        const currentAlpha = p.baseAlpha * twinkle * edgeAlpha

        // Natural respawn at bottom
        if (p.y < -10) {
          p.y = height + Math.random() * 15
          p.x = Math.random() * width
        }

        if (p.hasGlow) {
          ctx.shadowColor = 'rgba(24, 203, 232, 0.5)'
          ctx.shadowBlur = 5
        } else {
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = `rgba(${p.rgb}, ${Math.max(0, Math.min(1, currentAlpha))})`
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(p.x, p.y, p.w, p.h, p.w / 2)
        } else {
          ctx.rect(p.x, p.y, p.w, p.h)
        }
        ctx.fill()
      }

      ctx.shadowBlur = 0

      animationFrameId = requestAnimationFrame(render)
    }

    if (!isReducedMotion) {
      animationFrameId = requestAnimationFrame(render)
    } else {
      drawStaticFrame()
    }

    // ResizeObserver watching Scene 3 container dimensions
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect
        if (w > 0 && h > 0) {
          handleResize(w, h)
        }
      }
    })
    resizeObserver.observe(container)

    // IntersectionObserver pausing RAF when Scene 3 is offscreen
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible && isTabActive && !isReducedMotion && !animationFrameId) {
          animationFrameId = requestAnimationFrame(render)
        }
      },
      { threshold: 0.05 }
    )
    intersectionObserver.observe(container)

    // Document visibility change listener
    const handleVisibilityChange = () => {
      isTabActive = !document.hidden
      if (isVisible && isTabActive && !isReducedMotion && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* ============================================================ */}
      {/* 1. ATMOSPHERIC SPOTLIGHT BEAMS (Fanning subtle depth from top)*/}
      {/* ============================================================ */}
      <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[130vw] max-w-[1500px] h-[95vh] pointer-events-none opacity-[0.13] mix-blend-screen overflow-hidden">
        {/* Beam 1: Left Angled Volumetric Cone */}
        <div
          className="absolute top-0 left-1/2 w-[36vw] max-w-[460px] h-[90vh] origin-top -translate-x-[68%] gurukul-beam-left"
          style={{
            background: 'linear-gradient(145deg, rgba(24, 203, 232, 0.28) 0%, rgba(133, 223, 242, 0.10) 32%, transparent 75%)',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            filter: 'blur(26px)',
          }}
        />

        {/* Beam 2: Center Soft Ambient Shaft */}
        <div
          className="absolute top-0 left-1/2 w-[28vw] max-w-[360px] h-[95vh] origin-top -translate-x-1/2 gurukul-beam-center"
          style={{
            background: 'linear-gradient(180deg, rgba(234, 251, 255, 0.22) 0%, rgba(24, 203, 232, 0.12) 35%, transparent 80%)',
            clipPath: 'polygon(50% 0%, 6% 100%, 94% 100%)',
            filter: 'blur(24px)',
          }}
        />

        {/* Beam 3: Right Angled Volumetric Cone */}
        <div
          className="absolute top-0 left-1/2 w-[36vw] max-w-[460px] h-[90vh] origin-top -translate-x-[32%] gurukul-beam-right"
          style={{
            background: 'linear-gradient(215deg, rgba(24, 203, 232, 0.28) 0%, rgba(133, 223, 242, 0.10) 32%, transparent 75%)',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            filter: 'blur(26px)',
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* 2. MINIMAL ARCHITECTURAL ACCENT LINES (Restrained 0.05-0.08)  */}
      {/* ============================================================ */}
      {/* Horizontal Line 1: Upper horizon */}
      <div className="absolute top-[22%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/[0.07] to-transparent pointer-events-none" />

      {/* Horizontal Line 2: Lower shelf */}
      <div className="absolute top-[76%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none" />

      {/* Vertical Guide 1: Left boundary (hidden on mobile) */}
      <div className="hidden md:block absolute top-0 left-[14%] w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/[0.05] to-transparent pointer-events-none" />

      {/* Vertical Guide 2: Right boundary (hidden on mobile) */}
      <div className="hidden md:block absolute top-0 right-[14%] w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/[0.05] to-transparent pointer-events-none" />

      {/* ============================================================ */}
      {/* 3. UPWARD-MOVING LIGHT PARTICLE CANVAS                       */}
      {/* ============================================================ */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {/* Embedded scoped keyframes for spotlight gentle sway */}
      <style>{`
        @keyframes beamSwayLeft {
          0% { transform: translate(-68%, 0) rotate(-15deg) scaleX(0.96); opacity: 0.78; }
          50% { transform: translate(-68%, 0) rotate(-11deg) scaleX(1.04); opacity: 1.0; }
          100% { transform: translate(-68%, 0) rotate(-15deg) scaleX(0.96); opacity: 0.78; }
        }
        @keyframes beamSwayCenter {
          0% { transform: translate(-50%, 0) scale(0.96); opacity: 0.85; }
          50% { transform: translate(-50%, 0) scale(1.03); opacity: 1.0; }
          100% { transform: translate(-50%, 0) scale(0.96); opacity: 0.85; }
        }
        @keyframes beamSwayRight {
          0% { transform: translate(-32%, 0) rotate(15deg) scaleX(0.96); opacity: 0.78; }
          50% { transform: translate(-32%, 0) rotate(11deg) scaleX(1.04); opacity: 1.0; }
          100% { transform: translate(-32%, 0) rotate(15deg) scaleX(0.96); opacity: 0.78; }
        }
        .gurukul-beam-left {
          animation: beamSwayLeft 18s ease-in-out infinite alternate;
        }
        .gurukul-beam-center {
          animation: beamSwayCenter 14s ease-in-out infinite alternate;
        }
        .gurukul-beam-right {
          animation: beamSwayRight 20s ease-in-out infinite alternate;
        }
        @media (max-width: 640px) {
          .gurukul-beam-left, .gurukul-beam-right {
            display: none !important;
          }
          .gurukul-beam-center {
            opacity: 0.08 !important;
            width: 70vw !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .gurukul-beam-left, .gurukul-beam-center, .gurukul-beam-right {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default GurukulParticleField
