import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { spring, haptic } from '../../lib/motion'

const DISMISS_KEY = 'forge.install.dismissed'

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

/**
 * Add-to-home-screen nudge.
 *
 * Chrome hands us a real install prompt; iOS Safari does not expose one at all,
 * so there we can only show the Share > Add to Home Screen instruction.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [visible, setVisible] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY) === '1') return

    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    let timer
    if (isIos()) {
      // Give the user a moment with the app before asking for anything.
      timer = setTimeout(() => {
        setIosHint(true)
        setVisible(true)
      }, 12000)
    }

    const onInstalled = () => setVisible(false)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    haptic(10)
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  const install = async () => {
    haptic(14)
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[65] flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+86px)] lg:justify-end lg:px-8 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={spring}
            className="pointer-events-auto flex w-full max-w-[calc(480px-2rem)] items-center gap-3 rounded-2xl border border-hairStrong glass px-4 py-3 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.9)] lg:max-w-[380px]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-flame/15 text-flame">
              <Icon name={iosHint ? 'share' : 'download'} size={17} strokeWidth={2} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-white">Install Forge</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-white/40">
                {iosHint
                  ? 'Share, then Add to Home Screen.'
                  : 'Runs offline, opens like an app.'}
              </p>
            </div>

            {!iosHint && (
              <button
                type="button"
                onClick={install}
                className="h-9 shrink-0 rounded-xl bg-white px-3.5 text-[13px] font-semibold text-black"
              >
                Install
              </button>
            )}

            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
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

export default InstallPrompt
