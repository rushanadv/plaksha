import React, { useEffect, useRef } from 'react'
import type { MotionValue } from 'framer-motion'

export interface SceneTransitionBridgeProps {
  /**
   * Normalized transition progress (0.0 to 1.0)
   * 0.00 -> 0.15: Scene 2 resting frame
   * 0.15 -> 0.32: Scene 2 prepares (UI dims, constellation focuses)
   * 0.32 -> 0.48: Constellation contracts toward central node
   * 0.48 -> 0.62: Light trace transformation & camera dive through node
   * 0.62 -> 0.74: The transition void (3-8 thin cyan data streaks)
   * 0.70 -> 0.84: Trails reorganize toward Scene 3 headline & product dock
   * 0.76 -> 0.94: Scene 3 revealed
   * 0.94 -> 1.00: Scene 3 settles
   */
  progress: MotionValue<number> | number
  className?: string
}

interface DataStreak {
  baseX: number
  baseY: number
  length: number
  speed: number
  angle: number
  opacity: number
  width: number
}

export const SceneTransitionBridge: React.FC<SceneTransitionBridgeProps> = ({
  progress,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const getInitialProgress = () => {
    if (typeof progress === 'number') return progress
    if (progress && typeof progress.get === 'function') return progress.get()
    return 0
  }

  const progressRef = useRef<number>(getInitialProgress())

  useEffect(() => {
    if (typeof progress === 'number') {
      progressRef.current = progress
      return
    }
    if (progress && typeof progress.on === 'function') {
      const unsubscribe = progress.on('change', (latest: number) => {
        progressRef.current = latest
      })
      return () => unsubscribe()
    }
  }, [progress])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number | null = null
    let isMounted = true
    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Pre-generated persistent streaks for the transition void and reorganization
    const streaks: DataStreak[] = [
      { baseX: 0.25, baseY: 0.38, length: 180, speed: 1.2, angle: 0.02, opacity: 0.75, width: 1.2 }, // Headline alignment
      { baseX: 0.38, baseY: 0.39, length: 220, speed: 1.4, angle: -0.01, opacity: 0.85, width: 1.4 }, // Headline alignment
      { baseX: 0.50, baseY: 0.42, length: 140, speed: 1.1, angle: 0.04, opacity: 0.65, width: 1.0 },
      { baseX: 0.32, baseY: 0.62, length: 160, speed: 1.3, angle: 0.12, opacity: 0.70, width: 1.1 }, // Dock alignment
      { baseX: 0.52, baseY: 0.65, length: 190, speed: 1.5, angle: -0.08, opacity: 0.80, width: 1.3 }, // Dock alignment
      { baseX: 0.20, baseY: 0.52, length: 120, speed: 0.9, angle: 0.05, opacity: 0.50, width: 0.9 },
      { baseX: 0.68, baseY: 0.56, length: 150, speed: 1.2, angle: -0.06, opacity: 0.60, width: 1.0 },
    ]

    const handleResize = () => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.scale(dpr, dpr)
    }

    handleResize()
    window.addEventListener('resize', handleResize, { passive: true })

    const render = () => {
      if (!isMounted) return
      const t = progressRef.current

      // If outside the active transition window (0.32 to 0.92), clear and sleep
      if (t < 0.30 || t > 0.94 || width <= 0 || height <= 0) {
        ctx.clearRect(0, 0, width, height)
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      const cx = width * 0.50
      const cy = height * 0.49

      // =====================================================================
      // 1. PHASE 4B: CAMERA DIVE THROUGH CENTRAL NODE (0.48 -> 0.66)
      // Radiant perspective light streaks & soft central aura
      // =====================================================================
      if (t >= 0.46 && t <= 0.68) {
        const diveU = (t - 0.46) / (0.68 - 0.46)
        const diveAlpha = Math.sin(diveU * Math.PI)

        // A. Soft expanding halo around central source node (never a full white flash)
        const auraR = 16 + diveU * 180
        const auraAlpha = diveAlpha * 0.32
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, auraR)
        auraGrad.addColorStop(0, `rgba(234, 251, 255, ${auraAlpha * 0.7})`)
        auraGrad.addColorStop(0.35, `rgba(105, 221, 245, ${auraAlpha * 0.4})`)
        auraGrad.addColorStop(1, 'transparent')

        ctx.fillStyle = auraGrad
        ctx.beginPath()
        ctx.arc(cx, cy, auraR, 0, Math.PI * 2)
        ctx.fill()

        // B. Perspective light streaks streaming past the viewer
        const streakAngles = [
          0, Math.PI * 0.22, Math.PI * 0.48, Math.PI * 0.74,
          Math.PI, Math.PI * 1.26, Math.PI * 1.52, Math.PI * 1.76,
          Math.PI * 0.12, Math.PI * 0.62, Math.PI * 1.12, Math.PI * 1.62
        ]

        for (let i = 0; i < streakAngles.length; i++) {
          const angle = streakAngles[i]
          const rStart = 15 + Math.pow(diveU, 1.8) * Math.max(width, height) * 0.55
          const len = 40 + diveU * 160
          const rEnd = rStart + len

          const cosA = Math.cos(angle)
          const sinA = Math.sin(angle)

          const x1 = cx + cosA * rStart
          const y1 = cy + sinA * rStart
          const x2 = cx + cosA * rEnd
          const y2 = cy + sinA * rEnd

          const grad = ctx.createLinearGradient(x1, y1, x2, y2)
          grad.addColorStop(0, 'rgba(105, 221, 245, 0)')
          grad.addColorStop(0.4, `rgba(105, 221, 245, ${diveAlpha * 0.65})`)
          grad.addColorStop(1, `rgba(255, 255, 255, ${diveAlpha * 0.85})`)

          ctx.strokeStyle = grad
          ctx.lineWidth = 1.0 + diveU * 1.2
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      }

      // =====================================================================
      // 2. PHASE 5: THE TRANSITION VOID (0.62 -> 0.76)
      // Sparse, elegant data streaks gliding through the deep dark void
      // =====================================================================
      if (t >= 0.60 && t <= 0.76) {
        const voidV = (t - 0.60) / (0.76 - 0.60)
        const voidAlpha = Math.sin(voidV * Math.PI)

        for (let i = 0; i < streaks.length; i++) {
          const s = streaks[i]
          const travel = (voidV * s.speed * 280) % (width * 0.7)
          const sx1 = s.baseX * width + travel - s.length
          const sy1 = s.baseY * height + travel * s.angle
          const sx2 = sx1 + s.length
          const sy2 = sy1 + s.length * s.angle

          const grad = ctx.createLinearGradient(sx1, sy1, sx2, sy2)
          grad.addColorStop(0, 'transparent')
          grad.addColorStop(0.6, `rgba(105, 221, 245, ${s.opacity * voidAlpha * 0.4})`)
          grad.addColorStop(1, `rgba(234, 251, 255, ${s.opacity * voidAlpha * 0.75})`)

          ctx.strokeStyle = grad
          ctx.lineWidth = s.width
          ctx.beginPath()
          ctx.moveTo(sx1, sy1)
          ctx.lineTo(sx2, sy2)
          ctx.stroke()
        }
      }

      // =====================================================================
      // 3. PHASE 6: TRAILS REORGANIZE TOWARD SCENE 3 COMPOSITION (0.70 -> 0.88)
      // Guiding streaks aligning to Scene 3's headline and product UI
      // =====================================================================
      if (t >= 0.70 && t <= 0.88) {
        const reorgW = (t - 0.70) / (0.88 - 0.70)
        const reorgAlpha = Math.sin(reorgW * Math.PI)

        // Guide Trail A: Sweeps across the Scene 3 headline area (Y ~ 36-40vh)
        const hlY = height * 0.38
        const hlX1 = width * 0.22 + reorgW * (width * 0.45)
        const hlX2 = hlX1 + 160

        const hlGrad = ctx.createLinearGradient(hlX1, hlY, hlX2, hlY)
        hlGrad.addColorStop(0, 'transparent')
        hlGrad.addColorStop(0.5, `rgba(105, 221, 245, ${reorgAlpha * 0.6})`)
        hlGrad.addColorStop(1, `rgba(255, 255, 255, ${reorgAlpha * 0.8})`)

        ctx.strokeStyle = hlGrad
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(hlX1, hlY)
        ctx.lineTo(hlX2, hlY)
        ctx.stroke()

        // Guide Trail B: Diagonals guiding toward Scene 3 product panel / dock (Y ~ 62-66vh)
        const dockY = height * 0.63
        const dockX1 = cx - 180 + reorgW * 140
        const dockX2 = dockX1 + 140
        const dockY2 = dockY + 20

        const dockGrad = ctx.createLinearGradient(dockX1, dockY, dockX2, dockY2)
        dockGrad.addColorStop(0, 'transparent')
        dockGrad.addColorStop(0.6, `rgba(105, 221, 245, ${reorgAlpha * 0.5})`)
        dockGrad.addColorStop(1, `rgba(234, 251, 255, ${reorgAlpha * 0.7})`)

        ctx.strokeStyle = dockGrad
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(dockX1, dockY)
        ctx.lineTo(dockX2, dockY2)
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      isMounted = false
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      style={{ touchAction: 'none' }}
    />
  )
}

export default SceneTransitionBridge
