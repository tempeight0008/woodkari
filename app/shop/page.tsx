import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { createClient } from "@/lib/supabase/server"
import { ShopFilters } from "./shop-filters"
import { ProductCard } from "@/components/product-card"
import { ArrowRight } from "lucide-react"

export const metadata = {
  title: "Shop — Woodkari",
  description: "Browse our full collection of handcrafted luxury furniture.",
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const supabase = await createClient()

  // Fetch categories and optionally resolve the active category id
  const [{ data: categories }, categoryRow] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name"),
    category
      ? supabase.from("categories").select("id").eq("slug", category).single()
      : Promise.resolve({ data: null }),
  ])

  // Build product query
  let query = supabase
    .from("products")
    .select("id, name, price, images, hover_image, categories(id, name, slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (category && categoryRow.data?.id) {
    query = query.eq("category_id", categoryRow.data.id) as typeof query
  }

  const { data: products } = await query

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/shop-hero-luxury-fashion-collection.jpg"
            alt="Shop collection"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
        <div className="relative z-10 text-center text-primary-foreground px-6">
          <h1 className="font-serif text-5xl md:text-7xl mb-6">Our Furniture</h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto">
            Handcrafted pieces made by skilled artisans. Each item is a testament to quality and timeless design.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-muted">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Suspense fallback={null}>
            <ShopFilters categories={categories ?? []} activeSlug={category ?? "all"} />
          </Suspense>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          {!products || products.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p className="text-lg mb-4">No products found{category ? " in this category" : ""} yet.</p>
              {category && (
                <Link href="/shop" className="text-primary text-sm hover:underline">
                  View all products
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  images={product.images}
                  hover_image={product.hover_image}
                  category={(product.categories as any)?.name ?? ""}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Heritage CTA */}
      <section className="border-t border-muted py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Crafted with Purpose</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Every piece in our collection carries forward a legacy of Italian craftsmanship spanning over 175 years.
          </p>
          <Link
            href="/heritage"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase border-b border-foreground pb-1 hover:gap-4 transition-all duration-300"
          >
            Discover Our Heritage
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <PremiumFooter />
    </main>
  )
}
