import { useEffect, useState } from 'react'
import Sheet, { SheetButton } from '../ui/Sheet'
import { FieldLabel, ToggleRow } from '../ui/Field'
import Icon from '../ui/Icon'
import { useStore } from '../../store/useStore'
import { useUI } from '../../store/useUI'
import { planEndKey } from '../../lib/plan'
import { formatDay, startOfWeekKey, todayKey } from '../../lib/date'
import { PLAN_LENGTH } from '../../data/plan'

/** Start date, on/off, and the one destructive action the plan owns. */
export function PlanSetupSheet({ open, onClose }) {
  const settings = useStore((s) => s.settings)
  const setPlanStart = useStore((s) => s.setPlanStart)
  const patchSettings = useStore((s) => s.patchSettings)
  const resetPlan = useStore((s) => s.resetPlan)
  const toast = useUI((s) => s.toast)

  const [draft, setDraft] = useState(settings.planStartedAt ?? startOfWeekKey(todayKey()))
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (open) {
      setDraft(settings.planStartedAt ?? startOfWeekKey(todayKey()))
      setConfirmReset(false)
    }
  }, [open, settings.planStartedAt])

  const monday = startOfWeekKey(draft)
  const changed = monday !== settings.planStartedAt

  const save = async () => {
    if (changed) {
      await setPlanStart(draft)
      toast('Plan re-dated', { tone: 'success', detail: `Week 1 starts ${formatDay(monday)}` })
    }
    onClose?.()
  }

  const handleReset = async () => {
    await resetPlan()
    setConfirmReset(false)
    toast('Plan progress cleared', { tone: 'neutral' })
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="The 16-week plan"
      subtitle="Week 1 always begins on a Monday, so plan weeks line up with your report cards."
      footer={
        <div className="space-y-2">
          <SheetButton onClick={save}>{changed ? 'Save start date' : 'Done'}</SheetButton>
          {confirmReset ? (
            <SheetButton tone="danger" onClick={handleReset}>
              Yes, clear every tick and count
            </SheetButton>
          ) : (
            <SheetButton tone="ghost" onClick={() => setConfirmReset(true)}>
              Reset plan progress
            </SheetButton>
          )}
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        <div>
          <FieldLabel hint={`Week 1 · ${formatDay(monday)}`}>Start date</FieldLabel>
          <input
            type="date"
            value={draft}
            onChange={(e) => e.target.value && setDraft(e.target.value)}
            className="h-[50px] w-full rounded-2xl bg-white/[0.04] px-4 text-[15px] text-white outline-none hairline focus:border-white/25"
          />
          <p className="mt-2 text-[12px] leading-relaxed text-white/35">
            Any date works; it snaps back to that week&rsquo;s Monday. Week {PLAN_LENGTH} ends{' '}
            {formatDay(planEndKey(monday))}.
          </p>
        </div>

        <ToggleRow
          icon="map"
          label="Show the plan"
          sublabel="Hides the tab and the strip on Today"
          value={settings.planEnabled !== false}
          onChange={(v) => patchSettings({ planEnabled: v })}
        />

        <div className="flex gap-2.5 rounded-2xl border border-hair bg-white/[0.02] p-3.5">
          <span className="mt-[1px] shrink-0 text-white/25">
            <Icon name="info" size={15} />
          </span>
          <p className="text-[12px] leading-relaxed text-white/35">
            Codeforces problems, contests and design minutes are read from your pillar log, so those
            rows fill themselves in. Everything else is typed here. Moving the start date re-dates
            the weeks but keeps what you have already ticked.
          </p>
        </div>

        {confirmReset && (
          <p className="text-center text-[12.5px] leading-relaxed text-bad/80">
            This clears every tick, count and week note across all {PLAN_LENGTH} weeks. Your pillar
            history is untouched.
          </p>
        )}
      </div>
    </Sheet>
  )
}

export default PlanSetupSheet
