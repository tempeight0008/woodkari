"use client"

import { Suspense, useState, useTransition } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { login } from "@/app/auth/actions"

function LoginForm() {
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get("redirectTo") ?? "/"
    const callbackError = searchParams.get("error")

    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(
        callbackError === "auth_callback_failed" ? "Authentication failed. Please try again." : null
    )
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        const formData = new FormData(e.currentTarget)
        formData.set("redirectTo", redirectTo)

        startTransition(async () => {
            const result = await login(formData)
            if (result?.error) setError(result.error)
        })
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left decorative panel */}
            <div className="hidden lg:flex w-[45%] bg-primary items-end p-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Link href="/" className="font-serif text-3xl tracking-[0.3em] uppercase text-primary-foreground block mb-8">
                        Woodkari
                    </Link>
                    <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-sm">
                        Welcome back. Every piece you love is waiting for you.
                    </p>
                </motion.div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <Link href="/" className="lg:hidden font-serif text-2xl tracking-[0.3em] uppercase block mb-12 text-center">
                        Woodkari
                    </Link>

                    <h1 className="font-serif text-3xl mb-2">Sign In</h1>
                    <p className="text-muted-foreground text-sm mb-10">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                            Create one
                        </Link>
                    </p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="hidden" name="redirectTo" value={redirectTo} />

                        <div>
                            <label htmlFor="email" className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="w-full bg-transparent border-b border-border py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/60"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-xs tracking-[0.15em] uppercase text-muted-foreground">
                                    Password
                                </label>
                                <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    className="w-full bg-transparent border-b border-border py-3 text-sm outline-none focus:border-foreground transition-colors pr-10 placeholder:text-muted-foreground/60"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-foreground text-background text-sm tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isPending ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <LoginForm />
        </Suspense>
    )
}