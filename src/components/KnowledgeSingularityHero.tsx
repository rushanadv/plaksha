import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { BlackHole } from './ui/black-hole'
import { LiquidButton } from './ui/liquid-glass-button'
import { ParticleBackground } from './ui/particle-background'
import { KnowledgeConstellationCanvas } from './ui/knowledge-constellation-canvas'
import { SceneTransitionBridge } from './ui/SceneTransitionBridge'
import { GurukulParticleField } from './ui/gurukul-particle-field'
import { HeroConstellation } from './HeroConstellation'
import { soundEngine } from '../lib/audio-engine'

interface KnowledgeSingularityHeroProps {
  onOpenUploadModal: () => void
  children?: React.ReactNode
}

export const KnowledgeSingularityHero: React.FC<KnowledgeSingularityHeroProps> = ({
  onOpenUploadModal,
  children,
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
  // ONE BOUNDED STICKY HERO SEQUENCE (380vh wrapper with a 100svh sticky viewport)
  // Region A: Scene 1 ("Knowledge has gravity.", 0.00 -> 0.28)
  // Region B: Scene 2 ("Your syllabus, made visible.", locked plateau 0.36 -> 0.54)
  // Transition Bridge: Scene 2 -> Scene 3 (0.54 -> 0.92, normalized t = 0 -> 1)
  // Region C: Scene 3 Settled State (0.92 -> 1.00, unmodified resting frame)
  // =========================================================================
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // 1. Black Hole Shader Transforms
  // In Scene 2, the black hole recedes to a faint background ghost (0.10 opacity)
  const blackHoleIntensity = useTransform(scrollYProgress, [0, 0.18, 0.28, 0.36, 0.54, 0.65], [1.0, 1.0, 0.50, 0.18, 0.18, 0])
  const blackHoleOpacity = useTransform(scrollYProgress, [0, 0.18, 0.28, 0.36, 0.54, 0.65], [1.0, 1.0, 0.40, 0.10, 0.10, 0])
  const blackHoleScale = useTransform(scrollYProgress, [0, 0.28, 0.36, 0.54, 0.65], [1.0, 0.96, 0.92, 0.92, 0.88])
  const blackHoleX = useTransform(scrollYProgress, [0, 0.28, 0.36, 0.54, 0.65], ['0vw', '1.5vw', '2vw', '2vw', '3vw'])

  // 2. SCENE 1: "Knowledge has gravity." (0.00 -> 0.18 hold, 0.18 -> 0.28 exit)
  // At >= 0.28, visibility is strictly hidden to guarantee zero ghost text!
  const scene1Opacity = useTransform(scrollYProgress, [0.18, 0.28], [1, 0])
  const scene1Y = useTransform(scrollYProgress, [0.18, 0.28], [0, -24])
  const scene1Blur = useTransform(scrollYProgress, [0.18, 0.28], ['blur(0px)', 'blur(6px)'])
  const scene1Visibility = useTransform(scrollYProgress, (v) => (v < 0.28 ? 'visible' : 'hidden'))

  // 3. SCENE 2 -> SCENE 3 TRANSITION PROGRESS (Deterministic 0.0 -> 1.0 scrubbed by scroll)
  // 0.00 -> 0.15: Scene 2 resting frame
  // 0.15 -> 0.32: Scene 2 prepares (UI dims, constellation focuses)
  // 0.32 -> 0.48: Constellation contracts toward central source node
  // 0.48 -> 0.62: Light trace transformation & camera dive through node
  // 0.62 -> 0.74: The transition void (short cinematic moment with thin data streaks)
  // 0.70 -> 0.84: Trails reorganize toward Scene 3 headline & product dock
  // 0.76 -> 0.94: Scene 3 revealed
  // 0.94 -> 1.00: Scene 3 settles
  const transitionProgress = useTransform(scrollYProgress, [0.54, 0.92], [0, 1])

  // Scene 2 Headline: fades cleanly during transition (0.58 -> 0.72)
  const scene2HeadlineOpacity = useTransform(
    scrollYProgress,
    [0.28, 0.36, 0.54, 0.60, 0.70],
    [0, 1, 1, 0.65, 0]
  )
  const scene2HeadlineY = useTransform(scrollYProgress, [0.28, 0.36, 0.60, 0.70], [20, 0, 0, -16])
  const scene2HeadlineBlur = useTransform(
    scrollYProgress,
    [0.28, 0.36, 0.60, 0.70],
    ['blur(6px)', 'blur(0px)', 'blur(0px)', 'blur(6px)']
  )
  const scene2HeadlineVisibility = useTransform(scrollYProgress, (v) => (v >= 0.26 && v <= 0.72 ? 'visible' : 'hidden'))

  // Scene 2 Supporting Copy & Action Buttons: fades at start of transition (0.54 -> 0.64)
  const scene2UiOpacity = useTransform(
    scrollYProgress,
    [0.28, 0.36, 0.54, 0.62],
    [0, 1, 1, 0]
  )
  const scene2UiY = useTransform(scrollYProgress, [0.28, 0.36, 0.54, 0.62], [20, 0, 0, -8])
  const scene2UiVisibility = useTransform(scrollYProgress, (v) => (v >= 0.26 && v <= 0.64 ? 'visible' : 'hidden'))

  // 4. SCENE 3: "Turn your syllabus into a constellation."
  // Reveals cleanly between 0.80 and 0.90 (t = 0.76 to 0.94), fully settled at >= 0.90 (t = 0.94+)
  const scene3Opacity = useTransform(scrollYProgress, [0.78, 0.88], [0, 1])
  const scene3Scale = useTransform(scrollYProgress, [0.78, 0.88], [0.97, 1.0])
  const scene3Visibility = useTransform(scrollYProgress, (v) => (v >= 0.76 ? 'visible' : 'hidden'))

  // Initial Scroll Indicator (0.00 -> 0.12)
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  // Singularity center point for atmospheric layers
  const bhCenter: [number, number] = isMobile ? [0.50, 0.62] : [0.70, 0.48]

  // =========================================================================
  // LOCALIZED SOFT SETTLE INTO SCENE 2 ANCHOR (at progress ~ 0.46)
  // Fires only after idle delay (~140ms) when stopped in entrance window [0.30, 0.46].
  // Never hijacks active scrolling. Transition to Scene 3 is purely scroll-scrubbed.
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

      // When stopped near the Scene 2 entrance window [0.30, 0.46] and not yet at anchor 0.46
      if (currentP >= 0.30 && currentP <= 0.46 && Math.abs(currentP - 0.46) > 0.035) {
        if (!isScrollingDown && currentP < 0.34) return

        const targetScrollY = Math.round(containerTop + 0.46 * maxScroll)
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
      className="relative w-full h-[380vh] bg-[#020304] text-[#F5F5F2] select-none"
    >
      {/* Sticky 100svh Viewport Container */}
      <div
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
        {/* Responds to scroll: contracts inward and dives past camera   */}
        {/* ============================================================ */}
        <div className="absolute inset-0 z-20 pointer-events-auto">
          <KnowledgeConstellationCanvas
            progress={scrollYProgress}
            transitionProgress={transitionProgress}
            className="w-full h-full"
            onNodeSelect={(_nodeId) => {
              // Interactive audio feedback handled in engine
            }}
          />
        </div>

        {/* ============================================================ */}
        {/* LAYER 4: SCENE 1 ("Knowledge has gravity.") (0.00 -> 0.28)   */}
        {/* 100% GONE at 0.28: visibility: hidden, zero ghost text!      */}
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
                href="#hero"
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
        {/* Locked plateau 0.36 -> 0.54, cleanly leaves in transition    */}
        {/* ============================================================ */}
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 sm:p-10 md:py-12 md:px-16">
          {/* Top Header: Eyebrow + Headline + Supporting Sentence */}
          <motion.div
            style={{
              opacity: scene2HeadlineOpacity,
              y: prefersReduced ? 0 : scene2HeadlineY,
              filter: scene2HeadlineBlur,
              visibility: scene2HeadlineVisibility as any,
            }}
            className="w-full max-w-[720px] mx-auto text-center mt-2 sm:mt-4"
          >
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
          </motion.div>

          {/* Bottom Action Bar */}
          <motion.div
            style={{
              opacity: scene2UiOpacity,
              y: prefersReduced ? 0 : scene2UiY,
              visibility: scene2UiVisibility as any,
            }}
            className="w-full flex items-center justify-center gap-6 mb-2 sm:mb-4"
          >
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
              href="#hero"
              onClick={() => soundEngine.playHover()}
              className="pointer-events-auto font-mono text-xs tracking-wider uppercase text-white/40 hover:text-white/80 transition-colors cursor-pointer hidden sm:flex items-center"
            >
              <Compass className="w-3.5 h-3.5 inline-block mr-1.5 text-[#69DDF5]" />
              How it works
            </a>
          </motion.div>
        </div>

        {/* ============================================================ */}
        {/* LAYER 6: SCENE TRANSITION BRIDGE (Signature Light Trails)    */}
        {/* Active only during t in [0.46, 0.88] (dive, void, reorg)     */}
        {/* ============================================================ */}
        <div className="absolute inset-0 z-35 pointer-events-none">
          <SceneTransitionBridge progress={transitionProgress} />
        </div>

        {/* ============================================================ */}
        {/* LAYER 7: SCENE 3 ("Turn your syllabus into a constellation") */}
        {/* Clean reveal at t in [0.76, 0.94], settles into resting state*/}
        {/* ============================================================ */}
        <motion.div
          style={{
            opacity: scene3Opacity,
            scale: prefersReduced ? 1 : scene3Scale,
            visibility: scene3Visibility as any,
          }}
          className="absolute inset-0 z-40 w-full h-full overflow-hidden pointer-events-auto bg-[#020205]"
        >
          <GurukulParticleField />
          {children || <HeroConstellation onOpenUploadModal={onOpenUploadModal} />}
        </motion.div>

        {/* ============================================================ */}
        {/* LAYER 8: SCENE 1 SCROLL INDICATOR (Bottom Viewport 1)        */}
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

      </div>
    </section>
  )
}

export default KnowledgeSingularityHero
