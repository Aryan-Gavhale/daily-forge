import { openDB } from 'idb'
import { PILLARS } from '../data/pillars'
import { todayKey } from './date'

export const DB_NAME = 'forge'
export const DB_VERSION = 1
export const EXPORT_FORMAT = 'forge.backup.v1'

export const STORES = {
  DAYS: 'days', // keyPath 'date'  - one record per calendar day
  EXPENSES: 'expenses', // keyPath 'id'    - indexed by date and month
  SETTINGS: 'settings', // keyPath 'id'    - single 'app' record
  EVENTS: 'events', // keyPath 'id'    - streak breaks, level ups
}

export const SETTINGS_ID = 'app'

export function defaultSettings() {
  const pillars = {}
  for (const p of PILLARS) {
    pillars[p.id] = { target: p.defaultTarget, xp: p.defaultXp, enabled: true }
  }
  return {
    id: SETTINGS_ID,
    name: '',
    currency: '₹',
    pillars,
    /** Pillars you must complete or the day is marked Failed. */
    dailyMinimum: 4,
    monthlyBudget: 20000,
    savingsGoal: 10000,
    startedAt: todayKey(),
    lastOpenedAt: todayKey(),
    /** Set once the streak-break notice for a given date has been shown. */
    acknowledgedBreak: null,
    hapticsEnabled: true,
    createdAt: new Date().toISOString(),
  }
}

let dbPromise = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.DAYS)) {
          db.createObjectStore(STORES.DAYS, { keyPath: 'date' })
        }
        if (!db.objectStoreNames.contains(STORES.EXPENSES)) {
          const s = db.createObjectStore(STORES.EXPENSES, { keyPath: 'id' })
          s.createIndex('date', 'date')
          s.createIndex('month', 'month')
        }
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.EVENTS)) {
          const s = db.createObjectStore(STORES.EVENTS, { keyPath: 'id' })
          s.createIndex('date', 'date')
        }
      },
    })
  }
  return dbPromise
}

export async function loadAll() {
  const db = await getDB()
  const [days, expenses, settingsRec, events] = await Promise.all([
    db.getAll(STORES.DAYS),
    db.getAll(STORES.EXPENSES),
    db.get(STORES.SETTINGS, SETTINGS_ID),
    db.getAll(STORES.EVENTS),
  ])

  let settings = settingsRec
  if (!settings) {
    settings = defaultSettings()
    await db.put(STORES.SETTINGS, settings)
  } else {
    // Fill in anything a newer build added without clobbering the user's values.
    settings = mergeSettings(defaultSettings(), settings)
  }

  const dayMap = {}
  for (const d of days) dayMap[d.date] = d

  return { days: dayMap, expenses, settings, events }
}

/** Deep-ish merge that keeps saved per-pillar config and adds any new pillars. */
export function mergeSettings(base, saved) {
  const pillars = { ...base.pillars }
  for (const [id, cfg] of Object.entries(saved.pillars ?? {})) {
    if (pillars[id]) pillars[id] = { ...pillars[id], ...cfg }
  }
  return { ...base, ...saved, pillars, id: SETTINGS_ID }
}

export async function putDay(day) {
  const db = await getDB()
  await db.put(STORES.DAYS, day)
}

export async function deleteDay(date) {
  const db = await getDB()
  await db.delete(STORES.DAYS, date)
}

export async function putExpense(expense) {
  const db = await getDB()
  await db.put(STORES.EXPENSES, expense)
}

export async function deleteExpense(id) {
  const db = await getDB()
  await db.delete(STORES.EXPENSES, id)
}

export async function putSettings(settings) {
  const db = await getDB()
  await db.put(STORES.SETTINGS, { ...settings, id: SETTINGS_ID })
}

export async function putEvent(event) {
  const db = await getDB()
  await db.put(STORES.EVENTS, event)
}

export async function clearAll() {
  const db = await getDB()
  const tx = db.transaction(Object.values(STORES), 'readwrite')
  await Promise.all([
    tx.objectStore(STORES.DAYS).clear(),
    tx.objectStore(STORES.EXPENSES).clear(),
    tx.objectStore(STORES.SETTINGS).clear(),
    tx.objectStore(STORES.EVENTS).clear(),
    tx.done,
  ])
}

/** Replace the entire database contents in one transaction. */
export async function replaceAll({ days, expenses, settings, events }) {
  const db = await getDB()
  const tx = db.transaction(Object.values(STORES), 'readwrite')
  const dayStore = tx.objectStore(STORES.DAYS)
  const expStore = tx.objectStore(STORES.EXPENSES)
  const setStore = tx.objectStore(STORES.SETTINGS)
  const evtStore = tx.objectStore(STORES.EVENTS)

  await Promise.all([dayStore.clear(), expStore.clear(), setStore.clear(), evtStore.clear()])

  for (const d of days) dayStore.put(d)
  for (const e of expenses) expStore.put(e)
  for (const e of events) evtStore.put(e)
  setStore.put({ ...settings, id: SETTINGS_ID })

  await tx.done
}

export function buildExport({ days, expenses, settings, events }) {
  return {
    format: EXPORT_FORMAT,
    app: 'Forge',
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    counts: {
      days: Object.keys(days).length,
      expenses: expenses.length,
      events: events.length,
    },
    settings,
    days: Object.values(days).sort((a, b) => a.date.localeCompare(b.date)),
    expenses,
    events,
  }
}

/** Validates a backup file and normalises it into the shape replaceAll wants. */
export function parseImport(raw) {
  let parsed
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    throw new Error('That file is not valid JSON.')
  }

  if (!parsed || typeof parsed !== 'object') throw new Error('That file is empty.')
  if (parsed.format !== EXPORT_FORMAT) {
    throw new Error('That is not a Forge backup file.')
  }
  if (!Array.isArray(parsed.days)) throw new Error('Backup is missing its day records.')

  const days = parsed.days.filter((d) => d && typeof d.date === 'string')
  const expenses = (parsed.expenses ?? []).filter((e) => e && typeof e.id === 'string')
  const events = (parsed.events ?? []).filter((e) => e && typeof e.id === 'string')
  const settings = mergeSettings(defaultSettings(), parsed.settings ?? {})

  return { days, expenses, events, settings }
}
