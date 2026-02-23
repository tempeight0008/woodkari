"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransition } from "react"
import { LayoutDashboard, Package, FolderOpen, LogOut, ExternalLink, X } from "lucide-react"
import { logout } from "@/app/auth/actions"

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
]

interface AdminSidebarProps {
    userEmail: string
    userName: string | null
    onClose?: () => void
}

export function AdminSidebar({ userEmail, userName, onClose }: AdminSidebarProps) {
    const pathname = usePathname()
    const [, startTransition] = useTransition()

    return (
        <div className="flex flex-col h-full bg-foreground text-background">
            {/* Logo + close (mobile) */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-background/10">
                <Link href="/" className="font-serif text-xl tracking-[0.25em] uppercase text-primary">
                    Woodkari
                </Link>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-1 text-background/60 hover:text-background">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Admin label */}
            <div className="px-6 py-3">
                <span className="text-[10px] tracking-[0.3em] uppercase text-background/40">Admin Panel</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-2 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || pathname.startsWith(href + "/")
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors ${isActive
                                    ? "bg-background/10 text-background"
                                    : "text-background/60 hover:bg-background/5 hover:text-background"
                                }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-4 border-t border-background/10 space-y-1">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-background/60 hover:text-background hover:bg-background/5 rounded-md transition-colors"
                >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    View Store
                </Link>

                {/* User info + logout */}
                <div className="px-3 py-3 mt-1 border-t border-background/10">
                    <p className="text-xs font-medium text-background truncate">{userName ?? "Admin"}</p>
                    <p className="text-[11px] text-background/40 truncate mb-3">{userEmail}</p>
                    <button
                        onClick={() => startTransition(() => logout())}
                        className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}
