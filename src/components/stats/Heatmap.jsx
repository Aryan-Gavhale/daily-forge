import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Panel } from '../ui/Section'
import Icon from '../ui/Icon'
import { heatmap, heatmapMonthLabels } from '../../lib/stats'
import { formatDay } from '../../lib/date'
import { haptic, spring } from '../../lib/motion'

const LEVELS = [0.06, 0.22, 0.45, 0.7, 1]

/**
 * Consistency grid. Columns are weeks, rows Mon..Sun. Tapping a cell shows the
 * day inline rather than in a tooltip, which does not exist on touch.
 */
export function Heatmap({ days, settings, pillar = null, weeks = 18, now }) {
  const [selected, setSelected] = useState(null)

  const grid = useMemo(
    () => heatmap(days, settings, pillar?.id ?? null, weeks, now),
    [days, settings, pillar, weeks, now]
  )
  const months = useMemo(() => heatmapMonthLabels(grid.columns), [grid])

  const accent = pillar?.accent ?? '#ff7a1a'
  const active = useMemo(
    () => grid.columns.flatMap((c) => c.cells).filter((c) => !c.future && c.intensity > 0).length,
    [grid]
  )
  const totalDays = useMemo(
    () => grid.columns.flatMap((c) => c.cells).filter((c) => !c.future).length,
    [grid]
  )

  return (
    <Panel>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[13px] font-medium text-white/70">
          {pillar ? pillar.name : 'All pillars'}
        </p>
        <p className="tnum text-[12px] text-white/35">
          {active} of {totalDays} days active
        </p>
      </div>

      <div className="scroll-area -mx-1 px-1 pb-1" style={{ overflowX: 'auto' }}>
        <div className="min-w-max">
          <div className="mb-1 flex gap-[3px]">
            {grid.columns.map((col, i) => {
              const label = months.find((m) => m.index === i)
              return (
                <span key={col.weekStart} className="w-[13px] text-[9px] text-white/25">
                  {label?.label ?? ''}
                </span>
              )
            })}
          </div>

          <div className="flex gap-[3px]">
            {grid.columns.map((col, ci) => (
              <div key={col.weekStart} className="flex flex-col gap-[3px]">
                {col.cells.map((cell) => (
                  <motion.button
                    key={cell.date}
                    type="button"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: cell.future ? 0.25 : 1, scale: 1 }}
                    transition={{ ...spring, delay: Math.min(0.4, ci * 0.008) }}
                    whileTap={cell.future ? undefined : { scale: 1.35 }}
                    onClick={() => {
                      if (cell.future) return
                      haptic(8)
                      setSelected(selected?.date === cell.date ? null : cell)
                    }}
                    className="h-[13px] w-[13px] rounded-[3px]"
                    style={{
                      background: cell.future
                        ? 'rgba(255,255,255,0.02)'
                        : cell.intensity === 0
                          ? 'rgba(255,255,255,0.045)'
                          : accent,
                      opacity: cell.future ? 0.3 : cell.intensity === 0 ? 1 : LEVELS[cell.intensity],
                      outline:
                        selected?.date === cell.date ? '1.5px solid rgba(255,255,255,0.7)' : 'none',
                      outlineOffset: '1px',
                    }}
                    aria-label={`${cell.date} ${cell.label}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {selected ? (
          <motion.p
            key={selected.date}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-[12px] text-white/55"
          >
            <Icon name="calendar" size={13} className="text-white/30" />
            <span>{formatDay(selected.date)}</span>
            <span className="text-white/25">·</span>
            <span style={{ color: accent }}>{selected.label}</span>
          </motion.p>
        ) : (
          <p className="text-[11.5px] text-white/25">Tap a square for that day</p>
        )}

        <div className="flex items-center gap-1">
          <span className="mr-1 text-[10px] text-white/25">Less</span>
          {LEVELS.map((op, i) => (
            <span
              key={i}
              className="h-[9px] w-[9px] rounded-[2px]"
              style={{
                background: i === 0 ? 'rgba(255,255,255,0.045)' : accent,
                opacity: i === 0 ? 1 : op,
              }}
            />
          ))}
          <span className="ml-1 text-[10px] text-white/25">More</span>
        </div>
      </div>
    </Panel>
  )
}

export default Heatmap
