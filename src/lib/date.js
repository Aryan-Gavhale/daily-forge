/**
 * Everything in Forge is keyed by a local calendar day, never a UTC timestamp.
 * A day key is 'YYYY-MM-DD' as the user's own device sees it, so logging at
 * 11pm IST lands on the day the user actually lived.
 */

const MS_DAY = 86400000

export function dayKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey() {
  return dayKey(new Date())
}

/** Local midnight for a key. Parsing 'YYYY-MM-DD' directly would give UTC. */
export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key, n) {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return dayKey(d)
}

export function diffDays(aKey, bKey) {
  const a = parseKey(aKey)
  const b = parseKey(bKey)
  return Math.round((a - b) / MS_DAY)
}

export function isFuture(key) {
  return diffDays(key, todayKey()) > 0
}

export function isToday(key) {
  return key === todayKey()
}

/** Inclusive list of keys from `fromKey` to `toKey`. */
export function rangeKeys(fromKey, toKey) {
  const out = []
  let cur = fromKey
  let guard = 0
  while (cur <= toKey && guard < 4000) {
    out.push(cur)
    cur = addDays(cur, 1)
    guard += 1
  }
  return out
}

/** The last `n` days ending at `endKey`, oldest first. */
export function lastNDays(n, endKey = todayKey()) {
  const out = []
  for (let i = n - 1; i >= 0; i -= 1) out.push(addDays(endKey, -i))
  return out
}

/** Weeks run Monday to Sunday; the report card is graded when Sunday closes. */
export function startOfWeekKey(key = todayKey()) {
  const d = parseKey(key)
  const dow = (d.getDay() + 6) % 7 // 0 = Monday
  d.setDate(d.getDate() - dow)
  return dayKey(d)
}

export function endOfWeekKey(key = todayKey()) {
  return addDays(startOfWeekKey(key), 6)
}

export function weekKeys(key = todayKey()) {
  const start = startOfWeekKey(key)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function monthKey(key = todayKey()) {
  return key.slice(0, 7)
}

export function startOfMonthKey(key = todayKey()) {
  return `${key.slice(0, 7)}-01`
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function weekdayShort(key) {
  return WEEKDAYS[parseKey(key).getDay()]
}

export function weekdayLong(key) {
  return WEEKDAYS_LONG[parseKey(key).getDay()]
}

export function monthShort(key) {
  return MONTHS[parseKey(key).getMonth()]
}

/** "Mon, 15 Sep" */
export function formatDay(key) {
  const d = parseKey(key)
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** "15 Sep" */
export function formatShort(key) {
  const d = parseKey(key)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function formatMonth(key) {
  const d = parseKey(`${key.slice(0, 7)}-01`)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "Today" / "Yesterday" / "Mon, 15 Sep" */
export function formatRelativeDay(key) {
  const delta = diffDays(key, todayKey())
  if (delta === 0) return 'Today'
  if (delta === -1) return 'Yesterday'
  if (delta === 1) return 'Tomorrow'
  return formatDay(key)
}

export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 5) return 'Still up'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

/** Hours left in the user's local day - used for the closing-window nudge. */
export function hoursLeftToday(now = new Date()) {
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return Math.max(0, (end - now) / 3600000)
}

export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
