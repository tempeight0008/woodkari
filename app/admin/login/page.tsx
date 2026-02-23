"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react"
import { login } from "@/app/auth/actions"

/**
 * Admin Login — uses Supabase auth. The proxy verifies role = 'admin'
 * before allowing access to any /admin/* route beyond this page.
 */
export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("redirectTo", "/admin/dashboard")

    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error === "Invalid login credentials"
          ? "Invalid email or password."
          : result.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-foreground flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-2xl tracking-[0.3em] uppercase text-primary block mb-3">
            Woodkari
          </Link>
          <div className="inline-flex items-center gap-2 text-background/50 text-xs tracking-[0.2em] uppercase">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Panel
          </div>
        </div>

        <div className="bg-background/5 border border-background/10 p-8">
          <h1 className="font-serif text-2xl text-background mb-1">Sign In</h1>
          <p className="text-background/40 text-sm mb-8">Admin access only</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs tracking-[0.15em] uppercase text-background/50 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-transparent border-b border-background/20 py-3 text-sm text-background outline-none focus:border-primary transition-colors placeholder:text-background/30"
                placeholder="admin@woodkari.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs tracking-[0.15em] uppercase text-background/50 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="w-full bg-transparent border-b border-background/20 py-3 text-sm text-background outline-none focus:border-primary transition-colors pr-10 placeholder:text-background/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-background/40 hover:text-background transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-primary text-primary-foreground text-sm tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-background/30 text-xs">
          Not an admin?{" "}
          <Link href="/" className="text-background/50 hover:text-background transition-colors underline underline-offset-2">
            Go to store
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
