import { motion } from 'framer-motion'
import { Panel } from '../ui/Section'
import Icon from '../ui/Icon'
import Counter from '../ui/Counter'
import { spring } from '../../lib/motion'

/**
 * This week against last week, trimmed to the same number of elapsed days.
 * Per-pillar deltas sit underneath so a good XP week does not hide one pillar
 * quietly collapsing.
 */
export function WeekCompare({ wow }) {
  const ahead = wow.xpDelta > 0
  const flat = wow.xpDelta === 0
  const accent = flat ? '#8b8b98' : ahead ? '#32d583' : '#f97066'
  const maxHit = Math.max(1, wow.elapsed)

  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <p className="label-eyebrow">This week so far</p>
          <div className="mt-1 flex items-baseline gap-2">
            <Counter
              value={wow.current.xp}
              className="text-[26px] font-bold leading-none tracking-tightest text-white"
            />
            <span className="text-[12px] text-white/30">XP</span>
          </div>
          <p className="mt-1.5 text-[12px] text-white/35">
            <span className="tnum">{wow.current.wonDays}</span> of{' '}
            <span className="tnum">{wow.elapsed}</span> days cleared
          </p>
        </div>

        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon name={flat ? 'target' : ahead ? 'arrowUp' : 'arrowDown'} size={14} strokeWidth={2.2} />
          <span className="tnum text-[12.5px] font-bold">
            {wow.xpDelta > 0 ? '+' : ''}
            {wow.xpDelta}
          </span>
        </div>
      </div>

      <p className="mt-1 text-[11.5px] text-white/30">
        Last week at this point: <span className="tnum">{wow.previous.xp}</span> XP,{' '}
        <span className="tnum">{wow.previous.wonDays}</span> cleared
      </p>

      <div className="mt-4 space-y-2.5 border-t border-hair pt-4">
        {wow.perPillar.map((row, i) => {
          const delta = row.delta
          const deltaAccent = delta > 0 ? '#32d583' : delta < 0 ? '#f97066' : 'rgba(255,255,255,0.22)'
          return (
            <motion.div
              key={row.pillar.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: i * 0.03 }}
              className="flex items-center gap-3"
            >
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                style={{ background: `${row.pillar.accent}1c`, color: row.pillar.accent }}
              >
                <Icon name={row.pillar.icon} size={12} strokeWidth={2} />
              </span>
              <span className="w-[86px] shrink-0 truncate text-[12.5px] text-white/60">
                {row.pillar.name}
              </span>

              <div className="relative flex min-w-0 flex-1 flex-col gap-1">
                <div className="h-[5px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: row.pillar.accent }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(row.current / maxHit) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 110, damping: 22, delay: i * 0.03 }}
                  />
                </div>
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/[0.035]">
                  <motion.div
                    className="h-full rounded-full bg-white/20"
                    initial={{ width: 0 }}
                    animate={{ width: `${(row.previous / maxHit) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 110, damping: 22, delay: i * 0.03 }}
                  />
                </div>
              </div>

              <span
                className="tnum w-8 shrink-0 text-right text-[12px] font-semibold"
                style={{ color: deltaAccent }}
              >
                {delta > 0 ? '+' : ''}
                {delta}
              </span>
            </motion.div>
          )
        })}
      </div>

      <p className="mt-3 text-[11px] text-white/25">
        Thick bar is this week, thin bar is last week at the same point.
      </p>
    </Panel>
  )
}

export default WeekCompare
