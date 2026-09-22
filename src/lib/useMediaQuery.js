import { useEffect, useState } from 'react'

/**
 * Breakpoints the layout actually branches on.
 *
 * Most of the responsive work is plain CSS. These exist for the two places
 * where the markup itself differs rather than the styling: the shell swaps a
 * bottom tab bar for a sidebar, and a sheet stops being a sheet.
 */
export const BREAKPOINTS = {
  /** A sheet becomes a centred dialog. */
  wide: '(min-width: 768px)',
  /** The phone shell becomes a desktop app with a sidebar. */
  desktop: '(min-width: 1024px)',
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export const useIsDesktop = () => useMediaQuery(BREAKPOINTS.desktop)
export const useIsWide = () => useMediaQuery(BREAKPOINTS.wide)
