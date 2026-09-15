import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Sheet from '../ui/Sheet'
import Icon from '../ui/Icon'
import LogSheet from './LogSheet'
import { spring, haptic } from '../../lib/motion'
import { useStore } from '../../store/useStore'
import { useDayEvaluation, useTodayKey } from '../../hooks/useForge'
import { useUI } from '../../store/useUI'
import { WIDGETS } from '../../data/pillars'

/**
 * The centre tab-bar action: pick a pillar, then land straight in its log
 * sheet. Anything already finished drops to the bottom and dims.
 */
export function QuickLogSheet({ open, onClose }) {
  const today = useTodayKey()
  const evaluation = useDayEvaluation(today)
  const bumpPillar = useStore((s) => s.bumpPillar)
  const celebrate = useStore((s) => s.celebrate)
  const toast = useUI((s) => s.toast)
  const [picked, setPicked] = useState(null)

  const ordered = useMemo(() => {
    const pending = evaluation.results.filter((r) => !r.done)
    const done = evaluation.results.filter((r) => r.done)
    return [...pending, ...done]
  }, [evaluation])

  const quickAdd = async (result) => {
    const step =
      result.pillar.widget === WIDGETS.CHECK ? result.target : result.pillar.quickAdd?.[0] ?? 1
    await bumpPillar(today, result.pillarId, step)
    const nextValue = result.value + step
    if (nextValue >= result.target && !result.done) {
      haptic([14, 40, 22])
      celebrate({ kind: 'pillar', pillarId: result.pillarId })
      toast(`${result.pillar.name} done`, { tone: 'success' })
    } else {
      toast(`${result.pillar.name} +${step}`, { tone: 'xp' })
    }
  }

  return (
    <>
      <Sheet
        open={open && !picked}
        onClose={onClose}
        title="Log something"
        subtitle={`${evaluation.completed} of ${evaluation.enabledCount} pillars done today`}
        accent="#ff7a1a"
      >
        <div className="space-y-2 pb-2">
          {ordered.map((r, i) => (
            <motion.div
              key={r.pillarId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.024 }}
              className="flex items-center gap-2"
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                transition={spring}
                onClick={() => {
                  haptic(10)
                  setPicked(r.pillar)
                }}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3.5 py-3 text-left hairline"
                style={{
                  background: r.done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.045)',
                  opacity: r.done ? 0.55 : 1,
                }}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${r.pillar.accent}1f`, color: r.pillar.accent }}
                >
                  <Icon name={r.pillar.icon} size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-medium text-white">
                    {r.pillar.name}
                  </span>
                  <span className="block text-[12px] text-white/35">
                    {r.pillar.widget === WIDGETS.CHECK
                      ? r.done
                        ? 'Done'
                        : 'Not logged'
                      : `${r.value} / ${r.target} ${r.pillar.unit}`}
                  </span>
                </span>
                {r.done ? (
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full"
                    style={{ background: r.pillar.accent, color: '#0b0b0d' }}
                  >
                    <Icon name="check" size={13} strokeWidth={3} />
                  </span>
                ) : (
                  <Icon name="chevronRight" size={16} className="text-white/25" />
                )}
              </motion.button>

              {!r.done && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  transition={spring}
                  onClick={() => quickAdd(r)}
                  aria-label={`Quick add ${r.pillar.name}`}
                  className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl hairline"
                  style={{ background: `${r.pillar.accent}1a`, color: r.pillar.accent }}
                >
                  <Icon
                    name={r.pillar.widget === WIDGETS.CHECK ? 'check' : 'plus'}
                    size={20}
                    strokeWidth={2.4}
                  />
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </Sheet>

      <LogSheet
        pillar={picked}
        date={today}
        open={Boolean(picked)}
        onClose={() => {
          setPicked(null)
          onClose()
        }}
      />
    </>
  )
}

export default QuickLogSheet
