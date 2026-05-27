import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useSceneSpawner } from '../../hooks/useSceneSpawner'
import { SceneBackground } from '../game/SceneBackground'
import { FloatingAnimalCard } from '../game/FloatingAnimalCard'
import { ParadeBar } from '../game/ParadeBar'
import { AnnouncerBanner } from '../game/AnnouncerBanner'
import { ConfettiLayer } from '../game/ConfettiLayer'
import { TapHint } from '../game/TapHint'
import { EscapeEvent } from '../game/EscapeEvent'
import { FireworksLayer } from '../game/FireworksLayer'
import { StinkySaveBanner } from '../game/StinkySaveBanner'
import { WindGustLayer } from '../game/WindGustLayer'
import { useWindSystem } from '../../hooks/useWindSystem'
import { COMPANIONS } from '../../data/companions'
import scene01 from '../../data/scenes/scene-01.json'
import scene02 from '../../data/scenes/scene-02.json'
import type { SceneConfig } from '../../types'
import { useAudio } from '../../hooks/useAudio'

const SCENES: Record<string, SceneConfig> = {
  'sky-festival': scene01 as SceneConfig,
  'rainbow-sky': scene02 as SceneConfig,
}

interface EscapeDisplay {
  id: string
  emoji: string
  x: number
}

