import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

export function StinkySaveBanner() {
  const { stinkySave } = useGameStore()

  return (
    <AnimatePresence>
      {stinkySave && (
        <motion.div
          className="absolute inset-0 z-[5] flex flex-col items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Stink clouds */}
          {['15%', '70%', '40%', '85%'].map((left, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl pointer-events-none"
              style={{ left, top: `${20 + i * 15}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: [0, 0.7, 0.4] }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              💨
            </motion.div>
          ))}

          {/* Main text */}
          <motion.div
            className="relative z-10 text-center select-none"
            initial={{ scale: 0.3, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: [-10, 4, -2, 0], opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
          >
            <div
              className="leading-none mb-2"
              style={{
                fontFamily: 'Fredoka One, cursive',
                fontSize: 'clamp(4rem, 18vw, 9rem)',
                fontWeight: 900,
                color: '#69f0ae',
                WebkitTextStroke: '4px #1a6b3a',
                filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.5))',
                lineHeight: 0.95,
              }}
            >
              STINKY
            </div>
            <div
              className="leading-none"
              style={{
                fontFamily: 'Fredoka One, cursive',
                fontSize: 'clamp(4rem, 18vw, 9rem)',
                fontWeight: 900,
                color: '#ffeb3b',
                WebkitTextStroke: '4px #c47d00',
                filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.5))',
                lineHeight: 0.95,
              }}
            >
              SAVE!
            </div>
            <motion.div
              className="text-center mt-4"
              style={{ fontSize: 'clamp(3rem, 10vw, 5rem)' }}
              animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: 2 }}
            >
              🦨
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
