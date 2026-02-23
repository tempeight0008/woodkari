"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { AccountSidebar } from "@/components/account-sidebar"
import { createClient } from "@/lib/supabase/client"

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_image: string | null
  quantity: number
  unit_price: number
  selected_color: string | null
}

interface Order {
  id: string
  status: string
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  shipping_address: {
    first_name: string
    last_name: string
    address: string
    city: string
    country: string
  }
  created_at: string
  order_items: OrderItem[]
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "delivered": return <CheckCircle className="h-4 w-4" />
    case "shipped": return <Truck className="h-4 w-4" />
    case "cancelled": return <XCircle className="h-4 w-4" />
    default: return <Clock className="h-4 w-4" />
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "delivered": return "text-green-600"
    case "shipped": return "text-blue-600"
    case "cancelled": return "text-destructive"
    case "processing": return "text-amber-600"
    default: return "text-muted-foreground"
  }
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  })
}

function orderNumber(id: string): string {
  return `ORD-${new Date().getFullYear()}-${id.slice(-6).toUpperCase()}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      const supabase = createClient()
      const { data } = await supabase
        .from("orders")
        .select(`
          id, status, subtotal, shipping_cost, tax, total,
          shipping_address, created_at,
          order_items (
            id, product_id, product_name, product_image,
            quantity, unit_price, selected_color
          )
        `)
        .order("created_at", { ascending: false })

      if (data && data.length > 0) {
        setOrders(data as Order[])
        setExpandedOrder(data[0].id)
      }
      setIsLoading(false)
    }
    fetchOrders()
  }, [])

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="font-serif text-3xl lg:text-4xl mb-2">My Account</h1>
            <p className="text-muted-foreground">View your order history</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12">
            <AccountSidebar />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1"
            >
              <h2 className="font-serif text-2xl mb-8">Order History</h2>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
                  <Link
                    href="/shop"
                    className="text-sm tracking-[0.15em] uppercase underline underline-offset-4 hover:no-underline transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="border border-border"
                    >
                      {/* Order header */}
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                          <span className="font-mono text-sm">{orderNumber(order.id)}</span>
                          <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
                          <span className={`flex items-center gap-1.5 text-sm ${statusColor(order.status)}`}>
                            <StatusIcon status={order.status} />
                            {statusLabel(order.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm hidden sm:block">€{order.total.toLocaleString()}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-300 ${expandedOrder === order.id ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>

                      {/* Order items */}
                      <AnimatePresence>
                        {expandedOrder === order.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-0 border-t border-border">
                              <div className="space-y-4 pt-6">
                                {order.order_items.map((item) => (
                                  <Link
                                    key={item.id}
                                    href={`/product/${item.product_id}`}
                                    className="flex gap-4 group"
                                  >
                                    <div className="w-16 h-20 bg-muted flex-shrink-0 relative overflow-hidden">
                                      <Image
                                        src={item.product_image || "/placeholder.svg"}
                                        alt={item.product_name}
                                        fill sizes="64px" loading="lazy"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-serif text-sm group-hover:underline">{item.product_name}</h4>
                                      {item.selected_color && (
                                        <p className="text-xs text-muted-foreground mt-1">{item.selected_color}</p>
                                      )}
                                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-sm">€{(item.unit_price * item.quantity).toLocaleString()}</div>
                                  </Link>
                                ))}
                              </div>

                              {/* Order totals */}
                              <div className="mt-6 pt-4 border-t border-border space-y-1.5 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                  <span>Subtotal</span><span>€{order.subtotal.toLocaleString()}</span>
                                </div>
                                {order.shipping_cost > 0 && (
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span><span>€{order.shipping_cost}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-muted-foreground">
                                  <span>Tax</span><span>€{order.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-medium pt-2 border-t border-border">
                                  <span>Total</span><span>€{order.total.toLocaleString()}</span>
                                </div>
                              </div>

                              {/* Shipping address */}
                              {order.shipping_address && (
                                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                                  <p className="font-medium text-foreground mb-1">Shipped to</p>
                                  <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                                  <p>{order.shipping_address.address}</p>
                                  <p>{order.shipping_address.city}, {order.shipping_address.country}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <PremiumFooter />
    </>
  )
}

