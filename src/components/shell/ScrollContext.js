import { createContext, useContext } from 'react'

/** The shell's single scroll container, shared so headers can react to it. */
export const ScrollContext = createContext({ current: null })

export function useScrollContainer() {
  return useContext(ScrollContext)
}
