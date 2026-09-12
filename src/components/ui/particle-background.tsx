import React, { useEffect, useRef } from 'react'

export interface ParticleBackgroundProps {
  /** Optional container class */
  className?: string
  /** Normalized black hole focal point [xRatio, yRatio], e.g. [0.70, 0.48] on desktop */
  blackHoleCenter?: [number, number]
  /** Density scale: 'sparse' (default ~75 foreground particles) | 'ultra-sparse' (~40 particles) */
  density?: 'sparse' | 'ultra-sparse'
  /** Opacity multiplier (e.g. 1.0) */
  opacity?: number
  /** Optional external mouse ref passed from the hero wrapper to avoid React state in animation loop */
  mouseRef?: React.MutableRefObject<{ x: number; y: number; active: boolean }>
}

interface ForegroundParticle {
  x: number
  y: number
  baseX: number
  baseY: number
  vx: number
  vy: number
  size: number
  baseOpacity: number
  color: string
  driftPhaseX: number
  driftPhaseY: number
  driftSpeedX: number
  driftSpeedY: number
  driftRadius: number
  twinkleSpeed: number
  twinklePhase: number
  hasGlow: boolean
}

interface DustParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

// Color palette strictly matched to GuruKul AI black-hole cyan & off-white
const COLOR_WHITE = '245, 245, 242'
const COLOR_CYAN = '98, 216, 245' // #62D8F5

