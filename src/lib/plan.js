import {
  PLAN_LENGTH,
  PLAN_TRACKS,
  PLAN_WEEKS,
  gateForWeek,
  phaseForWeek,
} from '../data/plan'
import { addDays, diffDays, rangeKeys, startOfWeekKey, todayKey } from './date'

/**
 * Pure plan scoring. Like `scoring.js`, nothing here touches React or storage,
 * so the schedule can be reasoned about on its own.
 *
 * Two sources feed a week: the plan's own records (checks and typed counts)
 * and the ordinary pillar log, which supplies the `auto` tasks. Reading the
 * pillar log is what stops the plan becoming a second place to log the same
 * Codeforces session.
 */

export const weekId = (n) => `w${n}`

export function emptyWeekRecord(n) {
  return {
    id: weekId(n),
    checks: {},
    counts: {},
    note: '',
    updatedAt: new Date().toISOString(),
  }
}

/** Week 1 always starts on a Monday, so plan weeks line up with report cards. */
export function planStartKey(settings) {
  return settings?.planStartedAt || startOfWeekKey(todayKey())
}

export function weekRange(startKey, n) {
  const from = addDays(startKey, (n - 1) * 7)
  return { from, to: addDays(from, 6) }
}

export function planEndKey(startKey) {
  return weekRange(startKey, PLAN_LENGTH).to
}

/**
 * Which week the calendar says you are in. Zero before the start date and
 * above PLAN_LENGTH once the sixteen weeks have run out, so callers can tell
 * "not started" and "overrun" apart from a clamped number.
 */
export function rawWeekNumber(startKey, now = todayKey()) {
  const delta = diffDays(now, startKey)
  if (delta < 0) return 0
  return Math.floor(delta / 7) + 1
}

export function currentWeekNumber(startKey, now = todayKey()) {
  return Math.min(PLAN_LENGTH, Math.max(1, rawWeekNumber(startKey, now)))
}

/** Pillar-derived totals over an inclusive date range. */
export function metricTotals(dayMap, fromKey, toKey) {
  const totals = { cfProblems: 0, contests: 0, designMinutes: 0 }
  if (!fromKey || !toKey || toKey < fromKey) return totals

  for (const key of rangeKeys(fromKey, toKey)) {
    const entries = dayMap?.[key]?.entries
    if (!entries) continue
    totals.cfProblems += Number(entries.codeforces?.value) || 0
    totals.designMinutes += Number(entries.system?.value) || 0
    if (entries.codeforces?.extras?.contest) totals.contests += 1
  }
  return totals
}

function ratio(value, target) {
  if (!target) return value > 0 ? 1 : 0
  return Math.min(1, Math.max(0, value / target))
}

export function evaluateTask(task, record, metrics) {
  if (task.kind === 'check') {
    const done = Boolean(record?.checks?.[task.id])
    return { task, value: done ? 1 : 0, target: 1, done, progress: done ? 1 : 0, auto: false }
  }

  if (task.kind === 'auto') {
    const value = Number(metrics?.[task.metric]) || 0
    return {
      task,
      value,
      target: task.target,
      done: value >= task.target,
      progress: ratio(value, task.target),
      auto: true,
    }
  }

  const value = Number(record?.counts?.[task.id]) || 0
  return {
    task,
    value,
    target: task.target,
    done: value >= task.target,
    progress: ratio(value, task.target),
    auto: false,
  }
}

export function evaluateGate(n, record) {
  const gate = gateForWeek(n)
  if (!gate) return null
  const checks = gate.checks.map((c) => ({
    ...c,
    key: `gate:${c.id}`,
    done: Boolean(record?.checks?.[`gate:${c.id}`]),
  }))
  const done = checks.filter((c) => c.done).length
  return {
    ...gate,
    checks,
    done,
    total: checks.length,
    progress: checks.length ? done / checks.length : 0,
    passed: done === checks.length,
  }
}

export function evaluateWeek(n, { plan, days, startKey, now = todayKey() }) {
  const week = PLAN_WEEKS[n - 1]
  const { from, to } = weekRange(startKey, n)
  const record = plan?.[weekId(n)]
  const metrics = metricTotals(days, from, to)
  const tasks = week.tasks.map((t) => evaluateTask(t, record, metrics))

  const done = tasks.filter((t) => t.done).length
  const progress = tasks.length ? tasks.reduce((s, t) => s + t.progress, 0) / tasks.length : 0

  let state = 'current'
  if (from > now) state = 'future'
  else if (to < now) state = 'past'

  const gate = evaluateGate(n, record)

  return {
    n,
    week,
    phase: phaseForWeek(n),
    from,
    to,
    state,
    metrics,
    tasks,
    done,
    total: tasks.length,
    progress,
    complete: tasks.length > 0 && done === tasks.length,
    /** A finished week that was never completed is the one worth flagging. */
    missed: state === 'past' && done < tasks.length,
    note: record?.note ?? '',
    /** Carries the owning week so a gate can be rendered away from its week. */
    gate: gate ? { ...gate, weekN: n, weekState: state } : null,
  }
}

