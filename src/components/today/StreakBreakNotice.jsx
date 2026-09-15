import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { spring, haptic } from '../../lib/motion'
import { formatShort } from '../../lib/date'
import { useStore } from '../../store/useStore'
import { useStreakBreak } from '../../hooks/useForge'

/**
 * Shown once after a streak dies. Strict mode is only strict if the loss is
 * stated plainly instead of quietly resetting a number to zero.
 */
export function StreakBreakNotice() {
  const broken = useStreakBreak()
  const patchSettings = useStore((s) => s.patchSettings)

  return (
    <AnimatePresence>
      {broken && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -8 }}
          transition={spring}
          className="overflow-hidden px-5 pt-3"
        >
          <div className="relative overflow-hidden rounded-card border border-bad/30 bg-bad/[0.08] p-4">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl"
              style={{ background: 'rgba(249,112,102,0.25)' }}
            />
            <div className="relative flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-bad/15 text-bad">
                <Icon name="flame" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-white">
                  You lost a {broken.length}-day streak
                </p>
                <p className="mt-1 text-[12.5px] leading-snug text-white/50">
                  It ran {formatShort(broken.start)} to {formatShort(broken.end)} and broke on{' '}
                  {formatShort(broken.brokenOn)}. Beat it.
                </p>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => {
                  haptic(10)
                  patchSettings({ acknowledgedBreak: broken.brokenOn })
                }}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.07] text-white/45"
              >
                <Icon name="x" size={14} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StreakBreakNotice
