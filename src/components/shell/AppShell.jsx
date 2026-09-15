import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import TabBar from './TabBar'
import { ScrollContext } from './ScrollContext'
import ToastHost from '../ui/Toast'
import { Confetti } from '../ui/Burst'
import QuickLogSheet from '../pillars/QuickLogSheet'
import InstallPrompt from './InstallPrompt'
import UpdateNotice from './UpdateNotice'
import { easeSheet, pageTransition, useReducedMotion } from '../../lib/motion'
import { useSmoothScroll } from '../../lib/useSmoothScroll'
import { useUI } from '../../store/useUI'
import { useStore } from '../../store/useStore'

/**
 * The phone. On a handset it fills the viewport; on a desktop it becomes a
 * centred device frame, which is what keeps the layout honest - the app is only
 * ever designed at one width.
 */
export function AppShell() {
  const location = useLocation()
  const scrollRef = useRef(null)
  const [quickLogOpen, setQuickLogOpen] = useState(false)
  const sheetCount = useUI((s) => s.sheetCount)
  const celebration = useStore((s) => s.celebration)
  const clearCelebration = useStore((s) => s.clearCelebration)
  const reduced = useReducedMotion()

  useSmoothScroll(scrollRef, [location.pathname])

  // New route, top of the page - matching what a native push does.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  const recede = sheetCount > 0 && !reduced

  return (
    <ScrollContext.Provider value={scrollRef}>
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

          <main ref={scrollRef} className="scroll-area relative z-10 flex-1">
            <div className="min-h-full pb-tabbar">
              {/*
                Keyed remount rather than AnimatePresence: a lazy route that
                suspends mid-exit leaves the wrapper stuck at opacity 0, and a
                native tab bar swaps instantly anyway - only the arrival is
                animated.
              */}
              <motion.div key={location.pathname} {...pageTransition}>
                <Outlet />
              </motion.div>
            </div>
          </main>

          <TabBar onQuickLog={() => setQuickLogOpen(true)} />
        </motion.div>
      </div>

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
