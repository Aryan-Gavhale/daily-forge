import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { Bar } from '../ui/Ring'
import { haptic, spring } from '../../lib/motion'
import { useLevel, usePlan, useStreak } from '../../hooks/useForge'
import { useStore } from '../../store/useStore'
import { ROUTES } from './routes'
import { PLAN_LENGTH } from '../../data/plan'

/**
 * Desktop navigation.
 *
 * The phone puts identity and progress on the Me screen because there is no
 * room anywhere else. A desktop window has a permanent left rail, so the
 * things you want to glance at - rank, streak, which plan week you are in -
 * live here and stop costing a navigation.
 */
export function SideNav({ onQuickLog }) {
  const level = useLevel()
  const streak = useStreak()
  const plan = usePlan()
  const planEnabled = useStore((s) => s.settings.planEnabled) !== false
  const name = useStore((s) => s.settings.name)

  const items = ROUTES.filter((r) => r.to !== '/plan' || planEnabled)

  return (
    <aside
      className="relative z-20 flex h-full shrink-0 flex-col border-r border-hair bg-ink-850/60 backdrop-blur-xl"
      style={{ width: 'var(--sidenav-w)' }}
    >
      <div className="flex items-center gap-3 px-5 pb-6 pt-7">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-b from-flame-soft to-flame-deep text-black shadow-[0_8px_22px_-8px_rgba(255,122,26,0.8)]">
          <Icon name="flame" size={21} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-tight text-white">
            {name || 'Forge'}
          </p>
          <p className="truncate text-[11.5px] text-white/35">
            Level {level.level} · {level.rank.name}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={() => haptic(10)}
                className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sidenav-pill"
                        className="absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-inset ring-white/[0.06]"
                        transition={spring}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        isActive ? 'text-flame' : 'text-white/40 group-hover:text-white/70'
                      }`}
                    >
                      <Icon name={item.icon} size={19} strokeWidth={isActive ? 2.1 : 1.7} />
                    </span>
                    <span
                      className={`relative z-10 transition-colors ${
                        isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          transition={spring}
          onClick={() => {
            haptic(14)
            onQuickLog?.()
          }}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-flame-soft to-flame-deep text-[14px] font-semibold tracking-tight text-black shadow-[0_10px_26px_-12px_rgba(255,122,26,0.9)]"
        >
          <Icon name="plus" size={18} strokeWidth={2.6} />
          Quick log
        </motion.button>
      </nav>

      <div className="space-y-2.5 px-3 pb-5">
        <div className="rounded-xl border border-hair bg-white/[0.03] px-3.5 py-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[12px] text-white/40">
              <Icon
                name="flame"
                size={13}
                className={streak.current > 0 && !streak.atRisk ? 'text-flame' : 'text-white/25'}
              />
              Streak
            </span>
            <span className="tnum text-[13px] font-bold text-white">{streak.current}d</span>
          </div>
          <Bar progress={level.ratio} accent={level.rank.accent} height={4} className="mt-2.5" />
          <p className="tnum mt-1.5 text-[11px] text-white/30">
            {level.remaining.toLocaleString('en-IN')} XP to level {level.level + 1}
          </p>
        </div>

        {planEnabled && (
          <NavLink
            to="/plan"
            className="block rounded-xl border border-hair bg-white/[0.03] px-3.5 py-3 transition-colors hover:border-hairStrong"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[12px] text-white/40">
                <Icon name="map" size={13} style={{ color: plan.phase.accent }} />
                Plan
              </span>
              <span className="tnum text-[13px] font-bold text-white">
                W{plan.currentWeek}
                <span className="text-white/30">/{PLAN_LENGTH}</span>
              </span>
            </div>
            <Bar
              progress={plan.current.progress}
              accent={plan.phase.accent}
              height={4}
              className="mt-2.5"
            />
            <p className="tnum mt-1.5 truncate text-[11px] text-white/30">
              {plan.current.done}/{plan.current.total} this week · {plan.daysLeft}d left
            </p>
          </NavLink>
        )}
      </div>
    </aside>
  )
}

export default SideNav
