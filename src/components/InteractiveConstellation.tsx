import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass,
  Layers,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
  X,
  Maximize2,
  Filter,
  Flame,
} from 'lucide-react'
import { GRAPH_NODES, GRAPH_EDGES, CATEGORY_COLORS, type GraphNode } from '../lib/graph-data'
import { soundEngine } from '../lib/audio-engine'

interface InteractiveConstellationProps {
  onStudyTopic?: (topicName: string) => void
}

export const InteractiveConstellation: React.FC<InteractiveConstellationProps> = ({
  onStudyTopic,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(GRAPH_NODES[2]) // Default to 'derivatives'
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [filterTier, setFilterTier] = useState<number | null>(null)

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return GRAPH_NODES.filter((n) => {
      const matchCat = activeCategory === 'all' || n.category === activeCategory
      const matchTier = filterTier === null || n.tier === filterTier
      return matchCat && matchTier
    })
  }, [activeCategory, filterTier])

  const filteredEdges = useMemo(() => {
    return GRAPH_EDGES.filter((e) =>
      filteredNodes.some((n) => n.id === e.source) &&
      filteredNodes.some((n) => n.id === e.target)
    )
  }, [filteredNodes])

  // Handlers
  const handleNodeHover = (node: GraphNode | null) => {
    setHoveredNode(node)
    if (node) {
      soundEngine.playHover()
    }
  }

  const handleNodeSelect = (node: GraphNode) => {
    setSelectedNode(node)
    soundEngine.playNodeSelect()
  }

  return (
    <section
      id="interactive-constellation"
      className="relative min-h-screen w-full bg-[#030307] py-24 px-4 sm:px-8 border-t border-white/[0.05] overflow-hidden flex flex-col justify-between"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[500px] bg-cyan-950/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[400px] bg-emerald-950/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Header & Telemetry Bar */}
      <div className="max-w-7xl mx-auto w-full mb-6 z-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.07]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 font-mono text-[10px] tracking-widest uppercase mb-3">
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>INTERACTIVE TOPOLOGICAL EXPLORER</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white tracking-tight">
              The Knowledge Constellation.
            </h2>
            <p className="text-slate-400 text-sm font-light mt-1 max-w-xl">
              Select any node to inspect its prerequisite lineage, axiomatic foundations, and live curriculum telemetry.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Clusters' },
              { id: 'calculus', label: 'Calculus' },
              { id: 'linear-algebra', label: 'Linear Algebra' },
              { id: 'probability', label: 'Probability' },
              { id: 'machine-learning', label: 'Machine Learning' },
              { id: 'physics', label: 'Physics' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  soundEngine.playHover()
                }}
                className={`px-3 py-1.5 rounded-full font-mono text-xs tracking-wider transition-all ${
                  activeCategory === cat.id
                    ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                    : 'text-white/50 border border-white/[0.08] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Graph Area + Spacecraft Instrument Panel */}
      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-20 min-h-[620px]">
        {/* Constellation Canvas (occupies 70% desktop / 8 cols) */}
        <div className="lg:col-span-8 relative h-[520px] lg:h-full rounded-2xl glass-panel border border-white/[0.08] p-4 flex items-center justify-center overflow-hidden shadow-2xl">
          {/* Coordinates HUD overlay */}
          <div className="absolute top-4 left-6 flex items-center gap-4 text-[10px] font-mono text-white/40 pointer-events-none z-20">
            <span>NODES: {filteredNodes.length}</span>
            <span>RELATIONS: {filteredEdges.length}</span>
            <span className="hidden sm:inline text-cyan-400">STATUS: INTERACTIVE VIEWPORT</span>
          </div>

          {/* Graph SVG Canvas */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="space-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#06b6d4" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Edges */}
            <g className="edges">
              {filteredEdges.map((edge) => {
                const source = filteredNodes.find((n) => n.id === edge.source)
                const target = filteredNodes.find((n) => n.id === edge.target)
                if (!source || !target) return null

                const isConnected =
                  (selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target)) ||
                  (hoveredNode && (hoveredNode.id === edge.source || hoveredNode.id === edge.target))

                return (
                  <line
                    key={edge.id}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isConnected ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)'}
                    strokeWidth={isConnected ? 0.8 : 0.3}
                    strokeDasharray={edge.type === 'concept' ? '0.8 0.8' : undefined}
                    className="transition-all duration-300"
                  />
                )
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id
                const isHovered = hoveredNode?.id === node.id
                const isNeighbor =
                  (selectedNode &&
                    (selectedNode.connectedIds.includes(node.id) ||
                      selectedNode.prerequisites.includes(node.id))) ||
                  (hoveredNode &&
                    (hoveredNode.connectedIds.includes(node.id) ||
                      hoveredNode.prerequisites.includes(node.id)))

                const isDimmed =
                  (selectedNode || hoveredNode) && !isSelected && !isHovered && !isNeighbor

                const catColor = CATEGORY_COLORS[node.category]
                const radius = node.size * 0.18

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => handleNodeHover(node)}
                    onMouseLeave={() => handleNodeHover(null)}
                    onClick={() => handleNodeSelect(node)}
                    style={{
                      opacity: isDimmed ? 0.22 : 1,
                    }}
                  >
                    {/* Ring aura for selected / active node */}
                    {isSelected && (
                      <circle
                        r={radius * 3.2}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="0.3"
                        strokeDasharray="1 1"
                        className="animate-spin"
                        style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                      />
                    )}

                    {/* Outer glow flare */}
                    {(isSelected || isHovered) && (
                      <circle r={radius * 2.8} fill="url(#space-glow)" opacity="0.35" />
                    )}

                    {/* Core node */}
                    <circle
                      r={isSelected ? radius * 1.5 : isHovered ? radius * 1.3 : radius}
                      fill={isSelected ? '#ffffff' : catColor.accent}
                      className="transition-all duration-300"
                    />

                    {/* Small center dot */}
                    <circle r={radius * 0.3} fill="#030308" />

                    {/* Monospace Label */}
                    <text
                      y={radius + 2}
                      textAnchor="middle"
                      fill={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
                      fontSize={isSelected ? '1.5' : '1.2'}
                      fontFamily="var(--font-mono)"
                      fontWeight={isSelected ? '600' : '400'}
                      className="select-none pointer-events-none transition-colors"
                    >
                      {node.label}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Bottom Zoom & Tip banner */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[10px] font-mono text-white/40 border-t border-white/[0.06] pt-2">
            <span>TIP: CLICK ANY NODE TO LOCK TELEMETRY PANEL</span>
            <span className="text-cyan-400">FILTER: {activeCategory.toUpperCase()}</span>
          </div>
        </div>

        {/* Spacecraft Instrument HUD Panel (occupies 30% desktop / 4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-2xl glass-panel border border-cyan-500/30 p-6 flex flex-col justify-between shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative overflow-hidden"
              >
                {/* Top Instrument Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-mono text-[10px] tracking-widest text-cyan-300 uppercase">
                        NODE INSPECTOR // HUD-09
                      </span>
                    </div>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                        CATEGORY_COLORS[selectedNode.category].badge
                      }`}
                    >
                      {selectedNode.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-white/40 tracking-wider mb-1">
                    {selectedNode.syllabusUnit}
                  </div>
                  <h3 className="font-editorial text-2xl font-bold text-white mb-2">
                    {selectedNode.label}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {selectedNode.description}
                  </p>

                  {/* Formula Box */}
                  {selectedNode.formula && (
                    <div className="p-3 rounded-lg bg-black/60 border border-white/[0.08] font-mono text-xs text-cyan-300 mb-4 overflow-x-auto">
                      <div className="text-[9px] text-white/40 uppercase mb-1">Canonical Expression</div>
                      {selectedNode.formula}
                    </div>
                  )}

                  {/* Prerequisites lineage */}
                  <div className="mb-4">
                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Strict Prerequisites</span>
                      <span className="text-cyan-400">
                        {selectedNode.prerequisites.length === 0 ? 'None (Foundational)' : selectedNode.prerequisites.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.prerequisites.length === 0 ? (
                        <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/20">
                          Foundational Root Node (Tier 1)
                        </span>
                      ) : (
                        selectedNode.prerequisites.map((prereqId) => {
                          const prereqNode = GRAPH_NODES.find((n) => n.id === prereqId)
                          return (
                            <button
                              key={prereqId}
                              onClick={() => prereqNode && handleNodeSelect(prereqNode)}
                              className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/[0.04] text-white/80 border border-white/[0.1] hover:border-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              ← {prereqNode?.label || prereqId}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Connected Concepts */}
                  <div className="mb-4">
                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1.5">
                      Connected Downstream Concepts
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.connectedIds.map((connId) => {
                        const connNode = GRAPH_NODES.find((n) => n.id === connId)
                        return (
                          <button
                            key={connId}
                            onClick={() => connNode && handleNodeSelect(connNode)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/30 text-cyan-300/80 border border-cyan-500/20 hover:border-cyan-400 transition-colors"
                          >
                            → {connNode?.label || connId}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Citation & Grounding */}
                  <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.06] text-[10px] font-mono text-white/60 mb-4">
                    <span className="text-white/40 block">OFFICIAL SOURCE CITATION:</span>
                    {selectedNode.citation}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
                    <span>ESTIMATED MASTERY:</span>
                    <span className="text-emerald-400 font-semibold">{selectedNode.mastery}%</span>
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.playSourceFlare()
                      if (onStudyTopic) onStudyTopic(selectedNode.label)
                      else {
                        const el = document.getElementById('visual-qa')
                        if (el) el.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-cyan-400 text-black font-mono text-xs tracking-wider uppercase font-semibold hover:bg-cyan-300 transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Study this topic with AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full rounded-2xl glass-panel border border-white/[0.08] p-6 flex flex-col items-center justify-center text-center">
                <Compass className="w-8 h-8 text-white/20 mb-3" />
                <div className="font-mono text-xs text-white/60">NO NODE SELECTED</div>
                <p className="text-[11px] text-white/40 mt-1 max-w-xs">
                  Click on any node in the constellation canvas to bring up its spacecraft telemetry dossier.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
export default InteractiveConstellation
