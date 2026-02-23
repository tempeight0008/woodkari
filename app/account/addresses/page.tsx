"use client"

import { useState, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MapPin, Edit2, Trash2, Check, X, Star, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { AccountSidebar } from "@/components/account-sidebar"
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type AddressInput,
} from "@/app/account/actions"
import type { Address } from "@/lib/supabase/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const empty = (): AddressInput => ({
  full_name: "",
  phone: null,
  address_line1: "",
  address_line2: null,
  city: "",
  state: null,
  postal_code: "",
  country: "Italy",
  is_default: false,
})

function toInput(a: Address): AddressInput {
  return {
    full_name: a.full_name,
    phone: a.phone,
    address_line1: a.address_line1,
    address_line2: a.address_line2,
    city: a.city,
    state: a.state ?? null,
    postal_code: a.postal_code,
    country: a.country,
    is_default: a.is_default,
  }
}

// ─── Address form (reused for add + edit) ─────────────────────────────────────

function AddressForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: AddressInput
  onSave: (data: AddressInput) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [form, setForm] = useState<AddressInput>(initial)
  const set = <K extends keyof AddressInput>(k: K, v: AddressInput[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4 p-6 border border-border bg-muted/20">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs tracking-wide uppercase text-muted-foreground">Full Name *</Label>
          <Input value={form.full_name} onChange={e => set("full_name", e.target.value)} className="mt-1.5 border-border/50" placeholder="John Doe" />
        </div>
        <div>
          <Label className="text-xs tracking-wide uppercase text-muted-foreground">Phone</Label>
          <Input value={form.phone ?? ""} onChange={e => set("phone", e.target.value || null)} type="tel" className="mt-1.5 border-border/50" />
        </div>
      </div>
      <div>
        <Label className="text-xs tracking-wide uppercase text-muted-foreground">Address Line 1 *</Label>
        <Input value={form.address_line1} onChange={e => set("address_line1", e.target.value)} className="mt-1.5 border-border/50" placeholder="123 Via Roma" />
      </div>
      <div>
        <Label className="text-xs tracking-wide uppercase text-muted-foreground">Address Line 2</Label>
        <Input value={form.address_line2 ?? ""} onChange={e => set("address_line2", e.target.value || null)} className="mt-1.5 border-border/50" placeholder="Apartment, suite, unit…" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-xs tracking-wide uppercase text-muted-foreground">City *</Label>
          <Input value={form.city} onChange={e => set("city", e.target.value)} className="mt-1.5 border-border/50" />
        </div>
        <div>
          <Label className="text-xs tracking-wide uppercase text-muted-foreground">State / Region</Label>
          <Input value={form.state ?? ""} onChange={e => set("state", e.target.value || null)} className="mt-1.5 border-border/50" />
        </div>
        <div>
          <Label className="text-xs tracking-wide uppercase text-muted-foreground">Postal Code *</Label>
          <Input value={form.postal_code} onChange={e => set("postal_code", e.target.value)} className="mt-1.5 border-border/50" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs tracking-wide uppercase text-muted-foreground">Country</Label>
          <Input value={form.country} onChange={e => set("country", e.target.value)} className="mt-1.5 border-border/50" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_default ?? false}
          onChange={e => set("is_default", e.target.checked)}
          className="rounded"
        />
        Set as default address
      </label>
      <div className="flex gap-3 pt-2">
        <Button onClick={() => onSave(form)} disabled={isPending} className="text-sm tracking-widest uppercase py-5 px-6">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
          Save
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isPending} className="text-sm tracking-widest uppercase py-5 px-6 bg-transparent">
          <X className="h-4 w-4 mr-1.5" /> Cancel
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getAddresses()
    if (result.data) setAddresses(result.data)
    setIsLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleAdd(data: AddressInput) {
    setError(null)
    startTransition(async () => {
      const result = await createAddress(data)
      if (result.error) { setError(result.error); return }
      setAdding(false)
      await load()
    })
  }

  function handleEdit(id: string, data: AddressInput) {
    setError(null)
    startTransition(async () => {
      const result = await updateAddress(id, data)
      if (result.error) { setError(result.error); return }
      setEditingId(null)
      await load()
    })
  }

  function handleDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteAddress(id)
      if (result.error) { setError(result.error); return }
      await load()
    })
  }

  function handleSetDefault(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await setDefaultAddress(id)
      if (result.error) { setError(result.error); return }
      await load()
    })
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
            <h1 className="font-serif text-3xl lg:text-4xl mb-2">My Account</h1>
            <p className="text-muted-foreground">Manage your shipping addresses</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12">
            <AccountSidebar />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex-1">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl">Saved Addresses</h2>
                {!adding && (
                  <Button variant="outline" onClick={() => setAdding(true)} className="gap-2 text-sm tracking-[0.1em] uppercase bg-transparent">
                    <Plus className="h-4 w-4" />
                    Add New
                  </Button>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 text-destructive text-sm rounded">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Add form */}
              <AnimatePresence>
                {adding && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
                    <AddressForm
                      initial={empty()}
                      onSave={handleAdd}
                      onCancel={() => setAdding(false)}
                      isPending={isPending}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {isLoading ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {[1, 2].map(i => <div key={i} className="h-48 bg-muted animate-pulse" />)}
                </div>
              ) : addresses.length === 0 && !adding ? (
                <div className="text-center py-16 border border-dashed border-border">
                  <MapPin className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground text-sm mb-4">No saved addresses yet.</p>
                  <Button variant="outline" onClick={() => setAdding(true)} className="gap-2 text-sm tracking-widest uppercase bg-transparent">
                    <Plus className="h-4 w-4" /> Add Address
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {addresses.map((addr, index) => (
                    <motion.div key={addr.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.08 }}>
                      {editingId === addr.id ? (
                        <AddressForm
                          initial={toInput(addr)}
                          onSave={(data) => handleEdit(addr.id, data)}
                          onCancel={() => setEditingId(null)}
                          isPending={isPending}
                        />
                      ) : (
                        <div className={`relative border p-6 transition-colors ${addr.is_default ? "border-foreground" : "border-border"}`}>
                          {addr.is_default && (
                            <span className="absolute top-4 right-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" /> Default
                            </span>
                          )}
                          <div className="flex items-start gap-3 mb-4">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{addr.full_name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1 ml-7">
                            <p>{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}</p>
                            <p>{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postal_code}</p>
                            <p>{addr.country}</p>
                            {addr.phone && <p className="pt-2">{addr.phone}</p>}
                          </div>
                          <div className="flex gap-4 mt-6 ml-7 flex-wrap">
                            <button onClick={() => setEditingId(addr.id)} disabled={isPending} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <Edit2 className="h-3 w-3" /> Edit
                            </button>
                            {!addr.is_default && (
                              <>
                                <button onClick={() => handleSetDefault(addr.id)} disabled={isPending} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                  <Star className="h-3 w-3" /> Set Default
                                </button>
                                <button onClick={() => handleDelete(addr.id)} disabled={isPending} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-600 transition-colors">
                                  <Trash2 className="h-3 w-3" /> Remove
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <PremiumFooter />
    </>
  )
}

