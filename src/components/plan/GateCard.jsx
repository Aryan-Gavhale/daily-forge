import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { haptic, spring, springBouncy } from '../../lib/motion'

/**
 * A gate is the honest checkpoint at the end of a month.
 *
 * Its checks are deliberately subjective - "can you regenerate these" is not
 * something a counter can answer - so they stay manual, and the warning under
 * them says what to do when the answer is no.
 */
export function GateCard({ gate, locked, onToggle }) {
  const accent = gate.passed ? '#32d583' : gate.weekState === 'past' ? '#f97066' : '#fdb022'

  return (
    <div className="overflow-hidden rounded-card border border-hair bg-ink-800/60 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-hair px-4 py-3.5">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Icon name="flag" size={16} strokeWidth={2.1} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold tracking-tight text-white">{gate.title}</p>
          <p className="tnum text-[11.5px] text-white/35">
            End of week {gate.week} · {gate.done}/{gate.total} cleared
          </p>
        </div>
        {gate.passed && (
          <span className="shrink-0 rounded-full bg-good/15 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-good">
            Passed
          </span>
        )}
      </div>

      <div className="divide-y divide-white/[0.05]">
        {gate.checks.map((check) => (
          <motion.button
            key={check.id}
            type="button"
            disabled={locked}
            whileTap={locked ? undefined : { scale: 0.985 }}
            transition={spring}
            onClick={() => {
              haptic(check.done ? 8 : 14)
              onToggle?.(check.key)
            }}
            className="flex w-full items-start gap-3 px-4 py-3 text-left disabled:opacity-50"
          >
            <motion.span
              animate={{ scale: check.done ? 1 : 0.98 }}
              transition={springBouncy}
              className="mt-[1px] grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full border transition-colors"
              style={{
                borderColor: check.done ? accent : 'rgba(255,255,255,0.18)',
                background: check.done ? accent : 'transparent',
                color: check.done ? '#0b0b0d' : 'transparent',
              }}
            >
              <Icon name="check" size={12} strokeWidth={3} />
            </motion.span>
            <span
              className={`text-[13.5px] leading-snug ${
                check.done ? 'text-white/45 line-through decoration-white/20' : 'text-white/80'
              }`}
            >
              {check.label}
            </span>
          </motion.button>
        ))}
      </div>

      {locked && (
        <p className="flex items-center gap-2 border-t border-hair px-4 py-2.5 text-[11.5px] text-white/30">
          <Icon name="lock" size={12} />
          Answerable at the end of week {gate.week}, not before.
        </p>
      )}

      {!gate.passed && (
        <p className="border-t border-hair bg-white/[0.02] px-4 py-3 text-[12px] leading-relaxed text-white/40">
          {gate.warning}
        </p>
      )}
    </div>
  )
}

export default GateCard
