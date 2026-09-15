import { PILLARS } from '../data/pillars'
import {
  addDays,
  diffDays,
  formatShort,
  lastNDays,
  startOfWeekKey,
  todayKey,
  weekKeys,
  weekdayShort,
} from './date'
import {
  enabledPillars,
  evaluateDay,
  evaluatePillar,
  longestStreak,
  streakRuns,
} from './scoring'

/** Derived analytics. Same rule as scoring.js: pure functions, no side effects. */

export function xpTrend(dayMap, settings, n = 30, now = todayKey()) {
  return lastNDays(n, now).map((date) => {
    const e = evaluateDay(dayMap[date], settings, now)
    return {
      date,
      label: formatShort(date),
      weekday: weekdayShort(date),
      xp: e.xp,
      completed: e.completed,
      required: e.required,
      won: e.won,
      verdict: e.verdict.id,
    }
  })
}

/** Rolling window stats for one pillar. */
export function pillarWindow(dayMap, settings, pillarId, n = 30, now = todayKey()) {
  const keys = lastNDays(n, now)
  let hit = 0
  let total = 0
  let best = 0
  let bestDate = null

  for (const k of keys) {
    const r = evaluatePillar(pillarId, dayMap[k]?.entries?.[pillarId], settings)
    if (r.done) hit += 1
    total += r.value
    if (r.value > best) {
      best = r.value
      bestDate = k
    }
  }

  return {
    pillarId,
    days: keys.length,
    hit,
    total,
    best,
    bestDate,
    avgPerDay: keys.length ? total / keys.length : 0,
    consistency: keys.length ? (hit / keys.length) * 100 : 0,
  }
}

export function pillarWindows(dayMap, settings, n = 30, now = todayKey()) {
  return enabledPillars(settings).map((p) => ({
    pillar: p,
    ...pillarWindow(dayMap, settings, p.id, n, now),
  }))
}

function summariseKeys(dayMap, settings, keys, now) {
  const counted = keys.filter((k) => diffDays(k, now) <= 0)
  const evaluations = counted.map((k) => evaluateDay(dayMap[k], settings, now))
  return {
    keys: counted,
    xp: evaluations.reduce((s, e) => s + e.xp, 0),
    completed: evaluations.reduce((s, e) => s + e.completed, 0),
    wonDays: evaluations.filter((e) => e.won).length,
    perfectDays: evaluations.filter((e) => e.verdict.id === 'perfect').length,
    days: counted.length,
  }
}

/**
 * This week against last week.
 *
 * Last week is trimmed to the same number of elapsed days so a Tuesday is not
 * compared against a full seven-day week and made to look like a collapse.
 */
export function weekOverWeek(dayMap, settings, now = todayKey()) {
  const thisKeys = weekKeys(now)
  const elapsed = thisKeys.filter((k) => diffDays(k, now) <= 0).length
  const lastStart = addDays(startOfWeekKey(now), -7)
  const lastKeys = Array.from({ length: 7 }, (_, i) => addDays(lastStart, i)).slice(0, elapsed)

  const current = summariseKeys(dayMap, settings, thisKeys, now)
  const previous = summariseKeys(dayMap, settings, lastKeys, now)

  const perPillar = enabledPillars(settings).map((p) => {
    const nowHit = current.keys.filter(
      (k) => evaluatePillar(p.id, dayMap[k]?.entries?.[p.id], settings).done
    ).length
    const prevHit = lastKeys.filter(
      (k) => evaluatePillar(p.id, dayMap[k]?.entries?.[p.id], settings).done
    ).length
    return { pillar: p, current: nowHit, previous: prevHit, delta: nowHit - prevHit }
  })

  return {
    elapsed,
    current,
    previous,
    perPillar,
    xpDelta: current.xp - previous.xp,
    xpDeltaPercent: previous.xp ? ((current.xp - previous.xp) / previous.xp) * 100 : null,
    wonDelta: current.wonDays - previous.wonDays,
  }
}

