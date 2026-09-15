import { PILLARS } from '../data/pillars'
import { addDays, monthKey, todayKey, uid, parseKey } from './date'

/**
 * Generates a plausible history so the charts, streaks, grades and records can
 * be seen without waiting three months. Deterministic, so the demo looks the
 * same every time and bugs stay reproducible.
 */

function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const JOURNAL_LINES = [
  'Slow start, but the second half of the day was clean. Two hard problems, both solved without hints.',
  'Skipped the gym and felt it by evening. Logging it honestly instead of pretending.',
  'Shipped a reel that took three hours to edit. Worth it, the hook is finally tight.',
  'System design clicked today. Finally understand why you shard on a hash and not a range.',
  'Low energy. Did the minimum and went to bed early. That still counts.',
  'Best day in weeks. Everything got touched and nothing felt forced.',
  'Chess was tilt city. Lost four in a row, then reviewed two of them properly.',
  'Read forty pages and took notes. The compounding is real when you do not skip.',
  'Spent more than I should have on food delivery. Noted, not repeating tomorrow.',
  'Quiet, steady day. No heroics, just the work.',
]

const TOPICS = [
  'consistent hashing',
  'rate limiters',
  'CAP theorem',
  'CDN design',
  'message queues',
  'database indexing',
  'leader election',
  'caching layers',
]

const BOOKS = ['Deep Work', 'Atomic Habits', 'Designing Data-Intensive Applications', 'Shoe Dog']
const SESSIONS = ['Push', 'Pull', 'Legs', 'Upper', 'Full body', 'Cardio']
const IG_TYPES = ['Reel', 'Post', 'Carousel', 'Story']

/**
 * Daily spending is mostly small and food-shaped. Rent and bills land once or
 * twice a month, so they are drawn rarely rather than with equal weight - an
 * even draw generates a demo that is absurdly over budget every month.
 */
const CATEGORY_WEIGHTS = {
  food: 34,
  transport: 20,
  fun: 12,
  shopping: 8,
  health: 8,
  learning: 7,
  other: 8,
  rent: 3,
}

const CATEGORY_BASE = {
  food: 240,
  transport: 130,
  fun: 420,
  shopping: 900,
  health: 380,
  learning: 500,
  other: 260,
  rent: 3200,
}

