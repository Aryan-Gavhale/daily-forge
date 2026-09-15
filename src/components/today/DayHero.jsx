import { motion } from 'framer-motion'
import { Ring } from '../ui/Ring'
import Counter from '../ui/Counter'
import Icon from '../ui/Icon'
import { spring } from '../../lib/motion'
import { hoursLeftToday } from '../../lib/date'

/**
 * The one thing you should see first: how much of today is banked, and how
 * much is left before the day is counted as failed.
 */
export function DayHero({ evaluation, streak }) {
  const { verdict, xp, completed, enabledCount, required, remaining, maxXp } = evaluation
  const ringProgress = enabledCount ? completed / enabledCount : 0
  const hoursLeft = Math.ceil(hoursLeftToday())

  return (
    <div className="relative px-5 pt-5">
      <div className="relative overflow-hidden rounded-[28px] border border-hair bg-ink-800/70 px-5 pb-5 pt-6 backdrop-blur-xl">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `${verdict.accent}22` }}
        />

        <div className="relative flex items-center gap-5">
          <Ring progress={ringProgress} size={132} stroke={11} accent={verdict.accent}>
            <Counter
              value={xp}
              className="text-[30px] font-bold leading-none tracking-tightest text-white"
            />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              XP today
            </span>
          </Ring>

          <div className="min-w-0 flex-1">
            <motion.div
              key={verdict.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ background: `${verdict.accent}1f`, color: verdict.accent }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: verdict.accent }} />
              <span className="text-[11.5px] font-semibold tracking-tight">{verdict.label}</span>
            </motion.div>

            <p className="mt-2.5 flex items-baseline gap-1.5">
              <Counter
                value={completed}
                className="text-[28px] font-bold leading-none tracking-tightest text-white"
              />
              <span className="text-[14px] font-medium text-white/35">
                / {enabledCount} pillars
              </span>
            </p>

            <p className="mt-1.5 text-[12.5px] leading-snug text-white/40">{verdict.blurb}</p>

            <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-white/30">
              <Icon name="bolt" size={13} />
              <span className="tnum">
                {xp} of {maxXp} XP available
              </span>
            </div>
          </div>
        </div>

        {remaining > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.08 }}
            className="relative mt-4 flex items-center gap-3 rounded-2xl border border-warn/25 bg-warn/[0.07] px-3.5 py-3"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-warn/15 text-warn">
              <Icon name="target" size={16} />
            </span>
            <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-white/70">
              <span className="font-semibold text-warn">
                {remaining} more {remaining === 1 ? 'pillar' : 'pillars'}
              </span>{' '}
              to clear the minimum of {required}.
              {streak.current > 0 && (
                <>
                  {' '}
                  Your {streak.current}-day streak ends otherwise.
                </>
              )}
            </p>
            <span className="tnum shrink-0 text-[11px] font-semibold text-white/35">
              {hoursLeft}h left
            </span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.08 }}
            className="relative mt-4 flex items-center gap-3 rounded-2xl border border-good/25 bg-good/[0.07] px-3.5 py-3"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-good/15 text-good">
              <Icon name="check" size={16} strokeWidth={2.6} />
            </span>
            <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-white/70">
              Day is banked.{' '}
              {completed < enabledCount ? (
                <span className="text-white/45">
                  {enabledCount - completed} left if you want a perfect day.
                </span>
              ) : (
                <span className="font-semibold text-good">All eight. Nothing left.</span>
              )}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default DayHero
