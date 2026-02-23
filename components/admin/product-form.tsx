"use client"

import { useState, FormEvent } from "react"
import { Plus, X } from "lucide-react"
import { createProduct, updateProduct } from "@/app/admin/actions"
import { ImageUploader } from "./image-uploader"

interface Category {
    id: string
    name: string
}

interface Color {
    name: string
    hex: string
    available: boolean
}

interface Dimensions {
    length: string
    width: string
    height: string
    unit: string
}

interface Product {
    id: string
    name: string
    description: string | null
    long_description: string | null
    price: number
    category_id: string | null
    images: string[]
    hover_image: string | null
    materials: string[] | null
    care_instructions: string[] | null
    craftsman: string | null
    made_in: string | null
    estimated_delivery: string | null
    stock: number
    customizable: boolean
    is_active: boolean
    colors: Color[] | null
    dimensions: Record<string, number | string> | null
}

interface Props {
    product?: Product
    categories: Category[]
}

export function ProductForm({ product, categories }: Props) {
    const [images, setImages] = useState<string[]>(product?.images ?? [])
    const [hoverImage, setHoverImage] = useState(product?.hover_image ?? "")
    const [colors, setColors] = useState<Color[]>(
        Array.isArray(product?.colors) ? (product.colors as Color[]) : []
    )
    const [dimensions, setDimensions] = useState<Dimensions>({
        length: String(product?.dimensions?.length ?? ""),
        width: String(product?.dimensions?.width ?? ""),
        height: String(product?.dimensions?.height ?? ""),
        unit: String(product?.dimensions?.unit ?? "cm"),
    })
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // ── Image helpers ────────────────────────────────────────────────
    function updateImage(i: number, url: string) {
        if (!url) {
            setImages((prev) => prev.filter((_, j) => j !== i))
        } else {
            setImages((prev) => prev.map((u, j) => (j === i ? url : u)))
        }
    }

    // ── Color helpers ────────────────────────────────────────────────
    function addColor() {
        setColors([...colors, { name: "", hex: "#8b6f47", available: true }])
    }
    function updateColor(i: number, field: keyof Color, value: string | boolean) {
        setColors(colors.map((c, j) => (j === i ? { ...c, [field]: value } : c)))
    }
    function removeColor(i: number) {
        setColors(colors.filter((_, j) => j !== i))
    }

    // ── Submit ───────────────────────────────────────────────────────
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)

        const fd = new FormData(e.currentTarget)

        // Append computed state values
        fd.set("images", images.join(","))
        fd.set("hoverImage", hoverImage)
        fd.set("colors", JSON.stringify(colors))
        fd.set(
            "dimensions",
            JSON.stringify({
                length: parseFloat(dimensions.length) || 0,
                width: parseFloat(dimensions.width) || 0,
                height: parseFloat(dimensions.height) || 0,
                unit: dimensions.unit,
            })
        )

        try {
            let result: { error: string } | undefined
            if (product) {
                result = (await updateProduct(product.id, fd)) as any
            } else {
                result = (await createProduct(fd)) as any
            }
            if (result?.error) {
                setError(result.error)
                setSubmitting(false)
            }
        } catch {
            // redirect() throws a Next.js special error — expected on success
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                    {error}
                </div>
            )}

            {/* ── Basic Info ─────────────────────────────────────────────── */}
            <section className="bg-card border border-border rounded-lg p-6 space-y-5">
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                    Basic Info
                </h2>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        Product Name *
                    </label>
                    <input
                        name="name"
                        required
                        defaultValue={product?.name}
                        placeholder="e.g. Artisan Oak Dining Table"
                        className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Price (€) *</label>
                        <input
                            name="price"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            defaultValue={product?.price}
                            placeholder="1299.00"
                            className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Stock</label>
                        <input
                            name="stock"
                            type="number"
                            min="0"
                            defaultValue={product?.stock ?? 0}
                            className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                        <select
                            name="categoryId"
                            defaultValue={product?.category_id ?? ""}
                            className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="">— No category —</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="customizable"
                            value="true"
                            defaultChecked={product?.customizable}
                            className="h-4 w-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm text-foreground">Customizable</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isActive"
                            value="true"
                            defaultChecked={product?.is_active ?? true}
                            className="h-4 w-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm text-foreground">Active (visible in shop)</span>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        Short Description *
                    </label>
                    <textarea
                        name="description"
                        required
                        rows={3}
                        defaultValue={product?.description ?? ""}
                        placeholder="Brief description shown in product cards..."
                        className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        Long Description
                    </label>
                    <textarea
                        name="longDescription"
                        rows={5}
                        defaultValue={product?.long_description ?? ""}
                        placeholder="Full product story shown on the product detail page..."
                        className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                </div>
            </section>

            {/* ── Images ─────────────────────────────────────────────────── */}
            <section className="bg-card border border-border rounded-lg p-6 space-y-5">
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                    Images
                </h2>

                <div>
                    <p className="text-sm font-medium text-foreground mb-3">
                        Product Images
                        <span className="text-muted-foreground ml-1 text-xs">(up to 6 — first is main)</span>
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {images.map((url, i) => (
                            <ImageUploader key={i} value={url} onChange={(u) => updateImage(i, u)} />
                        ))}
                        {images.length < 6 && (
                            <ImageUploader
                                key="new"
                                value=""
                                onChange={(u) => {
                                    if (u) setImages((prev) => [...prev, u])
                                }}
                            />
                        )}
                    </div>
                </div>

                <div>
                    <ImageUploader
                        label="Hover Image (shown when cursor hovers over product card)"
                        value={hoverImage}
                        onChange={setHoverImage}
                    />
                </div>
            </section>

            {/* ── Details ────────────────────────────────────────────────── */}
            <section className="bg-card border border-border rounded-lg p-6 space-y-5">
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                    Details &amp; Provenance
                </h2>

                <div className="grid sm:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Craftsman</label>
                        <input
                            name="craftsman"
                            defaultValue={product?.craftsman ?? ""}
                            placeholder="Master Craftsman Name"
                            className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Made In</label>
                        <input
                            name="madeIn"
                            defaultValue={product?.made_in ?? ""}
                            placeholder="e.g. Poland"
                            className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Est. Delivery
                        </label>
                        <input
                            name="estimatedDelivery"
                            defaultValue={product?.estimated_delivery ?? ""}
                            placeholder="e.g. 4–6 weeks"
                            className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Materials</label>
                        <textarea
                            name="materials"
                            rows={4}
                            defaultValue={(product?.materials ?? []).join("\n")}
                            placeholder={"One per line\ne.g.\nSolid oak\nOrganic linseed oil"}
                            className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">One material per line</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Care Instructions
                        </label>
                        <textarea
                            name="care"
                            rows={4}
                            defaultValue={(product?.care_instructions ?? []).join("\n")}
                            placeholder={"One per line\ne.g.\nWipe with damp cloth\nAvoid direct sunlight"}
                            className="w-full px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">One instruction per line</p>
                    </div>
                </div>
            </section>

            {/* ── Specifications ─────────────────────────────────────────── */}
            <section className="bg-card border border-border rounded-lg p-6 space-y-6">
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                    Specifications
                </h2>

                {/* Dimensions */}
                <div>
                    <p className="text-sm font-medium text-foreground mb-3">Dimensions</p>
                    <div className="flex flex-wrap items-end gap-3">
                        {(["length", "width", "height"] as const).map((d) => (
                            <div key={d}>
                                <label className="block text-xs text-muted-foreground mb-1 capitalize">{d}</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={dimensions[d]}
                                    onChange={(e) =>
                                        setDimensions({ ...dimensions, [d]: e.target.value })
                                    }
                                    placeholder="0"
                                    className="w-24 px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs text-muted-foreground mb-1">Unit</label>
                            <select
                                value={dimensions.unit}
                                onChange={(e) => setDimensions({ ...dimensions, unit: e.target.value })}
                                className="px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="cm">cm</option>
                                <option value="mm">mm</option>
                                <option value="in">in</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-foreground">Available Colors</p>
                        <button
                            type="button"
                            onClick={addColor}
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Color
                        </button>
                    </div>
                    <div className="space-y-3">
                        {colors.map((color, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={color.hex}
                                    onChange={(e) => updateColor(i, "hex", e.target.value)}
                                    className="h-10 w-10 rounded border border-border cursor-pointer"
                                />
                                <input
                                    value={color.name}
                                    onChange={(e) => updateColor(i, "name", e.target.value)}
                                    placeholder="Color name (e.g. Natural Oak)"
                                    className="flex-1 px-3 py-2.5 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={color.available}
                                        onChange={(e) => updateColor(i, "available", e.target.checked)}
                                        className="h-3.5 w-3.5 accent-primary"
                                    />
                                    In stock
                                </label>
                                <button
                                    type="button"
                                    onClick={() => removeColor(i)}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {colors.length === 0 && (
                            <p className="text-xs text-muted-foreground py-2">
                                No colors added yet.{" "}
                                <button type="button" onClick={addColor} className="text-primary hover:underline">
                                    Add a color option
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Submit ─────────────────────────────────────────────────── */}
            <div className="flex gap-3 pb-10">
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? "Saving…" : product ? "Update Product" : "Create Product"}
                </button>
                <a
                    href="/admin/products"
                    className="px-8 py-3 border border-border rounded-md font-medium hover:bg-muted transition-colors text-foreground text-sm flex items-center"
                >
                    Cancel
                </a>
            </div>
        </form>
    )
}
