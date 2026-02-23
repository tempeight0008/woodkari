"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Package, FolderOpen, ShoppingCart, TrendingUp, Plus, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalCategories: number
  totalOrders: number
  recentProducts: { id: string; name: string; price: number; is_active: boolean; categories: { name: string } | null }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      const [
        { count: totalProducts },
        { count: activeProducts },
        { count: totalCategories },
        { count: totalOrders },
        { data: recentProducts },
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("id, name, price, is_active, categories(name)")
          .order("created_at", { ascending: false })
          .limit(5),
      ])

      setStats({
        totalProducts: totalProducts ?? 0,
        activeProducts: activeProducts ?? 0,
        totalCategories: totalCategories ?? 0,
        totalOrders: totalOrders ?? 0,
        recentProducts: (recentProducts as any) ?? [],
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  const statCards = stats
    ? [
      { label: "Total Products", value: stats.totalProducts, sub: `${stats.activeProducts} active`, icon: Package, color: "text-primary", bg: "bg-primary/10" },
      { label: "Categories", value: stats.totalCategories, sub: "Furniture types", icon: FolderOpen, color: "text-accent-foreground", bg: "bg-accent/30" },
      { label: "Orders", value: stats.totalOrders, sub: "All time", icon: ShoppingCart, color: "text-secondary", bg: "bg-secondary/20" },
      { label: "Active Listings", value: stats.activeProducts, sub: "Visible in shop", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    ]
    : []

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-serif text-3xl text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm mb-10">Welcome back. Here&apos;s what&apos;s happening.</p>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {statCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-border p-5 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-md ${card.bg}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">{card.sub}</p>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Quick actions + recent products */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick actions */}
          <div className="space-y-3">
            <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Quick Actions</h2>
            <Link
              href="/admin/products/create"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors group"
            >
              <div className="p-2 bg-primary/10 rounded-md">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Add Product</p>
                <p className="text-xs text-muted-foreground">Create a new listing</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors group"
            >
              <div className="p-2 bg-primary/10 rounded-md">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Manage Products</p>
                <p className="text-xs text-muted-foreground">Edit, delete, toggle</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors group"
            >
              <div className="p-2 bg-primary/10 rounded-md">
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Categories</p>
                <p className="text-xs text-muted-foreground">Organise your catalog</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Recent products */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Recent Products</h2>
              <Link href="/admin/products" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
                </div>
              ) : stats?.recentProducts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No products yet.{" "}
                  <Link href="/admin/products/create" className="text-primary underline">Add your first product</Link>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Category</th>
                      <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Price</th>
                      <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats?.recentProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.categories?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-right text-foreground">€{p.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                            {p.is_active ? "Active" : "Draft"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
