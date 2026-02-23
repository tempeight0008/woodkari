"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, Lock, ShoppingBag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/components/cart-provider"
import { placeOrder, type ShippingAddress } from "@/app/checkout/actions"

// ─── Tax rate ─────────────────────────────────────────────────────────────────
const TAX_RATE = 0.08
const FREE_SHIPPING_THRESHOLD = 500

// ─── Form defaults ────────────────────────────────────────────────────────────
const defaultShipping: ShippingAddress = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  country: "Italy",
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total: cartTotal, clearCart } = useCart()
  const [step, setStep] = useState<"shipping" | "payment">("shipping")
  const [shipping, setShipping] = useState<ShippingAddress>(defaultShipping)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const subtotal = cartTotal
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 35
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = subtotal + shippingCost + tax

  function setField<K extends keyof ShippingAddress>(key: K, value: string) {
    setShipping((prev) => ({ ...prev, [key]: value }))
  }

  function validateShipping(): string | null {
    if (!shipping.firstName.trim()) return "First name is required"
    if (!shipping.lastName.trim()) return "Last name is required"
    if (!shipping.email.trim() || !shipping.email.includes("@")) return "Valid email is required"
    if (!shipping.address.trim()) return "Address is required"
    if (!shipping.city.trim()) return "City is required"
    if (!shipping.zip.trim()) return "ZIP / Postal code is required"
    return null
  }

  function handleContinueToPayment() {
    const err = validateShipping()
    if (err) { setError(err); return }
    setError(null)
    setStep("payment")
  }

  async function handlePlaceOrder() {
    if (items.length === 0) { setError("Your cart is empty."); return }
    setError(null)
    startTransition(async () => {
      const result = await placeOrder({ shipping })

      if (result.error) {
        setError(result.error)
        return
      }

      await clearCart()
      // Use server-computed total (authoritative) for the success page
      const displayTotal = result.total ?? total
      router.push(`/checkout/success?order=${result.orderNumber}&total=${displayTotal.toFixed(2)}`)
    })
  }

  // ─── Empty cart guard ─────────────────────────────────────────────────────
  if (items.length === 0 && !isPending) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <ShoppingBag className="h-12 w-12 stroke-[1] text-muted-foreground" />
        <h1 className="font-serif text-2xl">Your bag is empty</h1>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          Add some items to your bag before checking out.
        </p>
        <Link href="/shop" className="text-sm tracking-widest uppercase underline underline-offset-4 hover:no-underline">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/shop" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
            <Link href="/" className="font-serif text-xl lg:text-2xl tracking-[0.3em] uppercase">
              Woodkari
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

          {/* ── Left: Forms ──────────────────────────────────────────── */}
          <div className="order-2 lg:order-1">
            {/* Step indicator */}
            <div className="flex items-center gap-4 mb-10">
              <button
                onClick={() => { setError(null); setStep("shipping") }}
                className={`text-sm tracking-[0.15em] uppercase transition-colors ${step === "shipping" ? "text-foreground" : "text-muted-foreground"}`}
              >
                Shipping
              </button>
              <div className="h-px w-8 bg-border" />
              <button
                disabled={step === "shipping"}
                onClick={() => setStep("payment")}
                className={`text-sm tracking-[0.15em] uppercase transition-colors disabled:cursor-not-allowed ${step === "payment" ? "text-foreground" : "text-muted-foreground"}`}
              >
                Payment
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* ── Shipping step ──────────────────────────────────────── */}
            {step === "shipping" && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                <h2 className="font-serif text-2xl mb-8">Shipping Information</h2>

                {/* Contact */}
                <div className="mb-8">
                  <h3 className="text-sm tracking-[0.1em] uppercase text-muted-foreground mb-4">Contact</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-xs tracking-wide">Email Address *</Label>
                      <Input id="email" type="email" value={shipping.email} onChange={(e) => setField("email", e.target.value)} className="mt-1.5 border-border/50 focus:border-foreground" placeholder="your@email.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-xs tracking-wide">Phone Number</Label>
                      <Input id="phone" type="tel" value={shipping.phone} onChange={(e) => setField("phone", e.target.value)} className="mt-1.5 border-border/50 focus:border-foreground" placeholder="+39 000 000 0000" />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-8">
                  <h3 className="text-sm tracking-[0.1em] uppercase text-muted-foreground mb-4">Shipping Address</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-xs tracking-wide">First Name *</Label>
                        <Input id="firstName" value={shipping.firstName} onChange={(e) => setField("firstName", e.target.value)} className="mt-1.5 border-border/50 focus:border-foreground" />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-xs tracking-wide">Last Name *</Label>
                        <Input id="lastName" value={shipping.lastName} onChange={(e) => setField("lastName", e.target.value)} className="mt-1.5 border-border/50 focus:border-foreground" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-xs tracking-wide">Address *</Label>
                      <Input id="address" value={shipping.address} onChange={(e) => setField("address", e.target.value)} className="mt-1.5 border-border/50 focus:border-foreground" />
                    </div>
                    <div>
                      <Label htmlFor="apartment" className="text-xs tracking-wide">Apartment, suite, etc. (optional)</Label>
                      <Input id="apartment" value={shipping.apartment} onChange={(e) => setField("apartment", e.target.value)} className="mt-1.5 border-border/50 focus:border-foreground" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-xs tracking-wide">City *</Label>
                        <Input id="city" value={shipping.city} onChange={(e) => setField("city", e.target.value)} className="mt-1.5 border-border/50 focus:border-foreground" />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-xs tracking-wide">State / Region</Label>
                        <Input id="state" value={shipping.state} onChange={(e) => setField("state", e.target.value)} className="mt-1.5 border-border/50 focus:border-foreground" />
                      </div>
                      <div>
                        <Label htmlFor="zip" className="text-xs tracking-wide">ZIP / Postal *</Label>
                        <Input id="zip" value={shipping.zip} onChange={(e) => setField("zip", e.target.value)} className="mt-1.5 border-border/50 focus:border-foreground" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-xs tracking-wide">Country</Label>
                      <Input id="country" value={shipping.country} onChange={(e) => setField("country", e.target.value)} className="mt-1.5 border-border/50 focus:border-foreground" />
                    </div>
                  </div>
                </div>

                <Button onClick={handleContinueToPayment} className="w-full py-6 text-sm tracking-[0.2em] uppercase">
                  Continue to Payment
                </Button>
              </motion.div>
            )}

            {/* ── Payment step ───────────────────────────────────────── */}
            {step === "payment" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                <h2 className="font-serif text-2xl mb-8">Payment Details</h2>

                {/* Shipping address recap */}
                <div className="mb-6 p-4 bg-muted flex items-start justify-between gap-4">
                  <div className="text-sm space-y-0.5">
                    <p className="font-medium">{shipping.firstName} {shipping.lastName}</p>
                    <p className="text-muted-foreground">{shipping.address}{shipping.apartment ? `, ${shipping.apartment}` : ""}</p>
                    <p className="text-muted-foreground">{shipping.city}{shipping.state ? `, ${shipping.state}` : ""} {shipping.zip}</p>
                    <p className="text-muted-foreground">{shipping.country}</p>
                  </div>
                  <button onClick={() => setStep("shipping")} className="text-xs tracking-wide underline underline-offset-2 hover:no-underline shrink-0">
                    Edit
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <Label htmlFor="cardName" className="text-xs tracking-wide">Name on Card</Label>
                    <Input id="cardName" className="mt-1.5 border-border/50 focus:border-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber" className="text-xs tracking-wide">Card Number</Label>
                    <Input id="cardNumber" className="mt-1.5 border-border/50 focus:border-foreground" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-xs tracking-wide">Expiry Date</Label>
                      <Input id="expiry" className="mt-1.5 border-border/50 focus:border-foreground" placeholder="MM / YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvc" className="text-xs tracking-wide">CVC</Label>
                      <Input id="cvc" className="mt-1.5 border-border/50 focus:border-foreground" placeholder="123" />
                    </div>
                  </div>
                </div>

                <div className="border border-border p-4 mb-8 text-xs text-muted-foreground leading-relaxed">
                  By placing your order, you agree to our{" "}
                  <Link href="#" className="underline underline-offset-2">Terms of Service</Link>{" "}and{" "}
                  <Link href="#" className="underline underline-offset-2">Privacy Policy</Link>.
                  <br /><br />
                  <span className="text-amber-600 font-medium">Note:</span> This is a demo checkout — no real payment is processed.
                </div>

                <Button onClick={handlePlaceOrder} disabled={isPending} className="w-full py-6 text-sm tracking-[0.2em] uppercase">
                  {isPending
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Placing Order…</>
                    : `Place Order — €${total.toLocaleString()}`}
                </Button>

                <button
                  onClick={() => setStep("shipping")}
                  className="w-full mt-4 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Shipping
                </button>
              </motion.div>
            )}
          </div>

          {/* ── Right: Order Summary ────────────────────────────────────── */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-32">
              <h2 className="font-serif text-2xl mb-8">Order Summary</h2>

              <div className="space-y-6 mb-8">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="flex gap-4"
                  >
                    <div className="w-20 h-24 bg-muted flex-shrink-0 relative">
                      <Image
                        src={item.product.images?.[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        fill sizes="80px" loading="lazy"
                        className="object-cover"
                      />
                      <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] h-5 w-5 flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-sm mb-1">{item.product.name}</h3>
                      {item.selected_color && <p className="text-xs text-muted-foreground">{item.selected_color}</p>}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm whitespace-nowrap">€{(item.product.price * item.quantity).toLocaleString()}</div>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-border pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>€{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shippingCost === 0 ? "text-green-600" : ""}>
                    {shippingCost === 0 ? "Complimentary" : `€${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Tax (8%)</span>
                  <span>€{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-medium pt-3 border-t border-border">
                  <span>Total</span>
                  <span>€{total.toLocaleString()}</span>
                </div>
              </div>

              {shippingCost > 0 && (
                <div className="mt-4 p-3 bg-muted text-xs text-muted-foreground">
                  Add <strong>€{(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(0)}</strong> more for complimentary shipping.
                </div>
              )}

              <div className="mt-6 p-4 bg-muted">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All orders include signature gift packaging. White glove delivery available on request.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
