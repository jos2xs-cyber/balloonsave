import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  active: boolean
  direction: 'left' | 'right'
  gustId: string
}

const PARTICLES = ['🍃', '🌿', '✨', '🍃', '✨']

// Per-streak personality: varied Y start, thickness, and opacity
const STREAK_TEMPLATES = [
  { yPct: 9,  strokeWidth: 1.5, maxOpacity: 0.45 },
  { yPct: 24, strokeWidth: 3.2, maxOpacity: 0.70 },
  { yPct: 40, strokeWidth: 2.0, maxOpacity: 0.55 },
  { yPct: 57, strokeWidth: 2.6, maxOpacity: 0.62 },
  { yPct: 73, strokeWidth: 1.4, maxOpacity: 0.42 },
]

// Cubic bezier path — two independent control points give organic S-curves
function streakPath(dir: 'left' | 'right', yPct: number, w: number, h: number): string {
  const y1  = h * (yPct / 100)
  const y2  = y1 + (Math.random() - 0.5) * h * 0.16  // slight diagonal end

  // Control points placed at ~25% and ~68% across the screen, with large vertical swings
  const cp1x = w * (0.22 + Math.random() * 0.12)
  const cp1y = y1 + (Math.random() - 0.5) * h * 0.24
  const cp2x = w * (0.62 + Math.random() * 0.12)
  const cp2y = y2 + (Math.random() - 0.5) * h * 0.20

  if (dir === 'right') {
    return `M -80 ${y1} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${w + 80} ${y2}`
  }
  // Mirror control points for left-to-right reverse
  return `M ${w + 80} ${y1} C ${w - cp1x} ${cp1y} ${w - cp2x} ${cp2y} -80 ${y2}`
}

export function WindGustLayer({ active, direction, gustId }: Props) {
  const w = window.innerWidth
  const h = window.innerHeight

  const streaks = useMemo(() =>
    STREAK_TEMPLATES.map((t) => ({
      ...t,
      d: streakPath(direction, t.yPct, w, h),
    })),
  [gustId]) // eslint-disable-line

  const particles = useMemo(() => PARTICLES.map((emoji, i) => ({
    emoji,
    yPct: 6 + Math.random() * 59,
    size: 16 + Math.random() * 8,
    duration: 1.4 + Math.random() * 0.8,
    startX: direction === 'right' ? -60 : w + 60,
    endX:   direction === 'right' ? w + 60 : -60,
    delay: i * 0.15,
  })), [gustId]) // eslint-disable-line

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={gustId}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 15 }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Curved SVG wind streaks */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
          >
            {streaks.map((streak, i) => (
              <motion.path
                key={i}
                d={streak.d}
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={streak.strokeWidth}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, streak.maxOpacity, streak.maxOpacity * 0.8, 0],
                }}
                transition={{
                  duration: 1.7,
                  delay: i * 0.09,
                  ease: 'easeInOut',
                  times: [0, 0.38, 0.72, 1],
                }}
              />
            ))}
          </svg>

          {/* Flying leaf / sparkle particles */}
          {particles.map((p, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                top: `${p.yPct}%`,
                fontSize: p.size,
                willChange: 'transform',
                userSelect: 'none',
              }}
              initial={{ x: p.startX, opacity: 0 }}
              animate={{ x: p.endX, opacity: [0, 0.9, 0.9, 0] }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeInOut',
                times: [0, 0.1, 0.8, 1],
              }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
