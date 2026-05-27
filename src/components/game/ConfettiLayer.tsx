import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useEffect } from 'react'

export function ConfettiLayer() {
  const { confetti, clearConfetti } = useGameStore()

  // Auto-clear after longest piece finishes
  useEffect(() => {
    if (confetti.length === 0) return
    const maxDuration = Math.max(...confetti.map((c) => c.duration + c.delay)) * 1000 + 200
    const timer = setTimeout(clearConfetti, maxDuration)
    return () => clearTimeout(timer)
  }, [confetti.length]) // eslint-disable-line

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute rounded-sm"
            style={{
              left: `${piece.x}%`,
              top: '-20px',
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
            }}
            initial={{ y: 0, rotate: 0, opacity: 1 }}
            animate={{ y: window.innerHeight + 40, rotate: 720, opacity: 0 }}
            exit={{}}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: 'linear',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
