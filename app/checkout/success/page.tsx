"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

function SuccessContent() {
    const params = useSearchParams()
    const orderNumber = params.get("order") ?? "—"
    const total = params.get("total") ? `€${Number(params.get("total")).toLocaleString()}` : ""

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-lg"
            >
                {/* Check icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className="flex justify-center mb-8"
                >
                    <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" strokeWidth={1.5} />
                    </div>
                </motion.div>

                {/* Brand */}
                <Link href="/" className="font-serif text-2xl tracking-[0.3em] uppercase block mb-8">
                    Woodkari
                </Link>

                <h1 className="font-serif text-3xl md:text-4xl mb-4">Thank you for your order</h1>
                <p className="text-muted-foreground leading-relaxed mb-8">
                    Your order has been confirmed and is now being prepared with the utmost care.
                    You will receive an email confirmation shortly.
                </p>

                {/* Order details box */}
                <div className="border border-border p-6 mb-10 text-left space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground tracking-wide">Order Number</span>
                        <span className="font-mono font-medium">{orderNumber}</span>
                    </div>
                    {total && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground tracking-wide">Total Charged</span>
                            <span className="font-medium">{total}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground tracking-wide">Estimated Delivery</span>
                        <span>5–10 business days</span>
                    </div>
                </div>

                {/* Info strip */}
                <div className="flex items-start gap-4 p-4 bg-muted mb-10 text-left">
                    <Package className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Your order includes complimentary gift packaging. Our team will reach out if
                        any customisation details are required. White glove delivery is available
                        on request.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/account/orders">
                        <Button variant="outline" className="w-full sm:w-auto tracking-widest uppercase text-xs py-5 px-8">
                            View My Orders
                        </Button>
                    </Link>
                    <Link href="/shop">
                        <Button className="w-full sm:w-auto tracking-widest uppercase text-xs py-5 px-8 gap-2">
                            Continue Shopping
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="font-serif text-muted-foreground">Loading…</div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}
