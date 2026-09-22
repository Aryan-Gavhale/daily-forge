# Forge — Daily Growth Tracker

A local-first, installable PWA with two halves: eight daily growth pillars scored on a
strict XP and streak system, and a fixed 16-week plan that says what this week is
supposed to produce. The pillars answer *did I show up today*; the plan answers *am I
still on schedule*.

It is designed at phone width and it stays a phone on a handset. On a desktop window it
becomes a desktop app — a permanent left rail and pages that spread into columns rather
than scrolling as one long strip.

No backend, no accounts, no external APIs. Everything lives in this browser's
IndexedDB, with JSON export and import for backup.

## Running it

```bash
npm install
npm run dev          # http://localhost:5178
```

```bash
npm run build        # production bundle in dist/
npm run preview      # serve dist/ (needed to test the service worker)
npm run icons        # regenerate PWA icons from public/icons/icon.svg
```

The service worker only registers in a production build, so PWA install and offline
behaviour must be tested through `npm run preview`, not `npm run dev`.

## Installing it on a phone

Live at **https://aryan-gavhale.github.io/daily-forge/**

Open that on the phone and install it:

- **iOS** — open in Safari, then **Share → Add to Home Screen**
- **Android** — Chrome offers an install banner, or **⋮ → Install app**

Once installed it launches without browser chrome and runs fully offline; the
service worker precaches the whole bundle on first visit.

A service worker only registers on a secure context, so installing from
`http://<lan-ip>:5183` will *not* give you offline support. Use the HTTPS URL
above, not a LAN address.

Data is per-origin and per-device. To move history between devices, use
**Me → Settings → Export backup** and import the file on the other one. Deleting
the home-screen icon deletes the database with it, so export occasionally.

A backup written before the plan existed still imports; it simply has no plan records.

### Deploying

```bash
npm run deploy      # builds with the /daily-forge/ base, pushes to gh-pages
```

GitHub Pages serves a project site from `/<repo>/` rather than the domain root,
so the asset URLs, manifest `scope`/`start_url` and the service worker's
navigation fallback all need that prefix. `BASE_PATH` handles it:

```bash
npm run build                               # root-served host
BASE_PATH=/daily-forge/ npm run build       # sub-path host
```

## The eight pillars

Each has one primary metric that decides whether it counts as done, plus optional
extras that award flat bonus XP but never gate completion.

| Pillar | Primary metric | Default target | XP |
| --- | --- | --- | --- |
| Codeforces | Problems solved | 2 | 70 |
| System Design | Focused minutes | 30 | 70 |
| Gym | Trained today | 1 | 80 |
| Chess | Puzzles solved | 5 | 50 |
| Instagram | Pieces shipped | 1 | 80 |
| Mind | Meditation minutes | 10 | 60 |
| Money | Spend tracked | 1 | 60 |
| Reading | Minutes read | 20 | 60 |

Every target and XP weight is editable in **Me → Settings → Pillar targets and XP**,
and any pillar can be switched off entirely.

## The 16-week plan

A separate screen from the pillars, and a separate store, so editing one never disturbs
the other. Sixteen weeks in four months:

| Month | Weeks | Phase | What it is for |
| --- | --- | --- | --- |
| 1 | 1–4 | Reset | CF thinking, the contest habit, an honest resume |
| 2 | 5–8 | Past papers | NeetCode as the main block, LLD starts, Redis frozen |
| 3 | 9–12 | Apply and mock | Applications out, one mock a week, HLD kept light |
| 4 | 13–16 | Loops | Interview simulation and overlapping loops |

Each week is a handful of tasks across four tracks — DSA, design, the Redis project, and
career. A task is one of three kinds:

- **auto** — read straight off the pillar log, so logging a Codeforces session fills the
  week in. Codeforces problems, contests played and System Design minutes work this way,
  and the row has no control at all: giving it a tick box would invite double counting.
- **count** — a number you type, for work the pillars cannot see: NeetCode problems, LLDs
  coded, mocks, applications, STAR stories.
- **check** — done or not done.

Weeks in the future are readable but not tickable. Month-end **gates** are deliberately
subjective checks ("can you regenerate these problems", not "have you done 40"), each with
the instruction for when the answer is no.

