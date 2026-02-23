"use client"

import { motion } from "framer-motion"

const ease = [0.16, 1, 0.3, 1] as const

export function ProductGalleryMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease }}
    >
      {children}
    </motion.div>
  )
}

export function ProductInfoMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease, delay: 0.1 }}
      className="lg:sticky lg:top-32 lg:self-start space-y-8"
    >
      {children}
    </motion.div>
  )
}
