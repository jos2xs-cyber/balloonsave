import { useCallback } from 'react'
import type { AnimalType } from '../types'

// Module-level singleton — all useAudio() calls share one AudioContext.
// The first balloon tap (a user gesture) creates and resumes it; every subsequent
// sound from any component reuses the already-running context.
let _ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new AudioContext()
  }
  if (_ctx.state === 'suspended') {
    void _ctx.resume()
  }
  return _ctx
}

// Pre-loaded AudioBuffers for the three pop sound files
const _popBuffers: (AudioBuffer | null)[] = [null, null, null]
const _popSrcs = ['/sounds/fun1.mp3', '/sounds/fun2.mp3', '/sounds/fun3.mp3']
let _popLoadStarted = false

function loadPopSounds() {
  if (_popLoadStarted) return
  _popLoadStarted = true
  const ac = getCtx()
  _popSrcs.forEach((src, i) => {
    fetch(src)
      .then(r => r.arrayBuffer())
      .then(buf => ac.decodeAudioData(buf))
      .then(decoded => { _popBuffers[i] = decoded })
      .catch(() => { /* file missing — fallback synth will be used */ })
  })
}

function playPopBuffer() {
  // Pick a random loaded buffer; fall back to synth if none ready yet
  const loaded = _popBuffers.filter(Boolean) as AudioBuffer[]
  if (loaded.length === 0) return false
  try {
    const ac = getCtx()
    const buf = loaded[Math.floor(Math.random() * loaded.length)]
    const src = ac.createBufferSource()
    src.buffer = buf
    src.connect(ac.destination)
    src.start(ac.currentTime)
  } catch { /* silent fallback */ }
  return true
}

// Oscillator with optional pitch sweep. Pass endHz=null for a constant-pitch tone.
function tone(
  startHz: number,
  endHz: number | null,
  duration: number,
  type: OscillatorType,
  gainAmt = 0.3,
  delayMs = 0
) {
  const run = () => {
    try {
      const ac = getCtx()
      const osc = ac.createOscillator()
      const g = ac.createGain()
      osc.connect(g)
      g.connect(ac.destination)
      osc.type = type
      osc.frequency.setValueAtTime(startHz, ac.currentTime)
      if (endHz !== null) {
        osc.frequency.exponentialRampToValueAtTime(endHz, ac.currentTime + duration)
      }
      g.gain.setValueAtTime(gainAmt, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)
      osc.start(ac.currentTime)
      osc.stop(ac.currentTime + duration)
    } catch { /* silent fallback */ }
  }
  if (delayMs > 0) setTimeout(run, delayMs)
  else run()
}

