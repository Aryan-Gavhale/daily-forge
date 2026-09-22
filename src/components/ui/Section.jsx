import { motion } from 'framer-motion'
import { spring } from '../../lib/motion'

/** Consistent block rhythm: eyebrow, title, optional action, then content. */
export function Section({ title, action, children, delay = 0, className = '', subtitle }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
      className={`pad-x pt-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[12px] text-white/35">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  )
}

export function Panel({ children, className = '', padded = true }) {
  return (
    <div
      className={`overflow-hidden rounded-card border border-hair bg-ink-800/65 backdrop-blur-xl ${
        padded ? 'p-4' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function EmptyState({ icon = 'info', title, body }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-white/[0.09] px-6 py-9 text-center">
      <span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.05] text-white/30">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <p className="text-[14px] font-medium text-white/70">{title}</p>
      {body && <p className="mt-1 max-w-[260px] text-[12.5px] leading-relaxed text-white/35">{body}</p>}
    </div>
  )
}

export default Section
