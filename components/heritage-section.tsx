"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function HeritageSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax background - converted to Next.js Image with lazy loading */}
      <motion.div style={{ y }} className="absolute inset-0 -top-20 -bottom-20">
        <Image
          src="https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=1920&q=85&auto=format&fit=crop"
          alt="Heritage craftsmanship in Italian atelier"
          fill
          sizes="100vw"
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-foreground/40" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs tracking-[0.4em] uppercase text-primary-foreground/70 mb-6 block">Woodkari</span>
            <h2 className="font-serif text-4xl lg:text-6xl text-primary-foreground mb-8 leading-[1.15] text-balance">
              Where Tradition Meets
              <br />
              Master Craftsmanship
            </h2>
            <p className="text-primary-foreground/80 text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
              Built by skilled carpenters who treat woodworking as an art form. Every piece of furniture is handcrafted with sustainable woods, traditional techniques, and an eye for timeless design.
            </p>

            <div className="flex flex-wrap justify-center gap-12 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="font-serif text-4xl lg:text-5xl text-primary-foreground block mb-2">3</span>
                <span className="text-xs tracking-[0.2em] uppercase text-primary-foreground/60">Master Carpenters</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <span className="font-serif text-4xl lg:text-5xl text-primary-foreground block mb-2">100+</span>
                <span className="text-xs tracking-[0.2em] uppercase text-primary-foreground/60">Pieces Created</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <span className="font-serif text-4xl lg:text-5xl text-primary-foreground block mb-2">40+</span>
                <span className="text-xs tracking-[0.2em] uppercase text-primary-foreground/60">Hours per Piece</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
