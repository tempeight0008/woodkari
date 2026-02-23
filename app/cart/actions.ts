"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return { supabase, user }
}

/** Add or increment a cart item. Returns the updated row or error. */
export async function addToCart(productId: string, selectedColor?: string | null) {
    const { supabase, user } = await getUser()
    if (!user) return { error: "Not authenticated" }

    // Upsert: if same (user, product, color) exists, increment quantity
    const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("selected_color", selectedColor ?? "")
        .maybeSingle()

    if (existing) {
        const { error } = await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + 1 })
            .eq("id", existing.id)
        if (error) return { error: error.message }
    } else {
        const { error } = await supabase.from("cart_items").insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1,
            selected_color: selectedColor ?? null,
        })
        if (error) return { error: error.message }
    }

    revalidatePath("/")
    return { success: true }
}

/** Set quantity of a specific cart item. quantity=0 removes it. */
export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
    const { supabase, user } = await getUser()
    if (!user) return { error: "Not authenticated" }

    if (quantity <= 0) {
        const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("id", cartItemId)
            .eq("user_id", user.id)
        if (error) return { error: error.message }
    } else {
        const { error } = await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("id", cartItemId)
            .eq("user_id", user.id)
        if (error) return { error: error.message }
    }

    revalidatePath("/")
    return { success: true }
}

/** Remove a cart item by id. */
export async function removeCartItem(cartItemId: string) {
    const { supabase, user } = await getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId)
        .eq("user_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/")
    return { success: true }
}

/** Clear all cart items for the current user. */
export async function clearCart() {
    const { supabase, user } = await getUser()
    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/")
    return { success: true }
}

/** Merge a guest localStorage cart into Supabase on login. */
export async function mergeGuestCart(
    items: { product_id: string; quantity: number; selected_color: string | null }[]
) {
    const { supabase, user } = await getUser()
    if (!user || items.length === 0) return

    for (const item of items) {
        const { data: existing } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("user_id", user.id)
            .eq("product_id", item.product_id)
            .eq("selected_color", item.selected_color ?? "")
            .maybeSingle()

        if (existing) {
            await supabase
                .from("cart_items")
                .update({ quantity: existing.quantity + item.quantity })
                .eq("id", existing.id)
        } else {
            await supabase.from("cart_items").insert({
                user_id: user.id,
                product_id: item.product_id,
                quantity: item.quantity,
                selected_color: item.selected_color,
            })
        }
    }
}
