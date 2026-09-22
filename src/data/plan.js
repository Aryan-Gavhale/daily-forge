/**
 * The 16-week plan.
 *
 * This is a fixed curriculum, not a habit tracker: the pillars answer "did I
 * show up today", the plan answers "am I on schedule to be interview-ready".
 * It is deliberately separate from `pillars.js` so changing one never disturbs
 * the other.
 *
 * Three kinds of task:
 *
 *   auto   read straight off the pillar log, so a week fills itself in as you
 *          log Codeforces and System Design
 *   count  a number you type, for things the pillars cannot see
 *   check  done or not done
 */

export const PLAN_LENGTH = 16

export const PLAN_META = {
  name: 'The 30 LPA run',
  goal: '30 LPA at a product company',
  from: 'Amdocs, 1y3m',
  blurb:
    'Interview-format DSA, one deep project, LLD, and applications going out in month three. Everything else is out of scope on purpose.',
}

export const PLAN_TRACKS = [
  {
    id: 'dsa',
    name: 'DSA',
    icon: 'code',
    accent: '#5b9cff',
    blurb: 'CF for thinking, contests for nerves, NeetCode for the past paper',
  },
  {
    id: 'lld',
    name: 'Design',
    icon: 'layers',
    accent: '#a78bfa',
    blurb: 'LLD you can code, HLD you can draw',
  },
  {
    id: 'project',
    name: 'Redis',
    icon: 'bolt',
    accent: '#fdb022',
    blurb: 'One project made interview-proof, then frozen',
  },
  {
    id: 'career',
    name: 'Career',
    icon: 'target',
    accent: '#32d583',
    blurb: 'Resume, STAR stories, referrals, mocks, applications',
  },
]

export const TRACK_MAP = PLAN_TRACKS.reduce((acc, t) => {
  acc[t.id] = t
  return acc
}, {})

/**
 * Auto metrics, derived from pillar entries. Keeping the mapping here means the
 * plan reads the pillar log rather than asking you to log the same work twice.
 */
export const PLAN_METRICS = {
  cfProblems: { label: 'CF / TLE problems', pillar: 'codeforces', unit: 'problems' },
  contests: { label: 'Contests played', pillar: 'codeforces', unit: 'contests' },
  designMinutes: { label: 'Design minutes', pillar: 'system', unit: 'min' },
}

export const PLAN_PHASES = [
  {
    id: 'p1',
    month: 1,
    from: 1,
    to: 4,
    name: 'Reset',
    tagline: 'CF thinking, contest habit, an honest resume',
    accent: '#5b9cff',
  },
  {
    id: 'p2',
    month: 2,
    from: 5,
    to: 8,
    name: 'Past papers',
    tagline: 'NeetCode as the main block, LLD starts, Redis frozen',
    accent: '#a78bfa',
  },
  {
    id: 'p3',
    month: 3,
    from: 9,
    to: 12,
    name: 'Apply and mock',
    tagline: 'Applications out, one mock a week, HLD kept light',
    accent: '#fdb022',
  },
  {
    id: 'p4',
    month: 4,
    from: 13,
    to: 16,
    name: 'Loops',
    tagline: 'Interview simulation and overlapping loops',
    accent: '#32d583',
  },
]

export function phaseForWeek(n) {
  return PLAN_PHASES.find((p) => n >= p.from && n <= p.to) ?? PLAN_PHASES[0]
}

/* ------------------------------------------------------------ task builders */

const cf = (n) => ({
  id: 'cf',
  track: 'dsa',
  kind: 'auto',
  metric: 'cfProblems',
  target: n,
  unit: 'problems',
  label: `${n} CF or TLE ${n === 1 ? 'problem' : 'problems'}`,
  detail: 'Struggle 25 to 40 minutes, then one hint. Editorial last.',
})

const contest = () => ({
  id: 'contest',
  track: 'dsa',
  kind: 'auto',
  metric: 'contests',
  target: 1,
  unit: 'contest',
  label: 'One contest',
  detail: 'Live or virtual Div 2. Two hours of generating, not recognising.',
})

