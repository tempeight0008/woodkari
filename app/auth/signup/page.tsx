"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { signup } from "@/app/auth/actions"

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        const formData = new FormData(e.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.")
            return
        }

        startTransition(async () => {
            const result = await signup(formData)
            if (result?.error) {
                setError(result.error)
            } else if (result?.success) {
                setSuccess(result.message ?? "Account created! Please check your email.")
            }
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
                        Join a community that values craftsmanship, sustainability, and timeless design.
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
                    {/* Mobile logo */}
                    <Link href="/" className="lg:hidden font-serif text-2xl tracking-[0.3em] uppercase block mb-12 text-center">
                        Woodkari
                    </Link>

                    <h1 className="font-serif text-3xl mb-2">Create Account</h1>
                    <p className="text-muted-foreground text-sm mb-10">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
                            Sign in
                        </Link>
                    </p>

                    {/* Success state */}
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 border border-border text-center space-y-4"
                        >
                            <CheckCircle2 className="h-10 w-10 mx-auto text-primary" />
                            <p className="font-serif text-lg">Check your inbox</p>
                            <p className="text-muted-foreground text-sm">{success}</p>
                            <Link
                                href="/auth/login"
                                className="inline-block mt-4 text-sm tracking-[0.15em] uppercase border-b border-foreground pb-0.5 hover:text-primary transition-colors"
                            >
                                Back to Sign In
                            </Link>
                        </motion.div>
                    ) : (
                        <>
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
                                <div>
                                    <label htmlFor="fullName" className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        className="w-full bg-transparent border-b border-border py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/60"
                                        placeholder="Alessandro Rossi"
                                    />
                                </div>

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
                                    <label htmlFor="password" className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            autoComplete="new-password"
                                            className="w-full bg-transparent border-b border-border py-3 text-sm outline-none focus:border-foreground transition-colors pr-10 placeholder:text-muted-foreground/60"
                                            placeholder="Min. 8 characters"
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

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="new-password"
                                        className="w-full bg-transparent border-b border-border py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/60"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full py-4 bg-foreground text-background text-sm tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isPending ? "Creating account..." : "Create Account"}
                                </button>

                                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                                    By creating an account you agree to our{" "}
                                    <Link href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                                        Privacy Policy
                                    </Link>
                                    .
                                </p>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
