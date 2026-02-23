import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Next.js Proxy (formerly Middleware)
 * Runs on every request to:
 *  1. Refresh the Supabase session (access token) if it has expired.
 *  2. Protect admin routes — redirect unauthenticated / non-admin users.
 *  3. Protect account routes — redirect unauthenticated users.
 */
export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session — IMPORTANT: do not remove this
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // ── Protect /account/* routes ──────────────────────────────────────────────
    if (pathname.startsWith("/account")) {
        if (!user) {
            const loginUrl = request.nextUrl.clone()
            loginUrl.pathname = "/auth/login"
            loginUrl.searchParams.set("redirectTo", pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // ── Protect /admin/* routes ────────────────────────────────────────────────
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        if (!user) {
            const loginUrl = request.nextUrl.clone()
            loginUrl.pathname = "/admin/login"
            loginUrl.searchParams.set("redirectTo", pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Check admin role from the profiles table
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (!profile || profile.role !== "admin") {
            // Not an admin — redirect to home
            return NextResponse.redirect(new URL("/", request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static (static files)
         * - _next/image  (image optimisation)
         * - favicon.ico
         * - public folder files
         * - api routes that don't need auth
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
