import { motion } from 'framer-motion'
import { Panel } from '../ui/Section'
import Icon from '../ui/Icon'
import { spring, haptic } from '../../lib/motion'
import { WIDGETS } from '../../data/pillars'

/**
 * Rolling-window consistency per pillar, sorted worst first - the list is
 * meant to point at what needs attention, not flatter what is already working.
 */
export function PillarBreakdown({ windows, windowDays, selected, onSelect }) {
  const sorted = [...windows].sort((a, b) => a.consistency - b.consistency)

  return (
    <Panel padded={false}>
      <div className="divide-y divide-white/[0.05]">
        {sorted.map((row, i) => {
          const isSelected = selected === row.pillar.id
          const avg =
            row.pillar.widget === WIDGETS.CHECK
              ? `${row.hit} session${row.hit === 1 ? '' : 's'}`
              : `${row.avgPerDay.toFixed(row.avgPerDay < 10 ? 1 : 0)} ${row.pillar.unit}/day`

          return (
            <motion.button
              key={row.pillar.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.028 }}
              onClick={() => {
                haptic(10)
                onSelect(isSelected ? null : row.pillar.id)
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
              style={{ background: isSelected ? 'rgba(255,255,255,0.035)' : 'transparent' }}
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl"
                style={{ background: `${row.pillar.accent}1c`, color: row.pillar.accent }}
              >
                <Icon name={row.pillar.icon} size={15} strokeWidth={2} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13.5px] font-medium text-white">
                    {row.pillar.name}
                  </span>
                  <span
                    className="tnum shrink-0 text-[13px] font-bold"
                    style={{ color: row.pillar.accent }}
                  >
                    {Math.round(row.consistency)}%
                  </span>
                </div>

                <div className="mt-1.5 h-[5px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: row.pillar.accent }}
                    initial={{ width: 0 }}
                    animate={{ width: `${row.consistency}%` }}
                    transition={{ type: 'spring', stiffness: 110, damping: 24, delay: i * 0.028 }}
                  />
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-white/30">
                  <span className="tnum">
                    {row.hit} of {windowDays} days
                  </span>
                  <span className="tnum">{avg}</span>
                </div>
              </div>

              <Icon
                name="chevronRight"
                size={14}
                className={`shrink-0 transition-transform ${
                  isSelected ? 'rotate-90 text-white/50' : 'text-white/15'
                }`}
              />
            </motion.button>
          )
        })}
      </div>
    </Panel>
  )
}

export default PillarBreakdown
