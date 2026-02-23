import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"

export const metadata = { title: "Edit Product — Woodkari Admin" }

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const [{ data: product }, { data: categories }] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).single(),
        supabase.from("categories").select("id, name").order("name"),
    ])

    if (!product) notFound()

    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto">
            <div className="mb-8">
                <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase mb-1">
                    Products / Edit
                </p>
                <h1 className="font-serif text-3xl text-foreground">{product.name}</h1>
            </div>

            <ProductForm product={product as any} categories={categories ?? []} />
        </div>
    )
}
