import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import Counter from '../ui/Counter'
import { EmptyState } from '../ui/Section'
import { spring } from '../../lib/motion'
import { formatShort, formatDay } from '../../lib/date'
import { WIDGETS } from '../../data/pillars'

/** Records framed as numbers still to beat. */
export function PersonalBests({ bests, streak }) {
  if (!bests.trackedDays) {
    return (
      <EmptyState
        title="No records yet"
        body="Log a few days and your bests will show up here as targets to beat."
      />
    )
  }

  const headline = [
    {
      id: 'streak',
      icon: 'flame',
      accent: '#ff7a1a',
      label: 'Longest streak',
      value: bests.longestStreak,
      suffix: 'days',
      note:
        streak.current >= bests.longestStreak && bests.longestStreak > 0
          ? 'You are at your record right now'
          : `${Math.max(0, bests.longestStreak - streak.current + 1)} more days to beat it`,
    },
    {
      id: 'xp',
      icon: 'bolt',
      accent: '#fdb022',
      label: 'Best day',
      value: bests.bestXpDay?.xp ?? 0,
      suffix: 'XP',
      note: bests.bestXpDay ? formatDay(bests.bestXpDay.date) : 'Not set',
    },
    {
      id: 'pillars',
      icon: 'target',
      accent: '#32d583',
      label: 'Most pillars',
      value: bests.mostPillars?.completed ?? 0,
      suffix: 'in a day',
      note: bests.mostPillars ? formatDay(bests.mostPillars.date) : 'Not set',
    },
    {
      id: 'week',
      icon: 'calendar',
      accent: '#5b9cff',
      label: 'Best week',
      value: bests.bestWeek?.xp ?? 0,
      suffix: 'XP',
      note: bests.bestWeek ? `Week of ${formatShort(bests.bestWeek.weekStart)}` : 'Not set',
    },
  ]

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        {headline.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring, delay: i * 0.035 }}
            className="relative overflow-hidden rounded-card border border-hair bg-ink-800/65 p-3.5 backdrop-blur-xl"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full blur-2xl"
              style={{ background: `${item.accent}22` }}
            />
            <span
              className="relative grid h-8 w-8 place-items-center rounded-xl"
              style={{ background: `${item.accent}1c`, color: item.accent }}
            >
              <Icon name={item.icon} size={15} strokeWidth={2} />
            </span>
            <p className="relative mt-2.5 text-[11px] text-white/35">{item.label}</p>
            <p className="relative mt-0.5 flex items-baseline gap-1">
              <Counter
                value={item.value}
                className="text-[22px] font-bold leading-none tracking-tightest"
                style={{ color: item.accent }}
              />
              <span className="text-[11px] text-white/30">{item.suffix}</span>
            </p>
            <p className="relative mt-1.5 truncate text-[10.5px] text-white/25">{item.note}</p>
          </motion.div>
        ))}
      </div>

      {bests.perPillar.length > 0 && (
        <div className="overflow-hidden rounded-card border border-hair bg-ink-800/65 backdrop-blur-xl">
          <p className="label-eyebrow px-4 pt-3.5">Single-day records</p>
          <div className="mt-2 divide-y divide-white/[0.05]">
            {bests.perPillar.map((row, i) => (
              <motion.div
                key={row.pillar.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: i * 0.025 }}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                  style={{ background: `${row.pillar.accent}1c`, color: row.pillar.accent }}
                >
                  <Icon name={row.pillar.icon} size={13} strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-white/65">
                  {row.pillar.name}
                </span>
                <span className="tnum shrink-0 text-[13px] font-semibold text-white">
                  {row.pillar.widget === WIDGETS.CHECK ? 'Done' : `${row.value} ${row.pillar.unit}`}
                </span>
                <span className="shrink-0 text-[11px] text-white/25">{formatShort(row.date)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Days tracked', value: bests.trackedDays, accent: '#e8eaed' },
          { label: 'Days cleared', value: bests.wonDays, accent: '#32d583' },
          { label: 'Days failed', value: bests.failedDays, accent: '#f97066' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 + i * 0.03 }}
            className="rounded-card border border-hair bg-ink-800/55 px-3 py-3 text-center backdrop-blur-xl"
          >
            <Counter
              value={s.value}
              className="block text-[19px] font-bold leading-none tracking-tightest"
              style={{ color: s.accent }}
            />
            <p className="mt-1 text-[10.5px] text-white/30">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default PersonalBests
