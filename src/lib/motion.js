import { useEffect, useState } from 'react'

/**
 * Shared motion vocabulary. Every spring in the app pulls from here so the
 * whole UI decelerates at the same rate - that consistency is most of what
 * makes an interface feel native rather than "animated".
 */

export const spring = { type: 'spring', stiffness: 380, damping: 34, mass: 0.9 }
export const springSoft = { type: 'spring', stiffness: 220, damping: 30, mass: 1 }
export const springSnappy = { type: 'spring', stiffness: 520, damping: 38, mass: 0.7 }
export const springBouncy = { type: 'spring', stiffness: 460, damping: 20, mass: 0.8 }

/** Apple's sheet curve, as a framer-motion tween. */
export const easeSheet = { duration: 0.42, ease: [0.32, 0.72, 0, 1] }
export const easeOut = { duration: 0.24, ease: [0.16, 1, 0.3, 1] }

/** Arrival only - see the note in AppShell on why routes do not animate out. */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
}

/** Parent wrapper that walks children in one at a time. */
export const stagger = (delayChildren = 0.04, staggerChildren = 0.035) => ({
  animate: { transition: { delayChildren, staggerChildren } },
})

export const riseIn = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: spring,
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Mirrors the user's haptics setting. Kept as a module flag rather than read
 * from the store, because haptic() is called from deep inside render-adjacent
 * handlers where subscribing to state would be noise.
 */
let hapticsEnabled = true

export function setHapticsEnabled(enabled) {
  hapticsEnabled = enabled !== false
}

/**
 * Short haptic tick. Android fires this; iOS Safari ignores it silently, which
 * is fine - it is an enhancement, never a signal the UI depends on.
 */
export function haptic(pattern = 12) {
  if (!hapticsEnabled) return
  if (prefersReducedMotion()) return
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern)
    } catch {
      /* some browsers throw when the document is not focused */
    }
  }
}

export const hapticPatterns = {
  tick: 12,
  success: [14, 40, 22],
  levelUp: [18, 50, 18, 50, 40],
  fail: [40, 60, 40],
}
