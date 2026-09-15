import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { EmptyState, Panel } from '../ui/Section'
import { spring, haptic } from '../../lib/motion'
import { CATEGORY_MAP } from '../../data/pillars'
import { formatRelativeDay } from '../../lib/date'

/**
 * Expenses grouped by day. Swipe a row left to reveal delete, the way a native
 * list behaves; the row also responds to a long-ish drag with a snap.
 */
export function ExpenseList({ groups, currency, onDelete }) {
  if (!groups.length) {
    return (
      <EmptyState
        title="Nothing logged this month"
        body="Tap the plus button to record what you spent. Logging anything clears the Money pillar for the day."
      />
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group, gi) => (
        <motion.div
          key={group.date}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: Math.min(0.3, gi * 0.035) }}
        >
          <div className="mb-1.5 flex items-baseline justify-between px-1">
            <span className="text-[12px] font-medium text-white/45">
              {formatRelativeDay(group.date)}
            </span>
            <span className="tnum text-[12px] font-semibold text-white/55">
              {currency}
              {group.total.toLocaleString('en-IN')}
            </span>
          </div>

          <Panel padded={false}>
            <div className="divide-y divide-white/[0.05]">
              <AnimatePresence initial={false}>
                {group.items.map((item) => (
                  <ExpenseRow
                    key={item.id}
                    item={item}
                    currency={currency}
                    onDelete={() => onDelete(item.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </Panel>
        </motion.div>
      ))}
    </div>
  )
}

function ExpenseRow({ item, currency, onDelete }) {
  const [revealed, setRevealed] = useState(false)
  const category = CATEGORY_MAP[item.category] ?? CATEGORY_MAP.other

  return (
    <motion.div
      layout
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={spring}
      className="relative overflow-hidden"
    >
      <button
        type="button"
        onClick={() => {
          haptic(14)
          onDelete()
        }}
        className="absolute inset-y-0 right-0 grid w-[76px] place-items-center bg-bad/20 text-bad"
        aria-label="Delete expense"
        tabIndex={revealed ? 0 : -1}
      >
        <Icon name="trash" size={17} />
      </button>

      <motion.div
        drag="x"
        dragConstraints={{ left: -76, right: 0 }}
        dragElastic={{ left: 0.08, right: 0 }}
        dragDirectionLock
        animate={{ x: revealed ? -76 : 0 }}
        transition={spring}
        onDragEnd={(_, info) => {
          const shouldReveal = info.offset.x < -34 || info.velocity.x < -420
          setRevealed(shouldReveal)
          if (shouldReveal) haptic(10)
        }}
        className="relative flex cursor-grab items-center gap-3 bg-ink-800 px-4 py-3 active:cursor-grabbing"
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ background: `${category.accent}1c`, color: category.accent }}
        >
          <Icon name={category.icon} size={16} strokeWidth={1.9} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium text-white">
            {item.note || category.label}
          </span>
          {item.note && (
            <span className="block truncate text-[11.5px] text-white/30">{category.label}</span>
          )}
        </span>

        <span className="tnum shrink-0 text-[14.5px] font-semibold text-white">
          {currency}
          {Number(item.amount).toLocaleString('en-IN')}
        </span>
      </motion.div>
    </motion.div>
  )
}

export default ExpenseList
