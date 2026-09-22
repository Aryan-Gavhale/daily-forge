import { useMemo, useRef, useState } from 'react'
import PageHeader from '../components/shell/PageHeader'
import Section from '../components/ui/Section'
import Sheet, { SheetButton } from '../components/ui/Sheet'
import { Segmented } from '../components/ui/Field'
import LevelCard from '../components/me/LevelCard'
import ReportCards from '../components/me/ReportCards'
import JournalHistory from '../components/me/JournalHistory'
import { GoalsSheet, PillarSettingsSheet } from '../components/me/SettingsSheets'
import { SettingsGroup, SettingsRow } from '../components/me/SettingsRow'
import PlanSetupSheet from '../components/plan/PlanSetupSheet'
import { useStore } from '../store/useStore'
import { useUI } from '../store/useUI'
import { useLevel, usePlan, useStreak, useTodayKey } from '../hooks/useForge'
import { weeklyReportCards } from '../lib/scoring'
import { journalEntries, personalBests } from '../lib/stats'
import { generateSeed } from '../lib/seed'
import { PILLARS } from '../data/pillars'
import { formatShort, todayKey } from '../lib/date'

const TABS = [
  { value: 'progress', label: 'Progress' },
  { value: 'journal', label: 'Journal' },
  { value: 'settings', label: 'Settings' },
]

