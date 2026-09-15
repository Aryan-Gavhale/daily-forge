/**
 * Progression curve, rank names, and grade thresholds.
 *
 * Calibration: a perfect day is roughly 700 XP and a realistic good day is
 * around 350. The curve below puts level 10 at about two months of consistent
 * work and level 20 at about nine months, so the early levels arrive fast
 * enough to hook and the later ones stay genuinely expensive.
 */

/** Total XP required to have reached a given level. Level 1 starts at zero. */
export function totalXpForLevel(level) {
  const n = Math.max(0, level - 1)
  return 250 * n * n + 400 * n
}

export function levelFromXp(totalXp) {
  const xp = Math.max(0, totalXp)
  // Invert 250n^2 + 400n = xp
  const n = (-400 + Math.sqrt(160000 + 1000 * xp)) / 500
  return Math.max(1, Math.floor(n) + 1)
}

export function levelProgress(totalXp) {
  const level = levelFromXp(totalXp)
  const floor = totalXpForLevel(level)
  const ceil = totalXpForLevel(level + 1)
  const into = totalXp - floor
  const span = ceil - floor
  return {
    level,
    into,
    span,
    remaining: Math.max(0, ceil - totalXp),
    ratio: span > 0 ? Math.min(1, Math.max(0, into / span)) : 0,
    rank: rankForLevel(level),
  }
}

const RANKS = [
  { min: 1, name: 'Spark', accent: '#8b8b98' },
  { min: 3, name: 'Ember', accent: '#fdb022' },
  { min: 5, name: 'Kindled', accent: '#ff9a3d' },
  { min: 8, name: 'Forged', accent: '#ff7a1a' },
  { min: 12, name: 'Tempered', accent: '#5b9cff' },
  { min: 17, name: 'Steel', accent: '#a78bfa' },
  { min: 23, name: 'Titanium', accent: '#4fd1c5' },
  { min: 30, name: 'Molten Core', accent: '#f97066' },
]

export function rankForLevel(level) {
  let rank = RANKS[0]
  for (const r of RANKS) if (level >= r.min) rank = r
  return rank
}

export const GRADES = [
  { min: 95, letter: 'A+', accent: '#32d583', note: 'Elite week.' },
  { min: 85, letter: 'A', accent: '#32d583', note: 'Excellent.' },
  { min: 72, letter: 'B+', accent: '#5b9cff', note: 'Strong.' },
  { min: 60, letter: 'B', accent: '#5b9cff', note: 'Decent.' },
  { min: 45, letter: 'C', accent: '#fdb022', note: 'Patchy.' },
  { min: 30, letter: 'D', accent: '#ff9a3d', note: 'Slipping.' },
  { min: 0, letter: 'F', accent: '#f97066', note: 'Reset and go again.' },
]

export function gradeFor(percent) {
  const p = Number.isFinite(percent) ? percent : 0
  return GRADES.find((g) => p >= g.min) ?? GRADES[GRADES.length - 1]
}

/**
 * Day verdicts. Anything below the configured daily minimum is a hard fail -
 * that is the cost the strict mode is meant to make visible.
 */
export const VERDICTS = {
  FAILED: {
    id: 'failed',
    label: 'Failed',
    accent: '#f97066',
    blurb: 'Below the minimum. This one counts against you.',
  },
  PENDING: {
    id: 'pending',
    label: 'In progress',
    accent: '#fdb022',
    blurb: 'Day is still open. Go save it.',
  },
  SURVIVED: {
    id: 'survived',
    label: 'Survived',
    accent: '#5b9cff',
    blurb: 'Minimum cleared. Streak intact.',
  },
  SOLID: {
    id: 'solid',
    label: 'Solid',
    accent: '#4fd1c5',
    blurb: 'A genuinely good day.',
  },
  FORGED: {
    id: 'forged',
    label: 'Forged',
    accent: '#ff7a1a',
    blurb: 'This is the version of you that compounds.',
  },
  PERFECT: {
    id: 'perfect',
    label: 'Perfect',
    accent: '#32d583',
    blurb: 'All eight. Nothing left on the table.',
  },
}
