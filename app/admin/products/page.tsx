"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit, Trash2, Search, X, ToggleLeft, ToggleRight, ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { deleteProduct, toggleProductStatus } from "@/app/admin/actions"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  is_active: boolean
  images: string[]
  categories: { name: string } | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.categories?.name ?? "").toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("products")
      .select("id, name, price, stock, is_active, images, categories(name)")
      .order("created_at", { ascending: false })
    setProducts((data as any) ?? [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setDeleteId(null)
    })
  }

  async function handleToggle(id: string, current: boolean) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !current } : p))
    )
    startTransition(async () => {
      await toggleProductStatus(id, !current)
    })
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-1">Products</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${products.length} total`}
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 border border-border rounded-lg bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">
                  Stock
                </th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-10 bg-muted animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <p className="text-muted-foreground mb-2">
                      {search ? "No products match your search." : "No products yet."}
                    </p>
                    {!search && (
                      <Link
                        href="/admin/products/create"
                        className="text-primary text-sm hover:underline"
                      >
                        Add your first product →
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-md bg-muted shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-md shrink-0 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {p.categories?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground hidden sm:table-cell">
                      €{p.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-foreground hidden lg:table-cell">{p.stock}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(p.id, p.is_active)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full transition-colors ${p.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                          }`}
                      >
                        {p.is_active ? (
                          <ToggleRight className="h-3.5 w-3.5" />
                        ) : (
                          <ToggleLeft className="h-3.5 w-3.5" />
                        )}
                        {p.is_active ? "Active" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-lg p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-serif text-foreground mb-2">Delete product?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This will permanently delete the product and its images from Cloudinary. This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteId && handleDelete(deleteId)}
                  className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md text-sm transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

