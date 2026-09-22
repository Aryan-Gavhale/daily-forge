import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { haptic, spring, springBouncy } from '../../lib/motion'
import { useStore } from '../../store/useStore'
import { ROUTES } from './routes'

/**
 * Floating tab bar with a spring-morphing active pill.
 *
 * Five destinations do not divide around a centre button, so the compose
 * action lifts out of the row and floats above it - the same slot Gmail and
 * Maps use, and it keeps every tab the same width.
 */
export function TabBar({ onQuickLog }) {
  const location = useLocation()
  const navigate = useNavigate()
  const planEnabled = useStore((s) => s.settings.planEnabled) !== false

  const tabs = ROUTES.filter((t) => t.to !== '/plan' || planEnabled)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 lg:hidden">
      <div className="pointer-events-none h-16 bg-gradient-to-t from-ink-900 via-ink-900/85 to-transparent" />

      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        transition={springBouncy}
        onClick={() => {
          haptic(14)
          onQuickLog?.()
        }}
        className="pointer-events-auto absolute bottom-[calc(env(safe-area-inset-bottom,0px)+var(--tabbar-h)+14px)] right-[var(--pad-x)] grid h-[54px] w-[54px] place-items-center rounded-2xl bg-gradient-to-b from-flame-soft to-flame-deep text-black shadow-[0_14px_34px_-10px_rgba(255,122,26,0.8)]"
        aria-label="Quick log"
      >
        <Icon name="plus" size={25} strokeWidth={2.6} />
      </motion.button>

      <nav className="pointer-events-auto glass border-t border-hair px-2 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-2">
        <ul className="flex items-end justify-around">
          {tabs.map((tab) => {
            const active =
              tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to)

            return (
              <li key={tab.to} className="flex-1">
                <NavLink
                  to={tab.to}
                  onClick={(e) => {
                    haptic(10)
                    if (active) {
                      e.preventDefault()
                      navigate(tab.to)
                    }
                  }}
                  className="relative mx-auto flex h-[46px] w-full max-w-[72px] flex-col items-center justify-center gap-[3px] rounded-xl"
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-xl bg-white/[0.07]"
                      transition={spring}
                    />
                  )}
                  <motion.span
                    className="relative z-10"
                    animate={{
                      scale: active ? 1.06 : 1,
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.42)',
                    }}
                    transition={spring}
                  >
                    <Icon name={tab.icon} size={21} strokeWidth={active ? 2.1 : 1.7} />
                  </motion.span>
                  <motion.span
                    className="relative z-10 text-[10px] font-medium tracking-tight"
                    animate={{ color: active ? '#ffffff' : 'rgba(255,255,255,0.38)' }}
                    transition={spring}
                  >
                    {tab.label}
                  </motion.span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export default TabBar
