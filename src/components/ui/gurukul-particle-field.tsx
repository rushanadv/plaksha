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
    let isTabActive = !document.hidden
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = container.clientWidth || window.innerWidth || 800
    let height = container.clientHeight || window.innerHeight || 600
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    let particles: Particle[] = []

    // Native GuruKul AI Palette: Crisp Icy White & Signature Cyan
    const COLOR_WHITE = '245, 252, 255'   // Crisp Icy White (~68%)
    const COLOR_CYAN = '24, 203, 232'     // GuruKul Cyan (~22%)
    const COLOR_LIGHT_CYAN = '105, 221, 245' // Secondary Cyan (~6%)
    const COLOR_SLATE = '130, 165, 185'   // Cool Slate (~4%)

    const initParticles = (w: number, h: number) => {
      width = Math.max(w, 300)
      height = Math.max(h, 300)

      // Calibrated density based on CSS dimensions
      let count = 80
      if (width < 640) {
        count = Math.floor(Math.max(30, Math.min(50, (width * height) / 16000)))
      } else if (width < 1024) {
        count = Math.floor(Math.max(50, Math.min(85, (width * height) / 13000)))
      } else {
        count = Math.floor(Math.max(75, Math.min(125, (width * height) / 10000)))
      }

      particles = []
      for (let i = 0; i < count; i++) {
        const randColor = Math.random()
        let rgb = COLOR_WHITE
        let hasGlow = false

        if (randColor < 0.68) {
          rgb = COLOR_WHITE
          hasGlow = Math.random() < 0.08
        } else if (randColor < 0.90) {
          rgb = COLOR_CYAN
          hasGlow = Math.random() < 0.20
        } else if (randColor < 0.96) {
          rgb = COLOR_LIGHT_CYAN
          hasGlow = true
        } else {
          rgb = COLOR_SLATE
        }

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: -(0.30 + Math.random() * 0.65), // Steady upward drift
          w: 0.8 + Math.random() * 0.8,       // 0.8 - 1.6px
          h: 1.6 + Math.random() * 2.4,       // 1.6 - 4.0px elegant vertical streak
          baseAlpha: 0.35 + Math.random() * 0.50, // Visibly crisp (0.35 - 0.85)
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.012 + Math.random() * 0.025,
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

    // Initialize with container or viewport dimensions
    const initialW = container.clientWidth || window.innerWidth
    const initialH = container.clientHeight || window.innerHeight
    handleResize(initialW, initialH)

    const drawStaticFrame = () => {
      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        ctx.fillStyle = `rgba(${p.rgb}, ${p.baseAlpha * 0.6})`
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

      if (!isTabActive || isReducedMotion) {
        animationFrameId = null
        return
      }

      // Check for zero-dimension recovery
      const currentW = container.clientWidth
      const currentH = container.clientHeight
      if (currentW > 0 && currentH > 0 && (Math.abs(currentW - width) > 4 || Math.abs(currentH - height) > 4)) {
        handleResize(currentW, currentH)
      }

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Upward motion with gentle horizontal organic sway
        p.y += p.vy
        p.x += Math.sin(time * 0.0012 + p.twinklePhase) * 0.14

        // Smooth vertical fade to eliminate popping at top & bottom
        let edgeAlpha = 1.0
        if (p.y > height - 80) {
          edgeAlpha = Math.max(0, (height - p.y) / 80)
        } else if (p.y < 100) {
          edgeAlpha = Math.max(0, p.y / 100)
        }

        const twinkle = 0.82 + 0.18 * Math.sin(time * p.twinkleSpeed + p.twinklePhase)
        const currentAlpha = p.baseAlpha * twinkle * edgeAlpha

        // Natural respawn at bottom
        if (p.y < -10) {
          p.y = height + Math.random() * 15
          p.x = Math.random() * width
        }

        if (p.hasGlow) {
          ctx.shadowColor = 'rgba(24, 203, 232, 0.65)'
          ctx.shadowBlur = 6
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

    // ResizeObserver watching Scene 3 container
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect
        if (w > 0 && h > 0) {
          handleResize(w, h)
        }
      }
    })
    resizeObserver.observe(container)

    // Document visibility listener (pause when tab hidden, resume when tab active)
    const handleVisibilityChange = () => {
      isTabActive = !document.hidden
      if (isTabActive && !isReducedMotion && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* ============================================================ */}
      {/* 1. ATMOSPHERIC SPOTLIGHT BEAMS (Clearly visible depth)       */}
      {/* ============================================================ */}
      <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[140vw] max-w-[1600px] h-[98vh] pointer-events-none opacity-[0.22] mix-blend-screen overflow-hidden">
        {/* Beam 1: Left Angled Volumetric Cone */}
        <div
          className="absolute top-0 left-1/2 w-[38vw] max-w-[500px] h-[92vh] origin-top -translate-x-[68%] gurukul-beam-left"
          style={{
            background: 'linear-gradient(145deg, rgba(24, 203, 232, 0.40) 0%, rgba(133, 223, 242, 0.18) 32%, transparent 75%)',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            filter: 'blur(28px)',
          }}
        />

        {/* Beam 2: Center Soft Ambient Shaft */}
        <div
          className="absolute top-0 left-1/2 w-[30vw] max-w-[400px] h-[96vh] origin-top -translate-x-1/2 gurukul-beam-center"
          style={{
            background: 'linear-gradient(180deg, rgba(245, 252, 255, 0.32) 0%, rgba(24, 203, 232, 0.20) 35%, transparent 80%)',
            clipPath: 'polygon(50% 0%, 6% 100%, 94% 100%)',
            filter: 'blur(26px)',
          }}
        />

        {/* Beam 3: Right Angled Volumetric Cone */}
        <div
          className="absolute top-0 left-1/2 w-[38vw] max-w-[500px] h-[92vh] origin-top -translate-x-[32%] gurukul-beam-right"
          style={{
            background: 'linear-gradient(215deg, rgba(24, 203, 232, 0.40) 0%, rgba(133, 223, 242, 0.18) 32%, transparent 75%)',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            filter: 'blur(28px)',
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* 2. MINIMAL ARCHITECTURAL ACCENT LINES                        */}
      {/* ============================================================ */}
      {/* Horizontal Line 1: Upper horizon */}
      <div className="absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/[0.12] to-transparent pointer-events-none" />

      {/* Horizontal Line 2: Lower shelf */}
      <div className="absolute top-[78%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.09] to-transparent pointer-events-none" />

      {/* Vertical Guide 1: Left boundary (hidden on mobile) */}
      <div className="hidden md:block absolute top-0 left-[12%] w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/[0.08] to-transparent pointer-events-none" />

      {/* Vertical Guide 2: Right boundary (hidden on mobile) */}
      <div className="hidden md:block absolute top-0 right-[12%] w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/[0.08] to-transparent pointer-events-none" />

      {/* ============================================================ */}
      {/* 3. UPWARD-MOVING LIGHT PARTICLE CANVAS                       */}
      {/* ============================================================ */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {/* Scoped Keyframes for Ambient Spotlight Sway */}
      <style>{`
        @keyframes beamSwayLeft {
          0% { transform: translate(-68%, 0) rotate(-15deg) scaleX(0.96); opacity: 0.82; }
          50% { transform: translate(-68%, 0) rotate(-11deg) scaleX(1.04); opacity: 1.0; }
          100% { transform: translate(-68%, 0) rotate(-15deg) scaleX(0.96); opacity: 0.82; }
        }
        @keyframes beamSwayCenter {
          0% { transform: translate(-50%, 0) scale(0.96); opacity: 0.88; }
          50% { transform: translate(-50%, 0) scale(1.03); opacity: 1.0; }
          100% { transform: translate(-50%, 0) scale(0.96); opacity: 0.88; }
        }
        @keyframes beamSwayRight {
          0% { transform: translate(-32%, 0) rotate(15deg) scaleX(0.96); opacity: 0.82; }
          50% { transform: translate(-32%, 0) rotate(11deg) scaleX(1.04); opacity: 1.0; }
          100% { transform: translate(-32%, 0) rotate(15deg) scaleX(0.96); opacity: 0.82; }
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
            opacity: 0.12 !important;
            width: 75vw !important;
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