// Calibrated physics constants matching exact user specification
const MOUSE_RADIUS = 130
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS
const REPULSION_STRENGTH = 0.45
const RETURN_SPEED = 0.05
const DAMPING = 0.92

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  className = '',
  blackHoleCenter = [0.70, 0.48],
  density = 'sparse',
  opacity = 1.0,
  mouseRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const bhX = blackHoleCenter[0]
  const bhY = blackHoleCenter[1]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number | null = null
    let isVisible = true
    let isTabActive = !document.hidden
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    // Fallback internal mouse tracking if no external mouseRef provided
    let internalMouseX = -9999
    let internalMouseY = -9999
    let internalMouseActive = false

    // Particle storage
    let fgParticles: ForegroundParticle[] = []
    let bgDust: DustParticle[] = []

    const initParticles = (w: number, h: number) => {
      width = w
      height = h
      const isMobile = w < 768

      // Densities tuned for calm negative space (desktop: ~75 fg + ~40 bg; mobile: ~36 fg + ~18 bg)
      const baseFgCount = density === 'ultra-sparse' ? 40 : 75
      const fgCount = isMobile ? Math.round(baseFgCount * 0.5) : baseFgCount
      const bgCount = isMobile ? 18 : 40

      fgParticles = []
      bgDust = []

      // 1. Initialize Foreground Atmospheric Particles (0.6px - 1.3px, occasional 1.5px - 1.8px)
      for (let i = 0; i < fgCount; i++) {
        const x = Math.random() * w
        const y = Math.random() * h

        // 92% off-white, 8% cyan
        const isCyan = Math.random() < 0.08
        const color = isCyan ? COLOR_CYAN : COLOR_WHITE

        // Sizing: 85% in [0.7, 1.3px], 15% occasional in [1.5, 1.8px]
        const isOccasional = Math.random() < 0.15
        const size = isOccasional
          ? 1.5 + Math.random() * 0.3
          : 0.65 + Math.random() * 0.60

        // Opacity: standard [0.18, 0.42], occasional brighter [0.42, 0.55]
        const baseOpacity = isOccasional
          ? 0.42 + Math.random() * 0.13
          : 0.18 + Math.random() * 0.24

        fgParticles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          size,
          baseOpacity,
          color,
          driftPhaseX: Math.random() * Math.PI * 2,
          driftPhaseY: Math.random() * Math.PI * 2,
          driftSpeedX: 0.005 + Math.random() * 0.010,
          driftSpeedY: 0.004 + Math.random() * 0.009,
          driftRadius: 6 + Math.random() * 14,
          twinkleSpeed: 0.012 + Math.random() * 0.022,
          twinklePhase: Math.random() * Math.PI * 2,
          hasGlow: isOccasional,
        })
      }

      // 2. Initialize Background Cosmic Dust (0.45px - 0.75px, opacity 0.08 - 0.20, distant)
      for (let i = 0; i < bgCount; i++) {
        bgDust.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.07,
          vy: (Math.random() - 0.5) * 0.07,
          size: 0.45 + Math.random() * 0.30,
          opacity: 0.08 + Math.random() * 0.12,
        })
      }
    }

    const resize = () => {
      const parent = canvas.parentElement || canvas
      const rect = parent.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      initParticles(rect.width, rect.height)

      if (isReducedMotion) {
        drawStatic()
      }
    }

    // Subtle ambient radial glow supporting black hole position (opacity ~0.025)
    const drawAmbientGlow = (bhX: number, bhY: number) => {
      const maxDim = Math.max(width, height)
      const glowRadius = Math.min(maxDim * 0.45, 480)
      const grad = ctx.createRadialGradient(bhX, bhY, 20, bhX, bhY, glowRadius)
      grad.addColorStop(0, 'rgba(98, 216, 245, 0.025)')
      grad.addColorStop(0.5, 'rgba(54, 183, 223, 0.010)')
      grad.addColorStop(1, 'rgba(2, 3, 4, 0)')

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(bhX, bhY, glowRadius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Single static render for prefers-reduced-motion
    const drawStatic = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const bhX = blackHoleCenter[0] * width
      const bhY = blackHoleCenter[1] * height

      drawAmbientGlow(bhX, bhY)

      // Draw dust
      for (let i = 0; i < bgDust.length; i++) {
        const p = bgDust[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${COLOR_WHITE}, ${p.opacity * opacity})`
        ctx.fill()
      }

      // Draw foreground particles
      for (let i = 0; i < fgParticles.length; i++) {
        const p = fgParticles[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${p.baseOpacity * opacity})`
        ctx.fill()
      }
    }

    // Render loop running purely on refs & 2D canvas context (no React state updates)
    const animate = () => {
      if (!isVisible || !isTabActive) {
        animationFrameId = null
        return
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const bhX = blackHoleCenter[0] * width
      const bhY = blackHoleCenter[1] * height

      // Read current mouse coordinates from external ref if provided, otherwise internal
      const mx = mouseRef ? mouseRef.current.x : internalMouseX
      const my = mouseRef ? mouseRef.current.y : internalMouseY
      const isMouseActive = mouseRef ? mouseRef.current.active : internalMouseActive

      // 1. Draw subtle ambient particle glow centered at black hole
      drawAmbientGlow(bhX, bhY)

      // 2. Update & Draw Background Cosmic Dust (Layer A - slow drift, unaffected by mouse)
      for (let i = 0; i < bgDust.length; i++) {
        const p = bgDust[i]
        p.x += p.vx
        p.y += p.vy

        // Wrap around viewport edges
        if (p.x < 0) p.x = width
        else if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        else if (p.y > height) p.y = 0

        // Subtle attenuation near singularity core
        const distBh = Math.hypot(p.x - bhX, p.y - bhY)
        let bhFade = 1.0
        if (distBh < 120) {
          bhFade = 0.35 + 0.65 * (distBh / 120)
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${COLOR_WHITE}, ${p.opacity * bhFade * opacity})`
        ctx.fill()
      }

      // 3. Update & Draw Foreground Atmospheric Particles (Layer B - gentle mouse repulsion)
      for (let i = 0; i < fgParticles.length; i++) {
        const p = fgParticles[i]

        // Smooth lissajous wandering
        p.driftPhaseX += p.driftSpeedX
        p.driftPhaseY += p.driftSpeedY
        const targetX = p.baseX + Math.sin(p.driftPhaseX) * p.driftRadius
        const targetY = p.baseY + Math.cos(p.driftPhaseY) * p.driftRadius

        // Gentle cursor repulsion
        if (isMouseActive) {
          const dx = p.x - mx
          const dy = p.y - my
          const distSq = dx * dx + dy * dy

          if (distSq < MOUSE_RADIUS_SQ && distSq > 0.001) {
            const dist = Math.sqrt(distSq)
            const force = Math.pow(1 - dist / MOUSE_RADIUS, 2) * REPULSION_STRENGTH
            const nx = dx / dist
            const ny = dy / dist
            p.vx += nx * force * 2.6
            p.vy += ny * force * 2.6
          }
        }

        // Spring return towards organic equilibrium target
        const springDx = targetX - p.x
        const springDy = targetY - p.y
        p.vx += springDx * RETURN_SPEED
        p.vy += springDy * RETURN_SPEED

        // Damping (smooth deceleration)
        p.vx *= DAMPING
        p.vy *= DAMPING

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Black Hole Exclusion Zone (calm area around singularity without hard cut-out)
        const distBh = Math.hypot(p.x - bhX, p.y - bhY)
        let bhFade = 1.0
        if (distBh < 130) {
          bhFade = 0.35 + 0.65 * Math.min(1.0, distBh / 130)
        }

        // Text Readability Zone (left quadrant softer)
        let textFade = 1.0
        if (p.x < width * 0.48 && p.y > height * 0.15 && p.y < height * 0.80) {
          textFade = 0.65
        }

        // Delicate twinkle
        p.twinklePhase += p.twinkleSpeed
        const twinkle = 0.85 + Math.sin(p.twinklePhase) * 0.15

        const finalAlpha = p.baseOpacity * bhFade * textFade * twinkle * opacity

        // Optional subtle halo for occasional larger stars
        if (p.hasGlow && finalAlpha > 0.15) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${p.color}, ${finalAlpha * 0.20})`
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${finalAlpha})`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    // Window pointer listener fallback if no external mouseRef provided
    let cleanupPointer: (() => void) | null = null
    if (!mouseRef) {
      const handlePointerMove = (pe: PointerEvent | MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        if (
          pe.clientX >= rect.left &&
          pe.clientX <= rect.right &&
          pe.clientY >= rect.top &&
          pe.clientY <= rect.bottom
        ) {
          internalMouseX = pe.clientX - rect.left
          internalMouseY = pe.clientY - rect.top
          internalMouseActive = true
        } else {
          internalMouseActive = false
          internalMouseX = -9999
          internalMouseY = -9999
        }
      }

      const handlePointerLeave = () => {
        internalMouseActive = false
        internalMouseX = -9999
        internalMouseY = -9999
      }

      window.addEventListener('pointermove', handlePointerMove, { passive: true })
      window.addEventListener('pointerleave', handlePointerLeave, { passive: true })

      cleanupPointer = () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerleave', handlePointerLeave)
      }
    }

    // Tab visibility handling (pause RAF in background tab)
    const handleVisibilityChange = () => {
      isTabActive = !document.hidden
      if (isTabActive && isVisible && !isReducedMotion && !animationFrameId) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Reduced motion listener
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches
      if (isReducedMotion) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
        drawStatic()
      } else if (isVisible && isTabActive && !animationFrameId) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }
    motionQuery.addEventListener('change', handleMotionChange)

    // IntersectionObserver to pause when hero is completely offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible && isTabActive && !isReducedMotion && !animationFrameId) {
          animationFrameId = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.05 }
    )
    observer.observe(canvas)

    // ResizeObserver for exact bounds
    const resizeObserver = new ResizeObserver(() => {
      resize()
    })
    resizeObserver.observe(canvas.parentElement || canvas)

    // Initial setup
    resize()
    if (!isReducedMotion) {
      animationFrameId = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (cleanupPointer) cleanupPointer()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionQuery.removeEventListener('change', handleMotionChange)
      observer.disconnect()
      resizeObserver.disconnect()
    }
  }, [bhX, bhY, density, opacity, mouseRef])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none select-none ${className}`}
      style={{
        display: 'block',
        touchAction: 'none',
      }}
    />
  )
}

// Named alias for backward compatibility with AntiGravityCanvas naming
export const AntiGravityCanvas = ParticleBackground
export default ParticleBackground
