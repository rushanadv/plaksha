import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Compass, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react'
import { GRAPH_NODES, GRAPH_EDGES } from '../lib/graph-data'
import { soundEngine } from '../lib/audio-engine'

const MILESTONES = [
  { id: 'day1', label: 'DAY 01', percent: 12, desc: 'Foundations mapped. Core calculus seeds illuminated.' },
  { id: 'week2', label: 'WEEK 02', percent: 47, desc: 'Differential calculus & linear algebra vectors unlocked.' },
  { id: 'week4', label: 'WEEK 04', percent: 78, desc: 'Multivariable calculus & probability axioms synthesized.' },
  { id: 'final', label: 'EXAM READY', percent: 98, desc: 'Full topological mastery. All prerequisite paths locked.' },
]

export const ProgressConstellation: React.FC = () => {
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<number>(1) // Default to Week 2 (47%)

  const currentMilestone = MILESTONES[activeMilestoneIndex]

  // Subset of nodes for progress display
  const progressNodes = GRAPH_NODES.slice(0, 28)
  const threshold = (currentMilestone.percent / 100) * progressNodes.length

  const handleSelectMilestone = (idx: number) => {
    setActiveMilestoneIndex(idx)
    if (idx === MILESTONES.length - 1) {
      soundEngine.playSourceFlare()
    } else {
      soundEngine.playTracePulse(1 + idx * 0.3)
    }
  }

  return (
    <section
      id="progress"
      className="relative min-h-[90vh] w-full bg-[#020205] py-28 px-4 sm:px-8 border-t border-white/[0.05] overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-950/15 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 font-mono text-[10px] tracking-widest uppercase mb-4">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            <span>MASTERY TOPOGRAPHY</span>
          </div>

          <h2 className="font-editorial text-4xl sm:text-6xl font-bold text-white tracking-tight mb-4">
            Your progress, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
              made visible.
            </span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-light">
            No empty checkboxes. As you study, dormant nodes kindle into radiant beacons of light, mapping your expanding perimeter of knowledge.
          </p>

          {/* Interactive Milestone Scrubber */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 glass-panel rounded-full max-w-xl mx-auto border border-white/[0.08]">
            {MILESTONES.map((m, idx) => {
              const isSelected = activeMilestoneIndex === idx
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMilestone(idx)}
                  className={`px-4 py-2 rounded-full font-mono text-xs transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-cyan-400 text-black font-semibold shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-black' : 'bg-cyan-400/40'
                    }`}
                  />
                  <span>{m.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Constellation Progress Showcase Card */}
        <div className="relative w-full h-[460px] sm:h-[520px] rounded-2xl glass-panel border border-white/[0.08] p-6 sm:p-10 flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Top Telemetry Overlay */}
          <div className="flex items-center justify-between text-xs font-mono text-white/50 border-b border-white/[0.06] pb-3 z-10">
            <span className="flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              CONSTELLATION LUMINANCE LEVEL:
              <span className="text-cyan-300 font-bold text-sm">
                {currentMilestone.percent}%
              </span>
            </span>
            <span className="hidden sm:inline text-white/40">
              {currentMilestone.desc}
            </span>
          </div>

          {/* SVG Constellation with Dynamic Illumination */}
          <div className="relative w-full flex-1 flex items-center justify-center my-4">
            <svg className="w-full h-full max-w-3xl" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <defs>
                <filter id="glow-progress" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Edges */}
              <g className="edges">
                {GRAPH_EDGES.slice(0, 32).map((edge) => {
                  const s = progressNodes.find((n) => n.id === edge.source)
                  const t = progressNodes.find((n) => n.id === edge.target)
                  if (!s || !t) return null

                  const sIdx = progressNodes.indexOf(s)
                  const tIdx = progressNodes.indexOf(t)
                  const isIlluminated = sIdx <= threshold && tIdx <= threshold

                  return (
                    <line
                      key={edge.id}
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={isIlluminated ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)'}
                      strokeWidth={isIlluminated ? 0.7 : 0.25}
                      className="transition-all duration-700"
                    />
                  )
                })}
              </g>

              {/* Nodes */}
              <g className="nodes">
                {progressNodes.map((node, idx) => {
                  const isIlluminated = idx <= threshold

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="transition-all duration-700"
                    >
                      {/* Aura when illuminated */}
                      {isIlluminated && (
                        <circle
                          r="4"
                          fill="rgba(6, 182, 212, 0.25)"
                          filter="url(#glow-progress)"
                          className="animate-pulse-slow"
                        />
                      )}

                      {/* Node core */}
                      <circle
                        r={isIlluminated ? 2.5 : 1.5}
                        fill={isIlluminated ? '#ffffff' : 'rgba(255, 255, 255, 0.2)'}
                        filter={isIlluminated ? 'url(#glow-progress)' : undefined}
                      />

                      {/* Node label */}
                      <text
                        y="4.5"
                        textAnchor="middle"
                        fill={isIlluminated ? '#ffffff' : 'rgba(255, 255, 255, 0.25)'}
                        fontSize="1.2"
                        fontFamily="var(--font-mono)"
                      >
                        {node.label}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>
          </div>

          {/* Bottom Live Metric Bar */}
          <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>ACTIVE SYNAPSE NODES: {Math.round(threshold)} / {progressNodes.length}</span>
            </div>
            <div className="text-cyan-300 font-semibold">
              {currentMilestone.percent}% OF YOUR COURSE EXPLORED
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default ProgressConstellation
