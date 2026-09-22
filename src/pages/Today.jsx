import { useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../components/shell/PageHeader'
import DayHero from '../components/today/DayHero'
import StreakCard from '../components/today/StreakCard'
import VersusPastSelf from '../components/today/VersusPastSelf'
import StreakBreakNotice from '../components/today/StreakBreakNotice'
import PillarCard from '../components/pillars/PillarCard'
import LogSheet from '../components/pillars/LogSheet'
import PlanStrip from '../components/plan/PlanStrip'
import Icon from '../components/ui/Icon'
import { spring, haptic } from '../lib/motion'
import { useDayEvaluation, useLevel, useStreak, useTodayKey } from '../hooks/useForge'
import { useStore } from '../store/useStore'
import { useUI } from '../store/useUI'
import { getPillar, WIDGETS } from '../data/pillars'
import { formatDay, greeting } from '../lib/date'

export function Today() {
  const today = useTodayKey()
  const evaluation = useDayEvaluation(today)
  const streak = useStreak()
  const level = useLevel()
  const bumpPillar = useStore((s) => s.bumpPillar)
  const celebrate = useStore((s) => s.celebrate)
  const toast = useUI((s) => s.toast)
  const [openPillar, setOpenPillar] = useState(null)

  const handleQuickAdd = async (pillarId, step) => {
    const result = evaluation.byPillar[pillarId]
    await bumpPillar(today, pillarId, step)

    const nextValue = result.value + step
    if (nextValue >= result.target && !result.done) {
      haptic([14, 40, 22])
      celebrate({ kind: 'pillar', pillarId })
      toast(`${result.pillar.name} done`, { tone: 'success', detail: 'Pillar cleared' })
    } else {
      const unit = result.pillar.widget === WIDGETS.CHECK ? '' : ` ${result.pillar.unit}`
      toast(`${result.pillar.name} +${step}${unit}`, { tone: 'xp' })
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={formatDay(today)}
        title={greeting()}
        trailing={
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="flex items-center gap-1.5 rounded-full border border-hair bg-white/[0.05] px-2.5 py-1.5"
          >
            <Icon
              name="flame"
              size={14}
              className={streak.current > 0 && !streak.atRisk ? 'text-flame' : 'text-white/30'}
            />
            <span className="tnum text-[13px] font-bold text-white">{streak.current}</span>
          </motion.div>
        }
      />

      <StreakBreakNotice />

      <div className="desk-cols">
        {/* Phone order is hero first, then the grid. A desktop window has room
            for both at once, so the grid moves alongside rather than below. */}
        <div className="lg:col-span-5">
          <DayHero evaluation={evaluation} streak={streak} />
          <StreakCard streak={streak} level={level} />
          <PlanStrip />
          <VersusPastSelf />
        </div>

        <div className="lg:col-span-7">
          <div className="pad-x pt-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold tracking-tight text-white">Pillars</h2>
              <span className="tnum text-[12px] text-white/30">
                {evaluation.completed}/{evaluation.enabledCount} done
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">
              {evaluation.results.map((result, i) => (
                <PillarCard
                  key={result.pillarId}
                  evaluation={result}
                  index={i}
                  onOpen={setOpenPillar}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <LogSheet
        pillar={openPillar ? getPillar(openPillar) : null}
        date={today}
        open={Boolean(openPillar)}
        onClose={() => setOpenPillar(null)}
      />
    </>
  )
}

export default Today
