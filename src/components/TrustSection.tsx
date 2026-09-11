import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, FileCheck, Search, Eye } from 'lucide-react'
import { soundEngine } from '../lib/audio-engine'

const PILLARS = [
  {
    num: '01',
    headline: 'Grounded in your syllabus.',
    sub: 'Not generic internet summaries. GuruKul parses your university department’s exact syllabus PDF, lecture slides, and professor problem sets into a deterministic vector database.',
    metric: '100% CURRICULUM BOUND',
    icon: FileCheck,
  },
  {
    num: '02',
    headline: 'Every answer has a source.',
    sub: 'No conversational hallucinations. Every explanation generated illuminates the exact source node, chapter subsection, and underlying theorem formula.',
    metric: 'ZERO BLACK-BOX INFERENCE',
    icon: Search,
  },
  {
    num: '03',
    headline: 'Your progress stays visible.',
    sub: 'Traditional notes lie in abandoned notebooks. Your knowledge constellation persists in real-time, highlighting mastered branches and alerting you to decaying concepts before finals.',
    metric: 'TOPOLOGICAL RETENTION ENGINE',
    icon: Eye,
  },
]

export const TrustSection: React.FC = () => {
  const [activePillar, setActivePillar] = useState<number>(1)

  return (
    <section className="relative w-full bg-[#020205] py-28 px-4 sm:px-8 border-t border-white/[0.05] overflow-hidden flex flex-col items-center justify-center">
      <div className="max-w-6xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.02] text-white/60 font-mono text-[10px] tracking-widest uppercase mb-4">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>RIGOROUS PROOF OF WORK</span>
          </div>

          <h2 className="font-editorial text-4xl sm:text-7xl font-bold text-white tracking-tight leading-tight">
            AI should show <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
              its work.
            </span>
          </h2>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p, idx) => {
            const isHovered = activePillar === idx
            const Icon = p.icon

            return (
              <div
                key={p.num}
                onMouseEnter={() => {
                  setActivePillar(idx)
                  soundEngine.playHover()
                }}
                className={`p-8 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isHovered
                    ? 'glass-panel border-cyan-500/40 bg-cyan-950/20 shadow-[0_15px_35px_rgba(0,0,0,0.6)]'
                    : 'glass-panel-subtle border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
                    <span className="font-mono text-sm font-bold text-cyan-400">{p.num}</span>
                    <Icon className="w-4 h-4 text-white/40" />
                  </div>

                  <h3 className="font-editorial text-2xl font-bold text-white mb-3">
                    {p.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                    {p.sub}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.06] font-mono text-[10px] text-cyan-300 tracking-wider">
                  {p.metric}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
export default TrustSection
