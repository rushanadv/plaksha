import React, { useEffect, useRef } from 'react'
import type { MotionValue } from 'framer-motion'
import { soundEngine } from '../../lib/audio-engine'

export interface KnowledgeConstellationCanvasProps {
  /** Master hero scroll progress (0.0 to 1.0), MotionValue or static number */
  progress: MotionValue<number> | number
  /** Transition progress to Scene 3 (0.0 to 1.0) */
  transitionProgress?: MotionValue<number> | number
  /** Optional container class */
  className?: string
  /** Optional callback when a node is selected */
  onNodeSelect?: (nodeId: string) => void
}

interface AcademicNode {
  id: string
  label: string
  category: string
  /** Curated normalized coordinate relative to centered bounding box [0..1] */
  nx: number
  ny: number
  size: number
  isAnchorDefault: boolean
  isCore?: boolean
  phase: 1 | 2
}

interface AmbientParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseOpacity: number
}

// 1. CURATED ACADEMIC KNOWLEDGE NODES (Centered Diamond / Hexagonal Cluster)
// Mathematically balanced center of mass: mean(nx) ≈ 0.50, mean(ny) ≈ 0.50
const ACADEMIC_NODES: AcademicNode[] = [
  // Central Major Node / Visual Anchor (Source node for camera dive)
  { id: 'calculus', label: 'CALCULUS', category: 'CORE HUB', nx: 0.50, ny: 0.49, size: 7.0, isAnchorDefault: true, isCore: true, phase: 1 },

  // Top-Left Cluster (Foundations)
  { id: 'functions', label: 'FUNCTIONS', category: 'CALCULUS', nx: 0.28, ny: 0.47, size: 5.2, isAnchorDefault: true, phase: 1 },
  { id: 'limits', label: 'LIMITS', category: 'CALCULUS', nx: 0.37, ny: 0.30, size: 5.0, isAnchorDefault: true, phase: 1 },
  { id: 'continuity', label: 'CONTINUITY', category: 'CALCULUS', nx: 0.23, ny: 0.32, size: 3.8, isAnchorDefault: false, phase: 2 },

  // Top-Right Cluster (Rates & Dynamics)
  { id: 'derivatives', label: 'DERIVATIVES', category: 'CALCULUS', nx: 0.55, ny: 0.25, size: 5.4, isAnchorDefault: true, phase: 1 },
  { id: 'chain_rule', label: 'CHAIN RULE', category: 'CALCULUS', nx: 0.70, ny: 0.35, size: 4.2, isAnchorDefault: false, phase: 2 },
  { id: 'diff_eq', label: 'DIFF EQUATIONS', category: 'CALCULUS', nx: 0.79, ny: 0.48, size: 4.2, isAnchorDefault: false, phase: 2 },

  // Bottom-Right Cluster (Systems & Machine Learning)
  { id: 'integrals', label: 'INTEGRALS', category: 'CALCULUS', nx: 0.67, ny: 0.58, size: 5.0, isAnchorDefault: true, phase: 2 },
  { id: 'vectors', label: 'VECTORS', category: 'LINEAR ALGEBRA', nx: 0.45, ny: 0.68, size: 5.0, isAnchorDefault: true, phase: 1 },
  { id: 'matrices', label: 'MATRICES', category: 'LINEAR ALGEBRA', nx: 0.59, ny: 0.77, size: 4.6, isAnchorDefault: false, phase: 2 },
  { id: 'attention', label: 'ATTENTION', category: 'MACHINE LEARNING', nx: 0.77, ny: 0.73, size: 5.0, isAnchorDefault: true, phase: 2 },

  // Bottom-Left Cluster (Uncertainty & Optimization)
  { id: 'optimization', label: 'OPTIMIZATION', category: 'MACHINE LEARNING', nx: 0.37, ny: 0.60, size: 4.4, isAnchorDefault: false, phase: 2 },
  { id: 'probability', label: 'PROBABILITY', category: 'PROBABILITY', nx: 0.27, ny: 0.73, size: 4.4, isAnchorDefault: false, phase: 2 },
  { id: 'bayes', label: "BAYES' LAW", category: 'PROBABILITY', nx: 0.17, ny: 0.67, size: 4.8, isAnchorDefault: true, phase: 2 },
]

