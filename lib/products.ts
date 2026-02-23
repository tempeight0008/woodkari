export interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  hoverImage: string
  description: string
  longDescription: string
  materials: string[]
  care: string[]
  dimensions: { length: number; width: number; height: number; unit: string }
  customizable: boolean
  craftsman?: string
  colors: { name: string; hex: string; available: boolean }[]
  details: string[]
  madeIn: string
  estimatedDelivery: string
}

export const products: Product[] = [
  {
    id: "walnut-dining-table",
    name: "Handcrafted Walnut Dining Table",
    price: 2500,
    category: "Dining",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=900&q=85&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85&auto=format&fit=crop",
    description: "Master-crafted solid walnut with beautiful grain patterns",
    longDescription:
      "A stunning solid walnut dining table, handcrafted by our master carpenters. Features beautiful grain patterns and hand-finished surfaces perfect for gatherings with family and friends. Each piece is unique, with natural variations in wood character.",
    materials: ["Solid Walnut Wood", "Hand-finished surface", "Natural wood joints"],
    care: ["Wipe with dry cloth", "Use wood oil annually", "Avoid prolonged heat exposure"],
    dimensions: { length: 200, width: 100, height: 75, unit: "cm" },
    customizable: true,
    craftsman: "Marco Rossi",
    colors: [
      { name: "Natural Walnut", hex: "#3e2723", available: true },
      { name: "Ebony Stain", hex: "#1a1a1a", available: true },
    ],
    details: [
      "Hand-selected walnut",
      "Mortise and tenon joints",
      "Natural oil finish",
      "Seats 6-8 people",
    ],
    madeIn: "Florence, Italy",
    estimatedDelivery: "4-6 weeks",
  },
  {
    id: "oak-storage-cabinet",
    name: "Oak Storage Cabinet",
    price: 1800,
    category: "Storage",
    image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=900&q=85&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1595514535215-9be1c8d33cf5?w=900&q=85&auto=format&fit=crop",
    description: "Functional beauty with soft-close doors",
    longDescription:
      "A functional yet beautiful storage cabinet made from premium oak. Featuring dovetail joints and soft-close doors. Ideal for living rooms or bedrooms with ample storage capacity.",
    materials: ["Solid Oak Wood", "Soft-close hinges", "Interior shelving"],
    care: ["Dust with soft cloth", "Polish with furniture wax every 3-4 months"],
    dimensions: { length: 120, width: 45, height: 180, unit: "cm" },
    customizable: true,
    craftsman: "Giovanni Falcone",
    colors: [
      { name: "Walnut Stain", hex: "#5d4037", available: true },
      { name: "Light Oak", hex: "#8d6e63", available: true },
    ],
    details: ["Dovetail joints", "Soft-close doors", "Three shelves", "Adjustable interior"],
    madeIn: "Florence, Italy",
    estimatedDelivery: "3-4 weeks",
  },
  {
    id: "cherry-bed-frame",
    name: "Cherry Wood Bed Frame",
    price: 3200,
    category: "Bedroom",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=900&q=85&auto=format&fit=crop",
    description: "Exquisite cherry wood with elegant design",
    longDescription:
      "An exquisite cherry wood bed frame handcrafted with attention to detail. The warm tones and elegant design create a luxurious bedroom sanctuary. Crafted from premium American cherry.",
    materials: ["Solid American Cherry", "Hand-carved details", "Mortise joinery"],
    care: ["Avoid moisture", "Clean with damp cloth", "Apply wax finish annually"],
    dimensions: { length: 160, width: 200, height: 150, unit: "cm" },
    customizable: true,
    craftsman: "Alessandro Trani",
    colors: [
      { name: "Natural Cherry", hex: "#6d4c41", available: true },
      { name: "Dark Cherry", hex: "#4e342e", available: true },
    ],
    details: ["Hand-carved headboard", "Queen size", "Premium American cherry", "Elegant proportions"],
    madeIn: "Florence, Italy",
    estimatedDelivery: "6-8 weeks",
  },
  {
    id: "teak-coffee-table",
    name: "Teak Coffee Table",
    price: 1200,
    category: "Living Room",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=85&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=85&auto=format&fit=crop",
    description: "Minimalist design in sustainable teak",
    longDescription:
      "A beautifully simple coffee table made from reclaimed teak wood. The grain patterns are unique to each piece, and the natural finish highlights the wood's character. Perfect for modern and traditional settings alike.",
    materials: ["Reclaimed Teak Wood", "Natural finish", "Wooden legs"],
    care: ["Dust regularly", "Oil finish annually", "Protect from water"],
    dimensions: { length: 120, width: 60, height: 45, unit: "cm" },
    customizable: false,
    craftsman: "Marco Rossi",
    colors: [
      { name: "Natural Teak", hex: "#8b7355", available: true },
    ],
    details: ["Reclaimed material", "Sustainable sourcing", "Natural grain", "Solid wood construction"],
    madeIn: "Florence, Italy",
    estimatedDelivery: "2-3 weeks",
  },
  {
    id: "maple-desk",
    name: "Maple Writing Desk",
    price: 1500,
    category: "Office",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=85&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=900&q=85&auto=format&fit=crop",
    description: "Crafted for focus and beauty",
    longDescription:
      "A refined maple wood desk designed for the discerning professional. Features ample workspace, elegant proportions, and expert craftsmanship. Hand-selected maple wood with a smooth satin finish.",
    materials: ["Solid Maple Wood", "Satin finish", "Wooden drawers"],
    care: ["Wipe with damp cloth", "Use wood conditioner monthly", "Protect desktop"],
    dimensions: { length: 140, width: 70, height: 75, unit: "cm" },
    customizable: true,
    craftsman: "Giovanni Falcone",
    colors: [
      { name: "Natural Maple", hex: "#d9a76a", available: true },
      { name: "Honey Maple", hex: "#c9a774", available: true },
    ],
    details: ["Two drawers", "Cable management", "Solid construction", "Premium maple"],
    madeIn: "Florence, Italy",
    estimatedDelivery: "4-5 weeks",
  },
  {
    id: "pine-bookshelf",
    name: "Pine Bookshelf Unit",
    price: 950,
    category: "Storage",
    image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=900&q=85&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=85&auto=format&fit=crop",
    description: "Open shelving for your growing collection",
    longDescription:
      "A sturdy and beautiful pine bookshelf with five open shelves. Perfect for displaying books, art, and collectibles. The natural pine finish brings warmth to any room.",
    materials: ["Solid Pine Wood", "Natural finish", "Load-bearing shelves"],
    care: ["Dust weekly", "Oil finish as needed", "Avoid overloading"],
    dimensions: { length: 90, width: 30, height: 200, unit: "cm" },
    customizable: true,
    craftsman: "Alessandro Trani",
    colors: [
      { name: "Natural Pine", hex: "#d9a76a", available: true },
      { name: "Honey Finish", hex: "#c9a774", available: true },
    ],
    details: ["Five shelves", "Open design", "Lightweight yet sturdy", "Natural wood grain"],
    madeIn: "Florence, Italy",
    estimatedDelivery: "2-3 weeks",
  },
]

export const categories = ["All", "Dining", "Bedroom", "Living Room", "Storage", "Office"]

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products
  return products.filter((p) => p.category === category)
}

export function getRelatedProducts(currentId: string, limit = 4): Product[] {
  const current = getProductById(currentId)
  if (!current) return products.slice(0, limit)

  const sameCategory = products.filter((p) => p.id !== currentId && p.category === current.category)
  const others = products.filter((p) => p.id !== currentId && p.category !== current.category)

  return [...sameCategory, ...others].slice(0, limit)
}
