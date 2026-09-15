import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from './components/shell/AppShell'
import Today from './pages/Today'
import Me from './pages/Me'
import Icon from './components/ui/Icon'
import { setHapticsEnabled } from './lib/motion'
import { useStore } from './store/useStore'

// Stats and Money pull in the whole charting library. Today is the screen that
// opens a dozen times a day, so it should not pay for them.
const Stats = lazy(() => import('./pages/Stats'))
const Money = lazy(() => import('./pages/Money'))

export function App() {
  const ready = useStore((s) => s.ready)
  const error = useStore((s) => s.error)
  const init = useStore((s) => s.init)
  const hapticsEnabled = useStore((s) => s.settings.hapticsEnabled)

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    setHapticsEnabled(hapticsEnabled)
  }, [hapticsEnabled])

  if (!ready) return <BootScreen />
  if (error) return <BootError message={error} />

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Today />} />
        <Route
          path="/stats"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Stats />
            </Suspense>
          }
        />
        <Route
          path="/money"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Money />
            </Suspense>
          }
        />
        <Route path="/me" element={<Me />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

/** Shape-matched placeholder while a lazy route's chunk arrives. */
function PageSkeleton() {
  return (
    <div className="px-5 pt-safe">
      <div className="space-y-4 pt-8">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-white/[0.05]" />
        <div className="h-[168px] animate-pulse rounded-card bg-white/[0.04]" />
        <div className="h-[132px] animate-pulse rounded-card bg-white/[0.035]" />
        <div className="h-[132px] animate-pulse rounded-card bg-white/[0.03]" />
      </div>
    </div>
  )
}

function BootScreen() {
  return (
    <div className="fixed inset-0 grid place-items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <motion.span
          className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-b from-flame-soft to-flame-deep text-black"
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon name="flame" size={30} strokeWidth={2} />
        </motion.span>
        <p className="text-[13px] tracking-tight text-white/35">Forge</p>
      </motion.div>
    </div>
  )
}

function BootError({ message }) {
  return (
    <div className="fixed inset-0 grid place-items-center px-8">
      <div className="max-w-sm text-center">
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-bad/15 text-bad">
          <Icon name="x" size={22} strokeWidth={2.4} />
        </span>
        <h1 className="text-[17px] font-semibold text-white">Local storage is unavailable</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-white/45">{message}</p>
        <p className="mt-3 text-[12px] text-white/30">
          Forge keeps everything on this device. Private browsing blocks that on some browsers.
        </p>
      </div>
    </div>
  )
}

export default App
