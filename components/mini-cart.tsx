"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useCart } from "@/components/cart-provider"

interface MiniCartProps {
  isOpen: boolean
  onClose: () => void
}

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { items, total, updateQuantity, removeItem, isLoading } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/40 z-50"
          />

          {/* Cart panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-xl">
                Shopping Bag
                {items.length > 0 && (
                  <span className="ml-2 text-sm font-sans text-muted-foreground">
                    ({items.reduce((a, i) => a + i.quantity, 0)})
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 hover:opacity-60 transition-opacity"
                aria-label="Close cart"
              >
                <X className="h-5 w-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4 text-center">
                  <ShoppingBag className="h-12 w-12 stroke-[1] text-muted-foreground" />
                  <p className="font-serif text-lg">Your bag is empty</p>
                  <p className="text-sm text-muted-foreground">Add pieces you love to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="w-24 h-28 bg-muted flex-shrink-0 relative overflow-hidden">
                        <Image
                          src={item.product.images?.[0] ?? "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          sizes="96px"
                          loading="lazy"
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-sm mb-1 truncate">{item.product.name}</h3>
                        {item.selected_color && (
                          <p className="text-xs text-muted-foreground mb-3">
                            Color: {item.selected_color}
                          </p>
                        )}

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:opacity-60 transition-opacity"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm w-6 text-center tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:opacity-60 transition-opacity"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Price + remove */}
                      <div className="flex flex-col items-end justify-between flex-shrink-0">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:opacity-60 transition-opacity"
                          aria-label="Remove item"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm">
                          €{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>€{total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout</p>
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full py-6 text-sm tracking-[0.2em] uppercase">
                    Proceed to Checkout
                  </Button>
                </Link>
                <button
                  onClick={onClose}
                  className="w-full text-center text-sm tracking-wide underline underline-offset-4 hover:no-underline transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

