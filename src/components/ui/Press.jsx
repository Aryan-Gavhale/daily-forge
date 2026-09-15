import { motion } from 'framer-motion'
import { haptic, springSnappy } from '../../lib/motion'

/**
 * Every tappable surface in the app. Centralising the press spring and the
 * haptic tick is what keeps taps feeling identical across screens.
 */
export function Press({
  as = 'button',
  children,
  className = '',
  onClick,
  scale = 0.96,
  hapticPattern = 12,
  disabled,
  ...rest
}) {
  const Component = motion[as] ?? motion.button

  return (
    <Component
      className={className}
      whileTap={disabled ? undefined : { scale }}
      transition={springSnappy}
      disabled={as === 'button' ? disabled : undefined}
      onClick={(e) => {
        if (disabled) return
        if (hapticPattern) haptic(hapticPattern)
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default Press
