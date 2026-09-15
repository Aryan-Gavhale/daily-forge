import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { EmptyState, Panel } from '../ui/Section'
import { spring, haptic } from '../../lib/motion'
import { formatShort } from '../../lib/date'

/**
 * Weekly report cards. The current week is graded live and labelled as such,
 * so a Tuesday's C does not read as a finished verdict.
 */
export function ReportCards({ cards }) {
  const [openWeek, setOpenWeek] = useState(cards[0]?.weekStart ?? null)

  if (!cards.length) {
    return (
      <EmptyState
        title="No report cards yet"
        body="Every Sunday closes a week and grades each pillar from A+ to F."
      />
    )
  }

  return (
    <div className="space-y-2.5">
      {cards.map((card, i) => {
        const open = openWeek === card.weekStart
        return (
          <motion.div
            key={card.weekStart}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: Math.min(0.25, i * 0.04) }}
          >
            <Panel padded={false}>
              <button
                type="button"
                onClick={() => {
                  haptic(10)
                  setOpenWeek(open ? null : card.weekStart)
                }}
                className="flex w-full items-center gap-3.5 p-4 text-left"
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[18px] font-bold"
                  style={{
                    background: `${card.overallGrade.accent}1c`,
                    color: card.overallGrade.accent,
                    border: `1px solid ${card.overallGrade.accent}3d`,
                  }}
                >
                  {card.overallGrade.letter}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-white">
                      {formatShort(card.weekStart)} – {formatShort(card.weekEnd)}
                    </span>
                    {card.isCurrent && (
                      <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-white/45">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-white/35">
                    <span className="tnum">{card.xp.toLocaleString('en-IN')}</span> XP ·{' '}
                    <span className="tnum">{card.wonDays}</span>/
                    <span className="tnum">{card.daysCounted}</span> cleared
                    {card.failedDays > 0 && (
                      <>
                        {' · '}
                        <span className="text-bad">
                          <span className="tnum">{card.failedDays}</span> failed
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <motion.span
                  animate={{ rotate: open ? 90 : 0 }}
                  transition={spring}
                  className="shrink-0 text-white/20"
                >
                  <Icon name="chevronRight" size={16} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 border-t border-hair px-4 py-3.5">
                      <p className="text-[11.5px] italic text-white/35">
                        {card.overallGrade.note}
                      </p>
                      {card.perPillar.map((row) => (
                        <div key={row.pillar.id} className="flex items-center gap-3">
                          <span
                            className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                            style={{ background: `${row.pillar.accent}1c`, color: row.pillar.accent }}
                          >
                            <Icon name={row.pillar.icon} size={12} strokeWidth={2} />
                          </span>
                          <span className="w-[88px] shrink-0 truncate text-[12.5px] text-white/60">
                            {row.pillar.name}
                          </span>
                          <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: row.grade.accent }}
                              initial={{ width: 0 }}
                              animate={{ width: `${row.percent}%` }}
                              transition={{ type: 'spring', stiffness: 120, damping: 24 }}
                            />
                          </div>
                          <span className="tnum w-9 shrink-0 text-right text-[11px] text-white/30">
                            {row.hit}/{row.possible}
                          </span>
                          <span
                            className="w-6 shrink-0 text-right text-[13px] font-bold"
                            style={{ color: row.grade.accent }}
                          >
                            {row.grade.letter}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Panel>
          </motion.div>
        )
      })}
    </div>
  )
}

export default ReportCards
