"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

interface AdminShellProps {
    children: React.ReactNode
    userEmail: string
    userName: string | null
}

export function AdminShell({ children, userEmail, userName }: AdminShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-64 shrink-0 flex-col">
                <AdminSidebar userEmail={userEmail} userName={userName} />
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-foreground/40" onClick={() => setSidebarOpen(false)} />
                    <aside className="relative z-10 w-64 flex flex-col">
                        <AdminSidebar
                            userEmail={userEmail}
                            userName={userName}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile top bar */}
                <div className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-border bg-card">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-1.5 text-foreground/60 hover:text-foreground"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="font-serif text-lg tracking-[0.2em] uppercase">Woodkari Admin</span>
                </div>

                {/* Scrollable page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
