"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShoppingBag, Check, Loader2 } from "lucide-react"
import { useCart, type CartProduct } from "@/components/cart-provider"

interface AddToCartButtonProps {
    product: CartProduct
    selectedColor?: string | null
    outOfStock?: boolean
}

export function AddToCartButton({ product, selectedColor, outOfStock }: AddToCartButtonProps) {
    const { addItem } = useCart()
    const [status, setStatus] = useState<"idle" | "loading" | "added" | "error">("idle")
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    async function handleAdd() {
        if (outOfStock || status === "loading") return
        setStatus("loading")
        setErrorMsg(null)

        const result = await addItem(product, selectedColor)

        if (result.error) {
            setStatus("error")
            setErrorMsg(result.error)
            setTimeout(() => setStatus("idle"), 2500)
        } else {
            setStatus("added")
            setTimeout(() => setStatus("idle"), 2000)
        }
    }

    const label = outOfStock
        ? "Out of Stock"
        : status === "loading"
            ? "Adding…"
            : status === "added"
                ? "Added to Bag ✓"
                : status === "error"
                    ? errorMsg ?? "Error — try again"
                    : "Add to Bag"

    return (
        <div className="space-y-2">
            <motion.button
                onClick={handleAdd}
                disabled={outOfStock || status === "loading"}
                whileTap={outOfStock ? undefined : { scale: 0.98 }}
                className={`w-full py-4 text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-2 ${outOfStock
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : status === "added"
                            ? "bg-green-700 text-white"
                            : status === "error"
                                ? "bg-destructive text-destructive-foreground"
                                : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
            >
                {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === "added" && <Check className="h-4 w-4" />}
                {status === "idle" && !outOfStock && <ShoppingBag className="h-4 w-4" />}
                {label}
            </motion.button>
        </div>
    )
}
