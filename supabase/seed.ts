/**
 * Woodkari Database Seed Script
 * Run with: bun supabase/seed.ts
 *
 * Seeds categories and products into Supabase using the service role key.
 * Safe to re-run — uses upsert (conflict on slug).
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://qsyvaurimzdmmbnviocl.supabase.co"
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzeXZhdXJpbXpkbW1ibnZpb2NsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU4NTM3NiwiZXhwIjoyMDg3MTYxMzc2fQ.bKdmUAtRHolQVyXwEFFLJgJm3eBhnHPDvaR5wH89oB8"

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Image URLs (Unsplash CDN) ────────────────────────────────────────────────

const IMG = {
  diningTable1:
    "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=900&q=85&auto=format&fit=crop",
  diningTable2:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85&auto=format&fit=crop",
  oakCabinet1:
    "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=900&q=85&auto=format&fit=crop",
  oakCabinet2:
    "https://images.unsplash.com/photo-1595514535215-9be1c8d33cf5?w=900&q=85&auto=format&fit=crop",
  cherryBed1:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85&auto=format&fit=crop",
  cherryBed2:
    "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=900&q=85&auto=format&fit=crop",
  teakTable1:
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=85&auto=format&fit=crop",
  teakTable2:
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=85&auto=format&fit=crop",
  mapleDesk1:
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=85&auto=format&fit=crop",
  mapleDesk2:
    "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=900&q=85&auto=format&fit=crop",
  pineShelf1:
    "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=900&q=85&auto=format&fit=crop",
  pineShelf2:
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=85&auto=format&fit=crop",
  // Extra category hero images
  catDining:
    "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=600&q=85&auto=format&fit=crop",
  catBedroom:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=85&auto=format&fit=crop",
  catLiving:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=85&auto=format&fit=crop",
  catStorage:
    "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&q=85&auto=format&fit=crop",
  catOffice:
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=85&auto=format&fit=crop",
}

// ─── Categories ───────────────────────────────────────────────────────────────

const categories = [
  {
    name: "Dining",
    slug: "dining",
    description: "Handcrafted dining tables and chairs for memorable gatherings",
    image_url: IMG.catDining,
  },
  {
    name: "Bedroom",
    slug: "bedroom",
    description: "Premium bedroom furniture crafted for rest and elegance",
    image_url: IMG.catBedroom,
  },
  {
    name: "Living Room",
    slug: "living-room",
    description: "Artisan living room pieces that anchor every space",
    image_url: IMG.catLiving,
  },
  {
    name: "Storage",
    slug: "storage",
    description: "Beautiful oak and walnut storage solutions",
    image_url: IMG.catStorage,
  },
  {
    name: "Office",
    slug: "office",
    description: "Professional workspace furniture for the discerning professional",
    image_url: IMG.catOffice,
  },
]

// ─── Products ─────────────────────────────────────────────────────────────────

// Products are defined after categories are inserted (we need category IDs)
function buildProducts(catMap: Record<string, string>) {
  return [
    // 1 ─ Walnut Dining Table
    {
      name: "Handcrafted Walnut Dining Table",
      slug: "handcrafted-walnut-dining-table",
      description: "Master-crafted solid walnut with beautiful grain patterns",
      long_description:
        "A stunning solid walnut dining table, handcrafted by our master carpenters. Features beautiful grain patterns and hand-finished surfaces perfect for gatherings with family and friends. Each piece is unique, with natural variations in wood character that make it truly one-of-a-kind.",
      price: 2500.0,
      category_id: catMap["dining"],
      images: [IMG.diningTable1, IMG.diningTable2],
      hover_image: IMG.diningTable2,
      materials: ["Solid Walnut Wood", "Hand-finished surface", "Natural wood joints"],
      care_instructions: [
        "Wipe with a dry cloth after use",
        "Apply wood oil annually",
        "Avoid prolonged heat or moisture exposure",
      ],
      dimensions: { length: 200, width: 100, height: 75, unit: "cm" },
      colors: [
        { name: "Natural Walnut", hex: "#3e2723", available: true },
        { name: "Ebony Stain", hex: "#1a1a1a", available: true },
      ],
      customizable: true,
      craftsman: "Marco Rossi",
      made_in: "Florence, Italy",
      estimated_delivery: "4–6 weeks",
      stock: 8,
      is_active: true,
    },

    // 2 ─ Oak Storage Cabinet
    {
      name: "Oak Storage Cabinet",
      slug: "oak-storage-cabinet",
      description: "Functional beauty with soft-close doors and dovetail joints",
      long_description:
        "A functional yet beautiful storage cabinet made from premium oak. Featuring dovetail joints and soft-close doors, this piece blends craftsmanship with everyday practicality. Ideal for living rooms or bedrooms, with ample storage capacity and a warm, natural finish.",
      price: 1800.0,
      category_id: catMap["storage"],
      images: [IMG.oakCabinet1, IMG.oakCabinet2],
      hover_image: IMG.oakCabinet2,
      materials: ["Solid Oak Wood", "Soft-close hinges", "Interior hardwood shelving"],
      care_instructions: [
        "Dust with a soft cloth regularly",
        "Polish with furniture wax every 3–4 months",
        "Keep away from direct sunlight",
      ],
      dimensions: { length: 120, width: 45, height: 180, unit: "cm" },
      colors: [
        { name: "Walnut Stain", hex: "#5d4037", available: true },
        { name: "Light Oak", hex: "#8d6e63", available: true },
      ],
      customizable: true,
      craftsman: "Giovanni Falcone",
      made_in: "Florence, Italy",
      estimated_delivery: "3–4 weeks",
      stock: 5,
      is_active: true,
    },

    // 3 ─ Cherry Wood Bed Frame
    {
      name: "Cherry Wood Bed Frame",
      slug: "cherry-wood-bed-frame",
      description: "Exquisite cherry wood with elegant hand-carved details",
      long_description:
        "An exquisite cherry wood bed frame handcrafted with meticulous attention to detail. The warm, rich tones and elegant proportions create a luxurious bedroom sanctuary. Crafted from premium American cherry with mortise-and-tenon joinery for lasting strength.",
      price: 3200.0,
      category_id: catMap["bedroom"],
      images: [IMG.cherryBed1, IMG.cherryBed2],
      hover_image: IMG.cherryBed2,
      materials: ["Solid American Cherry", "Hand-carved details", "Mortise & tenon joinery"],
      care_instructions: [
        "Avoid moisture and direct sunlight",
        "Clean with a lightly damp cloth",
        "Apply wax finish annually to maintain lustre",
      ],
      dimensions: { length: 160, width: 200, height: 150, unit: "cm" },
      colors: [
        { name: "Natural Cherry", hex: "#6d4c41", available: true },
        { name: "Dark Cherry", hex: "#4e342e", available: true },
      ],
      customizable: true,
      craftsman: "Alessandro Trani",
      made_in: "Florence, Italy",
      estimated_delivery: "6–8 weeks",
      stock: 3,
      is_active: true,
    },

    // 4 ─ Teak Coffee Table
    {
      name: "Teak Coffee Table",
      slug: "teak-coffee-table",
      description: "Minimalist design in sustainably sourced reclaimed teak",
      long_description:
        "A beautifully simple coffee table crafted from reclaimed teak wood. The natural grain patterns are unique to each piece, and the hand-rubbed oil finish highlights the wood's rich character. Equally at home in modern and traditional settings.",
      price: 1200.0,
      category_id: catMap["living-room"],
      images: [IMG.teakTable1, IMG.teakTable2],
      hover_image: IMG.teakTable2,
      materials: ["Reclaimed Teak Wood", "Natural oil finish", "Solid wood legs"],
      care_instructions: [
        "Dust regularly with a soft cloth",
        "Re-oil finish annually with teak oil",
        "Protect from standing water",
      ],
      dimensions: { length: 120, width: 60, height: 45, unit: "cm" },
      colors: [{ name: "Natural Teak", hex: "#8b7355", available: true }],
      customizable: false,
      craftsman: "Marco Rossi",
      made_in: "Florence, Italy",
      estimated_delivery: "2–3 weeks",
      stock: 12,
      is_active: true,
    },

    // 5 ─ Maple Writing Desk
    {
      name: "Maple Writing Desk",
      slug: "maple-writing-desk",
      description: "Refined maple wood desk crafted for focus and lasting beauty",
      long_description:
        "A refined maple wood desk designed for the discerning professional. Features ample workspace, elegant proportions, and expert craftsmanship throughout. Hand-selected maple with a smooth satin finish and two deep drawers with dovetail construction.",
      price: 1500.0,
      category_id: catMap["office"],
      images: [IMG.mapleDesk1, IMG.mapleDesk2],
      hover_image: IMG.mapleDesk2,
      materials: ["Solid Maple Wood", "Satin lacquer finish", "Dovetail drawer construction"],
      care_instructions: [
        "Wipe with a damp cloth, dry immediately",
        "Use wood conditioner monthly",
        "Protect the desktop with a pad or mat",
      ],
      dimensions: { length: 140, width: 70, height: 75, unit: "cm" },
      colors: [
        { name: "Natural Maple", hex: "#d9a76a", available: true },
        { name: "Honey Maple", hex: "#c9a774", available: true },
      ],
      customizable: true,
      craftsman: "Giovanni Falcone",
      made_in: "Florence, Italy",
      estimated_delivery: "4–5 weeks",
      stock: 6,
      is_active: true,
    },

    // 6 ─ Pine Bookshelf
    {
      name: "Pine Bookshelf Unit",
      slug: "pine-bookshelf-unit",
      description: "Five-shelf open bookshelf with warm natural pine finish",
      long_description:
        "A sturdy and beautiful bookshelf with five open shelves, crafted from knot-free solid pine. Perfect for displaying books, artwork, and collectibles. The natural pine finish brings warmth and character to any room, ageing beautifully over time.",
      price: 950.0,
      category_id: catMap["storage"],
      images: [IMG.pineShelf1, IMG.pineShelf2],
      hover_image: IMG.pineShelf2,
      materials: ["Solid Pine Wood", "Natural beeswax finish", "Load-bearing solid shelves"],
      care_instructions: [
        "Dust shelves weekly",
        "Re-apply beeswax oil as needed",
        "Avoid overloading shelves beyond 20 kg each",
      ],
      dimensions: { length: 90, width: 30, height: 200, unit: "cm" },
      colors: [
        { name: "Natural Pine", hex: "#d9a76a", available: true },
        { name: "Honey Finish", hex: "#c9a774", available: true },
      ],
      customizable: true,
      craftsman: "Alessandro Trani",
      made_in: "Florence, Italy",
      estimated_delivery: "2–3 weeks",
      stock: 10,
      is_active: true,
    },
  ]
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱  Woodkari database seed starting…\n")

  // 1. Upsert categories
  console.log("📂  Upserting categories…")
  const { data: insertedCats, error: catError } = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "slug" })
    .select("id, slug, name")

  if (catError) {
    console.error("❌  Category upsert failed:", catError.message)
    process.exit(1)
  }

  console.log(`   ✅ ${insertedCats?.length ?? 0} categories seeded`)
  insertedCats?.forEach((c) => console.log(`      • ${c.name} (${c.id})`))

  // 2. Build a slug → id map
  const catMap: Record<string, string> = {}
  for (const cat of insertedCats ?? []) {
    catMap[cat.slug] = cat.id
  }

  // 3. Upsert products
  console.log("\n📦  Upserting products…")
  const products = buildProducts(catMap)

  const { data: insertedProds, error: prodError } = await supabase
    .from("products")
    .upsert(products, { onConflict: "slug" })
    .select("id, name, price")

  if (prodError) {
    console.error("❌  Product upsert failed:", prodError.message)
    process.exit(1)
  }

  console.log(`   ✅ ${insertedProds?.length ?? 0} products seeded`)
  insertedProds?.forEach((p) =>
    console.log(`      • ${p.name} — €${p.price} (${p.id})`)
  )

  console.log("\n🎉  Seed complete! Your Woodkari store is ready.\n")
}

seed().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
