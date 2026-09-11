import React from 'react'
import { Terminal, Shield, Sparkles, Heart } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#020204] py-12 px-6 sm:px-8 border-t border-white/[0.06] text-white/50 text-xs font-mono select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand and Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="font-editorial tracking-widest uppercase font-bold text-sm">
              GURUKUL<span className="text-cyan-400 font-light">AI</span>
            </span>
          </div>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="text-white/60 tracking-wider">Learn in connections.</span>
        </div>

        {/* Live system state */}
        <div className="flex items-center gap-4 text-[11px] text-white/40">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            TOPOLOGY ENGINE ONLINE
          </span>
          <span className="text-white/20">•</span>
          <span>LATENCY: 14MS</span>
          <span className="text-white/20">•</span>
          <span>BUILD 2026.09</span>
        </div>

        {/* Legal & Attribution */}
        <div className="text-[11px] text-white/30">
          © {new Date().getFullYear()} GuruKul AI • Constellation Interface
        </div>
      </div>
    </footer>
  )
}
export default Footer
