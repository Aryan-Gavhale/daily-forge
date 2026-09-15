import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sheet, { SheetButton } from '../ui/Sheet'
import Icon from '../ui/Icon'
import {
  FieldLabel,
  MoodPicker,
  NumberField,
  QuickChips,
  SelectChips,
  Stepper,
  TextField,
  ToggleRow,
} from '../ui/Field'
import { spring, springBouncy, haptic } from '../../lib/motion'
import { WIDGETS } from '../../data/pillars'
import { evaluatePillar } from '../../lib/scoring'
import { useStore } from '../../store/useStore'
import { useUI } from '../../store/useUI'
import { formatRelativeDay } from '../../lib/date'

/**
 * Full logging sheet for one pillar.
 *
 * Edits are held locally and committed on save, so backing out of a sheet
 * leaves the day exactly as it was.
 */
export function LogSheet({ pillar, date, open, onClose }) {
  const settings = useStore((s) => s.settings)
  const entry = useStore((s) => (pillar ? s.days[date]?.entries?.[pillar.id] : undefined))
  const logPillar = useStore((s) => s.logPillar)
  const clearPillar = useStore((s) => s.clearPillar)
  const celebrate = useStore((s) => s.celebrate)
  const toast = useUI((s) => s.toast)

  const [value, setValue] = useState(0)
  const [extras, setExtras] = useState({})

  useEffect(() => {
    if (!open || !pillar) return
    setValue(Number(entry?.value) || 0)
    setExtras(entry?.extras ?? {})
    // Snapshot on open only - live store updates must not stomp on typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pillar?.id, date])

  const preview = useMemo(() => {
    if (!pillar) return null
    return evaluatePillar(pillar.id, { value, extras }, settings)
  }, [pillar, value, extras, settings])

  if (!pillar || !preview) return null

  const config = preview.config
  const isCheck = pillar.widget === WIDGETS.CHECK
  const isMinutes = pillar.widget === WIDGETS.MINUTES
  const step = isMinutes ? 5 : 1
  const wasDone = Number(entry?.value) >= preview.target

  const setExtra = (id, v) => setExtras((prev) => ({ ...prev, [id]: v }))

  const handleSave = async () => {
    await logPillar(date, pillar.id, { value, extras })

    if (preview.done && !wasDone) {
      haptic([14, 40, 22])
      celebrate({ kind: 'pillar', pillarId: pillar.id })
      toast(`${pillar.name} done`, { tone: 'success', detail: `+${preview.xp} XP` })
    } else if (preview.xp > 0) {
      toast(`${pillar.name} updated`, { tone: 'xp', detail: `+${preview.xp} XP today` })
    }
    onClose()
  }

  const handleClear = async () => {
    await clearPillar(date, pillar.id)
    toast(`${pillar.name} cleared`, { tone: 'neutral' })
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      accent={pillar.accent}
      title={pillar.name}
      subtitle={`${formatRelativeDay(date)} · target ${config.target} ${pillar.unit}`}
      footer={
        <div className="space-y-2">
          <SheetButton onClick={handleSave} accent={pillar.accent}>
            {preview.done ? `Save · +${preview.xp} XP` : `Save${preview.xp ? ` · +${preview.xp} XP` : ''}`}
          </SheetButton>
          {entry && (
            <SheetButton tone="ghost" onClick={handleClear}>
              Clear today&rsquo;s entry
            </SheetButton>
          )}
        </div>
      }
    >
      <div className="space-y-5 pb-2">
        <p className="text-center text-[13px] leading-snug text-white/40">{pillar.prompt}</p>

        {/* Primary metric */}
        {isCheck ? (
          <CheckHero
            pillar={pillar}
            done={value >= preview.target}
            onToggle={() => setValue(value >= preview.target ? 0 : preview.target)}
          />
        ) : (
          <div>
            <Stepper
              value={value}
              onChange={setValue}
              step={step}
              max={isMinutes ? 600 : 500}
              suffix={pillar.unit}
              accent={pillar.accent}
            />
            {pillar.quickAdd && (
              <QuickChips
                options={pillar.quickAdd}
                accent={pillar.accent}
                onPick={(n) => setValue((v) => v + n)}
              />
            )}
          </div>
        )}

        <ProgressStrip preview={preview} pillar={pillar} />

        {/* Extras */}
        {pillar.extras?.length > 0 && (
          <div className="space-y-4 border-t border-hair pt-4">
            <p className="label-eyebrow">Details</p>
            {pillar.extras.map((field) => (
              <ExtraField
                key={field.id}
                field={field}
                pillar={pillar}
                value={extras[field.id]}
                onChange={(v) => setExtra(field.id, v)}
                currency={settings.currency}
              />
            ))}
          </div>
        )}

        {/* Bonus ledger */}
        {pillar.bonuses?.length > 0 && (
          <div className="rounded-2xl bg-white/[0.03] p-3.5 hairline">
            <p className="label-eyebrow mb-2.5">Bonus XP</p>
            <div className="space-y-2">
              {pillar.bonuses.map((b) => {
                const hit = preview.bonusesHit.some((x) => x.id === b.id)
                return (
                  <div key={b.id} className="flex items-center gap-2.5">
                    <motion.span
                      animate={{ scale: hit ? 1 : 0.9, opacity: hit ? 1 : 0.35 }}
                      transition={spring}
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                      style={{
                        background: hit ? pillar.accent : 'rgba(255,255,255,0.08)',
                        color: hit ? '#0b0b0d' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      <Icon name={hit ? 'check' : 'plus'} size={11} strokeWidth={3} />
                    </motion.span>
                    <span
                      className={`flex-1 text-[13px] ${hit ? 'text-white/80' : 'text-white/35'}`}
                    >
                      {b.label}
                    </span>
                    <span
                      className="text-[13px] font-semibold tnum"
                      style={{ color: hit ? pillar.accent : 'rgba(255,255,255,0.28)' }}
                    >
                      +{b.xp}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Sheet>
  )
}

function CheckHero({ pillar, done, onToggle }) {
  return (
    <motion.button
      type="button"
      onClick={() => {
        haptic(done ? 10 : [14, 40, 22])
        onToggle()
      }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
      className="relative flex h-[132px] w-full flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl hairline"
      style={{
        background: done
          ? `linear-gradient(160deg, ${pillar.accent}2e, rgba(18,18,22,0.9))`
          : 'rgba(255,255,255,0.035)',
        borderColor: done ? `${pillar.accent}55` : undefined,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={done ? 'on' : 'off'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={springBouncy}
          className="grid h-14 w-14 place-items-center rounded-full"
          style={{
            background: done ? pillar.accent : 'rgba(255,255,255,0.07)',
            color: done ? '#0b0b0d' : 'rgba(255,255,255,0.45)',
          }}
        >
          <Icon name={done ? 'check' : pillar.icon} size={26} strokeWidth={done ? 3 : 1.8} />
        </motion.span>
      </AnimatePresence>
      <span
        className="text-[15px] font-semibold tracking-tight"
        style={{ color: done ? pillar.accent : 'rgba(255,255,255,0.5)' }}
      >
        {done ? 'Done today' : 'Tap to mark done'}
      </span>
    </motion.button>
  )
}

function ProgressStrip({ preview, pillar }) {
  const pct = Math.round(preview.progress * 100)
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3 hairline">
      <div className="flex-1">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[12px] text-white/40">
            {preview.value} of {preview.target} {pillar.unit}
          </span>
          <span className="tnum text-[12px] font-semibold" style={{ color: pillar.accent }}>
            {pct}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: pillar.accent }}
            animate={{ width: `${Math.min(100, pct)}%` }}
            transition={{ type: 'spring', stiffness: 130, damping: 22 }}
          />
        </div>
      </div>
      <div className="w-px self-stretch bg-white/[0.08]" />
      <div className="text-right">
        <p className="tnum text-[17px] font-bold leading-none" style={{ color: pillar.accent }}>
          {preview.xp}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-white/30">XP</p>
      </div>
    </div>
  )
}

function ExtraField({ field, pillar, value, onChange, currency }) {
  switch (field.kind) {
    case 'toggle':
      return (
        <ToggleRow
          label={field.label}
          value={Boolean(value)}
          onChange={onChange}
          accent={pillar.accent}
        />
      )
    case 'select':
      return (
        <div>
          <FieldLabel>{field.label}</FieldLabel>
          <SelectChips
            options={field.options}
            value={value ?? ''}
            onChange={onChange}
            accent={pillar.accent}
          />
        </div>
      )
    case 'mood':
      return (
        <div>
          <FieldLabel>{field.label}</FieldLabel>
          <MoodPicker value={value} onChange={onChange} />
        </div>
      )
    case 'longtext':
      return (
        <div>
          <FieldLabel hint={`${(value ?? '').length}/800`}>{field.label}</FieldLabel>
          <TextField
            value={value}
            onChange={onChange}
            placeholder={field.placeholder}
            multiline
            rows={5}
            maxLength={800}
          />
        </div>
      )
    case 'number':
      return (
        <div>
          <FieldLabel>{field.label}</FieldLabel>
          <NumberField
            value={value}
            onChange={onChange}
            placeholder={field.placeholder}
            suffix={field.suffix}
            max={field.max}
          />
        </div>
      )
    case 'currency':
      return (
        <div>
          <FieldLabel>{field.label}</FieldLabel>
          <NumberField
            value={value}
            onChange={onChange}
            placeholder={field.placeholder}
            prefix={currency}
          />
        </div>
      )
    default:
      return (
        <div>
          <FieldLabel>{field.label}</FieldLabel>
          <TextField value={value} onChange={onChange} placeholder={field.placeholder} />
        </div>
      )
  }
}

export default LogSheet
