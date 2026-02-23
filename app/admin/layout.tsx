import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata = {
  title: "Admin — Woodkari",
  description: "Woodkari Admin Panel",
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Proxy handles redirects for most cases, but
  // /admin/login itself is excluded from the proxy, so handle it explicitly.
  if (!user) {
    redirect("/admin/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  // Not an admin — send back home
  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  return (
    <AdminShell userEmail={user.email!} userName={profile.full_name}>
      {children}
    </AdminShell>
  )
}
