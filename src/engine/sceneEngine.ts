import type { FloatingAnimal, FloatingAnimalConfig, BalloonColor } from '../types'
import { ANIMAL_DEFS } from '../data/animals'

let idCounter = 0
const uid = () => `a-${Date.now()}-${idCounter++}`

// Per-wave settings: how many animals and rise-speed scaling.
// Spawn timing is now driven by useSceneSpawner (queue-based, max 3 on screen).
const WAVE_SETTINGS = [
  { count: 20, speedMultiplier: 0.936 },
  { count: 25, speedMultiplier: 1.260 },
  { count: 30, speedMultiplier: 1.593 },
]

// Pick an x% position that is at least MIN_DIST away from every existing animal.
// Falls back to a random position if no clear spot is found after 30 tries.
const MIN_DIST = 24
export function pickSpacedX(existingXs: number[]): number {
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = 10 + Math.random() * 75
    if (existingXs.every(ex => Math.abs(ex - x) >= MIN_DIST)) return x
  }
  return 10 + Math.random() * 75
}

export function buildFloatingAnimal(
  cfg: FloatingAnimalConfig,
  speedMultiplier: number
): FloatingAnimal {
  const def = ANIMAL_DEFS[cfg.type]
  const balloons = cfg.balloonColors.map((color: BalloonColor, i: number) => ({
    id: `b-${uid()}-${i}`,
    color,
    x: (i - (cfg.balloonColors.length - 1) / 2) * 28,
    offsetY: -60 - i * 10,
  }))

  return {
    id: uid(),
    type: cfg.type,
    emoji: def.emoji,
    name: def.name,
    x: 10 + Math.random() * 75,
    spawnDelay: 0,
    balloons,
    isRescued: false,
    isPopping: false,
    riseSpeed: cfg.riseSpeedPx * speedMultiplier,
  }
}

export function buildWaveAnimals(
  animalConfigs: FloatingAnimalConfig[],
  waveIndex: number
): FloatingAnimal[] {
  const settings = WAVE_SETTINGS[Math.min(waveIndex, WAVE_SETTINGS.length - 1)]
  const animals = Array.from({ length: settings.count }, (_, i) => {
    const cfg = animalConfigs[i % animalConfigs.length]
    return buildFloatingAnimal(cfg, settings.speedMultiplier)
  })

  // Always place one skunk in the wave at 2× speed, at a random queue position
  const skunkIdx = Math.floor(Math.random() * animals.length)
  const orig = animals[skunkIdx]
  const skunkDef = ANIMAL_DEFS['skunk']
  animals[skunkIdx] = {
    ...orig,
    id: uid(),
    type: 'skunk',
    emoji: skunkDef.emoji,
    name: skunkDef.name,
    riseSpeed: orig.riseSpeed * 2,
    balloons: [
      { id: `b-${uid()}-0`, color: 'green', x: -14, offsetY: -60 },
      { id: `b-${uid()}-1`, color: 'green', x: 14, offsetY: -70 },
    ],
  }

  return animals
}
