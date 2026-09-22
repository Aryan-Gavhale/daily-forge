import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { Bar } from '../ui/Ring'
import PlanTaskRow from './PlanTaskRow'
import { TextField } from '../ui/Field'
import { spring } from '../../lib/motion'
import { formatShort } from '../../lib/date'
import { PLAN_LENGTH } from '../../data/plan'

const STATE_LABEL = {
  current: { label: 'This week', accent: '#ff7a1a' },
  past: { label: 'Closed', accent: '#8b8b98' },
  future: { label: 'Ahead', accent: '#5b9cff' },
}

/**
 * The selected week. Future weeks are readable but not tickable - the point of
 * a schedule is that you cannot bank week 12 during week 3.
 */
export function WeekBoard({ week, onToggle, onBump, onNote, onStep }) {
  const state = STATE_LABEL[week.state]
  const locked = week.state === 'future'

  return (
    <div className="pad-x pt-5">
      <div className="overflow-hidden rounded-card border border-hair bg-ink-800/65 backdrop-blur-xl">
        <div className="border-b border-hair px-4 pb-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-[3px] text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                  style={{ background: `${state.accent}1f`, color: state.accent }}
                >
                  {state.label}
                </span>
                <span className="tnum text-[11.5px] text-white/30">
                  Week {week.n} · {formatShort(week.from)} – {formatShort(week.to)}
                </span>
              </div>
              <h3 className="text-[17px] font-semibold tracking-tight text-white">
                {week.week.title}
              </h3>
              <p className="mt-1 text-[12.5px] leading-snug text-white/40">{week.week.headline}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <StepArrow
                icon="chevronLeft"
                disabled={week.n <= 1}
                onClick={() => onStep?.(-1)}
                label="Previous week"
              />
              <StepArrow
                icon="chevronRight"
                disabled={week.n >= PLAN_LENGTH}
                onClick={() => onStep?.(1)}
                label="Next week"
              />
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-3">
            <Bar progress={week.progress} accent={week.phase.accent} height={6} className="flex-1" />
            <span className="tnum shrink-0 text-[12px] font-semibold text-white/60">
              {week.done}/{week.total}
            </span>
          </div>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {week.tasks.map((result, i) => (
            <motion.div
              key={result.task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: Math.min(0.16, i * 0.025) }}
            >
              <PlanTaskRow
                result={result}
                locked={locked}
                onToggle={onToggle}
                onBump={onBump}
              />
            </motion.div>
          ))}
        </div>

        {locked ? (
          <p className="flex items-center gap-2 border-t border-hair px-4 py-3 text-[12px] text-white/30">
            <Icon name="lock" size={13} />
            Week {week.n} opens on {formatShort(week.from)}.
          </p>
        ) : (
          <div className="border-t border-hair px-4 py-3.5">
            <p className="mb-2 text-[12px] font-medium text-white/45">Week note</p>
            <TextField
              value={week.note}
              onChange={(v) => onNote?.(v)}
              multiline
              rows={2}
              maxLength={400}
              placeholder="What actually happened, and what you are carrying into next week."
            />
          </div>
        )}
      </div>
    </div>
  )
}

function StepArrow({ icon, onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="pressable grid h-8 w-8 place-items-center rounded-lg border border-hair bg-white/[0.04] text-white/55 disabled:opacity-25"
    >
      <Icon name={icon} size={15} strokeWidth={2.2} />
    </button>
  )
}

export default WeekBoard
