"use client"

import { useAuth } from "@/contexts/auth/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const navItems = [
    { href: "/orders", label: "Ordens de Serviço" },
    { href: "/reports", label: "Relatórios" },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/orders" className="text-lg font-semibold text-foreground">
            ServiceOS
          </Link>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant={pathname === item.href ? "secondary" : "ghost"} size="sm" className="text-sm">
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{user?.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </nav>
  )
}
