import { PILLARS, PILLAR_MAP } from '../data/pillars'
import { VERDICTS, gradeFor, levelProgress } from '../data/levels'
import { addDays, diffDays, todayKey, startOfWeekKey, weekKeys } from './date'

/**
 * Pure scoring. Nothing here touches the store, IndexedDB or React, so the
 * rules stay readable and can be reasoned about on their own.
 */

/** Overshooting the target earns XP at a reduced rate, capped. */
const BONUS_RATE = 0.35
const BONUS_CAP = 0.5

export function emptyDay(date) {
  return {
    date,
    entries: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function pillarConfig(settings, pillarId) {
  const p = PILLAR_MAP[pillarId]
  return (
    settings?.pillars?.[pillarId] ?? {
      target: p?.defaultTarget ?? 1,
      xp: p?.defaultXp ?? 50,
      enabled: true,
    }
  )
}

export function enabledPillars(settings) {
  return PILLARS.filter((p) => pillarConfig(settings, p.id).enabled !== false)
}

function bonusMet(rule, extras) {
  const raw = extras?.[rule.field]
  switch (rule.op) {
    case 'truthy':
      return Boolean(raw)
    case 'gte':
      return Number(raw) >= Number(rule.value)
    case 'text':
      return typeof raw === 'string' && raw.trim().length > 0
    default:
      return false
  }
}

/**
 * Score one pillar for one day.
 *
 * Extra-field bonuses are awarded independently of whether the primary target
 * was hit. Journalling on a day you skipped meditation is still worth
 * something - it just does not make the pillar count as done.
 */
export function evaluatePillar(pillarId, entry, settings) {
  const pillar = PILLAR_MAP[pillarId]
  const cfg = pillarConfig(settings, pillarId)
  const target = Math.max(1, Number(cfg.target) || 1)
  const xpAtTarget = Math.max(0, Number(cfg.xp) || 0)

  const value = Math.max(0, Number(entry?.value) || 0)
  const extras = entry?.extras ?? {}
  const ratio = value / target

  const baseXp = Math.round(xpAtTarget * Math.min(1, ratio))
  const over = Math.max(0, ratio - 1)
  const overshootXp = Math.round(xpAtTarget * Math.min(BONUS_CAP, over * BONUS_RATE))

  const bonusesHit = []
  let extraXp = 0
  for (const rule of pillar?.bonuses ?? []) {
    if (bonusMet(rule, extras)) {
      bonusesHit.push(rule)
      extraXp += rule.xp
    }
  }

  const bonusXp = overshootXp + extraXp

  return {
    pillar,
    pillarId,
    config: cfg,
    enabled: cfg.enabled !== false,
    value,
    extras,
    target,
    ratio,
    progress: Math.min(1, ratio),
    done: value >= target,
    started: value > 0 || bonusesHit.length > 0,
    baseXp,
    overshootXp,
    extraXp,
    bonusXp,
    bonusesHit,
    xp: baseXp + bonusXp,
    logged: Boolean(entry),
  }
}

function verdictFor({ completed, enabledCount, required, isOpen }) {
  if (enabledCount > 0 && completed >= enabledCount) return VERDICTS.PERFECT
  if (completed >= Math.ceil(enabledCount * 0.75) && completed > required) return VERDICTS.FORGED
  if (completed >= required + 1) return VERDICTS.SOLID
  if (completed >= required) return VERDICTS.SURVIVED
  if (isOpen) return VERDICTS.PENDING
  return VERDICTS.FAILED
}

/** Score a whole day. `day` may be undefined - an unlogged day scores zero. */
export function evaluateDay(day, settings, now = todayKey()) {
  const active = enabledPillars(settings)
  const required = Math.max(1, Math.min(active.length, Number(settings?.dailyMinimum) || 4))

  const results = active.map((p) => evaluatePillar(p.id, day?.entries?.[p.id], settings))

  const completed = results.filter((r) => r.done).length
  const started = results.filter((r) => r.started).length
  const xp = results.reduce((sum, r) => sum + r.xp, 0)
  const baseXp = results.reduce((sum, r) => sum + r.baseXp, 0)
  const bonusXp = results.reduce((sum, r) => sum + r.bonusXp, 0)
  const maxXp = results.reduce((sum, r) => sum + (Number(r.config.xp) || 0), 0)

  const date = day?.date ?? now
  const isOpen = diffDays(date, now) >= 0
  const verdict = verdictFor({ completed, enabledCount: active.length, required, isOpen })

  return {
    date,
    results,
    byPillar: results.reduce((acc, r) => {
      acc[r.pillarId] = r
      return acc
    }, {}),
    completed,
    started,
    enabledCount: active.length,
    required,
    remaining: Math.max(0, required - completed),
    xp,
    baseXp,
    bonusXp,
    maxXp,
    verdict,
    won: completed >= required,
    isOpen,
    isEmpty: started === 0,
    completionRatio: active.length ? completed / active.length : 0,
    minimumRatio: required ? Math.min(1, completed / required) : 1,
  }
}

export function evaluateRange(dayMap, keys, settings, now = todayKey()) {
  return keys.map((key) => evaluateDay(dayMap[key], settings, now))
}

/**
 * Current streak = consecutive won days ending today.
 *
 * Today is treated as still-open: if it has not been won yet, the streak is
 * measured up to yesterday and flagged `atRisk`, rather than reading as broken.
 */
export function computeStreak(dayMap, settings, now = todayKey()) {
  const todayWon = evaluateDay(dayMap[now], settings, now).won
  let cursor = todayWon ? now : addDays(now, -1)
  let count = 0
  let guard = 0
  let lastWon = null

  while (guard < 4000) {
    const evaluated = evaluateDay(dayMap[cursor], settings, now)
    if (!evaluated.won) break
    if (!lastWon) lastWon = cursor
    count += 1
    cursor = addDays(cursor, -1)
    guard += 1
  }

  return {
    current: count,
    includesToday: todayWon,
    atRisk: !todayWon && count > 0,
    startedOn: count > 0 ? addDays(cursor, 1) : null,
    lastWonDate: lastWon,
  }
}

function orderedKeys(dayMap) {
  return Object.keys(dayMap).sort()
}

/** Every completed run of won days, including the one currently running. */
export function streakRuns(dayMap, settings, now = todayKey()) {
  const keys = orderedKeys(dayMap)
  if (!keys.length) return []

  const runs = []
  let run = null
  let cursor = keys[0]
  let guard = 0

  while (cursor <= now && guard < 4000) {
    const won = evaluateDay(dayMap[cursor], settings, now).won
    if (won) {
      if (!run) run = { start: cursor, end: cursor, length: 0 }
      run.end = cursor
      run.length += 1
    } else if (run) {
      runs.push({ ...run, brokenOn: cursor })
      run = null
    }
    cursor = addDays(cursor, 1)
    guard += 1
  }
  if (run) runs.push({ ...run, brokenOn: null })
  return runs
}

export function longestStreak(dayMap, settings, now = todayKey()) {
  return streakRuns(dayMap, settings, now).reduce((max, r) => Math.max(max, r.length), 0)
}

/** The most recent broken run, for the "you lost N days" notice. */
export function lastBrokenStreak(dayMap, settings, now = todayKey()) {
  const broken = streakRuns(dayMap, settings, now).filter((r) => r.brokenOn)
  return broken.length ? broken[broken.length - 1] : null
}

export function totalXp(dayMap, settings, now = todayKey()) {
  return Object.values(dayMap).reduce(
    (sum, day) => sum + evaluateDay(day, settings, now).xp,
    0
  )
}

export function levelState(dayMap, settings, now = todayKey()) {
  return levelProgress(totalXp(dayMap, settings, now))
}

/**
 * Weekly report card. Only days that have already happened are graded, so the
 * current week is not dragged down by days that have not arrived yet.
 */
export function gradeWeek(dayMap, settings, anchor = todayKey(), now = todayKey()) {
  const start = startOfWeekKey(anchor)
  const keys = weekKeys(anchor)
  const counted = keys.filter((k) => diffDays(k, now) <= 0)
  const active = enabledPillars(settings)

  const perPillar = active.map((p) => {
    let hit = 0
    let value = 0
    for (const k of counted) {
      const r = evaluatePillar(p.id, dayMap[k]?.entries?.[p.id], settings)
      if (r.done) hit += 1
      value += r.value
    }
    const percent = counted.length ? (hit / counted.length) * 100 : 0
    return { pillar: p, hit, possible: counted.length, value, percent, grade: gradeFor(percent) }
  })

  const evaluations = counted.map((k) => evaluateDay(dayMap[k], settings, now))
  const xp = evaluations.reduce((s, e) => s + e.xp, 0)
  const maxXp = evaluations.reduce((s, e) => s + e.maxXp, 0)
  const wonDays = evaluations.filter((e) => e.won).length
  const failedDays = evaluations.filter((e) => e.verdict.id === 'failed').length
  const perfectDays = evaluations.filter((e) => e.verdict.id === 'perfect').length

  const totalHit = perPillar.reduce((s, p) => s + p.hit, 0)
  const totalPossible = perPillar.reduce((s, p) => s + p.possible, 0)
  const overallPercent = totalPossible ? (totalHit / totalPossible) * 100 : 0

  const bestDay = evaluations.reduce(
    (best, e) => (!best || e.xp > best.xp ? e : best),
    null
  )

  return {
    weekStart: start,
    weekEnd: addDays(start, 6),
    isCurrent: start === startOfWeekKey(now),
    daysCounted: counted.length,
    perPillar,
    xp,
    maxXp,
    wonDays,
    failedDays,
    perfectDays,
    overallPercent,
    overallGrade: gradeFor(overallPercent),
    bestDay,
  }
}

/** Grade the last `count` weeks, most recent first. */
export function weeklyReportCards(dayMap, settings, count = 8, now = todayKey()) {
  const keys = orderedKeys(dayMap)
  if (!keys.length) return []
  const firstWeek = startOfWeekKey(keys[0])
  const cards = []
  let anchor = startOfWeekKey(now)
  let guard = 0
  while (anchor >= firstWeek && cards.length < count && guard < 200) {
    cards.push(gradeWeek(dayMap, settings, anchor, now))
    anchor = addDays(anchor, -7)
    guard += 1
  }
  return cards
}
