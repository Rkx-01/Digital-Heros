"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-brand-600 text-white hover:bg-brand-700",
      outline: "border border-surface-200 bg-white text-surface-900 hover:bg-surface-50 hover:border-surface-300",
      ghost: "text-surface-600 hover:bg-surface-100 hover:text-surface-900",
      danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    }

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-lg",
      md: "px-6 py-3 text-base rounded-xl",
      lg: "px-8 py-4 text-lg rounded-2xl",
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"
