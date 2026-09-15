import { useEffect, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { useScrollContainer } from './ScrollContext'

/**
 * iOS large title that collapses into a blurred compact bar as you scroll.
 *
 * The compact bar mounts only once the large title has started leaving, so an
 * unscrolled page has nothing floating over it.
 */
export function PageHeader({ eyebrow, title, trailing, children }) {
  const container = useScrollContainer()
  const [ready, setReady] = useState(false)
  const [compact, setCompact] = useState(false)

  // useScroll needs the ref populated, which happens after the shell mounts.
  useEffect(() => {
    if (container?.current) setReady(true)
  }, [container])

  const { scrollY } = useScroll({ container: ready ? container : undefined })

  const titleOpacity = useTransform(scrollY, [0, 46], [1, 0])
  const titleY = useTransform(scrollY, [0, 46], [0, -10])
  const titleScale = useTransform(scrollY, [0, 46], [1, 0.94])

  useMotionValueEvent(scrollY, 'change', (v) => {
    setCompact(v > 34)
  })

  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-20"
        initial={false}
        animate={{ opacity: compact ? 1 : 0 }}
        transition={{ duration: 0.18 }}
      >
        <div className="glass border-b border-hair pt-safe">
          <div className="flex h-11 items-center justify-center px-4">
            <span className="text-[15px] font-semibold tracking-tight text-white">{title}</span>
          </div>
        </div>
      </motion.div>

      <div className="px-5 pt-safe">
        <motion.div
          style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}
          className="origin-left pt-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {eyebrow && <p className="label-eyebrow mb-1.5">{eyebrow}</p>}
              <h1 className="text-[30px] font-bold leading-[1.1] tracking-tightest text-white">
                {title}
              </h1>
            </div>
            {trailing && <div className="shrink-0 pt-1">{trailing}</div>}
          </div>
          {children}
        </motion.div>
      </div>
    </>
  )
}

export default PageHeader