/** Planned total for a repeated task id, summed across the whole sixteen weeks. */
export function plannedTotal(taskId) {
  return PLAN_WEEKS.reduce((sum, w) => {
    const t = w.tasks.find((x) => x.id === taskId)
    if (!t) return sum
    return sum + (t.kind === 'check' ? 1 : t.target)
  }, 0)
}

function loggedTotal(weeks, taskId) {
  return weeks.reduce((sum, w) => {
    const t = w.tasks.find((x) => x.task.id === taskId)
    return t ? sum + t.value : sum
  }, 0)
}

/** The headline counters: what the four months are actually supposed to produce. */
export function planTotals(weeks, spanMetrics) {
  return [
    {
      id: 'nc',
      label: 'NeetCode owned',
      value: loggedTotal(weeks, 'nc'),
      target: plannedTotal('nc'),
      track: 'dsa',
    },
    {
      id: 'contest',
      label: 'Contests played',
      value: spanMetrics.contests,
      target: plannedTotal('contest'),
      track: 'dsa',
      auto: true,
    },
    {
      id: 'cf',
      label: 'CF problems',
      value: spanMetrics.cfProblems,
      target: plannedTotal('cf'),
      track: 'dsa',
      auto: true,
    },
    {
      id: 'timed',
      label: 'Timed mediums',
      value: loggedTotal(weeks, 'timed'),
      target: plannedTotal('timed'),
      track: 'dsa',
    },
    {
      id: 'lld',
      label: 'LLDs coded',
      value: loggedTotal(weeks, 'lld'),
      target: plannedTotal('lld'),
      track: 'lld',
    },
    {
      id: 'design',
      label: 'Design minutes',
      value: spanMetrics.designMinutes,
      target: plannedTotal('design'),
      track: 'lld',
      auto: true,
    },
    {
      id: 'apply',
      label: 'Applications',
      value: loggedTotal(weeks, 'apply'),
      target: plannedTotal('apply'),
      track: 'career',
    },
    {
      id: 'mock',
      label: 'Mocks done',
      value: loggedTotal(weeks, 'mock'),
      target: plannedTotal('mock'),
      track: 'career',
    },
    {
      id: 'star',
      label: 'STAR stories',
      value: loggedTotal(weeks, 'star'),
      target: plannedTotal('star'),
      track: 'career',
    },
  ]
}

function trackRollup(weeks) {
  return PLAN_TRACKS.map((track) => {
    const tasks = weeks.flatMap((w) => w.tasks.filter((t) => t.task.track === track.id))
    const done = tasks.filter((t) => t.done).length
    const progress = tasks.length ? tasks.reduce((s, t) => s + t.progress, 0) / tasks.length : 0
    return { ...track, done, total: tasks.length, progress }
  })
}

/**
 * Everything the Plan screen needs, in one pass. Sixteen weeks of a handful of
 * tasks each is small enough that recomputing beats caching.
 */
export function evaluatePlan({ plan, days, settings, now = todayKey() }) {
  const startKey = planStartKey(settings)
  const endKey = planEndKey(startKey)
  const weeks = PLAN_WEEKS.map((_, i) => evaluateWeek(i + 1, { plan, days, startKey, now }))

  const raw = rawWeekNumber(startKey, now)
  const currentWeek = currentWeekNumber(startKey, now)
  const current = weeks[currentWeek - 1]

  const spanTo = now < endKey ? now : endKey
  const spanMetrics = metricTotals(days, startKey, spanTo)

  const elapsedWeeks = Math.min(PLAN_LENGTH, Math.max(0, raw - 1))
  const banked = weeks.filter((w) => w.complete).length
  const tasksDone = weeks.reduce((s, w) => s + w.done, 0)
  const tasksTotal = weeks.reduce((s, w) => s + w.total, 0)

  /** Behind = weeks that have closed without being finished. */
  const missedWeeks = weeks.filter((w) => w.missed).length

  const dayOfPlan = Math.max(0, diffDays(now, startKey) + 1)
  const daysLeft = Math.max(0, diffDays(endKey, now))

  return {
    startKey,
    endKey,
    weeks,
    current,
    currentWeek,
    phase: phaseForWeek(currentWeek),
    notStarted: raw === 0,
    overrun: raw > PLAN_LENGTH,
    elapsedWeeks,
    dayOfPlan,
    daysLeft,
    banked,
    missedWeeks,
    tasksDone,
    tasksTotal,
    progress: tasksTotal ? tasksDone / tasksTotal : 0,
    /** Time spent against the calendar, for the "ahead or behind" read. */
    timeProgress: Math.min(1, Math.max(0, dayOfPlan / (PLAN_LENGTH * 7))),
    spanMetrics,
    totals: planTotals(weeks, spanMetrics),
    tracks: trackRollup(weeks),
    gates: weeks.filter((w) => w.gate).map((w) => w.gate),
  }
}