/** Today against the same weekday last week - the most honest short comparison. */
export function versusLastWeekToday(dayMap, settings, now = todayKey()) {
  const past = addDays(now, -7)
  const today = evaluateDay(dayMap[now], settings, now)
  const then = evaluateDay(dayMap[past], settings, now)
  return {
    todayKey: now,
    pastKey: past,
    today,
    past: then,
    xpDelta: today.xp - then.xp,
    completedDelta: today.completed - then.completed,
    hasBaseline: Boolean(dayMap[past]),
  }
}

/** Personal bests, framed as numbers to beat rather than trophies to admire. */
export function personalBests(dayMap, settings, now = todayKey()) {
  const keys = Object.keys(dayMap).sort()
  const evaluations = keys.map((k) => evaluateDay(dayMap[k], settings, now))

  const bestXpDay = evaluations.reduce((best, e) => (!best || e.xp > best.xp ? e : best), null)
  const mostPillars = evaluations.reduce(
    (best, e) => (!best || e.completed > best.completed ? e : best),
    null
  )

  const runs = streakRuns(dayMap, settings, now)
  const best = longestStreak(dayMap, settings, now)

  // Best week by XP.
  const weekTotals = new Map()
  for (const e of evaluations) {
    const wk = startOfWeekKey(e.date)
    weekTotals.set(wk, (weekTotals.get(wk) ?? 0) + e.xp)
  }
  let bestWeek = null
  for (const [wk, xp] of weekTotals) {
    if (!bestWeek || xp > bestWeek.xp) bestWeek = { weekStart: wk, xp }
  }

  const perPillar = enabledPillars(settings).map((p) => {
    let value = 0
    let date = null
    for (const k of keys) {
      const r = evaluatePillar(p.id, dayMap[k]?.entries?.[p.id], settings)
      if (r.value > value) {
        value = r.value
        date = k
      }
    }
    return { pillar: p, value, date }
  })

  return {
    longestStreak: best,
    totalRuns: runs.length,
    bestXpDay: bestXpDay && bestXpDay.xp > 0 ? bestXpDay : null,
    mostPillars: mostPillars && mostPillars.completed > 0 ? mostPillars : null,
    bestWeek: bestWeek && bestWeek.xp > 0 ? bestWeek : null,
    perPillar: perPillar.filter((p) => p.value > 0),
    perfectDays: evaluations.filter((e) => e.verdict.id === 'perfect').length,
    wonDays: evaluations.filter((e) => e.won).length,
    failedDays: evaluations.filter((e) => e.verdict.id === 'failed').length,
    trackedDays: keys.length,
  }
}

/**
 * GitHub-style grid. Columns are weeks (oldest left), rows are Mon..Sun.
 * `pillarId` of null grades the whole day instead of a single pillar.
 */
export function heatmap(dayMap, settings, pillarId = null, weeks = 18, now = todayKey()) {
  const thisWeekStart = startOfWeekKey(now)
  const firstWeekStart = addDays(thisWeekStart, -7 * (weeks - 1))

  const columns = []
  for (let w = 0; w < weeks; w += 1) {
    const weekStart = addDays(firstWeekStart, 7 * w)
    const cells = []
    for (let d = 0; d < 7; d += 1) {
      const date = addDays(weekStart, d)
      const future = diffDays(date, now) > 0

      let intensity = 0
      let label = ''
      if (!future) {
        if (pillarId) {
          const r = evaluatePillar(pillarId, dayMap[date]?.entries?.[pillarId], settings)
          intensity = r.done ? (r.ratio >= 2 ? 4 : r.ratio >= 1.5 ? 3 : 2) : r.value > 0 ? 1 : 0
          label = `${r.value} ${r.pillar?.unit ?? ''}`
        } else {
          const e = evaluateDay(dayMap[date], settings, now)
          const ratio = e.enabledCount ? e.completed / e.enabledCount : 0
          intensity =
            e.completed === 0 ? 0 : ratio >= 1 ? 4 : ratio >= 0.75 ? 3 : e.won ? 2 : 1
          label = `${e.completed}/${e.enabledCount} pillars`
        }
      }

      cells.push({ date, future, intensity, label, weekday: d })
    }
    columns.push({ weekStart, cells })
  }

  return { columns, weeks, firstWeekStart }
}

