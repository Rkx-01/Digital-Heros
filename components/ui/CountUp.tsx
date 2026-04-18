"use client"

import * as React from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

interface CountUpProps {
  to: number
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

export function CountUp({
  to,
  duration = 2,
  delay = 0,
  prefix = "",
  suffix = "",
  decimals = 0
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  })

  React.useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        motionValue.set(to)
      }, delay * 1000)
    }
  }, [isInView, to, delay, motionValue])

  React.useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(latest)}${suffix}`
      }
    })
  }, [springValue, prefix, suffix, decimals])

  return <span ref={ref} />
}
