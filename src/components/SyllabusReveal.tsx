import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Sparkles, ArrowRight, RefreshCw, CheckCircle2, Zap } from 'lucide-react'
import { soundEngine } from '../lib/audio-engine'

const PHASES = [
  { id: 1, name: 'Static Document', subtitle: 'Standard flat PDF syllabus' },
  { id: 2, name: 'Dissolving Text', subtitle: 'Deconstructing linear bullets into particles' },
  { id: 3, name: 'Vector Scattering', subtitle: 'Topic particles dispersing into space' },
  { id: 4, name: 'Node Clustering', subtitle: 'Concepts coalescing into semantic anchors' },
  { id: 5, name: 'Edge Synthesis', subtitle: 'Prerequisite dependencies drawing themselves' },
  { id: 6, name: 'Knowledge Constellation', subtitle: 'Living topological graph locked into place' },
]

export const SyllabusReveal: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<number>(1)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const sectionRef = useRef<HTMLElement | null>(null)

  // Auto progression with pause/play
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setCurrentPhase((prev) => {
        const next = prev < 6 ? prev + 1 : 1
        if (next === 6) soundEngine.playSourceFlare()
        else soundEngine.playTracePulse(next * 0.25)
        return next
      })
    }, 4200)

    return () => clearInterval(timer)
  }, [isPlaying])

  const setPhase = (phase: number) => {
    setIsPlaying(false)
    setCurrentPhase(phase)
    if (phase === 6) soundEngine.playSourceFlare()
    else soundEngine.playTracePulse(phase * 0.25)
  }

  return (
    <section
      id="syllabus-reveal"
      ref={sectionRef}
      className="relative min-h-screen w-full bg-[#020205] py-28 px-6 sm:px-8 flex flex-col items-center justify-center overflow-hidden border-t border-white/[0.05]"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 cosmic-grain opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-cyan-900/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 font-mono text-[10px] tracking-widest uppercase mb-4">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>THE TRANSFORMATION MECHANIC</span>
        </div>
        <h2 className="font-editorial text-4xl sm:text-6xl font-bold text-white tracking-tight mb-4">
          Same syllabus. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-400">
            Different way of seeing it.
          </span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-light">
          A syllabus is not a 12-page checklist to suffer through. It is an interconnected constellation of ideas waiting to be unlocked.
        </p>

        {/* Interactive Phase Scrubber / Controller */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 glass-panel rounded-full max-w-2xl mx-auto border border-white/[0.08]">
          {PHASES.map((p) => {
            const isActive = currentPhase === p.id
            return (
              <button
                key={p.id}
                onClick={() => setPhase(p.id)}
                className={`px-3.5 py-1.5 rounded-full font-mono text-[11px] transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400' : 'bg-white/20'}`} />
                <span>0{p.id}</span>
                <span className="hidden sm:inline text-[10px] opacity-80">{p.name}</span>
              </button>
            )
          })}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause auto-cycle' : 'Auto-play sequence'}
            className="px-2.5 py-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isPlaying ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Transformation Stage */}
      <div className="relative w-full max-w-4xl h-[480px] sm:h-[520px] rounded-2xl glass-panel border border-white/[0.08] overflow-hidden flex items-center justify-center p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {/* Stage watermark telemetry */}
        <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-[10px] font-mono text-white/30 border-b border-white/[0.06] pb-2 z-20">
          <span className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-cyan-400" />
            SYNTHESIS ENGINE • STAGE {currentPhase} OF 6
          </span>
          <span className="uppercase tracking-widest text-cyan-300">
            {PHASES[currentPhase - 1].subtitle}
          </span>
        </div>

        {/* TRANSFORMATION PHASES */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* PHASE 1: Flat clinical syllabus paper */}
          {currentPhase === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl bg-[#090b10] border border-white/[0.12] rounded-lg p-6 sm:p-8 font-mono text-left shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2 text-white/70 text-xs">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-200">SYLLABUS_ENG_MATH_IV.PDF</span>
                </div>
                <span className="text-[10px] text-white/30">PAGE 1 OF 14 • STATIC</span>
              </div>

              <div className="space-y-4 text-xs text-white/60">
                <div>
                  <h4 className="text-white font-bold tracking-wider text-[11px] mb-1">
                    UNIT I: LIMITS, CONTINUITY &amp; DERIVATIVES
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1.1 Epsilon-delta definition of limits, one-sided limits, continuity criteria, IVT. <br />
                    1.2 First principles differentiation, product rule, quotient rule, chain rule.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold tracking-wider text-[11px] mb-1">
                    UNIT II: MULTIVARIABLE CALCULUS &amp; OPTIMIZATION
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    2.1 Functions of several variables, partial derivatives, directional derivatives, gradient vectors. <br />
                    2.2 Hessian matrix, unconstrained optimization, Lagrange multipliers.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold tracking-wider text-[11px] mb-1">
                    UNIT III: INTEGRATION &amp; DIFFERENTIAL EQUATIONS
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    3.1 Riemann sums, Fundamental Theorem of Calculus, Ordinary Differential Equations (ODEs).
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-white/40">
                <span>FORMAT: LINEAR MONOCHROME TEXT</span>
                <span className="text-rose-400/80">NO RELATIONSHIP LINKS DETECTED</span>
              </div>
            </motion.div>
          )}

          {/* PHASE 2: Text Disintegration into Particles */}
          {currentPhase === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-xl h-72 flex flex-col items-center justify-center text-center relative"
            >
              <div className="text-white/40 font-mono text-sm tracking-widest mb-6 animate-pulse">
                PARSING SYNTAX &amp; VECTORIZING TOKENS...
              </div>

              {/* Particle grid dispersing */}
              <div className="grid grid-cols-8 gap-4 sm:gap-6 p-4">
                {[...Array(32)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, (i % 2 === 0 ? -1 : 1) * (15 + (i % 5) * 8)],
                      x: [0, (i % 3 === 0 ? -1 : 1) * (10 + (i % 4) * 6)],
                      opacity: [0.8, 0.3, 0.9],
                      scale: [1, 1.4, 0.8],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: (i * 0.05) % 0.8,
                    }}
                    className="w-2.5 h-2.5 rounded-full bg-cyan-400/80 shadow-[0_0_10px_#06b6d4]"
                  />
                ))}
              </div>

              <div className="mt-8 font-mono text-xs text-cyan-300/80">
                EXTRACTED 42 SEMANTIC CONCEPT ENTITIES FROM PDF STREAM
              </div>
            </motion.div>
          )}

          {/* PHASE 3: Particles Scattering Outward into Spatial Canvas */}
          {currentPhase === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full relative flex items-center justify-center"
            >
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {[...Array(36)].map((_, i) => {
                  const angle = (i / 36) * Math.PI * 2
                  const dist = 18 + (i % 5) * 6
                  const x = 50 + Math.cos(angle) * dist
                  const y = 50 + Math.sin(angle) * dist

                  return (
                    <motion.g
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 0.9, scale: 1 }}
                      transition={{ duration: 0.8, delay: i * 0.02 }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r="1.2"
                        fill="#06b6d4"
                        className="animate-pulse"
                      />
                      <line
                        x1="50"
                        y1="50"
                        x2={x}
                        y2={y}
                        stroke="rgba(6, 182, 212, 0.15)"
                        strokeWidth="0.3"
                        strokeDasharray="0.8 0.8"
                      />
                    </motion.g>
                  )
                })}
              </svg>
              <div className="absolute font-mono text-[11px] text-cyan-300 bg-[#06080e]/90 px-4 py-2 rounded-full border border-cyan-500/30 shadow-lg">
                SPATIAL PROJECTION IN PROGRESS
              </div>
            </motion.div>
          )}

          {/* PHASE 4: Particles Reorganize into Semantic Node Clusters */}
          {currentPhase === 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full relative flex items-center justify-center"
            >
              <div className="grid grid-cols-3 gap-6 sm:gap-12 w-full max-w-xl text-center">
                <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 mx-auto mb-2 shadow-[0_0_12px_#06b6d4]" />
                  <span className="font-mono text-xs font-bold text-white block">CALCULUS</span>
                  <span className="font-mono text-[10px] text-cyan-300/70">12 Concepts Identified</span>
                </div>

                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 mx-auto mb-2 shadow-[0_0_12px_#10b981]" />
                  <span className="font-mono text-xs font-bold text-white block">LINEAR ALGEBRA</span>
                  <span className="font-mono text-[10px] text-emerald-300/70">10 Concepts Identified</span>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 backdrop-blur">
                  <div className="w-3 h-3 rounded-full bg-amber-400 mx-auto mb-2 shadow-[0_0_12px_#f59e0b]" />
                  <span className="font-mono text-xs font-bold text-white block">OPTIMIZATION</span>
                  <span className="font-mono text-[10px] text-amber-300/70">8 Concepts Identified</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 5: Prerequisite Connections Draw Across Nodes */}
          {currentPhase === 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full relative flex items-center justify-center"
            >
              <svg className="w-full h-full max-w-lg" viewBox="0 0 100 100">
                {/* Simulated edge weaving */}
                <motion.path
                  d="M 20,40 Q 35,20 50,45 T 80,50"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="0.8"
                  strokeDasharray="2 1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.path
                  d="M 25,65 Q 40,80 60,60 T 85,35"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="0.8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
                />
                <circle cx="20" cy="40" r="2" fill="#06b6d4" />
                <circle cx="50" cy="45" r="2.5" fill="#38bdf8" />
                <circle cx="80" cy="50" r="3" fill="#a855f7" />
                <circle cx="25" cy="65" r="2" fill="#10b981" />
                <circle cx="60" cy="60" r="2.5" fill="#f59e0b" />
                <circle cx="85" cy="35" r="3" fill="#38bdf8" />
              </svg>
              <div className="absolute bottom-6 font-mono text-[11px] text-white/60">
                PREREQUISITE RELATIONSHIP GRAPH: 50+ DEPENDENCY EDGES SYNTHESIZED
              </div>
            </motion.div>
          )}

          {/* PHASE 6: Fully Locked Knowledge Constellation */}
          {currentPhase === 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="w-full h-full relative flex flex-col items-center justify-center text-center"
            >
              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-ping opacity-25" />
                <div className="w-48 h-48 rounded-full bg-cyan-500/10 blur-xl absolute" />
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <line x1="20" y1="30" x2="50" y2="50" stroke="#06b6d4" strokeWidth="0.8" />
                  <line x1="50" y1="50" x2="80" y2="35" stroke="#10b981" strokeWidth="0.8" />
                  <line x1="50" y1="50" x2="45" y2="80" stroke="#f59e0b" strokeWidth="0.8" />
                  <line x1="80" y1="35" x2="75" y2="75" stroke="#a855f7" strokeWidth="0.8" />

                  <circle cx="20" cy="30" r="3" fill="#06b6d4" className="shadow-[0_0_15px_#06b6d4]" />
                  <circle cx="50" cy="50" r="4.5" fill="#ffffff" stroke="#06b6d4" strokeWidth="1.2" />
                  <circle cx="80" cy="35" r="3.2" fill="#10b981" />
                  <circle cx="45" cy="80" r="3" fill="#f59e0b" />
                  <circle cx="75" cy="75" r="3.8" fill="#a855f7" />
                </svg>
              </div>

              <div className="mt-4 flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-950/40 px-4 py-1.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                <span>KNOWLEDGE CONSTELLATION ONLINE • ZERO LOSS ENCODING</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
export default SyllabusReveal
