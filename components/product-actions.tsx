"use client"

import { useState } from "react"
import { ColorSelector } from "@/components/color-selector"
import { AddToCartButton } from "@/components/add-to-cart-button"
import type { CartProduct } from "@/components/cart-provider"

interface Color {
    name: string
    hex: string
    available: boolean
}

interface ProductActionsProps {
    product: CartProduct
    colors: Color[]
    stock: number
}

export function ProductActions({ product, colors, stock }: ProductActionsProps) {
    const [selectedColor, setSelectedColor] = useState<string | null>(
        colors.find((c) => c.available)?.name ?? null
    )

    return (
        <div className="space-y-6">
            {colors.length > 0 && (
                <ColorSelector colors={colors} onSelect={setSelectedColor} />
            )}

            <AddToCartButton
                product={product}
                selectedColor={selectedColor}
                outOfStock={stock === 0}
            />
        </div>
    )
}
