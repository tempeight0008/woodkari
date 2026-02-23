"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { uploadImage, deleteImage, FOLDERS } from "@/lib/cloudinary"

// ─── Helpers ─────────────────────────────────────────────────────────────────
function slugify(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
}

async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") throw new Error("Forbidden")
    return { supabase, user }
}

function safeParseFloat(val: string | null, field: string): { value?: number; error?: string } {
    if (!val || val.trim() === "") return { error: `${field} is required` }
    const n = parseFloat(val)
    if (isNaN(n) || n < 0) return { error: `${field} must be a valid non-negative number` }
    return { value: n }
}

function safeParseInt(val: string | null, defaultVal = 0): number {
    const n = parseInt(val ?? "")
    return isNaN(n) || n < 0 ? defaultVal : n
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
    const { supabase } = await requireAdmin()

    const name = (formData.get("name") as string)?.trim()
    if (!name) return { error: "Product name is required" }

    const description = (formData.get("description") as string)?.trim()
    if (!description) return { error: "Product description is required" }

    const priceResult = safeParseFloat(formData.get("price") as string, "Price")
    if (priceResult.error) return { error: priceResult.error }

    const longDescription = formData.get("longDescription") as string
    const categoryId = formData.get("categoryId") as string || null
    const materialsRaw = formData.get("materials") as string
    const careRaw = formData.get("care") as string
    const craftsman = formData.get("craftsman") as string || null
    const madeIn = formData.get("madeIn") as string || null
    const estimatedDelivery = formData.get("estimatedDelivery") as string || null
    const stock = safeParseInt(formData.get("stock") as string)
    const customizable = formData.get("customizable") === "true"
    const isActive = formData.get("isActive") === "true"
    const colorsRaw = formData.get("colors") as string
    const dimensionsRaw = formData.get("dimensions") as string

    // Images — already Cloudinary URLs sent from client
    const images = (formData.get("images") as string || "")
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean)
    const hoverImage = formData.get("hoverImage") as string || null

    const slug = slugify(name)

    let parsedColors: import("@/lib/supabase/types").Json = []
    let parsedDimensions: import("@/lib/supabase/types").Json = {}
    try {
        parsedColors = colorsRaw ? JSON.parse(colorsRaw) : []
        parsedDimensions = dimensionsRaw ? JSON.parse(dimensionsRaw) : {}
    } catch {
        return { error: "Invalid colors or dimensions format" }
    }

    const { error } = await supabase.from("products").insert({
        name,
        slug,
        description,
        long_description: longDescription || null,
        price: priceResult.value!,
        category_id: categoryId,
        images,
        hover_image: hoverImage,
        materials: materialsRaw ? materialsRaw.split("\n").map((m) => m.trim()).filter(Boolean) : [],
        care_instructions: careRaw ? careRaw.split("\n").map((c) => c.trim()).filter(Boolean) : [],
        craftsman,
        made_in: madeIn,
        estimated_delivery: estimatedDelivery,
        stock,
        customizable,
        is_active: isActive,
        colors: parsedColors,
        dimensions: parsedDimensions,
    })

    if (error) return { error: error.message }

    revalidatePath("/admin/products")
    revalidatePath("/shop")
    redirect("/admin/products")
}

