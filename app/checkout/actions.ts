"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface ShippingAddress {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    apartment?: string
    city: string
    state: string
    zip: string
    country: string
}

export interface PlaceOrderInput {
    shipping: ShippingAddress
    notes?: string
}

// Must stay in sync with checkout/page.tsx display constants
const FREE_SHIPPING_THRESHOLD = 500
const TAX_RATE = 0.08

export async function placeOrder(input: PlaceOrderInput): Promise<{
    orderId?: string
    orderNumber?: string
    total?: number
    error?: string
}> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: "You must be logged in to place an order." }
    }

    // ── Fetch cart from database (server-authoritative) ──────────────────────
    const { data: cartRows, error: cartError } = await supabase
        .from("cart_items")
        .select("id, product_id, quantity, selected_color, products(id, name, price, images, stock)")
        .eq("user_id", user.id)

    if (cartError) return { error: "Failed to load your cart." }
    if (!cartRows || cartRows.length === 0) return { error: "Your cart is empty." }

    // ── Validate stock and build order items ─────────────────────────────────
    for (const row of cartRows) {
        const product = row.products as { id: string; name: string; price: number; images: string[]; stock: number } | null
        if (!product) return { error: "One or more products in your cart are unavailable." }
        if (product.stock < row.quantity) {
            return { error: `Insufficient stock for "${product.name}". Only ${product.stock} left.` }
        }
    }

    // ── Compute totals server-side (never trust the client) ──────────────────
    const orderItemsPayload = (cartRows as any[]).map((row) => {
        const product = row.products as { id: string; name: string; price: number; images: string[] }
        return {
            product_id: product.id,
            product_name: product.name,
            product_image: product.images?.[0] ?? null,
            quantity: row.quantity as number,
            unit_price: product.price,          // authoritative DB price
            selected_color: row.selected_color as string | null,
        }
    })

    const subtotal = orderItemsPayload.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
    )
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 35
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100
    const total = Math.round((subtotal + shippingCost + tax) * 100) / 100

    // ── Insert the order ─────────────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            user_id: user.id,
            status: "pending",
            subtotal,
            shipping_cost: shippingCost,
            tax,
            total,
            shipping_address: {
                first_name: input.shipping.firstName,
                last_name: input.shipping.lastName,
                email: input.shipping.email,
                phone: input.shipping.phone,
                address: input.shipping.address,
                apartment: input.shipping.apartment ?? null,
                city: input.shipping.city,
                state: input.shipping.state,
                zip: input.shipping.zip,
                country: input.shipping.country,
            },
            notes: input.notes ?? null,
        })
        .select("id")
        .single()

    if (orderError || !order) {
        console.error("Order insert error:", orderError)
        return { error: "Failed to create order. Please try again." }
    }

    // ── Insert order items ────────────────────────────────────────────────────
    const { error: itemsError } = await supabase.from("order_items").insert(
        orderItemsPayload.map((item) => ({ ...item, order_id: order.id }))
    )

    if (itemsError) {
        console.error("Order items insert error:", itemsError)
        await supabase.from("orders").delete().eq("id", order.id)
        return { error: "Failed to save order items. Please try again." }
    }

    // ── Clear the user's cart ─────────────────────────────────────────────────
    await supabase.from("cart_items").delete().eq("user_id", user.id)

    revalidatePath("/account/orders")
    revalidatePath("/")

    const orderNumber = `ORD-${new Date().getFullYear()}-${order.id.slice(-6).toUpperCase()}`

    return { orderId: order.id, orderNumber, total }
}
