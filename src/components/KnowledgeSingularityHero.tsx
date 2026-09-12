import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowRight, Compass } from 'lucide-react'
import { BlackHole } from './ui/black-hole'
import { LiquidButton } from './ui/liquid-glass-button'
import { ParticleBackground } from './ui/particle-background'
import { soundEngine } from '../lib/audio-engine'

interface KnowledgeSingularityHeroProps {
  onOpenUploadModal: () => void
}

interface ConstellationNode {
  id: string
  label: string
  category: string
  x: number
  y: number
  size: number
  isAnchorDefault: boolean
  phase: 1 | 2
}

// Strictly curated academic nodes with Art-Directed Exclusion Zone
// Protected Left Editorial Zone (x: 0..48, y: 22..68) has ZERO nodes
const CONSTELLATION_NODES: ConstellationNode[] = [
  // Phase 1 Foundational Core Nodes (Emerge in Transformation pause 38%-56% scroll)
  { id: 'functions', label: 'Functions', category: 'CALCULUS', x: 56, y: 38, size: 4.8, isAnchorDefault: true, phase: 1 },
  { id: 'limits', label: 'Limits', category: 'CALCULUS', x: 65, y: 30, size: 5.0, isAnchorDefault: true, phase: 1 },
  { id: 'derivatives', label: 'Derivatives', category: 'CALCULUS', x: 76, y: 26, size: 5.2, isAnchorDefault: true, phase: 1 },
  { id: 'vectors', label: 'Vectors', category: 'LINEAR ALGEBRA', x: 80, y: 46, size: 5.0, isAnchorDefault: true, phase: 1 },
  { id: 'matrices', label: 'Matrices', category: 'LINEAR ALGEBRA', x: 86, y: 58, size: 4.8, isAnchorDefault: true, phase: 1 },

  // Phase 2 Expansion Nodes (Blossom 56%-78% scroll)
  { id: 'chain-rule', label: 'Chain Rule', category: 'CALCULUS', x: 86, y: 34, size: 3.8, isAnchorDefault: false, phase: 2 },
  { id: 'integrals', label: 'Integrals', category: 'CALCULUS', x: 62, y: 50, size: 4.0, isAnchorDefault: false, phase: 2 },
  { id: 'probability', label: 'Probability', category: 'PROBABILITY', x: 58, y: 66, size: 4.0, isAnchorDefault: false, phase: 2 },
  { id: 'bayes', label: "Bayes' Law", category: 'PROBABILITY', x: 68, y: 76, size: 4.8, isAnchorDefault: true, phase: 2 },
  { id: 'attention', label: 'Attention', category: 'MACHINE LEARNING', x: 82, y: 74, size: 5.0, isAnchorDefault: true, phase: 2 },
]

const CONSTELLATION_EDGES = [
  // Phase 1 Core Connections
  { s: 'functions', t: 'limits', phase: 1 },
  { s: 'limits', t: 'derivatives', phase: 1 },
  { s: 'derivatives', t: 'vectors', phase: 1 },
  { s: 'vectors', t: 'matrices', phase: 1 },

  // Phase 2 Expansion Connections
  { s: 'derivatives', t: 'chain-rule', phase: 2 },
  { s: 'functions', t: 'integrals', phase: 2 },
  { s: 'integrals', t: 'probability', phase: 2 },
  { s: 'probability', t: 'bayes', phase: 2 },
  { s: 'matrices', t: 'attention', phase: 2 },
  { s: 'bayes', t: 'attention', phase: 2 },
  { s: 'vectors', t: 'attention', phase: 2 },
]

