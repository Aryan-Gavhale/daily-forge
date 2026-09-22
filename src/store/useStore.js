import { create } from 'zustand'
import {
  buildExport,
  clearAll,
  clearPlan,
  defaultSettings,
  deleteDay as dbDeleteDay,
  deleteExpense as dbDeleteExpense,
  loadAll,
  parseImport,
  putDay,
  putEvent,
  putExpense,
  putPlanWeek,
  putSettings,
  replaceAll,
} from '../lib/db'
import { emptyDay } from '../lib/scoring'
import { emptyWeekRecord, weekId } from '../lib/plan'
import { monthKey, startOfWeekKey, todayKey, uid } from '../lib/date'

/**
 * Single in-memory source of truth, write-through to IndexedDB.
 *
 * The whole dataset is a few hundred KB even after years of daily logging, so
 * holding it in memory keeps every stat a synchronous pure function and avoids
 * async selectors all over the UI.
 */

const nowIso = () => new Date().toISOString()

export const useStore = create((set, get) => ({
  ready: false,
  error: null,
  days: {},
  expenses: [],
  events: [],
  /** Plan progress, keyed 'w1'..'w16'. See lib/plan.js. */
  plan: {},
  settings: defaultSettings(),
  /** Bumped whenever a pillar is completed, so the UI can fire a celebration. */
  celebration: null,

  async init() {
    if (get().ready) return
    try {
      const { days, expenses, settings, events, plan } = await loadAll()
      set({ days, expenses, events, plan, settings, ready: true, error: null })

      // Record the visit so the streak-break notice knows when we were last here.
      const today = todayKey()
      if (settings.lastOpenedAt !== today) {
        get().patchSettings({ lastOpenedAt: today })
      }
    } catch (err) {
      console.error('[forge] failed to open the database', err)
      set({ ready: true, error: err?.message ?? 'Could not open local storage.' })
    }
  },

  /* ------------------------------------------------------------- day log */

  getDay(date) {
    return get().days[date]
  },

  /** Write the primary value and/or extras for one pillar on one day. */
  async logPillar(date, pillarId, { value, extras } = {}) {
    const state = get()
    const existing = state.days[date] ?? emptyDay(date)
    const prevEntry = existing.entries[pillarId] ?? {}

    const nextEntry = {
      ...prevEntry,
      value: value === undefined ? (prevEntry.value ?? 0) : Math.max(0, Number(value) || 0),
      extras: { ...(prevEntry.extras ?? {}), ...(extras ?? {}) },
      source: 'manual',
      updatedAt: nowIso(),
    }

    const day = {
      ...existing,
      entries: { ...existing.entries, [pillarId]: nextEntry },
      updatedAt: nowIso(),
    }

    set({ days: { ...state.days, [date]: day } })
    await putDay(day)
    return day
  },

  /** Convenience for +N style quick adds. */
  async bumpPillar(date, pillarId, delta) {
    const current = Number(get().days[date]?.entries?.[pillarId]?.value) || 0
    return get().logPillar(date, pillarId, { value: Math.max(0, current + delta) })
  },

  async clearPillar(date, pillarId) {
    const state = get()
    const existing = state.days[date]
    if (!existing) return

    const entries = { ...existing.entries }
    delete entries[pillarId]

    if (Object.keys(entries).length === 0) {
      const days = { ...state.days }
      delete days[date]
      set({ days })
      await dbDeleteDay(date)
      return
    }

    const day = { ...existing, entries, updatedAt: nowIso() }
    set({ days: { ...state.days, [date]: day } })
    await putDay(day)
  },

  async setDayNote(date, note) {
    const state = get()
    const existing = state.days[date] ?? emptyDay(date)
    const day = { ...existing, note, updatedAt: nowIso() }
    set({ days: { ...state.days, [date]: day } })
    await putDay(day)
  },

  /* ------------------------------------------------------------- expenses */

  async addExpense({ amount, category, note, date = todayKey() }) {
    const expense = {
      id: uid(),
      amount: Math.max(0, Number(amount) || 0),
      category: category ?? 'other',
      note: (note ?? '').trim(),
      date,
      month: monthKey(date),
      createdAt: nowIso(),
    }
    set({ expenses: [...get().expenses, expense] })
    await putExpense(expense)

    // Logging a spend satisfies the Money pillar for that day.
    const moneyValue = Number(get().days[date]?.entries?.money?.value) || 0
    if (moneyValue < 1) await get().logPillar(date, 'money', { value: 1 })

    return expense
  },

  async updateExpense(id, patch) {
    const expenses = get().expenses.map((e) =>
      e.id === id
        ? {
            ...e,
            ...patch,
            amount: patch.amount === undefined ? e.amount : Math.max(0, Number(patch.amount) || 0),
            month: monthKey(patch.date ?? e.date),
          }
        : e
    )
    set({ expenses })
    const updated = expenses.find((e) => e.id === id)
    if (updated) await putExpense(updated)
  },

  async removeExpense(id) {
    set({ expenses: get().expenses.filter((e) => e.id !== id) })
    await dbDeleteExpense(id)
  },

  /* ------------------------------------------------------------- settings */

  async patchSettings(patch) {
    const settings = { ...get().settings, ...patch }
    set({ settings })
    await putSettings(settings)
  },

  async setPillarConfig(pillarId, patch) {
    const state = get()
    const pillars = {
      ...state.settings.pillars,
      [pillarId]: { ...state.settings.pillars[pillarId], ...patch },
    }
    await get().patchSettings({ pillars })
  },

  async resetPillarConfig() {
    await get().patchSettings({ pillars: defaultSettings().pillars })
  },

  /* ----------------------------------------------------------------- plan */

  /** Read-modify-write one plan week. All plan mutations funnel through here. */
  async patchPlanWeek(n, mutate) {
    const state = get()
    const id = weekId(n)
    const existing = state.plan[id] ?? emptyWeekRecord(n)
    const next = { ...mutate(existing), id, updatedAt: nowIso() }
    set({ plan: { ...state.plan, [id]: next } })
    await putPlanWeek(next)
    return next
  },

  async togglePlanTask(n, taskId, value) {
    let result = false
    await get().patchPlanWeek(n, (week) => {
      result = value === undefined ? !week.checks?.[taskId] : Boolean(value)
      return { ...week, checks: { ...week.checks, [taskId]: result } }
    })
    return result
  },

  async setPlanCount(n, taskId, value) {
    const next = Math.max(0, Math.round(Number(value) || 0))
    await get().patchPlanWeek(n, (week) => ({
      ...week,
      counts: { ...week.counts, [taskId]: next },
    }))
    return next
  },

  async bumpPlanCount(n, taskId, delta) {
    const current = Number(get().plan[weekId(n)]?.counts?.[taskId]) || 0
    return get().setPlanCount(n, taskId, current + delta)
  },

  async setPlanNote(n, note) {
    await get().patchPlanWeek(n, (week) => ({ ...week, note }))
  },

  /** Moving the start date re-dates every week; progress is kept. */
  async setPlanStart(dateKey) {
    await get().patchSettings({ planStartedAt: startOfWeekKey(dateKey) })
  },

  async resetPlan() {
    set({ plan: {} })
    await clearPlan()
  },

  /* --------------------------------------------------------------- events */

  async recordEvent(type, payload = {}) {
    const event = { id: uid(), type, date: todayKey(), payload, at: nowIso() }
    set({ events: [...get().events, event] })
    await putEvent(event)
    return event
  },

  /* ------------------------------------------------------- celebrate / UI */

  celebrate(payload) {
    set({ celebration: { ...payload, id: uid() } })
  },

  clearCelebration() {
    set({ celebration: null })
  },

  /* ------------------------------------------------------- backup / reset */

  exportData() {
    const { days, expenses, settings, events, plan } = get()
    return buildExport({ days, expenses, settings, events, plan })
  },

  async importData(raw) {
    const parsed = parseImport(raw)
    await replaceAll(parsed)
    const dayMap = {}
    for (const d of parsed.days) dayMap[d.date] = d
    const planMap = {}
    for (const w of parsed.plan) planMap[w.id] = w
    set({
      days: dayMap,
      expenses: parsed.expenses,
      events: parsed.events,
      plan: planMap,
      settings: parsed.settings,
    })
    return parsed
  },

  async resetEverything() {
    await clearAll()
    const settings = defaultSettings()
    await putSettings(settings)
    set({ days: {}, expenses: [], events: [], plan: {}, settings })
  },

  /** Replaces all logged history with generated data. Settings and plan are preserved. */
  async loadSeed({ days, expenses }) {
    const { settings, plan } = get()
    await replaceAll({ days, expenses, events: [], settings, plan: Object.values(plan) })
    const dayMap = {}
    for (const d of days) dayMap[d.date] = d
    set({ days: dayMap, expenses, events: [] })
  },
}))

/* ------------------------------------------------------------- selectors */

export const selectSettings = (s) => s.settings
export const selectDays = (s) => s.days
export const selectExpenses = (s) => s.expenses
export const selectReady = (s) => s.ready