export function GameScreen() {
  const {
    floatingAnimals,
    removeAnimal,
    parade,
    player,
    currentSceneId,
    currentWave,
    nextWave,
    setScreen,
    resetGame,
    showAnnouncer,
  } = useGameStore()
  const { playRescueFanfare, playBusHorn } = useAudio()
  const { windGust } = useGameStore()

  const scene = SCENES[currentSceneId] ?? scene01 as SceneConfig
  const companion = COMPANIONS.find((c) => c.id === player.companionId)

  const [escapeEvents, setEscapeEvents] = useState<EscapeDisplay[]>([])
  const [sessionDone, setSessionDone] = useState(false)
  const [showContinuePrompt, setShowContinuePrompt] = useState(false)
  // When true, the bus plays its exit animation; GameScreen owns this timing entirely
  const [busDeparting, setBusDeparting] = useState(false)

  const { allWaveAnimalsGone } = useSceneSpawner(scene, !sessionDone)
  useWindSystem(!sessionDone)

  // Wave-end sequence: double honk → bus exits → show prompt (or advance to ending)
  useEffect(() => {
    if (!allWaveAnimalsGone) return

    playBusHorn()
    const t1 = setTimeout(() => playBusHorn(), 600)

    const t2 = setTimeout(() => {
      setBusDeparting(true)

      if (currentWave >= scene.waveCount - 1) {
        // Last wave: let bus exit then call nextWave which triggers the ending screen
        setTimeout(() => {
          setBusDeparting(false)
          nextWave()
        }, 1200)
      } else {
        // Intermediate wave: let bus exit then show the continue prompt
        setTimeout(() => {
          setBusDeparting(false)
          setShowContinuePrompt(true)
        }, 1200)
      }
    }, 1400)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [allWaveAnimalsGone]) // eslint-disable-line

  // Companion encouragement cycle
  const [encouragementIdx, setEncouragementIdx] = useState(0)
  const triggerEncouragement = useCallback(() => {
    if (!companion) return
    const line = companion.encouragements[encouragementIdx % companion.encouragements.length]
    showAnnouncer(`${companion.emoji} ${line}`)
    setEncouragementIdx((i) => i + 1)
  }, [companion, encouragementIdx, showAnnouncer])

  const handleEscaped = useCallback(
    (id: string) => {
      const animal = floatingAnimals.find((a) => a.id === id)
      if (!animal) return
      setEscapeEvents((prev) => [
        ...prev,
        { id: `esc-${id}`, emoji: animal.emoji, x: animal.x },
      ])
      showAnnouncer(`${animal.emoji} Zoomed away! They'll be back! 😄`)
      removeAnimal(id)
    },
    [floatingAnimals, removeAnimal, showAnnouncer]
  )

  const removeEscapeEvent = useCallback((id: string) => {
    setEscapeEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const handleContinue = () => {
    setShowContinuePrompt(false)
    nextWave()
  }

  const handleSessionEnd = () => {
    playRescueFanfare()
    setSessionDone(true)
  }

  const handlePlayAgain = () => {
    resetGame()
    setSessionDone(false)
    setShowContinuePrompt(false)
    setBusDeparting(false)
  }

  // Ending appears after nextWave() pushes currentWave past the last wave index
  const showEnding = currentWave >= scene.waveCount && floatingAnimals.length === 0 && parade.totalRescued > 0 && !sessionDone

  return (
    <div className="relative w-full h-full overflow-hidden touch-none">
      <SceneBackground gradientColors={scene.backgroundGradient} />

      {/* Game area */}
      <div className="absolute inset-0 bottom-52" style={{ zIndex: 10 }}>
        {floatingAnimals.map((animal) => (
          <FloatingAnimalCard
            key={animal.id}
            animal={animal}
            onEscaped={handleEscaped}
          />
        ))}

        {escapeEvents.map((ev) => (
          <EscapeEvent
            key={ev.id}
            emoji={ev.emoji}
            x={ev.x}
            onDone={() => removeEscapeEvent(ev.id)}
          />
        ))}
      </div>

      {/* Parade bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <ParadeBar busDeparting={busDeparting} />
      </div>

      <WindGustLayer
        active={windGust !== null}
        direction={windGust?.direction ?? 'right'}
        gustId={windGust?.id ?? ''}
      />
      <AnnouncerBanner />
      <ConfettiLayer />
      <StinkySaveBanner />
      <TapHint />

      {/* Companion cheer button */}
      {companion && (
        <motion.button
          className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white/90 rounded-2xl px-3 py-2 shadow-lg"
          whileTap={{ scale: 0.9 }}
          onClick={triggerEncouragement}
          aria-label={`${companion.name} encouragement`}
        >
          <span className="text-3xl">{companion.emoji}</span>
          <span
            className="text-xs font-bold text-gray-600"
            style={{ fontFamily: 'Fredoka One, cursive' }}
          >
            Cheer!
          </span>
        </motion.button>
      )}

      {/* Wave indicator */}
      <div className="absolute top-4 right-4 z-30 bg-white/80 rounded-2xl px-3 py-1.5 shadow">
        <span
          className="text-sm font-bold text-gray-700"
          style={{ fontFamily: 'Fredoka One, cursive' }}
        >
          Wave {currentWave + 1} / {scene.waveCount}
        </span>
      </div>

      {/* Fireworks on wave complete */}
      <FireworksLayer active={showContinuePrompt} />

      {/* Wave complete — Continue? overlay */}
      <AnimatePresence>
        {showContinuePrompt && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.1 }}
              className="mb-4 select-none"
              style={{
                fontFamily: 'Fredoka One, cursive',
                fontSize: 'clamp(3rem, 12vw, 6rem)',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #ff5252, #ffeb3b, #69f0ae, #448aff, #e040fb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                lineHeight: 1,
              }}
            >
              AMAZING!
            </motion.div>

            <motion.div
              className="bg-white rounded-4xl p-8 mx-6 text-center shadow-2xl max-w-sm w-full"
              initial={{ scale: 0.6, y: 60 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
            >
              <div className="text-7xl mb-3">🚌</div>
              <h2
                className="text-4xl font-black mb-2"
                style={{ fontFamily: 'Fredoka One, cursive', color: '#F9A825' }}
              >
                Wave Complete!
              </h2>
              <p
                className="text-xl font-bold text-gray-600 mb-6"
                style={{ fontFamily: 'Fredoka One, cursive' }}
              >
                The bus drove off with {parade.totalRescued} friends!
                <br />Ready to rescue more?
              </p>
              <motion.button
                className="bg-yellow-400 text-gray-900 font-black text-2xl py-4 px-10 rounded-3xl shadow border-b-4 border-yellow-600 w-full"
                style={{ fontFamily: 'Fredoka One, cursive' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
              >
                More Friends! 🎈
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session ending overlay */}
      <AnimatePresence>
        {showEnding && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={handleSessionEnd}
          >
            <motion.div
              className="bg-white rounded-4xl p-8 mx-6 text-center shadow-2xl max-w-sm"
              initial={{ scale: 0.6, y: 60 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="text-7xl mb-3">🏆</div>
              <h2
                className="text-4xl font-black text-transparent bg-clip-text mb-2"
                style={{
                  fontFamily: 'Fredoka One, cursive',
                  backgroundImage: 'linear-gradient(135deg, #ff5252, #e040fb)',
                }}
              >
                Amazing!
              </h2>
              <p
                className="text-xl font-bold text-gray-700 mb-2"
                style={{ fontFamily: 'Fredoka One, cursive' }}
              >
                {player.name} rescued {parade.totalRescued} friends!
              </p>
              <div className="flex flex-wrap justify-center gap-1 mb-4 text-3xl">
                {parade.members.map((m) => (
                  <span key={m.id} title={m.name}>{m.emoji}</span>
                ))}
              </div>
              <p className="text-gray-500 mb-6 font-bold" style={{ fontFamily: 'Nunito' }}>
                Your parade is incredible!
              </p>
              <div className="flex flex-col gap-3">
                <motion.button
                  className="bg-yellow-400 text-gray-900 font-black text-2xl py-4 px-8 rounded-3xl shadow border-b-4 border-yellow-600"
                  style={{ fontFamily: 'Fredoka One, cursive' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayAgain}
                >
                  Play Again! 🎈
                </motion.button>
                <button
                  className="text-gray-500 font-bold py-2"
                  style={{ fontFamily: 'Nunito' }}
                  onClick={() => { resetGame(); setScreen('welcome') }}
                >
                  Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
