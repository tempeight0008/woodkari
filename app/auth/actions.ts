"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const redirectTo = (formData.get("redirectTo") as string) || "/"

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect(redirectTo)
}

// ─── Signup ───────────────────────────────────────────────────────────────────
export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    return {
        success: true,
        message: "Check your email for a confirmation link.",
    }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/")
}

// ─── Password Reset Request ───────────────────────────────────────────────────
export async function requestPasswordReset(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get("email") as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: "Password reset email sent." }
}

// ─── Update Password ──────────────────────────────────────────────────────────
export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get("password") as string

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/account", "layout")
    redirect("/account/profile")
}
