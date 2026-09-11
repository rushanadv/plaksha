import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle2, ArrowRight, Sparkles, Orbit } from 'lucide-react'
import { soundEngine } from '../lib/audio-engine'

interface StudyStep {
  id: string
  num: string
  title: string
  category: string
  status: 'completed' | 'in-progress' | 'upcoming'
  nodeId: string
  reason: string
}

const STEPS: StudyStep[] = [
  {
    id: 's1',
    num: '01',
    title: 'Review Limits & Continuity',
    category: 'CALCULUS FOUNDATIONS',
    status: 'completed',
    nodeId: 'limits',
    reason: 'Anchor prerequisite required to prevent divide-by-zero misunderstandings.',
  },
  {
    id: 's2',
    num: '02',
    title: 'Practice Derivative Slopes',
    category: 'DIFFERENTIAL RATE',
    status: 'completed',
    nodeId: 'derivatives',
    reason: 'Solidify instantaneous rate of change before tackling multi-stage compositions.',
  },
  {
    id: 's3',
    num: '03',
    title: 'Understand Chain Rule Decomposition',
    category: 'ACTIVE TARGET',
    status: 'in-progress',
    nodeId: 'chain-rule',
    reason: 'Currently unblocks 4 downstream nodes including Backpropagation and ODEs.',
  },
  {
    id: 's4',
    num: '04',
    title: 'Synthetic Stress-Test Quiz',
    category: 'MASTERY VERIFICATION',
    status: 'upcoming',
    nodeId: 'eval',
    reason: 'Tests composite functions under unfamiliar variable renames.',
  },
]

export const StudyPlan: React.FC = () => {
  const [activeStepId, setActiveStepId] = useState<string>('s3')

  return (
    <section className="relative w-full bg-[#020205] py-28 px-4 sm:px-8 border-t border-white/[0.05] overflow-hidden flex flex-col items-center justify-center">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[400px] bg-cyan-950/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.02] text-white/60 font-mono text-[10px] tracking-widest uppercase mb-4">
            <Orbit className="w-3 h-3 text-cyan-400" />
            <span>TOPOLOGICAL ITINERARY</span>
          </div>

          <h2 className="font-editorial text-4xl sm:text-6xl font-bold text-white tracking-tight mb-4">
            Know what <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
              comes next.
            </span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base font-light">
            You never have to guess what to study. GuruKul calculates the single highest-leverage node that unblocks the rest of your semester.
          </p>
        </div>

        {/* Minimal Study Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {STEPS.map((step) => {
            const isActive = activeStepId === step.id

            return (
              <div
                key={step.id}
                onClick={() => {
                  setActiveStepId(step.id)
                  soundEngine.playHover()
                }}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'glass-panel border-cyan-500/50 bg-cyan-950/20 shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                    : 'glass-panel-subtle border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.02]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
                    <span className="font-mono text-xs font-bold text-white/40">{step.num}</span>
                    <span
                      className={`font-mono text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider ${
                        step.status === 'completed'
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                          : step.status === 'in-progress'
                          ? 'border-cyan-500/40 text-cyan-300 bg-cyan-500/20 animate-pulse'
                          : 'border-white/10 text-white/40'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-white/40 tracking-wider block mb-1">
                    {step.category}
                  </span>
                  <h4 className="font-editorial text-lg font-bold text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {step.reason}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-cyan-300/80">
                  <span>UNBLOCKS NODE: #{step.nodeId.toUpperCase()}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
export default StudyPlan
