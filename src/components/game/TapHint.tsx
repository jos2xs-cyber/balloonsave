import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/gameStore'

export function TapHint() {
  const { floatingAnimals, parade } = useGameStore()
  const [visible, setVisible] = useState(false)

  // Show hint only when animals are present and no rescues yet
  useEffect(() => {
    if (floatingAnimals.length > 0 && parade.totalRescued === 0) {
      const t = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [floatingAnimals.length, parade.totalRescued])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute bottom-28 right-6 z-30 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <motion.div
            className="bg-white/90 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <span className="text-2xl">👆</span>
            <span
              className="text-sm font-bold text-gray-700"
              style={{ fontFamily: 'Fredoka One, cursive' }}
            >
              Tap the balloons!
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
