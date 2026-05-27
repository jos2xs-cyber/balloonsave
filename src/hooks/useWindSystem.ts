import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAudio } from './useAudio'

export function useWindSystem(active: boolean) {
  const { triggerWindGust } = useGameStore()
  const { playWindSwipe } = useAudio()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!active) return

    const schedule = () => {
      const delay = 10_000 + Math.random() * 10_000  // 10–20s between gusts
      timerRef.current = setTimeout(() => {
        triggerWindGust()
        playWindSwipe()
        schedule()
      }, delay)
    }

    schedule()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [active]) // eslint-disable-line
}
