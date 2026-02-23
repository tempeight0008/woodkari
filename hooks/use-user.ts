"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"

interface UseUserReturn {
    user: User | null
    profile: Profile | null
    isLoading: boolean
    isAdmin: boolean
}

/** Fetch profile with a 6-second timeout so a hanging DB query never freezes the UI. */
async function fetchProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient()
    const timeout = new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 6000)
    )
    const query = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

    try {
        const result = await Promise.race([query, timeout])
        return result.data as Profile | null
    } catch {
        return null
    }
}

/**
 * Reactive hook that returns the current Supabase auth user
 * and their profile row. Updates automatically on sign-in/sign-out.
 */
export function useUser(): UseUserReturn {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()
        let mounted = true

        // Initial session fetch — runs once on mount
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!mounted) return
            setUser(user)
            if (user) {
                const p = await fetchProfile(user.id)
                if (mounted) setProfile(p)
            }
            if (mounted) setIsLoading(false)
        })

        // Listen for auth state changes (login / logout / token refresh)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return
            const currentUser = session?.user ?? null
            setUser(currentUser)

            if (currentUser) {
                const p = await fetchProfile(currentUser.id)
                if (mounted) setProfile(p)
            } else {
                setProfile(null)
            }
            if (mounted) setIsLoading(false)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    return {
        user,
        profile,
        isLoading,
        isAdmin: profile?.role === "admin",
    }
}
