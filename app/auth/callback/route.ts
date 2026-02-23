import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Supabase OAuth / magic-link callback handler.
 * Supabase redirects here after email confirmation or OAuth sign-in.
 * It exchanges the code for a session and redirects the user.
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/"

    // Prevent open-redirect: only allow relative paths (start with /)
    // and reject any protocol-relative or absolute URLs.
    const safeNext =
        next.startsWith("/") && !next.startsWith("//") ? next : "/"

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(`${origin}${safeNext}`)
        }
    }

    // If anything goes wrong send them back to login with an error hint
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
