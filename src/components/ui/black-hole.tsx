"use client"

import { useEffect, useRef } from "react"
import type { MotionValue } from "framer-motion"
import { createRenderer, type BlackHoleRenderer } from "./black-hole-utils/renderer"

export interface BlackHoleProps {
  className?: string
  intensity?: number | MotionValue<number>
  center?: [number, number]
}

export function BlackHole({ className = '', intensity = 1, center = [0.70, 0.48] }: BlackHoleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<BlackHoleRenderer | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = createRenderer({ canvas, center })
    rendererRef.current = renderer
    void renderer.ready

    return () => {
      renderer.dispose()
      rendererRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!rendererRef.current?.setIntensity) return

    if (typeof intensity === 'number') {
      rendererRef.current.setIntensity(intensity)
    } else if (intensity && typeof (intensity as MotionValue<number>).on === 'function') {
      rendererRef.current.setIntensity((intensity as MotionValue<number>).get())
      return (intensity as MotionValue<number>).on('change', (val) => {
        rendererRef.current?.setIntensity?.(val)
      })
    }
  }, [intensity])

  useEffect(() => {
    if (rendererRef.current && rendererRef.current.setCenter) {
      rendererRef.current.setCenter(center[0], center[1])
    }
  }, [center[0], center[1]])

  return (
    <div className={`relative h-full w-full overflow-hidden bg-transparent ${className}`}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
      />
    </div>
  )
}

export default BlackHole
