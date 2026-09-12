import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { BlackHole } from './ui/black-hole'
import { LiquidButton } from './ui/liquid-glass-button'
import { ParticleBackground } from './ui/particle-background'
import { KnowledgeConstellationCanvas } from './ui/knowledge-constellation-canvas'
import { soundEngine } from '../lib/audio-engine'

interface KnowledgeSingularityHeroProps {
  onOpenUploadModal: () => void
}

export const KnowledgeSingularityHero: React.FC<KnowledgeSingularityHeroProps> = ({
  onOpenUploadModal,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false })
  const prefersReduced = useReducedMotion()
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  // =========================================================================
  // ONE BOUNDED STICKY HERO (300vh wrapper with a 100svh sticky viewport)
  // Region A: Scene 1 (0.00 -> 0.36)
  // Region B: Scene 2 Locked Plateau (0.36 -> 0.70, absolute plateau 0.46 -> 0.70)
  // Region C: Exit to next section (0.70 -> 1.00)
  // =========================================================================
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // 1. Black Hole Shader Transforms
  // In Scene 2, the black hole recedes to a faint background ghost (0.10 opacity)
  const blackHoleIntensity = useTransform(scrollYProgress, [0, 0.22, 0.38, 0.46, 0.70, 0.86], [1.0, 1.0, 0.50, 0.18, 0.18, 0])
  const blackHoleOpacity = useTransform(scrollYProgress, [0, 0.22, 0.38, 0.46, 0.70, 0.86], [1.0, 1.0, 0.40, 0.10, 0.10, 0])
  const blackHoleScale = useTransform(scrollYProgress, [0, 0.38, 0.46, 0.70, 0.86], [1.0, 0.96, 0.92, 0.92, 0.88])
  const blackHoleX = useTransform(scrollYProgress, [0, 0.38, 0.46, 0.70, 0.86], ['0vw', '1.5vw', '2vw', '2vw', '3vw'])

  // 2. SCENE 1: "Knowledge has gravity." (0.00 -> 0.22 hold, 0.22 -> 0.38 exit)
  // At >= 0.38, visibility is strictly hidden to guarantee zero ghost text!
  const scene1Opacity = useTransform(scrollYProgress, [0.22, 0.38], [1, 0])
  const scene1Y = useTransform(scrollYProgress, [0.22, 0.38], [0, -24])
  const scene1Blur = useTransform(scrollYProgress, [0.22, 0.38], ['blur(0px)', 'blur(6px)'])
  const scene1Visibility = useTransform(scrollYProgress, (v) => (v < 0.38 ? 'visible' : 'hidden'))

  // 3. SCENE 2: "Your syllabus, made visible." (0.38 -> 0.46 assemble, 0.46 -> 0.70 LOCKED PLATEAU, 0.70 -> 0.86 exit)
  const scene2Opacity = useTransform(scrollYProgress, [0.38, 0.46, 0.70, 0.86], [0, 1, 1, 0])
  const scene2Y = useTransform(scrollYProgress, [0.38, 0.46, 0.70, 0.86], [20, 0, 0, -20])
  const scene2Blur = useTransform(scrollYProgress, [0.38, 0.46, 0.70, 0.86], ['blur(6px)', 'blur(0px)', 'blur(0px)', 'blur(6px)'])
  const scene2Visibility = useTransform(scrollYProgress, (v) => (v >= 0.36 && v <= 0.88 ? 'visible' : 'hidden'))

  // 4. EXIT TO NEXT WEBSITE SECTION (0.86 -> 1.00)
  const stageOpacity = useTransform(scrollYProgress, [0.86, 0.98], [1, 0])
  const stageY = useTransform(scrollYProgress, [0.86, 0.98], [0, -20])

  // Initial Scroll Indicator (0.00 -> 0.14)
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0])

  // Singularity center point for atmospheric layers
  const bhCenter: [number, number] = isMobile ? [0.50, 0.62] : [0.70, 0.48]

  // =========================================================================
  // LOCALIZED SOFT SETTLE INTO SCENE 2 ANCHOR (at progress ~ 0.50)
  // Fires only after idle delay (~140ms) when stopped in transition window [0.36, 0.52].
  // Never hijacks active scrolling. Smooth reverse scrolling and continuation work seamlessly.
  // =========================================================================
  useEffect(() => {
    if (prefersReduced) return

    let idleTimer: ReturnType<typeof setTimeout> | null = null
    let isSettling = false
    let lastScrollY = window.scrollY || window.pageYOffset

    const checkSettle = () => {
      if (isSettling) return
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const scrollY = window.scrollY || window.pageYOffset
      const containerTop = scrollY + rect.top
      const maxScroll = container.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return

      const currentP = (scrollY - containerTop) / maxScroll
      const isScrollingDown = scrollY >= lastScrollY
      lastScrollY = scrollY

      // When stopped near the Scene 2 transition [0.36, 0.52] and not already settled at 0.50
      if (currentP >= 0.36 && currentP <= 0.52 && Math.abs(currentP - 0.50) > 0.035) {
        // If user was scrolling upwards back to Scene 1, do not drag them down
        if (!isScrollingDown && currentP < 0.42) return

        const targetScrollY = Math.round(containerTop + 0.50 * maxScroll)
        isSettling = true

        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth',
        })

        setTimeout(() => {
          isSettling = false
        }, 450)
      }
    }

    const onScroll = () => {
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        checkSettle()
      }, 140)
    }

    const onScrollEnd = () => {
      if (idleTimer) clearTimeout(idleTimer)
      checkSettle()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', onScrollEnd, { passive: true })
    }

    return () => {
      if (idleTimer) clearTimeout(idleTimer)
      window.removeEventListener('scroll', onScroll)
      if ('onscrollend' in window) {
        window.removeEventListener('scrollend', onScrollEnd)
      }
    }
  }, [prefersReduced])

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[300vh] bg-[#020304] text-[#F5F5F2] select-none"
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
        {/* LAYER 2: SUBTLE COORDINATE AXIS LINE (Scene 1 Atmosphere)    */}
        {/* ============================================================ */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.04]">
          <div className="absolute top-0 bottom-0 left-[70%] w-[1px] bg-white hidden md:block" />
        </div>

        {/* ============================================================ */}
        {/* LAYER 3: SCENE 2 CENTERED CONSTELLATION CANVAS               */}
        {/* Centered at 50vw, 50vh with Curated Nodes + Aether Ambience  */}
        {/* ============================================================ */}
        <div className="absolute inset-0 z-20 pointer-events-auto">
          <KnowledgeConstellationCanvas
            progress={scrollYProgress}
            className="w-full h-full"
            onNodeSelect={(_nodeId) => {
              // Node select sound already played; preserves interactive responsiveness
            }}
          />
        </div>

        {/* ============================================================ */}
        {/* LAYER 4: SCENE 1 ("Knowledge has gravity.") (0.00 -> 0.38)   */}
        {/* 100% GONE at 0.38: visibility: hidden, zero ghost text!      */}
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
        {/* LAYER 5: SCENE 2 ("Your syllabus, made visible.")            */}
        {/* Enters at 0.38, LOCKED PLATEAU 0.46 -> 0.70, Exits at 0.86  */}
        {/* Framed top & bottom around the centered 50vw/50vh canvas     */}
        {/* ============================================================ */}
        <motion.div
          style={{
            opacity: scene2Opacity,
            y: prefersReduced ? 0 : scene2Y,
            filter: scene2Blur,
            visibility: scene2Visibility as any,
          }}
          className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 sm:p-10 md:py-12 md:px-16"
        >
          {/* Top Header: Eyebrow + Headline + Supporting Sentence */}
          <div className="w-full max-w-[720px] mx-auto text-center mt-2 sm:mt-4">
            <div className="font-mono text-[10px] sm:text-[11px] tracking-[0.25em] text-[#69DDF5]/85 uppercase mb-3 sm:mb-4">
              STRUCTURE REVEALED / KNOWLEDGE SYSTEM
            </div>

            <h2
              style={{
                fontSize: 'clamp(32px, 4.2vw, 56px)',
                lineHeight: 1.02,
                letterSpacing: '-0.045em',
              }}
              className="font-sans font-semibold text-[#F5F5F2] mb-3 sm:mb-4 select-none"
            >
              Your syllabus,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F5F2] via-[#8edff2] to-[#69DDF5]">
                made visible.
              </span>
            </h2>

            <p className="font-sans text-[14px] sm:text-[16px] text-[rgba(245,245,242,0.65)] max-w-[540px] mx-auto font-normal leading-relaxed text-balance">
              GuruKul maps what you need to learn, shows how everything connects, and makes every answer traceable to its source.
            </p>
          </div>

          {/* Bottom Action Bar */}
          <div className="w-full flex items-center justify-center gap-6 mb-2 sm:mb-4">
            <div className="pointer-events-auto">
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
            </div>

            <a
              href="#syllabus-reveal"
              onClick={() => soundEngine.playHover()}
              className="pointer-events-auto font-mono text-xs tracking-wider uppercase text-white/40 hover:text-white/80 transition-colors cursor-pointer hidden sm:flex items-center"
            >
              <Compass className="w-3.5 h-3.5 inline-block mr-1.5 text-[#69DDF5]" />
              How it works
            </a>
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
