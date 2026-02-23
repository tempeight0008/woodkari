/**
 * Auto-generated-style Supabase Database types.
 * Keep in sync with supabase/schema.sql.
 * After running migrations you can regenerate with:
 *   bunx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    phone: string | null
                    avatar_url: string | null
                    role: "customer" | "admin"
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    role?: "customer" | "admin"
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    role?: "customer" | "admin"
                    updated_at?: string
                }
                Relationships: []
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    image_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    description?: string | null
                    image_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    image_url?: string | null
                }
                Relationships: []
            }
            products: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string
                    long_description: string | null
                    price: number
                    category_id: string | null
                    images: string[]
                    hover_image: string | null
                    materials: string[]
                    care_instructions: string[]
                    dimensions: Json
                    colors: Json
                    customizable: boolean
                    craftsman: string | null
                    made_in: string | null
                    estimated_delivery: string | null
                    stock: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    description: string
                    long_description?: string | null
                    price: number
                    category_id?: string | null
                    images?: string[]
                    hover_image?: string | null
                    materials?: string[]
                    care_instructions?: string[]
                    dimensions?: Json
                    colors?: Json
                    customizable?: boolean
                    craftsman?: string | null
                    made_in?: string | null
                    estimated_delivery?: string | null
                    stock?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    description?: string
                    long_description?: string | null
                    price?: number
                    category_id?: string | null
                    images?: string[]
                    hover_image?: string | null
                    materials?: string[]
                    care_instructions?: string[]
                    dimensions?: Json
                    colors?: Json
                    customizable?: boolean
                    craftsman?: string | null
                    made_in?: string | null
                    estimated_delivery?: string | null
                    stock?: number
                    is_active?: boolean
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "products_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    }
                ]
            }
            addresses: {
                Row: {
                    id: string
                    user_id: string
                    full_name: string
                    phone: string | null
                    address_line1: string
                    address_line2: string | null
                    city: string
                    state: string | null
                    postal_code: string
                    country: string
                    is_default: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    full_name: string
                    phone?: string | null
                    address_line1: string
                    address_line2?: string | null
                    city: string
                    state?: string | null
                    postal_code: string
                    country: string
                    is_default?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    full_name?: string
                    phone?: string | null
                    address_line1?: string
                    address_line2?: string | null
                    city?: string
                    state?: string | null
                    postal_code?: string
                    country?: string
                    is_default?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: "addresses_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            cart_items: {
                Row: {
                    id: string
                    user_id: string
                    product_id: string
                    quantity: number
                    selected_color: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    product_id: string
                    quantity?: number
                    selected_color?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    quantity?: number
                    selected_color?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "cart_items_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "cart_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    }
                ]
            }
            orders: {
                Row: {
                    id: string
                    user_id: string
                    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
                    subtotal: number
                    shipping_cost: number
                    tax: number
                    total: number
                    shipping_address: Json
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
                    subtotal: number
                    shipping_cost?: number
                    tax?: number
                    total: number
                    shipping_address: Json
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
                    notes?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string
                    product_name: string
                    product_image: string | null
                    quantity: number
                    unit_price: number
                    selected_color: string | null
                }
                Insert: {
                    id?: string
                    order_id: string
                    product_id: string
                    product_name: string
                    product_image?: string | null
                    quantity: number
                    unit_price: number
                    selected_color?: string | null
                }
                Update: never
                Relationships: [
                    {
                        foreignKeyName: "order_items_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: "customer" | "admin"
            order_status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
        }
    }
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type Address = Database["public"]["Tables"]["addresses"]["Row"]
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]

// Extended types with joins
export type ProductWithCategory = Product & {
    categories: Pick<Category, "name" | "slug"> | null
}

export type CartItemWithProduct = CartItem & {
    products: Pick<Product, "name" | "price" | "images" | "slug"> | null
}

export type OrderWithItems = Order & {
    order_items: (OrderItem & {
        products: Pick<Product, "name" | "images" | "slug"> | null
    })[]
}