const designMinutes = (n) => ({
  id: 'design',
  track: 'lld',
  kind: 'auto',
  metric: 'designMinutes',
  target: n,
  unit: 'min',
  label: `${n} design minutes`,
  detail: 'Counted from the System Design pillar.',
})

const neetcode = (n) => ({
  id: 'nc',
  track: 'dsa',
  kind: 'count',
  target: n,
  unit: 'problems',
  label: `${n} NeetCode problems`,
  detail: 'Tags hidden. Re-solve each one from blank two to four days later.',
})

const timed = (n) => ({
  id: 'timed',
  track: 'dsa',
  kind: 'count',
  target: n,
  unit: 'problems',
  label: `${n} timed mediums`,
  detail: '45 minutes, spoken out loud, typed into a plain doc.',
})

const upsolve = () => ({
  id: 'upsolve',
  track: 'dsa',
  kind: 'check',
  label: 'Upsolve one near-miss',
  detail: 'Exactly one problem you almost had. Hints before the editorial.',
})

const recode = (n) => ({
  id: 'recode',
  track: 'dsa',
  kind: 'count',
  target: n,
  unit: 'problems',
  label: `Recode ${n} old problems`,
  detail: 'From a blank page. Anything you fail goes on the retry list.',
})

const lld = (a, b) => ({
  id: 'lld',
  track: 'lld',
  kind: 'count',
  target: 2,
  unit: 'designs',
  label: `LLD: ${a}, ${b}`,
  detail: 'Entities, APIs, classes, one concurrency note, then code the core.',
})

const mocks = (n) => ({
  id: 'mock',
  track: 'career',
  kind: 'count',
  target: n,
  unit: 'mocks',
  label: n === 1 ? 'One mock interview' : `${n} mock interviews`,
  detail: 'Peer or paid. Record it and fix exactly one behaviour.',
})

const applications = (n) => ({
  id: 'apply',
  track: 'career',
  kind: 'count',
  target: n,
  unit: 'sent',
  label: `${n} applications`,
  detail: 'Referrals first, then cold. Mix stretch with high-probability.',
})

const star = (n) => ({
  id: 'star',
  track: 'career',
  kind: 'count',
  target: n,
  unit: 'stories',
  label: `Write ${n} STAR ${n === 1 ? 'story' : 'stories'}`,
  detail: 'Conflict, failure, production bug, tradeoff, impact.',
})

const task = (id, track, label, detail) => ({ id, track, kind: 'check', label, detail })

/* -------------------------------------------------------------------- weeks */

