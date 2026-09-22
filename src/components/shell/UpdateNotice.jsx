import { AnimatePresence, motion } from 'framer-motion'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Icon from '../ui/Icon'
import { spring, haptic } from '../../lib/motion'

/**
 * A refreshed build is already cached by the service worker, but reloading
 * mid-entry would lose whatever is in an open sheet - so we ask first.
 */
export function UpdateNotice() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.warn('[forge] service worker registration failed', error)
    },
  })

  return (
    <AnimatePresence>
      {needRefresh && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[66] flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+86px)] lg:justify-end lg:px-8 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={spring}
            className="pointer-events-auto flex w-full max-w-[calc(480px-2rem)] items-center gap-3 rounded-2xl border border-hairStrong glass px-4 py-3 lg:max-w-[380px]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-good/15 text-good">
              <Icon name="download" size={17} strokeWidth={2} />
            </span>
            <p className="min-w-0 flex-1 text-[13px] text-white/75">A new version is ready.</p>
            <button
              type="button"
              onClick={() => {
                haptic(12)
                updateServiceWorker(true)
              }}
              className="h-9 shrink-0 rounded-xl bg-white px-3.5 text-[13px] font-semibold text-black"
            >
              Reload
            </button>
            <button
              type="button"
              aria-label="Later"
              onClick={() => setNeedRefresh(false)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.07] text-white/45"
            >
              <Icon name="x" size={13} strokeWidth={2.4} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default UpdateNotice
