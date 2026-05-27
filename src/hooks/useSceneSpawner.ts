import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { buildWaveAnimals, pickSpacedX } from '../engine/sceneEngine'
import type { SceneConfig, FloatingAnimal } from '../types'

// Minimum ms between consecutive spawns — prevents a burst of 3 at wave start
const SPAWN_GAP_MS = 700

export function useSceneSpawner(scene: SceneConfig, active: boolean) {
  const { spawnAnimal, currentWave, floatingAnimals } = useGameStore()

  const queueRef      = useRef<FloatingAnimal[]>([])
  const lastSpawnRef  = useRef(0)
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [allSpawned, setAllSpawned] = useState(false)

  // Rebuild queue when the wave changes
  useEffect(() => {
    if (!active || currentWave >= scene.waveCount) return
    setAllSpawned(false)
    lastSpawnRef.current = 0
    queueRef.current = buildWaveAnimals(scene.animals, currentWave)
  }, [active, currentWave, scene]) // eslint-disable-line

  // Drain queue: each time floatingAnimals changes, check if we can spawn the next one
  useEffect(() => {
    if (!active || allSpawned || queueRef.current.length === 0) return

    // Count only active (non-rescued) non-skunks — skunk is a bonus and doesn't block spawning
    const nonSkunks = floatingAnimals.filter(a => a.type !== 'skunk' && !a.isRescued).length
    if (nonSkunks >= 3) return

    const wait = Math.max(0, SPAWN_GAP_MS - (Date.now() - lastSpawnRef.current))

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const template = queueRef.current.shift()
      if (!template) return

      // Re-read live state at fire time so the count and x positions are fresh
      const live = useGameStore.getState().floatingAnimals
      const liveNonSkunks = live.filter(a => a.type !== 'skunk' && !a.isRescued).length

      if (liveNonSkunks >= 3) {
        // Slot is full by the time the timer fired — put animal back
        queueRef.current.unshift(template)
        return
      }

      lastSpawnRef.current = Date.now()
      spawnAnimal({ ...template, x: pickSpacedX(live.map(a => a.x)) })

      if (queueRef.current.length === 0) setAllSpawned(true)
    }, wait)
  }, [floatingAnimals, active, allSpawned]) // eslint-disable-line

  // Cleanup on unmount
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return { allWaveAnimalsGone: allSpawned && floatingAnimals.length === 0 }
}
