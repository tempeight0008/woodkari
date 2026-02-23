import { v2 as cloudinary } from "cloudinary"

/**
 * Cloudinary is configured via environment variables.
 * This module exports the configured instance and helper utilities.
 */
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})

export { cloudinary }

// ─── Upload Folders ───────────────────────────────────────────────────────────
export const FOLDERS = {
    PRODUCTS: "woodkari/products",
    CATEGORIES: "woodkari/categories",
    AVATARS: "woodkari/avatars",
} as const

// ─── Upload Helper (server-side only) ────────────────────────────────────────
/**
 * Upload a file buffer or base64 string to Cloudinary.
 * Use this in Server Actions / Route Handlers only.
 */
export async function uploadImage(
    file: string, // base64 data URI or remote URL
    folder: string,
    options?: {
        publicId?: string
        transformation?: object[]
    }
) {
    const result = await cloudinary.uploader.upload(file, {
        folder,
        public_id: options?.publicId,
        overwrite: true,
        transformation: options?.transformation ?? [
            { quality: "auto:best", fetch_format: "auto" },
        ],
    })

    return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
    }
}

/**
 * Delete an image from Cloudinary by its public ID.
 */
export async function deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId)
}

// ─── Transform URL Helpers (client-safe) ─────────────────────────────────────
/**
 * Build an optimised Cloudinary URL for a product image.
 * Works with existing Cloudinary public IDs or full URLs.
 */
export function getProductImageUrl(
    publicIdOrUrl: string,
    options?: {
        width?: number
        height?: number
        crop?: "fill" | "fit" | "thumb" | "scale"
        quality?: "auto" | number
    }
) {
    const { width = 800, height, crop = "fill", quality = "auto" } = options ?? {}

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) return publicIdOrUrl

    // If it's already a full Cloudinary URL, extract the public ID
    if (publicIdOrUrl.startsWith("http")) {
        return publicIdOrUrl
    }

    const transforms = [
        `w_${width}`,
        height ? `h_${height}` : null,
        `c_${crop}`,
        `q_${quality}`,
        `f_auto`,
    ]
        .filter(Boolean)
        .join(",")

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicIdOrUrl}`
}

/**
 * Generate a signed upload URL for direct browser uploads.
 * Call this from a Route Handler.
 */
export function generateUploadSignature(folder: string, publicId?: string) {
    const timestamp = Math.round(new Date().getTime() / 1000)

    const paramsToSign: Record<string, string | number> = {
        timestamp,
        folder,
    }
    if (publicId) paramsToSign.public_id = publicId

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET!
    )

    return {
        signature,
        timestamp,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
        apiKey: process.env.CLOUDINARY_API_KEY!,
        folder,
    }
}
