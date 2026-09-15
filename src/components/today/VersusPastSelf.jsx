import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { spring } from '../../lib/motion'
import { versusLastWeekToday } from '../../lib/stats'
import { useStore } from '../../store/useStore'
import { useTodayKey } from '../../hooks/useForge'
import { weekdayLong } from '../../lib/date'

/**
 * Today against the same weekday last week. The comparison is deliberately
 * narrow - a Tuesday against a Tuesday is the only honest short-range read.
 */
export function VersusPastSelf() {
  const days = useStore((s) => s.days)
  const settings = useStore((s) => s.settings)
  const today = useTodayKey()

  const vs = useMemo(
    () => versusLastWeekToday(days, settings, today),
    [days, settings, today]
  )

  if (!vs.hasBaseline) return null

  const ahead = vs.xpDelta > 0
  const level = vs.xpDelta === 0
  const accent = level ? '#8b8b98' : ahead ? '#32d583' : '#f97066'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.06 }}
      className="px-5 pt-3"
    >
      <div className="flex items-center gap-3 rounded-card border border-hair bg-ink-800/60 px-4 py-3 backdrop-blur-xl">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ background: `${accent}1c`, color: accent }}
        >
          <Icon name={level ? 'target' : ahead ? 'arrowUp' : 'arrowDown'} size={17} strokeWidth={2.1} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-white">
            {level
              ? 'Level with last week'
              : ahead
                ? `${vs.xpDelta} XP ahead of last ${weekdayLong(today)}`
                : `${Math.abs(vs.xpDelta)} XP behind last ${weekdayLong(today)}`}
          </p>
          <p className="mt-0.5 text-[11.5px] text-white/35">
            <span className="tnum">{vs.today.completed}</span> pillars today vs{' '}
            <span className="tnum">{vs.past.completed}</span> then
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="tnum text-[15px] font-bold leading-none" style={{ color: accent }}>
            {vs.xpDelta > 0 ? '+' : ''}
            {vs.xpDelta}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-white/25">XP</p>
        </div>
      </div>
    </motion.div>
  )
}

export default VersusPastSelf
