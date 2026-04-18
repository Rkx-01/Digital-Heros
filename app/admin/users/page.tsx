"use client"


import * as React from "react"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
  Users, 
  Search, 
  Target, 
  Heart, 
  CreditCard, 
  ChevronRight, 
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Filter
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDate, cn, downloadAsCSV } from "@/lib/utils"
import Link from "next/link"

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  const fetchUsers = React.useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*, charities(name), subscriptions(status, plan)')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleExport = () => {
    const exportData = users.map(u => ({
      ID: u.id,
      FullName: u.full_name,
      Email: u.email,
      Role: u.role,
      Charity: u.charities?.name || 'N/A',
      Subscription: u.subscriptions?.[0]?.status || 'none',
      Plan: u.subscriptions?.[0]?.plan || 'N/A',
      Joined: new Date(u.created_at).toLocaleDateString()
    }))
    downloadAsCSV(exportData, `golfdraw-users-${new Date().toISOString().split('T')[0]}`)
  }

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="pt-20 text-center animate-pulse text-gray-500">Loading user database...</div>

  return (
    <div className="space-y-10 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 leading-tight">User Management</h1>
          <p className="text-surface-500 font-medium">View and manage all registered golfers and their activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 font-bold h-10 border-surface-200" onClick={handleExport}>
            <Filter className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* ── Search & Filter ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
           <input 
             type="text" 
             placeholder="Search by name or email..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-white border border-surface-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
           />
        </div>
      </div>

      {/* ── User Table ────────────────────────────────────────── */}
      <Card padding="none" className="overflow-hidden border-surface-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-surface-400 uppercase tracking-widest">Golfer</th>
                <th className="px-6 py-4 text-[10px] font-black text-surface-400 uppercase tracking-widest">Subscription Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-surface-400 uppercase tracking-widest">Preferred Charity</th>
                <th className="px-6 py-4 text-[10px] font-black text-surface-400 uppercase tracking-widest text-center">Joined</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredUsers.map((user) => {
                const sub = user.subscriptions?.[0]
                const isActive = sub?.status === 'active'
                return (
                  <tr key={user.id} className="hover:bg-surface-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-surface-900 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                          {user.full_name?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-colors">{user.full_name}</span>
                          <span className="text-[10px] font-extrabold uppercase text-surface-400 tracking-widest mt-0.5">{user.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <Badge variant={isActive ? "success" : "outline"} className="w-fit">
                          {sub?.status || 'No active plan'}
                        </Badge>
                        {sub && <span className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">{sub.plan}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-surface-50 flex items-center justify-center border border-surface-100">
                          <Heart className="w-3 h-3 text-brand-600" />
                        </div>
                        <span className="text-sm font-bold text-surface-700">{user.charities?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-surface-500 text-center">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <Link href={`/admin/users/${user.id}`}>
                         <Button variant="ghost" size="sm" className="h-9 px-4 font-bold border-surface-100 hover:bg-white hover:text-brand-600 hover:shadow-sm">
                           Manage <ChevronRight className="ml-1 w-4 h-4" />
                         </Button>
                       </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
