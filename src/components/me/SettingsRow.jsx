import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import { spring, haptic } from '../../lib/motion'

/** Grouped settings list, iOS-style, with hairline dividers between rows. */
export function SettingsGroup({ children }) {
  return (
    <div className="overflow-hidden rounded-card border border-hair bg-ink-800/65 backdrop-blur-xl">
      <div className="divide-y divide-white/[0.05]">{children}</div>
    </div>
  )
}

export function SettingsRow({
  icon,
  accent = '#8b8b98',
  label,
  value,
  detail,
  onClick,
  danger,
  chevron = true,
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      transition={{ duration: 0.1 }}
      onClick={() => {
        haptic(10)
        onClick?.()
      }}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{
          background: danger ? 'rgba(249,112,102,0.14)' : `${accent}1c`,
          color: danger ? '#f97066' : accent,
        }}
      >
        <Icon name={icon} size={15} strokeWidth={2} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-[14.5px] font-medium ${danger ? 'text-bad' : 'text-white'}`}
        >
          {label}
        </span>
        {detail && <span className="block text-[11.5px] text-white/35">{detail}</span>}
      </span>

      {value && <span className="tnum shrink-0 text-[13px] text-white/40">{value}</span>}
      {chevron && (
        <motion.span className="shrink-0 text-white/15">
          <Icon name="chevronRight" size={15} />
        </motion.span>
      )}
    </motion.button>
  )
}

export default SettingsRow
