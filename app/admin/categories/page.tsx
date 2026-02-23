"use client"

import { useEffect, useState, useTransition, FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit, Trash2, X, Check, FolderOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/actions"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

type EditState = { id: string; name: string; description: string } | null

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const supabase = createClient()
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url")
      .order("name")
    setCategories(data ?? [])
    setLoading(false)
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setError(null)
    const fd = new FormData()
    fd.set("name", newName.trim())
    fd.set("description", newDesc.trim())
    startTransition(async () => {
      const result = await createCategory(fd)
      if (result?.error) {
        setError(result.error)
        return
      }
      setNewName("")
      setNewDesc("")
      setShowAdd(false)
      await fetchCategories()
    })
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault()
    if (!editState) return
    setError(null)
    const fd = new FormData()
    fd.set("name", editState.name)
    fd.set("description", editState.description)
    startTransition(async () => {
      const result = await updateCategory(editState.id, fd)
      if (result?.error) {
        setError(result.error)
        return
      }
      setEditState(null)
      await fetchCategories()
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setDeleteId(null)
    })
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-1">Categories</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${categories.length} categories`}
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setError(null) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex justify-between items-center">
          {error}
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add Card */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-card border-2 border-primary/40 rounded-lg p-5"
            >
              <form onSubmit={handleCreate} className="space-y-3">
                <p className="text-sm font-semibold text-foreground">New Category</p>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Category name *"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAdd(false); setNewName(""); setNewDesc("") }}
                    className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Cards */}
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-muted animate-pulse rounded-lg" />
          ))
        ) : (
          categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-lg p-5"
            >
              {editState?.id === cat.id ? (
                /* Inline edit form */
                <form onSubmit={handleUpdate} className="space-y-3">
                  <input
                    autoFocus
                    value={editState.name}
                    onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <textarea
                    value={editState.description}
                    onChange={(e) => setEditState({ ...editState, description: e.target.value })}
                    rows={2}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditState(null)}
                      className="px-3 py-1.5 border border-border rounded text-xs hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Normal display */
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-md shrink-0">
                      <FolderOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground truncate">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground/60 mt-1">/{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <button
                      onClick={() =>
                        setEditState({
                          id: cat.id,
                          name: cat.name,
                          description: cat.description ?? "",
                        })
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-foreground border border-border rounded hover:bg-muted transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(cat.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-destructive border border-border rounded hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))
        )}

        {!loading && categories.length === 0 && !showAdd && (
          <div className="col-span-full text-center py-14 text-muted-foreground">
            <FolderOpen className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm mb-2">No categories yet.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="text-primary text-sm hover:underline"
            >
              Create your first category →
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-lg p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-serif text-foreground mb-2">Delete category?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Deleting this category will not delete the products inside it — they&apos;ll just
                become uncategorised.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteId && handleDelete(deleteId)}
                  className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

