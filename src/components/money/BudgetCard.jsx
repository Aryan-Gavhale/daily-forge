import { motion } from 'framer-motion'
import { Ring } from '../ui/Ring'
import Icon from '../ui/Icon'
import { spring } from '../../lib/motion'
import { compactAmount } from '../../lib/stats'

/**
 * Month at a glance: spend against budget, what remains per remaining day, and
 * the two habits that actually move the number (saving, and no-spend days).
 */
export function BudgetCard({ spent, budget, saved, savingsGoal, noSpend, currency, daysLeft }) {
  const ratio = budget > 0 ? spent / budget : 0
  const over = spent > budget && budget > 0
  const accent = over ? '#f97066' : ratio > 0.8 ? '#fdb022' : '#32d583'
  const remaining = Math.max(0, budget - spent)
  const perDay = daysLeft > 0 ? Math.round(remaining / daysLeft) : remaining

  return (
    <div className="px-5 pt-5">
      <div className="relative overflow-hidden rounded-[28px] border border-hair bg-ink-800/70 p-5 backdrop-blur-xl">
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `${accent}1f` }}
        />

        <div className="relative flex items-center gap-5">
          <Ring progress={ratio} size={126} stroke={11} accent={accent}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Spent
            </span>
            <span className="mt-1 flex items-baseline">
              <span className="text-[13px] font-medium text-white/35">{currency}</span>
              <span className="tnum text-[24px] font-bold leading-none tracking-tightest text-white">
                {compactAmount(spent)}
              </span>
            </span>
          </Ring>

          <div className="min-w-0 flex-1">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ background: `${accent}1c`, color: accent }}
            >
              <Icon name={over ? 'arrowUp' : 'wallet'} size={12} strokeWidth={2.2} />
              <span className="text-[11.5px] font-semibold">
                {over ? 'Over budget' : `${Math.round(ratio * 100)}% used`}
              </span>
            </motion.div>

            <p className="mt-2.5 text-[12px] text-white/35">
              Budget{' '}
              <span className="tnum text-white/60">
                {currency}
                {budget.toLocaleString('en-IN')}
              </span>
            </p>
            <p className="mt-1 text-[12px] text-white/35">
              {over ? 'Over by ' : 'Left '}
              <span className="tnum font-semibold" style={{ color: accent }}>
                {currency}
                {(over ? spent - budget : remaining).toLocaleString('en-IN')}
              </span>
            </p>
            {!over && daysLeft > 0 && (
              <p className="mt-1 text-[11.5px] text-white/25">
                <span className="tnum">
                  {currency}
                  {perDay.toLocaleString('en-IN')}
                </span>{' '}
                a day for {daysLeft} more {daysLeft === 1 ? 'day' : 'days'}
              </p>
            )}
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2.5">
          <MiniStat
            icon="arrowUp"
            accent="#32d583"
            label="Saved this month"
            value={`${currency}${compactAmount(saved)}`}
            progress={savingsGoal > 0 ? saved / savingsGoal : 0}
            sub={savingsGoal > 0 ? `of ${currency}${savingsGoal.toLocaleString('en-IN')}` : null}
          />
          <MiniStat
            icon="check"
            accent="#5b9cff"
            label="No-spend days"
            value={String(noSpend)}
            progress={noSpend / 10}
            sub="10 is a strong month"
          />
        </div>
      </div>
    </div>
  )
}

function MiniStat({ icon, accent, label, value, sub, progress }) {
  return (
    <div className="rounded-2xl bg-white/[0.035] p-3 hairline">
      <div className="flex items-center gap-1.5">
        <span style={{ color: accent }}>
          <Icon name={icon} size={13} strokeWidth={2.2} />
        </span>
        <span className="text-[10.5px] text-white/35">{label}</span>
      </div>
      <p className="tnum mt-1.5 text-[17px] font-bold leading-none text-white">{value}</p>
      {sub && <p className="mt-1 text-[10.5px] text-white/25">{sub}</p>}
      <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: accent }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          transition={{ type: 'spring', stiffness: 110, damping: 24 }}
        />
      </div>
    </div>
  )
}

export default BudgetCard