export const PLAN_WEEKS = [
  {
    n: 1,
    title: 'Fix the protocol',
    headline: 'Before more volume, stop reading solutions at minute ten.',
    tasks: [
      cf(4),
      contest(),
      neetcode(2),
      upsolve(),
      task(
        'resume',
        'career',
        'Resume v1, one page',
        'Amdocs first, three to five bullets with real numbers. No problem counts.'
      ),
      task(
        'redis-scope',
        'project',
        'Redis: write down what is built and what is missing',
        'A scope note, not new commands.'
      ),
    ],
  },
  {
    n: 2,
    title: 'Depth over commands',
    headline: 'One real subsystem in Redis beats ten more verbs.',
    tasks: [
      cf(4),
      contest(),
      neetcode(2),
      upsolve(),
      star(2),
      task(
        'redis-ttl',
        'project',
        'Redis: TTL or a persistence story',
        'Pick RDB snapshot or AOF and know exactly what a crash loses.'
      ),
    ],
  },
  {
    n: 3,
    title: 'Prove it stuck',
    headline: 'Recoding from blank is the only test that counts.',
    tasks: [cf(4), contest(), neetcode(2), upsolve(), star(2), recode(8)],
  },
  {
    n: 4,
    title: 'Month one gate',
    headline: 'Habit, honesty and a resume someone has torn apart.',
    tasks: [
      cf(4),
      contest(),
      neetcode(2),
      upsolve(),
      star(1),
      task(
        'resume2',
        'career',
        'Resume v2 after feedback',
        'Get one senior engineer to attack it, then rewrite.'
      ),
    ],
  },
  {
    n: 5,
    title: 'Past papers begin',
    headline: 'NeetCode becomes the main diet. Keep exactly one contest.',
    tasks: [neetcode(5), contest(), cf(1), upsolve(), designMinutes(120), lld('LRU cache', 'rate limiter')],
  },
  {
    n: 6,
    title: 'Designs you can code',
    headline: 'Talking through a design is not the same as writing it.',
    tasks: [
      neetcode(5),
      contest(),
      cf(1),
      upsolve(),
      designMinutes(120),
      lld('parking lot', 'Splitwise-lite'),
    ],
  },
  {
    n: 7,
    title: 'Concurrency and the README',
    headline: 'Redis becomes a thing you can hand someone.',
    tasks: [
      neetcode(5),
      contest(),
      cf(1),
      upsolve(),
      designMinutes(120),
      lld('ticket booking', 'notification service'),
      task(
        'redis-readme',
        'project',
        'Redis README, one diagram, two tests',
        'Architecture, the features you deliberately skipped, how to run it.'
      ),
    ],
  },
  {
    n: 8,
    title: 'Freeze and aim',
    headline: 'Stop building. Start pointing at people.',
    tasks: [
      neetcode(5),
      contest(),
      upsolve(),
      designMinutes(90),
      recode(15),
      task(
        'redis-freeze',
        'project',
        'Freeze Redis',
        'It is an interview asset now, not a hobby. Kafka and BitTorrent stay links.'
      ),
      task('resume-freeze', 'career', 'Freeze the resume', 'Version it and stop editing.'),
      task(
        'referrals',
        'career',
        'Build the referral list',
        'Amdocs alumni, LinkedIn, college. Names and companies, not just companies.'
      ),
    ],
  },
  {
    n: 9,
    title: 'Applications out',
    headline: 'You do not wait until you feel ready. Ready is the loop.',
    tasks: [neetcode(4), contest(), upsolve(), timed(1), mocks(1), applications(20)],
  },
  {
    n: 10,
    title: 'Same designs, less time',
    headline: 'Six designs done fast beat twenty designs read.',
    tasks: [
      neetcode(4),
      contest(),
      upsolve(),
      timed(1),
      mocks(1),
      applications(10),
      task(
        'lld-redo',
        'lld',
        'Redo two LLDs under 40 minutes',
        'The same six. No new catalogue.'
      ),
    ],
  },
  {
    n: 11,
    title: 'HLD, kept small',
    headline: 'Two one-pagers, not a course.',
    tasks: [
      timed(3),
      contest(),
      upsolve(),
      mocks(1),
      applications(10),
      task(
        'hld-url',
        'lld',
        'HLD one-pager: URL shortener',
        'Capacity, APIs, data model, the bottleneck.'
      ),
    ],
  },
  {
    n: 12,
    title: 'Month three gate',
    headline: 'Screens should be happening by now.',
    tasks: [
      timed(3),
      contest(),
      upsolve(),
      mocks(1),
      applications(10),
      task(
        'hld-rate',
        'lld',
        'HLD one-pager: rate limiter at scale',
        'Enough for Amazon and Microsoft design-lite.',
      ),
    ],
  },
  {
    n: 13,
    title: 'Simulation',
    headline: 'Every session now looks like the real thing.',
    tasks: [
      timed(3),
      contest(),
      mocks(1),
      applications(8),
      task('lld-drill', 'lld', 'One LLD drill under 40 minutes', 'Clock on, talk through it.'),
    ],
  },
  {
    n: 14,
    title: 'Say it out loud',
    headline: 'A right answer delivered silently still fails the round.',
    tasks: [
      timed(3),
      contest(),
      mocks(1),
      applications(8),
      task(
        'star-run',
        'career',
        'Run all five STAR stories out loud',
        'Time them. Ninety seconds each, no rambling.'
      ),
    ],
  },
  {
    n: 15,
    title: 'Your own work',
    headline: 'They will ask why, not what.',
    tasks: [
      timed(3),
      contest(),
      mocks(1),
      applications(8),
      task('redis-revisit', 'project', 'Re-read your own Redis code', 'Defend the tradeoffs again.'),
      task(
        'amdocs',
        'career',
        'Whiteboard the real Amdocs system',
        'Inputs, outputs, your module, what happens on failure.'
      ),
    ],
  },
  {
    n: 16,
    title: 'Loops only',
    headline: 'Week 16 is performance, not curriculum.',
    tasks: [
      timed(2),
      mocks(1),
      task('light', 'dsa', 'Light DSA only, no new topics', 'Nothing new lands in a week.'),
      task('sleep', 'career', 'Sleep and logistics', 'Interviews are a performance. Turn up rested.'),
    ],
  },
]

