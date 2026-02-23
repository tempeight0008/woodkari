"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex">
      {/* Left content - 20% */}
      <div className="hidden lg:flex bg-primary items-center justify-center w-[22%]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-primary-foreground -rotate-90 whitespace-nowrap"
        >
          <span className="text-xs tracking-[0.3em] uppercase">Handcrafted</span>
        </motion.div>
      </div>

      {/* Right content - 80% */}
      <div className="flex-1 relative">
        {/* Background image - converted to Next.js Image with priority for LCP */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1920&q=85&auto=format&fit=crop"
            alt="Master craftsman in woodworking workshop"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 78vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-foreground/30" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col justify-end p-8 lg:p-16 pb-24 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl text-primary-foreground leading-[1.1] mb-6 text-balance">
              Handcrafted
              <br />
              Furniture by Masters
            </h1>
            <p className="text-primary-foreground/80 text-base lg:text-lg tracking-wide mb-10 max-w-md leading-relaxed">
              Each piece tells a story of artisan craftsmanship. Sustainably sourced woods, timeless designs, and generations of expertise.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/shop">
                <Button
                  size="lg"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-10 py-6 text-sm tracking-[0.2em] uppercase group"
                >
                  Explore Collection
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-primary-foreground/50"
          />
        </motion.div>
      </div>
    </section>
  )
}
