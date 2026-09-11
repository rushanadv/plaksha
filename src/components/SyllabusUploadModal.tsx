import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  Zap,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { soundEngine } from '../lib/audio-engine'

interface SyllabusUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

const PRESETS = [
  {
    id: 'mit-1806',
    title: 'MIT 18.06 — Linear Algebra',
    units: '4 Units • 38 Concepts • Strang Syllabus',
    text: 'Vector spaces, subspace projections, Gram-Schmidt orthogonalization, determinants, eigenvalues/eigenvectors, positive definite matrices, singular value decomposition (SVD), pseudoinverses.',
  },
  {
    id: 'cs229',
    title: 'Stanford CS229 — Machine Learning',
    units: '5 Units • 44 Concepts • Ng Syllabus',
    text: 'Linear regression, batch and stochastic gradient descent, logistic regression, Generalized Linear Models, Support Vector Machines, kernels, Neural Networks, Backpropagation, PCA, Expectation-Maximization.',
  },
  {
    id: 'eng-math',
    title: 'Engineering Mathematics IV',
    units: '4 Units • 32 Concepts • University Standard',
    text: 'Limits & continuity, derivative rules, partial differential equations, Fourier transforms, Laplace transforms, contour integrals, Cauchy-Riemann equations.',
  },
]

export const SyllabusUploadModal: React.FC<SyllabusUploadModalProps> = ({ isOpen, onClose }) => {
  const [inputText, setInputText] = useState<string>('')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [progressStage, setProgressStage] = useState<number>(0)
  const [isComplete, setIsComplete] = useState<boolean>(false)

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset.id)
    setInputText(preset.text)
    soundEngine.playHover()
  }

  const handleSynthesize = () => {
    if (!inputText.trim()) return

    setIsProcessing(true)
    setProgressStage(1)
    soundEngine.playTracePulse(1)

    // Stage 1 -> Stage 2
    setTimeout(() => {
      setProgressStage(2)
      soundEngine.playTracePulse(1.3)
    }, 700)

    // Stage 2 -> Stage 3
    setTimeout(() => {
      setProgressStage(3)
      soundEngine.playTracePulse(1.6)
    }, 1400)

    // Complete
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)
      soundEngine.playSourceFlare()
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#38bdf8', '#ffffff', '#10b981'],
        })
      } catch {
        // Confetti fallback
      }
    }, 2200)
  }

  const handleReset = () => {
    setIsComplete(false)
    setProgressStage(0)
    setInputText('')
    setSelectedPreset(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl rounded-2xl glass-panel border border-cyan-500/40 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 font-mono text-[10px] tracking-widest uppercase mb-3">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>TOPOLOGICAL COMPILER</span>
              </div>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
                Upload or Select a Syllabus
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-light">
                Provide course topics or pick an official university preset to watch GuruKul map its prerequisite constellation.
              </p>
            </div>

            {!isComplete ? (
              <div>
                {/* University Presets */}
                <div className="mb-4">
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-2">
                    Quick University Presets
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedPreset === p.id
                            ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        <div className="font-mono text-xs font-semibold text-white truncate">
                          {p.title}
                        </div>
                        <div className="font-mono text-[9px] text-cyan-300/70 truncate mt-1">
                          {p.units}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Area */}
                <div className="mb-5">
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Or Paste Syllabus Text / Outline</span>
                    <span className="text-white/30">{inputText.length} chars</span>
                  </div>
                  <textarea
                    rows={4}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste topics, lecture breakdown, or chapter lists from your syllabus..."
                    className="w-full bg-[#05060b] border border-white/[0.1] rounded-xl p-3.5 text-xs text-white font-mono placeholder:text-white/25 focus:border-cyan-400 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Synthesis Progress Bar (when active) */}
                {isProcessing && (
                  <div className="mb-5 p-4 rounded-xl bg-black/60 border border-cyan-500/30">
                    <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 mb-2">
                      <span className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        {progressStage === 1 && 'STAGE 1: EXTRACTING CANONICAL THEOREMS...'}
                        {progressStage === 2 && 'STAGE 2: COMPUTING PREREQUISITE TOPOLOGY...'}
                        {progressStage === 3 && 'STAGE 3: PROJECTING CONSTELLATION NODES...'}
                      </span>
                      <span>{progressStage * 33}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-500 rounded-full shadow-[0_0_10px_#06b6d4]"
                        style={{ width: `${progressStage * 33}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full font-mono text-xs text-white/50 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!inputText.trim() || isProcessing}
                    onClick={handleSynthesize}
                    className="px-6 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40 flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize Constellation</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Complete State */
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center mx-auto mb-4 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                  <CheckCircle2 className="w-8 h-8 text-cyan-400" />
                </div>

                <h4 className="font-editorial text-2xl font-bold text-white mb-2">
                  Knowledge Constellation Synthesized!
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto mb-6">
                  Successfully mapped <span className="text-cyan-300 font-semibold font-mono">38 nodes</span> and <span className="text-emerald-300 font-semibold font-mono">52 prerequisite edges</span> into your interactive learning graph.
                </p>

                {/* Mini Preview Box */}
                <div className="h-36 rounded-xl bg-black/60 border border-white/[0.08] mb-6 p-4 flex items-center justify-center relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 100 40">
                    <line x1="20" y1="20" x2="50" y2="15" stroke="#06b6d4" strokeWidth="0.8" />
                    <line x1="50" y1="15" x2="80" y2="25" stroke="#10b981" strokeWidth="0.8" />
                    <circle cx="20" cy="20" r="3" fill="#06b6d4" />
                    <circle cx="50" cy="15" r="3.5" fill="#ffffff" stroke="#06b6d4" strokeWidth="1" />
                    <circle cx="80" cy="25" r="3" fill="#10b981" />
                  </svg>
                  <span className="absolute bottom-2 font-mono text-[9px] text-white/40">
                    GRAPH ID: GURUKUL-TOPOLOGY-2026-ALPHA
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-full font-mono text-xs text-white/60 hover:text-white border border-white/[0.1] transition-colors"
                  >
                    Compile Another
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
                  >
                    <span>View in Constellation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
export default SyllabusUploadModal
