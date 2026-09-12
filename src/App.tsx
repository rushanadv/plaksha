import React, { useState } from 'react'
import { Navbar } from './components/Navbar'
import { KnowledgeSingularityHero } from './components/KnowledgeSingularityHero'
import { HeroConstellation } from './components/HeroConstellation'
import { SyllabusReveal } from './components/SyllabusReveal'
import { KnowledgeNetwork } from './components/KnowledgeNetwork'
import { InteractiveConstellation } from './components/InteractiveConstellation'
import { VisualQA } from './components/VisualQA'
import { ProgressConstellation } from './components/ProgressConstellation'
import { BeforeAfterToggle } from './components/BeforeAfterToggle'
import { StudyPlan } from './components/StudyPlan'
import { TrustSection } from './components/TrustSection'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { SyllabusUploadModal } from './components/SyllabusUploadModal'

export function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false)

  const handleStudyTopic = (topicName: string) => {
    // Scroll smoothly to VisualQA and fill search
    const el = document.getElementById('visual-qa')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#020205] text-[#e2e8f0] relative selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* Fixed Header */}
      <Navbar onOpenUploadModal={() => setIsUploadModalOpen(true)} />

      <main className="w-full flex flex-col">
        {/* Cinematic Knowledge Singularity Hero with Seamless Scene 3 Transition */}
        <KnowledgeSingularityHero onOpenUploadModal={() => setIsUploadModalOpen(true)}>
          <HeroConstellation onOpenUploadModal={() => setIsUploadModalOpen(true)} />
        </KnowledgeSingularityHero>

        {/* 6-Phase Transformation Reveal */}
        <SyllabusReveal />

        {/* Knowledge is Connected */}
        <KnowledgeNetwork />

        {/* Interactive Constellation Explorer */}
        <InteractiveConstellation onStudyTopic={handleStudyTopic} />

        {/* Signature Visual Q&A Light-Trace */}
        <VisualQA />

        {/* Progress Constellation */}
        <ProgressConstellation />

        {/* Before / After Morphing Comparison */}
        <BeforeAfterToggle />

        {/* Study Plan Itinerary */}
        <StudyPlan />

        {/* Trust & Proof of Work */}
        <TrustSection />

        {/* Final Cinematic Call to Action */}
        <FinalCTA onOpenUploadModal={() => setIsUploadModalOpen(true)} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Syllabus Sandbox Modal */}
      <SyllabusUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  )
}

export default App
