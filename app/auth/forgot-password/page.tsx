"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { requestPasswordReset } from "@/app/auth/actions"

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await requestPasswordReset(formData)
            if (result?.error) setError(result.error)
            else if (result?.success) setSuccess(result.message ?? "Reset email sent.")
        })
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                </Link>

                <Link href="/" className="font-serif text-2xl tracking-[0.3em] uppercase block mb-10">
                    Woodkari
                </Link>

                <h1 className="font-serif text-3xl mb-2">Reset Password</h1>
                <p className="text-muted-foreground text-sm mb-10">
                    Enter your email and we'll send you a reset link.
                </p>

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 border border-border text-center space-y-4"
                    >
                        <CheckCircle2 className="h-10 w-10 mx-auto text-primary" />
                        <p className="font-serif text-lg">Email sent</p>
                        <p className="text-muted-foreground text-sm">{success}</p>
                    </motion.div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-transparent border-b border-border py-3 text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/60"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full py-4 bg-foreground text-background text-sm tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isPending ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    )
}
