import { useMemo, useState } from 'react'
import PageHeader from '../components/shell/PageHeader'
import Section, { EmptyState } from '../components/ui/Section'
import { Segmented } from '../components/ui/Field'
import XpChart from '../components/stats/XpChart'
import WeekCompare from '../components/stats/WeekCompare'
import Heatmap from '../components/stats/Heatmap'
import PillarBreakdown from '../components/stats/PillarBreakdown'
import PersonalBests from '../components/stats/PersonalBests'
import { useStore } from '../store/useStore'
import { useIsDesktop } from '../lib/useMediaQuery'
import { useStreak, useTodayKey } from '../hooks/useForge'
import { personalBests, pillarWindows, weekOverWeek, xpTrend } from '../lib/stats'
import { getPillar } from '../data/pillars'

const RANGES = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
]

export function Stats() {
  const days = useStore((s) => s.days)
  const settings = useStore((s) => s.settings)
  const today = useTodayKey()
  const streak = useStreak()
  const desktop = useIsDesktop()
  const [range, setRange] = useState(30)
  const [focusPillar, setFocusPillar] = useState(null)

  const hasData = Object.keys(days).length > 0

  const trend = useMemo(() => xpTrend(days, settings, range, today), [days, settings, range, today])
  const wow = useMemo(() => weekOverWeek(days, settings, today), [days, settings, today])
  const windows = useMemo(
    () => pillarWindows(days, settings, range, today),
    [days, settings, range, today]
  )
  const bests = useMemo(() => personalBests(days, settings, today), [days, settings, today])

  return (
    <>
      <PageHeader
        eyebrow="Beat your past self"
        title="Stats"
        trailing={
          <div className="w-[136px]">
            <Segmented options={RANGES} value={range} onChange={setRange} />
          </div>
        }
      />

      {!hasData ? (
        <Section title="Nothing to measure yet" delay={0.02}>
          <EmptyState
            title="Log your first day"
            body="Charts, streak records and your week-over-week comparison appear once there is something to compare."
          />
        </Section>
      ) : (
        <div className="desk-cols">
          <Section
            title={`XP · last ${range} days`}
            delay={0.02}
            className="lg:col-span-7"
          >
            <XpChart trend={trend} />
          </Section>

          <Section title="This week vs last week" delay={0.04} className="lg:col-span-5">
            <WeekCompare wow={wow} />
          </Section>

          <Section
            title="Consistency"
            subtitle={focusPillar ? getPillar(focusPillar).name : 'Every pillar, day by day'}
            delay={0.06}
            className="lg:col-span-12"
          >
            <Heatmap
              days={days}
              settings={settings}
              pillar={focusPillar ? getPillar(focusPillar) : null}
              weeks={desktop ? 30 : 18}
              now={today}
            />
          </Section>

          <Section
            title={`Pillar breakdown · ${range} days`}
            subtitle="Weakest first. Tap one to filter the grid above."
            delay={0.08}
            className="lg:col-span-7"
          >
            <PillarBreakdown
              windows={windows}
              windowDays={range}
              selected={focusPillar}
              onSelect={setFocusPillar}
            />
          </Section>

          <Section
            title="Personal bests"
            subtitle="Numbers to beat"
            delay={0.1}
            className="lg:col-span-5"
          >
            <PersonalBests bests={bests} streak={streak} />
          </Section>
        </div>
      )}

      <div className="h-4" />
    </>
  )
}

export default Stats
