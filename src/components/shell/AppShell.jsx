import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import TabBar from './TabBar'
import SideNav from './SideNav'
import { ScrollContext } from './ScrollContext'
import ToastHost from '../ui/Toast'
import { Confetti } from '../ui/Burst'
import QuickLogSheet from '../pillars/QuickLogSheet'
import InstallPrompt from './InstallPrompt'
import UpdateNotice from './UpdateNotice'
import { easeSheet, pageTransition, useReducedMotion } from '../../lib/motion'
import { useSmoothScroll } from '../../lib/useSmoothScroll'
import { useIsDesktop } from '../../lib/useMediaQuery'
import { useUI } from '../../store/useUI'
import { useStore } from '../../store/useStore'

/**
 * Two shells, one app.
 *
 * Under 1024px it is a phone: full-bleed on a handset, and a centred device
 * frame on a tablet-sized window so the layout is never stretched past the
 * width it was designed at. At 1024px and up that pretence is dropped for a
 * real desktop window - a persistent rail, no bezel, and pages that spread
 * into columns rather than scrolling as one long strip.
 */
export function AppShell() {
  const location = useLocation()
  const scrollRef = useRef(null)
  const [quickLogOpen, setQuickLogOpen] = useState(false)
  const sheetCount = useUI((s) => s.sheetCount)
  const celebration = useStore((s) => s.celebration)
  const clearCelebration = useStore((s) => s.clearCelebration)
  const reduced = useReducedMotion()
  const desktop = useIsDesktop()

  useSmoothScroll(scrollRef, [location.pathname, desktop])

  // New route, top of the page - matching what a native push does.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  // The page receding behind a sheet is a phone idiom; a desktop dialog
  // dims its backdrop instead.
  const recede = sheetCount > 0 && !reduced && !desktop

  const content = (
    <main ref={scrollRef} className="scroll-area relative z-10 flex-1">
      <div className={`min-h-full ${desktop ? 'pb-14' : 'pb-tabbar'}`}>
        {/*
          Keyed remount rather than AnimatePresence: a lazy route that
          suspends mid-exit leaves the wrapper stuck at opacity 0, and a
          native tab bar swaps instantly anyway - only the arrival is
          animated.
        */}
        <motion.div key={location.pathname} {...pageTransition} className="page-width">
          <Outlet />
        </motion.div>
      </div>
    </main>
  )

  return (
    <ScrollContext.Provider value={scrollRef}>
      {desktop ? (
        <div className="fixed inset-0 flex overflow-hidden bg-ink-900">
          <SideNav onQuickLog={() => setQuickLogOpen(true)} />
          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-70"
              style={{
                background:
                  'radial-gradient(90% 100% at 30% -20%, rgba(255,122,26,0.12), transparent 70%)',
              }}
            />
            {content}
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 grid place-items-center overflow-hidden">
          <motion.div
            animate={{
              scale: recede ? 0.94 : 1,
              y: recede ? -8 : 0,
              opacity: recede ? 0.72 : 1,
            }}
            transition={easeSheet}
            className="relative flex h-[100dvh] w-full max-w-shell flex-col overflow-hidden bg-ink-900 md:h-[min(920px,94vh)] md:rounded-[46px] md:border md:border-hairStrong md:shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95)]"
          >
            {/* Ambient wash so the surface is never a flat rectangle. */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70"
              style={{
                background:
                  'radial-gradient(120% 90% at 50% -20%, rgba(255,122,26,0.14), transparent 70%)',
              }}
            />

            {content}

            <TabBar onQuickLog={() => setQuickLogOpen(true)} />
          </motion.div>
        </div>
      )}

      <QuickLogSheet open={quickLogOpen} onClose={() => setQuickLogOpen(false)} />
      <ToastHost />
      <Confetti show={Boolean(celebration)} onDone={clearCelebration} />
      {sheetCount === 0 && (
        <>
          <UpdateNotice />
          <InstallPrompt />
        </>
      )}
    </ScrollContext.Provider>
  )
}

export default AppShell
