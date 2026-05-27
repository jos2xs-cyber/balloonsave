import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import type { FloatingAnimal } from '../../types'
import { BalloonBubble } from './BalloonBubble'
import { useAudio } from '../../hooks/useAudio'
import { useGameStore } from '../../store/gameStore'

interface Props {
  animal: FloatingAnimal
  onEscaped: (id: string) => void
}

export function FloatingAnimalCard({ animal, onEscaped }: Props) {
  const hasEscaped = useRef(false)
  const fallDuration = ((window.innerHeight * 1.3) / animal.riseSpeed) * 0.45
  const { playRescueFanfare, playAnimalVoice } = useAudio()
  const [imgFailed, setImgFailed] = useState(false)
  const { windGust } = useGameStore()

  // Underdamped spring — snaps to wind side, overshoots and oscillates when gust ends
  const windTarget = useMotionValue(0)
  const windSpringX = useSpring(windTarget, { stiffness: 80, damping: 7, mass: 1 })

  // All hooks must appear before the early return — React rules of hooks.

  useEffect(() => {
    const target = windGust ? (windGust.direction === 'right' ? 1 : -1) * window.innerWidth * 0.42 : 0
    windTarget.set(target)
  }, [windGust]) // eslint-disable-line

  useEffect(() => {
    if (animal.isRescued) {
      playRescueFanfare()
      playAnimalVoice(animal.type)
    }
  }, [animal.isRescued]) // eslint-disable-line

  useEffect(() => {
    if (animal.isRescued) hasEscaped.current = true
  }, [animal.isRescued])

  const handleAnimationComplete = () => {
    if (!animal.isRescued && !hasEscaped.current) {
      hasEscaped.current = true
      onEscaped(animal.id)
    }
  }

  if (animal.isRescued) return null

  return (
    <AnimatePresence>
      {/* Outer div: pure Y fall, starts off the top of the screen */}
      <motion.div
        key={animal.id}
        className="absolute pointer-events-none"
        style={{ left: `${animal.x}%`, top: '-160px', transform: 'translateX(-50%)' }}
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: window.innerHeight + 300 }}
        transition={{ duration: fallDuration, ease: 'linear' }}
        onAnimationComplete={handleAnimationComplete}
      >
        {/* Wind gust layer: underdamped spring oscillates after gust ends */}
        <motion.div style={{ x: windSpringX }}>
        {/* Inner div: left-right sway, independent of the fall */}
        <motion.div
          animate={{ x: [0, 35, -30, 40, -35, 20, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        >
          <div className="relative pointer-events-auto">
            {/* Balloons sit above the animal — parachute arrangement */}
            {animal.balloons.map((b) => (
              <BalloonBubble
                key={b.id}
                balloon={b}
                animalId={animal.id}
                disabled={animal.isPopping}
              />
            ))}

            {/* Animal — Twemoji SVG with emoji fallback */}
            <motion.div
              className="relative z-10 flex items-center justify-center cursor-pointer select-none"
              style={{ width: 64, height: 64 }}
              animate={{ rotate: [0, -9, 9, -9, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              aria-label={animal.name}
            >
              {imgFailed ? (
                <span style={{ fontSize: '56px', lineHeight: 1 }}>{animal.emoji}</span>
              ) : (
                <img
                  src={`/animals/${animal.type}.svg`}
                  alt={animal.name}
                  width={64}
                  height={64}
                  loading="eager"
                  draggable={false}
                  onError={() => setImgFailed(true)}
                  style={{ display: 'block' }}
                />
              )}
              {/* Shimmer ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white/40"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            </motion.div>

            {/* Name label */}
            <div className="text-center mt-1">
              <span
                className="bg-white/80 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ fontFamily: 'Fredoka One, cursive' }}
              >
                {animal.name}
              </span>
            </div>
          </div>
        </motion.div>
        </motion.div> {/* end wind gust layer */}
      </motion.div>
    </AnimatePresence>
  )
}
