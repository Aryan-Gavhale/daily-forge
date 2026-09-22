import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../components/shell/PageHeader'
import Section from '../components/ui/Section'
import Icon from '../components/ui/Icon'
import BudgetCard from '../components/money/BudgetCard'
import ExpenseList from '../components/money/ExpenseList'
import SpendChart, { CategoryBreakdown } from '../components/money/SpendChart'
import AddExpenseSheet from '../components/money/AddExpenseSheet'
import { spring, haptic } from '../lib/motion'
import { useStore } from '../store/useStore'
import { useTodayKey } from '../hooks/useForge'
import { useUI } from '../store/useUI'
import {
  dailySpendSeries,
  expensesByCategory,
  groupExpensesByDay,
  monthExpenses,
  noSpendDays,
  savedThisMonth,
  sumAmount,
} from '../lib/stats'
import { formatMonth, monthKey, parseKey } from '../lib/date'

export function Money() {
  const today = useTodayKey()
  const expenses = useStore((s) => s.expenses)
  const days = useStore((s) => s.days)
  const settings = useStore((s) => s.settings)
  const removeExpense = useStore((s) => s.removeExpense)
  const toast = useUI((s) => s.toast)
  const [adding, setAdding] = useState(false)

  const month = monthKey(today)
  const currency = settings.currency

  const thisMonth = useMemo(() => monthExpenses(expenses, month), [expenses, month])
  const spent = useMemo(() => sumAmount(thisMonth), [thisMonth])
  const groups = useMemo(() => groupExpensesByDay(thisMonth), [thisMonth])
  const categories = useMemo(() => expensesByCategory(thisMonth), [thisMonth])
  const series = useMemo(() => dailySpendSeries(thisMonth, month, today), [thisMonth, month, today])
  const saved = useMemo(() => savedThisMonth(days, month), [days, month])
  const noSpend = useMemo(() => noSpendDays(days, month), [days, month])

  const { daysInMonth, daysLeft } = useMemo(() => {
    const d = parseKey(today)
    const total = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    return { daysInMonth: total, daysLeft: total - d.getDate() }
  }, [today])

  const dailyBudget = settings.monthlyBudget / daysInMonth

  const handleDelete = async (id) => {
    await removeExpense(id)
    toast('Expense removed', { tone: 'neutral' })
  }

  return (
    <>
      <PageHeader
        eyebrow={formatMonth(month)}
        title="Money"
        trailing={
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            transition={spring}
            onClick={() => {
              haptic(12)
              setAdding(true)
            }}
            className="grid h-9 w-9 place-items-center rounded-full bg-good/15 text-good"
            aria-label="Add expense"
          >
            <Icon name="plus" size={19} strokeWidth={2.5} />
          </motion.button>
        }
      />

      {/* Column spans rather than nested columns, so the phone order is
          untouched and the desktop rows still add up to twelve. */}
      <div className="desk-cols">
        <div className="lg:col-span-5">
          <BudgetCard
            spent={spent}
            budget={settings.monthlyBudget}
            saved={saved}
            savingsGoal={settings.savingsGoal}
            noSpend={noSpend}
            currency={currency}
            daysLeft={daysLeft}
          />
        </div>

        {series.length > 0 && (
          <Section title="Pace" delay={0.03} className="lg:col-span-7">
            <SpendChart series={series} dailyBudget={dailyBudget} currency={currency} />
          </Section>
        )}

        {categories.length > 0 && (
          <Section title="Where it went" delay={0.05} className="lg:col-span-5">
            <CategoryBreakdown rows={categories} currency={currency} />
          </Section>
        )}

        <Section
          title="Transactions"
          subtitle={groups.length ? 'Swipe a row left to delete' : undefined}
          delay={0.07}
          className="lg:col-span-7"
        >
          <ExpenseList groups={groups} currency={currency} onDelete={handleDelete} />
        </Section>
      </div>

      <div className="h-4" />

      <AddExpenseSheet open={adding} onClose={() => setAdding(false)} date={today} />
    </>
  )
}

export default Money
