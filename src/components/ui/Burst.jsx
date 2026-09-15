import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '../../lib/motion'

/**
 * Particle burst fired when a pillar is completed. Purely decorative, so it is
 * skipped entirely under prefers-reduced-motion.
 */
export function Burst({ trigger, accent = '#ff7a1a', count = 14, spread = 78 }) {
  const reduced = useReducedMotion()
  const [key, setKey] = useState(null)

  useEffect(() => {
    if (trigger) setKey(trigger)
  }, [trigger])

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
        const distance = spread * (0.55 + Math.random() * 0.65)
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 3 + Math.random() * 4,
          delay: Math.random() * 0.06,
        }
      }),
    [count, spread, key]
  )

  if (reduced || !key) return null

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible">
      <AnimatePresence>
        <div key={key} className="relative">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{ background: accent, width: p.size, height: p.size }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.62, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
          <motion.span
            className="absolute -left-6 -top-6 h-12 w-12 rounded-full"
            style={{ border: `2px solid ${accent}` }}
            initial={{ scale: 0.3, opacity: 0.85 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </AnimatePresence>
    </div>
  )
}

/** Full-screen confetti for level-ups and perfect days. */
export function Confetti({ show, onDone, accents = ['#ff7a1a', '#32d583', '#5b9cff', '#fdb022', '#ff5c8a'] }) {
  const reduced = useReducedMotion()

  const pieces = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        accent: accents[i % accents.length],
        delay: Math.random() * 0.35,
        duration: 1.5 + Math.random() * 1.1,
        rotate: Math.random() * 720 - 360,
        size: 5 + Math.random() * 6,
        drift: Math.random() * 90 - 45,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [show]
  )

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => onDone?.(), reduced ? 400 : 2700)
    return () => clearTimeout(t)
  }, [show, onDone, reduced])

  if (!show || reduced) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-[2px]"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size * 1.7,
            background: p.accent,
          }}
          initial={{ y: -30, opacity: 0, rotate: 0 }}
          animate={{ y: '104vh', x: p.drift, opacity: [0, 1, 1, 0.4], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

export default Burst
