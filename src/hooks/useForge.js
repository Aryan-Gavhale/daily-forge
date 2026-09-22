import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { computeStreak, evaluateDay, lastBrokenStreak, levelState } from '../lib/scoring'
import { evaluatePlan } from '../lib/plan'
import { todayKey } from '../lib/date'

/**
 * Derived reads live here rather than in components so the memo keys stay in
 * one place. Everything recomputes from `days` + `settings`, which is cheap at
 * this data size and removes any chance of cached totals drifting.
 */

/** Re-renders at local midnight so an open app rolls over to the new day. */
export function useTodayKey() {
  const [key, setKey] = useState(todayKey)

  useEffect(() => {
    const tick = () => {
      const next = todayKey()
      setKey((prev) => (prev === next ? prev : next))
    }
    const interval = setInterval(tick, 30000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return key
}

export function useDayEvaluation(date) {
  const days = useStore((s) => s.days)
  const settings = useStore((s) => s.settings)
  const today = useTodayKey()
  const key = date ?? today
  return useMemo(
    () => evaluateDay(days[key], settings, today),
    [days, settings, key, today]
  )
}

export function useStreak() {
  const days = useStore((s) => s.days)
  const settings = useStore((s) => s.settings)
  const today = useTodayKey()
  return useMemo(() => computeStreak(days, settings, today), [days, settings, today])
}

export function useLevel() {
  const days = useStore((s) => s.days)
  const settings = useStore((s) => s.settings)
  const today = useTodayKey()
  return useMemo(() => levelState(days, settings, today), [days, settings, today])
}

/** The whole 16-week plan, scored against both plan records and the pillar log. */
export function usePlan() {
  const days = useStore((s) => s.days)
  const plan = useStore((s) => s.plan)
  const settings = useStore((s) => s.settings)
  const today = useTodayKey()
  return useMemo(
    () => evaluatePlan({ plan, days, settings, now: today }),
    [plan, days, settings, today]
  )
}

/**
 * The most recently broken streak, surfaced once per break.
 * Returns null when the user has already dismissed it.
 */
export function useStreakBreak() {
  const days = useStore((s) => s.days)
  const settings = useStore((s) => s.settings)
  const today = useTodayKey()

  return useMemo(() => {
    const broken = lastBrokenStreak(days, settings, today)
    if (!broken) return null
    if (broken.length < 2) return null
    if (settings.acknowledgedBreak === broken.brokenOn) return null
    return broken
  }, [days, settings, today])
}
