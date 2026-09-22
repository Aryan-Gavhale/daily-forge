import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { Bar } from '../ui/Ring'
import { spring } from '../../lib/motion'
import { usePlan } from '../../hooks/useForge'
import { useStore } from '../../store/useStore'
import { PLAN_LENGTH } from '../../data/plan'

/**
 * The plan, one line, on the screen you actually open.
 *
 * It shows the two things still outstanding this week rather than a
 * percentage, because a percentage never told anyone what to do next.
 */
export function PlanStrip() {
  const enabled = useStore((s) => s.settings.planEnabled) !== false
  const plan = usePlan()

  if (!enabled) return null

  const outstanding = plan.current.tasks.filter((t) => !t.done).slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.06 }}
      className="pad-x pt-3"
    >
      <Link
        to="/plan"
        className="pressable block overflow-hidden rounded-card border border-hair bg-ink-800/60 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 px-4 pt-3.5">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl"
            style={{ background: `${plan.phase.accent}1f`, color: plan.phase.accent }}
          >
            <Icon name="map" size={16} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="flex items-baseline gap-2">
              <span className="text-[14px] font-semibold tracking-tight text-white">
                Week {plan.currentWeek}
                <span className="font-medium text-white/30">/{PLAN_LENGTH}</span>
              </span>
              <span className="truncate text-[12px] text-white/40">{plan.current.week.title}</span>
            </p>
            <p className="tnum mt-0.5 text-[11.5px] text-white/30">
              {plan.current.done}/{plan.current.total} done · {plan.daysLeft} days left in the plan
            </p>
          </div>

          <span className="shrink-0 text-white/25">
            <Icon name="chevronRight" size={16} />
          </span>
        </div>

        <div className="px-4 pt-3">
          <Bar progress={plan.current.progress} accent={plan.phase.accent} height={4} />
        </div>

        {outstanding.length > 0 ? (
          <ul className="mt-3 divide-y divide-white/[0.05] border-t border-hair">
            {outstanding.map((t) => (
              <li key={t.task.id} className="flex items-center gap-2.5 px-4 py-2.5">
                <span className="h-[14px] w-[14px] shrink-0 rounded-full border border-white/20" />
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-white/60">
                  {t.task.label}
                </span>
                {t.task.kind !== 'check' && (
                  <span className="tnum shrink-0 text-[11.5px] text-white/30">
                    {t.value}/{t.target}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 flex items-center gap-2 border-t border-hair px-4 py-2.5 text-[12.5px] text-good">
            <Icon name="check" size={14} strokeWidth={2.6} />
            Week {plan.currentWeek} is clear.
          </p>
        )}
      </Link>
    </motion.div>
  )
}

export default PlanStrip
