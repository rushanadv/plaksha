// Web Audio API Synthesizer for subtle cosmic UI chimes and pulses
class AudioEngine {
  private ctx: AudioContext | null = null
  private isMuted: boolean = true // Muted by default for respectful UX

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    if (!this.isMuted) {
      this.initContext()
      this.playChime(660, 0.08, 'sine', 0.1)
    }
    return this.isMuted
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  public playHover() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const now = this.ctx.currentTime

      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.05)

      gain.gain.setValueAtTime(0.015, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.07)
    } catch {
      // AudioContext error handling
    }
  }

  public playNodeSelect() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime
      const freqs = [523.25, 659.25, 783.99] // C Major triad chime

      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator()
        const gain = this.ctx!.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.03)

        gain.gain.setValueAtTime(0.035 / (idx + 1), now + idx * 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45 + idx * 0.05)

        osc.connect(gain)
        gain.connect(this.ctx!.destination)

        osc.start(now + idx * 0.03)
        osc.stop(now + 0.55)
      })
    } catch {
      // AudioContext error handling
    }
  }

  public playTracePulse(pitchMultiplier: number = 1) {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440 * pitchMultiplier, now)
      osc.frequency.exponentialRampToValueAtTime(880 * pitchMultiplier, now + 0.18)

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.23)
    } catch {
      // AudioContext error handling
    }
  }

  public playSourceFlare() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime

      // Sub warm burst
      const sub = this.ctx.createOscillator()
      const subGain = this.ctx.createGain()
      sub.type = 'sine'
      sub.frequency.setValueAtTime(130.81, now) // C3
      sub.frequency.exponentialRampToValueAtTime(98.0, now + 0.6)
      subGain.gain.setValueAtTime(0.08, now)
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65)
      sub.connect(subGain)
      subGain.connect(this.ctx.destination)
      sub.start(now)
      sub.stop(now + 0.7)

      // High shimmering chord
      const harmonics = [1046.5, 1318.51, 1567.98]
      harmonics.forEach((h, i) => {
        const osc = this.ctx!.createOscillator()
        const gain = this.ctx!.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(h, now + i * 0.04)
        gain.gain.setValueAtTime(0.03, now + i * 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7)
        osc.connect(gain)
        gain.connect(this.ctx!.destination)
        osc.start(now + i * 0.04)
        osc.stop(now + 0.75)
      })
    } catch {
      // AudioContext error handling
    }
  }

  private playChime(freq: number, duration: number, type: OscillatorType, volume: number) {
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + duration + 0.05)
  }
}

export const soundEngine = new AudioEngine()
