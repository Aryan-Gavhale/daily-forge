import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EmptyState, Panel } from '../ui/Section'
import { spring, haptic } from '../../lib/motion'
import { formatDay } from '../../lib/date'
import { MOODS } from '../../data/pillars'

/** Journal entries, newest first, collapsed to three lines until tapped. */
export function JournalHistory({ entries, limit = 12 }) {
  const [expanded, setExpanded] = useState(null)
  const [showAll, setShowAll] = useState(false)

  if (!entries.length) {
    return (
      <EmptyState
        title="Nothing written yet"
        body="Open the Mind pillar and write the day down. Entries collect here."
      />
    )
  }

  const visible = showAll ? entries : entries.slice(0, limit)

  return (
    <div className="space-y-2.5">
      {visible.map((entry, i) => {
        const mood = MOODS.find((m) => m.value === Number(entry.mood))
        const open = expanded === entry.date
        return (
          <motion.div
            key={entry.date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: Math.min(0.25, i * 0.03) }}
          >
            <Panel>
              <button
                type="button"
                onClick={() => {
                  haptic(9)
                  setExpanded(open ? null : entry.date)
                }}
                className="w-full text-left"
              >
                <div className="mb-2 flex items-center gap-2">
                  {mood && (
                    <span
                      className="grid h-6 w-6 place-items-center rounded-md text-[13px]"
                      style={{ background: `${mood.accent}1c` }}
                    >
                      {mood.emoji}
                    </span>
                  )}
                  <span className="text-[12px] font-medium text-white/50">
                    {formatDay(entry.date)}
                  </span>
                  {entry.minutes > 0 && (
                    <span className="tnum text-[11px] text-white/25">{entry.minutes} min sat</span>
                  )}
                </div>

                <AnimatePresence initial={false} mode="wait">
                  <motion.p
                    key={open ? 'full' : 'clamped'}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.18 }}
                    className={`whitespace-pre-wrap text-[13.5px] leading-relaxed text-white/75 ${
                      open ? '' : 'line-clamp-3'
                    }`}
                  >
                    {entry.text}
                  </motion.p>
                </AnimatePresence>
              </button>
            </Panel>
          </motion.div>
        )
      })}

      {!showAll && entries.length > limit && (
        <button
          type="button"
          onClick={() => {
            haptic(10)
            setShowAll(true)
          }}
          className="h-11 w-full rounded-card bg-white/[0.04] text-[13px] font-medium text-white/55 hairline"
        >
          Show {entries.length - limit} older {entries.length - limit === 1 ? 'entry' : 'entries'}
        </button>
      )}
    </div>
  )
}

export default JournalHistory
