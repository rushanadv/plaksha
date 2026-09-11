import React, { useEffect, useRef } from 'react'

export interface ParticleBackgroundProps {
  /** Optional container class */
  className?: string
  /** Normalized black hole focal point [xRatio, yRatio], e.g. [0.70, 0.48] on desktop */
  blackHoleCenter?: [number, number]
  /** Density scale: 'sparse' (default ~64 foreground particles) | 'ultra-sparse' (~36 particles) */
  density?: 'sparse' | 'ultra-sparse'
  /** Opacity multiplier (e.g. 0.8) */
  opacity?: number
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

// Calibrated physics constants for subtle field disturbance
const MOUSE_RADIUS = 135
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS
const REPULSION_STRENGTH = 0.42
const RETURN_SPEED = 0.046
const DAMPING = 0.92

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  className = '',
  blackHoleCenter = [0.70, 0.48],
  density = 'sparse',
  opacity = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

    // Mouse tracking state (zero React state updates)
    let mouseX = -9999
    let mouseY = -9999
    let mouseActive = false

    // Particle storage
    let fgParticles: ForegroundParticle[] = []
    let bgDust: DustParticle[] = []

    const initParticles = (w: number, h: number) => {
      width = w
      height = h
      const isMobile = w < 768

      // Densities tuned for calm negative space (desktop ~60 fg + ~35 bg; mobile ~28 fg + ~16 bg)
      const baseFgCount = density === 'ultra-sparse' ? 36 : 64
      const fgCount = isMobile ? Math.round(baseFgCount * 0.45) : baseFgCount
      const bgCount = isMobile ? 16 : 34

      fgParticles = []
      bgDust = []

      // 1. Initialize Foreground Atmospheric Particles
      for (let i = 0; i < fgCount; i++) {
        const x = Math.random() * w
        const y = Math.random() * h

        // 88% off-white, 12% subtle cyan
        const isCyan = Math.random() < 0.12
        const color = isCyan ? COLOR_CYAN : COLOR_WHITE

        // Sizes: mostly 0.6 - 1.2px, occasional 1.5px
        const sizeRand = Math.random()
        const size = sizeRand > 0.88 ? 1.45 : 0.65 + sizeRand * 0.55

        // Base opacity: 0.16 - 0.36
        const baseOpacity = 0.16 + Math.random() * 0.20

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
          driftSpeedX: 0.006 + Math.random() * 0.012,
          driftSpeedY: 0.005 + Math.random() * 0.011,
          driftRadius: 8 + Math.random() * 16,
          twinkleSpeed: 0.01 + Math.random() * 0.02,
          twinklePhase: Math.random() * Math.PI * 2,
        })
      }

      // 2. Initialize Background Cosmic Dust (distant, unaffected by cursor)
      for (let i = 0; i < bgCount; i++) {
        bgDust.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          size: 0.45 + Math.random() * 0.35,
          opacity: 0.06 + Math.random() * 0.10,
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

    // Single static render for prefers-reduced-motion
    const drawStatic = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const bhX = blackHoleCenter[0] * width
      const bhY = blackHoleCenter[1] * height

      // Draw subtle ambient glow
      drawAmbientGlow(bhX, bhY)

      // Draw dust
      for (let i = 0; i < bgDust.length; i++) {
        const p = bgDust[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${COLOR_WHITE}, ${p.opacity * opacity})`
        ctx.fill()
      }

      // Draw fg particles
      for (let i = 0; i < fgParticles.length; i++) {
        const p = fgParticles[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${p.baseOpacity * opacity})`
        ctx.fill()
      }
    }

    // Subtle ambient radial glow supporting black hole position (OPTION B, opacity ~0.024)
    const drawAmbientGlow = (bhX: number, bhY: number) => {
      const maxDim = Math.max(width, height)
      const glowRadius = Math.min(maxDim * 0.45, 480)
      const grad = ctx.createRadialGradient(bhX, bhY, 20, bhX, bhY, glowRadius)
      grad.addColorStop(0, 'rgba(98, 216, 245, 0.024)')
      grad.addColorStop(0.5, 'rgba(54, 183, 223, 0.010)')
      grad.addColorStop(1, 'rgba(2, 3, 4, 0)')

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(bhX, bhY, glowRadius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Render loop running via requestAnimationFrame
    const animate = () => {
      if (!isVisible || !isTabActive) {
        animationFrameId = null
        return
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const bhX = blackHoleCenter[0] * width
      const bhY = blackHoleCenter[1] * height

      // 1. Draw subtle ambient particle glow centered at black hole
      drawAmbientGlow(bhX, bhY)

      // 2. Update & Draw Background Cosmic Dust (Layer A)
      for (let i = 0; i < bgDust.length; i++) {
        const p = bgDust[i]
        p.x += p.vx
        p.y += p.vy

        // Wrap around viewport edges
        if (p.x < 0) p.x = width
        else if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        else if (p.y > height) p.y = 0

        // Attenuate if near singularity core
        const distBh = Math.hypot(p.x - bhX, p.y - bhY)
        let bhFade = 1.0
        if (distBh < 110) {
          bhFade = Math.max(0.05, distBh / 110)
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${COLOR_WHITE}, ${p.opacity * bhFade * opacity})`
        ctx.fill()
      }

      // 3. Update & Draw Foreground Particles with Gentle Physics (Layer B)
      for (let i = 0; i < fgParticles.length; i++) {
        const p = fgParticles[i]

        // Smooth lissajous base drift
        p.driftPhaseX += p.driftSpeedX
        p.driftPhaseY += p.driftSpeedY
        const targetX = p.baseX + Math.sin(p.driftPhaseX) * p.driftRadius
        const targetY = p.baseY + Math.cos(p.driftPhaseY) * p.driftRadius

        // Gentle cursor repulsion
        if (mouseActive) {
          const dx = p.x - mouseX
          const dy = p.y - mouseY
          const distSq = dx * dx + dy * dy

          if (distSq < MOUSE_RADIUS_SQ && distSq > 0.001) {
            const dist = Math.sqrt(distSq)
            const force = Math.pow(1 - dist / MOUSE_RADIUS, 2) * REPULSION_STRENGTH
            const nx = dx / dist
            const ny = dy / dist
            p.vx += nx * force * 2.8
            p.vy += ny * force * 2.8
          }
        }

        // Spring return towards organic target
        const springDx = targetX - p.x
        const springDy = targetY - p.y
        p.vx += springDx * RETURN_SPEED
        p.vy += springDy * RETURN_SPEED

        // Damping (smooth deceleration)
        p.vx *= DAMPING
        p.vy *= DAMPING

        // Update coordinates
        p.x += p.vx
        p.y += p.vy

        // Calculate Black Hole Exclusion Zone (event horizon shadow must stay clean)
        const distBh = Math.hypot(p.x - bhX, p.y - bhY)
        let bhFade = 1.0
        if (distBh < 135) {
          // Smoothstep between 35px and 135px
          const t = Math.max(0, Math.min(1, (distBh - 35) / 100))
          bhFade = 0.04 + 0.96 * (t * t * (3 - 2 * t))
        }

        // Calculate Text Readability Zone (left quadrant calmer)
        let textFade = 1.0
        if (p.x < width * 0.46 && p.y > height * 0.20 && p.y < height * 0.78) {
          textFade = 0.55
        }

        // Micro-twinkle
        p.twinklePhase += p.twinkleSpeed
        const twinkle = 0.85 + Math.sin(p.twinklePhase) * 0.15

        const finalAlpha = p.baseOpacity * bhFade * textFade * twinkle * opacity

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${finalAlpha})`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    // Pointer Tracking: Listen at window level with bounding rect check so pointer-events-none canvas never misses tracking
    const handlePointerMove = (pe: PointerEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (
        pe.clientX >= rect.left &&
        pe.clientX <= rect.right &&
        pe.clientY >= rect.top &&
        pe.clientY <= rect.bottom
      ) {
        mouseX = pe.clientX - rect.left
        mouseY = pe.clientY - rect.top
        mouseActive = true
      } else {
        mouseActive = false
        mouseX = -9999
        mouseY = -9999
      }
    }

    const handlePointerLeave = () => {
      mouseActive = false
      mouseX = -9999
      mouseY = -9999
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true })

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

    // IntersectionObserver to pause when hero is offscreen
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
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionQuery.removeEventListener('change', handleMotionChange)
      observer.disconnect()
      resizeObserver.disconnect()
    }
  }, [blackHoleCenter, density, opacity])

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
