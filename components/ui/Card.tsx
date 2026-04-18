"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLMotionProps<"div"> {
  hover?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padding = "md", children, ...props }, ref) => {
    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={cn(
          "card",
          hover && "card-hover cursor-pointer",
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = "Card"

export const Badge = ({ children, className, variant = "primary" }: { 
  children: React.ReactNode, 
  className?: string,
  variant?: "primary" | "success" | "accent" | "outline"
}) => {
  const variants = {
    primary: "bg-surface-900 text-white border-surface-900",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accent: "bg-amber-50 text-amber-700 border-amber-200",
    outline: "bg-transparent text-surface-500 border-surface-200",
  }

  return (
    <span className={cn(
      "px-2.5 py-0.5 text-xs font-semibold rounded-full border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
