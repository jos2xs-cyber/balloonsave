export type AnimalType = 'penguin' | 'tiger' | 'llama' | 'bunny' | 'elephant' | 'unicorn' | 'monkey' | 'panda' | 'frog' | 'duck' | 'skunk'

export type BalloonColor =
  | 'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'orange'

export type InteractionType = 'tap-balloon' | 'drag-wind' | 'tap-parachute'

export type Screen = 'welcome' | 'game'

export type Difficulty = 'baby' | 'bigkid' | 'nuts'

export type BeatType = 'narration' | 'rescue' | 'celebration'

export interface Balloon {
  id: string
  color: BalloonColor
  x: number        // 0–100 percent of scene width
  offsetY: number  // vertical offset from animal
}

export interface FloatingAnimal {
  id: string
  type: AnimalType
  emoji: string
  name: string
  x: number          // 0–100 percent
  spawnDelay: number // ms before appearing
  balloons: Balloon[]
  isRescued: boolean
  isPopping: boolean
  riseSpeed: number  // px/s
}

export interface ParadeMember {
  id: string
  type: AnimalType
  emoji: string
  name: string
  position: number   // index in parade
  joinedAt: number   // timestamp
}

export interface ParadeState {
  members: ParadeMember[]
  musicIntensity: number  // 0–5
  totalRescued: number
}

export interface SceneConfig {
  id: string
  name: string
  backgroundGradient: string[]
  animals: FloatingAnimalConfig[]
  narrationLines: string[]
  waveCount: number
}

export interface FloatingAnimalConfig {
  type: AnimalType
  balloonColors: BalloonColor[]
  spawnDelayMs: number
  riseSpeedPx: number
}

export interface PlayerConfig {
  name: string
  avatarEmoji: string
  companionId?: string
}

export interface CompanionConfig {
  id: string
  name: string
  emoji: string
  encouragements: string[]
}

export interface AnnouncerMessage {
  id: string
  text: string
  visible: boolean
}

export interface ConfettiPiece {
  id: string
  x: number
  color: string
  size: number
  duration: number
  delay: number
}
