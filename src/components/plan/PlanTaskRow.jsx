import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { Bar } from '../ui/Ring'
import { haptic, spring, springBouncy } from '../../lib/motion'
import { TRACK_MAP } from '../../data/plan'

/**
 * One line of a plan week.
 *
 * An `auto` row has no control at all - it is filled in by the pillar log, and
 * giving it a tick box would invite double counting.
 */
export function PlanTaskRow({ result, locked, onToggle, onBump }) {
  const { task, value, target, done, progress, auto } = result
  const track = TRACK_MAP[task.track]
  const interactive = !locked && !auto

  const body = (
    <>
      <span className="mt-[1px] shrink-0">
        {auto ? (
          <span
            className="grid h-[22px] w-[22px] place-items-center rounded-full border"
            style={{
              borderColor: done ? `${track.accent}88` : 'rgba(255,255,255,0.14)',
              background: done ? `${track.accent}22` : 'transparent',
              color: done ? track.accent : 'rgba(255,255,255,0.28)',
            }}
          >
            <Icon name="bolt" size={12} strokeWidth={2.2} />
          </span>
        ) : (
          <motion.span
            animate={{ scale: done ? 1 : 0.98 }}
            transition={springBouncy}
            className="grid h-[22px] w-[22px] place-items-center rounded-full border transition-colors"
            style={{
              borderColor: done ? track.accent : 'rgba(255,255,255,0.18)',
              background: done ? track.accent : 'transparent',
              color: done ? '#0b0b0d' : 'transparent',
            }}
          >
            <Icon name="check" size={13} strokeWidth={3} />
          </motion.span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span
            className={`text-[14px] font-medium leading-snug tracking-tight ${
              done ? 'text-white/45 line-through decoration-white/20' : 'text-white'
            }`}
          >
            {task.label}
          </span>
          {auto && (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25">
              auto
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-white/35">{task.detail}</span>

        {task.kind !== 'check' && (
          <span className="mt-2 block">
            <Bar progress={progress} accent={track.accent} height={4} />
            <span className="tnum mt-1 block text-[11px] text-white/30">
              {value} of {target} {task.unit}
              {auto && ' · from your pillar log'}
            </span>
          </span>
        )}
      </span>
    </>
  )

  if (task.kind === 'count') {
    return (
      <div className="flex items-start gap-3 px-4 py-3.5">
        {body}
        <span className="flex shrink-0 items-center gap-1 pt-0.5">
          <StepButton
            icon="minus"
            disabled={locked || value <= 0}
            onClick={() => onBump?.(task.id, -1)}
          />
          <span className="tnum w-7 text-center text-[15px] font-bold text-white">{value}</span>
          <StepButton
            icon="plus"
            accent={track.accent}
            disabled={locked}
            onClick={() => onBump?.(task.id, 1)}
          />
        </span>
      </div>
    )
  }

  if (!interactive) {
    return <div className="flex items-start gap-3 px-4 py-3.5">{body}</div>
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      transition={spring}
      onClick={() => {
        haptic(done ? 8 : 14)
        onToggle?.(task.id)
      }}
      className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
    >
      {body}
    </motion.button>
  )
}

function StepButton({ icon, onClick, disabled, accent }) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.86 }}
      transition={springBouncy}
      disabled={disabled}
      onClick={() => {
        haptic(12)
        onClick?.()
      }}
      className="grid h-8 w-8 place-items-center rounded-lg border border-hair bg-white/[0.05] text-white/70 disabled:opacity-25"
      style={accent ? { background: `${accent}22`, borderColor: `${accent}44`, color: accent } : undefined}
      aria-label={icon === 'plus' ? 'Increase' : 'Decrease'}
    >
      <Icon name={icon} size={16} strokeWidth={2.4} />
    </motion.button>
  )
}

export default PlanTaskRow
