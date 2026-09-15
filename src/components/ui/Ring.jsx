import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '../../lib/motion'

/**
 * Progress ring that animates by spring rather than by tween, so a value that
 * changes mid-animation redirects smoothly instead of restarting.
 */
export function Ring({
  progress = 0,
  size = 180,
  stroke = 12,
  accent = '#ff7a1a',
  track = 'rgba(255,255,255,0.07)',
  glow = true,
  children,
  rounded = true,
  startAngle = -90,
}) {
  const reduced = useReducedMotion()
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const raw = useMotionValue(reduced ? clamp(progress) : 0)
  const spring = useSpring(raw, { stiffness: 90, damping: 22, mass: 0.9 })
  const offset = useTransform(spring, (p) => circumference * (1 - clamp(p)))

  useEffect(() => {
    raw.set(clamp(progress))
  }, [progress, raw])

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        {glow && (
          <defs>
            <filter id={`ring-glow-${Math.round(size)}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap={rounded ? 'round' : 'butt'}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          filter={glow ? `url(#ring-glow-${Math.round(size)})` : undefined}
          transform={startAngle !== -90 ? `rotate(${startAngle + 90} ${size / 2} ${size / 2})` : undefined}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

/** Several concentric rings, Apple-Activity style. `rings` is outermost first. */
export function RingStack({ rings, size = 180, stroke = 11, gap = 6, children }) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {rings.map((r, i) => (
        <div key={r.id ?? i} className="absolute grid place-items-center">
          <Ring
            progress={r.progress}
            size={size - i * (stroke + gap) * 2}
            stroke={stroke}
            accent={r.accent}
            glow={i === 0}
          />
        </div>
      ))}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

/** Horizontal bar with the same spring feel, for compact rows. */
export function Bar({ progress = 0, accent = '#ff7a1a', height = 6, className = '', delay = 0 }) {
  const reduced = useReducedMotion()
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-white/[0.07] ${className}`}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: accent }}
        initial={{ width: reduced ? `${clamp(progress) * 100}%` : 0 }}
        animate={{ width: `${clamp(progress) * 100}%` }}
        transition={{ type: 'spring', stiffness: 110, damping: 24, delay }}
      />
    </div>
  )
}

function clamp(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return 0
  return Math.min(1, Math.max(0, v))
}

export default Ring
