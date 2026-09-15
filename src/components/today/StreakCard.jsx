import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import Counter from '../ui/Counter'
import { spring } from '../../lib/motion'
import { evaluateDay } from '../../lib/scoring'
import { weekKeys, weekdayShort, todayKey } from '../../lib/date'
import { useStore } from '../../store/useStore'

/**
 * Streak plus the current week at a glance. The flame only burns while the
 * streak is safe - once today is at risk it goes cold, which is the point.
 */
export function StreakCard({ streak, level }) {
  const days = useStore((s) => s.days)
  const settings = useStore((s) => s.settings)
  const today = todayKey()
  const keys = weekKeys(today)

  const alive = streak.current > 0
  const hot = alive && !streak.atRisk

  return (
    <div className="px-5 pt-3">
      <div className="overflow-hidden rounded-card border border-hair bg-ink-800/70 backdrop-blur-xl">
        <div className="flex items-center gap-3.5 px-4 pt-4">
          <motion.span
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
            style={{
              background: hot ? 'rgba(255,122,26,0.16)' : 'rgba(255,255,255,0.05)',
              color: hot ? '#ff7a1a' : 'rgba(255,255,255,0.32)',
            }}
            animate={hot ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={hot ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : spring}
          >
            <Icon name="flame" size={22} strokeWidth={1.9} />
            {hot && (
              <motion.span
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: '0 0 22px 2px rgba(255,122,26,0.4)' }}
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </motion.span>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <Counter
                value={streak.current}
                className="text-[24px] font-bold leading-none tracking-tightest"
                style={{ color: hot ? '#ff7a1a' : 'rgba(255,255,255,0.75)' }}
              />
              <span className="text-[13px] font-medium text-white/40">
                day{streak.current === 1 ? '' : 's'}
              </span>
            </div>
            <p className="mt-1 text-[12px] leading-snug text-white/35">
              {!alive
                ? 'No streak running. Today starts one.'
                : streak.atRisk
                  ? 'At risk until you clear today.'
                  : 'Safe. Keep it burning.'}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p
              className="text-[13px] font-bold tracking-tight"
              style={{ color: level.rank.accent }}
            >
              Lv {level.level}
            </p>
            <p className="text-[11px] text-white/30">{level.rank.name}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-between gap-1 px-4 pb-4">
          {keys.map((key, i) => {
            const isToday = key === today
            const isFuture = key > today
            const e = evaluateDay(days[key], settings, today)
            const state = isFuture ? 'future' : e.verdict.id

            const styles = {
              perfect: { bg: '#32d583', fg: '#0b0b0d' },
              forged: { bg: '#ff7a1a', fg: '#0b0b0d' },
              solid: { bg: '#4fd1c5', fg: '#0b0b0d' },
              survived: { bg: '#5b9cff', fg: '#0b0b0d' },
              pending: { bg: 'rgba(253,176,34,0.18)', fg: '#fdb022' },
              failed: { bg: 'rgba(249,112,102,0.16)', fg: '#f97066' },
              future: { bg: 'rgba(255,255,255,0.035)', fg: 'rgba(255,255,255,0.22)' },
            }[state]

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.04 + i * 0.022 }}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <span className="text-[10px] font-medium text-white/25">
                  {weekdayShort(key).charAt(0)}
                </span>
                <span
                  className="grid h-8 w-full max-w-[34px] place-items-center rounded-lg text-[11px] font-bold"
                  style={{
                    background: styles.bg,
                    color: styles.fg,
                    outline: isToday ? '1.5px solid rgba(255,255,255,0.5)' : 'none',
                    outlineOffset: '1.5px',
                  }}
                >
                  {isFuture ? '' : e.completed || ''}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StreakCard
