import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import Counter from '../ui/Counter'
import { Bar } from '../ui/Ring'
import { Burst } from '../ui/Burst'
import { haptic, spring, springBouncy } from '../../lib/motion'
import { WIDGETS } from '../../data/pillars'

/**
 * One pillar on the Today grid.
 *
 * Tapping the body opens the full log sheet; the corner button is a one-tap
 * increment so the common case ("+1 problem") never needs a sheet at all.
 */
export function PillarCard({ evaluation, onOpen, onQuickAdd, index = 0 }) {
  const { pillar, value, target, done, progress, xp, started } = evaluation
  const [burst, setBurst] = useState(null)
  const wasDone = useRef(done)

  useEffect(() => {
    if (done && !wasDone.current) {
      setBurst(Date.now())
      haptic([14, 40, 22])
    }
    wasDone.current = done
  }, [done])

  const isCheck = pillar.widget === WIDGETS.CHECK
  const quickStep = pillar.quickAdd?.[0] ?? 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, delay: index * 0.028 }}
      className="relative"
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.975 }}
        transition={spring}
        onClick={() => {
          haptic(10)
          onOpen(pillar.id)
        }}
        className="relative block w-full overflow-hidden rounded-card p-3.5 text-left transition-colors hairline"
        style={{
          background: done
            ? `linear-gradient(160deg, ${pillar.accent}1c, rgba(18,18,22,0.85))`
            : 'rgba(18,18,22,0.8)',
          borderColor: done ? `${pillar.accent}3d` : undefined,
        }}
      >
        {done && (
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl"
            style={{ background: pillar.glow }}
          />
        )}

        <div className="relative flex items-start justify-between">
          <span
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{
              background: done ? `${pillar.accent}26` : 'rgba(255,255,255,0.05)',
              color: done ? pillar.accent : 'rgba(255,255,255,0.5)',
            }}
          >
            <Icon name={pillar.icon} size={18} strokeWidth={1.9} />
          </span>

          {done ? (
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={springBouncy}
              className="grid h-6 w-6 place-items-center rounded-full"
              style={{ background: pillar.accent, color: '#0b0b0d' }}
            >
              <Icon name="check" size={13} strokeWidth={3} />
            </motion.span>
          ) : (
            <motion.span
              whileTap={{ scale: 0.82 }}
              transition={springBouncy}
              role="button"
              tabIndex={0}
              aria-label={`Quick log ${pillar.name}`}
              onClick={(e) => {
                e.stopPropagation()
                haptic(12)
                onQuickAdd(pillar.id, isCheck ? target : quickStep)
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                e.stopPropagation()
                onQuickAdd(pillar.id, isCheck ? target : quickStep)
              }}
              className="grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-white/[0.08] text-white/60"
            >
              <Icon name={isCheck ? 'check' : 'plus'} size={13} strokeWidth={2.6} />
            </motion.span>
          )}
        </div>

        <p className="relative mt-3 text-[13.5px] font-semibold tracking-tight text-white">
          {pillar.name}
        </p>

        <div className="relative mt-0.5 flex items-baseline gap-1">
          {isCheck ? (
            <span
              className="text-[19px] font-bold leading-tight tracking-tight"
              style={{ color: done ? pillar.accent : 'rgba(255,255,255,0.3)' }}
            >
              {done ? 'Done' : 'Not yet'}
            </span>
          ) : (
            <>
              <Counter
                value={value}
                className="text-[19px] font-bold leading-tight tracking-tight"
                style={{ color: done ? pillar.accent : 'rgba(255,255,255,0.85)' }}
              />
              <span className="text-[12px] font-medium text-white/30">
                / {target} {pillar.unit}
              </span>
            </>
          )}
        </div>

        <div className="relative mt-3">
          <Bar
            progress={progress}
            accent={done ? pillar.accent : 'rgba(255,255,255,0.28)'}
            height={4}
            delay={index * 0.028}
          />
        </div>

        <div className="relative mt-2 flex h-4 items-center justify-between">
          <span className="text-[11px] text-white/28">{pillar.tagline}</span>
          {started && (
            <motion.span
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[11px] font-semibold"
              style={{ color: done ? pillar.accent : 'rgba(255,255,255,0.35)' }}
            >
              +{xp}
            </motion.span>
          )}
        </div>
      </motion.button>

      <Burst trigger={burst} accent={pillar.accent} />
    </motion.div>
  )
}

export default PillarCard
