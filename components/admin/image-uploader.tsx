"use client"

import { useRef, useState } from "react"
import { Upload, X, ImageIcon } from "lucide-react"

interface Props {
    label?: string
    value: string
    onChange: (url: string) => void
    folder?: string
}

export function ImageUploader({ label, value, onChange, folder = "products" }: Props) {
    const ref = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function upload(file: File) {
        setUploading(true)
        setError(null)
        const fd = new FormData()
        fd.append("file", file)
        fd.append("folder", folder)
        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error ?? "Upload failed")
            onChange(json.url)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-1.5">
            {label && <p className="text-sm font-medium text-foreground">{label}</p>}
            {value ? (
                <div className="relative inline-block group">
                    <img
                        src={value}
                        alt={label ?? "image"}
                        className="w-32 h-32 object-cover rounded-lg border border-border bg-muted"
                    />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => ref.current?.click()}
                    className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {uploading ? (
                        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Upload className="h-5 w-5" />
                            <span className="text-[11px]">Upload</span>
                        </>
                    )}
                </button>
            )}
            <input
                ref={ref}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) upload(f)
                    e.target.value = ""
                }}
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    )
}
