"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface Category {
    id: string
    name: string
    slug: string
}

interface Props {
    categories: Category[]
    activeSlug: string
}

export function ShopFilters({ categories, activeSlug }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    function select(slug: string) {
        startTransition(() => {
            if (slug === "all") {
                router.push("/shop")
            } else {
                router.push(`/shop?category=${slug}`)
            }
        })
    }

    return (
        <nav className={`flex flex-wrap items-center justify-center gap-4 md:gap-8 transition-opacity ${isPending ? "opacity-50" : ""}`}>
            <button
                onClick={() => select("all")}
                className={`text-sm tracking-widest uppercase transition-all duration-300 pb-1 border-b-2 ${activeSlug === "all"
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
            >
                All
            </button>
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => select(cat.slug)}
                    className={`text-sm tracking-widest uppercase transition-all duration-300 pb-1 border-b-2 ${activeSlug === cat.slug
                            ? "border-foreground text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    {cat.name}
                </button>
            ))}
        </nav>
    )
}
