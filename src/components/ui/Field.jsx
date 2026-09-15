import { motion } from 'framer-motion'
import Icon from './Icon'
import Counter from './Counter'
import { haptic, spring, springBouncy } from '../../lib/motion'
import { MOODS } from '../../data/pillars'

/** Form controls sized for thumbs: nothing below a 44px tap target. */

export function FieldLabel({ children, hint }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-[13px] font-medium text-white/55">{children}</span>
      {hint && <span className="text-[12px] text-white/30">{hint}</span>}
    </div>
  )
}

/** Big −/+ stepper. The number itself animates so changes register visually. */
export function Stepper({ value, onChange, step = 1, min = 0, max = 9999, suffix, accent = '#ff7a1a' }) {
  const set = (next) => {
    const clamped = Math.min(max, Math.max(min, next))
    if (clamped !== value) {
      haptic(12)
      onChange(clamped)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.04] p-2 hairline">
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        transition={springBouncy}
        onClick={() => set(value - step)}
        disabled={value <= min}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white/70 disabled:opacity-25"
        aria-label="Decrease"
      >
        <Icon name="minus" size={20} strokeWidth={2.4} />
      </motion.button>

      <div className="flex min-w-0 flex-1 items-baseline justify-center gap-1.5">
        <Counter
          value={value}
          className="text-[38px] font-bold leading-none tracking-tightest"
          style={{ color: accent }}
        />
        {suffix && <span className="text-[14px] font-medium text-white/35">{suffix}</span>}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        transition={springBouncy}
        onClick={() => set(value + step)}
        disabled={value >= max}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-black disabled:opacity-25"
        style={{ background: accent }}
        aria-label="Increase"
      >
        <Icon name="plus" size={20} strokeWidth={2.6} />
      </motion.button>
    </div>
  )
}

/** Row of "+N" shortcuts under the stepper. */
export function QuickChips({ options, onPick, accent = '#ff7a1a', prefix = '+' }) {
  return (
    <div className="mt-2.5 flex gap-2">
      {options.map((n, i) => (
        <motion.button
          key={`${n}-${i}`}
          type="button"
          whileTap={{ scale: 0.93 }}
          transition={spring}
          onClick={() => {
            haptic(12)
            onPick(n)
          }}
          className="h-10 flex-1 rounded-xl bg-white/[0.05] text-[14px] font-semibold text-white/70 hairline"
          style={{ color: accent }}
        >
          {prefix}
          {n}
        </motion.button>
      ))}
    </div>
  )
}

export function TextField({ value, onChange, placeholder, multiline, rows = 4, maxLength }) {
  const shared =
    'w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/25 outline-none hairline focus:border-white/25 transition-colors'

  if (multiline) {
    return (
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`${shared} resize-none leading-relaxed`}
      />
    )
  }

  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`${shared} h-[50px]`}
    />
  )
}

export function NumberField({ value, onChange, placeholder, suffix, prefix, max }) {
  return (
    <div className="flex h-[50px] items-center gap-2 rounded-2xl bg-white/[0.04] px-4 hairline focus-within:border-white/25">
      {prefix && <span className="text-[15px] text-white/40">{prefix}</span>}
      <input
        type="number"
        inputMode="decimal"
        value={value === undefined || value === null || value === '' ? '' : value}
        onChange={(e) => {
          const raw = e.target.value
          if (raw === '') return onChange('')
          const n = Number(raw)
          if (Number.isNaN(n)) return
          onChange(max !== undefined ? Math.min(max, n) : n)
        }}
        placeholder={placeholder}
        className="tnum min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {suffix && <span className="text-[13px] text-white/35">{suffix}</span>}
    </div>
  )
}

/** iOS-style switch row. */
export function ToggleRow({ label, sublabel, value, onChange, accent = '#32d583', icon }) {
  return (
    <button
      type="button"
      onClick={() => {
        haptic(value ? 8 : 14)
        onChange(!value)
      }}
      className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 text-left hairline"
    >
      {icon && (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-white/60">
          <Icon name={icon} size={16} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium text-white">{label}</span>
        {sublabel && <span className="block text-[12px] text-white/40">{sublabel}</span>}
      </span>
      <motion.span
        className="relative h-[30px] w-[51px] shrink-0 rounded-full"
        animate={{ backgroundColor: value ? accent : 'rgba(255,255,255,0.14)' }}
        transition={{ duration: 0.2 }}
      >
        <motion.span
          className="absolute top-[2px] h-[26px] w-[26px] rounded-full bg-white shadow-md"
          animate={{ left: value ? 23 : 2 }}
          transition={spring}
        />
      </motion.span>
    </button>
  )
}

/** Wrapping chip group. Tapping the active chip clears it. */
export function SelectChips({ options, value, onChange, accent = '#ff7a1a' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        const active = value === val
        return (
          <motion.button
            key={val}
            type="button"
            whileTap={{ scale: 0.94 }}
            transition={spring}
            onClick={() => {
              haptic(10)
              onChange(active ? '' : val)
            }}
            className="h-10 rounded-xl px-3.5 text-[13.5px] font-medium transition-colors hairline"
            style={{
              background: active ? `${accent}22` : 'rgba(255,255,255,0.035)',
              color: active ? accent : 'rgba(255,255,255,0.6)',
              borderColor: active ? `${accent}55` : undefined,
            }}
          >
            {label}
          </motion.button>
        )
      })}
    </div>
  )
}

export function MoodPicker({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {MOODS.map((m) => {
        const active = Number(value) === m.value
        return (
          <motion.button
            key={m.value}
            type="button"
            whileTap={{ scale: 0.9 }}
            animate={{ scale: active ? 1.04 : 1 }}
            transition={spring}
            onClick={() => {
              haptic(12)
              onChange(active ? null : m.value)
            }}
            className="flex h-[70px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl transition-colors hairline"
            style={{
              background: active ? `${m.accent}1f` : 'rgba(255,255,255,0.035)',
              borderColor: active ? `${m.accent}66` : undefined,
            }}
          >
            <span className="text-[22px] leading-none">{m.emoji}</span>
            <span
              className="text-[11px] font-medium"
              style={{ color: active ? m.accent : 'rgba(255,255,255,0.4)' }}
            >
              {m.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

/** Sliding segmented control. */
export function Segmented({ options, value, onChange }) {
  return (
    <div className="relative flex rounded-xl bg-white/[0.05] p-1 hairline">
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        const active = value === val
        return (
          <button
            key={val}
            type="button"
            onClick={() => {
              haptic(10)
              onChange(val)
            }}
            className="relative flex-1 rounded-lg px-2 py-2 text-[13px] font-medium"
          >
            {active && (
              <motion.span
                layoutId="segmented-pill"
                className="absolute inset-0 rounded-lg bg-white/[0.11]"
                transition={spring}
              />
            )}
            <span className={`relative z-10 ${active ? 'text-white' : 'text-white/45'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