// 2. CURATED MEANINGFUL SEMANTIC CONNECTIONS
const SEMANTIC_EDGES: [string, string][] = [
  ['calculus', 'limits'],
  ['calculus', 'functions'],
  ['calculus', 'derivatives'],
  ['calculus', 'integrals'],
  ['calculus', 'optimization'],
  ['functions', 'limits'],
  ['limits', 'continuity'],
  ['limits', 'derivatives'],
  ['derivatives', 'chain_rule'],
  ['chain_rule', 'diff_eq'],
  ['diff_eq', 'integrals'],
  ['integrals', 'vectors'],
  ['vectors', 'matrices'],
  ['matrices', 'attention'],
  ['integrals', 'attention'],
  ['optimization', 'probability'],
  ['probability', 'bayes'],
  ['bayes', 'attention'],
  ['vectors', 'optimization'],
]

export const KnowledgeConstellationCanvas: React.FC<KnowledgeConstellationCanvasProps> = ({
  progress,
  transitionProgress,
  className = '',
  onNodeSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  const getInitialProgress = (val?: MotionValue<number> | number) => {
    if (typeof val === 'number') return val
    if (val && typeof val.get === 'function') return val.get()
    return 0
  }

  const progressRef = useRef<number>(getInitialProgress(progress))
  const transitionRef = useRef<number>(getInitialProgress(transitionProgress))

  // Subscribe to master scroll progress without triggering React re-renders
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

  // Subscribe to Scene 2 -> 3 transition progress
  useEffect(() => {
    if (typeof transitionProgress === 'number') {
      transitionRef.current = transitionProgress
      return
    }
    if (transitionProgress && typeof transitionProgress.on === 'function') {
      const unsubscribe = transitionProgress.on('change', (latest: number) => {
        transitionRef.current = latest
      })
      return () => unsubscribe()
    }
  }, [transitionProgress])

  const hoveredNodeIdRef = useRef<string | null>(null)
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false })

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

    // Ambient particles array (Aether flow logic refined)
    let ambientParticles: AmbientParticle[] = []

    // Node screen positions with micro-displacement state
    const nodeStateMap = new Map<string, {
      x: number
      y: number
      targetX: number
      targetY: number
      baseX: number
      baseY: number
      size: number
      pulsePhase: number
      hoverAlpha: number
    }>()

    // Initialize ambient particles
    const initAmbientParticles = (w: number, h: number) => {
      const isMobile = w < 768
      const count = isMobile ? 18 : w < 1024 ? 28 : 46
      ambientParticles = []

      // Bounding box area for ambient particle distribution
      const boxW = isMobile ? w * 0.90 : Math.min(w * 0.78, 860)
      const boxH = isMobile ? h * 0.65 : Math.min(h * 0.66, 540)
      const minX = (w - boxW) / 2
      const minY = (h - boxH) / 2

      for (let i = 0; i < count; i++) {
        ambientParticles.push({
          x: minX + Math.random() * boxW,
          y: minY + Math.random() * boxH,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.30,
          radius: 0.8 + Math.random() * 0.7,
          baseOpacity: 0.18 + Math.random() * 0.22,
        })
      }
    }

    // Resize handler with High-DPI support
    const handleResize = () => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.scale(dpr, dpr)

      initAmbientParticles(width, height)
    }

    handleResize()
    window.addEventListener('resize', handleResize, { passive: true })

    // Mouse event handlers scoped to canvas
    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      mousePosRef.current = { x: mx, y: my, active: true }

      // Hit-test academic nodes
      let found: string | null = null
      for (const node of ACADEMIC_NODES) {
        const state = nodeStateMap.get(node.id)
        if (!state) continue
        const dx = mx - state.x
        const dy = my - state.y
        const hitRadius = Math.max(node.size * 2.2, 18)
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
          found = node.id
          break
        }
      }

      if (found !== hoveredNodeIdRef.current) {
        hoveredNodeIdRef.current = found
        if (found) {
          canvas.style.cursor = 'pointer'
          soundEngine.playHover()
        } else {
          canvas.style.cursor = 'default'
        }
      }
    }

    const handlePointerLeave = () => {
      mousePosRef.current = { x: -9999, y: -9999, active: false }
      hoveredNodeIdRef.current = null
      canvas.style.cursor = 'default'
    }

    const handleClick = () => {
      if (hoveredNodeIdRef.current) {
        soundEngine.playNodeSelect()
        onNodeSelect?.(hoveredNodeIdRef.current)
      }
    }

    canvas.addEventListener('pointermove', handlePointerMove, { passive: true })
    canvas.addEventListener('pointerleave', handlePointerLeave, { passive: true })
    canvas.addEventListener('click', handleClick)

    // MAIN ANIMATION LOOP
    let lastTime = performance.now()

    const render = (now: number) => {
      if (!isMounted) return
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      const p = progressRef.current
      const t = transitionRef.current

      let sceneAlpha = 0
      let assembleRatio = 0
      let exitScale = 1.0
      let contractRatio = 0

      // Compute entrance / assembly from master progress
      if (p < 0.20) {
        sceneAlpha = 0
        assembleRatio = 0
      } else if (p < 0.30) {
        const ratio = (p - 0.20) / (0.30 - 0.20)
        sceneAlpha = ratio * 0.40
        assembleRatio = ratio * 0.35
      } else if (p < 0.38) {
        const ratio = (p - 0.30) / (0.38 - 0.30)
        sceneAlpha = 0.40 + ratio * 0.60
        assembleRatio = 0.35 + ratio * 0.65
      } else {
        // Locked Plateau reached
        sceneAlpha = 1.0
        assembleRatio = 1.0
        exitScale = 1.0
        contractRatio = 0
      }

      // If transition to Scene 3 is active, apply exact user-specified timeline
      if (t > 0) {
        if (t <= 0.15) {
          // 0.00 -> 0.15: Scene 2 Resting Frame (stable hold)
          sceneAlpha = 1.0
          assembleRatio = 1.0
          exitScale = 1.0
          contractRatio = 0
        } else if (t <= 0.32) {
          // 0.15 -> 0.32: Scene 2 prepares, constellation focuses (scale 1 -> 1.04)
          const subT = (t - 0.15) / (0.32 - 0.15)
          sceneAlpha = 1.0
          assembleRatio = 1.0
          exitScale = 1.0 + subT * 0.04
          contractRatio = 0
        } else if (t <= 0.48) {
          // 0.32 -> 0.48: Constellation contracts toward central node (calculus)
          const subT = (t - 0.32) / (0.48 - 0.32)
          sceneAlpha = 1.0
          assembleRatio = 1.0
          exitScale = 1.04
          contractRatio = subT
        } else if (t <= 0.66) {
          // 0.48 -> 0.66: Camera dive through central node (scale 1.04 -> 2.6, opacity 1 -> 0)
          const subT = (t - 0.48) / (0.66 - 0.48)
          sceneAlpha = Math.max(0, 1.0 - subT)
          assembleRatio = 1.0
          exitScale = 1.04 + subT * 1.56
          contractRatio = 1.0
        } else {
          // Passed through central node into transition bridge & Scene 3
          sceneAlpha = 0
          contractRatio = 1.0
        }
      }

      // Clear viewport
      ctx.clearRect(0, 0, width, height)

      // Skip render if completely invisible
      if (sceneAlpha <= 0.005 || width <= 0 || height <= 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const isMobile = width < 768
      const boxW = (isMobile ? width * 0.88 : Math.min(width * 0.78, 860)) * exitScale
      const boxH = (isMobile ? height * 0.62 : Math.min(height * 0.66, 540)) * exitScale
      const cx = width / 2
      const cy = height / 2

      const mouse = mousePosRef.current
      const hoveredId = hoveredNodeIdRef.current

      // Determine active connected neighbors when a node is hovered
      const activeNeighborSet = new Set<string>()
      if (hoveredId && t < 0.25) {
        activeNeighborSet.add(hoveredId)
        for (const [s, tNode] of SEMANTIC_EDGES) {
          if (s === hoveredId) activeNeighborSet.add(tNode)
          if (tNode === hoveredId) activeNeighborSet.add(s)
        }
      }

      // ---------------------------------------------------------------------
      // 1. UPDATE ACADEMIC NODE POSITIONS (With inward contraction during transition)
      // ---------------------------------------------------------------------
      for (const node of ACADEMIC_NODES) {
        let state = nodeStateMap.get(node.id)
        if (!state) {
          state = {
            x: cx,
            y: cy,
            targetX: cx,
            targetY: cy,
            baseX: cx,
            baseY: cy,
            size: node.size,
            pulsePhase: Math.random() * Math.PI * 2,
            hoverAlpha: 0,
          }
          nodeStateMap.set(node.id, state)
        }

        // Target centered screen coordinates, contracted toward (0.50, 0.49) if contractRatio > 0
        const normX = node.isCore ? 0.50 : node.nx + (0.50 - node.nx) * contractRatio * 0.90
        const normY = node.isCore ? 0.49 : node.ny + (0.49 - node.ny) * contractRatio * 0.90

        const targetX = cx + (normX - 0.5) * boxW
        const targetY = cy + (normY - 0.5) * boxH
        state.baseX = targetX
        state.baseY = targetY

        // Interpolate assembly from singularity center (cx, cy)
        const currentTargetX = cx + (targetX - cx) * assembleRatio
        const currentTargetY = cy + (targetY - cy) * assembleRatio

        // Micro-repulsion from mouse (active only during resting state t < 0.20)
        let repelX = 0
        let repelY = 0
        if (mouse.active && t < 0.20) {
          const dx = currentTargetX - mouse.x
          const dy = currentTargetY - mouse.y
          const d2 = dx * dx + dy * dy
          const rLimit = 90
          if (d2 < rLimit * rLimit && d2 > 0.001) {
            const d = Math.sqrt(d2)
            const force = (1 - d / rLimit) * 3.2
            repelX = (dx / d) * force
            repelY = (dy / d) * force
          }
        }

        // Smooth spring towards target
        state.x += (currentTargetX + repelX - state.x) * 0.18
        state.y += (currentTargetY + repelY - state.y) * 0.18
        state.pulsePhase += dt * 1.8

        const isHovered = node.id === hoveredId && t < 0.25
        const isNeighbor = activeNeighborSet.has(node.id) && t < 0.25
        const targetHoverAlpha = isHovered ? 1.0 : isNeighbor ? 0.6 : hoveredId && t < 0.25 ? -0.4 : 0
        state.hoverAlpha += (targetHoverAlpha - state.hoverAlpha) * 0.18
      }

      // ---------------------------------------------------------------------
      // 2. UPDATE & DRAW AMBIENT PARTICLES
      // ---------------------------------------------------------------------
      const ambientConnectDist = isMobile ? 48 : 74
      const ambientConnectDistSq = ambientConnectDist * ambientConnectDist
      const connectionCounts = new Uint8Array(ambientParticles.length)

      // Ambient particles dim slightly during transition
      const ambientDimMultiplier = t > 0.15 ? Math.max(0, 1.0 - (t - 0.15) * 2.2) : 1.0

      for (let i = 0; i < ambientParticles.length; i++) {
        const p1 = ambientParticles[i]

        p1.x += p1.vx
        p1.y += p1.vy

        const margin = 20
        if (p1.x < margin) { p1.x = margin; p1.vx *= -1 }
        if (p1.x > width - margin) { p1.x = width - margin; p1.vx *= -1 }
        if (p1.y < margin) { p1.y = margin; p1.vy *= -1 }
        if (p1.y > height - margin) { p1.y = height - margin; p1.vy *= -1 }

        if (mouse.active && t < 0.20) {
          const dx = p1.x - mouse.x
          const dy = p1.y - mouse.y
          const d2 = dx * dx + dy * dy
          const mouseRadius = 110
          if (d2 < mouseRadius * mouseRadius && d2 > 0.001) {
            const d = Math.sqrt(d2)
            const force = (1 - d / mouseRadius) * 1.4
            p1.x += (dx / d) * force
            p1.y += (dy / d) * force
          }
        }

        const dotAlpha = p1.baseOpacity * sceneAlpha * ambientDimMultiplier * (hoveredId ? 0.45 : 0.85)
        if (dotAlpha > 0.01) {
          ctx.beginPath()
          ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(142, 223, 242, ${dotAlpha})`
          ctx.fill()
        }

        for (let j = i + 1; j < ambientParticles.length; j++) {
          if (connectionCounts[i] >= 2 || connectionCounts[j] >= 2) continue
          const p2 = ambientParticles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const d2 = dx * dx + dy * dy

          if (d2 < ambientConnectDistSq) {
            connectionCounts[i]++
            connectionCounts[j]++
            const dist = Math.sqrt(d2)
            const edgeAlpha = (1 - dist / ambientConnectDist) * 0.16 * sceneAlpha * ambientDimMultiplier
            if (edgeAlpha > 0.01) {
              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.strokeStyle = `rgba(100, 210, 235, ${edgeAlpha})`
              ctx.lineWidth = 0.65
              ctx.stroke()
            }
          }
        }
      }

      // ---------------------------------------------------------------------
      // 3. DRAW CURATED SEMANTIC CONNECTIONS
      // Lines shorten and brighten as contraction progresses
      // ---------------------------------------------------------------------
      for (const [sourceId, targetId] of SEMANTIC_EDGES) {
        const sState = nodeStateMap.get(sourceId)
        const tState = nodeStateMap.get(targetId)
        if (!sState || !tState) continue

        const isEdgeHovered = hoveredId && (sourceId === hoveredId || targetId === hoveredId) && t < 0.25
        const isDimmed = hoveredId && !isEdgeHovered && t < 0.25

        // Brighten connections as nodes contract (0.32 -> 0.48)
        const contractBrighten = contractRatio * 0.35

        let edgeAlpha = isEdgeHovered
          ? 0.75 * sceneAlpha
          : isDimmed
          ? 0.08 * sceneAlpha
          : (0.24 + contractBrighten) * sceneAlpha

        ctx.beginPath()
        ctx.moveTo(sState.x, sState.y)
        ctx.lineTo(tState.x, tState.y)

        if (isEdgeHovered) {
          ctx.strokeStyle = `rgba(175, 240, 255, ${edgeAlpha})`
          ctx.lineWidth = 1.6
          ctx.stroke()
        } else {
          ctx.strokeStyle = `rgba(100, 210, 235, ${edgeAlpha})`
          ctx.lineWidth = 1.0 + contractRatio * 0.6
          ctx.stroke()
        }
      }

      // ---------------------------------------------------------------------
      // 4. DRAW CURATED ACADEMIC NODES & LABELS
      // Central node scales up (1 -> 1.45) with intensified cyan glow
      // Outer nodes dim slightly as they converge
      // ---------------------------------------------------------------------
      for (const node of ACADEMIC_NODES) {
        const state = nodeStateMap.get(node.id)
        if (!state) continue

        const isHovered = node.id === hoveredId && t < 0.25
        const isNeighbor = activeNeighborSet.has(node.id) && t < 0.25
        const isDimmed = (hoveredId && !isHovered && !isNeighbor && t < 0.25) || (!node.isCore && contractRatio > 0.4)

        // Central source node scales 1 -> 1.45; outer nodes soften slightly
        const focalScale = node.isCore ? 1.0 + contractRatio * 0.45 : Math.max(0.7, 1.0 - contractRatio * 0.25)
        const currentScale = (isHovered ? 1.18 : 1.0) * focalScale
        const r = node.size * currentScale

        // A. Outer Glow / Pulse Ring
        if (node.isCore || isHovered) {
          const extraCorePulse = node.isCore ? contractRatio * 8 : 0
          const pulseR = r + (isHovered ? 6 : 3 + Math.sin(state.pulsePhase) * 1.5) + extraCorePulse
          const glowAlpha = ((isHovered ? 0.45 : 0.18) + (node.isCore ? contractRatio * 0.4 : 0)) * sceneAlpha
          ctx.beginPath()
          ctx.arc(state.x, state.y, pulseR, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(105, 221, 245, ${glowAlpha})`
          ctx.fill()
        }

        // B. Node Core Circle
        ctx.beginPath()
        ctx.arc(state.x, state.y, r, 0, Math.PI * 2)

        if (isHovered) {
          ctx.fillStyle = '#69DDF5'
        } else if (node.isCore) {
          ctx.fillStyle = '#EAFBFF'
        } else if (node.isAnchorDefault) {
          ctx.fillStyle = isDimmed ? 'rgba(234, 251, 255, 0.45)' : 'rgba(234, 251, 255, 0.95)'
        } else {
          ctx.fillStyle = isDimmed ? 'rgba(142, 223, 242, 0.25)' : 'rgba(142, 223, 242, 0.65)'
        }
        ctx.fill()

        // Inner hot core for anchor nodes
        if (node.isAnchorDefault && !isDimmed) {
          ctx.beginPath()
          ctx.arc(state.x, state.y, r * 0.45, 0, Math.PI * 2)
          ctx.fillStyle = '#FFFFFF'
          ctx.fill()
        }

        // C. Clean Monospace Labels (fade out as contraction starts t >= 0.28)
        const labelFade = t > 0.25 ? Math.max(0, 1.0 - (t - 0.25) * 8) : 1.0
        const showLabel = (node.isAnchorDefault || isHovered || isNeighbor) && labelFade > 0.05
        if (showLabel && assembleRatio > 0.45) {
          const labelAlpha = (isHovered ? 1.0 : isNeighbor ? 0.85 : isDimmed ? 0.35 : 0.78) * sceneAlpha * labelFade
          const labelY = state.y + r + (isMobile ? 12 : 14)

          ctx.save()
          ctx.font = isMobile ? '500 9.5px monospace' : '500 11px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = 'rgba(2, 3, 4, 0.95)'
          ctx.shadowBlur = 6

          if (isHovered) {
            ctx.fillStyle = `rgba(105, 221, 245, ${labelAlpha})`
          } else {
            ctx.fillStyle = `rgba(234, 251, 255, ${labelAlpha})`
          }

          ctx.fillText(node.label, state.x, labelY)

          if (isHovered && !isMobile) {
            ctx.font = '500 8px monospace'
            ctx.fillStyle = 'rgba(142, 223, 242, 0.65)'
            ctx.fillText(node.category, state.x, labelY + 11)
          }

          ctx.restore()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      isMounted = false
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerleave', handlePointerLeave)
      canvas.removeEventListener('click', handleClick)
    }
  }, [onNodeSelect])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto select-none ${className}`}
      style={{ touchAction: 'none' }}
    />
  )
}

export default KnowledgeConstellationCanvas