export const KnowledgeSingularityHero: React.FC<KnowledgeSingularityHeroProps> = ({
  onOpenUploadModal,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false })
  const prefersReduced = useReducedMotion()
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  // Master Normalized Scroll Tracking: 0 to 1 across the 220vh stage
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // =========================================================================
  // ARCHITECTURAL SCROLL TIMELINE CHOREOGRAPHY
  // 0.00 -> 0.22: Scene 1 Opening
  // 0.22 -> 0.38: Scene 1 Exit (vis: hidden at >= 0.38)
  // 0.38 -> 0.56: Transformation Pause (particles stream, core nodes appear)
  // 0.56 -> 0.78: Scene 2 Reveal (secondary nodes blossom, copy enters)
  // 0.78 -> 0.94: Scene 2 Stable State (clear focus, readable, calm)
  // 0.94 -> 1.00: Release to Next Section (gentle dissolve to #020304)
  // =========================================================================

  // 1. Black Hole Shader Transforms
  const blackHoleIntensity = useTransform(scrollYProgress, [0, 0.38, 0.56, 0.78, 0.94, 1.0], [1.0, 0.95, 0.85, 0.38, 0.20, 0])
  const blackHoleOpacity = useTransform(scrollYProgress, [0, 0.78, 0.94, 1.0], [1.0, 0.85, 0.35, 0])
  const blackHoleScale = useTransform(scrollYProgress, [0, 0.38, 0.78, 1.0], [1.0, 0.98, 0.92, 0.88])
  const blackHoleX = useTransform(scrollYProgress, [0, 0.38, 0.78], ['0vw', '1.5vw', '3vw'])

  // 2. SCENE 1: "Knowledge has gravity." (0.00 -> 0.22 hold, 0.22 -> 0.38 exit)
  // At >= 0.38, visibility is strictly hidden to guarantee zero ghost text!
  const scene1Opacity = useTransform(scrollYProgress, [0.22, 0.38], [1, 0])
  const scene1Y = useTransform(scrollYProgress, [0.22, 0.38], [0, -30])
  const scene1Blur = useTransform(scrollYProgress, [0.22, 0.38], ['blur(0px)', 'blur(8px)'])
  const scene1Visibility = useTransform(scrollYProgress, (v) => (v < 0.38 ? 'visible' : 'hidden'))

  // 3. TRANSFORMATION INTERVAL (0.38 -> 0.56)
  // Escaping particles from singularity center-rightwards during visual pause
  const driftParticlesOpacity = useTransform(scrollYProgress, [0.38, 0.47, 0.56], [0, 1.0, 0.15])

  // 4. CONSTELLATION EMERGENCE
  // Phase 1 Foundational Core (0.40 -> 0.54)
  const phase1Opacity = useTransform(scrollYProgress, [0.40, 0.54], [0, 1])
  // Phase 2 Expansion (0.58 -> 0.74)
  const phase2Opacity = useTransform(scrollYProgress, [0.58, 0.74], [0, 1])

  // 5. SCENE 2: "Your syllabus, made visible." (0.58 -> 0.76 reveal, 0.78 -> 0.94 stable)
  const scene2Opacity = useTransform(scrollYProgress, [0.58, 0.76], [0, 1])
  const scene2Y = useTransform(scrollYProgress, [0.58, 0.76], [24, 0])
  const scene2Blur = useTransform(scrollYProgress, [0.58, 0.76], ['blur(8px)', 'blur(0px)'])
  const scene2Visibility = useTransform(scrollYProgress, (v) => (v >= 0.56 && v <= 0.96 ? 'visible' : 'hidden'))

  // 6. EXIT TO WEBSITE (0.94 -> 1.00)
  const stageOpacity = useTransform(scrollYProgress, [0.94, 1.00], [1, 0])
  const stageY = useTransform(scrollYProgress, [0.94, 1.00], [0, -25])

  // Initial Scroll Indicator (0.00 -> 0.14)
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0])

  const bhCenter: [number, number] = isMobile ? [0.50, 0.62] : [0.70, 0.48]

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[220vh] bg-[#020304] text-[#F5F5F2] select-none"
    >
      {/* Sticky 100svh Viewport Container */}
      <motion.div
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          mouseRef.current.x = e.clientX - rect.left
          mouseRef.current.y = e.clientY - rect.top
          mouseRef.current.active = true
        }}
        onPointerLeave={() => {
          mouseRef.current.active = false
          mouseRef.current.x = -9999
          mouseRef.current.y = -9999
        }}
        style={{
          opacity: stageOpacity,
          y: prefersReduced ? 0 : stageY,
        }}
        className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between"
      >
        {/* ============================================================ */}
        {/* LAYER 0: ATMOSPHERIC PARTICLE CANVAS (Deepest Background)    */}
        {/* ============================================================ */}
        <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
          <ParticleBackground
            blackHoleCenter={bhCenter}
            density="sparse"
            mouseRef={mouseRef}
            className="w-full h-full"
          />
        </div>

        {/* ============================================================ */}
        {/* LAYER 1: BLACK HOLE SHADER (Full Viewport Overscan, No Clip) */}
        {/* ============================================================ */}
        <motion.div
          style={{
            opacity: prefersReduced ? 0.35 : blackHoleOpacity,
            scale: prefersReduced ? 1 : blackHoleScale,
            x: prefersReduced ? 0 : blackHoleX,
          }}
          className="absolute inset-0 z-10 pointer-events-none w-full h-full"
        >
          <BlackHole
            center={bhCenter}
            intensity={blackHoleIntensity}
            className="w-full h-full"
          />
        </motion.div>

        {/* ============================================================ */}
        {/* LAYER 2: SUBTLE COORDINATE AXIS LINE                         */}
        {/* ============================================================ */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.04]">
          <div className="absolute top-0 bottom-0 left-[70%] w-[1px] bg-white hidden md:block" />
        </div>

        {/* ============================================================ */}
        {/* LAYER 3: CONSTELLATION GRAPH (Protected Exclusion Zone)      */}
        {/* ============================================================ */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <svg
            className="w-full h-full max-w-[1440px] mx-auto overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="hero-node-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Escaping particles during Transformation Pause (Scroll 0.38 -> 0.56) */}
            <motion.g style={{ opacity: driftParticlesOpacity }}>
              <circle cx="68" cy="48" r="0.6" fill="#e8fbff" filter="url(#hero-node-glow)" />
              <circle cx="64" cy="52" r="0.5" fill="#8edff2" />
              <circle cx="75" cy="44" r="0.45" fill="#36b7df" />
              <circle cx="72" cy="60" r="0.5" fill="#8edff2" />
              <circle cx="78" cy="36" r="0.4" fill="#e8fbff" />
              <circle cx="82" cy="50" r="0.45" fill="#8edff2" />
            </motion.g>

            {/* Phase 1 Edges */}
            <motion.g style={{ opacity: phase1Opacity }}>
              {CONSTELLATION_EDGES.filter((e) => e.phase === 1).map((edge) => {
                const source = CONSTELLATION_NODES.find((n) => n.id === edge.s)
                const target = CONSTELLATION_NODES.find((n) => n.id === edge.t)
                if (!source || !target) return null
                return (
                  <line
                    key={`${edge.s}-${edge.t}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="rgba(232, 251, 255, 0.28)"
                    strokeWidth="0.25"
                    strokeDasharray="0.8 0.8"
                  />
                )
              })}
            </motion.g>

            {/* Phase 2 Edges */}
            <motion.g style={{ opacity: phase2Opacity }}>
              {CONSTELLATION_EDGES.filter((e) => e.phase === 2).map((edge) => {
                const source = CONSTELLATION_NODES.find((n) => n.id === edge.s)
                const target = CONSTELLATION_NODES.find((n) => n.id === edge.t)
                if (!source || !target) return null
                return (
                  <line
                    key={`${edge.s}-${edge.t}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="rgba(142, 223, 242, 0.18)"
                    strokeWidth="0.2"
                  />
                )
              })}
            </motion.g>

            {/* Phase 1 Nodes */}
            <motion.g style={{ opacity: phase1Opacity }}>
              {CONSTELLATION_NODES.filter((n) => n.phase === 1).map((node) => {
                const isHovered = hoveredNodeId === node.id
                return (
                  <g
                    key={node.id}
                    className="pointer-events-auto cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredNodeId(node.id)
                      soundEngine.playHover()
                    }}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => soundEngine.playNodeSelect()}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size * 0.25}
                      fill={isHovered ? '#69DDF5' : '#e8fbff'}
                      filter="url(#hero-node-glow)"
                    />
                    <text
                      x={node.x}
                      y={node.y + node.size * 0.25 + 2.0}
                      textAnchor="middle"
                      fill="rgba(245, 245, 242, 0.75)"
                      fontSize="1.05"
                      fontFamily="var(--font-mono)"
                      letterSpacing="0.08em"
                      className="pointer-events-none select-none uppercase"
                    >
                      {node.label}
                    </text>
                  </g>
                )
              })}
            </motion.g>

            {/* Phase 2 Nodes (Strictly 3-5 labels default, dots for rest) */}
            <motion.g style={{ opacity: phase2Opacity }}>
              {CONSTELLATION_NODES.filter((n) => n.phase === 2).map((node) => {
                const isHovered = hoveredNodeId === node.id
                const showLabel = node.isAnchorDefault || isHovered

                return (
                  <g
                    key={node.id}
                    className="pointer-events-auto cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredNodeId(node.id)
                      soundEngine.playHover()
                    }}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => soundEngine.playNodeSelect()}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isHovered ? node.size * 0.35 : node.size * 0.22}
                      fill={isHovered ? '#69DDF5' : node.isAnchorDefault ? '#e8fbff' : 'rgba(142, 223, 242, 0.45)'}
                      filter={isHovered ? 'url(#hero-node-glow)' : undefined}
                      className="transition-all duration-200"
                    />

                    {showLabel && (
                      <text
                        x={node.x}
                        y={node.y + node.size * 0.25 + 2.0}
                        textAnchor="middle"
                        fill={isHovered ? '#69DDF5' : 'rgba(245, 245, 242, 0.65)'}
                        fontSize="0.95"
                        fontFamily="var(--font-mono)"
                        letterSpacing="0.08em"
                        className="pointer-events-none select-none uppercase transition-colors duration-200"
                      >
                        {node.label}
                      </text>
                    )}
                  </g>
                )
              })}
            </motion.g>
          </svg>
        </div>

        {/* ============================================================ */}
        {/* LAYER 4: SCENE 1 ("Knowledge has gravity.") (0.00 -> 0.34)   */}
        {/* 100% GONE at 0.34: visibility: hidden, zero ghost text!      */}
        {/* ============================================================ */}
        <motion.div
          style={{
            opacity: scene1Opacity,
            y: prefersReduced ? 0 : scene1Y,
            filter: scene1Blur,
            visibility: scene1Visibility as any,
          }}
          className="absolute z-30 left-0 top-[30vh] sm:top-[34vh] w-full px-8 sm:px-12 md:pl-[8vw] md:pr-0 flex flex-col items-start pointer-events-none"
        >
          <div className="max-w-[540px]">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mb-5 sm:mb-6 font-mono text-[11px] sm:text-xs tracking-[0.22em] text-[#F5F5F2]/50 uppercase"
            >
              GURUKUL AI / KNOWLEDGE SYSTEM
            </motion.div>

            {/* Headline: Exactly 2 lines */}
            <motion.h1
              initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(56px, 7.0vw, 112px)',
                lineHeight: 0.91,
                letterSpacing: '-0.055em',
              }}
              className="font-sans font-semibold text-[#F5F5F2] mb-6 sm:mb-7 select-none"
            >
              Knowledge<br />has gravity.
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-[16px] sm:text-[18px] text-[rgba(245,245,242,0.55)] max-w-[420px] font-normal leading-[1.58] mb-8 sm:mb-9 text-balance"
            >
              Your syllabus isn&apos;t a list. It&apos;s a map waiting to be discovered.
            </motion.p>

            {/* Primary Action with LiquidButton */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-7 sm:gap-8 mt-1"
            >
              <LiquidButton
                onClick={() => {
                  soundEngine.playNodeSelect()
                  onOpenUploadModal()
                }}
                arrow
                className="cursor-pointer"
              >
                <span>Explore the system</span>
              </LiquidButton>

              <a
                href="#syllabus-reveal"
                onClick={() => soundEngine.playHover()}
                className="font-mono text-xs tracking-wider uppercase text-white/40 hover:text-white/80 transition-colors cursor-pointer hidden sm:inline"
              >
                How it works
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* LAYER 5: SCENE 2 ("Your syllabus, made visible.") (0.68->0.94) */}
        {/* Enters ONLY at 0.68 (34% after Scene 1 is gone), exits at 0.94 */}
        {/* ============================================================ */}
        <motion.div
          style={{
            opacity: scene2Opacity,
            y: prefersReduced ? 0 : scene2Y,
            filter: scene2Blur,
            visibility: scene2Visibility as any,
          }}
          className="absolute z-30 left-0 top-[30vh] sm:top-[34vh] w-full px-8 sm:px-12 md:pl-[8vw] md:pr-0 flex flex-col items-start pointer-events-none"
        >
          <div className="max-w-[540px]">
            {/* Eyebrow */}
            <div className="font-mono text-[11px] tracking-[0.25em] text-[#69DDF5]/80 uppercase mb-5 sm:mb-6">
              STRUCTURE REVEALED
            </div>

            {/* Headline */}
            <h2
              style={{
                fontSize: 'clamp(52px, 6.5vw, 104px)',
                lineHeight: 0.93,
                letterSpacing: '-0.05em',
              }}
              className="font-sans font-semibold text-[#F5F5F2] mb-6 sm:mb-7 select-none text-balance"
            >
              Your syllabus,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F5F2] to-[#69DDF5]">
                made visible.
              </span>
            </h2>

            {/* Supporting Sentence */}
            <p className="font-sans text-[16px] sm:text-[18px] text-[rgba(245,245,242,0.6)] max-w-[440px] font-normal leading-relaxed mb-8 sm:mb-9 text-balance">
              GuruKul maps what you need to learn, shows how everything connects, and makes every answer traceable to its source.
            </p>

            {/* Action CTAs */}
            <div className="pointer-events-auto flex items-center gap-6">
              <LiquidButton
                onClick={() => {
                  soundEngine.playNodeSelect()
                  onOpenUploadModal()
                }}
                arrow
                className="cursor-pointer"
              >
                <span>Explore your syllabus</span>
              </LiquidButton>

              <a
                href="#syllabus-reveal"
                onClick={() => soundEngine.playHover()}
                className="font-mono text-xs tracking-wider uppercase text-white/40 hover:text-white/80 transition-colors cursor-pointer hidden sm:inline"
              >
                <Compass className="w-3.5 h-3.5 inline-block mr-1 text-[#69DDF5]" />
                How it works
              </a>
            </div>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* LAYER 6: TINY SCROLL INDICATOR (Bottom Viewport 1)           */}
        {/* ============================================================ */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-8 sm:bottom-10 left-8 sm:left-12 md:left-[8vw] z-30 flex items-center gap-3 pointer-events-none"
        >
          <div className="w-[1px] h-5 bg-white/25 animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.18em] text-white/35 uppercase">
            SCROLL TO DISCOVER
          </span>
        </motion.div>

      </motion.div>
    </section>
  )
}

export default KnowledgeSingularityHero
