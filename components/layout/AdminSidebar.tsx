"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  Users, 
  History, 
  Heart, 
  UserCheck, 
  ChevronRight 
} from "lucide-react"
import { cn } from "@/lib/utils"

const adminLinks = [
  { name: "Analytics", href: "/admin", icon: BarChart3 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Manage Draws", href: "/admin/draws", icon: History },
  { name: "Charities", href: "/admin/charities", icon: Heart },
  { name: "Winners", href: "/admin/winners", icon: UserCheck },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-4 space-y-1">
      {adminLinks.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "group flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all rounded-lg",
              isActive 
                ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100" 
                : "text-surface-500 hover:text-surface-900 hover:bg-surface-50"
            )}
          >
            <link.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-brand-600" : "group-hover:text-surface-900")} />
            {link.name}
            <ChevronRight className={cn("ml-auto w-4 h-4 transition-all", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
          </Link>
        )
      })}
    </nav>
  )
}
