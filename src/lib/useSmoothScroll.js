import { useEffect } from 'react'
import Lenis from 'lenis'
import { prefersReducedMotion } from './motion'

/**
 * Lenis smoothing for the scroll container, desktop pointers only.
 * Touch devices already have momentum scrolling and Lenis fights it, so we
 * leave phones on the native implementation.
 */
export function useSmoothScroll(ref, deps = []) {
  useEffect(() => {
    const wrapper = ref.current
    if (!wrapper) return
    if (prefersReducedMotion()) return
    if (!window.matchMedia?.('(pointer: fine)').matches) return

    const content = wrapper.firstElementChild
    if (!content) return

    const lenis = new Lenis({
      wrapper,
      content,
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: false,
    })

    let frame = 0
    const raf = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