export async function updateProduct(id: string, formData: FormData) {
    const { supabase } = await requireAdmin()

    const name = (formData.get("name") as string)?.trim()
    if (!name) return { error: "Product name is required" }

    const description = (formData.get("description") as string)?.trim()
    if (!description) return { error: "Product description is required" }

    const priceResult = safeParseFloat(formData.get("price") as string, "Price")
    if (priceResult.error) return { error: priceResult.error }

    const longDescription = formData.get("longDescription") as string
    const categoryId = formData.get("categoryId") as string || null
    const materialsRaw = formData.get("materials") as string
    const careRaw = formData.get("care") as string
    const craftsman = formData.get("craftsman") as string || null
    const madeIn = formData.get("madeIn") as string || null
    const estimatedDelivery = formData.get("estimatedDelivery") as string || null
    const stock = safeParseInt(formData.get("stock") as string)
    const customizable = formData.get("customizable") === "true"
    const isActive = formData.get("isActive") === "true"
    const colorsRaw = formData.get("colors") as string
    const dimensionsRaw = formData.get("dimensions") as string

    const images = (formData.get("images") as string || "")
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean)
    const hoverImage = formData.get("hoverImage") as string || null

    let parsedColors: import("@/lib/supabase/types").Json = []
    let parsedDimensions: import("@/lib/supabase/types").Json = {}
    try {
        parsedColors = colorsRaw ? JSON.parse(colorsRaw) : []
        parsedDimensions = dimensionsRaw ? JSON.parse(dimensionsRaw) : {}
    } catch {
        return { error: "Invalid colors or dimensions format" }
    }

    const { error } = await supabase.from("products").update({
        name,
        slug: slugify(name),
        description,
        long_description: longDescription || null,
        price: priceResult.value!,
        category_id: categoryId,
        images,
        hover_image: hoverImage,
        materials: materialsRaw ? materialsRaw.split("\n").map((m) => m.trim()).filter(Boolean) : [],
        care_instructions: careRaw ? careRaw.split("\n").map((c) => c.trim()).filter(Boolean) : [],
        craftsman,
        made_in: madeIn,
        estimated_delivery: estimatedDelivery,
        stock,
        customizable,
        is_active: isActive,
        colors: parsedColors,
        dimensions: parsedDimensions,
    }).eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${id}/edit`)
    revalidatePath("/shop")
    redirect("/admin/products")
}

export async function deleteProduct(id: string) {
    const { supabase } = await requireAdmin()

    // Fetch images to delete from Cloudinary
    const { data: product } = await supabase
        .from("products")
        .select("images, hover_image")
        .eq("id", id)
        .single()

    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) return { error: error.message }

    // Best-effort Cloudinary cleanup (don't block on this)
    if (product) {
        const urls = [...(product.images ?? []), product.hover_image].filter(Boolean) as string[]
        await Promise.allSettled(
            urls
                .filter((u) => u.includes("/woodkari/"))
                .map((u) => {
                    const match = u.match(/\/woodkari\/.+$/)
                    if (!match) return Promise.resolve()
                    const publicId = match[0].slice(1).replace(/\.[^.]+$/, "")
                    return deleteImage(publicId)
                })
        )
    }

    revalidatePath("/admin/products")
    revalidatePath("/shop")
    return { success: true }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
    const { supabase } = await requireAdmin()
    const { error } = await supabase.from("products").update({ is_active: isActive }).eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/products")
    revalidatePath("/shop")
    return { success: true }
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
    const { supabase } = await requireAdmin()

    const name = (formData.get("name") as string)?.trim()
    if (!name) return { error: "Category name is required" }

    const description = formData.get("description") as string || null
    const imageUrl = formData.get("imageUrl") as string || null

    const { error } = await supabase.from("categories").insert({
        name,
        slug: slugify(name),
        description,
        image_url: imageUrl,
    })

    if (error) return { error: error.message }

    revalidatePath("/admin/categories")
    revalidatePath("/shop")
    return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
    const { supabase } = await requireAdmin()

    const name = (formData.get("name") as string)?.trim()
    if (!name) return { error: "Category name is required" }

    const description = formData.get("description") as string || null
    const imageUrl = formData.get("imageUrl") as string || null

    const { error } = await supabase.from("categories").update({
        name,
        slug: slugify(name),
        description,
        image_url: imageUrl,
    }).eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/categories")
    revalidatePath("/shop")
    return { success: true }
}

export async function deleteCategory(id: string) {
    const { supabase } = await requireAdmin()
    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/categories")
    revalidatePath("/shop")
    return { success: true }
}
