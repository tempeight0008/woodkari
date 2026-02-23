import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { uploadImage, FOLDERS } from "@/lib/cloudinary"

/**
 * POST /api/admin/upload
 * Body: FormData { file: File, folder?: "products" | "categories" | "avatars" }
 * Returns: { url: string, publicId: string }
 *
 * Only accessible by authenticated admins.
 */
export async function POST(request: Request) {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse the uploaded file
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folderKey = (formData.get("folder") as string) || "products"

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate type and size (max 10 MB)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "Only JPEG, PNG, WebP or AVIF images are allowed" }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File size must be under 10 MB" }, { status: 400 })
    }

    // Convert File → base64 data URI for Cloudinary SDK
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    const folder = FOLDERS[folderKey.toUpperCase() as keyof typeof FOLDERS] ?? FOLDERS.PRODUCTS

    const result = await uploadImage(base64, folder)

    return NextResponse.json({ url: result.url, publicId: result.publicId })
}
