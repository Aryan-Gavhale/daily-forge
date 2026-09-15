import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sheet, { SheetButton } from '../ui/Sheet'
import Icon from '../ui/Icon'
import { FieldLabel, NumberField, Stepper, TextField, ToggleRow } from '../ui/Field'
import { spring, haptic } from '../../lib/motion'
import { PILLARS } from '../../data/pillars'
import { useStore } from '../../store/useStore'
import { useUI } from '../../store/useUI'

/**
 * Per-pillar targets and XP weights. Editing the target retroactively changes
 * which past days count as cleared, which is stated in the sheet rather than
 * left as a surprise.
 */
export function PillarSettingsSheet({ open, onClose }) {
  const settings = useStore((s) => s.settings)
  const patchSettings = useStore((s) => s.patchSettings)
  const resetPillarConfig = useStore((s) => s.resetPillarConfig)
  const toast = useUI((s) => s.toast)
  const [draft, setDraft] = useState(settings.pillars)

  useEffect(() => {
    if (open) setDraft(settings.pillars)
  }, [open, settings.pillars])

  const update = (id, patch) =>
    setDraft((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  const enabledCount = PILLARS.filter((p) => draft[p.id]?.enabled !== false).length

  const save = async () => {
    await patchSettings({
      pillars: draft,
      dailyMinimum: Math.min(settings.dailyMinimum, Math.max(1, enabledCount)),
    })
    toast('Pillar settings saved', { tone: 'success' })
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Pillars"
      subtitle="Targets and XP weights. Changing a target re-scores past days."
      footer={
        <div className="space-y-2">
          <SheetButton onClick={save}>Save</SheetButton>
          <SheetButton
            tone="ghost"
            onClick={async () => {
              await resetPillarConfig()
              toast('Reset to defaults', { tone: 'neutral' })
              onClose()
            }}
          >
            Reset to defaults
          </SheetButton>
        </div>
      }
    >
      <div className="space-y-3 pb-2">
        {PILLARS.map((p) => {
          const cfg = draft[p.id] ?? {}
          const on = cfg.enabled !== false
          return (
            <motion.div
              key={p.id}
              layout
              transition={spring}
              className="rounded-2xl bg-white/[0.035] p-3.5 hairline"
              style={{ opacity: on ? 1 : 0.5 }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${p.accent}1c`, color: p.accent }}
                >
                  <Icon name={p.icon} size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-white">{p.name}</p>
                  <p className="text-[11.5px] text-white/35">{p.tagline}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    haptic(10)
                    update(p.id, { enabled: !on })
                  }}
                  aria-label={`${on ? 'Disable' : 'Enable'} ${p.name}`}
                  className="relative h-[28px] w-[48px] shrink-0 rounded-full transition-colors"
                  style={{ background: on ? p.accent : 'rgba(255,255,255,0.13)' }}
                >
                  <motion.span
                    className="absolute top-[2px] h-[24px] w-[24px] rounded-full bg-white"
                    animate={{ left: on ? 22 : 2 }}
                    transition={spring}
                  />
                </button>
              </div>

              {on && (
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <div>
                    <FieldLabel>Daily target</FieldLabel>
                    <NumberField
                      value={cfg.target}
                      onChange={(v) => update(p.id, { target: Math.max(1, Number(v) || 1) })}
                      suffix={p.unit}
                    />
                  </div>
                  <div>
                    <FieldLabel>XP at target</FieldLabel>
                    <NumberField
                      value={cfg.xp}
                      onChange={(v) => update(p.id, { xp: Math.max(0, Number(v) || 0) })}
                      suffix="XP"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </Sheet>
  )
}

/** Daily minimum, budget, savings goal, currency, display name. */
export function GoalsSheet({ open, onClose }) {
  const settings = useStore((s) => s.settings)
  const patchSettings = useStore((s) => s.patchSettings)
  const toast = useUI((s) => s.toast)

  const enabledCount = PILLARS.filter((p) => settings.pillars[p.id]?.enabled !== false).length
  const [draft, setDraft] = useState(settings)

  useEffect(() => {
    if (open) setDraft(settings)
  }, [open, settings])

  const set = (patch) => setDraft((prev) => ({ ...prev, ...patch }))

  const save = async () => {
    await patchSettings({
      name: (draft.name ?? '').trim(),
      currency: (draft.currency || '₹').slice(0, 3),
      dailyMinimum: Math.min(enabledCount, Math.max(1, Number(draft.dailyMinimum) || 1)),
      monthlyBudget: Math.max(0, Number(draft.monthlyBudget) || 0),
      savingsGoal: Math.max(0, Number(draft.savingsGoal) || 0),
      hapticsEnabled: draft.hapticsEnabled !== false,
    })
    toast('Goals updated', { tone: 'success' })
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Goals"
      subtitle="The bar you have to clear, and what money you are aiming at."
      footer={<SheetButton onClick={save}>Save</SheetButton>}
    >
      <div className="space-y-5 pb-2">
        <div>
          <FieldLabel hint={`out of ${enabledCount} pillars`}>Daily minimum</FieldLabel>
          <Stepper
            value={Number(draft.dailyMinimum) || 1}
            onChange={(v) => set({ dailyMinimum: v })}
            min={1}
            max={enabledCount}
            suffix="pillars"
          />
          <p className="mt-2 text-[11.5px] leading-snug text-white/30">
            Clear fewer than this and the day is marked Failed and your streak ends.
          </p>
        </div>

        <div className="border-t border-hair pt-4">
          <FieldLabel>Monthly budget</FieldLabel>
          <NumberField
            value={draft.monthlyBudget}
            onChange={(v) => set({ monthlyBudget: v })}
            prefix={draft.currency}
            placeholder="20000"
          />
        </div>

        <div>
          <FieldLabel>Monthly savings goal</FieldLabel>
          <NumberField
            value={draft.savingsGoal}
            onChange={(v) => set({ savingsGoal: v })}
            prefix={draft.currency}
            placeholder="10000"
          />
        </div>

        <div className="grid grid-cols-[1fr,84px] gap-2.5">
          <div>
            <FieldLabel>Your name</FieldLabel>
            <TextField
              value={draft.name}
              onChange={(v) => set({ name: v })}
              placeholder="Optional"
              maxLength={24}
            />
          </div>
          <div>
            <FieldLabel>Symbol</FieldLabel>
            <TextField
              value={draft.currency}
              onChange={(v) => set({ currency: v })}
              placeholder="₹"
              maxLength={3}
            />
          </div>
        </div>

        <div className="border-t border-hair pt-4">
          <ToggleRow
            label="Haptic feedback"
            sublabel="Vibration on taps and completions"
            value={draft.hapticsEnabled !== false}
            onChange={(v) => set({ hapticsEnabled: v })}
            icon="bolt"
          />
        </div>
      </div>
    </Sheet>
  )
}
