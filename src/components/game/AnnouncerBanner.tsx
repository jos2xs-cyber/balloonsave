import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

export function AnnouncerBanner() {
  const { announcer } = useGameStore()

  return (
    <div className="absolute top-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {announcer && (
          <motion.div
            key={announcer.id}
            className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl px-8 py-4 mx-4 max-w-sm text-center"
            initial={{ y: -80, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          >
            <p
              className="text-2xl font-black text-transparent bg-clip-text"
              style={{
                fontFamily: 'Fredoka One, cursive',
                backgroundImage: 'linear-gradient(135deg, #ff5252, #e040fb, #448aff)',
              }}
            >
              {announcer.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
