"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  Target, 
  Trophy, 
  Heart, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  ChevronRight,
  ShieldAlert
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

interface NavItem {
  label: string
  href: string
  icon: any
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Scores", href: "/dashboard/scores", icon: Target },
  { label: "Draws", href: "/dashboard/draws", icon: Trophy },
  { label: "Charity", href: "/dashboard/charity", icon: Heart },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = React.useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    async function getProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
    }
    getProfile()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-surface-50 text-surface-900 overflow-hidden">
      {/* ── Desktop Sidebar ────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-surface-200 bg-white z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
        <div className="p-8">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-surface-900 rounded-lg flex items-center justify-center shadow-sm">
              <Trophy className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-surface-900">Golf<span className="text-brand-600 font-black">Draw</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-brand-50 text-brand-700 font-bold" 
                    : "text-surface-500 hover:text-surface-900 hover:bg-surface-50 font-semibold"
                )}>
                  <div className="flex items-center gap-4 relative z-10">
                    <item.icon className={cn("w-4 h-4", isActive ? "text-brand-600" : "group-hover:text-surface-900")} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute inset-0 bg-brand-50 rounded-xl ring-1 ring-brand-100"
                    />
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-brand-600 relative z-10" />}
                </div>
              </Link>
            )
          })}

          {profile?.role === 'admin' && (
            <Link href="/admin">
              <div className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative mt-8 bg-surface-900 shadow-sm hover:scale-[1.02] active:scale-[0.98]",
                "text-white font-bold"
              )}>
                <div className="flex items-center gap-4 relative z-10">
                  <ShieldAlert className="w-4 h-4 text-brand-400" />
                  <span className="text-sm">Admin Portal</span>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-400 relative z-10" />
              </div>
            </Link>
          )}
        </nav>

        <div className="p-6 border-t border-surface-100 space-y-4">
          <div className="flex items-center gap-4 px-2">
            <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center border border-surface-200 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="text-surface-400 w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate text-surface-900">{profile?.full_name || "Golfer"}</span>
              <span className="text-[10px] uppercase font-black text-surface-400 tracking-widest">{profile?.role || "Member"}</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-surface-500 hover:text-surface-900 border-surface-100 hover:bg-surface-50" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* ── Mobile Top Nav ────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-surface-100 bg-white/80 backdrop-blur-md z-40 px-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Trophy className="text-surface-900 w-6 h-6" />
          <span className="font-extrabold text-lg tracking-tight text-surface-900">GolfDraw</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-surface-900">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* ── Mobile Menu Overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-50 lg:hidden p-8 pt-24"
          >
            <nav className="space-y-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={cn(
                    "flex items-center gap-4 p-4 rounded-xl text-xl font-bold",
                    pathname === item.href ? "bg-brand-50 text-brand-700 shadow-sm" : "text-surface-500"
                  )}>
                    <item.icon className="w-6 h-6" />
                    {item.label}
                  </div>
                </Link>
              ))}
              <div className="pt-8 border-t border-surface-100">
                <Button variant="danger" className="w-full h-16 text-lg gap-3" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" /> Logout
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pt-24 lg:pt-0">
        <div className="p-6 md:p-12 lg:p-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Floating Mobile Nav (Bottom) */}
        <div className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/90 backdrop-blur-xl border border-surface-100 rounded-2xl shadow-xl flex items-center justify-around z-30">
          {navItems.slice(0, 4).map((item) => {
             const isActive = pathname === item.href
             return (
               <Link key={item.href} href={item.href}>
                 <div className={cn(
                    "flex flex-col items-center gap-1 transition-colors",
                    isActive ? "text-brand-700" : "text-surface-400"
                 )}>
                   <item.icon className="w-5 h-5" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                 </div>
               </Link>
             )
          })}
        </div>
      </main>
    </div>
  )
}
