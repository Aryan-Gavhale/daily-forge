import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'
import { useReducedMotion } from '../../lib/motion'

/**
 * Number that rolls to its new value.
 *
 * Writes through a ref rather than React state so a 60fps count-up does not
 * re-render the tree on every frame.
 */
export function Counter({
  value = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  duration,
  separator = true,
  ...rest
}) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const motionValue = useMotionValue(reduced ? value : 0)
  const spring = useSpring(motionValue, {
    stiffness: duration ? 60 : 95,
    damping: 24,
    mass: 0.85,
  })

  useEffect(() => {
    motionValue.set(Number(value) || 0)
  }, [value, motionValue])

  useEffect(() => {
    const format = (n) => {
      const fixed = Number(n).toFixed(decimals)
      if (!separator) return fixed
      const [int, dec] = fixed.split('.')
      const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return dec ? `${grouped}.${dec}` : grouped
    }

    if (ref.current) ref.current.textContent = `${prefix}${format(spring.get())}${suffix}`

    return spring.on('change', (latest) => {
      if (ref.current) ref.current.textContent = `${prefix}${format(latest)}${suffix}`
    })
  }, [spring, decimals, prefix, suffix, separator])

  return <span ref={ref} className={`tnum ${className}`} {...rest} />
}

export default Counter
