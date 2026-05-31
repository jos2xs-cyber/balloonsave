import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import type { Difficulty } from '../../types'

const FLOATIES = ['🐧', '🐯', '🦙', '🐰', '🐘', '🦄']

export function WelcomeScreen() {
  const { setScreen, setDifficulty } = useGameStore()
  const [showNutsWarning, setShowNutsWarning] = useState(false)

  const launch = (d: Difficulty) => {
    setDifficulty(d)
    setScreen('game')
  }

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
          style={{ left: `${8 + i * 15}%`, top: `${10 + (i % 2) * 15}%` }}
          animate={{ y: [0, -18, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
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

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center px-5 w-full max-w-sm"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="text-7xl mb-2"
          animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🐧
        </motion.div>

        <h1
          className="text-5xl font-black text-white drop-shadow-lg mb-1 leading-tight"
          style={{ fontFamily: 'Fredoka One, cursive', textShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          Liam's Animal
        </h1>
        <h2
          className="text-4xl font-black text-yellow-300 drop-shadow-lg mb-3"
          style={{ fontFamily: 'Fredoka One, cursive', textShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        >
          Rescue! 🎈
        </h2>

        <p
          className="text-2xl font-black text-white mb-5"
          style={{ fontFamily: 'Fredoka One, cursive', textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}
        >
          Let's Play! 🎈
        </p>

        {/* Difficulty buttons */}
        <div className="flex flex-col gap-3">

          {/* Baby Mode */}
          <motion.button
            className="flex items-center gap-4 w-full px-5 py-4 rounded-3xl shadow-xl border-b-4 active:border-b-0 active:translate-y-1 text-left"
            style={{ background: '#e3f2fd', borderColor: '#64b5f6', fontFamily: 'Fredoka One, cursive' }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => launch('baby')}
          >
            <span className="text-4xl">🍼</span>
            <div>
              <div className="text-xl font-black text-blue-800">Baby Mode</div>
              <div className="text-sm font-bold text-blue-400" style={{ fontFamily: 'Nunito' }}>Nice and chill 😊</div>
            </div>
          </motion.button>

          {/* Big Kid */}
          <motion.button
            className="flex items-center gap-4 w-full px-5 py-4 rounded-3xl shadow-xl border-b-4 active:border-b-0 active:translate-y-1 text-left"
            style={{ background: '#ffeb3b', borderColor: '#f9a825', fontFamily: 'Fredoka One, cursive' }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => launch('bigkid')}
          >
            <span className="text-4xl">😜</span>
            <div>
              <div className="text-xl font-black text-yellow-900">Big Kid</div>
              <div className="text-sm font-bold text-yellow-700" style={{ fontFamily: 'Nunito' }}>You totally got this! 💪</div>
            </div>
          </motion.button>

          {/* You Must Be Nuts */}
          <motion.div
            animate={{ scale: [1, 1.025, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.button
              className="flex items-center gap-4 w-full px-5 py-4 rounded-3xl shadow-xl border-b-4 active:border-b-0 active:translate-y-1 text-left"
              style={{
                background: 'linear-gradient(135deg, #ff5722, #f44336)',
                borderColor: '#b71c1c',
                fontFamily: 'Fredoka One, cursive',
              }}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setShowNutsWarning(true)}
            >
              <span className="text-4xl">🤪</span>
              <div>
                <div className="text-xl font-black text-white">You Must Be Nuts</div>
                <div className="text-sm font-bold text-red-200" style={{ fontFamily: 'Nunito' }}>Don't say we didn't warn you 💀</div>
              </div>
            </motion.button>
          </motion.div>

        </div>
      </motion.div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-500 to-green-400" />

      {/* Nuts Warning Popup */}
      <AnimatePresence>
        {showNutsWarning && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-4xl p-7 mx-5 text-center shadow-2xl max-w-sm w-full"
              initial={{ scale: 0.4, rotate: -10, y: 80 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 1.2 }}
              >
                🚨😤🚨
              </motion.div>

              <h3
                className="text-3xl font-black mb-1"
                style={{ fontFamily: 'Fredoka One, cursive', color: '#d32f2f' }}
              >
                BOLD MOVE, KID.
              </h3>
              <p
                className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest"
                style={{ fontFamily: 'Nunito' }}
              >
                ⚠️ you have been warned ⚠️
              </p>

              <p
                className="text-sm font-bold text-gray-700 mb-6 leading-relaxed"
                style={{ fontFamily: 'Nunito' }}
              >
                Oh WOW. Look at you. 😂 NUTS mode?? Nobody told you to do that. NOBODY.
                These balloons move so fast your eyeballs will spin. 🌀
                Last kid who tried this? Still dizzy. We don't even talk about it.
                <br /><br />
                But I see that unhinged energy in your eyes... 😈
                <br />
                Fine. Don't blame us. Let's do this thing.
              </p>

              <div className="flex flex-col gap-3">
                <motion.button
                  className="bg-red-500 text-white font-black text-xl py-4 px-8 rounded-3xl shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 w-full"
                  style={{ fontFamily: 'Fredoka One, cursive' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => launch('nuts')}
                >
                  I WAS BORN READY 🔥
                </motion.button>
                <button
                  className="text-gray-400 font-bold py-2 text-sm"
                  style={{ fontFamily: 'Nunito' }}
                  onClick={() => setShowNutsWarning(false)}
                >
                  okay maybe Big Kid 😅
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
