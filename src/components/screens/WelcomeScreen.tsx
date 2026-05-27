import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

const FLOATIES = ['🐧', '🐯', '🦙', '🐰', '🐘', '🦄']

export function WelcomeScreen() {
  const { setScreen } = useGameStore()

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #2980b9 0%, #6dd5fa 50%, #ffffff 100%)' }}
    >
      {/* Floating decorative animals */}
      {FLOATIES.map((emoji, i) => (
        <motion.div
          key={emoji}
          className="absolute text-5xl pointer-events-none select-none"
          style={{
            left: `${8 + i * 15}%`,
            top: `${10 + (i % 2) * 15}%`,
          }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, i % 2 === 0 ? 8 : -8, 0],
          }}
          transition={{
            duration: 2.5 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Balloons decoration */}
      {['#ff5252', '#448aff', '#ffeb3b', '#69f0ae', '#e040fb'].map((color, i) => (
        <motion.div
          key={color}
          className="absolute pointer-events-none"
          style={{ left: `${10 + i * 18}%`, bottom: `${25 + (i % 3) * 10}%` }}
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.6 }}
        >
          <svg width="40" height="50" viewBox="0 0 56 70">
            <ellipse cx="28" cy="28" rx="22" ry="25" fill={color} />
            <ellipse cx="21" cy="18" rx="6" ry="7" fill="rgba(255,255,255,0.35)" />
            <path d="M 28 55 Q 25 65 28 70" stroke="#aaa" strokeWidth="1.5" fill="none" />
          </svg>
        </motion.div>
      ))}

      {/* Main content card */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="text-8xl mb-4"
          animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🐧
        </motion.div>

        <h1
          className="text-6xl md:text-7xl font-black text-white drop-shadow-lg mb-2 leading-tight"
          style={{ fontFamily: 'Fredoka One, cursive', textShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          Liam's Animal
        </h1>
        <h2
          className="text-5xl md:text-6xl font-black text-yellow-300 drop-shadow-lg mb-6"
          style={{ fontFamily: 'Fredoka One, cursive', textShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          Rescue! 🎈
        </h2>

        <p
          className="text-xl text-white/90 mb-8 font-bold"
          style={{ fontFamily: 'Nunito, sans-serif', textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
        >
          Pop balloons · Rescue animals · Build your parade!
        </p>

        <motion.button
          className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-2xl px-10 py-5 rounded-3xl shadow-2xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
          style={{ fontFamily: 'Fredoka One, cursive', minWidth: '200px', minHeight: '72px' }}
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.04 }}
          onClick={() => setScreen('game')}
        >
          Let's Play! 🎈
        </motion.button>
      </motion.div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-500 to-green-400" />
    </div>
  )
}