function pickCategory(rand) {
  const total = Object.values(CATEGORY_WEIGHTS).reduce((s, w) => s + w, 0)
  let roll = rand() * total
  for (const [id, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    roll -= weight
    if (roll <= 0) return id
  }
  return 'other'
}

const NOTES = {
  food: ['Lunch', 'Groceries', 'Coffee', 'Dinner out', 'Swiggy'],
  transport: ['Metro', 'Cab', 'Fuel', 'Auto'],
  rent: ['Electricity', 'Internet', 'Rent', 'Phone'],
  health: ['Gym fee', 'Protein', 'Medicines'],
  learning: ['Course', 'Book', 'Subscription'],
  fun: ['Movie', 'Weekend out', 'Game'],
  shopping: ['Clothes', 'Headphones', 'Household'],
  other: ['Misc', 'Gift'],
}

/**
 * @param {number} dayCount how many days of history to generate
 * @returns {{days: object[], expenses: object[]}}
 */
export function generateSeed(dayCount = 84, seed = 20260915) {
  const rand = mulberry32(seed)
  const end = todayKey()
  const days = []
  const expenses = []
  let journalCursor = 0

  // Discipline ramps up over the period with a slump in the middle, which is
  // what a real adoption curve looks like and makes the streak history readable.
  for (let i = dayCount - 1; i >= 0; i -= 1) {
    const date = addDays(end, -i)
    const progress = (dayCount - i) / dayCount
    const dow = parseKey(date).getDay()
    const isWeekend = dow === 0 || dow === 6

    const slump = progress > 0.42 && progress < 0.56 ? -0.38 : 0
    let discipline = 0.35 + progress * 0.5 + slump + (rand() - 0.5) * 0.28
    if (isWeekend) discipline -= 0.12
    discipline = Math.min(1, Math.max(0.05, discipline))

    const entries = {}

    for (const pillar of PILLARS) {
      const roll = rand()
      // Gym rests on Sunday, Instagram is not a daily grind.
      const weight =
        pillar.id === 'gym' && dow === 0
          ? 0.15
          : pillar.id === 'instagram'
            ? 0.72
            : pillar.id === 'money'
              ? 0.92
              : 1

      if (roll > discipline * weight) continue

      const target = pillar.defaultTarget
      const overshoot = rand() < 0.28 ? 1 + rand() * 0.9 : 0.6 + rand() * 0.55
      const value = Math.max(1, Math.round(target * overshoot))
      const extras = {}

      switch (pillar.id) {
        case 'codeforces':
          extras.rating = 1180 + Math.round(progress * 260) + Math.round(rand() * 40)
          if (rand() < 0.14) extras.contest = true
          if (rand() < 0.5) extras.topics = TOPICS[Math.floor(rand() * TOPICS.length)]
          break
        case 'system':
          extras.topic = TOPICS[Math.floor(rand() * TOPICS.length)]
          if (rand() < 0.55) extras.wroteNotes = true
          break
        case 'gym':
          extras.session = SESSIONS[Math.floor(rand() * SESSIONS.length)]
          extras.duration = 40 + Math.round(rand() * 45)
          if (rand() < 0.1) extras.pr = true
          break
        case 'chess':
          extras.games = Math.round(rand() * 5)
          extras.rating = 980 + Math.round(progress * 220) + Math.round(rand() * 40)
          if (rand() < 0.3) extras.reviewed = true
          break
        case 'instagram':
          extras.type = IG_TYPES[Math.floor(rand() * IG_TYPES.length)]
          extras.ideas = Math.round(rand() * 5)
          if (rand() < 0.45) extras.engaged = true
          break
        case 'mind':
          extras.mood = Math.max(1, Math.min(5, Math.round(2 + discipline * 2.4 + (rand() - 0.5))))
          if (rand() < 0.4) {
            // Walk the pool instead of sampling it, so the demo archive never
            // shows the same line three days running.
            journalCursor = (journalCursor + 1 + Math.floor(rand() * 3)) % JOURNAL_LINES.length
            extras.journal = JOURNAL_LINES[journalCursor]
          }
          break
        case 'money':
          if (rand() < 0.18) extras.noSpend = true
          if (rand() < 0.3) extras.saved = 500 + Math.round(rand() * 20) * 100
          break
        case 'reading':
          extras.book = BOOKS[Math.floor(rand() * BOOKS.length)]
          extras.pages = Math.round(value * 0.9)
          break
        default:
          break
      }

      entries[pillar.id] = {
        value,
        extras,
        source: 'seed',
        updatedAt: new Date(`${date}T20:00:00`).toISOString(),
      }
    }

    if (Object.keys(entries).length > 0) {
      days.push({
        date,
        entries,
        createdAt: new Date(`${date}T08:00:00`).toISOString(),
        updatedAt: new Date(`${date}T21:00:00`).toISOString(),
      })
    }

    // Expenses, unless it was declared a no-spend day.
    if (!entries.money?.extras?.noSpend) {
      const count = rand() < 0.35 ? 1 : rand() < 0.8 ? 2 : 3
      for (let n = 0; n < count; n += 1) {
        const category = pickCategory(rand)
        const notes = NOTES[category] ?? NOTES.other
        expenses.push({
          id: uid(),
          amount: Math.round((CATEGORY_BASE[category] * (0.5 + rand() * 1.3)) / 10) * 10,
          category,
          note: notes[Math.floor(rand() * notes.length)],
          date,
          month: monthKey(date),
          createdAt: new Date(`${date}T13:00:00`).toISOString(),
        })
      }
    }
  }

  return { days, expenses }
}
