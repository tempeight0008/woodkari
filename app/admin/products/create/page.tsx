import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"

export const metadata = { title: "New Product — Woodkari Admin" }

export default async function CreateProductPage() {
    const supabase = await createClient()
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .order("name")

    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto">
            <div className="mb-8">
                <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase mb-1">
                    Products / New
                </p>
                <h1 className="font-serif text-3xl text-foreground">New Product</h1>
            </div>

            <ProductForm categories={categories ?? []} />
        </div>
    )
}
