import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Compass,
  ShieldCheck,
  ArrowRight,
  Zap,
  Rotate3d,
  Maximize2,
  BookOpen,
  CheckCircle2,
  Crosshair,
  Volume2,
} from 'lucide-react'
import { soundEngine } from '../lib/audio-engine'
import { GurukulParticleField } from './ui/gurukul-particle-field'

interface HeroConstellationProps {
  onOpenUploadModal: () => void
}

interface Node3D {
  id: string
  label: string
  category: 'CALCULUS' | 'LINEAR ALGEBRA' | 'PROBABILITY' | 'MACHINE LEARNING' | 'PHYSICS'
  x: number
  y: number
  z: number
  origX: number
  origY: number
  origZ: number
  radius: number
  color: string
  connections: number[]
  isAnchor: boolean
  description: string
  formula?: string
  syllabusUnit: string
  prerequisites: string[]
}

interface Pulse3D {
  fromIdx: number
  toIdx: number
  progress: number
  speed: number
  color: string
}

const PRESET_TOPICS = [
  { id: 'chain-rule', label: 'Chain Rule', category: 'CALCULUS' },
  { id: 'grad-descent', label: 'Gradient Descent', category: 'MACHINE LEARNING' },
  { id: 'svd', label: 'SVD Factorization', category: 'LINEAR ALGEBRA' },
  { id: 'bayes', label: "Bayes' Inference", category: 'PROBABILITY' },
  { id: 'attention', label: 'Attention Vectors', category: 'MACHINE LEARNING' },
]

