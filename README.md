# Forge — Daily Growth Tracker

A local-first, installable PWA that tracks eight daily growth pillars with a strict
XP and streak system, plus a beat-your-past-self comparison layer. Built mobile-first
so it looks and moves like a native phone app.

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

## Getting it onto your phone

Both devices need to be on the same network.

1. `npm run build && npm run preview` — Vite prints a `Network:` URL
2. Open that URL on your phone
3. Chrome shows an install banner; on iOS use **Share → Add to Home Screen**

Data is per-device. To move your history, export a backup on one device from
**Me → Settings → Export backup** and import the file on the other.

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
  lib/db.js             IndexedDB schema, export/import
  lib/date.js           local day keys, week boundaries, formatting
  lib/scoring.js        XP, day verdict, streaks, weekly grades
  lib/stats.js          rolling averages, week-over-week, personal bests, money
  lib/seed.js           demo history generator
  lib/motion.js         shared springs, easings, haptics
  store/useStore.js     zustand, IDB-hydrated, write-through
  store/useUI.js        sheet stack and toast queue
  components/shell/     AppShell, TabBar, PageHeader, install and update prompts
  components/ui/        Sheet, Ring, Counter, Toast, Burst, Field, Icon, Section
  components/pillars/   PillarCard, LogSheet, QuickLogSheet
  components/today|stats|money|me/
  pages/                Today, Stats, Money, Me
```

`lib/scoring.js` and `lib/stats.js` are pure functions with no React or storage
dependencies, so the rules can be reasoned about on their own.

## Notes

- Weeks run Monday to Sunday.
- Days are keyed by local calendar date, never UTC, so logging at 11pm lands on the
  day you actually lived.
- The whole dataset stays in memory; it is a few hundred KB even after years, which
  keeps every statistic a synchronous pure function.
- Entries carry a `source` field. It is always `manual` today, but adding API sync
  later would not need a schema migration.
