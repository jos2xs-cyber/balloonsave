import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#ff5252', '#ffeb3b', '#69f0ae', '#448aff', '#e040fb', '#ff9100', '#ffd700', '#ffffff']

interface Particle {
  id: string
  originX: number  // vw %
  originY: number  // vh %
  dx: number       // final x offset px
  dy: number       // final y offset px
  size: number
  color: string
  shape: 'circle' | 'square'
  delay: number
  duration: number
}

function makeBurst(burstId: number, ox: number, oy: number, count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
    const speed = 80 + Math.random() * 220
    return {
      id: `fw-${burstId}-${i}`,
      originX: ox,
      originY: oy,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? 'circle' : 'square',
      delay: Math.random() * 0.3,
      duration: 0.7 + Math.random() * 0.5,
    }
  })
}

interface Props {
  active: boolean
}

export function FireworksLayer({ active }: Props) {
  // Stable set of burst origins — re-computed each time active flips true via key trick
  const particles = useMemo(() => {
    const bursts = [
      { x: 20, y: 25, n: 22 },
      { x: 50, y: 15, n: 28 },
      { x: 80, y: 25, n: 22 },
      { x: 15, y: 55, n: 18 },
      { x: 85, y: 55, n: 18 },
      { x: 35, y: 40, n: 20 },
      { x: 65, y: 40, n: 20 },
      { x: 50, y: 60, n: 24 },
    ]
    return bursts.flatMap((b, i) => makeBurst(i, b.x, b.y, b.n))
  }, []) // eslint-disable-line

  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 45 }}>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.originX}%`,
                top: `${p.originY}%`,
                width: p.size,
                height: p.size,
                borderRadius: p.shape === 'circle' ? '50%' : '2px',
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size}px ${p.color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.2 }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
