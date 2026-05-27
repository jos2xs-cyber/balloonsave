import { motion } from 'framer-motion'

interface Cloud {
  id: number
  x: number
  y: number
  scale: number
  duration: number
  delay: number
}

const CLOUDS: Cloud[] = [
  { id: 1, x: 5, y: 12, scale: 1.2, duration: 35, delay: 0 },
  { id: 2, x: 30, y: 25, scale: 0.8, duration: 28, delay: -8 },
  { id: 3, x: 60, y: 8, scale: 1.5, duration: 42, delay: -15 },
  { id: 4, x: 80, y: 30, scale: 0.9, duration: 30, delay: -5 },
  { id: 5, x: 15, y: 40, scale: 0.7, duration: 25, delay: -12 },
]

interface Props {
  gradientColors: string[]
}

export function SceneBackground({ gradientColors }: Props) {
  const [top, mid, bot] = gradientColors

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${bot ?? mid} 100%)`,
      }}
    >
      {/* Sun */}
      <motion.div
        className="absolute top-8 right-12 text-6xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        ☀️
      </motion.div>

      {/* Floating clouds */}
      {CLOUDS.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute text-white/90 pointer-events-none select-none"
          style={{
            top: `${cloud.y}%`,
            fontSize: `${cloud.scale * 64}px`,
          }}
          initial={{ x: '-15vw' }}
          animate={{ x: '115vw' }}
          transition={{
            duration: cloud.duration,
            delay: cloud.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          ☁️
        </motion.div>
      ))}

      {/* Stars (visible at top) */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-yellow-200/60 pointer-events-none"
          style={{
            left: `${10 + i * 11}%`,
            top: `${3 + (i % 3) * 5}%`,
            fontSize: '18px',
          }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
        >
          ⭐
        </motion.div>
      ))}
    </div>
  )
}
