import { create } from 'zustand'
import { uid } from '../lib/date'

/**
 * Transient interface state: how many sheets are stacked, and the toast queue.
 * Deliberately separate from useStore so opening a sheet never re-renders
 * anything that reads persisted data.
 */
export const useUI = create((set, get) => ({
  sheetCount: 0,
  toasts: [],

  pushSheet() {
    set({ sheetCount: get().sheetCount + 1 })
  },

  popSheet() {
    set({ sheetCount: Math.max(0, get().sheetCount - 1) })
  },

  toast(message, options = {}) {
    const entry = {
      id: uid(),
      message,
      tone: options.tone ?? 'neutral',
      icon: options.icon,
      detail: options.detail,
      duration: options.duration ?? 2600,
    }
    set({ toasts: [...get().toasts, entry] })
    setTimeout(() => get().dismissToast(entry.id), entry.duration)
    return entry.id
  },

  dismissToast(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },
}))

export const toast = (message, options) => useUI.getState().toast(message, options)