export function Me() {
  const today = useTodayKey()
  const days = useStore((s) => s.days)
  const settings = useStore((s) => s.settings)
  const level = useLevel()
  const streak = useStreak()
  const plan = usePlan()
  const toast = useUI((s) => s.toast)

  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const resetEverything = useStore((s) => s.resetEverything)
  const loadSeed = useStore((s) => s.loadSeed)

  const [tab, setTab] = useState('progress')
  const [pillarSheet, setPillarSheet] = useState(false)
  const [goalsSheet, setGoalsSheet] = useState(false)
  const [planSheet, setPlanSheet] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const fileInput = useRef(null)

  const cards = useMemo(
    () => weeklyReportCards(days, settings, 10, today),
    [days, settings, today]
  )
  const bests = useMemo(() => personalBests(days, settings, today), [days, settings, today])
  const journal = useMemo(() => journalEntries(days), [days])

  const enabledCount = PILLARS.filter((p) => settings.pillars[p.id]?.enabled !== false).length

  const handleExport = () => {
    const payload = exportData()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `forge-backup-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Backup downloaded', {
      tone: 'success',
      detail: `${payload.counts.days} days, ${payload.counts.expenses} expenses`,
    })
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const parsed = await importData(text)
      toast('Backup restored', { tone: 'success', detail: `${parsed.days.length} days loaded` })
    } catch (err) {
      toast('Import failed', { tone: 'danger', detail: err.message })
    }
  }

  const handleSeed = async () => {
    const data = generateSeed(84)
    await loadSeed(data)
    setConfirm(null)
    toast('Demo history loaded', { tone: 'success', detail: `${data.days.length} days generated` })
  }

  const handleReset = async () => {
    await resetEverything()
    setConfirm(null)
    toast('Everything erased', { tone: 'neutral' })
  }

  return (
    <>
      <PageHeader
        eyebrow={settings.name ? `Forging since ${settings.startedAt}` : 'Your record'}
        title="Me"
      />

      <LevelCard level={level} streak={streak} bests={bests} name={settings.name} />

      <div className="pad-x pt-5 lg:max-w-md">
        <Segmented options={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === 'progress' && (
        <Section
          title="Weekly report cards"
          subtitle="Graded A+ to F per pillar"
          delay={0.02}
          className="lg:max-w-3xl"
        >
          <ReportCards cards={cards} />
        </Section>
      )}

      {tab === 'journal' && (
        <Section
          title="Journal"
          subtitle={journal.length ? `${journal.length} entries` : undefined}
          delay={0.02}
          className="lg:max-w-3xl"
        >
          <JournalHistory entries={journal} />
        </Section>
      )}

      {tab === 'settings' && (
        <div className="desk-cols">
          <Section title="Rules" delay={0.02} className="lg:col-span-6">
            <SettingsGroup>
              <SettingsRow
                icon="target"
                accent="#ff7a1a"
                label="Daily minimum"
                detail="Pillars needed to save the day"
                value={`${settings.dailyMinimum} of ${enabledCount}`}
                onClick={() => setGoalsSheet(true)}
              />
              <SettingsRow
                icon="layers"
                accent="#a78bfa"
                label="Pillar targets and XP"
                detail={`${enabledCount} pillars active`}
                onClick={() => setPillarSheet(true)}
              />
              <SettingsRow
                icon="map"
                accent={plan.phase.accent}
                label="The 16-week plan"
                detail={
                  settings.planEnabled === false
                    ? 'Hidden'
                    : `Week ${plan.currentWeek} · started ${formatShort(plan.startKey)}`
                }
                onClick={() => setPlanSheet(true)}
              />
              <SettingsRow
                icon="wallet"
                accent="#32d583"
                label="Budget and savings"
                value={`${settings.currency}${settings.monthlyBudget.toLocaleString('en-IN')}`}
                onClick={() => setGoalsSheet(true)}
              />
            </SettingsGroup>
          </Section>

          <Section
            title="Your data"
            subtitle="Everything lives on this device"
            delay={0.04}
            className="lg:col-span-6"
          >
            <SettingsGroup>
              <SettingsRow
                icon="download"
                accent="#5b9cff"
                label="Export backup"
                detail="Download a JSON file"
                onClick={handleExport}
                chevron={false}
              />
              <SettingsRow
                icon="upload"
                accent="#4fd1c5"
                label="Import backup"
                detail="Replaces everything currently stored"
                onClick={() => fileInput.current?.click()}
                chevron={false}
              />
              <SettingsRow
                icon="bolt"
                accent="#fdb022"
                label="Load demo history"
                detail="84 generated days, for trying the charts"
                onClick={() => setConfirm('seed')}
                chevron={false}
              />
              <SettingsRow
                icon="trash"
                label="Erase everything"
                detail="Cannot be undone"
                danger
                onClick={() => setConfirm('reset')}
                chevron={false}
              />
            </SettingsGroup>
          </Section>

          <Section title="About" delay={0.06} className="lg:col-span-12">
            <div className="rounded-card border border-hair bg-ink-800/50 p-4 backdrop-blur-xl">
              <p className="text-[13px] leading-relaxed text-white/45">
                Forge stores every entry in this browser&rsquo;s local database. Nothing is sent
                anywhere, there is no account, and it works offline once installed.
              </p>
              <p className="mt-2.5 text-[12px] leading-relaxed text-white/30">
                To move your history to another device, export a backup here and import it there.
              </p>
            </div>
          </Section>
        </div>
      )}

      <div className="h-4" />

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />

      <PillarSettingsSheet open={pillarSheet} onClose={() => setPillarSheet(false)} />
      <GoalsSheet open={goalsSheet} onClose={() => setGoalsSheet(false)} />
      <PlanSetupSheet open={planSheet} onClose={() => setPlanSheet(false)} />

      <Sheet
        open={confirm === 'seed'}
        onClose={() => setConfirm(null)}
        title="Load demo history?"
        subtitle="This replaces your logged days and expenses with 84 generated ones. Your targets and goals are kept."
        footer={
          <div className="space-y-2">
            <SheetButton onClick={handleSeed}>Load demo history</SheetButton>
            <SheetButton tone="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </SheetButton>
          </div>
        }
      >
        <p className="pb-2 text-center text-[13px] leading-relaxed text-white/40">
          Export a backup first if you have real data you want to keep.
        </p>
      </Sheet>

      <Sheet
        open={confirm === 'reset'}
        onClose={() => setConfirm(null)}
        title="Erase everything?"
        subtitle="Every logged day, expense and setting is deleted from this device."
        accent="#f97066"
        footer={
          <div className="space-y-2">
            <SheetButton tone="danger" onClick={handleReset}>
              Erase everything
            </SheetButton>
            <SheetButton tone="ghost" onClick={() => setConfirm(null)}>
              Keep my data
            </SheetButton>
          </div>
        }
      >
        <p className="pb-2 text-center text-[13px] leading-relaxed text-white/40">
          There is no undo and no cloud copy. Export a backup first.
        </p>
      </Sheet>
    </>
  )
}

export default Me
