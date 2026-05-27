import { create } from 'zustand'
import type {
  Screen,
  FloatingAnimal,
  ParadeState,
  ParadeMember,
  PlayerConfig,
  AnnouncerMessage,
  ConfettiPiece,
} from '../types'
import { ANIMAL_DEFS } from '../data/animals'

interface GameStore {
  // Navigation
  screen: Screen
  setScreen: (s: Screen) => void

  // Player
  player: PlayerConfig
  setPlayer: (p: Partial<PlayerConfig>) => void

  // Scene
  currentSceneId: string
  setScene: (id: string) => void

  // Floating animals (active in scene)
  floatingAnimals: FloatingAnimal[]
  spawnAnimal: (animal: FloatingAnimal) => void
  rescueAnimal: (id: string) => void
  popBalloon: (animalId: string, balloonId: string) => void
  removeAnimal: (id: string) => void

  // Parade
  parade: ParadeState
  addToParade: (animal: FloatingAnimal) => void
  resetParade: () => void

  // Announcer
  announcer: AnnouncerMessage | null
  showAnnouncer: (text: string) => void
  hideAnnouncer: () => void

  // Confetti
  confetti: ConfettiPiece[]
  triggerConfetti: () => void
  clearConfetti: () => void

  // Stinky Save (skunk special event)
  stinkySave: boolean
  triggerStinkySave: () => void
  clearStinkySave: () => void

  // Wind gust
  windGust: { id: string; direction: 'left' | 'right' } | null
  triggerWindGust: () => void
  clearWindGust: () => void

  // Wave tracking
  currentWave: number
  nextWave: () => void
  resetGame: () => void
}

const INITIAL_PARADE: ParadeState = {
  members: [],
  musicIntensity: 0,
  totalRescued: 0,
}

const INITIAL_PLAYER: PlayerConfig = {
  name: 'Liam',
  avatarEmoji: '🧒',
}

const CONFETTI_COLORS = ['#ff5252', '#448aff', '#ffeb3b', '#69f0ae', '#e040fb', '#ff9100', '#ffd700']

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `c-${Date.now()}-${i}`,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 8 + Math.random() * 12,
    duration: 1.5 + Math.random() * 1.5,
    delay: Math.random() * 0.5,
  }))
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'welcome',
  setScreen: (screen) => set({ screen }),

  player: INITIAL_PLAYER,
  setPlayer: (p) => set((s) => ({ player: { ...s.player, ...p } })),

  currentSceneId: 'sky-festival',
  setScene: (id) => set({ currentSceneId: id }),

  floatingAnimals: [],
  spawnAnimal: (animal) =>
    set((s) => ({ floatingAnimals: [...s.floatingAnimals, animal] })),

  rescueAnimal: (id) => {
    const animal = get().floatingAnimals.find((a) => a.id === id)
    if (!animal || animal.isRescued) return
    set((s) => ({
      floatingAnimals: s.floatingAnimals.map((a) =>
        a.id === id ? { ...a, isRescued: true } : a
      ),
    }))
    get().addToParade(animal)
    const def = ANIMAL_DEFS[animal.type]
    const line = def.rescueLines[Math.floor(Math.random() * def.rescueLines.length)]
    const playerName = get().player.name.toUpperCase()
    if (animal.type === 'skunk') {
      get().triggerStinkySave()
    } else if (Math.random() < 0.33) {
      get().showAnnouncer(`${playerName} SAVED THE ${animal.name.toUpperCase()}!`)
      setTimeout(() => get().showAnnouncer(line), 1200)
    }
    get().triggerConfetti()
    // Remove from array after parade-join animation so wave advancement can detect completion
    setTimeout(() => get().removeAnimal(id), 700)
  },

  popBalloon: (animalId, balloonId) =>
    set((s) => ({
      floatingAnimals: s.floatingAnimals.map((a) => {
        if (a.id !== animalId) return a
        const remaining = a.balloons.filter((b) => b.id !== balloonId)
        // All balloons popped → rescue!
        if (remaining.length === 0) {
          setTimeout(() => get().rescueAnimal(animalId), 300)
          return { ...a, balloons: remaining, isPopping: true }
        }
        return { ...a, balloons: remaining }
      }),
    })),

  removeAnimal: (id) =>
    set((s) => ({
      floatingAnimals: s.floatingAnimals.filter((a) => a.id !== id),
    })),

  parade: INITIAL_PARADE,
  addToParade: (animal) =>
    set((s) => {
      const member: ParadeMember = {
        id: animal.id,
        type: animal.type,
        emoji: animal.emoji,
        name: animal.name,
        position: s.parade.members.length,
        joinedAt: Date.now(),
      }
      return {
        parade: {
          members: [...s.parade.members, member],
          musicIntensity: Math.min(5, Math.floor((s.parade.members.length + 1) / 2)),
          totalRescued: s.parade.totalRescued + 1,
        },
      }
    }),
  resetParade: () => set({ parade: INITIAL_PARADE }),

  announcer: null,
  showAnnouncer: (text) => {
    const msg: AnnouncerMessage = { id: Date.now().toString(), text, visible: true }
    set({ announcer: msg })
    setTimeout(() => {
      if (get().announcer?.id === msg.id) set({ announcer: null })
    }, 2500)
  },
  hideAnnouncer: () => set({ announcer: null }),

  confetti: [],
  triggerConfetti: () => set({ confetti: generateConfetti() }),
  clearConfetti: () => set({ confetti: [] }),

  stinkySave: false,
  triggerStinkySave: () => {
    set({ stinkySave: true })
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance('Stinky Save!')
      utterance.pitch = 1.3
      utterance.rate = 0.85
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
    setTimeout(() => set({ stinkySave: false }), 3000)
  },
  clearStinkySave: () => set({ stinkySave: false }),

  windGust: null,
  triggerWindGust: () => {
    const direction = Math.random() < 0.5 ? 'left' : 'right'
    set({ windGust: { id: Date.now().toString(), direction } })
    setTimeout(() => set({ windGust: null }), 4000)
  },
  clearWindGust: () => set({ windGust: null }),

  currentWave: 0,
  nextWave: () => set((s) => ({ currentWave: s.currentWave + 1 })),

  resetGame: () =>
    set({
      floatingAnimals: [],
      parade: INITIAL_PARADE,
      announcer: null,
      confetti: [],
      stinkySave: false,
      windGust: null,
      currentWave: 0,
    }),
}))
