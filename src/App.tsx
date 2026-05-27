import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import { WelcomeScreen } from './components/screens/WelcomeScreen'
import { GameScreen } from './components/screens/GameScreen'

export default function App() {
  const { screen } = useGameStore()

  return (
    <div className="w-full h-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        {screen === 'welcome' && (
          <motion.div
            key="welcome"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35 }}
          >
            <WelcomeScreen />
          </motion.div>
        )}

        {screen === 'game' && (
          <motion.div
            key="game"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GameScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
