import { notFound } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { ProductGallery } from "@/components/product-gallery"
import { ProductDetailsAccordion } from "@/components/product-details-accordion"
import { ProductActions } from "@/components/product-actions"
import { RelatedProducts } from "@/components/related-products"
import { ProductGalleryMotion, ProductInfoMotion } from "@/components/product-page-motion"
import { createClient } from "@/lib/supabase/server"
import { ChevronRight } from "lucide-react"

interface Color {
  name: string
  hex: string
  available: boolean
}

interface Dimensions {
  length: number
  width: number
  height: number
  unit: string
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("products").select("name, description").eq("id", id).single()
  if (!data) return { title: "Product not found" }
  return { title: `${data.name} — Woodkari`, description: data.description }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!product) notFound()

  const dimensions = product.dimensions as unknown as Dimensions | null
  const colors = (product.colors ?? []) as unknown as Color[]
  const materials = product.materials ?? []
  const care = product.care_instructions ?? []
  const category = product.categories as { id: string; name: string; slug: string } | null

  // Related products: same category, different id, max 4
  const { data: relatedProducts } = category?.id
    ? await supabase
      .from("products")
      .select("id, name, price, images, hover_image")
      .eq("category_id", category.id)
      .eq("is_active", true)
      .neq("id", product.id)
      .limit(4)
    : { data: [] }

  // Build gallery from images array + hover image
  const galleryImages = [
    ...(product.images ?? []),
    ...(product.hover_image && !product.images?.includes(product.hover_image)
      ? [product.hover_image]
      : []),
  ].filter(Boolean)

  const accordionItems = [
    {
      title: "Specifications",
      content: [
        dimensions
          ? `Dimensions: ${dimensions.length} × ${dimensions.width} × ${dimensions.height} ${dimensions.unit}`
          : null,
        materials.length ? `Materials: ${materials.join(", ")}` : null,
        product.customizable ? "Customizable upon request" : null,
        product.estimated_delivery ? `Estimated delivery: ${product.estimated_delivery}` : null,
      ].filter(Boolean) as string[],
    },
    ...(materials.length ? [{ title: "Materials", content: materials }] : []),
    ...(care.length ? [{ title: "Care Instructions", content: care }] : []),
    {
      title: "Shipping & Delivery",
      content: [
        product.estimated_delivery ? `Estimated delivery: ${product.estimated_delivery}` : "Made to order",
        "Free shipping on orders over €500",
        "White glove delivery available",
        "30-day return policy on select items",
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link
                href={`/shop?category=${category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="max-w-7xl mx-auto px-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <ProductGalleryMotion>
            <ProductGallery
              images={galleryImages.length ? galleryImages : ["/placeholder.svg"]}
              productName={product.name}
            />
          </ProductGalleryMotion>

          {/* Product Info */}
          <ProductInfoMotion>
            {/* Header */}
            <div className="space-y-4">
              {category && (
                <p className="text-xs tracking-widest text-muted-foreground uppercase">{category.name}</p>
              )}
              <h1 className="font-serif text-3xl md:text-4xl">{product.name}</h1>
              <p className="text-xl">€{product.price.toLocaleString()}</p>
            </div>

            {/* Description */}
            {product.long_description && (
              <p className="text-muted-foreground leading-relaxed">{product.long_description}</p>
            )}
            {!product.long_description && product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Color Selector + Add to Bag */}
            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                images: product.images ?? [],
                hover_image: product.hover_image ?? null,
              }}
              colors={colors}
              stock={product.stock ?? 0}
            />

            {/* Dimensions */}
            {(dimensions || materials.length > 0 || product.customizable) && (
              <div className="space-y-2 text-sm">
                {dimensions && (
                  <p className="text-muted-foreground">
                    <strong>Dimensions:</strong>{" "}
                    {dimensions.length} × {dimensions.width} × {dimensions.height} {dimensions.unit}
                  </p>
                )}
                {materials.length > 0 && (
                  <p className="text-muted-foreground">
                    <strong>Material:</strong> {materials.join(", ")}
                  </p>
                )}
                {product.customizable && (
                  <p className="text-primary">
                    <strong>✓ Customizable upon request</strong>
                  </p>
                )}
              </div>
            )}

            {/* Made In */}
            {product.made_in && (
              <p className="text-xs text-muted-foreground text-center tracking-widest">
                Made in {product.made_in}
              </p>
            )}

            {/* Accordion */}
            <ProductDetailsAccordion items={accordionItems} />
          </ProductInfoMotion>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}

      <PremiumFooter />
    </main>
  )
}

