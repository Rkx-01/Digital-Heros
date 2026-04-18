import * as React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { 
  Trophy, 
  BarChart3, 
  Users, 
  History, 
  Heart, 
  Gift, 
  ChevronRight,
  ArrowLeft,
  Settings,
  ShieldCheck,
  UserCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

import { AdminSidebar } from "@/components/layout/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* ── Admin Sidebar ────────────────────────────────────────── */}
      <aside className="w-68 hidden lg:flex flex-col border-r border-surface-200 bg-white shrink-0 pt-8 sticky top-0 h-screen shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
        <div className="px-6 mb-10">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-surface-900 rounded-lg flex items-center justify-center shadow-sm">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="font-heading text-xl font-extrabold tracking-tight text-surface-900">Admin<span className="text-brand-500">Hub</span></span>
          </Link>
        </div>

        <AdminSidebar />

        <div className="p-4 border-t border-surface-100 space-y-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-surface-500 hover:text-surface-900 font-semibold">
              <ArrowLeft className="w-4 h-4" />
              User Dashboard
            </Button>
          </Link>
          <div className="p-4 bg-surface-50 border border-surface-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-900 flex items-center justify-center text-[10px] font-black text-white">
                ADM
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-surface-900 truncate tracking-tight">System Admin</span>
                <span className="text-[9px] uppercase font-black text-surface-400 tracking-widest">Master Access</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}

interface LocalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost"
  size?: "sm" | "md"
}

function Button({ children, className, variant = "primary", size = "md", ...props }: LocalButtonProps) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    outline: "border border-surface-200 bg-white text-surface-900 hover:bg-surface-50",
    ghost: "text-surface-500 hover:text-surface-900 hover:bg-surface-100",
  }
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  }
  return (
    <button className={cn("rounded-lg font-medium transition-all flex items-center", variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
