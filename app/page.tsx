import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { CollectionGrid } from "@/components/collection-grid"
import { HeritageSection } from "@/components/heritage-section"
import { PremiumFooter } from "@/components/premium-footer"

export default async function Home() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, images, hover_image, categories(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6)

  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <CollectionGrid products={(products as any) ?? []} />
      <HeritageSection />
      <PremiumFooter />
    </main>
  )
}
