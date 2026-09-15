/**
 * The eight pillars.
 *
 * Each pillar has exactly one PRIMARY metric. That metric alone decides whether
 * the pillar counts as done for the day and drives its XP - keeping it to one
 * number is what makes the scoring explainable at a glance.
 *
 * `extras` are optional fields captured alongside the primary metric. They add
 * texture and can award flat bonus XP through `bonuses`, but they never gate
 * completion.
 */

export const WIDGETS = {
  COUNTER: 'counter',
  MINUTES: 'minutes',
  CHECK: 'check',
}

export const PILLARS = [
  {
    id: 'codeforces',
    name: 'Codeforces',
    short: 'CF',
    tagline: 'Problems solved',
    icon: 'code',
    accent: '#5b9cff',
    glow: 'rgba(91,156,255,0.28)',
    widget: WIDGETS.COUNTER,
    unit: 'problems',
    unitOne: 'problem',
    defaultTarget: 2,
    defaultXp: 70,
    quickAdd: [1, 1, 2],
    prompt: 'How many problems did you actually solve?',
    extras: [
      { id: 'rating', label: 'Current rating', kind: 'number', placeholder: '1420', max: 4000 },
      { id: 'contest', label: 'Played a contest', kind: 'toggle' },
      { id: 'topics', label: 'Topics touched', kind: 'text', placeholder: 'binary search, dp' },
    ],
    bonuses: [{ id: 'contest', label: 'Contest played', xp: 40, field: 'contest', op: 'truthy' }],
  },
  {
    id: 'system',
    name: 'System Design',
    short: 'SD',
    tagline: 'Focused minutes',
    icon: 'layers',
    accent: '#a78bfa',
    glow: 'rgba(167,139,250,0.28)',
    widget: WIDGETS.MINUTES,
    unit: 'min',
    unitOne: 'min',
    defaultTarget: 30,
    defaultXp: 70,
    quickAdd: [10, 15, 30],
    prompt: 'Minutes of real system design study.',
    extras: [
      { id: 'topic', label: 'Topic', kind: 'text', placeholder: 'consistent hashing' },
      { id: 'wroteNotes', label: 'Wrote notes or a diagram', kind: 'toggle' },
    ],
    bonuses: [
      { id: 'wroteNotes', label: 'Notes written', xp: 25, field: 'wroteNotes', op: 'truthy' },
    ],
  },
  {
    id: 'gym',
    name: 'Gym',
    short: 'GYM',
    tagline: 'Show up and lift',
    icon: 'dumbbell',
    accent: '#f97066',
    glow: 'rgba(249,112,102,0.28)',
    widget: WIDGETS.CHECK,
    unit: 'session',
    unitOne: 'session',
    defaultTarget: 1,
    defaultXp: 80,
    prompt: 'Did you train today?',
    extras: [
      {
        id: 'session',
        label: 'Session',
        kind: 'select',
        options: ['Push', 'Pull', 'Legs', 'Upper', 'Full body', 'Cardio', 'Mobility'],
      },
      { id: 'duration', label: 'Duration', kind: 'number', suffix: 'min', placeholder: '60' },
      { id: 'pr', label: 'Hit a personal record', kind: 'toggle' },
    ],
    bonuses: [
      { id: 'long', label: '45+ minute session', xp: 20, field: 'duration', op: 'gte', value: 45 },
      { id: 'pr', label: 'Personal record', xp: 30, field: 'pr', op: 'truthy' },
    ],
  },
  {
    id: 'chess',
    name: 'Chess',
    short: 'CHS',
    tagline: 'Puzzles solved',
    icon: 'knight',
    accent: '#e8eaed',
    glow: 'rgba(232,234,237,0.22)',
    widget: WIDGETS.COUNTER,
    unit: 'puzzles',
    unitOne: 'puzzle',
    defaultTarget: 5,
    defaultXp: 50,
    quickAdd: [1, 5, 10],
    prompt: 'Puzzles solved. Games are logged separately.',
    extras: [
      { id: 'games', label: 'Games played', kind: 'number', placeholder: '3' },
      { id: 'rating', label: 'Rating', kind: 'number', placeholder: '1100', max: 3500 },
      { id: 'reviewed', label: 'Reviewed a loss', kind: 'toggle' },
    ],
    bonuses: [
      { id: 'reviewed', label: 'Reviewed a loss', xp: 25, field: 'reviewed', op: 'truthy' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    short: 'IG',
    tagline: 'Pieces shipped',
    icon: 'camera',
    accent: '#ff5c8a',
    glow: 'rgba(255,92,138,0.28)',
    widget: WIDGETS.COUNTER,
    unit: 'shipped',
    unitOne: 'shipped',
    defaultTarget: 1,
    defaultXp: 80,
    quickAdd: [1, 1, 2],
    prompt: 'Published, not drafted. Shipping is the metric.',
    extras: [
      {
        id: 'type',
        label: 'Format',
        kind: 'select',
        options: ['Reel', 'Post', 'Carousel', 'Story'],
      },
      { id: 'ideas', label: 'Ideas captured', kind: 'number', placeholder: '3' },
      { id: 'engaged', label: 'Replied to comments / DMs', kind: 'toggle' },
    ],
    bonuses: [
      { id: 'ideas', label: '3+ ideas captured', xp: 20, field: 'ideas', op: 'gte', value: 3 },
      { id: 'engaged', label: 'Engaged with audience', xp: 15, field: 'engaged', op: 'truthy' },
    ],
  },
  {
    id: 'mind',
    name: 'Mind',
    short: 'MND',
    tagline: 'Meditation minutes',
    icon: 'spark',
    accent: '#4fd1c5',
    glow: 'rgba(79,209,197,0.28)',
    widget: WIDGETS.MINUTES,
    unit: 'min',
    unitOne: 'min',
    defaultTarget: 10,
    defaultXp: 60,
    quickAdd: [5, 10, 20],
    prompt: 'Sit still. Then write the day down.',
    extras: [
      { id: 'mood', label: 'Mood', kind: 'mood' },
      { id: 'journal', label: 'Journal', kind: 'longtext', placeholder: 'What actually happened today?' },
    ],
    bonuses: [
      { id: 'journal', label: 'Journalled', xp: 30, field: 'journal', op: 'text' },
      { id: 'mood', label: 'Mood logged', xp: 10, field: 'mood', op: 'truthy' },
    ],
  },
  {
    id: 'money',
    name: 'Money',
    short: 'MNY',
    tagline: 'Track every rupee',
    icon: 'wallet',
    accent: '#32d583',
    glow: 'rgba(50,213,131,0.28)',
    widget: WIDGETS.CHECK,
    unit: 'tracked',
    unitOne: 'tracked',
    defaultTarget: 1,
    defaultXp: 60,
    prompt: 'Log the spend, or declare a no-spend day.',
    extras: [
      { id: 'noSpend', label: 'No-spend day', kind: 'toggle' },
      { id: 'saved', label: 'Moved to savings', kind: 'currency', placeholder: '500' },
    ],
    bonuses: [
      { id: 'noSpend', label: 'No-spend day', xp: 35, field: 'noSpend', op: 'truthy' },
      { id: 'saved', label: 'Money saved', xp: 25, field: 'saved', op: 'gte', value: 1 },
    ],
  },
  {
    id: 'reading',
    name: 'Reading',
    short: 'RD',
    tagline: 'Minutes read',
    icon: 'book',
    accent: '#fdb022',
    glow: 'rgba(253,176,34,0.28)',
    widget: WIDGETS.MINUTES,
    unit: 'min',
    unitOne: 'min',
    defaultTarget: 20,
    defaultXp: 60,
    quickAdd: [10, 20, 30],
    prompt: 'Books count. Feeds do not.',
    extras: [
      { id: 'book', label: 'Book', kind: 'text', placeholder: 'Deep Work' },
      { id: 'pages', label: 'Pages', kind: 'number', placeholder: '18' },
    ],
    bonuses: [{ id: 'pages', label: '20+ pages', xp: 20, field: 'pages', op: 'gte', value: 20 }],
  },
]

export const PILLAR_IDS = PILLARS.map((p) => p.id)

export const PILLAR_MAP = PILLARS.reduce((acc, p) => {
  acc[p.id] = p
  return acc
}, {})

export function getPillar(id) {
  return PILLAR_MAP[id]
}

/** Expense categories for the Money screen. */
export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'bowl', accent: '#fdb022' },
  { id: 'transport', label: 'Transport', icon: 'car', accent: '#5b9cff' },
  { id: 'rent', label: 'Rent & bills', icon: 'home', accent: '#a78bfa' },
  { id: 'health', label: 'Health', icon: 'heart', accent: '#f97066' },
  { id: 'learning', label: 'Learning', icon: 'book', accent: '#4fd1c5' },
  { id: 'fun', label: 'Fun', icon: 'spark', accent: '#ff5c8a' },
  { id: 'shopping', label: 'Shopping', icon: 'bag', accent: '#e8eaed' },
  { id: 'other', label: 'Other', icon: 'dots', accent: '#8b8b98' },
]

export const CATEGORY_MAP = EXPENSE_CATEGORIES.reduce((acc, c) => {
  acc[c.id] = c
  return acc
}, {})

export const MOODS = [
  { value: 1, label: 'Rough', emoji: '😞', accent: '#f97066' },
  { value: 2, label: 'Low', emoji: '😕', accent: '#fdb022' },
  { value: 3, label: 'Okay', emoji: '😐', accent: '#8b8b98' },
  { value: 4, label: 'Good', emoji: '🙂', accent: '#5b9cff' },
  { value: 5, label: 'Great', emoji: '😄', accent: '#32d583' },
]