/** Month labels positioned above the heatmap columns they start on. */
export function heatmapMonthLabels(columns) {
  const labels = []
  let lastMonth = null
  columns.forEach((col, i) => {
    const month = col.weekStart.slice(0, 7)
    if (month !== lastMonth) {
      labels.push({ index: i, month, label: formatShort(col.weekStart).split(' ')[1] })
      lastMonth = month
    }
  })
  return labels
}

/** Totals for the overview strip at the top of Stats. */
export function lifetimeTotals(dayMap, settings, now = todayKey()) {
  const totals = {}
  for (const p of PILLARS) totals[p.id] = 0
  for (const day of Object.values(dayMap)) {
    for (const p of PILLARS) {
      const v = Number(day?.entries?.[p.id]?.value) || 0
      totals[p.id] += v
    }
  }
  const evaluations = Object.values(dayMap).map((d) => evaluateDay(d, settings, now))
  return {
    perPillar: totals,
    xp: evaluations.reduce((s, e) => s + e.xp, 0),
    days: evaluations.length,
  }
}

/* ------------------------------------------------------------------ money */

export function monthExpenses(expenses, month) {
  return expenses.filter((e) => e.date.startsWith(month))
}

export function sumAmount(list) {
  return list.reduce((s, e) => s + (Number(e.amount) || 0), 0)
}

/** Shortens big amounts so they still fit inside a ring or a narrow tile. */
export function compactAmount(value) {
  const n = Math.round(Number(value) || 0)
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`
  return n.toLocaleString('en-IN')
}

export function groupExpensesByDay(expenses) {
  const map = new Map()
  for (const e of expenses) {
    if (!map.has(e.date)) map.set(e.date, [])
    map.get(e.date).push(e)
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
      total: sumAmount(items),
    }))
}

export function expensesByCategory(expenses) {
  const map = new Map()
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + (Number(e.amount) || 0))
  }
  const total = sumAmount(expenses)
  return [...map.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      percent: total ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function savedThisMonth(dayMap, month) {
  let total = 0
  for (const [date, day] of Object.entries(dayMap)) {
    if (!date.startsWith(month)) continue
    total += Number(day?.entries?.money?.extras?.saved) || 0
  }
  return total
}

export function noSpendDays(dayMap, month) {
  let count = 0
  for (const [date, day] of Object.entries(dayMap)) {
    if (!date.startsWith(month)) continue
    if (day?.entries?.money?.extras?.noSpend) count += 1
  }
  return count
}

/** Daily spend series for the month, used by the Money chart. */
export function dailySpendSeries(expenses, month, now = todayKey()) {
  const daysInMonth = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)),
    0
  ).getDate()
  const series = []
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = `${month}-${String(d).padStart(2, '0')}`
    if (diffDays(date, now) > 0) break
    const amount = sumAmount(expenses.filter((e) => e.date === date))
    series.push({ date, day: d, amount })
  }
  let running = 0
  return series.map((s) => {
    running += s.amount
    return { ...s, cumulative: running }
  })
}

/* --------------------------------------------------------------- journal */

export function journalEntries(dayMap) {
  return Object.values(dayMap)
    .filter((d) => (d?.entries?.mind?.extras?.journal ?? '').trim().length > 0)
    .map((d) => ({
      date: d.date,
      text: d.entries.mind.extras.journal.trim(),
      mood: d.entries.mind.extras.mood ?? null,
      minutes: Number(d.entries.mind.value) || 0,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function moodSeries(dayMap, n = 30, now = todayKey()) {
  return lastNDays(n, now)
    .map((date) => ({
      date,
      label: formatShort(date),
      mood: Number(dayMap[date]?.entries?.mind?.extras?.mood) || null,
    }))
    .filter((d) => d.mood !== null)
}
