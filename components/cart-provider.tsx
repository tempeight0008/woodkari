"use client"

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useTransition,
    type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"
import {
    addToCart as addToCartAction,
    updateCartItemQuantity,
    removeCartItem,
    clearCart as clearCartAction,
    mergeGuestCart,
} from "@/app/cart/actions"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartProduct {
    id: string
    name: string
    price: number
    images: string[]
    hover_image: string | null
}

export interface CartItem {
    /** UUID of the cart_items row (Supabase) or a generated key (guest) */
    id: string
    product_id: string
    quantity: number
    selected_color: string | null
    product: CartProduct
}

interface CartContextValue {
    items: CartItem[]
    itemCount: number
    total: number
    isLoading: boolean
    addItem: (product: CartProduct, color?: string | null) => Promise<{ error?: string }>
    updateQuantity: (itemId: string, quantity: number) => Promise<void>
    removeItem: (itemId: string) => Promise<void>
    clearCart: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null)

// ─── Local-storage key for guest cart ─────────────────────────────────────────

const GUEST_CART_KEY = "woodkari_guest_cart"

function readGuestCart(): CartItem[] {
    if (typeof window === "undefined") return []
    try {
        const raw = localStorage.getItem(GUEST_CART_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function writeGuestCart(items: CartItem[]) {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

function clearGuestCart() {
    localStorage.removeItem(GUEST_CART_KEY)
}

function makeGuestId() {
    return `guest-${Math.random().toString(36).slice(2)}`
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [, startTransition] = useTransition()

    // ── Fetch Supabase cart ────────────────────────────────────────────────────
    const fetchSupabaseCart = useCallback(async (uid: string) => {
        const supabase = createClient()
        const { data } = await supabase
            .from("cart_items")
            .select(
                "id, product_id, quantity, selected_color, products(id, name, price, images, hover_image)"
            )
            .eq("user_id", uid)
            .order("created_at")

        if (data) {
            const mapped: CartItem[] = data.map((row: any) => ({
                id: row.id,
                product_id: row.product_id,
                quantity: row.quantity,
                selected_color: row.selected_color,
                product: row.products,
            }))
            setItems(mapped)
        }
        setIsLoading(false)
    }, [])

    // ── Auth state → load cart ─────────────────────────────────────────────────
    useEffect(() => {
        const supabase = createClient()

        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserId(user?.id ?? null)
            if (user) {
                // Merge any guest cart then load
                const guest = readGuestCart()
                if (guest.length > 0) {
                    const guestPayload = guest.map((i) => ({
                        product_id: i.product_id,
                        quantity: i.quantity,
                        selected_color: i.selected_color,
                    }))
                    startTransition(async () => {
                        await mergeGuestCart(guestPayload)
                        clearGuestCart()
                        await fetchSupabaseCart(user.id)
                    })
                } else {
                    fetchSupabaseCart(user.id)
                }
            } else {
                setItems(readGuestCart())
                setIsLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                const uid = session?.user?.id ?? null
                setUserId(uid)
                if (uid) {
                    const guest = readGuestCart()
                    if (guest.length > 0) {
                        startTransition(async () => {
                            await mergeGuestCart(
                                guest.map((i) => ({
                                    product_id: i.product_id,
                                    quantity: i.quantity,
                                    selected_color: i.selected_color,
                                }))
                            )
                            clearGuestCart()
                            await fetchSupabaseCart(uid)
                        })
                    } else {
                        fetchSupabaseCart(uid)
                    }
                } else {
                    setItems(readGuestCart())
                    setIsLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [fetchSupabaseCart])

    // ─── Actions ──────────────────────────────────────────────────────────────

    const addItem = useCallback(
        async (product: CartProduct, color?: string | null): Promise<{ error?: string }> => {
            const selectedColor = color ?? null

            if (userId) {
                // Optimistic update
                setItems((prev) => {
                    const existing = prev.find(
                        (i) => i.product_id === product.id && i.selected_color === selectedColor
                    )
                    if (existing) {
                        return prev.map((i) =>
                            i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
                        )
                    }
                    return [
                        ...prev,
                        {
                            id: makeGuestId(), // temp id, will be replaced on next fetch
                            product_id: product.id,
                            quantity: 1,
                            selected_color: selectedColor,
                            product,
                        },
                    ]
                })

                const result = await addToCartAction(product.id, selectedColor)
                if (result?.error) {
                    // Revert optimistic update
                    await fetchSupabaseCart(userId)
                    return { error: result.error }
                }
                // Refresh to get real IDs
                await fetchSupabaseCart(userId)
                return {}
            } else {
                // Guest: localStorage
                setItems((prev) => {
                    const existing = prev.find(
                        (i) => i.product_id === product.id && i.selected_color === selectedColor
                    )
                    let updated: CartItem[]
                    if (existing) {
                        updated = prev.map((i) =>
                            i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
                        )
                    } else {
                        updated = [
                            ...prev,
                            {
                                id: makeGuestId(),
                                product_id: product.id,
                                quantity: 1,
                                selected_color: selectedColor,
                                product,
                            },
                        ]
                    }
                    writeGuestCart(updated)
                    return updated
                })
                return {}
            }
        },
        [userId, fetchSupabaseCart]
    )

    const updateQuantity = useCallback(
        async (itemId: string, quantity: number) => {
            // Optimistic
            setItems((prev) => {
                const updated =
                    quantity <= 0
                        ? prev.filter((i) => i.id !== itemId)
                        : prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
                if (!userId) writeGuestCart(updated)
                return updated
            })

            if (userId) {
                await updateCartItemQuantity(itemId, quantity)
                await fetchSupabaseCart(userId)
            }
        },
        [userId, fetchSupabaseCart]
    )

    const removeItem = useCallback(
        async (itemId: string) => {
            setItems((prev) => {
                const updated = prev.filter((i) => i.id !== itemId)
                if (!userId) writeGuestCart(updated)
                return updated
            })
            if (userId) {
                await removeCartItem(itemId)
            }
        },
        [userId]
    )

    const clearCart = useCallback(async () => {
        setItems([])
        if (userId) {
            await clearCartAction()
        } else {
            clearGuestCart()
        }
    }, [userId])

    // ─── Derived ──────────────────────────────────────────────────────────────

    const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)
    const total = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0)

    return (
        <CartContext.Provider
            value={{ items, itemCount, total, isLoading, addItem, updateQuantity, removeItem, clearCart }}
        >
            {children}
        </CartContext.Provider>
    )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>")
    return ctx
}
