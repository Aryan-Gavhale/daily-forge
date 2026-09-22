import { motion } from 'framer-motion'
import { Ring, Bar } from '../ui/Ring'
import Counter from '../ui/Counter'
import Icon from '../ui/Icon'
import { spring } from '../../lib/motion'
import { formatShort } from '../../lib/date'
import { PLAN_LENGTH } from '../../data/plan'

/**
 * Week, phase, and whether the work is keeping up with the calendar.
 *
 * The pace read is the point of this card: a plan that is 40% done in week 12
 * is not "40% done", it is behind, and the number on its own would hide that.
 */
export function PlanHero({ plan, onEdit }) {
  const pace = plan.progress - plan.timeProgress
  const status = paceStatus(pace, plan)

  return (
    <div className="pad-x pt-5">
      <div className="relative overflow-hidden rounded-[28px] border border-hair bg-ink-800/70 p-5 backdrop-blur-xl">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `${plan.phase.accent}22` }}
        />

        <div className="relative flex items-center gap-5">
          <Ring
            progress={plan.current.progress}
            size={126}
            stroke={11}
            accent={plan.phase.accent}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Week
            </span>
            <Counter
              value={plan.currentWeek}
              className="text-[34px] font-bold leading-none tracking-tightest text-white"
            />
            <span className="text-[11px] text-white/30">of {PLAN_LENGTH}</span>
          </Ring>

          <div className="min-w-0 flex-1">
            <motion.div
              key={status.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ background: `${status.accent}1f`, color: status.accent }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.accent }} />
              <span className="text-[11.5px] font-semibold tracking-tight">{status.label}</span>
            </motion.div>

            <p className="mt-2.5 text-[19px] font-semibold leading-tight tracking-tight text-white">
              Month {plan.phase.month} · {plan.phase.name}
            </p>
            <p className="mt-1 text-[12.5px] leading-snug text-white/40">{plan.phase.tagline}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-white/30">
              <span className="tnum flex items-center gap-1.5">
                <Icon name="calendar" size={13} />
                {formatShort(plan.current.from)} – {formatShort(plan.current.to)}
              </span>
              <span className="tnum flex items-center gap-1.5">
                <Icon name="clock" size={13} />
                {plan.daysLeft} days left
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-5">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[12px] text-white/40">Plan complete</span>
            <span className="tnum text-[12px] font-semibold text-white/70">
              {Math.round(plan.progress * 100)}%
              <span className="ml-1.5 font-normal text-white/25">
                {plan.tasksDone}/{plan.tasksTotal} tasks
              </span>
            </span>
          </div>

          {/* The calendar marker is what turns a progress bar into a verdict. */}
          <div className="relative">
            <Bar progress={plan.progress} accent={plan.phase.accent} height={8} />
            <div
              className="pointer-events-none absolute -top-1 bottom-[-4px] w-[2px] rounded-full bg-white/60"
              style={{ left: `calc(${Math.min(100, plan.timeProgress * 100)}% - 1px)` }}
              title="Where the calendar is"
            />
          </div>
          <p className="mt-2 text-[11.5px] leading-snug text-white/30">
            {status.blurb}
          </p>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <Stat label="Weeks banked" value={plan.banked} suffix={`/${PLAN_LENGTH}`} />
          <Stat label="Weeks missed" value={plan.missedWeeks} tone={plan.missedWeeks ? 'bad' : undefined} />
          <Stat label="Day" value={plan.dayOfPlan} suffix={`/${PLAN_LENGTH * 7}`} />
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="pressable relative mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-hair bg-white/[0.03] py-2.5 text-[12.5px] font-medium text-white/45"
          >
            <Icon name="settings" size={14} />
            Plan started {formatShort(plan.startKey)} · change
          </button>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, suffix, tone }) {
  return (
    <div className="rounded-2xl border border-hair bg-white/[0.03] px-3 py-2.5 text-center">
      <p className="tnum text-[18px] font-bold leading-none tracking-tight">
        <span className={tone === 'bad' ? 'text-bad' : 'text-white'}>{value}</span>
        {suffix && <span className="text-[12px] font-medium text-white/25">{suffix}</span>}
      </p>
      <p className="mt-1 text-[10.5px] leading-tight text-white/35">{label}</p>
    </div>
  )
}

function paceStatus(pace, plan) {
  if (plan.notStarted) {
    return { id: 'soon', label: 'Not started', accent: '#8b8b98', blurb: 'The plan begins on its start date.' }
  }
  if (plan.overrun) {
    return {
      id: 'over',
      label: 'Overrun',
      accent: '#fdb022',
      blurb: 'Sixteen weeks are up. Finish the open weeks or restart the clock.',
    }
  }
  if (pace >= 0.05) {
    return {
      id: 'ahead',
      label: 'Ahead',
      accent: '#32d583',
      blurb: 'Ahead of the calendar. Spend the slack on mocks, not more volume.',
    }
  }
  if (pace >= -0.05) {
    return {
      id: 'on',
      label: 'On schedule',
      accent: '#5b9cff',
      blurb: 'The bar is level with the calendar marker. Keep the weekly cadence.',
    }
  }
  if (pace >= -0.15) {
    return {
      id: 'slipping',
      label: 'Slipping',
      accent: '#fdb022',
      blurb: 'Behind the marker. Cut volume before you cut the contest or the mock.',
    }
  }
  return {
    id: 'behind',
    label: 'Behind',
    accent: '#f97066',
    blurb: 'Well behind the calendar. Drop scope deliberately rather than failing every track.',
  }
}

export default PlanHero