// Filtered white-noise burst — used for texture in growls, pops, etc.
function noiseBurst(
  filterHz: number,
  filterType: BiquadFilterType,
  duration: number,
  gainAmt = 0.3,
  delayMs = 0
) {
  const run = () => {
    try {
      const ac = getCtx()
      const bufLen = Math.ceil(ac.sampleRate * duration)
      const buf = ac.createBuffer(1, bufLen, ac.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
      const src = ac.createBufferSource()
      src.buffer = buf
      const filter = ac.createBiquadFilter()
      filter.type = filterType
      filter.frequency.setValueAtTime(filterHz, ac.currentTime)
      const g = ac.createGain()
      g.gain.setValueAtTime(gainAmt, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)
      src.connect(filter)
      filter.connect(g)
      g.connect(ac.destination)
      src.start(ac.currentTime)
      src.stop(ac.currentTime + duration)
    } catch { /* silent fallback */ }
  }
  if (delayMs > 0) setTimeout(run, delayMs)
  else run()
}

export function useAudio() {
  const playBalloonPop = useCallback(() => {
    // Kick off preload on first user gesture (AudioContext is now running)
    loadPopSounds()
    // Play a real sound file; synthesized fallback if buffers aren't ready yet
    if (!playPopBuffer()) {
      try {
        const ac = getCtx()
        const bufLen = Math.ceil(ac.sampleRate * 0.12)
        const buf = ac.createBuffer(1, bufLen, ac.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
        const noise = ac.createBufferSource()
        noise.buffer = buf
        const filter = ac.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(800, ac.currentTime)
        filter.Q.setValueAtTime(0.8, ac.currentTime)
        const gain = ac.createGain()
        gain.gain.setValueAtTime(1.2, ac.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12)
        noise.connect(filter)
        filter.connect(gain)
        gain.connect(ac.destination)
        noise.start(ac.currentTime)
        noise.stop(ac.currentTime + 0.12)
      } catch { /* silent fallback */ }
    }
  }, [])

  const playRescueFanfare = useCallback(() => {
    ;[523, 659, 784, 1047].forEach((freq, i) => tone(freq, null, 0.25, 'sine', 0.3, i * 120))
  }, [])

  const playParadeJoin = useCallback(() => {
    tone(659,  null, 0.15, 'sine', 0.3, 0)
    tone(880,  null, 0.2,  'sine', 0.3, 150)
    tone(1047, null, 0.3,  'sine', 0.3, 300)
  }, [])

  const playWindSwipe = useCallback(() => {
    tone(200, null, 0.3, 'sawtooth', 0.3)
  }, [])

  const playBusHorn = useCallback(() => {
    tone(440, null, 0.12, 'square', 0.35, 0)
    tone(370, null, 0.14, 'square', 0.35, 150)
  }, [])

  const playAnimalVoice = useCallback((type: AnimalType) => {
    switch (type) {
      case 'penguin':
        // Descending "awnk" honk — square wave sweeps 520→260 Hz
        tone(520, 260, 0.18, 'square', 0.35)
        break

      case 'tiger':
        // Growl texture (low-pass noise) + ascending sawtooth pitch
        noiseBurst(180, 'lowpass', 0.25, 0.3)
        tone(110, 200, 0.3, 'sawtooth', 0.28, 30)
        break

      case 'llama':
        // Warbling bleat — two detuned triangles beating against each other
        tone(370, 340, 0.28, 'triangle', 0.25)
        tone(397, 362, 0.28, 'triangle', 0.2, 10)
        break

      case 'bunny':
        // Three rapid high squeaks — sine sweeps up quickly
        tone(1000, 1350, 0.07, 'sine', 0.3, 0)
        tone(1000, 1350, 0.07, 'sine', 0.3, 90)
        tone(1000, 1350, 0.07, 'sine', 0.3, 180)
        break

      case 'elephant':
        // Descending trumpet blast — fat sawtooth with harmonic layer
        tone(220, 110, 0.55, 'sawtooth', 0.45)
        tone(330, 165, 0.45, 'sawtooth', 0.22, 40)
        break

      case 'unicorn':
        // Shimmering magic chord — three simultaneous sine tones at once
        tone(1047, null, 0.5, 'sine', 0.22)
        tone(1175, null, 0.5, 'sine', 0.18)
        tone(1319, null, 0.45, 'sine', 0.15)
        break

      case 'monkey':
        // "Ooh ooh ah ah" — three rapid rising squeaks then a drop
        tone(440, 660, 0.1, 'sine', 0.3, 0)
        tone(440, 700, 0.1, 'sine', 0.3, 110)
        tone(500, 880, 0.14, 'sine', 0.3, 220)
        tone(600, 350, 0.2,  'sine', 0.25, 380)
        break

      case 'panda':
        // Gentle low bleat — soft descending sine, two pulses
        tone(380, 280, 0.35, 'sine', 0.25, 0)
        tone(300, 220, 0.25, 'sine', 0.18, 280)
        break

      case 'frog':
        // "Ribbit" — bandpass noise burst + low square click
        noiseBurst(900, 'bandpass', 0.08, 0.4, 0)
        tone(220, 180, 0.1, 'square', 0.2, 0)
        noiseBurst(700, 'bandpass', 0.1, 0.35, 130)
        tone(200, 160, 0.1, 'square', 0.18, 130)
        break

      case 'duck':
        // "Quack quack" — nasal square-wave descend, two calls
        tone(800, 500, 0.12, 'square', 0.35, 0)
        tone(750, 480, 0.1,  'square', 0.28, 180)
        break
    }
  }, [])

  return { playBalloonPop, playRescueFanfare, playParadeJoin, playWindSwipe, playBusHorn, playAnimalVoice }
}
