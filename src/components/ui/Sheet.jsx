import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { easeSheet, spring, useReducedMotion } from '../../lib/motion'
import { useIsWide } from '../../lib/useMediaQuery'
import { useUI } from '../../store/useUI'

/**
 * iOS-style bottom sheet, which becomes a centred dialog once there is a
 * pointer and room for one.
 *
 * On a phone: drag down to dismiss with velocity, rubber-band resistance at
 * the top, a grab handle, and the page behind it scaling back (handled in
 * AppShell, which reads the sheet count this component maintains). On a wide
 * window none of that applies - dragging a dialog with a mouse is theatre -
 * so it scales in from the centre instead.
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  accent,
  maxHeight = '88vh',
  dismissible = true,
}) {
  const y = useMotionValue(0)
  const reduced = useReducedMotion()
  const wide = useIsWide()
  const pushSheet = useUI((s) => s.pushSheet)
  const popSheet = useUI((s) => s.popSheet)
  const scrollRef = useRef(null)
  /** Only allow drag-to-dismiss when the sheet body is scrolled to the top. */
  const atTop = useRef(true)
  const draggable = dismissible && !reduced && !wide

  useEffect(() => {
    if (!open) return
    pushSheet()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape' && dismissible) onClose?.()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      popSheet()
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, dismissible, onClose, pushSheet, popSheet])

  useEffect(() => {
    if (open) y.set(0)
  }, [open, y])

  const handleDragEnd = (_, info) => {
    if (!dismissible) {
      y.set(0)
      return
    }
    const farEnough = info.offset.y > 130
    const fastEnough = info.velocity.y > 620
    if (farEnough || fastEnough) onClose?.()
    else y.set(0)
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 z-50 flex justify-center ${
            wide ? 'items-center p-6' : 'items-end'
          }`}
        >
          <motion.div
            className="absolute inset-0 bg-black/60"
            style={{ backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={() => dismissible && onClose?.()}
          />

          <motion.div
            className={`relative w-full max-w-shell overflow-hidden border-hairStrong bg-ink-850 ${
              wide
                ? 'rounded-sheet border shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95)]'
                : 'rounded-t-sheet border-x border-t shadow-[0_-24px_70px_-20px_rgba(0,0,0,0.9)]'
            }`}
            style={{ y, maxHeight: wide ? '84vh' : maxHeight, touchAction: 'pan-y' }}
            initial={reduced ? { opacity: 0 } : wide ? { opacity: 0, scale: 0.96, y: 12 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : wide ? { opacity: 1, scale: 1, y: 0 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : wide ? { opacity: 0, scale: 0.97 } : { y: '100%' }}
            transition={wide ? spring : easeSheet}
            drag={draggable ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.55 }}
            dragDirectionLock
            onDragStart={() => {
              atTop.current = (scrollRef.current?.scrollTop ?? 0) <= 2
            }}
            onDrag={(_, info) => {
              if (!atTop.current && info.offset.y > 0) y.set(0)
            }}
            onDragEnd={handleDragEnd}
          >
            {accent && (
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-[0.16]"
                style={{ background: `radial-gradient(60% 100% at 50% 0%, ${accent}, transparent)` }}
              />
            )}

            {wide ? (
              <div className="pt-5" />
            ) : (
              <div className="relative flex justify-center pt-3 pb-1">
                <div className="h-1 w-9 rounded-full bg-white/25" />
              </div>
            )}

            {(title || subtitle) && (
              <div className="relative px-6 pb-3 pt-1 text-center">
                {title && (
                  <h2 className="text-[17px] font-semibold tracking-tight text-white">{title}</h2>
                )}
                {subtitle && (
                  <p className="mt-1 text-[13px] leading-snug text-white/45">{subtitle}</p>
                )}
              </div>
            )}

            <div
              ref={scrollRef}
              className="scroll-area relative px-5"
              style={{ maxHeight: `calc(${wide ? '84vh' : maxHeight} - 150px)` }}
            >
              {children}
            </div>

            <div
              className={`relative px-5 pt-3 ${
                wide ? 'pb-5' : 'pb-[calc(env(safe-area-inset-bottom,0px)+18px)]'
              }`}
            >
              {footer}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/** Full-width primary action, sized for thumbs. */
export function SheetButton({ children, onClick, tone = 'primary', accent, disabled, type = 'button' }) {
  const tones = {
    primary: 'bg-white text-black',
    ghost: 'bg-white/8 text-white/80 hairline',
    danger: 'bg-bad/15 text-bad border border-bad/30',
  }
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.975 }}
      transition={spring}
      onClick={onClick}
      style={accent && tone === 'primary' ? { background: accent, color: '#0b0b0d' } : undefined}
      className={`h-[52px] w-full rounded-2xl text-[15px] font-semibold tracking-tight transition-opacity disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </motion.button>
  )
}

export default Sheet
