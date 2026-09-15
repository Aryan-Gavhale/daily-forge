import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sheet, { SheetButton } from '../ui/Sheet'
import Icon from '../ui/Icon'
import { FieldLabel, TextField } from '../ui/Field'
import { spring, haptic } from '../../lib/motion'
import { EXPENSE_CATEGORIES } from '../../data/pillars'
import { useStore } from '../../store/useStore'
import { useUI } from '../../store/useUI'
import { formatRelativeDay } from '../../lib/date'

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del']

/**
 * Amount-first entry with a custom keypad. The OS numeric keyboard covers half
 * the sheet on a phone and hides the category picker, so we draw our own.
 */
export function AddExpenseSheet({ open, onClose, date }) {
  const currency = useStore((s) => s.settings.currency)
  const addExpense = useStore((s) => s.addExpense)
  const toast = useUI((s) => s.toast)

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setAmount('')
      setCategory('food')
      setNote('')
    }
  }, [open])

  const press = (key) => {
    haptic(9)
    setAmount((prev) => {
      if (key === 'del') return prev.slice(0, -1)
      if (key === '.') return prev.includes('.') ? prev : prev === '' ? '0.' : `${prev}.`
      if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev
      if (prev === '0') return key
      if (prev.replace('.', '').length >= 8) return prev
      return prev + key
    })
  }

  const value = Number(amount) || 0
  const active = EXPENSE_CATEGORIES.find((c) => c.id === category)

  const save = async () => {
    if (value <= 0) return
    await addExpense({ amount: value, category, note, date })
    toast(`${currency}${value.toLocaleString('en-IN')} logged`, {
      tone: 'success',
      detail: active?.label,
    })
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add expense"
      subtitle={formatRelativeDay(date)}
      accent={active?.accent ?? '#32d583'}
      footer={
        <SheetButton onClick={save} disabled={value <= 0} accent={active?.accent}>
          {value > 0 ? `Log ${currency}${value.toLocaleString('en-IN')}` : 'Enter an amount'}
        </SheetButton>
      }
    >
      <div className="space-y-4 pb-2">
        <div className="flex items-baseline justify-center gap-1 py-2">
          <span className="text-[26px] font-medium text-white/30">{currency}</span>
          <motion.span
            key={amount}
            initial={{ scale: 0.96, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={spring}
            className="tnum text-[46px] font-bold leading-none tracking-tightest"
            style={{ color: value > 0 ? (active?.accent ?? '#fff') : 'rgba(255,255,255,0.2)' }}
          >
            {amount === '' ? '0' : amount}
          </motion.span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {EXPENSE_CATEGORIES.map((c) => {
            const on = c.id === category
            return (
              <motion.button
                key={c.id}
                type="button"
                whileTap={{ scale: 0.92 }}
                animate={{ scale: on ? 1.03 : 1 }}
                transition={spring}
                onClick={() => {
                  haptic(10)
                  setCategory(c.id)
                }}
                className="flex flex-col items-center gap-1.5 rounded-2xl py-2.5 hairline"
                style={{
                  background: on ? `${c.accent}1f` : 'rgba(255,255,255,0.035)',
                  borderColor: on ? `${c.accent}55` : undefined,
                }}
              >
                <span style={{ color: on ? c.accent : 'rgba(255,255,255,0.45)' }}>
                  <Icon name={c.icon} size={17} strokeWidth={1.9} />
                </span>
                <span
                  className="text-[10px] font-medium leading-none"
                  style={{ color: on ? c.accent : 'rgba(255,255,255,0.35)' }}
                >
                  {c.label}
                </span>
              </motion.button>
            )
          })}
        </div>

        <div>
          <FieldLabel>Note</FieldLabel>
          <TextField value={note} onChange={setNote} placeholder="Optional" maxLength={60} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {KEYPAD.map((k) => (
            <motion.button
              key={k}
              type="button"
              whileTap={{ scale: 0.93, backgroundColor: 'rgba(255,255,255,0.11)' }}
              transition={{ duration: 0.09 }}
              onClick={() => press(k)}
              className="grid h-[52px] place-items-center rounded-2xl bg-white/[0.05] text-[20px] font-semibold text-white hairline"
            >
              {k === 'del' ? <Icon name="chevronLeft" size={19} strokeWidth={2.3} /> : k}
            </motion.button>
          ))}
        </div>
      </div>
    </Sheet>
  )
}

export default AddExpenseSheet
