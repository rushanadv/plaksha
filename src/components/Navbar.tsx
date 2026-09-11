import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX, Sparkles, ChevronRight } from 'lucide-react'
import { soundEngine } from '../lib/audio-engine'

interface NavbarProps {
  onOpenUploadModal: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUploadModal }) => {
  const [scrolled, setScrolled] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleSound = () => {
    const nextMuted = soundEngine.toggleMute()
    setIsMuted(nextMuted)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'h-20 bg-[#030303]/90 backdrop-blur-md border-b border-white/[0.08]'
          : 'h-20 bg-transparent border-b border-transparent'
      } flex items-center`}
    >
      <div className="w-full max-w-[1400px] mx-auto px-8 sm:px-12 flex items-center justify-between">
        {/* Brand */}
        <a
          href="#"
          className="group flex items-baseline gap-3 select-none text-[#F5F5F2] focus:outline-none"
          onClick={() => soundEngine.playHover()}
        >
          <span className="font-sans text-sm font-semibold tracking-[-0.02em] text-[#F5F5F2] group-hover:text-white transition-colors">
            GURUKUL AI
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase hidden sm:inline">
            KNOWLEDGE SYSTEM
          </span>
        </a>

        {/* Center Nav Links - Clean simple text links, no heavy pill container */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-[13px] font-sans">
          <a
            href="#hero"
            className="text-white/50 hover:text-[#F5F5F2] transition-colors"
            onMouseEnter={() => soundEngine.playHover()}
          >
            Product
          </a>
          <a
            href="#syllabus-reveal"
            className="text-white/50 hover:text-[#F5F5F2] transition-colors"
            onMouseEnter={() => soundEngine.playHover()}
          >
            How it works
          </a>
          <a
            href="#visual-qa"
            className="text-white/50 hover:text-[#F5F5F2] transition-colors"
            onMouseEnter={() => soundEngine.playHover()}
          >
            Trace
          </a>
          <a
            href="#progress"
            className="text-white/50 hover:text-[#F5F5F2] transition-colors"
            onMouseEnter={() => soundEngine.playHover()}
          >
            Progress
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Subtle Audio Toggle */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute audio cues' : 'Mute audio cues'}
            className={`p-2 rounded-full text-xs transition-colors flex items-center justify-center ${
              !isMuted
                ? 'text-[#69DDF5] hover:text-white'
                : 'text-white/30 hover:text-white/70'
            }`}
            title={isMuted ? 'Audio: Muted' : 'Audio: Active'}
          >
            {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Restrained White CTA Button */}
          <button
            onClick={() => {
              soundEngine.playNodeSelect()
              onOpenUploadModal()
            }}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase font-medium bg-[#F5F5F2] text-[#030303] hover:bg-white transition-all cursor-pointer"
          >
            <span>Upload syllabus</span>
            <span className="text-black/60 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </div>
    </header>
  )
}
export default Navbar
