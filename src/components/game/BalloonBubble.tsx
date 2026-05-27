import { motion, AnimatePresence } from 'framer-motion'
import type { Balloon } from '../../types'
import { BALLOON_COLOR_MAP } from '../../data/animals'
import { useAudio } from '../../hooks/useAudio'
import { useGameStore } from '../../store/gameStore'

interface Props {
  balloon: Balloon
  animalId: string
  disabled: boolean
}

export function BalloonBubble({ balloon, animalId, disabled }: Props) {
  const { popBalloon } = useGameStore()
  const { playBalloonPop } = useAudio()

  // Gradient IDs are scoped to balloon.id — NOT to colour.
  // Two same-colour balloons on screen would share ids and break both if keyed by colour.
  const bodyId = `body-${balloon.id}`
  const rimId  = `rim-${balloon.id}`

  const colors = BALLOON_COLOR_MAP[balloon.color] ?? { base: '#ff5252', dark: '#c62828' }
  const { base, dark } = colors

  const handlePop = (e: React.PointerEvent) => {
    e.stopPropagation()
    if (disabled) return
    playBalloonPop()
    popBalloon(animalId, balloon.id)
  }

  return (
    <AnimatePresence>
      <motion.div
        key={balloon.id}
        className="absolute cursor-pointer"
        style={{
          left: `calc(50% + ${balloon.x}px)`,
          top: `${balloon.offsetY}px`,
          transform: 'translateX(-50%)',
        }}
        initial={{ scale: 1 }}
        whileTap={{ scale: 1.3 }}
        exit={{ scale: 2.4, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 20 }}
        onPointerDown={handlePop}
      >
        <svg width="56" height="76" viewBox="0 0 56 76" aria-label={`${balloon.color} balloon`}>
          <defs>
            {/* Body gradient: light source top-left. White hotspot → base at 12% → dark rim. */}
            <radialGradient id={bodyId} cx="35%" cy="25%" r="70%" fx="35%" fy="25%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.92)" />
              <stop offset="12%"  stopColor={base} />
              <stop offset="100%" stopColor={dark} />
            </radialGradient>

            {/* Rim shadow: centred at bottom — creates the sphere-curling-away illusion. */}
            <radialGradient id={rimId} cx="50%" cy="88%" r="52%">
              <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Balloon body */}
          <ellipse cx="28" cy="27" rx="22" ry="25" fill={`url(#${bodyId})`} />

          {/* Rim shadow */}
          <ellipse cx="28" cy="44" rx="20" ry="11" fill={`url(#${rimId})`} />

          {/* Soft lower-right bounce-light reflection */}
          <ellipse cx="37" cy="37" rx="6" ry="5" fill="rgba(255,255,255,0.14)" />

          {/* Googly eyes — left */}
          <ellipse cx="21" cy="19" rx="5.5" ry="5.5" fill="white" opacity="0.92"/>
          <circle  cx="23" cy="20" r="2.8" fill="#222"/>
          {/* Googly eyes — right */}
          <ellipse cx="35" cy="19" rx="5.5" ry="5.5" fill="white" opacity="0.92"/>
          <circle  cx="37" cy="20" r="2.8" fill="#222"/>

          {/* Knot — teardrop path instead of a flat circle */}
          <path
            d="M25 51 C24 54 26 57 28 56.5 C30 57 32 54 31 51 C30 52 29 52.5 28 52.5 C27 52.5 26 52 25 51Z"
            fill={dark}
          />

          {/* String — organic cubic bezier, not near-straight */}
          <path
            d="M28 57 C23 63 33 67 27 75"
            stroke="#b8b8b8"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </AnimatePresence>
  )
}
