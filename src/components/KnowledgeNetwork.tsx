import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Network, Link2, GitFork, Milestone, Sparkles } from 'lucide-react'
import { soundEngine } from '../lib/audio-engine'

const CONNECTION_TYPES = [
  {
    type: 'prerequisite',
    label: 'PREREQUISITE',
    color: '#06b6d4',
    desc: 'Strict foundational dependency. You cannot grasp the target without mastering this root.',
    icon: Link2,
    badge: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
  },
  {
    type: 'concept',
    label: 'CONCEPTUAL SIBLING',
    color: '#10b981',
    desc: 'Parallel intuition. Understanding one provides immediate analogical leverage over the other.',
    icon: GitFork,
    badge: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
  },
  {
    type: 'application',
    label: 'PRACTICAL APPLICATION',
    color: '#a855f7',
    desc: 'Real-world manifestation. How abstract theorem drives algorithms like Backprop or SVD.',
    icon: Milestone,
    badge: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
  },
  {
    type: 'mastery',
    label: 'MASTERY SYNTHESIS',
    color: '#f59e0b',
    desc: 'Unified comprehension where disparate topics lock together into lasting mental models.',
    icon: Sparkles,
    badge: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
  },
]

export const KnowledgeNetwork: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % CONNECTION_TYPES.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-[90vh] w-full bg-[#020205] py-28 px-6 sm:px-8 border-t border-white/[0.05] overflow-hidden flex flex-col items-center justify-center">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-cyan-950/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-purple-950/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Editorial Text */}
        <div className="lg:col-span-6 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.02] text-white/60 font-mono text-[11px] tracking-widest uppercase mb-6">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>KNOWLEDGE TOPOLOGY</span>
          </div>

          <h2 className="font-editorial text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-8 text-balance">
            Nothing worth <br className="hidden sm:inline" />
            learning <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
              exists alone.
            </span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg font-light leading-relaxed mb-8 max-w-lg">
            Traditional education treats learning as an isolated checklist of chapters. GuruKul treats it as an ecosystem of dependencies. When you hit a wall, you don’t re-read the chapter—you trace backwards to the root intuition that broke down.
          </p>

          {/* Interactive Connection Selector */}
          <div className="w-full space-y-3">
            {CONNECTION_TYPES.map((item, idx) => {
              const isCurrent = activeStep === idx
              const Icon = item.icon
              return (
                <div
                  key={item.type}
                  onClick={() => {
                    setActiveStep(idx)
                    soundEngine.playHover()
                  }}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'glass-panel border-cyan-500/40 bg-cyan-950/20 shadow-[0_10px_25px_rgba(0,0,0,0.6)]'
                      : 'border-white/[0.06] bg-transparent hover:border-white/[0.15] hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2 h-2 rounded-full transition-transform"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-mono text-xs font-semibold text-white tracking-wider">
                        {item.label}
                      </span>
                    </div>
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${item.badge}`}>
                      VECTOR TYPE 0{idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-light pl-4.5">
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Dynamic Connected Topology Visualizer */}
        <div className="lg:col-span-6 relative w-full h-[460px] sm:h-[520px] rounded-2xl glass-panel border border-white/[0.08] p-6 flex items-center justify-center overflow-hidden shadow-2xl">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <filter id="net-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Pulsing Central Hub */}
            <circle cx="50" cy="50" r="14" fill="rgba(6, 182, 212, 0.05)" className="animate-pulse" />
            <circle cx="50" cy="50" r="8" fill="rgba(6, 182, 212, 0.1)" />

            {/* Dynamic Connecting Lines */}
            <motion.line
              x1="50"
              y1="50"
              x2="22"
              y2="28"
              stroke="#06b6d4"
              strokeWidth={activeStep === 0 ? '1.2' : '0.4'}
              strokeDasharray={activeStep === 0 ? undefined : '1 1'}
              filter="url(#net-glow)"
              transition={{ duration: 0.4 }}
            />
            <motion.line
              x1="50"
              y1="50"
              x2="78"
              y2="26"
              stroke="#10b981"
              strokeWidth={activeStep === 1 ? '1.2' : '0.4'}
              strokeDasharray={activeStep === 1 ? undefined : '1 1'}
              filter="url(#net-glow)"
              transition={{ duration: 0.4 }}
            />
            <motion.line
              x1="50"
              y1="50"
              x2="74"
              y2="75"
              stroke="#a855f7"
              strokeWidth={activeStep === 2 ? '1.2' : '0.4'}
              strokeDasharray={activeStep === 2 ? undefined : '1 1'}
              filter="url(#net-glow)"
              transition={{ duration: 0.4 }}
            />
            <motion.line
              x1="50"
              y1="50"
              x2="26"
              y2="76"
              stroke="#f59e0b"
              strokeWidth={activeStep === 3 ? '1.2' : '0.4'}
              strokeDasharray={activeStep === 3 ? undefined : '1 1'}
              filter="url(#net-glow)"
              transition={{ duration: 0.4 }}
            />

            {/* Orbiting Nodes */}
            {/* Center Node: Target Mastery Concept */}
            <g transform="translate(50, 50)">
              <circle r="4" fill="#ffffff" filter="url(#net-glow)" />
              <text y="8" textAnchor="middle" fill="#ffffff" fontSize="1.8" fontFamily="var(--font-mono)">
                CHAIN RULE
              </text>
            </g>

            {/* Node 1: Prerequisite */}
            <g transform="translate(22, 28)">
              <circle r="3" fill="#06b6d4" filter="url(#net-glow)" />
              <text y="7" textAnchor="middle" fill="#06b6d4" fontSize="1.6" fontFamily="var(--font-mono)">
                LIMITS
              </text>
              <text y="10" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="1.2" fontFamily="var(--font-mono)">
                [PREREQUISITE]
              </text>
            </g>

            {/* Node 2: Concept Sibling */}
            <g transform="translate(78, 26)">
              <circle r="3.2" fill="#10b981" filter="url(#net-glow)" />
              <text y="7" textAnchor="middle" fill="#10b981" fontSize="1.6" fontFamily="var(--font-mono)">
                PARTIAL DERIVATIVES
              </text>
              <text y="10" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="1.2" fontFamily="var(--font-mono)">
                [SIBLING]
              </text>
            </g>

            {/* Node 3: Application */}
            <g transform="translate(74, 75)">
              <circle r="3.5" fill="#a855f7" filter="url(#net-glow)" />
              <text y="7" textAnchor="middle" fill="#a855f7" fontSize="1.6" fontFamily="var(--font-mono)">
                BACKPROPAGATION
              </text>
              <text y="10" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="1.2" fontFamily="var(--font-mono)">
                [APPLICATION]
              </text>
            </g>

            {/* Node 4: Mastery */}
            <g transform="translate(26, 76)">
              <circle r="3" fill="#f59e0b" filter="url(#net-glow)" />
              <text y="7" textAnchor="middle" fill="#f59e0b" fontSize="1.6" fontFamily="var(--font-mono)">
                GRADIENT DESCENT
              </text>
              <text y="10" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="1.2" fontFamily="var(--font-mono)">
                [SYNTHESIS]
              </text>
            </g>
          </svg>

          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[10px] font-mono text-white/40 border-t border-white/[0.06] pt-2">
            <span>DIRECTED ACYCLIC GRAPH (DAG)</span>
            <span className="text-cyan-400">STATUS: RELATIONAL INTEGRITY VERIFIED</span>
          </div>
        </div>
      </div>
    </section>
  )
}
export default KnowledgeNetwork
