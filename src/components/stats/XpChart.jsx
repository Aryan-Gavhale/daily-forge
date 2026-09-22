import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel } from '../ui/Section'
import Counter from '../ui/Counter'
import { formatShort } from '../../lib/date'

/** XP over the selected window, with the window average called out. */
export function XpChart({ trend }) {
  const { total, average, best } = useMemo(() => {
    const sum = trend.reduce((s, d) => s + d.xp, 0)
    const top = trend.reduce((m, d) => (d.xp > m.xp ? d : m), trend[0] ?? { xp: 0 })
    return {
      total: sum,
      average: trend.length ? Math.round(sum / trend.length) : 0,
      best: top,
    }
  }, [trend])

  return (
    <Panel padded={false}>
      <div className="flex items-end justify-between px-4 pt-4">
        <div>
          <p className="label-eyebrow">Total XP</p>
          <Counter
            value={total}
            className="mt-1 block text-[26px] font-bold leading-none tracking-tightest text-white"
          />
        </div>
        <div className="flex gap-5 text-right">
          <div>
            <p className="label-eyebrow">Avg / day</p>
            <p className="tnum mt-1 text-[15px] font-semibold text-white/70">{average}</p>
          </div>
          <div>
            <p className="label-eyebrow">Best</p>
            <p className="tnum mt-1 text-[15px] font-semibold text-flame">{best?.xp ?? 0}</p>
          </div>
        </div>
      </div>

      {/* A desktop window has the height to spare, and a wider chart with the
          same 150px would read as a flat line. */}
      <div className="mt-3 h-[150px] w-full pr-1 lg:h-[232px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff7a1a" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#ff7a1a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis hide domain={[0, 'dataMax + 60']} />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.14)' }}
              content={<XpTooltip />}
              wrapperStyle={{ outline: 'none' }}
            />
            <Area
              type="monotone"
              dataKey="xp"
              stroke="#ff7a1a"
              strokeWidth={2}
              fill="url(#xpFill)"
              dot={false}
              activeDot={{ r: 4, fill: '#ff7a1a', stroke: '#08080a', strokeWidth: 2 }}
              isAnimationActive
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

function XpTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-hairStrong glass px-3 py-2">
      <p className="text-[11px] text-white/40">{formatShort(d.date)}</p>
      <p className="tnum text-[14px] font-bold text-flame">{d.xp} XP</p>
      <p className="tnum text-[11px] text-white/40">
        {d.completed}/{d.required} minimum
      </p>
    </div>
  )
}

export default XpChart
