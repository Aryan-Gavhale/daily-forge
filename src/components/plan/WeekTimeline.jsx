import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { haptic, spring } from '../../lib/motion'
import { PLAN_PHASES } from '../../data/plan'

/**
 * All sixteen weeks at once, grouped by month.
 *
 * Four months is long enough that a linear scroll of week cards hides the
 * shape of it. A grid makes a run of missed weeks visible from across the
 * room, which is the only reason to draw the whole plan at all.
 */
export function WeekTimeline({ weeks, selected, currentWeek, onSelect }) {
  return (
    <div className="space-y-3.5">
      {PLAN_PHASES.map((phase) => {
        const slice = weeks.filter((w) => w.n >= phase.from && w.n <= phase.to)
        const done = slice.reduce((s, w) => s + w.done, 0)
        const total = slice.reduce((s, w) => s + w.total, 0)

        return (
          <div key={phase.id}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="flex min-w-0 items-center gap-2 text-[12.5px] font-medium text-white/55">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: phase.accent }}
                />
                <span className="truncate">
                  Month {phase.month} · {phase.name}
                </span>
              </p>
              <span className="tnum shrink-0 text-[11.5px] text-white/25">
                {done}/{total}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {slice.map((week) => (
                <WeekChip
                  key={week.n}
                  week={week}
                  phase={phase}
                  active={week.n === selected}
                  isCurrent={week.n === currentWeek}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function WeekChip({ week, phase, active, isCurrent, onSelect }) {
  const tone = chipTone(week, phase)

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      transition={spring}
      onClick={() => {
        haptic(10)
        onSelect?.(week.n)
      }}
      className="relative flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition-colors"
      style={{
        borderColor: active ? `${phase.accent}80` : 'rgba(255,255,255,0.07)',
        background: active ? `${phase.accent}14` : 'rgba(255,255,255,0.025)',
      }}
    >
      {isCurrent && (
        <span
          className="absolute -top-[3px] right-2 h-1.5 w-1.5 rounded-full"
          style={{ background: '#ff7a1a' }}
        />
      )}

      <span
        className="grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold"
        style={{ background: tone.bg, color: tone.fg }}
      >
        {week.complete ? <Icon name="check" size={12} strokeWidth={3} /> : week.n}
      </span>

      <span className="tnum text-[10px] font-medium text-white/35">
        {week.done}/{week.total}
      </span>

      {week.gate && (
        <span
          className="absolute bottom-1 left-1.5 text-white/25"
          style={{ color: week.gate.passed ? '#32d583' : undefined }}
        >
          <Icon name="flag" size={9} strokeWidth={2.4} />
        </span>
      )}
    </motion.button>
  )
}

function chipTone(week, phase) {
  if (week.complete) return { bg: '#32d583', fg: '#0b0b0d' }
  if (week.missed) return { bg: 'rgba(249,112,102,0.18)', fg: '#f97066' }
  if (week.state === 'current') return { bg: `${phase.accent}33`, fg: '#ffffff' }
  return { bg: 'rgba(255,255,255,0.05)', fg: 'rgba(255,255,255,0.4)' }
}

export default WeekTimeline
