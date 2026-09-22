import { useEffect, useState } from 'react'
import PageHeader from '../components/shell/PageHeader'
import Section from '../components/ui/Section'
import Icon from '../components/ui/Icon'
import PlanHero from '../components/plan/PlanHero'
import WeekBoard from '../components/plan/WeekBoard'
import WeekTimeline from '../components/plan/WeekTimeline'
import TrackMeters, { OutputTotals } from '../components/plan/TrackMeters'
import GateCard from '../components/plan/GateCard'
import PlanRules, { OutOfScope } from '../components/plan/PlanNotes'
import PlanSetupSheet from '../components/plan/PlanSetupSheet'
import { useStore } from '../store/useStore'
import { useUI } from '../store/useUI'
import { usePlan } from '../hooks/useForge'
import { PLAN_LENGTH, PLAN_META } from '../data/plan'

export function Plan() {
  const plan = usePlan()
  const togglePlanTask = useStore((s) => s.togglePlanTask)
  const bumpPlanCount = useStore((s) => s.bumpPlanCount)
  const setPlanNote = useStore((s) => s.setPlanNote)
  const celebrate = useStore((s) => s.celebrate)
  const toast = useUI((s) => s.toast)

  const [selected, setSelected] = useState(plan.currentWeek)
  const [setupOpen, setSetupOpen] = useState(false)

  // Follow the calendar unless the user has deliberately looked elsewhere.
  useEffect(() => {
    setSelected(plan.currentWeek)
  }, [plan.currentWeek])

  const week = plan.weeks[selected - 1]
  const activeGate = week.gate ?? nearestGate(plan, selected)

  const handleToggle = async (taskId) => {
    const done = await togglePlanTask(week.n, taskId)
    if (done && week.done + 1 === week.total) {
      celebrate({ kind: 'plan-week', week: week.n })
      toast(`Week ${week.n} complete`, { tone: 'success', detail: week.week.title })
    }
  }

  const handleBump = async (taskId, delta) => {
    const result = week.tasks.find((t) => t.task.id === taskId)
    const next = await bumpPlanCount(week.n, taskId, delta)
    if (result && !result.done && next >= result.target) {
      toast(result.task.label, { tone: 'success', detail: 'Target hit' })
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={PLAN_META.goal}
        title="Plan"
        trailing={
          <button
            type="button"
            onClick={() => setSetupOpen(true)}
            className="pressable grid h-9 w-9 place-items-center rounded-full border border-hair bg-white/[0.05] text-white/55"
            aria-label="Plan settings"
          >
            <Icon name="settings" size={17} />
          </button>
        }
      />

      <div className="desk-cols">
        <div className="lg:col-span-7">
          <PlanHero plan={plan} onEdit={() => setSetupOpen(true)} />
          <WeekBoard
            week={week}
            onToggle={handleToggle}
            onBump={handleBump}
            onNote={(v) => setPlanNote(week.n, v)}
            onStep={(delta) =>
              setSelected((n) => Math.min(PLAN_LENGTH, Math.max(1, n + delta)))
            }
          />

          <Section
            title="Sixteen weeks"
            subtitle="Tap any week to read it. A red chip is a week that closed unfinished."
            delay={0.04}
          >
            <WeekTimeline
              weeks={plan.weeks}
              selected={selected}
              currentWeek={plan.currentWeek}
              onSelect={setSelected}
            />
          </Section>
        </div>

        <div className="lg:col-span-5">
          <Section title="Tracks" subtitle="Where the sixteen weeks are being spent" delay={0.02}>
            <TrackMeters tracks={plan.tracks} />
          </Section>

          <Section title="Output" subtitle="What the four months should produce" delay={0.04}>
            <OutputTotals totals={plan.totals} />
          </Section>

          {activeGate && (
            <Section
              title="Gate"
              subtitle={`Checkpoint at the end of week ${activeGate.week}`}
              delay={0.06}
            >
              <GateCard
                gate={activeGate}
                locked={activeGate.weekState === 'future'}
                onToggle={(key) => togglePlanTask(activeGate.weekN, key)}
              />
            </Section>
          )}

          <Section title="Non-negotiables" delay={0.08}>
            <PlanRules />
          </Section>

          <Section title="Out of scope" subtitle="Dropped on purpose" delay={0.1}>
            <OutOfScope />
          </Section>
        </div>
      </div>

      <div className="h-4" />

      <PlanSetupSheet open={setupOpen} onClose={() => setSetupOpen(false)} />
    </>
  )
}

/** Looking at week 6 should still show the month-two gate you are working toward. */
function nearestGate(plan, weekNumber) {
  const next = plan.gates.find((g) => g.week >= weekNumber)
  return next ?? plan.gates[plan.gates.length - 1] ?? null
}

export default Plan
