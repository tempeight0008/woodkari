"use client"

import { useState, useEffect, useTransition } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { AccountSidebar } from "@/components/account-sidebar"
import { useUser } from "@/hooks/use-user"
import { updateProfile, updatePassword as changePassword } from "@/app/account/actions"

// ─── Small feedback banner ────────────────────────────────────────────────────
function Feedback({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className={`flex items-center gap-2 p-3 text-sm ${type === "success" ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300" : "bg-destructive/10 text-destructive"}`}>
      {type === "success"
        ? <CheckCircle className="h-4 w-4 shrink-0" />
        : <AlertCircle className="h-4 w-4 shrink-0" />}
      {message}
    </div>
  )
}

export default function ProfilePage() {
  const { user, profile, isLoading } = useUser()

  // ── Profile form state ─────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [profilePending, startProfileTransition] = useTransition()

  // ── Password form state ────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordPending, startPasswordTransition] = useTransition()

  // Populate form when profile loads
  useEffect(() => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(" ")
      setFirstName(parts[0] ?? "")
      setLastName(parts.slice(1).join(" "))
    }
    if (profile?.phone) setPhone(profile.phone)
  }, [profile])

  function handleSaveProfile() {
    setProfileMsg(null)
    startProfileTransition(async () => {
      const result = await updateProfile({
        fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        phone,
      })
      setProfileMsg(result.success
        ? { type: "success", text: "Profile updated successfully." }
        : { type: "error", text: result.error ?? "Failed to update profile." })
    })
  }

  function handleChangePassword() {
    setPasswordMsg(null)
    if (!newPassword) { setPasswordMsg({ type: "error", text: "New password is required." }); return }
    startPasswordTransition(async () => {
      const result = await changePassword({ newPassword, confirmPassword })
      if (result.success) {
        setPasswordMsg({ type: "success", text: "Password changed successfully." })
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
      } else {
        setPasswordMsg({ type: "error", text: result.error ?? "Failed to update password." })
      }
    })
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
            <h1 className="font-serif text-3xl lg:text-4xl mb-2">My Account</h1>
            <p className="text-muted-foreground">Manage your profile and preferences</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12">
            <AccountSidebar />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex-1">
              <div className="max-w-2xl">

                {/* ── Personal Information ─────────────────────────────── */}
                <h2 className="font-serif text-2xl mb-8">Personal Information</h2>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-muted animate-pulse" />)}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Avatar placeholder */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-7 w-7 text-muted-foreground stroke-[1.5]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-xs tracking-wide uppercase text-muted-foreground">First Name</Label>
                        <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-2 border-border/50 focus:border-foreground" />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-xs tracking-wide uppercase text-muted-foreground">Last Name</Label>
                        <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="mt-2 border-border/50 focus:border-foreground" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-xs tracking-wide uppercase text-muted-foreground">Email Address</Label>
                      <Input id="email" type="email" value={user?.email ?? ""} disabled className="mt-2 border-border/50 opacity-60 cursor-not-allowed" />
                      <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-xs tracking-wide uppercase text-muted-foreground">Phone Number</Label>
                      <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-2 border-border/50 focus:border-foreground" placeholder="+39 000 000 0000" />
                    </div>

                    {profileMsg && <Feedback type={profileMsg.type} message={profileMsg.text} />}

                    <div className="pt-2">
                      <Button onClick={handleSaveProfile} disabled={profilePending} className="px-8 py-6 text-sm tracking-[0.15em] uppercase">
                        {profilePending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── Change Password ──────────────────────────────────── */}
                <div className="mt-16 pt-16 border-t border-border">
                  <h2 className="font-serif text-2xl mb-8">Change Password</h2>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="currentPassword" className="text-xs tracking-wide uppercase text-muted-foreground">Current Password</Label>
                      <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-2 border-border/50 focus:border-foreground" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-xs tracking-wide uppercase text-muted-foreground">New Password</Label>
                      <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-2 border-border/50 focus:border-foreground" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-xs tracking-wide uppercase text-muted-foreground">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-2 border-border/50 focus:border-foreground" />
                    </div>

                    {passwordMsg && <Feedback type={passwordMsg.type} message={passwordMsg.text} />}

                    <div className="pt-2">
                      <Button variant="outline" onClick={handleChangePassword} disabled={passwordPending} className="px-8 py-6 text-sm tracking-[0.15em] uppercase bg-transparent">
                        {passwordPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating…</> : "Update Password"}
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <PremiumFooter />
    </>
  )
}


