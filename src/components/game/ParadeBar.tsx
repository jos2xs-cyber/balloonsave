import { useMemo, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAudio } from '../../hooks/useAudio'
import { ANIMAL_DEFS } from '../../data/animals'
import type { ParadeMember } from '../../types'

const BUS_CAPACITY = 20

// Window X positions in SVG viewBox coordinates (viewBox "0 0 390 76")
const WINDOW_X = [14, 54, 94, 134, 174, 214, 254]

const facePct = (wx: number) => ({
  left:   `${((wx + 2)  / 390) * 100}%`,
  top:    `${(11        / 76)  * 100}%`,
  width:  `${(30        / 390) * 100}%`,
  height: `${(28        / 76)  * 100}%`,
})

interface FaceProps {
  member: ParadeMember
  index: number
  imgFailedMap: Record<string, boolean>
  onImgError: (id: string) => void
}

function WindowFace({ member, index, imgFailedMap, onImgError }: FaceProps) {
  const pos = facePct(WINDOW_X[index] ?? 0)
  return (
    <motion.div
      key={member.id}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      style={{
        position: 'absolute',
        ...pos,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {imgFailedMap[member.id] ? (
        <span style={{ fontSize: '80%', lineHeight: 1 }}>{member.emoji}</span>
      ) : (
        <img
          src={`/animals/${member.type}.svg`}
          alt={member.name}
          loading="eager"
          draggable={false}
          onError={() => onImgError(member.id)}
          style={{ width: '95%', height: '95%', objectFit: 'contain', display: 'block' }}
        />
      )}
    </motion.div>
  )
}

interface ParadeBarProps {
  // GameScreen sets this true when the wave ends; ParadeBar animates the bus exit
  busDeparting: boolean
}

export function ParadeBar({ busDeparting }: ParadeBarProps) {
  const { parade } = useGameStore()
  const { playBusHorn } = useAudio()
  const totalRescued = parade.totalRescued

  const grass = useMemo(
    () => Array.from({ length: 44 }, (_, i) => ({ key: i, offset: Math.random() * 8 })),
    []
  )

  // displayBusNumber is the AnimatePresence key — changes on every bus departure
  const [displayBusNumber, setDisplayBusNumber] = useState(1)
  // How many rescues happened before this bus cycle started
  const [rescuedBeforeThisBus, setRescuedBeforeThisBus] = useState(0)
  const [busIsFull, setBusIsFull] = useState(false)
  const [imgFailedMap, setImgFailedMap] = useState<Record<string, boolean>>({})
  const isDepartingRef = useRef(false)

  // Speech bubble — a random window animal chatters on a stable 5s interval
  const [bubble, setBubble] = useState<{ text: string; nudge: number; key: number } | null>(null)
  const bubbleKeyRef = useRef(0)
  const facesRef = useRef<ParadeMember[]>([])

  // Reset local state when the game resets (totalRescued goes back to 0)
  useEffect(() => {
    if (totalRescued === 0) {
      setRescuedBeforeThisBus(0)
      setDisplayBusNumber(1)
      setBusIsFull(false)
      isDepartingRef.current = false
    }
  }, [totalRescued])

  const rescuesInCurrentBus = Math.max(totalRescued - rescuedBeforeThisBus, 0)
  const windowsFilled = Math.min(rescuesInCurrentBus, WINDOW_X.length)
  const faces = windowsFilled === 0 ? [] : parade.members.slice(-windowsFilled)

  // Mid-wave bus-full departure — fires when BUS_CAPACITY reached during a wave
  useEffect(() => {
    if (rescuesInCurrentBus !== BUS_CAPACITY) return
    if (busDeparting) return  // wave-end departure takes priority
    if (isDepartingRef.current) return
    isDepartingRef.current = true

    setBusIsFull(true)
    playBusHorn()
    const t1 = setTimeout(() => playBusHorn(), 600)
    const t2 = setTimeout(() => {
      setBusIsFull(false)
      setRescuedBeforeThisBus(n => n + BUS_CAPACITY)
      setDisplayBusNumber(n => n + 1)
      isDepartingRef.current = false
    }, 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [totalRescued]) // eslint-disable-line

  // Wave-end departure — GameScreen drives this via busDeparting prop.
  // When busDeparting goes true the bus exits (via conditional render below).
  // After the exit animation, prep the next bus so it slides in when busDeparting goes false.
  useEffect(() => {
    if (!busDeparting) return
    const rescuedSnapshot = totalRescued
    const t = setTimeout(() => {
      setRescuedBeforeThisBus(rescuedSnapshot)
      setDisplayBusNumber(n => n + 1)
      isDepartingRef.current = false
    }, 900)
    return () => clearTimeout(t)
  }, [busDeparting]) // eslint-disable-line

  // Keep ref in sync so the interval always sees fresh faces without resetting
  useEffect(() => { facesRef.current = faces }, [faces])

  // Stable interval — never resets, reads faces via ref
  useEffect(() => {
    const id = setInterval(() => {
      const currentFaces = facesRef.current
      if (currentFaces.length === 0) return
      const member = currentFaces[Math.floor(Math.random() * currentFaces.length)]
      const def = ANIMAL_DEFS[member.type]
      const line = def.busLines[Math.floor(Math.random() * def.busLines.length)]
      const nudge = (Math.random() - 0.5) * 30   // slight horizontal variation
      bubbleKeyRef.current += 1
      setBubble({ text: line, nudge, key: bubbleKeyRef.current })
      setTimeout(() => setBubble(null), 3000)
    }, 5000)
    return () => clearInterval(id)
  }, [])  // intentionally empty — stable for component lifetime

  const handleImgError = (id: string) =>
    setImgFailedMap(m => ({ ...m, [id]: true }))

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">

      {/* Speech bubble — sits above the green strip, never clipped */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble.key}
            initial={{ opacity: 0, y: 12, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: `translateX(calc(-50% + ${bubble.nudge}px))`,
              marginBottom: 12,
              zIndex: 50,
              maxWidth: 240,
              minWidth: 140,
            }}
          >
            <div style={{
              background: 'white',
              border: '3px solid #222',
              borderRadius: 16,
              padding: '8px 14px',
              fontFamily: 'Fredoka One, cursive',
              fontSize: 15,
              color: '#111',
              lineHeight: 1.35,
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
              position: 'relative',
            }}>
              {bubble.text}
              {/* Tail pointing down toward the bus */}
              <div style={{
                position: 'absolute', bottom: -12, left: '50%',
                transform: 'translateX(-50%)',
                width: 0, height: 0,
                borderLeft: '9px solid transparent',
                borderRight: '9px solid transparent',
                borderTop: '12px solid #222',
              }} />
              <div style={{
                position: 'absolute', bottom: -8, left: '50%',
                transform: 'translateX(-50%)',
                width: 0, height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '10px solid white',
              }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-52 bg-gradient-to-t from-green-400 to-green-300 relative">

        {/* Grass */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 overflow-x-hidden">
          {grass.map(g => (
            <div key={g.key} className="text-lg flex-shrink-0" style={{ marginLeft: `${g.offset}px` }}>
              🌱
            </div>
          ))}
        </div>

        {/* Bus — unmounts when busDeparting; AnimatePresence plays the exit animation */}
        <div
          className="absolute bottom-0 left-0 right-0 flex justify-center"
          style={{ overflow: 'visible' }}
        >
          <AnimatePresence mode="wait">
            {!busDeparting && (
              <motion.div
                key={displayBusNumber}
                style={{ width: '100%', maxWidth: 780, position: 'relative', scaleY: 1.3, originY: 1 }}
                initial={{ x: displayBusNumber === 1 ? 0 : '-120%' }}
                animate={{
                  x: 0,
                  y: busIsFull ? [0, -14, 4, 0] : 0,
                }}
                exit={{ x: '120%' }}
                transition={{
                  x: { type: 'spring', stiffness: 140, damping: 20 },
                  y: { duration: 0.45, ease: 'easeOut' },
                }}
              >
                <svg
                  viewBox="0 0 390 76"
                  style={{ width: '100%', display: 'block' }}
                  aria-label="rescue bus"
                >
                  {/* Wheels — drawn first so body covers the top arc */}
                  <circle cx="68"  cy="64" r="13" fill="#111"/>
                  <circle cx="68"  cy="64" r="7"  fill="#666"/>
                  <circle cx="68"  cy="64" r="3"  fill="#444"/>
                  <circle cx="362" cy="64" r="10" fill="#111"/>
                  <circle cx="362" cy="64" r="5.5" fill="#666"/>
                  <circle cx="362" cy="64" r="2.5" fill="#444"/>

                  {/* Amber body base */}
                  <rect x="6" y="6" width="370" height="54" rx="4" fill="#F9A825"/>
                  {/* Lighter yellow band — passenger section + door */}
                  <rect x="6" y="6" width="330" height="34" rx="4" fill="#FDD835"/>

                  {/* Three bold horizontal stripes through passenger + door */}
                  <rect x="6" y="40" width="330" height="4" fill="#111"/>
                  <rect x="6" y="47" width="330" height="4" fill="#111"/>
                  <rect x="6" y="54" width="330" height="4" fill="#111"/>

                  {/* 7 passenger windows */}
                  {WINDOW_X.map((wx, i) => (
                    <rect
                      key={i}
                      x={wx} y="8" width="34" height="32" rx="3"
                      fill={i < windowsFilled ? 'rgba(255,255,255,0.15)' : '#D0EAF8'}
                      stroke="#222"
                      strokeWidth="1.5"
                    />
                  ))}

                  {/* Entry door — two tall panels, stroke-only frame so stripes show through */}
                  <rect x="290" y="7" width="46" height="52" rx="2" fill="none" stroke="#222" strokeWidth="1.5"/>
                  <rect x="312" y="7" width="2"  height="52" fill="#222"/>
                  <rect x="293" y="9" width="17" height="43" rx="2" fill="#B3E5FC" stroke="#333" strokeWidth="1"/>
                  <rect x="316" y="9" width="16" height="43" rx="2" fill="#B3E5FC" stroke="#333" strokeWidth="1"/>

                  {/* Snub nose — rounded shape that protrudes forward below windshield */}
                  <path
                    d="M 350 34 L 374 34 Q 384 34 384 44 L 384 54 Q 384 60 374 60 L 350 60 Z"
                    fill="#F9A825"
                  />

                  {/* Windshield — raked ~20°, top edge pulled back from bottom */}
                  <polygon points="340,8 364,8 374,34 350,34" fill="#B3E5FC" stroke="#333" strokeWidth="1"/>
                  {/* Tint strip at top of windshield */}
                  <polygon points="340,8 364,8 366,13 342,13" fill="rgba(0,40,80,0.35)"/>

                  {/* Headlight on nose face */}
                  <rect x="380" y="44" width="4" height="8" rx="2" fill="#FFF9C4" stroke="#bbb" strokeWidth="0.5"/>
                  {/* Front bumper */}
                  <rect x="373" y="57" width="11" height="3" rx="1" fill="#999"/>

                  {/* Bottom dark strip */}
                  <rect x="6" y="58" width="374" height="2" rx="1" fill="#222"/>

                  {/* Stop sign arm at rear */}
                  <path d="M3 24 L6 21 L10 21 L13 24 L13 31 L10 34 L6 34 L3 31Z"
                        fill="#E53935" stroke="#B71C1C" strokeWidth="0.8"/>
                  <text x="8" y="30" fontSize="3.5" textAnchor="middle"
                        fill="white" fontFamily="sans-serif" fontWeight="bold">STOP</text>
                </svg>

                <div style={{ position: 'absolute', inset: 0 }}>
                  <AnimatePresence>
                    {faces.map((member, i) => (
                      <WindowFace
                        key={member.id}
                        member={member}
                        index={i}
                        imgFailedMap={imgFailedMap}
                        onImgError={handleImgError}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {totalRescued > 0 && (
          <motion.div
            className="absolute top-2 right-4 z-10 bg-yellow-400 text-gray-900 font-bold px-3 py-1 rounded-full text-sm shadow-lg"
            style={{ fontFamily: 'Fredoka One, cursive' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            🏆 {totalRescued} Rescued!
          </motion.div>
        )}
      </div>
    </div>
  )
}