The hero card draws a marker on the progress bar showing where the calendar is, because
40% done in week 12 is not "40% done", it is behind.

Week 1 always starts on a Monday, so plan weeks line up with the weekly report cards.
Change the start date, hide the plan, or clear its progress in **Me → Settings → The
16-week plan**. Moving the start date re-dates the weeks and keeps what you ticked.

## How scoring works

**XP** — partial credit up to the target, then bonus XP for overshooting at a reduced
rate (35% per extra target-unit, capped at +50%). Extra fields add flat bonuses.

**Day verdict** — clearing fewer than the daily minimum (4 of 8 by default) marks the
day **Failed** in red. Above that: Survived, Solid, Forged, and Perfect for all eight.

**Streak** — consecutive non-failed days. Today is treated as still open, so an
unfinished day shows as *at risk* rather than breaking the streak early. When a streak
does die, the app says how long it was so you know what you lost.

**Level** — cumulative XP against a rising curve. Level 10 is roughly two months of
consistent work, level 20 about nine.

**Weekly report card** — each pillar graded A+ to F on weekly completion, plus an
overall grade. The current week is graded live and labelled as such.

**Versus past self** — today against the same weekday last week, this week against
last week trimmed to the same elapsed days, 30-day rolling averages, and personal
bests framed as numbers still to beat.

## Trying it without waiting three months

**Me → Settings → Load demo history** generates 84 days of plausible data so the
charts, heatmap, report cards, streak breaks and records all have something to show.
It replaces logged days and expenses but keeps your targets and goals.

## Layout

```
src/
  data/pillars.js       the 8 definitions, widget kinds, targets, bonus rules
  data/levels.js        XP curve, ranks, grade thresholds, day verdicts
  data/plan.js          the 16 weeks, tracks, gates, rules, scope cuts
  lib/db.js             IndexedDB schema, export/import
  lib/date.js           local day keys, week boundaries, formatting
  lib/scoring.js        XP, day verdict, streaks, weekly grades
  lib/stats.js          rolling averages, week-over-week, personal bests, money
  lib/plan.js           plan week maths, auto metrics, gates, pace
  lib/seed.js           demo history generator
  lib/motion.js         shared springs, easings, haptics
  lib/useMediaQuery.js  the two breakpoints the markup branches on
  store/useStore.js     zustand, IDB-hydrated, write-through
  store/useUI.js        sheet stack and toast queue
  components/shell/     AppShell, TabBar, SideNav, PageHeader, install and update prompts
  components/ui/        Sheet, Ring, Counter, Toast, Burst, Field, Icon, Section
  components/pillars/   PillarCard, LogSheet, QuickLogSheet
  components/plan/      PlanHero, WeekBoard, WeekTimeline, GateCard, PlanStrip
  components/today|stats|money|me/
  pages/                Today, Plan, Stats, Money, Me
```

`lib/scoring.js`, `lib/stats.js` and `lib/plan.js` are pure functions with no React or
storage dependencies, so the rules can be reasoned about on their own.

## Responsive layout

Two shells, one app. Under 1024px it is a phone — full-bleed on a handset, a centred
device frame on a tablet-sized window so the layout is never stretched past the width it
was designed at. At 1024px and up the bezel is dropped for a sidebar, a wider gutter, and
multi-column pages. Sheets stop being sheets at 768px and become centred dialogs.

A page is still written once, as a single stack of blocks:

```css
--pad-x            the gutter every top-level block carries, via .pad-x
.desk-cols         turns part of that stack into a 12-column grid on a large
                   screen and zeroes the gutter its children were carrying,
                   because the grid now supplies it
```

So `<Section className="lg:col-span-7">` is the whole diff between a phone row and a
desktop column, and the phone ordering of a page is never rearranged to get one.

## Notes

- Weeks run Monday to Sunday.
- Days are keyed by local calendar date, never UTC, so logging at 11pm lands on the
  day you actually lived.
- The whole dataset stays in memory; it is a few hundred KB even after years, which
  keeps every statistic a synchronous pure function.
- Entries carry a `source` field. It is always `manual` today, but adding API sync
  later would not need a schema migration.
