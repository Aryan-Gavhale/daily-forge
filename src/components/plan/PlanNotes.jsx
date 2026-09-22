import Icon from '../ui/Icon'
import { PLAN_META, PLAN_OUT_OF_SCOPE, PLAN_RULES } from '../../data/plan'

/**
 * The rules and the scope cuts.
 *
 * They are static text on purpose. A rule you can tick off is a task, and
 * these are the things that have to hold for sixteen weeks straight.
 */
export function PlanRules() {
  return (
    <div className="rounded-card border border-hair bg-ink-800/60 p-4 backdrop-blur-xl">
      <ul className="space-y-2.5">
        {PLAN_RULES.map((rule) => (
          <li key={rule} className="flex gap-2.5">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-flame" />
            <span className="text-[12.5px] leading-relaxed text-white/55">{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function OutOfScope() {
  return (
    <div className="rounded-card border border-dashed border-white/[0.09] bg-white/[0.015] p-4">
      <ul className="space-y-2">
        {PLAN_OUT_OF_SCOPE.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className="mt-[2px] shrink-0 text-white/20">
              <Icon name="x" size={13} strokeWidth={2.4} />
            </span>
            <span className="text-[12.5px] leading-snug text-white/35 line-through decoration-white/15">
              {item}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-hair pt-3 text-[11.5px] leading-relaxed text-white/30">
        {PLAN_META.blurb}
      </p>
    </div>
  )
}

export default PlanRules
