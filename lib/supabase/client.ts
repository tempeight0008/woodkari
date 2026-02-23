import { createBrowserClient } from "@supabase/ssr"
import { Database } from "./types"

/**
 * Use this client in Client Components ("use client")
 * and in browser-side code.
 */
export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