export const HeroConstellation: React.FC<HeroConstellationProps> = ({ onOpenUploadModal }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null)
  const selectedNodeRef = useRef<Node3D | null>(null)
  selectedNodeRef.current = selectedNode
  const [activeTopicId, setActiveTopicId] = useState<string>('chain-rule')
  const [isInteracting, setIsInteracting] = useState<boolean>(false)
  const [zoomLevel, setZoomLevel] = useState<number>(1)

  // Dragging / Orbit state references
  const isDraggingRef = useRef<boolean>(false)
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const rotVelRef = useRef<{ x: number; y: number }>({ x: 0, y: 0.0015 })
  const rotRef = useRef<{ x: number; y: number }>({ x: 0.28, y: 0 })
  const nodesRef = useRef<Node3D[]>([])
  const triggerFocusRef = useRef<((nodeId: string) => void) | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.clientHeight || window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.clientWidth || window.innerWidth
      height = canvas.height = canvas.clientHeight || window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Build curated 3D Knowledge Galaxy nodes
    const TOPICS_DATA = [
      // CALCULUS CLUSTER (North-West)
      { id: 'limits', label: 'LIMITS & EPSILON', category: 'CALCULUS', isAnchor: true, desc: 'Infinitesimal boundary analysis and delta criteria.', formula: 'lim_{x \\to c} f(x) = L', unit: 'Unit 1.1 • Stewart §2.2', prereqs: [] },
      { id: 'continuity', label: 'CONTINUITY & IVT', category: 'CALCULUS', isAnchor: false, desc: 'Topological connectivity across domain intervals.', formula: 'f(c) = \\lim_{x \\to c} f(x)', unit: 'Unit 1.2 • Stewart §2.5', prereqs: ['LIMITS'] },
      { id: 'derivatives', label: 'DERIVATIVES', category: 'CALCULUS', isAnchor: true, desc: 'Instantaneous rate of change tangent vector.', formula: "f'(x) = \\lim_{h \\to 0} [f(x+h)-f(x)]/h", unit: 'Unit 2.1 • Stewart §3.1', prereqs: ['LIMITS', 'CONTINUITY'] },
      { id: 'chain-rule', label: 'CHAIN RULE', category: 'CALCULUS', isAnchor: true, desc: 'Composite rate multiplication of inner/outer functions.', formula: "(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)", unit: 'Unit 2.3 • Stewart §3.4', prereqs: ['DERIVATIVES'] },
      { id: 'taylor', label: 'TAYLOR POLYNOMIAL', category: 'CALCULUS', isAnchor: false, desc: 'Infinite polynomial approximation via higher derivatives.', formula: '\\sum [f^{(n)}(a)/n!] (x-a)^n', unit: 'Unit 2.6 • Stewart §11.10', prereqs: ['DERIVATIVES'] },
      { id: 'integrals', label: 'RIEMANN INTEGRALS', category: 'CALCULUS', isAnchor: true, desc: 'Continuous accumulation of infinitesimal slices.', formula: '\\int_a^b f(x) dx', unit: 'Unit 3.1 • Stewart §5.1', prereqs: ['LIMITS'] },
      { id: 'ftc', label: 'FUNDAMENTAL THEOREM', category: 'CALCULUS', isAnchor: true, desc: 'Inversion duality between differentiation and integration.', formula: 'd/dx \\int f(t) dt = f(x)', unit: 'Unit 3.2 • Stewart §5.3', prereqs: ['DERIVATIVES', 'INTEGRALS'] },
      { id: 'partial-diff', label: 'PARTIAL DERIVATIVES', category: 'CALCULUS', isAnchor: true, desc: 'Multivariable rate of change along single orthogonal axes.', formula: '\\partial f / \\partial x_i', unit: 'Unit 4.1 • Marsden §2.3', prereqs: ['DERIVATIVES'] },
      { id: 'gradient', label: 'GRADIENT VECTOR (∇f)', category: 'CALCULUS', isAnchor: true, desc: 'Directional compass of steepest ascent in parameter space.', formula: '\\nabla f = [\\partial f/\\partial x_1, \\dots, \\partial f/\\partial x_n]^T', unit: 'Unit 4.2 • Marsden §2.6', prereqs: ['PARTIAL DERIVATIVES'] },

      // LINEAR ALGEBRA CLUSTER (North-East)
      { id: 'vectors', label: 'VECTOR SPACES', category: 'LINEAR ALGEBRA', isAnchor: true, desc: 'Axiomatic spaces endowed with addition and scaling.', formula: 'v = \\sum c_i e_i', unit: 'Unit 1.1 • Strang §1.1', prereqs: [] },
      { id: 'dot-product', label: 'DOT PRODUCT & PROJ', category: 'LINEAR ALGEBRA', isAnchor: false, desc: 'Inner metric defining angles, length, and projection.', formula: 'u \\cdot v = \\|u\\| \\|v\\| \\cos\\theta', unit: 'Unit 1.2 • Strang §1.2', prereqs: ['VECTORS'] },
      { id: 'matrices', label: 'LINEAR MAPS', category: 'LINEAR ALGEBRA', isAnchor: true, desc: 'Operators mapping vector spaces under coordinate shear/scale.', formula: 'T(u + v) = T(u) + T(v)', unit: 'Unit 2.1 • Strang §2.1', prereqs: ['VECTORS'] },
      { id: 'determinants', label: 'DETERMINANTS', category: 'LINEAR ALGEBRA', isAnchor: false, desc: 'Signed volume scaling factor and invertibility diagnostic.', formula: '\\det(A) = \\prod \\lambda_i', unit: 'Unit 3.1 • Strang §5.1', prereqs: ['LINEAR MAPS'] },
      { id: 'eigenvalues', label: 'EIGENSYSTEMS', category: 'LINEAR ALGEBRA', isAnchor: true, desc: 'Directions of pure stretch invariant to rotation.', formula: 'A v = \\lambda v', unit: 'Unit 4.1 • Strang §6.1', prereqs: ['LINEAR MAPS', 'DETERMINANTS'] },
      { id: 'orthogonality', label: 'ORTHOGONALITY', category: 'LINEAR ALGEBRA', isAnchor: false, desc: 'Perpendicular subspaces yielding stable orthonormal bases.', formula: 'Q^T Q = I', unit: 'Unit 4.3 • Strang §4.4', prereqs: ['DOT PRODUCT'] },
      { id: 'svd', label: 'SVD FACTORIZATION', category: 'LINEAR ALGEBRA', isAnchor: true, desc: 'Universal decomposition into rotation, scaling, and rotation.', formula: 'A = U \\Sigma V^T', unit: 'Unit 5.2 • Strang §7.1', prereqs: ['EIGENSYSTEMS', 'ORTHOGONALITY'] },

      // PROBABILITY CLUSTER (South-West)
      { id: 'sample-space', label: 'SAMPLE SPACE (Ω)', category: 'PROBABILITY', isAnchor: true, desc: 'Axiomatic foundation of all possible probabilistic outcomes.', formula: 'P(\\Omega) = 1', unit: 'Unit 1.1 • Ross §2.1', prereqs: [] },
      { id: 'conditional-prob', label: 'CONDITIONING', category: 'PROBABILITY', isAnchor: false, desc: 'Probability recalculation given observed partial evidence.', formula: 'P(A|B) = P(A \\cap B)/P(B)', unit: 'Unit 1.3 • Ross §3.2', prereqs: ['SAMPLE SPACE'] },
      { id: 'bayes', label: "BAYES' INFERENCE", category: 'PROBABILITY', isAnchor: true, desc: 'Rational belief revision using likelihood and prior odds.', formula: 'P(\\theta|D) = \\frac{P(D|\\theta)P(\\theta)}{P(D)}', unit: 'Unit 2.1 • Ross §3.6', prereqs: ['CONDITIONING'] },
      { id: 'random-vars', label: 'RANDOM VARIABLES', category: 'PROBABILITY', isAnchor: false, desc: 'Measurable numerical mapping from outcomes to real field.', formula: '\\mathbb{E}[X] = \\int x f(x) dx', unit: 'Unit 3.1 • Ross §4.1', prereqs: ['SAMPLE SPACE'] },
      { id: 'distributions', label: 'GAUSSIAN DENSITIES', category: 'PROBABILITY', isAnchor: true, desc: 'Continuous normal distributions and Central Limit Theorem.', formula: '\\mathcal{N}(x; \\mu, \\sigma^2)', unit: 'Unit 3.4 • Ross §5.4', prereqs: ['RANDOM VARIABLES', 'RIEMANN INTEGRALS'] },
      { id: 'mle', label: 'MAX LIKELIHOOD', category: 'PROBABILITY', isAnchor: false, desc: 'Optimal parameter estimation maximizing sample likelihood.', formula: '\\hat{\\theta} = \\arg\\max \\sum \\log P(x_i|\\theta)', unit: 'Unit 4.2 • Casella §7.2', prereqs: ['BAYES', 'GAUSSIAN DENSITIES'] },

      // MACHINE LEARNING CLUSTER (South-East)
      { id: 'opt', label: 'CONVEX OPTIMIZATION', category: 'MACHINE LEARNING', isAnchor: true, desc: 'Guaranteed global minimum convergence over convex sets.', formula: 'f(\\alpha x + (1-\\alpha)y) \\le \\alpha f(x) + (1-\\alpha)f(y)', unit: 'Unit 1.2 • Boyd §3.1', prereqs: ['PARTIAL DERIVATIVES'] },
      { id: 'grad-descent', label: 'GRADIENT DESCENT', category: 'MACHINE LEARNING', isAnchor: true, desc: 'Iterative steepest descent stepping opposite loss gradient.', formula: 'w_{t+1} = w_t - \\eta \\nabla L(w_t)', unit: 'Unit 2.1 • Goodfellow §4.3', prereqs: ['GRADIENT VECTOR', 'CONVEX OPTIMIZATION'] },
      { id: 'backprop', label: 'BACKPROPAGATION', category: 'MACHINE LEARNING', isAnchor: true, desc: 'Reverse-mode automatic differentiation applying chain rule.', formula: '\\partial L/\\partial w = \\delta_j a_i', unit: 'Unit 3.1 • Goodfellow §6.5', prereqs: ['CHAIN RULE', 'GRADIENT DESCENT'] },
      { id: 'loss-landscapes', label: 'LOSS SURFACES', category: 'MACHINE LEARNING', isAnchor: false, desc: 'High-dimensional geometry of non-convex saddle points.', formula: 'L(w) = \\frac{1}{N} \\sum \\mathcal{L}(f_w(x_i), y_i)', unit: 'Unit 3.2 • Goodfellow §8.2', prereqs: ['GRADIENT DESCENT'] },
      { id: 'pca', label: 'PCA PROJECTION', category: 'MACHINE LEARNING', isAnchor: false, desc: 'Dimensionality reduction along maximal variance orthogonal axes.', formula: 'X_{proj} = X V_k', unit: 'Unit 4.1 • Bishop §12.1', prereqs: ['EIGENSYSTEMS', 'SVD FACTORIZATION'] },
      { id: 'embeddings', label: 'VECTOR EMBEDDINGS', category: 'MACHINE LEARNING', isAnchor: true, desc: 'Continuous dense semantic representations of conceptual entities.', formula: '\\cos(u, v) = (u \\cdot v)/(\\|u\\| \\|v\\|)', unit: 'Unit 5.1 • Jurafsky §6.3', prereqs: ['PCA PROJECTION', 'DOT PRODUCT'] },
      { id: 'attention', label: 'ATTENTION VECTORS', category: 'MACHINE LEARNING', isAnchor: true, desc: 'Softmax Query-Key contextual compatibility routing.', formula: '\\text{softmax}(Q K^T / \\sqrt{d_k}) V', unit: 'Unit 6.1 • Vaswani (2017)', prereqs: ['BACKPROPAGATION', 'VECTOR EMBEDDINGS'] },
    ]

    const numNodes = TOPICS_DATA.length
    const nodes: Node3D[] = []

    // Mathematical 3D Celestial Ring Placement
    // Center is kept spacious (radii 360 to 620px), nodes breathe in 3D
    for (let i = 0; i < numNodes; i++) {
      const item = TOPICS_DATA[i]
      const angle = (i / numNodes) * Math.PI * 2
      const radius = 390 + (i % 4) * 60 + Math.sin(i * 2) * 35
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * (radius * 0.44) + Math.sin(i * 3) * 45
      const z = Math.sin(angle) * 260 + ((i % 3) - 1) * 70

      nodes.push({
        id: item.id,
        label: item.label,
        category: item.category as any,
        x,
        y,
        z,
        origX: x,
        origY: y,
        origZ: z,
        radius: item.isAnchor ? 3.6 : 2.2,
        color: item.isAnchor ? '#38bdf8' : '#cbd5e1',
        connections: [],
        isAnchor: item.isAnchor,
        description: item.desc,
        formula: item.formula,
        syllabusUnit: item.unit,
        prerequisites: item.prereqs,
      })
    }

    // Connect nodes into topological directed acyclic graph
    for (let i = 0; i < numNodes; i++) {
      const connections: number[] = []
      connections.push((i + 1) % numNodes)
      if (i % 2 === 0) connections.push((i + 3) % numNodes)
      if (i % 5 === 0) connections.push((i + 7) % numNodes)
      nodes[i].connections = connections
    }

    nodesRef.current = nodes
    setSelectedNode(nodes.find((n) => n.id === 'chain-rule') || nodes[3])

    // Background 3D Stardust Field (140 stars)
    const dustCount = 120
    const dust: { x: number; y: number; z: number; size: number; alpha: number }[] = []
    for (let i = 0; i < dustCount; i++) {
      dust.push({
        x: (Math.random() - 0.5) * 1800,
        y: (Math.random() - 0.5) * 1100,
        z: (Math.random() - 0.5) * 900,
        size: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.5 + 0.15,
      })
    }

    // Traveling Energy Pulses
    const pulses: Pulse3D[] = []
    const spawnPulse = (from?: number, to?: number) => {
      if (pulses.length > 24) return
      const fromIdx = from !== undefined ? from : Math.floor(Math.random() * numNodes)
      const n = nodes[fromIdx]
      if (n.connections.length > 0) {
        const toIdx = to !== undefined ? to : n.connections[Math.floor(Math.random() * n.connections.length)]
        pulses.push({
          fromIdx,
          toIdx,
          progress: 0,
          speed: 0.012 + Math.random() * 0.015,
          color: Math.random() > 0.4 ? '#38bdf8' : '#ffffff',
        })
      }
    }

    for (let i = 0; i < 8; i++) spawnPulse()
    const pulseTimer = setInterval(() => spawnPulse(), 900)

    // Camera Glide to Focus Node
    triggerFocusRef.current = (nodeId: string) => {
      const idx = nodes.findIndex((n) => n.id === nodeId)
      if (idx === -1) return
      const target = nodes[idx]
      setSelectedNode(target)
      soundEngine.playSourceFlare()

      // Calculate target yaw angle to rotate focused node toward front-center
      const targetAngle = -Math.atan2(target.origX, target.origZ)
      rotRef.current.y = targetAngle
      rotRef.current.x = 0.22

      // Spawn photon burst across its connections
      target.connections.forEach((connIdx) => {
        spawnPulse(idx, connIdx)
      })
    }

    // Pointer Drag Handlers
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true
      lastMousePosRef.current = { x: e.clientX, y: e.clientY }
      rotVelRef.current = { x: 0, y: 0 }
      setIsInteracting(true)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return
      const dx = e.clientX - lastMousePosRef.current.x
      const dy = e.clientY - lastMousePosRef.current.y
      lastMousePosRef.current = { x: e.clientX, y: e.clientY }

      rotRef.current.y += dx * 0.004
      rotRef.current.x += dy * 0.003
      rotVelRef.current = { x: dy * 0.0008, y: dx * 0.0008 }
    }

    const onPointerUp = () => {
      isDraggingRef.current = false
      setTimeout(() => setIsInteracting(false), 800)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    // Render & Physics Loop
    let time = 0
    const fov = 780

    const render = () => {
      time += 0.008

      // Apply rotational inertia
      if (!isDraggingRef.current) {
        rotRef.current.y += rotVelRef.current.y
        rotRef.current.x += rotVelRef.current.x
        rotVelRef.current.x *= 0.96
        rotVelRef.current.y = rotVelRef.current.y * 0.96 + 0.0006 * 0.04 // gentle constant spin
      }

      ctx.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2

      // Deep space ambient radial aura
      const radialGlow = ctx.createRadialGradient(cx, cy, 40, cx, cy, width * 0.6)
      radialGlow.addColorStop(0, 'rgba(6, 182, 212, 0.06)')
      radialGlow.addColorStop(0.5, 'rgba(15, 23, 42, 0.02)')
      radialGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = radialGlow
      ctx.fillRect(0, 0, width, height)

      // Project & Render Dust Stars
      for (let i = 0; i < dustCount; i++) {
        const d = dust[i]
        const cosY = Math.cos(rotRef.current.y * 0.4)
        const sinY = Math.sin(rotRef.current.y * 0.4)
        const rx = d.x * cosY - d.z * sinY
        const rz = d.x * sinY + d.z * cosY

        const cosX = Math.cos(rotRef.current.x * 0.4)
        const sinX = Math.sin(rotRef.current.x * 0.4)
        const ry = d.y * cosX - rz * sinX
        const finalZ = d.y * sinX + rz * cosX

        const scale = fov / (fov + finalZ + 600)
        if (scale <= 0) continue

        const px = cx + rx * scale
        const py = cy + ry * scale

        ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * Math.min(1, scale * 1.3)})`
        ctx.beginPath()
        ctx.arc(px, py, Math.max(0.4, d.size * scale), 0, Math.PI * 2)
        ctx.fill()
      }

      // Rotate and Project 3D Nodes
      const projected: { x: number; y: number; z: number; scale: number; node: Node3D; idx: number }[] = []

      for (let i = 0; i < numNodes; i++) {
        const n = nodes[i]

        // Organic breathing
        const curX = n.origX + Math.cos(time + i) * 6
        const curY = n.origY + Math.sin(time * 1.4 + i) * 10
        const curZ = n.origZ + Math.sin(time * 0.7 + i) * 12

        // 3D Rotation Matrix
        const cosY = Math.cos(rotRef.current.y)
        const sinY = Math.sin(rotRef.current.y)
        const rx = curX * cosY - curZ * sinY
        const rz = curX * sinY + curZ * cosY

        const cosX = Math.cos(rotRef.current.x)
        const sinX = Math.sin(rotRef.current.x)
        const ry = curY * cosX - rz * sinX
        const finalZ = curY * sinX + rz * cosX

        const scale = fov / (fov + finalZ + 500)
        if (scale <= 0) continue

        const px = cx + rx * scale
        const py = cy + ry * scale

        projected.push({ x: px, y: py, z: finalZ, scale, node: n, idx: i })
      }

      // Depth sort back to front
      projected.sort((a, b) => b.z - a.z)

      // Draw Edges with spatial depth
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i]
        const n1 = p1.node
        const isSelectedP1 = selectedNode?.id === n1.id

        for (const connIdx of n1.connections) {
          const p2 = projected.find((p) => p.idx === connIdx)
          if (!p2) continue

          const isConnectedEdge = isSelectedP1 || (selectedNodeRef.current && selectedNodeRef.current.id === p2.node.id)
          const avgScale = (p1.scale + p2.scale) / 2

          ctx.lineWidth = isConnectedEdge ? 1.2 : 0.4
          ctx.strokeStyle = isConnectedEdge
            ? `rgba(56, 189, 248, ${Math.min(0.9, 0.6 * avgScale)})`
            : `rgba(255, 255, 255, ${Math.max(0.04, 0.16 * avgScale)})`

          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }

      // Render Synaptic Pulses
      for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
        const pulse = pulses[pIdx]
        pulse.progress += pulse.speed

        if (pulse.progress >= 1) {
          pulses.splice(pIdx, 1)
          continue
        }

        const p1 = projected.find((p) => p.idx === pulse.fromIdx)
        const p2 = projected.find((p) => p.idx === pulse.toIdx)
        if (!p1 || !p2) continue

        const pulseX = p1.x + (p2.x - p1.x) * pulse.progress
        const pulseY = p1.y + (p2.y - p1.y) * pulse.progress
        const pulseScale = (p1.scale + p2.scale) / 2

        ctx.fillStyle = pulse.color
        ctx.shadowColor = '#38bdf8'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(pulseX, pulseY, 2.2 * pulseScale, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Render Nodes & Telemetry HUD tags
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i]
        const n = p.node
        const radius = n.radius * p.scale
        const isSelected = selectedNodeRef.current?.id === n.id

        // Volumetric radial light halo
        if (n.isAnchor || isSelected) {
          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * (isSelected ? 7 : 3.5))
          halo.addColorStop(0, isSelected ? 'rgba(255, 255, 255, 0.95)' : 'rgba(56, 189, 248, 0.4)')
          halo.addColorStop(0.5, 'rgba(6, 182, 212, 0.12)')
          halo.addColorStop(1, 'transparent')

          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(p.x, p.y, radius * (isSelected ? 7 : 3.5), 0, Math.PI * 2)
          ctx.fill()
        }

        // Solid Node Core
        ctx.fillStyle = isSelected ? '#ffffff' : n.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(1.2, isSelected ? radius * 1.5 : radius), 0, Math.PI * 2)
        ctx.fill()

        // Rotating reticle ring for selected node
        if (isSelected) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(time * 2)
          ctx.strokeStyle = '#38bdf8'
          ctx.lineWidth = 0.8
          ctx.setLineDash([2, 3])
          ctx.beginPath()
          ctx.arc(0, 0, radius * 3.2, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        }

        // Monospace Topic Labels (scaled by z-depth)
        // Constellation Label Rule: Default shows max 5-7 key anchor nodes; selected shows node + neighbors
        const KEY_DEFAULT_NODES = ['limits', 'derivatives', 'matrices', 'eigenvalues', 'bayes', 'attention']
        const isNeighbor = selectedNodeRef.current?.connections.includes(p.idx)
        const isKeyDefault = KEY_DEFAULT_NODES.includes(n.id)
        const shouldShowLabel = isSelected || isNeighbor || isKeyDefault

        if (p.scale > 0.65 && shouldShowLabel) {
          const textAlpha = Math.max(0.18, Math.min(0.9, (p.scale - 0.65) * 2.8))
          ctx.font = `${Math.round(8.5 * p.scale)}px 'Geist Mono', monospace`
          ctx.textAlign = 'center'
          ctx.fillStyle = isSelected ? '#69DDF5' : isNeighbor ? 'rgba(245, 245, 242, 0.85)' : `rgba(226, 232, 240, ${textAlpha})`
          ctx.fillText(n.label, p.x, p.y + radius + 11 * p.scale)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      clearInterval(pulseTimer)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const handleSelectPreset = (topicId: string) => {
    setActiveTopicId(topicId)
    if (triggerFocusRef.current) {
      triggerFocusRef.current(topicId)
    }
  }

  return (
    <section
      id="hero"
      className="relative min-h-[102svh] w-full bg-[#020205] overflow-hidden flex flex-col justify-between pt-24 pb-8 select-none"
    >
      {/* PHASE 1 DIAGNOSTIC MARKER */}
      <div
        data-scene3-debug
        style={{
          position: "absolute",
          top: 90,
          right: 30,
          zIndex: 999,
          padding: "8px 12px",
          background: "#00D4FF",
          color: "#000",
          fontWeight: 700
        }}
      >
        SCENE 3 VERIFIED
      </div>
      {/* 1. Deep Ambient Particle & Spotlight Field (z-[5] so it renders cleanly above background and shield, but behind z-20/z-30 text and UI) */}
      <GurukulParticleField className="z-[5]" />

      {/* 2. 3D Spatial Knowledge Constellation Canvas with Drag Physics */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[2] pointer-events-auto cursor-grab active:cursor-grabbing w-full h-full block"
      />

      {/* 3. Atmospheric Central Contrast Shield (subtle contrast that preserves particle & beam visibility) */}
      <div className="absolute inset-0 z-[3] pointer-events-none bg-[radial-gradient(ellipse_65%_55%_at_50%_48%,rgba(2,2,5,0.30)_0%,rgba(2,2,5,0.60)_55%,transparent_100%)]" />

      {/* Top Observatory Telemetry Bar */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 font-mono text-[10px] text-white/40">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Crosshair className="w-3.5 h-3.5" />
            TOPOLOGICAL ENGINE v2.6
          </span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="hidden sm:inline">NODES: 32 ACTIVE</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="hidden sm:inline">ACCURACY: 99.8%</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-white/40">
          <Rotate3d className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>DRAG CANVAS TO ROTATE 3D GALAXY</span>
        </div>
      </div>

      {/* Main Editorial Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center my-auto flex flex-col items-center pointer-events-none">
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-[11px] tracking-[0.2em] font-medium uppercase text-cyan-300">
            AI FOR UNDERSTANDING
          </span>
        </motion.div>

        {/* Diagnostic Marker */}
        <div
          data-scene3-debug
          style={{
            position: "absolute",
            top: 90,
            right: 30,
            zIndex: 999,
            padding: "8px 12px",
            background: "#00D4FF",
            color: "#000",
            fontWeight: 700
          }}
        >
          SCENE 3 VERIFIED
        </div>

        {/* Hero Headline with Shimmering Gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-sans text-5xl sm:text-7xl lg:text-[5.5rem] font-black tracking-[-0.045em] text-white leading-[1.01] mb-5 text-balance max-w-3xl"
        >
          Turn your syllabus <br />
          into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400">constellation.</span>
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto font-light leading-relaxed mb-8 text-balance"
        >
          GuruKul AI maps what you need to learn, shows how everything connects, and makes every answer traceable to its source.
        </motion.p>

        {/* Interactive Topic Synthesizer Dock (Awwwards Micro-Interaction) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="pointer-events-auto mb-8 p-1.5 glass-panel rounded-full border border-white/[0.1] shadow-2xl flex flex-wrap items-center justify-center gap-1.5 max-w-2xl mx-auto"
        >
          <span className="font-mono text-[9px] text-white/40 tracking-widest uppercase pl-3 pr-2 hidden sm:inline">
            SELECT FOCUS TOPIC:
          </span>
          {PRESET_TOPICS.map((topic) => {
            const isActive = activeTopicId === topic.id
            return (
              <button
                key={topic.id}
                onClick={() => handleSelectPreset(topic.id)}
                className={`px-3.5 py-1.5 rounded-full font-mono text-[11px] transition-all duration-300 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-400 text-black font-semibold shadow-[0_0_18px_rgba(6,182,212,0.5)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Zap className={`w-3 h-3 ${isActive ? 'text-black' : 'text-cyan-400'}`} />
                <span>{topic.label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="pointer-events-auto flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
        >
          <button
            onClick={() => {
              soundEngine.playNodeSelect()
              onOpenUploadModal()
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-mono text-xs tracking-wider uppercase font-semibold hover:bg-cyan-300 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.18)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-cyan-600 transition-transform group-hover:scale-110" />
            <span>Explore your syllabus</span>
          </button>

          <a
            href="#syllabus-reveal"
            onClick={() => soundEngine.playHover()}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full glass-panel text-white/80 hover:text-white font-mono text-xs tracking-wider uppercase border border-white/[0.12] hover:border-cyan-500/50 hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>See how it works</span>
          </a>
        </motion.div>
      </div>

      {/* Floating Holographic Inspection Card (bottom-left / bottom-right) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-12 right-6 sm:right-10 z-30 w-80 glass-panel p-5 rounded-2xl border border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-left hidden lg:block"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08] mb-3">
              <span className="font-mono text-[9px] tracking-widest text-cyan-400 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                HOLOGRAPHIC DOSSIER
              </span>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {selectedNode.category}
              </span>
            </div>

            <div className="text-[10px] font-mono text-white/40 mb-1">{selectedNode.syllabusUnit}</div>
            <h4 className="font-sans text-base font-bold text-white mb-1.5">{selectedNode.label}</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3 font-light">{selectedNode.description}</p>

            {selectedNode.formula && (
              <div className="p-2 rounded bg-black/60 border border-white/[0.08] font-mono text-[11px] text-cyan-300 mb-3 overflow-x-auto">
                {selectedNode.formula}
              </div>
            )}

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>PREREQUISITES: {selectedNode.prerequisites.length}</span>
              <span className="text-emerald-400">GROUNDED VERIFIED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Scroll Indicator */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center mt-auto pointer-events-none">
        <span className="font-mono text-[8px] tracking-[0.25em] text-white/40 uppercase mb-2">
          SCROLL TO EXPLORE
        </span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-cyan-400/80 via-white/30 to-transparent animate-pulse" />
      </div>
    </section>
  )
}
export default HeroConstellation
