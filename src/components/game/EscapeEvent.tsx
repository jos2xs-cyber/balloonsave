import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const ESCAPE_MESSAGES = [
  'Tee hee! See you later! 😄',
  'Wheeeee! I\'ll be back! 🎉',
  'Zoom! Too fast! 😂',
  'The wind took me! 🌬️',
  'I\'m going on vacation! ✈️',
]

interface Props {
  emoji: string
  x: number
  onDone: () => void
}

export function EscapeEvent({ emoji, x, onDone }: Props) {
  const [msg] = useState(
    ESCAPE_MESSAGES[Math.floor(Math.random() * ESCAPE_MESSAGES.length)]
  )

  useEffect(() => {
    const t = setTimeout(onDone, 2000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      className="absolute pointer-events-none z-30 text-center"
      style={{ left: `${x}%`, bottom: '25%', transform: 'translateX(-50%)' }}
      initial={{ opacity: 0, scale: 0.5, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: -80, scale: [0.5, 1.1, 1, 0.8] }}
      transition={{ duration: 2, ease: 'easeOut' }}
    >
      <div className="text-5xl">{emoji}</div>
      <div
        className="mt-2 bg-white/90 rounded-2xl px-3 py-1 text-sm font-bold text-gray-700 whitespace-nowrap shadow"
        style={{ fontFamily: 'Fredoka One, cursive' }}
      >
        {msg}
      </div>
    </motion.div>
  )
}
