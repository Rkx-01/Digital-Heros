export const dynamic = 'force-dynamic';
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
  User, 
  Settings, 
  Target, 
  Heart, 
  CreditCard, 
  ArrowLeft,
  Trash2,
  Edit2,
  Save,
  Plus,
  Calendar,
  ShieldCheck,
  ShieldAlert
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDate, cn } from "@/lib/utils"
import Link from "next/link"

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = React.useState<any>(null)
  const [scores, setScores] = React.useState<any[]>([])
  const [subscription, setSubscription] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [editScore, setEditScore] = React.useState<{ id: string, score: number } | null>(null)

  const fetchData = React.useCallback(async () => {
    const supabase = createClient()
    const id = params.id as string

    // Fetch Profile
    const { data: profileData } = await supabase.from('profiles').select('*, charities(*)').eq('id', id).single()
    if (profileData) setProfile(profileData)

    // Fetch Scores
    const { data: scoreData } = await supabase.from('scores').select('*').eq('user_id', id).order('date', { ascending: false })
    if (scoreData) setScores(scoreData)

    // Fetch Subscription
    const { data: subData } = await supabase.from('subscriptions').select('*').eq('user_id', id).maybeSingle()
    if (subData) setSubscription(subData)

    setLoading(false)
  }, [params.id])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleRoleToggle() {
    setIsUpdating(true)
    const supabase = createClient()
    const newRole = profile.role === 'admin' ? 'user' : 'admin'
    
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profile.id)

    if (!error) setProfile({ ...profile, role: newRole })
    setIsUpdating(false)
  }

  async function handleUpdateScore(scoreId: string, newValue: number) {
    setIsUpdating(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('scores')
      .update({ score: newValue })
      .eq('id', scoreId)

    if (!error) {
       setScores(scores.map(s => s.id === scoreId ? { ...s, score: newValue } : s))
       setEditScore(null)
    }
    setIsUpdating(false)
  }

  async function handleDeleteScore(scoreId: string) {
    if (!confirm('Are you sure you want to delete this score?')) return
    setIsUpdating(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', scoreId)

    if (!error) setScores(scores.filter(s => s.id !== scoreId))
    setIsUpdating(false)
  }

  if (loading) return <div className="pt-20 text-center animate-pulse text-gray-500 font-bold uppercase tracking-widest">Accessing Golfer Vault...</div>

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full border border-surface-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black">{profile?.full_name}</h1>
          <p className="text-gray-500 text-sm">Golfer Audit & Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile & Sub Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 border-brand-500/20 bg-brand-500/5">
             <div className="flex items-center gap-4 mb-8">
               <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-3xl font-black shadow-xl shadow-brand-600/20">
                 {profile?.full_name?.charAt(0)}
               </div>
               <div>
                 <Badge variant={profile?.role === 'admin' ? 'accent' : 'outline'} className="mb-1">
                   {profile?.role}
                 </Badge>
                 <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Joined {formatDate(profile?.created_at)}</div>
               </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-surface-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Manage Role</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 text-[10px] font-black"
                    onClick={handleRoleToggle}
                    isLoading={isUpdating}
                  >
                    {profile?.role === 'admin' ? <ShieldAlert className="w-3 h-3 mr-1" /> : <ShieldCheck className="w-3 h-3 mr-1" />}
                    Promote to {profile?.role === 'admin' ? 'User' : 'Admin'}
                  </Button>
                </div>
             </div>
          </Card>

          <Card className="p-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Subscription Detail
            </h3>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-sm font-bold">{subscription.plan === 'yearly' ? 'Yearly Membership' : 'Monthly Membership'}</span>
                   <Badge variant={subscription.status === 'active' ? 'success' : 'outline'}>{subscription.status}</Badge>
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                   Next Charge: {formatDate(subscription.current_period_end)}
                </div>
                <div className="pt-2">
                  <p className="text-xs text-gray-400">Total Contribution: <span className="text-brand-400 font-bold">£{subscription.amount}</span></p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-600 text-sm font-bold">No active subscription found.</div>
            )}
          </Card>

          <Card className="p-8 border-accent-500/10 bg-accent-500/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-accent-500 mb-4 flex items-center gap-2">
               <Heart className="w-4 h-4" /> Charity Selection
            </h3>
            <p className="text-xl font-black">{profile?.charities?.name || "None Selection"}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-bold">Donation Split: {profile?.charity_contribution_pct}%</p>
          </Card>
        </div>

        {/* Score Management */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black flex items-center gap-3">
                 <Target className="text-brand-500" /> Score Ledger
              </h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{scores.length} Rounds recorded</p>
            </div>

            <div className="space-y-4">
              {scores.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-6 bg-surface-900/50 border border-surface-800 rounded-2xl hover:border-surface-700 transition-all group">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-surface-800 flex flex-col items-center justify-center">
                         <span className="text-[8px] uppercase font-black text-gray-500 leading-none mb-1">Score</span>
                         <span className="text-lg font-black text-white">{s.score}</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm font-bold text-white font-heading">Round on {s.date}</span>
                         <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Logged {formatDate(s.created_at)}</span>
                      </div>
                   </div>

                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editScore?.id === s.id && editScore ? (
                        <div className="flex items-center gap-2">
                           <input 
                             type="number" 
                             className="w-16 h-10 bg-surface-800 border-brand-500 text-white text-center rounded-lg font-bold"
                             value={editScore.score}
                             onChange={(e) => setEditScore({ ...editScore, score: parseInt(e.target.value) || 0 })}
                           />
                           <Button size="sm" onClick={() => handleUpdateScore(s.id, editScore.score)} isLoading={isUpdating}>
                             <Save className="w-4 h-4" />
                           </Button>
                           <Button size="sm" variant="outline" onClick={() => setEditScore(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" className="h-10 w-10 p-0 text-gray-500 hover:text-white" onClick={() => setEditScore({ id: s.id, score: s.score })}>
                             <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-10 w-10 p-0 text-gray-500 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteScore(s.id)} isLoading={isUpdating}>
                             <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                   </div>
                </div>
              ))}

              {scores.length === 0 && (
                <div className="py-20 text-center text-gray-600 italic font-bold">No score history found for this golfer.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