export const WEEK_MAP = PLAN_WEEKS.reduce((acc, w) => {
  acc[w.n] = w
  return acc
}, {})

/* -------------------------------------------------------------------- gates */

export const PLAN_GATES = [
  {
    week: 4,
    title: 'Month one gate',
    checks: [
      { id: 'habit', label: 'A contest every week is now a calendar habit' },
      { id: 'protocol', label: 'No editorial opened before the 25 minute mark' },
      { id: 'resume', label: 'Resume exists and someone senior has torn it apart' },
      { id: 'recode', label: 'Last week’s problems recode from memory' },
    ],
    warning:
      'Still opening solutions at minute ten? Do not start NeetCode volume. Fix the protocol, or month two repeats your old 250.',
  },
  {
    week: 8,
    title: 'Month two gate',
    checks: [
      { id: 'nc40', label: 'Around 40 NeetCode problems you can regenerate' },
      { id: 'redis', label: 'Redis defendable in 15 minutes without notes' },
      { id: 'lld4', label: 'At least four LLDs actually coded' },
      { id: 'star5', label: 'Five STAR stories written and rehearsed' },
    ],
    warning:
      'Problems you watched do not count here. If you cannot regenerate them, cut volume and raise the re-solve rate.',
  },
  {
    week: 12,
    title: 'Month three gate',
    checks: [
      { id: 'nc70', label: 'Around 70 NeetCode problems owned' },
      { id: 'screens', label: 'Applications out and screens happening' },
      { id: 'mocks', label: 'Four mocks done, with notes acted on' },
      { id: 'talk', label: 'A medium plus talking no longer freezes you' },
    ],
    warning:
      'No screens by week 12 usually means the resume, not the coding. Go back to the Amdocs bullets.',
  },
  {
    week: 16,
    title: 'Final gate',
    checks: [
      { id: 'loops', label: 'Overlapping loops running' },
      { id: 'diagnosis', label: 'Or you can name the failure mode: DSA, LLD or story' },
    ],
    warning:
      'Ready is not the same as offered. The offer lands in month three to six of interviewing, which starts inside this window.',
  },
]

export function gateForWeek(n) {
  return PLAN_GATES.find((g) => g.week === n) ?? null
}

/* ------------------------------------------------------------ rules / scope */

export const PLAN_RULES = [
  'No editorial for 25 to 40 minutes. Then one hint. Editorial last. Re-solve in two to four days.',
  'One contest every week from week one. Live or virtual, rating is a side effect.',
  'Five to seven serious problems a week plus the contest. Not fifteen.',
  'Hide the tags on interview problems. A tag is a spoiler.',
  'Amdocs stays above side projects on the resume.',
  'Redis is the only project. Kafka and BitTorrent are GitHub links.',
  'Apply from week nine, not when you feel ready.',
  'Bad week at work: the contest plus three problems. Never zero.',
]

export const PLAN_OUT_OF_SCOPE = [
  'Finishing all 150 NeetCode problems',
  'Chasing a Codeforces rating after week four',
  'Kafka and BitTorrent feature work',
  'A full system design course',
  'A fourth from-scratch project',
]
