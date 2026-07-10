import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export default function StatCounter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (value === 0) return
    const duration = 900
    const start = performance.now()
    let raf = 0
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return (
    <motion.div
      ref={ref}
      className="stat-counter"
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="stat-counter-value">{display}{suffix}</div>
      <div className="stat-counter-label">{label}</div>
    </motion.div>
  )
}
