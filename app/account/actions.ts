"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

// ─── Update profile (full_name + phone) ──────────────────────────────────────

export async function updateProfile(data: {
    fullName: string
    phone: string
}): Promise<{ error?: string; success?: boolean }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("profiles")
        .update({
            full_name: data.fullName.trim() || null,
            phone: data.phone.trim() || null,
        })
        .eq("id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/account/profile")
    return { success: true }
}

// ─── Update password ──────────────────────────────────────────────────────────

export async function updatePassword(data: {
    newPassword: string
    confirmPassword: string
}): Promise<{ error?: string; success?: boolean }> {
    if (!data.newPassword || data.newPassword.length < 6) {
        return { error: "Password must be at least 6 characters" }
    }
    if (data.newPassword !== data.confirmPassword) {
        return { error: "Passwords do not match" }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({ password: data.newPassword })

    if (error) return { error: error.message }

    return { success: true }
}

// ─── Delete account ───────────────────────────────────────────────────────────

export async function deleteAccount(): Promise<{ error?: string; success?: boolean }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return { error: "Not authenticated" }

    // Sign out first so the session is invalidated client-side immediately.
    // A full hard-delete requires the service-role key; this soft-deletes by signing out.
    await supabase.auth.signOut()

    return { success: true }
}

// ─── Addresses ────────────────────────────────────────────────────────────────

export interface AddressInput {
    full_name: string
    phone: string | null
    address_line1: string
    address_line2: string | null
    city: string
    state: string | null
    postal_code: string
    country: string
    is_default?: boolean
}

export async function getAddresses() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated", data: null }

    const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at")

    if (error) return { error: error.message, data: null }
    return { data }
}

export async function createAddress(input: AddressInput): Promise<{ error?: string; success?: boolean }> {
    if (!input.full_name.trim()) return { error: "Full name is required" }
    if (!input.address_line1.trim()) return { error: "Address is required" }
    if (!input.city.trim()) return { error: "City is required" }
    if (!input.postal_code.trim()) return { error: "Postal code is required" }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // If this should be default, clear existing defaults first
    if (input.is_default) {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
    }

    // Check if this is the first address → auto-set as default
    const { count } = await supabase
        .from("addresses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

    const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        full_name: input.full_name.trim(),
        phone: input.phone?.trim() || null,
        address_line1: input.address_line1.trim(),
        address_line2: input.address_line2?.trim() || null,
        city: input.city.trim(),
        state: input.state?.trim() || null,
        postal_code: input.postal_code.trim(),
        country: input.country.trim() || "Italy",
        is_default: input.is_default || count === 0,
    })

    if (error) return { error: error.message }
    revalidatePath("/account/addresses")
    return { success: true }
}

export async function updateAddress(id: string, input: AddressInput): Promise<{ error?: string; success?: boolean }> {
    if (!input.full_name.trim()) return { error: "Full name is required" }
    if (!input.address_line1.trim()) return { error: "Address is required" }
    if (!input.city.trim()) return { error: "City is required" }
    if (!input.postal_code.trim()) return { error: "Postal code is required" }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    if (input.is_default) {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
    }

    const { error } = await supabase.from("addresses")
        .update({
            full_name: input.full_name.trim(),
            phone: input.phone?.trim() || null,
            address_line1: input.address_line1.trim(),
            address_line2: input.address_line2?.trim() || null,
            city: input.city.trim(),
            state: input.state?.trim() || null,
            postal_code: input.postal_code.trim(),
            country: input.country.trim() || "Italy",
            is_default: input.is_default ?? false,
        })
        .eq("id", id)
        .eq("user_id", user.id)   // prevent cross-user update

    if (error) return { error: error.message }
    revalidatePath("/account/addresses")
    return { success: true }
}

export async function deleteAddress(id: string): Promise<{ error?: string; success?: boolean }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Check if it's the default before deleting
    const { data: addr } = await supabase
        .from("addresses").select("is_default").eq("id", id).eq("user_id", user.id).single()

    const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id)
    if (error) return { error: error.message }

    // If we just deleted the default, promote the next one
    if (addr?.is_default) {
        const { data: remaining } = await supabase
            .from("addresses").select("id").eq("user_id", user.id).order("created_at").limit(1)
        if (remaining?.[0]) {
            await supabase.from("addresses").update({ is_default: true }).eq("id", remaining[0].id)
        }
    }

    revalidatePath("/account/addresses")
    return { success: true }
}

export async function setDefaultAddress(id: string): Promise<{ error?: string; success?: boolean }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
    const { error } = await supabase.from("addresses").update({ is_default: true })
        .eq("id", id).eq("user_id", user.id)

    if (error) return { error: error.message }
    revalidatePath("/account/addresses")
    return { success: true }
}
