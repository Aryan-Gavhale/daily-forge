import { AnimatePresence, motion } from 'framer-motion'
import { spring } from '../../lib/motion'
import { useUI } from '../../store/useUI'
import Icon from './Icon'

const TONES = {
  neutral: { accent: '#e8eaed', icon: 'info' },
  success: { accent: '#32d583', icon: 'check' },
  warn: { accent: '#fdb022', icon: 'info' },
  danger: { accent: '#f97066', icon: 'x' },
  xp: { accent: '#ff7a1a', icon: 'bolt' },
}

/**
 * Toasts drop from the top so they never collide with the tab bar or a sheet's
 * primary action, which both live at the bottom.
 */
export function ToastHost() {
  const toasts = useUI((s) => s.toasts)
  const dismiss = useUI((s) => s.dismissToast)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-safe">
      <div className="mt-3 flex w-full max-w-shell flex-col items-center gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const tone = TONES[t.tone] ?? TONES.neutral
            return (
              <motion.button
                key={t.id}
                layout
                onClick={() => dismiss(t.id)}
                initial={{ opacity: 0, y: -22, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                transition={spring}
                className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-hairStrong glass px-4 py-3 text-left shadow-[0_18px_40px_-16px_rgba(0,0,0,0.8)]"
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                  style={{ background: `${tone.accent}1f`, color: tone.accent }}
                >
                  <Icon name={t.icon ?? tone.icon} size={16} strokeWidth={2.2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-white">
                    {t.message}
                  </span>
                  {t.detail && (
                    <span className="block truncate text-[12px] text-white/45">{t.detail}</span>
                  )}
                </span>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ToastHost
