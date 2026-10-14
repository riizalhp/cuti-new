"use client"

import { motion } from "framer-motion"
import { useRef, type ReactNode } from "react"

interface AdminPageWrapperProps {
  children: ReactNode
  className?: string
}

export function AdminPageWrapper({ children, className }: AdminPageWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={() => {
        if (ref.current) {
          ref.current.style.transform = "none"
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
