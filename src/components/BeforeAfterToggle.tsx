import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Sparkles, Check, ArrowRight } from 'lucide-react'
import { soundEngine } from '../lib/audio-engine'

export const BeforeAfterToggle: React.FC = () => {
  const [viewState, setViewState] = useState<'before' | 'after'>('after')

  const handleToggle = (state: 'before' | 'after') => {
    setViewState(state)
    if (state === 'after') {
      soundEngine.playSourceFlare()
    } else {
      soundEngine.playHover()
    }
  }

  return (
    <section className="relative w-full bg-[#030307] py-24 px-4 sm:px-8 border-t border-white/[0.05] overflow-hidden flex flex-col items-center justify-center">
      <div className="max-w-5xl mx-auto w-full text-center">
        {/* Toggle Switch */}
        <div className="inline-flex items-center p-1.5 glass-panel rounded-full border border-white/[0.1] mb-12 shadow-lg">
          <button
            onClick={() => handleToggle('before')}
            className={`px-6 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              viewState === 'before'
                ? 'bg-white/10 text-white border border-white/20 shadow-md'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>[ BEFORE: FLAT SYLLABUS ]</span>
          </button>

          <button
            onClick={() => handleToggle('after')}
            className={`px-6 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              viewState === 'after'
                ? 'bg-cyan-400 text-black font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>[ AFTER: LIVING CONSTELLATION ]</span>
          </button>
        </div>

        {/* Content Viewport Card */}
        <div className="relative min-h-[420px] rounded-2xl glass-panel border border-white/[0.08] p-8 sm:p-12 overflow-hidden shadow-2xl flex items-center justify-center">
          <AnimatePresence mode="wait">
            {viewState === 'before' ? (
              <motion.div
                key="before"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-2xl bg-[#090b10] border border-white/[0.1] rounded-xl p-8 text-left font-mono"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4 text-xs text-white/40">
                  <span>STANDARD PDF EXPORT</span>
                  <span className="text-rose-400">UNSTRUCTURED TEXT • 0 INSIGHTS</span>
                </div>
                <div className="space-y-4 text-xs text-white/60">
                  <div>
                    <div className="text-white font-bold text-sm">MODULE 3: MULTIVARIABLE INTEGRATION</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Double and triple integrals in Cartesian and polar coordinates. Change of variables using the Jacobian determinant. Line and surface integrals. Green’s, Stokes’, and Gauss’ Divergence theorems.
                    </p>
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">PREREQUISITE DEPENDENCIES</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      (Not documented in course outline. Student expected to review previous years’ calculus independently.)
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-3 border-t border-white/[0.06] text-[10px] text-white/30 flex justify-between">
                  <span>FORMAT: RAW BLACK &amp; WHITE BULLETS</span>
                  <span>EFFICIENCY: 18% RETENTION</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="after"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-3xl flex flex-col items-center text-center"
              >
                <div className="relative w-full h-56 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 60">
                    <line x1="20" y1="30" x2="50" y2="20" stroke="#06b6d4" strokeWidth="0.8" />
                    <line x1="50" y1="20" x2="80" y2="35" stroke="#10b981" strokeWidth="0.8" />
                    <line x1="50" y1="20" x2="50" y2="45" stroke="#a855f7" strokeWidth="0.8" />

                    <circle cx="20" cy="30" r="3" fill="#06b6d4" className="shadow-[0_0_15px_#06b6d4]" />
                    <circle cx="50" cy="20" r="4.5" fill="#ffffff" stroke="#06b6d4" strokeWidth="1" />
                    <circle cx="80" cy="35" r="3" fill="#10b981" />
                    <circle cx="50" cy="45" r="3.2" fill="#a855f7" />

                    <text x="20" y="38" textAnchor="middle" fill="#06b6d4" fontSize="2.2" fontFamily="var(--font-mono)">
                      JACOBIAN
                    </text>
                    <text x="50" y="12" textAnchor="middle" fill="#ffffff" fontSize="2.5" fontFamily="var(--font-mono)">
                      MULTIVARIABLE INTEGRALS
                    </text>
                    <text x="80" y="43" textAnchor="middle" fill="#10b981" fontSize="2.2" fontFamily="var(--font-mono)">
                      STOKES' THEOREM
                    </text>
                    <text x="50" y="53" textAnchor="middle" fill="#a855f7" fontSize="2.2" fontFamily="var(--font-mono)">
                      VECTOR FLUX
                    </text>
                  </svg>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full mt-4 text-left">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] font-mono text-cyan-400 mb-0.5">DEPENDENCIES VISIBLE</div>
                    <div className="text-xs text-slate-300">Exact upstream axioms highlighted automatically.</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] font-mono text-emerald-400 mb-0.5">ACTIVE PROGRESS AURA</div>
                    <div className="text-xs text-slate-300">Know exactly which 3 theorems unlock the final unit.</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] font-mono text-purple-400 mb-0.5">TRACEABLE ANSWERS</div>
                    <div className="text-xs text-slate-300">AI responses cite the exact unit equation.</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
export default BeforeAfterToggle
