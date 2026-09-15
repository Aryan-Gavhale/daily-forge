import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion } from 'framer-motion'
import { Panel } from '../ui/Section'
import Icon from '../ui/Icon'
import { spring } from '../../lib/motion'
import { CATEGORY_MAP } from '../../data/pillars'
import { formatShort } from '../../lib/date'

/** Daily spend against the implied daily budget line. */
export function SpendChart({ series, dailyBudget, currency }) {
  return (
    <Panel padded={false}>
      <div className="flex items-baseline justify-between px-4 pt-4">
        <p className="text-[13px] font-medium text-white/70">Daily spend</p>
        <p className="text-[11.5px] text-white/30">
          Line is your pace:{' '}
          <span className="tnum">
            {currency}
            {Math.round(dailyBudget).toLocaleString('en-IN')}
          </span>
          /day
        </p>
      </div>

      <div className="mt-2 h-[130px] w-full pr-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={18}
            />
            <YAxis hide domain={[0, 'dataMax + 100']} />
            <ReferenceLine
              y={dailyBudget}
              stroke="rgba(50,213,131,0.5)"
              strokeDasharray="4 4"
              strokeWidth={1.2}
            />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<SpendTooltip currency={currency} />} />
            <Bar dataKey="amount" radius={[4, 4, 2, 2]} isAnimationActive animationDuration={650}>
              {series.map((d) => (
                <Cell
                  key={d.date}
                  fill={d.amount > dailyBudget ? '#f97066' : '#32d583'}
                  fillOpacity={d.amount > dailyBudget ? 0.9 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

function SpendTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-hairStrong glass px-3 py-2">
      <p className="text-[11px] text-white/40">{formatShort(d.date)}</p>
      <p className="tnum text-[14px] font-bold text-white">
        {currency}
        {d.amount.toLocaleString('en-IN')}
      </p>
    </div>
  )
}

/** Category split as a stacked meter plus a ranked list. */
export function CategoryBreakdown({ rows, currency }) {
  if (!rows.length) return null

  return (
    <Panel>
      <div className="mb-3 flex h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
        {rows.map((row, i) => {
          const c = CATEGORY_MAP[row.category] ?? CATEGORY_MAP.other
          return (
            <motion.span
              key={row.category}
              initial={{ width: 0 }}
              animate={{ width: `${row.percent}%` }}
              transition={{ type: 'spring', stiffness: 110, damping: 24, delay: i * 0.04 }}
              style={{ background: c.accent }}
            />
          )
        })}
      </div>

      <div className="space-y-2.5">
        {rows.map((row, i) => {
          const c = CATEGORY_MAP[row.category] ?? CATEGORY_MAP.other
          return (
            <motion.div
              key={row.category}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: i * 0.03 }}
              className="flex items-center gap-3"
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                style={{ background: `${c.accent}1c`, color: c.accent }}
              >
                <Icon name={c.icon} size={13} strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-white/65">{c.label}</span>
              <span className="tnum shrink-0 text-[11.5px] text-white/30">
                {Math.round(row.percent)}%
              </span>
              <span className="tnum w-[76px] shrink-0 text-right text-[13.5px] font-semibold text-white">
                {currency}
                {row.amount.toLocaleString('en-IN')}
              </span>
            </motion.div>
          )
        })}
      </div>
    </Panel>
  )
}

export default SpendChart
