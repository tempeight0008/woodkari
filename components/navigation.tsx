"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingBag, Menu, X, User, LogOut, Settings, Package, ChevronDown, LayoutDashboard, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MiniCart } from "./mini-cart"
import { useUser } from "@/hooks/use-user"
import { logout } from "@/app/auth/actions"
import { useCart } from "@/components/cart-provider"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { user, profile, isAdmin } = useUser()
  const { itemCount } = useCart()
  const [, startLogoutTransition] = useTransition()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isUserMenuOpen])

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false)
      }
    }
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isSearchOpen])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/heritage", label: "Our Craftsmen" },
  ]

  const navItemColor = isScrolled ? "text-foreground" : "text-white"
  const navItemHoverColor = isScrolled ? "text-foreground/60 hover:text-foreground" : "text-white/70 hover:text-white"
  const iconColor = isScrolled ? "text-foreground" : "text-white"

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-transparent"
          }`}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 -ml-2 transition-colors duration-500 ${iconColor}`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 stroke-[1.5]" /> : <Menu className="h-5 w-5 stroke-[1.5]" />}
            </button>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-12">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-[0.2em] uppercase transition-colors duration-500 ${pathname === link.href ? navItemColor : navItemHoverColor
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Logo - Woodkari */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 font-serif text-xl lg:text-2xl tracking-[0.3em] uppercase text-primary"
            >
              Woodkari
            </Link>

            {/* Right icons */}
            <div className="flex items-center gap-2 lg:gap-4">
              <div ref={searchContainerRef} className="relative hidden sm:flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className={`w-full bg-transparent border-b text-sm py-1 pr-2 outline-none transition-colors duration-500 ${isScrolled
                          ? "border-foreground/30 text-foreground placeholder:text-foreground/50"
                          : "border-white/30 text-white placeholder:text-white/50"
                          }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="Search"
                  className={`p-2 transition-colors duration-500 ${iconColor}`}
                >
                  {isSearchOpen ? <X className="h-5 w-5 stroke-[1.5]" /> : <Search className="h-5 w-5 stroke-[1.5]" />}
                </button>
              </div>

              {/* User menu */}
              <div ref={userMenuRef} className="relative hidden sm:block">
                {user ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      aria-label="Account menu"
                      className={`flex items-center gap-1 p-2 transition-colors duration-500 relative ${iconColor}`}
                    >
                      <User className="h-5 w-5 stroke-[1.5]" />
                      {isAdmin && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                        </span>
                      )}
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-background border border-border shadow-lg py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-medium truncate">{profile?.full_name ?? "My Account"}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                          </div>
                          <Link
                            href="/account/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                          >
                            <User className="h-4 w-4" /> Profile
                          </Link>
                          <Link
                            href="/account/orders"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                          >
                            <Package className="h-4 w-4" /> Orders
                          </Link>
                          <Link
                            href="/account/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                          >
                            <Settings className="h-4 w-4" /> Settings
                          </Link>
                          {isAdmin && (
                            <>
                              <div className="px-4 pt-3 pb-1 border-t border-border mt-1">
                                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Admin</p>
                              </div>
                              <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                              >
                                <LayoutDashboard className="h-4 w-4" />
                                Admin Dashboard
                              </Link>
                              <Link
                                href="/admin/products"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground/80"
                              >
                                <Package className="h-4 w-4" />
                                Manage Products
                              </Link>
                              <Link
                                href="/admin/categories"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground/80"
                              >
                                <ShieldCheck className="h-4 w-4" />
                                Manage Categories
                              </Link>
                            </>
                          )}
                          <button
                            onClick={() => startLogoutTransition(() => logout())}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors w-full border-t border-border mt-1"
                          >
                            <LogOut className="h-4 w-4" /> Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    aria-label="Sign in"
                    className={`p-2 transition-colors duration-500 ${iconColor}`}
                  >
                    <User className="h-5 w-5 stroke-[1.5]" />
                  </Link>
                )}
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Shopping cart"
                className={`p-2 -mr-2 relative transition-colors duration-500 ${iconColor}`}
              >
                <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
                {itemCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center transition-colors duration-500 ${isScrolled ? "bg-foreground text-background" : "bg-white text-foreground"
                      }`}
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 w-[280px] z-50 bg-background border-r border-border lg:hidden"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                <span className="font-serif text-lg tracking-[0.2em] uppercase">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2" aria-label="Close menu">
                  <X className="h-5 w-5 stroke-[1.5]" />
                </button>
              </div>
              <nav className="px-6 py-8 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-lg tracking-[0.15em] uppercase transition-colors ${pathname === link.href ? "text-foreground" : "text-foreground/60 hover:text-foreground"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border pt-6 mt-2">
                  <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase mb-4">Account</p>
                  {user ? (
                    <>
                      <p className="text-sm text-foreground/80 mb-4 truncate">{profile?.full_name ?? user.email}</p>
                      <Link href="/account/profile" className="block text-lg tracking-[0.15em] uppercase transition-colors text-foreground/60 hover:text-foreground mb-4">Profile</Link>
                      <Link href="/account/orders" className="block text-lg tracking-[0.15em] uppercase transition-colors text-foreground/60 hover:text-foreground mb-4">Orders</Link>
                      <Link href="/account/settings" className="block text-lg tracking-[0.15em] uppercase transition-colors text-foreground/60 hover:text-foreground mb-4">Settings</Link>
                      <button
                        onClick={() => startLogoutTransition(() => logout())}
                        className="block text-lg tracking-[0.15em] uppercase transition-colors text-destructive hover:text-destructive/80"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" className="block text-lg tracking-[0.15em] uppercase transition-colors text-foreground/60 hover:text-foreground mb-4">Sign In</Link>
                      <Link href="/auth/signup" className="block text-lg tracking-[0.15em] uppercase transition-colors text-foreground/60 hover:text-foreground">Create Account</Link>
                    </>
                  )}
                </div>
                {isAdmin && (
                  <div className="border-t border-border pt-6 mt-2">
                    <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase mb-4 flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </p>
                    <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg tracking-[0.15em] uppercase transition-colors text-primary hover:text-primary/80 mb-4">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link href="/admin/products" className="block text-lg tracking-[0.15em] uppercase transition-colors text-foreground/60 hover:text-foreground mb-4">Products</Link>
                    <Link href="/admin/categories" className="block text-lg tracking-[0.15em] uppercase transition-colors text-foreground/60 hover:text-foreground">Categories</Link>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mini cart */}
      <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
