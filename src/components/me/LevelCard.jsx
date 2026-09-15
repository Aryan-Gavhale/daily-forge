import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import Counter from '../ui/Counter'
import { spring } from '../../lib/motion'
import { totalXpForLevel } from '../../data/levels'

/** Rank, level progress, and the headline lifetime numbers. */
export function LevelCard({ level, streak, bests, name }) {
  const nextLevelXp = totalXpForLevel(level.level + 1)

  return (
    <div className="px-5 pt-5">
      <div className="relative overflow-hidden rounded-[28px] border border-hair bg-ink-800/70 p-5 backdrop-blur-xl">
        <div
          className="pointer-events-none absolute -top-24 right-0 h-52 w-52 rounded-full blur-3xl"
          style={{ background: `${level.rank.accent}22` }}
        />

        <div className="relative flex items-center gap-4">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={spring}
            className="relative grid h-[58px] w-[58px] shrink-0 place-items-center rounded-2xl"
            style={{
              background: `linear-gradient(150deg, ${level.rank.accent}38, rgba(255,255,255,0.03))`,
              border: `1px solid ${level.rank.accent}45`,
            }}
          >
            <span
              className="tnum text-[21px] font-bold leading-none"
              style={{ color: level.rank.accent }}
            >
              {level.level}
            </span>
          </motion.span>

          <div className="min-w-0 flex-1">
            {name && <p className="truncate text-[15px] font-semibold text-white">{name}</p>}
            <p
              className="text-[13px] font-semibold tracking-tight"
              style={{ color: level.rank.accent }}
            >
              {level.rank.name}
            </p>
            <p className="mt-0.5 text-[12px] text-white/35">
              <span className="tnum">{level.remaining.toLocaleString('en-IN')}</span> XP to level{' '}
              {level.level + 1}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <Counter
              value={totalXpForLevel(level.level) + level.into}
              className="block text-[20px] font-bold leading-none tracking-tightest text-white"
            />
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/30">total XP</p>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="mb-1.5 flex justify-between text-[10.5px] text-white/25">
            <span className="tnum">{totalXpForLevel(level.level).toLocaleString('en-IN')}</span>
            <span className="tnum">{nextLevelXp.toLocaleString('en-IN')}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${level.rank.accent}99, ${level.rank.accent})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${level.ratio * 100}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 24 }}
            />
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2.5 border-t border-hair pt-4">
          <Stat icon="flame" accent="#ff7a1a" label="Streak" value={streak.current} />
          <Stat icon="trophy" accent="#fdb022" label="Record" value={bests.longestStreak} />
          <Stat icon="calendar" accent="#5b9cff" label="Days" value={bests.trackedDays} />
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, accent, label, value }) {
  return (
    <div className="text-center">
      <span className="mx-auto mb-1.5 grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${accent}1c`, color: accent }}>
        <Icon name={icon} size={13} strokeWidth={2.1} />
      </span>
      <Counter
        value={value}
        className="block text-[17px] font-bold leading-none tracking-tightest text-white"
      />
      <p className="mt-1 text-[10.5px] text-white/30">{label}</p>
    </div>
  )
}

export default LevelCard
