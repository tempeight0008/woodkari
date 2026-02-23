"use client"

import { useState, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { AccountSidebar } from "@/components/account-sidebar"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { deleteAccount } from "@/app/account/actions"
import { useRouter } from "next/navigation"

// ─── Notification preferences ─────────────────────────────────────────────────
interface NotifPrefs {
  new_arrivals: boolean
  exclusive_offers: boolean
  order_updates: boolean
  editorial: boolean
}

const defaultPrefs: NotifPrefs = {
  new_arrivals: true,
  exclusive_offers: true,
  order_updates: true,
  editorial: false,
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [prefs, setPrefs] = useState<NotifPrefs>(defaultPrefs)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState("")
  const [deletePending, startDeleteTransition] = useTransition()

  // Load prefs from user_metadata
  useEffect(() => {
    if (user?.user_metadata?.notifications) {
      setPrefs({ ...defaultPrefs, ...user.user_metadata.notifications })
    }
  }, [user])

  async function togglePref(key: keyof NotifPrefs, value: boolean) {
    const updated = { ...prefs, [key]: value }
    setPrefs(updated)
    setSaving(true)
    const supabase = createClient()
    await supabase.auth.updateUser({ data: { notifications: updated } })
    setSaving(false)
  }

  function handleDeleteAccount() {
    startDeleteTransition(async () => {
      await deleteAccount()
      router.push("/")
    })
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
            <h1 className="font-serif text-3xl lg:text-4xl mb-2">My Account</h1>
            <p className="text-muted-foreground">Manage your preferences and settings</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12">
            <AccountSidebar />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex-1">
              <div className="max-w-2xl">

                {/* ── Email Preferences ────────────────────────────── */}
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl">Email Preferences</h2>
                    {saving && <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" />Saving…</span>}
                  </div>
                  {isLoading ? (
                    <div className="space-y-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-muted animate-pulse" />)}</div>
                  ) : (
                    <div className="space-y-6">
                      {([
                        { key: "new_arrivals" as const, label: "New Arrivals", desc: "Be the first to know about new collections" },
                        { key: "exclusive_offers" as const, label: "Exclusive Offers", desc: "Receive special promotions and private sales" },
                        { key: "order_updates" as const, label: "Order Updates", desc: "Shipping confirmations and delivery notifications" },
                        { key: "editorial" as const, label: "Editorial Content", desc: "Stories, styling tips, and behind-the-scenes" },
                      ] as const).map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between py-4 border-b border-border">
                          <div>
                            <Label className="text-sm font-medium">{label}</Label>
                            <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                          </div>
                          <Switch
                            checked={prefs[key]}
                            onCheckedChange={(v) => togglePref(key, v)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* ── Privacy ──────────────────────────────────────── */}
                <section className="mb-12">
                  <h2 className="font-serif text-2xl mb-6">Privacy</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-border">
                      <div>
                        <Label className="text-sm font-medium">Personalised Recommendations</Label>
                        <p className="text-xs text-muted-foreground mt-1">Allow us to suggest items based on your preferences</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-border">
                      <div>
                        <Label className="text-sm font-medium">Analytics Cookies</Label>
                        <p className="text-xs text-muted-foreground mt-1">Help us improve your experience</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </section>

                {/* ── Account / Danger Zone ─────────────────────── */}
                <section className="pt-8 border-t border-border">
                  <h2 className="font-serif text-2xl mb-6">Account</h2>
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                      <div>
                        <Label className="text-sm font-medium">Download Your Data</Label>
                        <p className="text-xs text-muted-foreground mt-1">Request a copy of all your personal data</p>
                      </div>
                      <Button variant="outline" className="text-sm tracking-[0.1em] uppercase bg-transparent">
                        Request Data
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                      <div>
                        <Label className="text-sm font-medium text-red-600">Delete Account</Label>
                        <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all data</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-sm tracking-[0.1em] uppercase text-red-600 border-red-600/30 hover:bg-red-600/10 hover:text-red-600 bg-transparent"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </section>

                {/* ── Delete confirmation dialog ─────────────────── */}
                <AnimatePresence>
                  {showDeleteConfirm && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center p-6"
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-background border border-border p-8 max-w-sm w-full space-y-6"
                      >
                        <div className="flex items-start gap-4">
                          <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-serif text-xl mb-2">Delete Account</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              This action is irreversible. All your orders, addresses, and data will be permanently removed.
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs tracking-wide text-muted-foreground">
                            Type <strong className="text-foreground">DELETE</strong> to confirm
                          </Label>
                          <input
                            value={deleteInput}
                            onChange={e => setDeleteInput(e.target.value)}
                            className="mt-2 w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-foreground"
                            placeholder="DELETE"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={handleDeleteAccount}
                            disabled={deleteInput !== "DELETE" || deletePending}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm tracking-widest uppercase"
                          >
                            {deletePending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
                          </Button>
                          <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteInput("") }} className="flex-1 bg-transparent text-sm tracking-widest uppercase">
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <PremiumFooter />
    </>
  )
}

