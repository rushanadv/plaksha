import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  BookOpen,
  Layers,
  ChevronRight,
  RotateCcw,
} from 'lucide-react'
import { QA_SCENARIOS, GRAPH_NODES, GRAPH_EDGES, type QAScenario, type GraphNode } from '../lib/graph-data'
import { SonarGrid } from './ui/sonar-grid'
import { soundEngine } from '../lib/audio-engine'

export const VisualQA: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<QAScenario>(QA_SCENARIOS[0])
  const [customInput, setCustomInput] = useState<string>('')
  const [isTracing, setIsTracing] = useState<boolean>(false)
  const [traceStep, setTraceStep] = useState<number>(0) // 0: Idle, 1: Signal In, 2: Traveling, 3: Flare, 4: Reveal
  const [currentPathIndex, setCurrentPathIndex] = useState<number>(-1)
  const [showAnswer, setShowAnswer] = useState<boolean>(true)
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach((t) => clearTimeout(t))
    timeoutRefs.current = []
  }

  useEffect(() => {
    return () => clearAllTimeouts()
  }, [])

  // Execute the exact 1.7s Signature Light-Trace Sequence
  const runTraceSequence = (scenario: QAScenario) => {
    clearAllTimeouts()
    setSelectedScenario(scenario)
    setIsTracing(true)
    setShowAnswer(false)
    setTraceStep(1)
    setCurrentPathIndex(-1)

    // 0.2s: Graph dims, audio pulse starts
    soundEngine.playTracePulse(1)

    // 0.4s: Signal arrives at constellation entry boundary
    const t1 = setTimeout(() => {
      setTraceStep(2)
      // Traverse nodes step by step
      scenario.path.forEach((nodeId, idx) => {
        const stepTime = 120 * (idx + 1)
        const tStep = setTimeout(() => {
          setCurrentPathIndex(idx)
          soundEngine.playTracePulse(1 + idx * 0.2)
        }, stepTime)
        timeoutRefs.current.push(tStep)
      })
    }, 400)
    timeoutRefs.current.push(t1)

    // 1.4s: Source node flares into radiant light!
    const t2 = setTimeout(() => {
      setTraceStep(3)
      soundEngine.playSourceFlare()
    }, 1400)
    timeoutRefs.current.push(t2)

    // 1.5s: Metadata appears
    // 1.7s: Answer fades in
    const t3 = setTimeout(() => {
      setTraceStep(4)
      setShowAnswer(true)
      setIsTracing(false)
    }, 1700)
    timeoutRefs.current.push(t3)
  }

  const handleQuickQuestion = (scenario: QAScenario) => {
    setCustomInput(scenario.question)
    runTraceSequence(scenario)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customInput.trim()) return

    // Find closest matching scenario or default to scenario 0
    const matched =
      QA_SCENARIOS.find((s) =>
        s.question.toLowerCase().includes(customInput.toLowerCase()) ||
        customInput.toLowerCase().includes(s.shortLabel.toLowerCase())
      ) || QA_SCENARIOS[0]

    runTraceSequence(matched)
  }

  // Get nodes for Q&A constellation visualization
  const qaNodeIds = Array.from(new Set([...selectedScenario.path, 'derivatives', 'matrices', 'loss-landscapes', 'mle']))
  const qaNodes = GRAPH_NODES.filter((n) => qaNodeIds.includes(n.id))
  const qaEdges = GRAPH_EDGES.filter((e) =>
    qaNodeIds.includes(e.source) && qaNodeIds.includes(e.target)
  )

  const targetNode = GRAPH_NODES.find((n) => n.id === selectedScenario.sourceNodeId)

  return (
    <section
      id="visual-qa"
      className="relative min-h-screen w-full bg-[#020205] py-28 px-4 sm:px-8 border-t border-white/[0.05] overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Background Layer: Sonar Grid with radar wave pings */}
      <SonarGrid
        color="#f59e0b"
        spacing={30}
        dotRadius={1.2}
        baseOpacity={0.20}
        pingEvery={3.2}
        speed={250}
        ringWidth={100}
        amplitude={2.5}
        interactive={true}
        className="absolute inset-0 z-0"
      />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/20 text-amber-300 font-mono text-[10px] tracking-widest uppercase mb-4">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>THE SIGNATURE RETRIEVAL TRACE</span>
          </div>

          <h2 className="font-editorial text-4xl sm:text-6xl font-bold text-white tracking-tight mb-4">
            Ask anything. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-200 to-cyan-300">
              See where the answer comes from.
            </span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-light">
            GuruKul is not a hallucinating black box. When you ask a question, watch the light-pulse travel across prerequisite paths to illuminate the exact source theorem.
          </p>
        </div>

        {/* Search / Question Input Bar */}
        <form
          onSubmit={handleCustomSubmit}
          className="max-w-2xl mx-auto mb-6 relative z-20"
        >
          <div className="relative flex items-center glass-panel rounded-full border border-white/[0.12] focus-within:border-amber-400/80 shadow-[0_10px_35px_rgba(0,0,0,0.6)] p-2 transition-all">
            <div className="pl-4 pr-2 text-amber-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Ask any question from your syllabus (e.g. Why does the chain rule work?)"
              className="w-full bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30 font-sans pr-4"
            />
            <button
              type="submit"
              disabled={isTracing}
              className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs uppercase font-semibold tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            >
              {isTracing ? (
                <>
                  <Zap className="w-3.5 h-3.5 animate-spin" />
                  <span>TRACING...</span>
                </>
              ) : (
                <>
                  <span>Trace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Question Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto mb-10 relative z-20">
          <span className="font-mono text-[10px] text-white/40 tracking-wider mr-1">
            EXPLORE PRESETS:
          </span>
          {QA_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleQuickQuestion(s)}
              disabled={isTracing}
              className={`px-3 py-1.5 rounded-full font-mono text-[11px] transition-all flex items-center gap-1.5 ${
                selectedScenario.id === s.id
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-white/[0.03] text-white/60 border border-white/[0.08] hover:text-white hover:border-white/20'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{s.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Main Q&A Stage: Constellation Light-Trace + Grounded Answer Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Visual Light-Trace Graph Stage (7 cols) */}
          <div className="lg:col-span-7 h-[440px] sm:h-[480px] rounded-2xl glass-panel border border-white/[0.08] p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Top Telemetry Header */}
            <div className="flex items-center justify-between text-[10px] font-mono text-white/50 border-b border-white/[0.06] pb-2 z-10">
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    traceStep === 3 ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'
                  }`}
                />
                {isTracing ? 'OPTICAL RETRIEVAL ACTIVE' : 'LIGHT TRACE SYSTEM IDLE'}
              </span>
              <span className="text-amber-300 uppercase tracking-wider">
                CONFIDENCE: {selectedScenario.confidence}%
              </span>
            </div>

            {/* Constellation Trace Canvas */}
            <div className="relative w-full flex-1 flex items-center justify-center my-2">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <filter id="qa-flare" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <radialGradient id="signal-pulse" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Graph Edges */}
                <g className="edges">
                  {qaEdges.map((edge) => {
                    const source = qaNodes.find((n) => n.id === edge.source)
                    const target = qaNodes.find((n) => n.id === edge.target)
                    if (!source || !target) return null

                    // Is this edge part of the active path?
                    const sourceIdx = selectedScenario.path.indexOf(edge.source)
                    const targetIdx = selectedScenario.path.indexOf(edge.target)
                    const isPathEdge =
                      sourceIdx !== -1 &&
                      targetIdx !== -1 &&
                      Math.abs(sourceIdx - targetIdx) === 1

                    return (
                      <line
                        key={edge.id}
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={isPathEdge ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}
                        strokeWidth={isPathEdge ? 1.2 : 0.3}
                        strokeDasharray={isPathEdge ? undefined : '1 1'}
                        className="transition-all duration-300"
                      />
                    )
                  })}
                </g>

                {/* Question Signal Entry Arrow (from left boundary) */}
                <g transform="translate(6, 40)">
                  <circle
                    r="2.5"
                    fill="#f59e0b"
                    className={traceStep >= 1 ? 'animate-ping' : 'opacity-40'}
                  />
                  <line x1="0" y1="0" x2="10" y2="0" stroke="#f59e0b" strokeWidth="0.8" />
                  <text x="0" y="-4" fill="#f59e0b" fontSize="1.8" fontFamily="var(--font-mono)">
                    INPUT SIGNAL
                  </text>
                </g>

                {/* Graph Nodes */}
                <g className="nodes">
                  {qaNodes.map((node) => {
                    const pathIndex = selectedScenario.path.indexOf(node.id)
                    const isSourceNode = node.id === selectedScenario.sourceNodeId
                    const isTraversed = pathIndex !== -1 && pathIndex <= currentPathIndex
                    const isFlaring = isSourceNode && (traceStep === 3 || traceStep === 4)

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        className="transition-all duration-300"
                      >
                        {/* Radiant Flare when Source Node is hit! */}
                        {isFlaring && (
                          <circle
                            r="12"
                            fill="url(#signal-pulse)"
                            filter="url(#qa-flare)"
                            className="animate-ping opacity-75"
                          />
                        )}

                        {/* Node Body */}
                        <circle
                          r={isSourceNode ? 5 : isTraversed ? 3.5 : 2.5}
                          fill={isSourceNode ? '#f59e0b' : isTraversed ? '#ffffff' : '#38bdf8'}
                          filter={isSourceNode ? 'url(#qa-flare)' : undefined}
                          className="transition-all duration-300"
                        />

                        {/* Node Label */}
                        <text
                          y={isSourceNode ? 7 : 5}
                          textAnchor="middle"
                          fill={isSourceNode ? '#f59e0b' : '#ffffff'}
                          fontSize={isSourceNode ? '2.2' : '1.3'}
                          fontFamily="var(--font-mono)"
                          fontWeight={isSourceNode ? 'bold' : 'normal'}
                        >
                          {node.label}
                        </text>
                      </g>
                    )
                  })}
                </g>
              </svg>
            </div>

            {/* Bottom Status Ticker */}
            <div className="flex items-center justify-between text-[10px] font-mono text-white/50 border-t border-white/[0.06] pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                PATH: {selectedScenario.path.join(' → ').toUpperCase()}
              </span>
              <button
                onClick={() => runTraceSequence(selectedScenario)}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-run Trace</span>
              </button>
            </div>
          </div>

          {/* Grounded AI Answer Card with Citation (5 cols) */}
          <div className="lg:col-span-5 h-[440px] sm:h-[480px] rounded-2xl glass-panel border border-amber-500/30 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Top Source Hierarchy Badge */}
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-mono text-[10px] tracking-widest text-amber-300 uppercase">
                    SOURCE NODE LOCKED
                  </span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {targetNode?.label.toUpperCase()}
                </span>
              </div>

              {/* Breadcrumb Hierarchy */}
              <div className="font-mono text-[10px] text-white/40 tracking-wider uppercase mb-3">
                {selectedScenario.sourceHierarchy}
              </div>

              {/* Question Title */}
              <h3 className="font-editorial text-lg sm:text-xl font-bold text-white mb-3">
                "{selectedScenario.question}"
              </h3>

              {/* Grounded Answer Stream */}
              <AnimatePresence mode="wait">
                {showAnswer ? (
                  <motion.div
                    key={selectedScenario.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                      {selectedScenario.answer}
                    </p>

                    {/* Formula Snippets */}
                    <div className="space-y-1.5">
                      {selectedScenario.keyFormulas.map((f, i) => (
                        <div
                          key={i}
                          className="bg-black/60 p-2 rounded border border-white/[0.08] font-mono text-xs text-amber-300 overflow-x-auto"
                        >
                          {f}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <Zap className="w-8 h-8 text-amber-400 animate-bounce mb-3" />
                    <span className="font-mono text-xs text-white/60 tracking-wider">
                      PROPAGATING LIGHT PULSE THROUGH GRAPH...
                    </span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Verification Seal */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/50">
              <span className="truncate max-w-[200px]">{selectedScenario.citation}</span>
              <span className="text-emerald-400 font-semibold">VERIFIED SOURCE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default VisualQA
