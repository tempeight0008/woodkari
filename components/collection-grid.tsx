"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ProductCard } from "./product-card"

interface CollectionProduct {
  id: string
  name: string
  price: number
  images: string[]
  hover_image: string | null
  categories: { name: string } | null
}

interface CollectionGridProps {
  products: CollectionProduct[]
}

export function CollectionGrid({ products }: CollectionGridProps) {
  // Pad / trim to exactly 6 for the asymmetric layout
  const display = products.slice(0, 6)
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2 className="font-serif text-3xl lg:text-5xl mb-4 text-primary">Featured Pieces</h2>
          <p className="text-muted-foreground tracking-wide max-w-md mx-auto">
            Handcrafted furniture from our master carpenters
          </p>
        </motion.div>

        {/* Asymmetrical grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {display.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              <p>Products coming soon.</p>
            </div>
          ) : (
            <>
              {/* First row */}
              <div className="lg:pt-12">
                {display[0] && <ProductCard {...display[0]} category={display[0].categories?.name ?? ""} index={0} />}
              </div>
              <div>
                {display[1] && <ProductCard {...display[1]} category={display[1].categories?.name ?? ""} index={1} />}
              </div>
              <div className="lg:pt-24">
                {display[2] && <ProductCard {...display[2]} category={display[2].categories?.name ?? ""} index={2} />}
              </div>
              {/* Second row */}
              <div>
                {display[3] && <ProductCard {...display[3]} category={display[3].categories?.name ?? ""} index={3} />}
              </div>
              <div className="lg:pt-16">
                {display[4] && <ProductCard {...display[4]} category={display[4].categories?.name ?? ""} index={4} />}
              </div>
              <div className="lg:-mt-8">
                {display[5] && <ProductCard {...display[5]} category={display[5].categories?.name ?? ""} index={5} />}
              </div>
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16 lg:mt-24"
        >
          <Link
            href="/shop"
            className="inline-flex items-center text-sm tracking-[0.2em] uppercase border-b border-foreground pb-1 hover:border-transparent transition-colors duration-300"
          >
            View Full Collection
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
