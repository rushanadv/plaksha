import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Compass, Shield, Terminal } from 'lucide-react'
import { soundEngine } from '../lib/audio-engine'

interface FinalCTAProps {
  onOpenUploadModal: () => void
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenUploadModal }) => {
  return (
    <section className="relative min-h-[90vh] w-full bg-[#010103] py-32 px-4 sm:px-8 border-t border-white/[0.05] overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Expanding background constellation aura */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <svg className="w-[1200px] h-[1200px] max-w-none animate-pulse-slow" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(56,189,248,0.1)" strokeWidth="0.2" strokeDasharray="1 2" />
          <circle cx="50" cy="50" r="60" fill="none" stroke="rgba(168,85,247,0.08)" strokeWidth="0.2" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-xs tracking-[0.2em] font-medium uppercase text-cyan-300">
            ENTER THE TOPOLOGICAL ERA
          </span>
        </div>

        {/* Big Editorial Headline */}
        <h2 className="font-editorial text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.05] mb-8 text-balance">
          Stop studying <br />
          the syllabus. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
            Start exploring it.
          </span>
        </h2>

        <p className="text-base sm:text-xl text-slate-400 max-w-xl mx-auto font-light leading-relaxed mb-12">
          Turn your PDF syllabus into a living, interactive knowledge constellation in seconds. Free for students.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => {
              soundEngine.playNodeSelect()
              onOpenUploadModal()
            }}
            className="w-full sm:w-auto px-9 py-4 rounded-full bg-white text-black font-mono text-xs tracking-wider uppercase font-semibold hover:bg-cyan-300 transition-all duration-300 shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-cyan-600 transition-transform group-hover:rotate-12" />
            <span>Build your constellation →</span>
          </button>

          <a
            href="#interactive-constellation"
            onClick={() => soundEngine.playHover()}
            className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel text-white font-mono text-xs tracking-wider uppercase border border-white/[0.12] hover:border-cyan-500/50 hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Explore live demo</span>
          </a>
        </div>
      </div>
    </section>
  )
}
export default FinalCTA
